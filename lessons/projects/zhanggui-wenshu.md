# 掌柜问数：NL2SQL 数据问答

> 素材出处：
> - `D:\pyhton\资料\尚硅谷大模型项目之掌柜问数.md`（6387 行；下文行号均指该文件）
> - `D:\pyhton\资料\001_init_customer_service.sql`、`D:\pyhton\资料\002_init_commerce.sql`（注意：这两个脚本属于“电商小二”项目，不是本项目的建表脚本，讲义也未给出本项目 DDL）

## 1. 项目定位

掌柜问数是面向数据仓库的“对话式取数”：用户用自然语言提问，系统召回相关表/字段/指标/取值，生成 SQL，校验后执行，把结果表格流式返回前端。

本质是 **数据库场景的 RAG（Text2SQL）**，讲义把它概括为“索引 + 检索”两段：

- 离线：建元数据知识库（结构化元数据 + 向量索引 + 全文索引）；
- 在线：召回 → 剪枝 → 生成 SQL → 校验 → 执行。

| 组件 | 技术 | 存什么 | 作用 |
|---|---|---|---|
| dw 数仓 | MySQL（模拟 Hive） | `fact_order` 事实表 + `dim_region/customer/product/date` 维度表 | 星型模型，真正被查询的数据 |
| meta 元数据库 | MySQL `meta` 库 | `table_info`、`column_info`、`metric_info`、`column_metric` | 表/字段/指标的结构化元数据 |
| 向量索引 | Qdrant + BGE-large-zh-v1.5（1024 维，COSINE） | 字段集合、指标集合 | 字段与指标的语义召回 |
| 全文索引 | Elasticsearch（ik_max_word） | `data-agent-value_index` | 字段取值（地区、品牌、品类）的关键词召回 |
| 问数智能体 | LangGraph | State/Context + 12 节点 | 编排召回、过滤、生成、校验、执行 |

## 2. 元数据知识库怎么建

### 2.1 配置加载

```python
@dataclass
class QdrantConfig:
    host: str; port: int; embedding_size: int

@dataclass
class AppConfig:
    logging: LoggingConfig; db_meta: DBConfig; db_dw: DBConfig
    qdrant: QdrantConfig; embedding: EmbeddingConfig; es: ESConfig; llm: LLMConfig

_yaml_data = OmegaConf.load(Path(__file__).parents[2] / "conf" / "app_config.yaml")
app_config: AppConfig = OmegaConf.to_object(OmegaConf.merge(AppConfig, _yaml_data))
```

`conf/app_config.yaml` 关键项：MySQL 3306、Qdrant 6333（`embedding_size: 1024`）、Embedding 服务 8081（`BAAI/bge-large-zh-v1.5`）、ES 9200、LLM `deepseek-chat`。

### 2.2 构建入口

```python
async def start_build():
    # embedding / es / dw / meta / qdrant 五个 client_manager.init()
    try:
        async with (dw_mysql_client_manager.session_factory() as dw_session,
                    meta_mysql_client_manager.session_factory() as meta_session):
            service = MetaKnowledgeService(
                dw_mysql_repo=DWMysqlRepository(dw_session),
                meta_myql_repo=MetaMysqlRepository(meta_session),
                value_es_repo=ValueESRepository(es_client_manager.client),
                column_qdrant_repo=ColumnQdrantRepository(qdrant_client_manager.client),
                metric_qdrant_repo=MetricQdrantRepository(qdrant_client_manager.client),
                embedding_client=embedding_client_manager.client)
            await service.build(meta_config)
            await dw_session.commit(); await meta_session.commit()
    except Exception:
        await dw_session.rollback(); await meta_session.rollback(); raise
```

### 2.3 一个字段 → 多条向量

这是“同义词召回”的关键：字段名、描述、每个别名各生成一条向量，payload 存字段全量信息。

