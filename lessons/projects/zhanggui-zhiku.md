# 掌柜智库：企业知识库 RAG 全链路（20 章课件版）

> 本篇依据 2026-10-15 班完整课件重写，补齐旧版缺失的 **07 文档切片、08 主体识别、09 向量化、10 存入 Milvus、15 网络搜索、16 结果融合重排**，并修正旧版几处口径错误。
>
> 素材出处（本机文件）：
> - 讲义：`D:\AI1015尚硅谷课程\掌柜智库课件1015\掌柜智库课件1015\1.笔记\01～20【掌柜智库】*.md`
> - 扩展：`1.笔记\扩展知识\MinerU手册.md`
> - 代码：`2.资料\05-初始代码\`（config / processor / utils / web / tool 全套）
> - 流程图：`1.笔记\images\`（已复制到本站 `assets/lessons-projects/zhanggui-zhiku/`）
> - 镜像与演示：`2.资料\02-镜像\`、`5 其他\导入系统演示.mp4`、`检索系统演示.mp4`

掌柜智库面向产品手册、维修指南这类**垂直领域长文档**：导入侧把 PDF/Markdown 变成带商品名、图片、双向量的切片；查询侧先确认“问的是哪个产品”，再多路召回、融合、精排，最后流式输出答案。

![掌柜智库整体架构](assets/lessons-projects/zhanggui-zhiku/architecture.jpg)

## 1. 技术栈与部署

| 组件 | 选型 | 关键配置 |
|---|---|---|
| 编排 | LangGraph | 导入图、查询图各自独立 |
| 服务 | FastAPI + Uvicorn | 导入 8000、查询 8001 |
| 向量库 | Milvus 2.5.5 standalone | `19530`，Attu `7000` |
| 对象存储 | MinIO（社区版 `RELEASE.2024-12-18T13-15-44Z`） | API `9000`、控制台 `9001`，桶 `knowledge-base` |
| 会话历史 | MongoDB | `27017`，库 `kb001` |
| Embedding | BGE-M3 本地模型 | Dense 1024 维 + Sparse，`cuda:0`、`fp16` |
| Rerank | DashScope `qwen3-rerank` | 见 3.5 的口径修正 |
| LLM | `qwen-flash` / 视觉 `qwen3-vl-flash` | 兼容 OpenAI 接口，`temperature=0.1` |
| PDF 解析 | MinerU API v4 | 也支持本地模型，见 2.3 |

部署要点（02 章）：

- Milvus 用官方 `milvus-standalone-docker-compose.yml`，依赖 etcd 与 MinIO；**compose 内 MinIO 端口要改**，避免和业务 MinIO 的 9000/9001 冲突。
- 离线环境先导入镜像：`docker load -i milvus.tar`、`milvus-etcd.tar`、`milvus-minio.tar`、`attu.tar`；Mongo 单独 `docker run -d --name mongo --restart always -p 27017:27017 mongo`。
- 关键 `.env`：`MILVUS_URL=http://<ip>:19530`、`CHUNKS_COLLECTION=kb_chunks`、`ITEM_NAME_COLLECTION=kb_item_names`、`MINIO_BUCKET_NAME=knowledge-base`、`MINIO_IMG_DIR=upload-images`、`MONGO_DB_NAME=kb001`、`EMBEDDING_DIM=1024`。

> 口径修正：01/02 章写“OpenAI text-embedding-v4，1536 维”，但 05 初始代码与 09/13 章全部使用 BGE-M3 的 **1024 维**，`1536` 配置没有被代码引用。

---

## 2. 导入链路：从文件到可检索切片

### 2.1 七个节点与统一基类

```
node_entry ──[.pdf]──> node_pdf_to_md ─┐
      └──────[.md]──────────────────────┴─> node_md_img → node_document_split
          → node_item_name_recognition → node_bge_embedding → node_import_milvus → END
```

状态类 `ImportGraphState` 用 `total=False` 声明全部可选字段，核心字段：

