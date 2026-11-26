# ElasticSearch 入门

> 素材出处：`D:\pyhton\资料\ElasticSearch入门.md`（780 行；版本 Elasticsearch 8.5.0 + JDK17，演示客户端 Kibana）

## 1. 全文检索与倒排索引

- 正排索引：`文档 → 关键字`
- 倒排索引：`关键字 → 文档`

讲义拆成三步：

1. 按词条**分词**，并记录文档索引位置；
2. 词条相同的记录**去重合并**；
3. 对词条**排序**。

搜索时反过来：搜索词先分词 → 查倒排索引列表得到 docId → 按 docId 取文档数据。

> 全文检索原理（讲义原文）：`对每一个词建立一个索引，指明该词在文章中出现的次数和位置`。

## 2. 核心概念

| ES 概念 | 类比 MySQL | 说明 |
|---|---|---|
| Index（索引） | 表 | 一批相似特征文档的集合，名字必须全小写 |
| Type | 表 | 5.x 多 type，6.x 单 type，7.x/8.x 固定 `_doc` |
| Document（文档） | 一行记录 | 可被索引的基础单元，JSON 格式 |
| Field（字段） | 列 | 文档中的一个属性 |
| Mapping（映射） | 表结构 | 字段类型、默认值、分析器、是否索引 |
| DSL（JSON） | SQL | 查询语言 |

字段类型的关键区别：

- `text`：会分词，用于全文检索，**不能直接排序/聚合**；
- `keyword`：不分词，用于精确匹配、排序、聚合。

## 3. 分词器

讲义列出官方分词器：standard、Letter、Lowercase、Whitespace、UAX URL Email、Classic、Thai；中文需要第三方 IK。

```json
POST _analyze
{"analyzer": "standard", "text": "我是中国人"}

POST _analyze
{"analyzer": "ik_max_word", "text": "我们都是中国人"}

POST _analyze
{"analyzer": "ik_smart", "text": "我们都是中国人"}
```

- `standard`：默认分词器，中文按**单字**切分；
- `ik_max_word`：细粒度，词语级，尽量多切；
- `ik_smart`：粗粒度，词语级，尽量少切。

## 4. 索引与文档操作

```json
PUT /my_index
→ {"acknowledged": true, "shards_acknowledged": true, "index": "my_index"}

GET /_cat/indices
GET /_cat/indices?v
GET /my_index
DELETE /my_index
```

写入文档：

```json
PUT /my_index/_doc/1
{"title": "小米手机", "category": "手机", "images": "http://www.gulixueyuan.com/xm.jpg", "price": 3999}

POST /my_index/_doc/2
{"title": "华为电脑", "category": "电脑", "images": "http://www.gulixueyuan.com/xm.jpg", "price": 5000}
```

读取与删除：

```json
GET /my_index/_doc/1
GET /my_index/_search
DELETE /my_index/_doc/1
```

局部更新只能用 `POST`：

```json
POST /my_index/_update/1
{"doc": {"price": 4500}}
```

批量更新：

```json
PUT /_bulk
{ "update": { "_index": "my_index", "_id": "1" } }
{ "doc": { "price": 3899, "title": "小米手机3 升级版22" } }
{ "update": { "_index": "my_index", "_id": "2" } }
{ "doc": { "price": 2999, "title": "小米手机2222" } }
```

## 5. Mapping

```json
GET /my_index/_mapping

DELETE /my_index
PUT /my_index
{
  "mappings": {
    "properties": {
      "title": { "type": "text", "index": true, "analyzer": "ik_max_word", "search_analyzer": "ik_smart" },
      "category": { "type": "keyword", "index": true },
      "images": { "type": "keyword", "index": true },
      "price": { "type": "integer", "index": true }
    }
  }
}
```

要点：

- 字段类型一旦写入文档就难以修改，建索引前先设计 Mapping；
- 需要全文检索的字段用 `text` + IK；
- 需要精确匹配/排序/聚合的字段用 `keyword`；
- `index: false` 的字段不建索引，不能检索。