```python
data_dict_list = [{"id": uuid.uuid4(), "embedding_text": t, "payload": c}
                  for c in column_infos for t in [c.name, c.description, *c.alias]]
vectors = []; texts = [d["embedding_text"] for d in data_dict_list]
for i in range(0, len(texts), 32):                        # 每批 32 条
    vectors.extend(await self.embedding_client.aembed_documents(texts[i:i+32]))
await self.column_qdrant_repo.upsert_column_vectors(
    vectors, [d["payload"] for d in data_dict_list], [d["id"] for d in data_dict_list])
```

于是“销售额 / 订单金额 / 收入”任一说法都能召回 `order_amount` 这类字段。

指标同理：`metric_info` 存名称、口径描述、`relevant_columns`、别名，再为指标单独建向量集合。

## 3. 在线检索：三路召回

### 3.1 向量召回（Qdrant）

```python
async def search(self, vector, score_threshold=0.6) -> list[ColumnInfoQdrant]:
    result = await self.client.query_points(collection_name=self.collection_name,
                                            query=vector, score_threshold=score_threshold)
    return [ColumnInfoQdrant(**p.payload) for p in result.points]
```

召回节点先做关键词扩展：`load_prompt("extend_keywords_for_column_recall") | llm | JsonOutputParser()` 让 LLM 补同义词，再与 jieba TF-IDF 关键词合并，逐词向量化检索，最后按 `id` 去重。

### 3.2 取值召回（Elasticsearch）

```python
index_name = "data-agent-value_index"
mappings = {"dynamic": False, "properties": {
    "value": {"type": "text", "analyzer": "ik_max_word", "search_analyzer": "ik_max_word"},
    "id": {"type": "keyword"}, "type": {"type": "keyword"}, "column_id": {"type": "keyword"},
    "column_name": {"type": "keyword"}, "table_id": {"type": "keyword"}, "table_name": {"type": "keyword"}}}

async def search(self, keyword: str) -> list[ValueInfoES]:
    result = await self.client.search(index=self.index_name, query={"match": {"value": keyword}})
    return [ValueInfoES(**item["_source"]) for item in result["hits"]["hits"]]
```

取值不走向量：地区、品牌、品类这类值是精确词，用 `ik_max_word` 全文匹配更稳。

## 4. 合并与剪枝

三路召回结果先合并：以字段为主键，补指标依赖列、补取值所属列（命中的真实值追加进 `examples`），再按 `table_id` 分组补主外键，保证 JOIN 键齐全。

```python
for metric in recall_metrics:
    for column_id in metric["relevant_columns"]:
        if column_id not in column_infos_dict:
            column_infos_dict[column_id] = _convert_column_info_mysql_to_qdrant(
                await meta_mysql_repo.get_colun_info_by_id(column_id))
for recall_value in recall_values:
    if recall_value["value"] not in column_infos_dict[recall_value["column_id"]]["examples"]:
        column_infos_dict[recall_value["column_id"]]["examples"].append(recall_value["value"])
```

然后 `filter_metric` 与 `filter_table` 两路并行，由 LLM 剪枝：

```python
result = await chain.ainvoke({"query": query,
    "table_infos": yaml.dump(table_infos, allow_unicode=True, sort_keys=False)})
for table_info in table_infos[:]:
    if table_info["name"] not in result: table_infos.remove(table_info)
    else:
        for column in table_info["columns"][:]:
            if column["name"] not in result[table_info["name"]]: table_info["columns"].remove(column)
```

剪枝后的 schema 越干净，模型写错表名/字段名的概率越低。

## 5. 生成、校验、执行 SQL