```python
class ImportGraphState(TypedDict, total=False):
    task_id: str                     # 任务 ID，Web 端看节点日志
    is_md_read_enabled: bool
    is_pdf_read_enabled: bool
    import_file_path: str            # 导入文件路径
    file_dir: str                    # 导入(出)文件目录
    pdf_path: str
    md_path: str
    file_title: str                  # 文件标题（不含扩展名）
    item_name: str                   # 识别出的商品/产品名称
    md_content: str                  # Markdown 文档内容
    chunks: List                     # 文档切片列表
```

所有节点继承 `BaseNode`，`__call__` 统一做日志、异常包装，子类只实现 `process`：

```python
    def __call__(self, state: T) -> T:
        try:
            self.logger.info(f"--- {self.name} 开始 ---")
            result = self.process(state)
            self.logger.info(f"--- {self.name} 完成 ---")
            return result
        except Exception as e:
            self.logger.error(f"{self.name} 执行失败: {e}")
            raise ImportProcessError(
                message=str(e),
                node_name=self.name,
                cause=e
            )
```

![节点基类执行流程](assets/lessons-projects/zhanggui-zhiku/node-base.jpg)

### 2.2 入口节点

`node_entry` 只做三件事：校验路径、按后缀分流、把 `import_file_path` 归一化为 `pdf_path` / `md_path`，同时写入 `file_title`（`Path.stem`）。

```python
# 04 章：入口节点核心判断（示意，摘自讲义）
suffix = Path(import_file_path).suffix.lower()
if suffix == ".pdf":
    state["is_pdf_read_enabled"] = True
    state["pdf_path"] = import_file_path
elif suffix == ".md":
    state["is_md_read_enabled"] = True
    state["md_path"] = import_file_path
else:
    raise FileProcessingError(...)
```

> 已知缺口：05 章 PDF 节点强制读取 `state["file_dir"]`，但 04 入口节点从未写入该字段，图上也没有节点设置它；按课件顺序执行会在 PDF 节点抛 `StateFieldError`，落地时需在入口补 `file_dir`（通常取文件所在目录）。

### 2.3 PDF 转 Markdown：MinerU API v4

新版走 **MinerU 云端 API v4**，不是旧版教材写的本地子进程。流程五步：

1. 申请上传地址（`/file-urls/batch`）；
2. 上传 PDF 到返回的 URL；
3. 提交解析任务，拿到 `batch_id`；
4. 轮询任务状态；
5. 下载结果 zip，解压取 `full.md`，写回 `md_path` / `md_content`。

关键配置 `MINERU_BASE_URL=https://mineru.net/api/v4`。轮询要设最大次数与间隔，避免任务卡死。

如果要用本地模型，扩展手册给了完整步骤：

```bash
uv pip install -U "mineru[all]" -i https://mirrors.aliyun.com/pypi/simple
$env:MODELSCOPE_CACHE="D:\ai_models\modelscope_cache"
mineru-models-download          # 选择 modelscope + all
$env:MINERU_MODEL_SOURCE="local"
```

两种方式产出的 Markdown 结构一致，后续节点无需区分。

![PDF 转 Markdown 流程](assets/lessons-projects/zhanggui-zhiku/pdf-to-md.png)

### 2.4 MD 图片处理与 MinIO

`node_md_img` 做两件事：

1. 找出 Markdown 引用的本地图片（`.jpg/.jpeg/.png/.gif/.bmp/.webp`），调用视觉模型生成**中文摘要**，把摘要与上下文写回图片说明；
2. 上传 MinIO（按文档名建子目录隔离），把 Markdown 里的本地路径替换为可公网访问的 URL。

```python
# 06 章：上传失败降级为本地路径
try:
    minio_client.fput_object(minio_bucket, object_name, img.path)
    remote_url = f"{minio_base_url}/{minio_bucket}/{object_name}"
    remote_urls[img.name] = remote_url
except Exception:
    self.logger.warning(f"{img.name} 上传失败，保留本地路径")
    remote_urls[img.name] = img.path
```

视觉模型调用有**滑动窗口限流**：`max_requests=10`、`window_seconds=60`，避免批量导入时打爆 API。

![滑动窗口限流](assets/lessons-projects/zhanggui-zhiku/rate-limit.png)

### 2.5 文档切片（07，旧版缺失）

