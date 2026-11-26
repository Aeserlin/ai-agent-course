# 掌柜智库：企业知识库 RAG 全链路

> 素材出处（本机文件，均取不带 `(1)` 的版本）：
> - `D:\pyhton\资料\03_掌柜智库项目（导入处理）骨架代码.md`
> - `D:\pyhton\资料\04_掌柜智库项目（导入处理）入口节点与PDF转Markdown节点.md`
> - `D:\pyhton\资料\05_掌柜智库项目（导入处理）图片处理与MinIO上传节点.md`
> - `D:\pyhton\资料\06_掌柜智库项目（导入处理）文档切分节点.md`
> - `D:\pyhton\资料\10_掌柜智库项目（查询处理）骨架代码.md`
> - `D:\pyhton\资料\12_掌柜智库项目（查询处理）向量检索节点.md`
> - `D:\pyhton\资料\13_掌柜智库项目（查询处理）HyDE检索节点.md`
> - `D:\pyhton\资料\16_掌柜智库项目（查询处理）Rerank重排序节点.md`
> - `D:\pyhton\资料\17_掌柜智库项目（查询处理）答案生成节点.md`
> - `D:\pyhton\资料\18_掌柜智库项目（导入、查询处理) Web层与前端对接.md`
> - `D:\pyhton\资料\19_掌柜智库项目总结指南.md`

本篇把「文档导入」和「查询回答」两条链路拆开讲：导入负责把 PDF/Markdown 变成带向量、可过滤的知识切片；查询负责多路召回、融合、精排，最后流式输出答案。

## 1. 项目定位与技术栈

掌柜智库是一个企业知识库问答系统，分两个独立服务：

| 服务 | 端口 | 职责 |
|---|---|---|
| 导入服务 | 8000 | 接收 PDF/Markdown，转 Markdown、处理图片、切分、向量化、入库 |
| 查询服务 | 8001 | 商品名确认、三路检索、RRF 融合、Rerank、答案生成、SSE 推送 |

核心中间件与组件：

- **Milvus**：向量库，集合存 `dense_vector`（1024 维）、`sparse_vector`、`chunk_id`、`content`、`item_name`、`title`
- **MinIO**：图片/附件对象存储，桶名示例 `knowledge-base`
- **MongoDB**：会话历史
- **BGE-M3**：同时产出稠密向量与稀疏向量；**bge-reranker-large**：精排
- **MinerU**：PDF 转 Markdown（命令行子进程）
- **LangGraph**：导入图与查询图的编排；**FastAPI + SSE**：接口与流式输出

> 口径提醒：本套讲义全篇使用 **Milvus**，没有 Qdrant / Elasticsearch / MySQL；19 章总结里出现的 `marker-pdf` 是旧口径，04 章代码实际调用的是 `mineru`。

## 2. 导入图：从文件到可检索切片

### 2.1 图结构与状态

导入图是单路径顺序执行，只有入口处按扩展名分流：

```
entry_node ──[.pdf]──> pdf_to_md_node ─┐
      └──────[.md]──────────────────────┴─> md_img_node → document_split_node
          → item_name_rec_node → bge_embedding_node → import_milvus_node → END
```

状态类定义在 `state.py`，使用 `total=False` 让所有字段可选，适配不同文件类型：

```python
class ImportGraphState(TypedDict, total=False):
    """
    导入流程图状态
    使用 total=False 表示所有字段都是可选的。
    """
    # ==================== 任务标识 ====================
    task_id: str                    # 任务 ID，用于任务追踪

    # ==================== 控制标志 ====================
    is_md_read_enabled: bool        # 是否启用 MD 读取
    is_pdf_read_enabled: bool       # 是否启用 PDF 读取
```

条件边把入口节点的判断结果映射到具体节点：

```python
    graph_pipeline.add_conditional_edges(
        "entry_node",
        import_router,
        {
            "md_img_node": "md_img_node",
            "pdf_to_md_node": "pdf_to_md_node",
            END: END
        }
    )
```

### 2.2 入口节点

`entry_node` 只做三件事：校验路径、取后缀、把 `import_file_path` 归一化成 `pdf_path` / `md_path`。实现要点：

- 只取 `suffix.lower()` 判断，避免 `.PDF` 漏判；
- 空路径直接抛 `ValidationError`，没有后缀抛异常；
- 同时写入 `file_title`、`file_dir`，供后续节点拼输出目录。

### 2.3 PDF 转 Markdown：调用 MinerU