```python
# generate_sql：五类上下文全部 yaml.dump 后进 prompt，输出纯文本 SQL
chain = PromptTemplate(template=load_prompt("generate_sql"),
    input_variables=["query", "table_infos", "metric_infos", "date_info", "db_info"]) | llm | StrOutputParser()
sql = await chain.ainvoke({"query": query,
    "table_infos": yaml.dump(table_infos, allow_unicode=True, sort_keys=False),
    "metric_infos": yaml.dump(metric_infos, allow_unicode=True, sort_keys=False),
    "date_info": yaml.dump(date_info, allow_unicode=True, sort_keys=False),
    "db_info": yaml.dump(db_info, allow_unicode=True, sort_keys=False)})

# validate：EXPLAIN 只解析不执行，能查出表名/字段名/JOIN 语法错误
async def validate_sql(self, sql):
    await self.session.execute(text(f"explain {sql}"))
```

校验失败时 `correct_sql` 把原 SQL、数据库原始报错和全部上下文再喂给模型重写一次；成功则执行：

```python
return [dict(row) for row in (await self.session.execute(text(sql))).mappings().all()]
```

`rowMapping` 不能直接 JSON 序列化，必须先转 `dict`，再通过 `runtime.stream_writer({"result": result})` 推给前端。

## 6. LangGraph 编排

```python
state_graph = StateGraph(state_schema=DataAgentState, context_schema=DataAgentContext)

state_graph.add_edge(START, "extract_keywords")
# 三路 fan-out：extract_keywords → recall_column / recall_metric / recall_value
# 三路 fan-in ：recall_column / recall_metric / recall_value → merge_retrieved_info
state_graph.add_edge("merge_retrieved_info", "filter_metric")
state_graph.add_edge("merge_retrieved_info", "filter_table")
state_graph.add_edge("filter_metric", "add_extra_context")
state_graph.add_edge("filter_table", "add_extra_context")
state_graph.add_edge("add_extra_context", "generate_sql")
state_graph.add_edge("generate_sql", "validate_sql")
state_graph.add_conditional_edges("validate_sql",
    lambda s: "execute_sql" if s["error"] is None else "correct_sql",
    {"correct_sql": "correct_sql", "execute_sql": "execute_sql"})
state_graph.add_edge("correct_sql", "execute_sql")
state_graph.add_edge("execute_sql", END)
graph = state_graph.compile()
```

`add_extra_context` 负责注入当前日期、季度、数据库版本与方言，解决“去年”“本季度”和方言差异。

## 7. FastAPI + SSE + 前端三态

```python
async for chunk in compiled_graph.astream(input=state, context=context, stream_mode="custom"):
    yield f"data: {json.dumps(chunk, ensure_ascii=False, default=str)} \n\n"

@query_router.post("/api/query")
async def search(query_schema: QuerySchema, service: QueryService = Depends(get_query_service)):
    return StreamingResponse(service.search(query_schema.query), media_type="text/event-stream")
```

前端按三种形态解析同一路 SSE：

```javascript
if (data.stage) {                        // 进度：上一步置 success，追加 running
  const last = steps.at(-1); if (last && last.status === "running") last.status = "success";
  steps.push({ text: data.stage, status: "running" });
} else if (data.error) {                 // 错误：步骤标红 + 错误消息
  const last = steps.at(-1); if (last) last.status = "error";
  messages.value.push({ role: "assistant", type: "error", content: data.error });
} else if (Array.isArray(data.result)) { // 结果：首行 key 作表头渲染表格
  const last = steps.at(-1); if (last) last.status = "success";
  messages.value.push({ role: "assistant", type: "table",
    columns: Object.keys(data.result[0] || {}), rows: data.result });
}
```

`lifespan` 负责启动/关闭 5 个 client manager；HTTP 中间件用 `ContextVar` 写 `request_id`，贯穿全链路日志。

## 8. NL2SQL 的难点与本题解法