切片分三步：按标题粗切 → 对超长章节二次切 → 合并过短片段。核心难点是**代码围栏识别**，v2 用正则支持 3 个及以上反引号/波浪线，并要求“同字符同长度”才算闭合：

```python
        for line in lines:
            striped_line = line.strip()
            # 4.1 识别代码块边界 ```、~~~、````、~~~~ 等（至少 3 个连续字符）
            code_block_marker_match = re.match(r'^(`{3,}|~{3,})$', striped_line)
            if code_block_marker_match:
                marker = code_block_marker_match.group(1)
                if not in_code_block:
                    in_code_block = True
                    code_block_start_marker = marker
                elif in_code_block and striped_line == code_block_start_marker:
                    in_code_block = False
                    code_block_start_marker = None
                current_lines.append(line)
                continue

            # 4.2 识别标题（代码块内不识别）
            is_valid_title = (not in_code_block) and re.match(title_pattern, line)
            if is_valid_title:
                _flush_section()
                current_title = striped_line
                current_lines = [current_title]
                title_count += 1
            else:
                current_lines.append(line)
```

参数与产物：

| 项 | 取值 |
|---|---|
| 切片最大长度 | `max_content_length=2000` |
| 合并短片段阈值 | `min_content_length=500` |
| 句子级重叠 | `chunk_overlap=0`（配置里另有 `overlap_sentences=1`） |
| 分隔符 | `["\n\n","\n","。","！","？","；",".","!","?",";"," "]` |
| 切片字段 | `title`、`content`、`file_title`、`parent_title`、`part` |
| 兜底 | 无标题时 `title="无标题"` |
| 备份 | `D:/doc/<file_title>/chunks.json` |

![文档切片流程](assets/lessons-projects/zhanggui-zhiku/doc-split.png)

### 2.6 主体识别（08，旧版缺失）

目标：从文件名 + 前几个切片里识别**商品名/型号**，写到每个 chunk 的 `item_name`，并单独写一份商品名向量集合，供查询侧做产品确认。

```python
ITEM_NAME_SYSTEM_PROMPT = "你是一个专业的商品名称识别模型，请根据提供的信息，识别商品名称。"

ITEM_NAME_USER_PROMPT_TEMPLATE = """
请从以下信息中识别出商品名称与型号：
文件名：{file_title}

正文切片（用于辅助识别）：
{context}

要求：
1. 返回内容为字符串形式，最好是带品牌、型号和名称的完整商品名称。比如：苏伯尓5000W大功率电磁炉；
2. 返回结果应该只包含商品名称，不要添加任何解释或其他内容；
3. 如果无法识别商品名称,请返回空字符串。
"""
```

清洗与兜底：

```python
            response = llm.invoke(messages)
            item_name = response.content

            item_name = (item_name.replace(" ", "")
                         .replace("\n", "")
                         .replace("\t", "")
                         .replace("\r", ""))

            if not item_name:
                return file_title
            return item_name
```

- 取前 `item_name_chunk_k=3` 个切片，累计/截断到 `item_name_chunk_size=2500` 字符作为上下文；
- 识别结果同时写入 `state["item_name"]` 和每个 chunk 的 `item_name`；
- 该节点还会对商品名生成 Dense+Sparse，写入 `kb_item_names` 集合。**商品名与 chunks 是两条独立入库支线**，09/10 只负责 chunks。

![主体识别流程](assets/lessons-projects/zhanggui-zhiku/item-name.png)

### 2.7 向量化（09，旧版缺失）

BGE-M3 一次产出稠密 + 稀疏向量，按 `batch_size=5` 批处理；参与 embedding 的文本是“商品名 + 正文”，让同商品切片在向量空间更聚集：

```python
        for i in range(0, len(chunks), batch_size):
            batch_texts = chunks[i:i + batch_size]
            input_texts = []
            for doc in batch_texts:
                item_name = doc["item_name"]
                content = doc["content"]
                input_texts.append(f"{item_name}\n{content}" if item_name else content)

            docs_embeddings = generate_embeddings(input_texts)
            for j, doc in enumerate(batch_texts):
                item = doc.copy()
                item["dense_vector"] = docs_embeddings["dense"][j]
                item["sparse_vector"] = docs_embeddings["sparse"][j]
                output_data.append(item)