## 6. DSL 查询

准备数据后（讲义为 4 条华为/小米手机与电脑），依次练习：

```json
POST /my_index/_search
{"query": {"match_all": {}}}

{"query": {"match": {"title": "华为智能手机"}}}

{"query": {"multi_match": {"query": "华为智能手机", "fields": ["title","category"]}}}

{"query": {"term": {"title": {"value": "华为手机"}}}}

{"query": {"terms": {"title": ["华为", "小米"]}}}
```

布尔查询：

```json
{"query": {"bool": {"must": [
  {"match": {"title": "华为"}},
  {"match": {"category": "手机"}},
  {"range": {"price": {"gte":3000, "lte": 6000}}}
]}}}
```

- `must`：全部满足，参与打分；
- `should`：满足其一（OR）；
- `must_not`：都不满足（NOT）；
- `filter`：与 `must` 效果相同，但**不参与打分、效率更高**。

排序与分页：

```json
{"query": {"match": {"category": "手机"}}, "sort": [{"price": {"order": "asc"}}]}

{"from": 3, "size": 3}
```

`from = (pageNum - 1) * size`。

## 7. 与 MySQL 的差异

| 维度 | ElasticSearch | MySQL |
|---|---|---|
| 索引 | Index | 表 |
| 文档 | Document | 行 |
| 映射 | Mapping | 表结构 |
| 查询 | DSL(JSON) | SQL |
| 底层 | 倒排索引 | B+ 树 |
| 事务 | 不支持 | 支持 |
| 强项 | 搜索、日志、分析 | 事务型业务 |

讲义结论：ES 写入性能弱于关系型数据库，不适合当主库；适合做检索与分析。

## 8. 讲义未覆盖的内容

以下内容讲义没有给出示例，教材不臆造：

- 聚合 `aggs`（terms / range / date_histogram / 嵌套）；
- 分片与副本的创建参数、扩容、`_cluster/health`；
- 集群搭建、节点角色、`_cat/nodes`；
- `exists`、`prefix`、`wildcard`、`highlight`、`scroll`、`search_after`；
- `_update_by_query`、`_delete_by_query`、并发版本控制；
- alias、reindex、template、ILM；
- Java Client 代码（讲义只列了支持的语言）。

## 9. 练习与验收标准

### 练习 1：建一个中文商品索引

创建 `products` 索引，Mapping 含 `title(text + ik_max_word)`、`brand(keyword)`、`category(keyword)`、`price(integer)`、`description(text)`，写入至少 5 条商品。

**验收标准**

- `GET /products/_mapping` 能看到上述字段类型；
- 用 `_analyze` 验证 `title` 使用 `ik_max_word` 后中文按词切分；
- 写入后用 `match` 查询“华为手机”能命中相关商品；
- `term` 查询 `brand=华为` 能精确命中，且不受分词影响。

### 练习 2：布尔查询 + 排序 + 分页

查询“华为或小米的手机，价格 3000-6000，按价格升序，每页 2 条取第 2 页”。

**验收标准**

- `bool` 中正确组合 `should`（品牌）、`filter`（类目与价格区间）；
- 返回结果价格全部落在区间内，品牌只含华为/小米；
- `sort` 升序生效；
- `from=2, size=2` 返回的是第 3、4 条，且 `hits.total` 与预期一致。

### 练习 3：对比 text 与 keyword

对同一份数据，分别用 `match` 与 `term` 查询 `title`，再对 `category` 做一次 `term`，记录结果差异。

**验收标准**

- `match` 能命中分词后的部分词，`term` 对 `text` 字段通常只能命中完整词；
- 对 `keyword` 字段的 `term` 查询稳定精确；
- 能用自己的话解释“为什么排序/聚合要用 keyword”；
- 提交一份对比表：查询语句、命中条数、原因。