MinerU 以**子进程**方式调用，输出固定落在 `文件目录/文件名/hybrid_auto/文件名.md`：

```python
        # 1. 构建命令行
        cmd = [
            "mineru",
            "-p",
            str(import_file_path),
            "-o",
            str(file_dir_path),
            "--source",
            "local"
        ]

        process_start_time = time.time()

        # 2. 执行命令行(子进程执行命令行)
        proc = subprocess.Popen(
            args=cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            errors="replace",       # 遇到乱码时替换
            text=True,              # 输出的内容是字符串 不是字节
            encoding="utf-8",       # 用指定的中文字符集进行编解码
            bufsize=1               # 按行缓冲，只要缓冲区一行满了就输出
        )
```

工程要点：

- `errors="replace"` + `encoding="utf-8"`，避免 PDF 中乱码字节直接打断转换；
- `bufsize=1` 配合逐行读取，可把进度写进日志或 SSE；
- 转换完成后必须校验目标 md 是否存在，再更新 `md_path`。

### 2.4 图片处理与 MinIO 上传

`md_img_node` 做两件事：用视觉模型（VLM）为图片生成摘要，替换 Markdown 中的图片说明；把图片上传 MinIO，失败时保留本地路径降级。

```python
            try:
                minio_client.fput_object(
                    minio_bucket, object_name, img.path
                )
                remote_url = (
                    f"{minio_base_url}/{minio_bucket}/{object_name}"
                )
                self.logger.info(f"{img.name} 上传成功")
                remote_urls[img.name] = remote_url
            except Exception:
                self.logger.warning(
                    f"{img.name} 上传失败，保留本地路径"
                )
                remote_urls[img.name] = img.path
```

要点：

- 图片目录不存在时直接跳过，不阻断导入；
- VLM 失败、MinIO 失败是两层独立降级；
- 图片摘要会拼接 200 字上下文（就近优先），让图片语义也能被检索到。

### 2.5 文档切分：标题识别 + 代码围栏状态机

`document_split_node` 不是简单按长度切，而是先按 Markdown 标题建层级，再对超长段落二次切分，最后合并过短片段。

```python
        for content_line in content_lines:
            # 判断是否存在代码块围栏
            if content_line.strip().startswith("```") or content_line.strip().startswith("~~~"):
                in_fence = not in_fence

            match = heading_re.match(content_line) if not in_fence else None

            if match:
                _flush()

                level = len(match.group(1))  # 当前标题的级别
                current_level = level
                current_title = content_line
                hierarchy[level] = current_title

                # 清空下级标题
                for i in range(level + 1, 7):
                    hierarchy[i] = ""
```

要点：

- 代码块里的 `#` 不能当标题，必须用围栏状态机屏蔽；
- 先把 `\r\n` 统一成 `\n`，否则标题正则和切分长度都会偏；
- 表格需要 `MarkdownTableLinearizer` 线性化，否则切片会把一行表格拦腰截断；
- 每个 chunk 记录 `title`、`item_name` 等元数据，供查询时过滤。

### 2.6 后置节点（讲义未给实现）

`item_name_rec_node`（商品名识别）、`bge_embedding_node`（切片向量化）、`import_milvus_node`（写入 Milvus）在 19 章目录里列出，但本批资料没有给出实现代码。教材只讲职责，不臆造实现：

| 节点 | 职责 | 输出 |
|---|---|---|
| item_name_rec_node | 从切片中识别商品名，写入 `item_name` 元数据 | chunk 增加 `item_name` |
| bge_embedding_node | 用 BGE-M3 生成 dense + sparse 向量 | 向量字段写回 chunk |
| import_milvus_node | 批量 upsert 到 Milvus 集合 | 可检索数据 |

## 3. 查询图：多路召回 + 融合 + 精排

### 3.1 图结构

```
item_name_confirm ──[answer 为空]──> multi_search ──> 并行三路
        │                                              ├─ search_embedding
        │                                              ├─ search_embedding_hyde
        │                                              └─ web_search_mcp
        └──[answer 非空]──> answer_output               ↓
                                             join → rrf → rerank → answer_output → END
```

- `multi_search`、`join` 都是虚节点（`lambda x: x` / `lambda x: {}`），只用来表达 fan-out / fan-in；
- `item_name_confirm` 命中高置信度商品名时可直接产出澄清答案并短路检索；
- 三条检索边各写独立状态字段，任何一路失败都 `return state`，不影响其他路。

### 3.2 向量检索