```

![向量化节点流程](assets/lessons-projects/zhanggui-zhiku/embedding.png)

### 2.8 存入 Milvus（10，旧版缺失）

`kb_chunks` 的 Schema 与索引：

| 字段 | 类型 | 说明 |
|---|---|---|
| `chunk_id` | INT64，自增 | 回填为字符串写回状态 |
| `content` | VARCHAR(65535) | 切片正文 |
| `title` / `parent_title` / `file_title` / `item_name` | VARCHAR(100) | 过滤与展示 |
| `part` | INT8 | 长章节分段号，缺省 0 |
| `dense_vector` | FLOAT_VECTOR(1024) | BGE-M3 稠密向量 |
| `sparse_vector` | SPARSE_FLOAT_VECTOR | BGE-M3 稀疏向量 |

```python
        index_params = milvus_client.prepare_index_params()
        index_params.add_index(
            field_name="dense_vector",
            index_name="dense_vector_index",
            index_type="AUTOINDEX",
            metric_type="COSINE"
        )
        index_params.add_index(
            field_name="sparse_vector",
            index_name="sparse_inverted_index",
            index_type="SPARSE_INVERTED_INDEX",
            metric_type="IP",
            params={"inverted_index_algo": "DAAT_MAXSCORE", "normalize": True, "quantization": "none"}
        )
```

重导入按 `file_title` **先删后插**（不是 upsert），删除前必须转义：

```python
    def _clear_chunks_by_file_title(self, client, file_title):
        try:
            file_title = escape_milvus_string(file_title)
            client.delete(
                collection_name=milvus_config.chunks_collection,
                filter=f"file_title=='{file_title}'")
        except Exception as e:
            self.logger.error(f"Milvus 数据删除失败: {str(e)}")
            raise MilvusError(f"Milvus 数据删除失败: {str(e)}")
```

插入后把自增主键回填到 chunk，供查询侧做 RRF 去重与 Rerank 引用。

![保存 Milvus 节点流程](assets/lessons-projects/zhanggui-zhiku/milvus-save.png)

---

## 3. 查询链路：确认 → 三路召回 → RRF → Rerank → 答案

![产品确认节点流程](assets/lessons-projects/zhanggui-zhiku/product-confirm.png)

### 3.1 查询状态

```python
class QueryGraphState(TypedDict):
    session_id: str
    message_id: str
    original_query: str

    embedding_chunks: list          # 普通向量检索
    hyde_embedding_chunks: list     # HyDE 检索
    web_search_docs: list           # 网络搜索

    rrf_chunks: list                # RRF 融合后
    reranked_docs: list             # 重排后 Top-K

    prompt: str
    answer: str
    item_names: List[str]
    rewritten_query: str
    history: list
    is_stream: bool
```

### 3.2 产品确认（12）

1. 从 MongoDB 读最近 **10 条**历史（`/history` 接口默认 50，两处口径不同）；
2. LLM 输出 JSON，提取商品名并做指代消歧，得到 `rewritten_query`；
3. 对每个商品名在 `kb_item_names` 做混合检索（`limit=5`、权重 `(0.8, 0.2)`、`norm_score=True`）；
4. 按分数分流：`>0.85` 确认；`0.6～0.85` 作为候选；`<0.6` 丢弃。确认失败或存在歧义时，直接生成澄清 `answer`，跳过检索进入答案输出。

> 代码与正文有出入：正文写“0.6 以上取最高前 5 个候选”，代码是 `mid[:3]`；正文的规则 a/b 被“所有 >0.85 全部确认”替代。

### 3.3 三路召回

**① 向量检索（13）**：查询与切片都用 BGE-M3 双向量，过滤 `item_name in {item_names}`；ANN 请求 `limit=10`，`hybrid_search` 默认最终 `limit=5`，权重 `(0.8, 0.2)`，未开 `norm_score`。

![向量搜索流程](assets/lessons-projects/zhanggui-zhiku/vector-search.png)

**② HyDE 检索（14）**：先让 LLM 写一段不超过 300 字的“假设答案”，再用 `rewritten_query + " " + hyde_doc` 生成向量检索，写独立字段：

```python
        hybrid_search_requests = create_hybrid_search_requests(
            dense_vector=embedding_result['dense'][0],
            sparse_vector=embedding_result['sparse'][0],
            expr=item_name_filtered_expr
        )
        reps = execute_hybrid_search_query(
            milvus_client,
            collection_name=self.config.chunks_collection,
            search_requests=hybrid_search_requests,
            norm_score=True,
            output_fields=["chunk_id", "content", "item_name", 'title']
        )
        if not reps or not reps[0]:
            return state
        return {"hyde_embedding_chunks": reps[0]}