| 难点 | 现象 | 解法 |
|---|---|---|
| Schema 召回不准 | 用户说“销售额”，库里叫 `order_amount` | 字段名/描述/别名各建一条向量；LLM 扩同义词；阈值 0.6 + 去重；`filter_table` 二次剪枝 |
| 指标口径不一致 | GMV、AOV 算法不统一 | `metric_info` 存口径、`relevant_columns`、别名；指标单独建向量；生成时同时给字段与口径 |
| 多表 JOIN 写不对 | 漏 JOIN 键 | 星型模型 + `role` 标注；merge 按表分组**强制补主外键** |
| SQL 幻觉/语法错 | 表名、字段名编造 | `EXPLAIN` 零成本校验；失败把原始报错回灌重写；`temperature=0` |
| 取值对不上 | “华北” vs “华北区” | 维度取值进 ES；召回后把真实值追加进 `examples`，约束 WHERE |
| 时间口径 | “去年”“本季度” | `add_extra_context` 注入当前日期、季度、版本与方言 |

## 9. 运行与依赖

```bash
# 1. 中间件（MySQL 3306 / Qdrant 6333 / ES 9200 + Kibana / TEI 8081）
cd docker && docker compose up -d

# 2. 构建元数据知识库
python -m app.scripts.build_meta_knowledge

# 3. 启动后端
python main.py          # http://127.0.0.1:8000/docs

# 4. 启动前端
npm install && npm run dev   # 5173，Node 22
```

依赖（uv）：`asyncmy cryptography "elasticsearch[async]>=8,<9" fastapi[standard] huggingface-hub jieba langchain langchain-deepseek langchain-huggingface langgraph loguru omegaconf qdrant-client sqlalchemy`。

## 10. 风险与讲义缺口

1. 图在 `execute_sql → END` 结束，**没有结果总结节点**，表格直接回前端；若要做自然语言总结，属于扩展点；
2. 7 个提示词（关键词扩写 ×3、filter_table、filter_metric、generate_sql、correct_sql）讲义明确“不再展示”，是 SQL 质量核心，教材不臆造正文；
3. `docker-compose.yaml` 未给出，只有端口约定；
4. meta 四表、dw 五表没有 DDL，只有 ORM 模型；
5. **安全边界**：生成的 SQL 直接执行，只有 EXPLAIN 校验；没有 SELECT-only 白名单、行数上限、超时、权限隔离，生产环境必须补；
6. 构建非幂等：集合/索引“存在先删再建”，meta 表直接 `add_all`，重跑会清空或主键冲突；
7. 讲义内部不一致：Context 键名两套、`recall_metric/recall_metrics` 混用、`graph/compiled_graph` 混用、ES 索引名 yaml 与代码不一致；
8. 随附的两个 SQL 脚本属于电商小二项目，不能当本项目建表脚本。

## 11. 练习与验收标准

### 练习 1：为字段建“多向量”索引

给 `column_info` 生成三类文本（名称、描述、每个别名），批量向量化后写入 Qdrant，payload 存字段全量。

**验收标准**

- 一个字段至少产生 2 条以上向量（名称 + 描述），有别名时每条别名各一条；
- 批量大小 32，向量维度与集合配置一致（1024）；
- 用“销售额”“订单金额”“收入”三个词分别检索，Top3 中都能出现同一字段；
- 重复构建不会产生重复点（按 id 去重或先清理）。

### 练习 2：EXPLAIN 校验 + 一次纠错

实现 `validate_sql` 与 `correct_sql`：先 EXPLAIN，失败则把错误回灌重写一次，再执行。

**验收标准**

- 合法 SQL 的 `error` 为 `None`，直接进入执行节点；
- 故意写错表名时，`error` 含数据库原始报错，`correct_sql` 被调用一次；
- 纠错后仍失败时不无限重试（只重写一次），把错误推给前端；
- 执行结果转成 `list[dict]` 后才推 SSE，前端能渲染出表头与行。

### 练习 3：给查询加安全护栏

在 `execute_sql` 前增加：只允许 `SELECT`、禁止多语句、限制返回行数、设置执行超时。

**验收标准**

- 非 SELECT 语句被拒绝并返回明确错误；
- 含 `;` 的多语句被拒绝；
- 超过行数上限时截断并提示“已限制返回 N 行”；
- 超时抛出的异常被捕获，SSE 返回 error 而不是断开连接。