向量检索节点做“查询改写 → 混合检索 → 写状态”三步，核心是 Milvus 的 hybrid search：

```python
        try:
            # 6. 创建混合请求
            hybrid_search_request = create_hybrid_search_requests(dense_vector=embed_query['dense'][0],
 sparse_vector=embed_query['sparse'][0],expr=filter_expr,
 filter_expr_params=filter_expr_param)

            # 7. 执行混合搜索请求
            hybrid_search_reps = execute_hybrid_search_query(milvus_client=milvus_client,
collection_name=self.config.chunks_collection,
search_requests=hybrid_search_request,output_fields=['chunk_id', 'content', 'item_name','title'])

            # 8. 获取搜索结果
            if not hybrid_search_reps or not hybrid_search_reps[0]:
                return state

            # 9. 更新state
            state['embedding_chunks'] = hybrid_search_reps[0]
```

参数口径（讲义配置）：`EMBEDDING_SEARCH_LIMIT=10`，稠密/稀疏用 `WeightedRanker(0.5, 0.5, norm_score=True)`，集合名取 `CHUNKS_COLLECTION`。

### 3.3 HyDE 检索

HyDE（Hypothetical Document Embeddings）先让 LLM 生成一段“假想答案”，再用假想答案去检索。对知识库问答，它能显著提升短问题、口语化问题的召回。

```python
        # 6. 创建混合搜索请求
        hybrid_search_requests = create_hybrid_search_requests(
            dense_vector=embedding_result['dense'][0],
            sparse_vector=embedding_result['sparse'][0],
            expr=item_name_filtered_expr
        )

        # 7. 执行混合搜索请求
        reps = execute_hybrid_search_query(
            milvus_client,
            collection_name=self.config.chunks_collection,
            search_requests=hybrid_search_requests,
            norm_score=True,
            output_fields=["chunk_id", "content", "item_name",'title']
        )

        if not reps or not reps[0]:
            return state

        # 8. 只更新 hyde_embedding_chunks
        return {"hyde_embedding_chunks": reps[0]}
```

注意：这里只写 `hyde_embedding_chunks`，不要覆盖普通检索的 `embedding_chunks`，否则两路召回会互相踩。

### 3.4 RRF 融合

RRF（Reciprocal Rank Fusion）按“排名”而不是“分数”融合多路结果，公式：

```
score(d) = Σ 1 / (k + rank_i(d))        # k 取 60
```

讲义配置 `RRF_K=60`、`RRF_MAX_RESULTS=10`。RRF 依赖统一的 `chunk_id` 做投票，所以网页搜索结果不能直接参与 RRF，只能进入后续 Rerank。**RRF 的具体实现代码本批讲义未给出**（14 章缺失）。

### 3.5 Rerank：断崖检测动态截断

Rerank 用 bge-reranker-large 重新打分，再按“分数断崖”决定保留几条，而不是固定 TopK：

```python
        for i in range(0, upper_bound - 1):
            current_score = reranked_docs[i].get("score")
            next_score = reranked_docs[i + 1].get("score")

            if current_score is None or next_score is None:
                continue

            # 分数差值
            gap = current_score - next_score

            if gap >= self.config.rerank_gap_abs and gap > max_gap:
                max_gap = gap
                cut_off = i + 1
                self.logger.info(f"位置{cut_off}发生断崖，gap={gap:.4f}")
        # 兜底：不管断崖在哪，至少保留lower_bound个
        cut_off = max(cut_off, lower_bound)
        return reranked_docs[:cut_off] #左闭开区间：包含起始位置，不包含结束位置
```

配置口径：`RERANK_MAX_TOP_K=10`、`RERANK_MIN_TOP_K=3`、`RERANK_GAP_RATIO=0.25`。讲义里 `RERANK_GAP_ABS` 有 0.5 与 0.15 两种写法，落地前以项目配置为准。

### 3.6 答案生成与 SSE

```python
        task_id = state.get("task_id")
        is_stream = state.get("is_stream")

        # 1. 已有答案 → 直接返回
        if state.get("answer"):
            self._push_existing_answer(state)

        # 2. 构建提示词 → 调用 LLM 生成答案
        else:
            prompt = self._build_prompt(state)
            state["prompt"] = prompt
            self._generate_answer(state, prompt)

        # 3. 写入历史记录
        self._write_history(state)

        # 4. 流式模式发送结束事件
        if is_stream:
            push_sse_event(task_id, SSEEvent.FINAL,
                           {"answer": state.get("answer", "")})
        return state
```