```

![假设性文档生成流程](assets/lessons-projects/zhanggui-zhiku/hyde.png)

**③ 网络搜索（15，旧版缺失）**：通过 MCP 调用百炼 `bailian_web_search`，超时 10 秒、最多重试 3 次，取 5 条结果：

```python
        search_mcp = MCPServerStreamableHttp(
            name="search_mcp",
            params={
                "url": mcp_config.mcp_base_url,
                "headers": {"Authorization": f"Bearer {mcp_config.api_key}"},
                "timeout": 10,
            },
            cache_tools_list=True,
            max_retry_attempts=3,
        )
        try:
            await search_mcp.connect()
            result = await search_mcp.call_tool(
                tool_name="bailian_web_search",
                arguments={"query": query, "count": 5},
            )
            return result
        finally:
            await search_mcp.cleanup()
```

返回结构解析 `result.content[0].text` 里的 `pages`，丢弃空 `snippet`。

![MCP 节点流程](assets/lessons-projects/zhanggui-zhiku/web-search-mcp.png)

### 3.4 RRF 融合（16，旧版缺失）

RRF 只看排名不看分数：`score(d) = Σ weight / (k + rank)`，`k=60`。**代码只融合向量与 HyDE 两路**，Web 结果不参与 RRF，留到 Rerank 前合并：

```python
        chunk_scores = {}
        chunk_data = {}

        for rrf_input, weight in rrf_inputs:
            for rank, doc in enumerate(rrf_input, start=1):
                chunk_id = doc.get('chunk_id')
                chunk_scores[chunk_id] = chunk_scores.get(chunk_id, 0.0) + weight / (k + rank)
                chunk_data.setdefault(chunk_id, doc)

        unsorted_results = [(chunk_data[cid], score) for cid, score in chunk_scores.items()]
        sorted_results = sorted(unsorted_results, key=lambda x: x[1], reverse=True)
        return sorted_results[:max_results] if max_results else sorted_results
```

- 权重为 `[(vec, 1.0), (hyde, 1.0)]`；
- `max_results=None` 表示不截断（正文“保留若干”与代码不一致）；
- 课件多处把 RRF 写成 “RFF”，以代码为准。

![RRF 融合排序流程](assets/lessons-projects/zhanggui-zhiku/rrf.png)

### 3.5 Rerank：合并 Web + 断崖截断（17）

Rerank 前先把本地 RRF 结果与网络结果合并为统一格式 `{content, title, chunk_id, url, source}`，`source` 标 `local` / `web`；然后调用 DashScope `qwen3-rerank`，`top_n=len(documents)`，按分数降序，再做断崖截断：

```python
        upper_bound = min(RERANK_MAX_TOPK, len(ranked_docs))
        lower_bound = min(RERANK_MIN_TOPK, upper_bound)
        cutoff_pos = upper_bound

        for idx in range(lower_bound - 1, upper_bound - 1):
            current_score = ranked_docs[idx].get("score")
            next_score = ranked_docs[idx + 1].get("score")

            if current_score is None or next_score is None:
                continue

            abs_gap = current_score - next_score
            rel_gap = abs_gap / (abs(current_score) + 1e-6)

            if abs_gap >= RERANK_GAP_ABS or rel_gap >= RERANK_GAP_RATIO:
                cutoff_pos = idx + 1
                break

        return ranked_docs[:cutoff_pos]
```

参数：`max_topk=10`、`min_topk=3`、`gap_abs=0.5`、`gap_ratio=0.25`。

> 口径修正：01/02 章写“本地 BGE-Reranker-Large”，17 章实际调用 DashScope `qwen3-rerank`（`TEXT_RERANK_INSTRUCT=针对给定的查询，检索能够解答该查询的相关段落`），未看到本地 reranker 代码。

![重排序流程](assets/lessons-projects/zhanggui-zhiku/rerank.png)

### 3.6 答案输出（20）

- 若产品确认阶段已有 `answer`（澄清/拒绝），直接输出；
- 否则按“文档 → 历史”顺序分配上下文预算，`MAX_CONTEXT_CHARS=12000`；
- 从 Markdown 图片与 Web 结果 `url` 提取 `image_urls`，随答案返回；
- 写 MongoDB 历史；流式模式逐 delta 推送，最后推 `{answer, status:"completed", image_urls}`。

---

## 4. Web 层与前端

- 查询接口：`POST /query` 提交任务，`GET /stream/{session_id}` 订阅 SSE；非流式直接同步取 `answer`；
- 导入接口：上传文件后后台跑导入图，前端通过任务日志看每个节点进度；
- 静态页：`web/page/chat.html`、`import.html`，挂在 `/front`；
- SSE 事件至少包含 `delta`、`FINAL`，前端按类型追加文本或结束。

---

## 5. 配置速查

| 配置 | 取值 |
|---|---|
| Milvus | `MILVUS_URL=http://<ip>:19530`；`CHUNKS_COLLECTION=kb_chunks`；`ITEM_NAME_COLLECTION=kb_item_names` |
| MinIO | `MINIO_ENDPOINT=<ip>:9000`；`MINIO_BUCKET_NAME=knowledge-base`；`MINIO_IMG_DIR=upload-images` |
| Mongo | `mongodb://<ip>:27017`；`MONGO_DB_NAME=kb001` |
| Embedding | `BGE_M3_PATH`、`BGE_DEVICE=cuda:0`、`BGE_FP16=True` |
| 切片 | `max_content_length=2000`、`min_content_length=500`、`item_name_chunk_k=3`、`item_name_chunk_size=2500` |
| 入库 | `embedding_batch_size=8`（配置）/ `batch_size=5`（09 章代码） |
| 检索 | ANN `limit=10`、hybrid 最终 `5`、权重 `(0.8,0.2)`、`norm_score=False` |
| RRF | `k=60`、两路、`max_results=None` |
| Rerank | `max_topk=10`、`min_topk=3`、`gap_abs=0.5`、`gap_ratio=0.25` |
| 答案 | `MAX_CONTEXT_CHARS=12000` |

---

## 6. 课件口径与踩坑

| # | 现象 | 以哪边为准 |
|---|---|---|
| 1 | 01/02 写 OpenAI embedding 1536 维，代码用 BGE-M3 1024 维 | 代码 |
| 2 | 01/02 写本地 BGE-Reranker，17 用 `qwen3-rerank` | 17 章代码 |
| 3 | 04 入口不写 `file_dir`，05 PDF 节点强制读取 | 需在入口补字段 |
| 4 | 08 仍保留“向量化+入库”旧步骤，09/10 又独立成节点 | 两条支线：商品名 / chunks |
| 5 | 10 文档写按 `item_name` 清理，代码按 `file_title` | 代码 |
| 6 | 07 备份路径用 `"D:/doc" / file_title`（字符串除法） | 运行必报错，需 `Path` 拼接 |
| 7 | 13 注释说 0.8/0.2 各占 50%；请求 10 条但底层截 5 条 | 代码 |
| 8 | 13/14 过滤表达式 `item_name in {item_names}` 依赖 list repr，未转义 | 生产需显式加引号并转义 |
| 9 | 16 正文讲“三路 RRF”，代码只融合两路 | 代码 |
| 10 | 17 异常兜底 `return [{**list, "score": None}]` 会抛 `TypeError` | 需改成列表包裹 |
| 11 | 15 的 `.env` 写 SSE、正文写 MCP、代码用 Streamable HTTP | 代码 |
| 12 | 12 正文“取前 5 候选”，代码 `mid[:3]` | 代码 |