提示词预算按“文档 → 历史”顺序分配，`MAX_CONTEXT_CHARS=12000`；流式模式逐 chunk 推 delta，结束推 final。

## 4. Web 层：流式与非流式双模式

```python
    @app.post("/query")
    async def query(
        request: QueryRequest,
        background_tasks: BackgroundTasks,
        service: QueryService = Depends(get_query_service),
    ):
        # 1. 解析参数
        session_id = request.session_id or service.generate_session_id()
        task_id = service.generate_task_id()

        # 2. 提交任务
        service.submit_query(task_id, request.is_stream)

        # 3. 根据模式选择处理方式
        if request.is_stream:
            # 流式模式：后台任务 + SSE
            background_tasks.add_task(
                service.run_query_graph, task_id, session_id, request.query, True
            )
            return StreamSubmitResponse(
                message="Query submitted", session_id=session_id, task_id=task_id
            )
        else:
            # 非流式模式：同步执行
            service.run_query_graph(task_id, session_id, request.query, False)
            answer = service.get_answer(task_id)
            return QueryResponse(message="处理完成", session_id=session_id, answer=answer)
```

前端静态页挂在 `/front`、`/chat.html`、`/import.html`；SSE 事件类型至少包含 `delta`、`FINAL`，前端按事件类型追加文本或结束。

## 5. 运行与配置

| 配置 | 取值（讲义示例） |
|---|---|
| Milvus | `MILVUS_URL`，端口 19530 |
| MinIO | `MINIO_ENDPOINT`（示例 `192.168.6.150:9000`）、`MINIO_BUCKET_NAME=knowledge-base` |
| MongoDB | 27017，存会话历史 |
| 向量 | BGE-M3，dense 1024 维 + sparse；BGE-Reranker-large |
| 切分 | `max_content_length` 2000/500、`min_content_length` 500/100、`overlap_sentences=1` |
| 检索 | `EMBEDDING_SEARCH_LIMIT=10`、`HYDE_SEARCH_LIMIT=5`、`RRF_K=60`、`RERANK_MAX_TOP_K=10` |

## 6. 讲义口径提醒

1. 章节源码缺失：07 商品名识别、08 切片向量化、09 向量入库、11 商品名确认、14 RRF、15 网络搜索的实现未给出，教材不补写“看起来像”的代码；
2. 目录名混用：`import_process` / `import_processor`、`query_process` / `query_processor`；
3. 配置默认值前后不一致（切分长度、`rerank_gap_abs`），以项目实际配置为准；
4. PDF 工具口头说 `marker-pdf`，代码实际是 `mineru`；
5. 少量命名笔误：`_cliff_catoff` / `_cliff_cutoff`、`return break`。

## 7. 练习与验收标准

### 练习 1：跑通「Markdown → 切片」最小链路

只实现 `document_split_node` 的标题切分部分，输入一篇带多级标题和代码块的 Markdown，输出切片列表（每片包含 `title`、`content`、`item_name` 占位）。

**验收标准**

- 代码块里的 `# 注释` 不会被识别成标题；
- 每个切片都带最近一级标题路径（如 `一级标题 > 二级标题`）；
- 长度小于 `min_content_length` 的片段会被合并到相邻片段，不单独成片；
- 打印切片数量与每片前 30 字，可人工核对没有拦腰截断代码块。

### 练习 2：为查询图加一路「HyDE 检索」

在已有向量检索基础上增加 `hyde_search_node`：先用 LLM 生成假想答案，再走同一套混合检索，结果写入 `hyde_embedding_chunks`。

**验收标准**

- `embedding_chunks` 与 `hyde_embedding_chunks` 两个字段互不覆盖；
- HyDE 节点失败时 `return state`，主检索结果仍然可用；
- 对同一个口语化问题，分别只开普通检索、只开 HyDE，打印两路 Top3 的 `chunk_id`，能说明差异；
- RRF 融合后结果数量不超过 `RRF_MAX_RESULTS`。

### 练习 3：Rerank 断崖截断的可解释输出

实现断崖检测，并打印每个候选的分数与相邻差值，最后输出保留条数与截断位置。

**验收标准**

- 至少保留 `RERANK_MIN_TOP_K` 条，最多不超过 `RERANK_MAX_TOP_K`；
- 断崖位置与 `rerank_gap_abs` 阈值一致，日志能复现计算过程；
- 构造一份分数平缓的候选列表时，不会误截断到最小值以下；
- 对同一批候选，关闭断崖（固定 TopK）与开启断崖的结果条数可对比。