---

## 7. 练习与验收标准

### 练习 1：跑通 MinerU API v4 的“上传→解析→下载”

只写一个独立脚本：申请上传地址、上传 PDF、提交任务、轮询状态、解压 zip 取 `full.md`。

**验收标准**

- 五步都有日志，且每步失败能指出阶段；
- 轮询有最大次数与间隔，超时抛明确异常；
- 下载的 zip 解压后能找到 `full.md`，内容非空；
- 重复执行同一 PDF 不会覆盖已有输出目录（按文件名建子目录）。

### 练习 2：切片器的代码围栏识别

实现 `split_by_heading`，要求支持 3 个及以上反引号/波浪线，且“同字符同长度”才闭合。

**验收标准**

- 输入含 ```` ``` ````、```` ```` ````、`~~~` 三种围栏，代码块内的 `# 标题` 不产生切片；
- 围栏长度不匹配（3 个开、4 个闭）时不会误闭合；
- 超长章节会二次切分，短片段会合并，输出每片带 `title`、`parent_title`、`part`；
- 打印切片总数与每片前 30 字，人工核对无拦腰截断。

### 练习 3：主体识别 + 商品名支线入库

从 `chunks.json` 取前 3 片、截断 2500 字，调用 LLM 识别商品名，清洗后写回每个 chunk，并把商品名写入 `kb_item_names`。

**验收标准**

- 识别为空时回退为 `file_title`；
- 每个 chunk 的 `item_name` 完全一致；
- `kb_item_names` 中同一 `file_title` 重复导入不会产生重复记录（按 `item_name` 先删后插）；
- 用商品名做一次混合检索，能返回对应 `file_title`，相似度落在 0.85/0.6 两档内。

### 练习 4：两路 RRF 与“Web 不参与”的验证

构造两份带 `chunk_id` 的检索结果（向量、HyDE），实现 RRF，`k=60`、权重各 1.0。

**验收标准**

- 手算任一 chunk 的 RRF 分数与程序输出一致（保留 6 位小数）；
- 只出现在一路的 chunk 也能进入结果，但排名低于两路都出现的 chunk；
- 把 Web 结果加入输入后，程序仍只输出两路融合结果（Web 在 Rerank 前才合并）；
- `max_results=None` 时返回全部去重结果。

### 练习 5：断崖截断的可解释输出

对一组降序分数实现断崖检测：`min_topk=3`、`max_topk=10`、`gap_abs=0.5`、`gap_ratio=0.25`，任一条件满足即截断。

**验收标准**

- 输出每个相邻 gap 的绝对值与相对值，以及最终 `cutoff_pos`；
- 构造“前 3 条分数接近、第 4 条骤降”的数据，截断位置为 3；
- 构造平缓分数，截断位置为 10（上限）；
- 分数含 `None` 时跳过该对，不抛异常。

### 练习 6：Milvus 幂等重导入

对同一 `file_title` 连续导入两次，验证不会出现重复切片。

**验收标准**

- 第二次导入前按 `file_title` 删除成功，删除数量与首次插入数量一致；
- 两次导入后 `kb_chunks` 中该文件记录数不翻倍；
- `file_title` 含单引号、反斜杠时，删除表达式不报错（`escape_milvus_string` 生效）；
- 打印每次插入的 `chunk_id` 范围，能对应到切片。

---

## 8. 与旧版教材的差异

| 旧版写法 | 本版修正 |
|---|---|
| MinerU 以子进程调用 | API v4 五步流程；本地模型作为可选方案 |
| 07-10、15-16 代码缺失，只写职责 | 已补齐切片、主体识别、向量化、Milvus 入库、网络搜索、RRF 全部代码 |
| Rerank 用 bge-reranker-large | 实际为 DashScope `qwen3-rerank` |
| RRF 融合三路 | 只融合向量 + HyDE 两路，Web 在 Rerank 前合并 |
| 商品名识别只写“未给实现” | 提供完整 prompt、清洗与双支线入库 |
| “切片向量化+入库是后置节点” | 商品名与 chunks 是两条独立入库支线 |
