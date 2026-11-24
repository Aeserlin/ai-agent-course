## 阶段导读

前面几个阶段，你做的多是单智能体，或者“规划—执行—评审”这种短链路。这一阶段不一样：你要交付四个真实企业系统，它们的共同特点是**任务会跑几十分钟甚至几天、要接多个数据源、出错必须能续跑、结论必须能被人追责**。

难点因此从“怎么调模型”整体迁移到工程侧，主要是三件事。第一是**任务怎么分派**：一个舆情事件进来，该先采集还是先查历史？谁来判断该找哪个专家？第二是**状态怎么持久**：任务跑到第 7 步进程被重启，前面的分析不能白做。第三是**失败怎么恢复**：采集接口超时、模型返回脏 JSON、视频生成失败，每一种都要有明确的降级和重试路径，而不是抛个异常就结束。

除此之外，这一阶段反复训练四种能力：多源数据的清洗与去重、结构化结论的输出（带证据链）、流式过程推送（让用户看见系统在想什么）、可审计的报告生成（每个结论能指回原始数据）。这四项能力，正是企业愿意为 AI 工程师付钱的地方。

学完这个阶段，你应该能独立画出复杂系统的状态图，给每个节点定义输入输出和幂等策略，用 Checkpoint 做断点恢复，用 SSE 把执行过程推给前端，并产出一份带引用、可复核的分析报告。

最容易踩的五个坑：**一上来堆 Agent**，五个角色互相等待，比一个 Agent 还慢；**把长任务写在 HTTP 请求里**，用户等 30 秒就超时；**把所有全文塞进状态**，存档几百 MB；**没有幂等设计**，重试一次就重复扣一次钱；**报告没有证据**，业务方问“这个结论哪来的”就答不上来。

<div class="callout plain"><span class="tag">大白话</span>
<p>这一阶段像<b>从开小饭馆升级到做中央厨房</b>。</p>
<p>小饭馆一个厨师全包，出问题喊一嗓子就行；中央厨房要分采购、切配、烹饪、打包、配送，任何一环断了，整条线都得停。</p>
<p>所以你要做的不是“多雇几个厨师”，而是<b>排班表、交接单、冷藏库、应急预案</b>——对应到代码里，就是编排、状态、持久化、重试。</p>
</div>

## 教学路径

<div class="callout path"><span class="tag">教学路径</span><ol class="path-steps">
<li><b>第 1 步（2 天）：</b>工程骨架。统一目录、配置、日志、异常与状态定义，产出可运行的空壳项目和《接口与状态约定》文档。</li>
<li><b>第 2 步（3 天）：</b>舆情项目的数据层。多源采集 worker、Redis 队列、指纹去重、失败计数与死信队列，产出可稳定跑 30 分钟不重复的采集服务。</li>
<li><b>第 3 步（3 天）：</b>情感研判。本地 BERT 分类 + 大模型兜底的融合策略，产出情感标注结果与置信度分布。</li>
<li><b>第 4 步（3 天）：</b>并行分析与专家讨论。主题聚类、热度计算、四角色讨论加裁决，产出带证据的分析结论 JSON。</li>
<li><b>第 5 步（2 天）：</b>预警与呈现。多级阈值、报告模板、大盘指标与 SSE 推送，产出一个能演示的舆情大盘。</li>
<li><b>第 6 步（3 天）：</b>市场罗盘。SOP 转 JSON 编排、双模态推理引擎、三条工具链（搜索 / NL2SQL / 代码解释器）打通。</li>
<li><b>第 7 步（2 天）：</b>过程可视化。定义 SSE 事件协议，前端逐事件渲染思考过程，产出可回放的分析过程。</li>
<li><b>第 8 步（3 天）：</b>工程调研助手。LangGraph StateGraph 五节点、Git 浅克隆与文件白名单、AST 结构分析。</li>
<li><b>第 9 步（2 天）：</b>断点恢复与可审计。PostgresSaver、thread_id、人工确认、报告证据链，产出可中断续跑的调研任务。</li>
<li><b>第 10 步（3 天）：</b>电商运营助手。商品主数据整合、多模态素材生成、异步任务队列与优先级调度。</li>
<li><b>第 11 步（2 天）：</b>可靠性收尾。失败重试与死信、Alembic 版本迁移、数据备份与回滚演练。</li>
<li><b>第 12 步（2 天）：</b>考试六与项目答辩。按评分表逐项演示，重点讲清状态设计与失败处理。</li>
</ol></div>

## 学习前准备

### 前置知识

| 能力 | 最低要求 | 不达标会怎样 |
|-|-|-|
| Python 异步 | 会用 `async/await`、`asyncio.gather`、`to_thread` | 并行节点写成串行，采集慢十倍 |
| LangGraph | 会定义 State、Node、Conditional Edge，会编译 | 看不懂状态图，改不动流程 |
| FastAPI | 会写路由、依赖注入、`StreamingResponse` | 做不出 SSE 推送 |
| SQL | 会 JOIN、窗口函数、`FILTER`、`EXPLAIN` | 商品数据整合写不出来 |
| Redis | 会用 List 做队列、Set 做去重、Hash 做计数 | 采集去重和失败计数无从下手 |
| Docker | 会写 `docker-compose.yml` 起 Postgres / Redis | 环境反复出问题，浪费大量时间 |
| 提示词 | 会写结构化输出约束、要求引用证据 | 模型输出无法入库 |

### 环境与软件清单

| 软件 / 库 | 版本建议 | 用途 |
|-|-|-|
| Python | 3.11+ | 主语言，异步性能更稳 |
| Docker Desktop | 最新稳定版 | 起 Postgres、Redis、可选 Milvus |
| PostgreSQL | 16 | LangGraph Checkpoint、业务库 |
| Redis | 7 | 采集队列、去重、缓存 |
| langgraph | 0.2.x 以上 | 状态图与 Checkpoint |
| langgraph-checkpoint-postgres | 与 langgraph 匹配 | 持久化存档 |
| fastapi / uvicorn | 最新 | HTTP 与 SSE |
| httpx | 最新 | 异步采集 |
| transformers / torch | CPU 版即可 | 本地情感模型 |
| sqlalchemy / alembic | 2.x / 1.13+ | ORM 与迁移 |
| arq 或 celery | arq 0.26+ | 异步任务队列 |
| Postman 或 curl | 最新 | 调试 SSE 与接口 |

### 三道自测题

| 题目 | 参考答案要点 |
|-|-|
| 1. 采集任务失败后重试，怎么保证同一条数据不会入库两次？ | 用内容指纹（标题+作者+发布时间做哈希）配合 Redis `SADD` 的返回值判断首次出现；入库层再加唯一索引兜底。重试只重跑失败的分片。 |
| 2. LangGraph 的 Checkpoint 存内存和存数据库，对业务有什么差别？ | 内存版进程重启即丢，只能演示；数据库版可跨进程、可多实例、可人工中断后恢复，是生产必须。代价是状态必须可序列化，不能塞连接对象。 |
| 3. 为什么长任务不能直接放在 HTTP 请求里同步执行？ | 网关和浏览器都有超时（常见 30–60 秒），视频生成、全量分析动辄几分钟；同步执行还会占满 worker。正确做法是提交任务返回 job_id，再用 SSE 或轮询拿进度。 |

<div class="callout tip"><span class="tag">老师建议</span>
<p>先把 Postgres 和 Redis 用 Docker 起好，连接串写进 <code>.env</code>。这一阶段 80% 的“玄学问题”都是环境不一致导致的，别在这上面省时间。</p>
</div>

## 模块精讲

### 模块1：项目五：舆情分析（多智能体 + Harness）

#### 解决什么问题

品牌方每天要盯微博、新闻、投诉平台、论坛、短视频评论，人工看不过来，也看不出趋势。系统要解决四件事：**把多源数据稳定收进来**、**判断每条内容的情感与风险**、**从海量内容里提炼正在发酵的话题**、**达到阈值时按级别预警并出报告**。

#### 核心概念

| 概念 | 含义 | 在本项目里的落点 |
|-|-|-|
| 分布式多源采集 | 多个 worker 从队列取任务并行抓取 | 4 个 worker 共享 Redis 队列 |
| 指纹去重 | 用内容特征哈希判断是否重复 | 标题+作者+发布时间做 MD5 |
| 情感研判 | 判断文本对品牌的正负倾向 | BERT 小模型先筛，大模型兜底 |
| 多模块并行分析 | 互不依赖的分析同时跑 | 聚类、热度、情感三路 `gather` |
| 模拟专家讨论 | 多角色从不同立场发言再裁决 | 品牌 / 公关 / 法务 / 数据四角色 |
| 热度追踪 | 用时间窗口衡量讨论量变化 | 6 小时窗口 + 环比增速 |
| 多级风险预警 | 按综合指标分蓝黄橙红 | 热度与负面占比双指标 |
| 报告与大盘 | 结构化输出与可视化 | 报告 JSON + 指标接口 |

情感研判为什么要“小模型 + 大模型”两级？因为成本。BERT 单条几毫秒、几乎免费，但看不懂反讽和行业黑话；大模型懂，但每条都调一次，十万条数据的账单很难看。让小模型先打分，置信度高于 0.85 直接采纳，低于阈值才送给大模型复核，成本能压到纯大模型方案的十分之一。

热度不能只看条数。一条被十个媒体转载的新闻，热度高于一百条无人回复的抱怨，所以公式要加媒体权重；同时用环比增速捕捉“正在爆发”，因为绝对值高但已平稳的话题，运营价值远低于刚起量的。

预警阈值必须双指标。只看热度，会把一次正面营销误报成危机；只看负面占比，会在样本只有 5 条时乱报警。因此要求样本量、热度、负面占比同时满足，才升级颜色。

#### 关键实现

采集 worker 用 Redis List 做队列，失败三次进死信，避免坏任务反复占用 worker。

```python
# collector/worker.py
import asyncio, hashlib, json, os
from datetime import datetime
import httpx
import redis.asyncio as redis

QUEUE, SEEN, RAW, DEAD = "crawl:tasks", "crawl:seen", "crawl:raw", "crawl:dead"

def fingerprint(item: dict) -> str:
    """标题 + 作者 + 发布时间生成指纹，跨源识别同一条内容"""
    raw = f"{item['title']}|{item['author']}|{item['published_at']}"
    return hashlib.md5(raw.encode("utf-8")).hexdigest()

async def fetch_source(client: httpx.AsyncClient, task: dict) -> list[dict]:
    """按任务配置拉一个数据源，统一成 item 结构（简化实现：真实源需各自解析）"""
    resp = await client.get(task["url"], params=task.get("params", {}), timeout=10)
    resp.raise_for_status()                        # 4xx/5xx 直接抛，交给外层重试
    return resp.json().get("items", [])

async def worker(r: redis.Redis, name: str):
    headers = {"User-Agent": "brand-monitor/1.0 (+contact@example.com)"}
    async with httpx.AsyncClient(headers=headers) as client:
        while True:
            _, payload = await r.brpop(QUEUE)      # 阻塞等待，避免空转烧 CPU
            task = json.loads(payload)
            try:
                items = await fetch_source(client, task)
            except Exception as e:
                fails = await r.hincrby("crawl:fail", task["url"], 1)
                await r.lpush(QUEUE if fails < 3 else DEAD, payload)   # 三次后进死信
                print(f"[{name}] 失败 {task['url']}: {e}")
                continue
            for item in items:
                fp = fingerprint(item)
                if await r.sadd(SEEN, fp) == 1:    # 返回 1 表示首次出现，0 为重复
                    item.update(fingerprint=fp, collected_at=datetime.now().isoformat())
                    await r.lpush(RAW, json.dumps(item, ensure_ascii=False))

async def main():
    r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), decode_responses=True)
    # 4 个 worker 并行消费同一队列，天然实现分布式采集
    await asyncio.gather(*[worker(r, f"w{i}") for i in range(4)])

if __name__ == "__main__":
    asyncio.run(main())
```

情感融合：先本地小模型，再按置信度决定是否升级到大模型。

```python
# analysis/sentiment.py
import json
from openai import OpenAI
from transformers import pipeline

client = OpenAI()
clf = pipeline("text-classification", model="uer/roberta-base-finetuned-jd-binary-chinese")
LABELS = {"positive": "正向", "negative": "负向"}

def bert_sentiment(text: str) -> dict:
    """本地小模型：毫秒级，给出标签与置信度"""
    out = clf(text[:500])[0]                        # 截断，防止超长文本拖慢推理
    return {"label": LABELS.get(out["label"].lower(), out["label"]), "score": round(float(out["score"]), 3)}

def llm_sentiment(text: str) -> dict:
    """大模型兜底：能识别反讽与行业黑话，强制 JSON 输出"""
    prompt = f"""判断下面文本对品牌的情感，只输出 JSON：
{{"label": "正向|中性|负向", "reason": "不超过30字", "risk": "低|中|高"}}
文本：{text}"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}, temperature=0,   # 结构化输出省去正则容错
    )
    return json.loads(resp.choices[0].message.content)

def fuse(text: str) -> dict:
    """高置信度直接用 BERT，低置信度才花钱调大模型"""
    b = bert_sentiment(text)
    if b["score"] >= 0.85:
        return {**b, "source": "bert"}
    l = llm_sentiment(text)
    return {"label": l["label"], "score": b["score"], "risk": l["risk"], "reason": l["reason"], "source": "bert+llm"}
```

并行分析、热度与预警，以及专家讨论加裁决：

```python
# analysis/pipeline.py
import asyncio
from datetime import datetime, timedelta
from analysis.sentiment import fuse

async def topic_cluster(items: list[dict]) -> list[dict]:
    """主题聚类（简化实现：按关键词分组，真实项目用 BERTopic 或向量聚类）"""
    groups: dict[str, list[dict]] = {}
    for it in items:
        groups.setdefault(it.get("keyword", "其他"), []).append(it)
    return [{"topic": k, "count": len(v), "samples": v[:3]} for k, v in groups.items()]

async def heat_score(items: list[dict], window_hours: int = 6) -> dict:
    """热度 = 讨论量 + 环比增速 + 媒体权重，用相邻两个窗口比较"""
    now = datetime.now()
    age = lambda i: now - datetime.fromisoformat(i["collected_at"])
    recent = [i for i in items if age(i) <= timedelta(hours=window_hours)]
    prev = [i for i in items if timedelta(hours=window_hours) < age(i) <= timedelta(hours=window_hours * 2)]
    growth = (len(recent) - len(prev)) / max(len(prev), 1)      # 分母兜底，避免除零
    weight = sum(i.get("source_weight", 1) for i in recent) / max(len(recent), 1)
    return {"recent": len(recent), "growth": round(growth, 2), "heat": round(len(recent) * 0.5 + growth * 30 + weight * 10, 1)}

def risk_level(heat: float, negative_ratio: float, sample_size: int) -> str:
    """多级预警：样本太少不下结论，避免 5 条数据就报红"""
    if sample_size < 20:
        return "样本不足"
    if heat > 80 and negative_ratio > 0.4:
        return "红色"
    if heat > 60 or negative_ratio > 0.3:
        return "橙色"
    if heat > 40 or negative_ratio > 0.2:
        return "黄色"
    return "蓝色"

async def run_analysis(items: list[dict]) -> dict:
    # 三路并行；情感调用放线程池，避免阻塞事件循环
    topics, heat, sentiments = await asyncio.gather(
        topic_cluster(items), heat_score(items),
        asyncio.to_thread(lambda: [fuse(i["content"]) for i in items[:50]]),
    )
    neg = sum(1 for s in sentiments if s["label"] == "负向") / max(len(sentiments), 1)
    return {"topics": topics, "heat": heat, "negative_ratio": round(neg, 2),
            "alert": risk_level(heat["heat"], neg, len(items))}

# analysis/expert_panel.py
from openai import OpenAI
client = OpenAI()
EXPERTS = {
    "品牌": "关注品牌声誉与用户信任，给出对外沟通口径",
    "公关": "关注传播路径与媒体应对，判断是否会被放大",
    "法务": "关注合规与法律责任，指出不能说的话",
    "数据": "关注样本量与统计显著性，指出结论置信度",
}

def discuss(topic: str, evidence: str, rounds: int = 2) -> tuple[list[dict], str]:
    transcript: list[dict] = []
    for _ in range(rounds):
        for role, instruction in EXPERTS.items():          # 每轮四个角色依次发言
            prev = "\n".join(f"[{t['role']}] {t['content']}" for t in transcript[-8:])
            resp = client.chat.completions.create(
                model="gpt-4o-mini", temperature=0.3,
                messages=[{"role": "system", "content": f"你是{topic}事件的{role}专家。{instruction}。80字内，必须引用一条证据。"},
                          {"role": "user", "content": f"已有讨论：\n{prev}\n\n证据：\n{evidence}"}])
            transcript.append({"round": _ + 1, "role": role, "content": resp.choices[0].message.content})
    # 裁决与发言分开，避免“自己给自己打分”
    verdict = client.chat.completions.create(
        model="gpt-4o-mini", temperature=0, response_format={"type": "json_object"},
        messages=[{"role": "system", "content": '你是分析负责人，输出 JSON：{"conclusion":"","risk":"低|中|高","actions":["..."]}'},
                  {"role": "user", "content": "\n".join(f"[{t['role']}] {t['content']}" for t in transcript)}],
    ).choices[0].message.content
    return transcript, verdict
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `brpop(QUEUE)` | 阻塞式取任务 | 队列空时不空转，节省 CPU 与连接 |
| `sadd(...) == 1` | 原子去重 | 多 worker 并发也不会重复入库，比先查再写安全 |
| `hincrby("crawl:fail", url, 1)` | 按 URL 计失败次数 | 3 次进死信，避免坏任务无限重试 |
| `score >= 0.85` | 成本分流 | 把大模型调用量压到十分之一左右 |
| `asyncio.gather` | 并行三路分析 | 总耗时取决于最慢一路，而非三者相加 |
| 讨论与裁决分开调用 | 职责分离 | 避免模型在发言时提前下结论、影响其他角色 |
| `sample_size < 20` | 小样本保护 | 防止低频话题误触发红色预警 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>只按品牌名关键词采集</b>：会漏掉缩写、谐音、事件名。要用同义词表 + 话题 ID 双路采集。</li>
<li><b>情感模型跨领域直接用</b>：电商评论训练的模型放到医疗、金融会失准。先抽样 200 条人工标注，算出准确率再上线。</li>
<li><b>并行任务不处理单路异常</b>：一路失败会让 <code>gather</code> 整体抛出，另外两路结果也丢。要加 <code>return_exceptions=True</code>。</li>
<li><b>专家讨论不设轮数上限</b>：四角色两轮够用，无限讨论只会烧钱并跑题。</li>
<li><b>报告口径不统一</b>：昨天按“条数”算热度，今天按“去重后条数”，趋势图就对不上。口径要写进配置并固定。</li>
<li><b>采集频率无视站点规则</b>：高频抓取容易被封，也有合规风险。设 QPS 上限、遵守 robots、优先用官方 API。</li>
</ul>
</div>

### 模块2：项目五：市场罗盘

#### 解决什么问题

业务方问的是“下个季度华东区要不要加投”，这背后要三步：查行业趋势（非结构化情报）、查自家经营数据（结构化指标）、把两者放一起推理出结论。难点在于**不同问题要走的分析路线不一样**，而且**过程必须能给人看**，否则一个“增长 12%”的结论没人敢用。

#### 核心概念

| 概念 | 含义 | 落地方式 |
|-|-|-|
| SOP 动态任务编排 | 把分析标准流程写成可执行配置，运行时按条件增删节点 | JSON 描述步骤与跳转，执行器逐节点跑 |
| 双模态推理引擎 | 结构化数据 + 非结构化文本两路证据一起推理 | 指标来自 NL2SQL，情报来自联网搜索 |
| 快慢双引擎 | 确定性计算走规则，开放问题走大模型 | 指标计算用代码，结论归纳用 LLM |
| 联网搜索 | 获取研报、新闻、政策等外部信息 | 查询改写 + 来源可信度 + 强制引用 |
| NL2SQL | 自然语言转 SQL 查业务库 | Schema 注入 + 只读账号 + 三道校验 |
| 代码解释器 | 让模型写代码做统计与画图 | 独立进程沙箱、无网络、限时 |
| SSE 可视化 | 把思考与工具调用逐条推给前端 | 事件协议 + EventSource |

为什么必须“动态”编排？因为市场分析不是固定流水线。问“竞品最近在做什么”，根本不需要查 SQL；问“我们上季度投放 ROI”，就必须先查库再算。把 SOP 写死成代码，每来一个新问题就要改代码；写成配置，运营自己就能调整路线。

双模态的“双”不是指两个模型，而是**两类证据**。只靠搜索，结论是“行业都在增长”，太空；只靠 SQL，结论是“我们降了 3%”，不知道为什么。两类证据交叉验证，报告才站得住。

#### 关键实现

第一步，把 SOP 写成 JSON。每个节点都有 `next`，条件节点有两条出边。

```json
{
  "sop_id": "market-compass-v1",
  "steps": [
    {"id": "clarify", "type": "llm", "prompt": "把问题改写成 3 个可检索子问题，并判断是否需要查库", "next": "collect"},
    {"id": "collect", "type": "parallel", "tools": ["web_search", "nl2sql"], "next": "gate"},
    {"id": "gate", "type": "condition", "expr": "data_quality >= 0.6", "on_true": "analyze", "on_false": "collect"},
    {"id": "analyze", "type": "code", "handler": "compute_metrics", "next": "report"},
    {"id": "report", "type": "llm", "prompt": "输出结论、依据、风险与建议，每条结论必须带 citation", "next": "end"}
  ]
}
```

第二步，NL2SQL 必须假设模型会犯错，所以要有三道闸。

```python
# tools/nl2sql.py
import re
from sqlalchemy import create_engine, text

ALLOW_TABLES = {"orders", "products", "regions"}          # 表白名单
engine = create_engine("postgresql+psycopg://readonly:******@db:5432/biz")  # 只读账号
SCHEMA = """
orders(order_id, product_id, region_id, amount, created_at, status)
products(product_id, name, category, price)
regions(region_id, name, province)
"""

def nl2sql(question: str, llm) -> str:
    sql = llm(f"""你是 SQL 生成器，只输出一条 SELECT，不要解释。
表结构：{SCHEMA}
约束：只能查 {ALLOW_TABLES}；必须带时间范围；禁止 SELECT *。
问题：{question}""").strip().strip("`").replace("sql\n", "", 1)

    if not re.match(r"^\s*select\b", sql, re.I):           # 闸一：只允许查询
        raise ValueError("只允许 SELECT")
    for table in re.findall(r"from\s+(\w+)", sql, re.I):   # 闸二：表名白名单
        if table not in ALLOW_TABLES:
            raise ValueError(f"未授权表：{table}")
    if "limit" not in sql.lower():                         # 闸三：强制限量
        sql += " LIMIT 200"
    return sql

def run_sql(sql: str) -> list[dict]:
    with engine.connect() as conn:
        return [dict(r._mapping) for r in conn.execute(text(sql))]
```

第三步，代码解释器。核心不是“能跑代码”，而是“跑挂也伤不到宿主机”。

```python
# tools/code_interpreter.py
import os, subprocess, tempfile

def run_python(code: str, timeout: int = 15) -> dict:
    """独立进程执行：无网络、限时、不传业务密钥（简化实现，生产用容器沙箱）"""
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False, encoding="utf-8") as f:
        f.write("import pandas as pd\nimport numpy as np\n" + code)
        path = f.name
    try:
        p = subprocess.run(["python", "-I", path], capture_output=True, text=True,
                           timeout=timeout, env={"PATH": os.getenv("PATH", "")})  # -I 隔离环境
        return {"ok": p.returncode == 0, "stdout": p.stdout[-2000:], "stderr": p.stderr[-1000:]}
    finally:
        os.remove(path)
```

第四步，SSE 推送。事件协议提前定好，前端才好写。

```python
# api/sse.py
import asyncio, json
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

def sse(event: str, data: dict) -> str:
    """SSE 单帧：event + data + 空行，三者缺一不可"""
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"

@app.get("/api/analyze/stream")
async def analyze_stream(q: str):
    async def gen():
        yield sse("stage", {"name": "理解问题"})
        yield sse("thought", {"text": "需要先确认口径：按月还是按季度"})
        yield sse("tool_call", {"tool": "web_search", "args": {"q": q}})
        # 真实项目在此 await 工具，并把结果作为 tool_result 推送
        yield sse("token", {"text": "华东区环比增长 12%"})
        yield sse("final", {"answer": "……", "citations": ["https://example.com/report"]})
    return StreamingResponse(gen(), media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})   # 关掉代理缓冲
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| SOP 里的 `next` / `on_true` | 定义控制流 | 执行器只认配置，换流程不改程序 |
| 只取 `FROM` 后的表名 | 粗粒度防越权 | 配合只读账号形成双保险 |
| 强制追加 `LIMIT` | 保护数据库 | 模型极爱生成全表扫描 |
| `python -I` | 隔离运行环境 | 避免加载宿主项目的包和变量 |
| `env` 只传 PATH | 防密钥泄露 | 沙箱里最怕模型打印环境变量 |
| `X-Accel-Buffering: no` | 关闭 Nginx 缓冲 | 否则前端一次性收到全部事件 |
| 事件分 `stage/thought/tool_call/token/final` | 前端可分类渲染 | 思考过程与最终答案要视觉区分 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>SOP 里写死业务字段</b>：换行业就要重写。字段通过变量表注入，SOP 只描述流程。</li>
<li><b>NL2SQL 不做结果校验</b>：模型可能返回 0 行，也可能查错表。要校验行数、字段数、量级是否合理。</li>
<li><b>代码解释器直接 <code>exec</code></b>：等于把服务器交出去。必须独立进程 + 无网络 + 限时。</li>
<li><b>搜索没有来源约束</b>：结论无法追溯。每条外部信息带 URL 与抓取时间。</li>
<li><b>SSE 没心跳</b>：中间静默 60 秒代理会断开。每 15 秒发一次注释行心跳。</li>
<li><b>上下文无限增长</b>：工具结果全塞进 prompt，几轮就超限。只保留摘要与引用编号。</li>
</ul>
</div>

### 模块3：项目六：工程调研助手（Loop Engineering）

#### 解决什么问题

新接手一个陌生仓库，或要做技术选型，需要回答：它是什么架构、入口在哪、怎么分层、有哪些风险。人工读代码要一两天，让模型“看一眼”又不可信。系统要做的是**自动扫描 + 结构化分析 + 每个结论带文件与行号**，并且中途能停下来让人确认，重启后接着跑。

#### 核心概念

| 概念 | 含义 | 落地方式 |
|-|-|-|
| StateGraph 编排 | 把调研拆成有向步骤 | clone → scan → analyze → verify → report |
| Git 仓库读取 | 安全地拿到代码 | `git clone --depth 1`，不执行仓库内脚本 |
| 代码结构分析 | 提取语言分布、入口、函数类 | AST 静态分析，不 import 业务代码 |
| Checkpoint | 每步后存状态 | PostgresSaver + thread_id |
| 断点恢复 | 失败或人工暂停后继续 | 同 thread_id 再次 invoke |
| 事件流式推送 | 每步实时告知进度 | `astream_events` 或自定义事件 |
| 可审计报告 | 结论可回溯 | 结论绑定 commit、文件路径、行号 |

Loop Engineering 的重点是**循环要有退出条件**。`verify` 节点可能发现证据不足，要求回到 `analyze` 补一轮；但一直补不齐时必须有最大轮数。工业做法是给状态加 `retry`，超过 2 次就降级为“部分结论 + 风险提示”。

#### 关键实现

```python
# research/graph.py
import ast, operator, subprocess, tempfile
from collections import Counter
from pathlib import Path
from typing import Annotated, TypedDict
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.graph import END, StateGraph

ALLOW_SUFFIX = {".py", ".java", ".ts", ".go", ".md", ".toml", ".yml"}
MAX_FILES = 800

class ResearchState(TypedDict):
    repo_url: str
    workdir: str
    commit: str
    files: list[str]
    facts: Annotated[list[dict], operator.add]      # 多节点追加，不互相覆盖
    retry: int
    report: dict

def clone_repo(state: ResearchState) -> dict:
    workdir = tempfile.mkdtemp(prefix="repo-")
    # 只取最新一次提交；不执行仓库内任何脚本，避免供应链风险
    subprocess.run(["git", "clone", "--depth", "1", state["repo_url"], workdir],
                   check=True, timeout=120, capture_output=True)
    commit = subprocess.run(["git", "-C", workdir, "rev-parse", "HEAD"],
                            capture_output=True, text=True, check=True).stdout.strip()
    files = [str(p.relative_to(workdir)) for p in Path(workdir).rglob("*")
             if p.is_file() and p.suffix in ALLOW_SUFFIX][:MAX_FILES]
    return {"workdir": workdir, "commit": commit, "files": files,
            "facts": [{"type": "clone", "commit": commit, "file_count": len(files)}]}

def scan_structure(state: ResearchState) -> dict:
    by_ext = Counter(Path(f).suffix for f in state["files"])
    entries = [f for f in state["files"] if Path(f).name in {"main.py", "app.py", "index.ts", "pom.xml", "package.json"}]
    return {"facts": [{"type": "scan", "by_ext": dict(by_ext), "entries": entries}]}

def analyze_code(state: ResearchState) -> dict:
    """静态分析：只读文本、只 parse，不执行仓库代码"""
    facts = []
    for rel in state["files"]:
        if not rel.endswith(".py"):
            continue
        try:
            tree = ast.parse((Path(state["workdir"]) / rel).read_text(encoding="utf-8", errors="ignore"))
        except SyntaxError:
            continue                                 # 单个文件语法错误不中断整体
        funcs = [n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]
        classes = [n.name for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]
        facts.append({"type": "ast", "file": rel, "functions": funcs[:20],
                      "classes": classes[:10], "evidence": f"{rel}:1"})
    return {"facts": facts}

def verify_claims(state: ResearchState) -> dict:
    missing = [f for f in state["facts"] if f["type"] == "ast" and not f.get("evidence")]
    return {"retry": state.get("retry", 0) + 1, "facts": [{"type": "verify", "missing": len(missing)}]}

def write_report(state: ResearchState) -> dict:
    # 真实项目在此调用模型把 facts 归纳成报告（简化实现，仅给出结构）
    return {"report": {"commit": state["commit"], "summary": "分层架构，入口集中在 app.py",
                       "sections": [{"title": "技术栈", "evidence": ["pyproject.toml:1"]}]}}

def need_retry(state: ResearchState) -> str:
    return "analyze" if state["retry"] < 2 else "report"   # 最多补两轮，防止死循环

g = StateGraph(ResearchState)
for name, fn in [("clone", clone_repo), ("scan", scan_structure), ("analyze", analyze_code),
                 ("verify", verify_claims), ("report", write_report)]:
    g.add_node(name, fn)
g.set_entry_point("clone")
g.add_edge("clone", "scan"); g.add_edge("scan", "analyze"); g.add_edge("analyze", "verify")
g.add_conditional_edges("verify", need_retry, {"analyze": "analyze", "report": "report"})
g.add_edge("report", END)

with PostgresSaver.from_conn_string("postgresql://agent:******@localhost:5432/research") as cp:
    cp.setup()                                       # 首次运行建表
    app = g.compile(checkpointer=cp)
    cfg = {"configurable": {"thread_id": "repo-flask-001"}}
    app.invoke({"repo_url": "https://github.com/pallets/flask", "facts": [], "retry": 0}, cfg)
```

断点恢复与事件流：同一个 `thread_id` 再次调用会从最后成功的节点继续；`app.astream_events(input, config=cfg, version="v2")` 会依次产出 `on_chain_start` 与 `on_chain_end` 事件，前端据此绘制步骤进度。

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `--depth 1` | 只拉最新提交 | 大仓库全量克隆要几分钟甚至几十 GB |
| `rglob` + 后缀白名单 | 限制扫描范围 | 跳过二进制与依赖目录，避免读爆磁盘 |
| `ast.parse` 不 `import` | 安全静态分析 | 一旦 import 等于执行了陌生代码 |
| `Annotated[list, operator.add]` | 追加式状态 | 各节点产出不会被后一个覆盖 |
| `retry < 2` | 循环退出条件 | 没有上限的自我修正就是死循环 |
| `PostgresSaver` | 持久化存档 | 进程重启、多实例都能接着跑 |
| `thread_id` | 任务主键 | 多个调研任务并行互不干扰 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>在主进程直接 clone 巨型仓库</b>：磁盘写满、内存吃光。要限制大小与文件数，超限直接拒绝。</li>
<li><b>为了“更懂代码”去执行 <code>pip install</code></b>：等于给了对方远程代码执行入口。调研只需要读。</li>
<li><b>Checkpoint 用 MemorySaver</b>：演示没问题，一重启全丢，长任务白跑。</li>
<li><b>状态里放 <code>Path</code>、数据库连接</b>：无法序列化，存档直接报错。</li>
<li><b>报告没有 commit 号</b>：代码更新后结论无法复现，审计过不了。</li>
<li><b>节点不幂等</b>：恢复时重复 clone、重复写文件，状态越来越乱。</li>
</ul>
</div>

### 模块4：项目六：电商运营助手（多智能体 + Harness）

#### 解决什么问题

一个店铺要同时做选品、写文案、做图、剪视频、盯库存、复盘投放。每件事都需要不同专长，而且素材生成动辄几分钟。系统要做的是**把商品、竞品、库存、经营四类数据整合成统一视图**，让多个专业 Agent 各管一段，并把耗时任务丢进队列异步执行。

#### 核心概念

| 概念 | 含义 | 落地方式 |
|-|-|-|
| 数据整合 | 多渠道同一商品对上号 | SKU 为主键，来源字段合并 |
| 角色分工 | 选品 / 文案 / 设计 / 视频 / 复盘 | 每个角色一套提示词模板 |
| 多模态生成 | 图、文、视频 | 文生图、图生图、文生视频 API |
| 异步任务队列 | 耗时任务后台跑 | ARQ / Celery + Redis |
| 优先级调度 | 紧急任务先跑 | 多队列，high / default / low |
| 失败重试 | 网络抖动自动恢复 | 指数退避 + 最大次数 |
| Alembic 迁移 | 表结构版本化 | revision + upgrade / downgrade |
| 数据备份 | 出事能恢复 | 定时 `pg_dump` + 恢复演练 |

队列设计有个容易忽略的点：**重试必须幂等**。视频生成一次可能已经扣费，重试又发一次请求就是双倍成本。做法是用“商品 ID + 脚本哈希”作为缓存键，命中直接返回已有结果。

#### 关键实现

```python
# worker/tasks.py
import asyncio, hashlib
from arq.connections import RedisSettings

async def gen_video(ctx, product_id: int, script: str) -> str:
    """文生视频：耗时任务，必须幂等，避免重试重复扣费"""
    key = f"video:{product_id}:{hashlib.md5(script.encode()).hexdigest()}"
    cached = await ctx["redis"].get(key)
    if cached:
        return cached.decode()                       # 命中缓存直接复用
    await asyncio.sleep(30)                          # 占位：真实调用视频生成 API（简化实现）
    url = f"https://cdn.example.com/videos/{product_id}.mp4"
    await ctx["redis"].set(key, url, ex=86400)       # 结果缓存一天
    return url

class WorkerSettings:
    redis_settings = RedisSettings(host="localhost", port=6379)
    functions = [gen_video]
    max_tries = 3                                    # 失败最多三次
    job_timeout = 600                                # 单任务十分钟上限

# 投递时按紧急程度分队列，避免大促素材把日常任务饿死
# await pool.enqueue_job("gen_video", 1024, "开场三秒展示卖点", _queue_name="high")
# await pool.enqueue_job("gen_video", 2048, "平铺展示细节", _queue_name="low")
```

商品主数据合并：同一 SKU 在店铺、竞品、库存三张快照表里各有一行，用窗口函数取最新值再按来源聚合。

```sql
-- 合并多渠道商品快照：每个 SKU 取最近一次记录，再按来源拆列
WITH ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY sku ORDER BY updated_at DESC) AS rn
  FROM product_snapshots
  WHERE source IN ('shop', 'competitor', 'inventory')
)
SELECT sku,
       MAX(name)  FILTER (WHERE source = 'shop')       AS name,
       MAX(price) FILTER (WHERE source = 'competitor') AS competitor_price,
       MAX(stock) FILTER (WHERE source = 'inventory')  AS stock,
       MAX(updated_at)                                 AS last_update
FROM ranked
WHERE rn <= 3
GROUP BY sku;
```

表结构变更是常态，Alembic 把每次改动变成可回滚的版本：

```bash
alembic init migrations                                   # 初始化，只需一次
alembic revision --autogenerate -m "add product_asset"    # 生成迁移脚本，人工检查
alembic upgrade head                                      # 升级到最新
alembic downgrade -1                                      # 回滚一个版本，先在测试库演练
pg_dump -h localhost -U postgres -Fc shop > backup_$(date +%F).dump   # 每日备份
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| 缓存键含脚本哈希 | 幂等 | 同商品同脚本重复提交只生成一次 |
| `max_tries = 3` | 控制重试上限 | 无限重试会拖垮队列并放大费用 |
| `_queue_name="high"` | 优先级隔离 | 紧急任务不被批量任务堵住 |
| `ROW_NUMBER()` | 取每个 SKU 最新记录 | 快照表只追加，必须去重 |
| `FILTER (WHERE source=...)` | 按来源拆列 | 一行输出完整商品视图，省一次 JOIN |
| `alembic downgrade -1` | 可回滚 | 上线出问题能快速退回上一版 |
| `pg_dump -Fc` | 自定义格式备份 | 比纯 SQL 体积小，支持并行恢复 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>在接口里同步等视频生成</b>：必然超时，还会占满 web worker。提交任务拿 job_id，前端轮询或订阅进度。</li>
<li><b>重试不做幂等</b>：重复生成、重复扣费，月底对账一团糟。</li>
<li><b>所有任务一个队列</b>：批量任务把紧急任务堵在后面，大促当天直接事故。</li>
<li><b>迁移脚本不审查直接 upgrade</b>：autogenerate 可能漏索引或误删列，生产必须人工过一遍。</li>
<li><b>备份了但没恢复过</b>：真出事才发现备份是坏的。每季度做一次恢复演练。</li>
<li><b>素材直接存数据库</b>：几 MB 的视频塞进 PostgreSQL，查询被拖死。文件放对象存储，库里只存 URL。</li>
</ul>
</div>

## 综合实战

### 实战目标

把模块 1 到模块 3 串起来：**一条负面舆情进来，系统自动完成采集、并行分析、专家讨论、风险预警、报告生成，并支持中断续跑与前端实时观看**。这是答辩最容易被追问的场景，因为几乎每个环节都藏着工程细节。

### 第 1 步：定义共享状态

状态只放“结论与引用”，不放原文全文。原文放对象存储或数据库，状态里存 ID；`analyses` 用 `Annotated[list[dict], operator.add]` 声明为追加式字段，避免每个节点覆盖前一个节点的产出。

### 第 2 步：串起五个节点

```python
# app/graph.py
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.graph import END, StateGraph
from analysis.expert_panel import discuss
from analysis.pipeline import run_analysis
from app.state import CaseState

def collect(state: CaseState) -> dict:
    # 真实项目从 Redis / 数据库按 raw_ids 取数；此处占位（简化实现）
    items = [{"content": "质量太差，退货", "keyword": state["keyword"],
              "collected_at": "2026-11-24T09:00:00", "source_weight": 2}]
    return {"analyses": [{"node": "collect", "items": items}]}

def analyze(state: CaseState) -> dict:
    import asyncio
    return {"analyses": [{"node": "analyze", **asyncio.run(run_analysis(state["analyses"][-1]["items"]))}]}

def panel(state: CaseState) -> dict:
    transcript, verdict = discuss(state["keyword"], str(state["analyses"][-1]))
    return {"analyses": [{"node": "panel", "transcript": transcript, "verdict": verdict}]}

def alert(state: CaseState) -> dict:
    return {"alert": state["analyses"][-1].get("alert", "蓝色")}

def write_report(state: CaseState) -> dict:
    return {"report": {"case_id": state["case_id"], "alert": state["alert"],
                       "sections": [a["node"] for a in state["analyses"]]}}

g = StateGraph(CaseState)
for name, fn in [("collect", collect), ("analyze", analyze), ("panel", panel),
                 ("alert", alert), ("report", write_report)]:
    g.add_node(name, fn)
g.set_entry_point("collect")
g.add_edge("collect", "analyze"); g.add_edge("analyze", "panel")
g.add_edge("panel", "alert"); g.add_edge("alert", "report"); g.add_edge("report", END)

with PostgresSaver.from_conn_string("postgresql://agent:******@localhost:5432/research") as cp:
    cp.setup()
    app = g.compile(checkpointer=cp)
```

### 第 3 步：把执行过程推给前端

图跑在图执行器里，SSE 在 web 进程里，两者用同一个 `thread_id` 关联。

```python
# app/api.py
import json
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from app.graph import app as graph_app

api = FastAPI()
frame = lambda e, d: f"event: {e}\ndata: {json.dumps(d, ensure_ascii=False)}\n\n"

@api.get("/cases/{case_id}/stream")
async def stream(case_id: str):
    cfg = {"configurable": {"thread_id": case_id}}       # 同一任务复用同一存档
    async def gen():
        async for ev in graph_app.astream_events(
            {"case_id": case_id, "keyword": "某品牌", "raw_ids": [],
             "analyses": [], "retry": 0}, config=cfg, version="v2"):
            if ev["event"] in ("on_chain_start", "on_chain_end"):
                yield frame(ev["event"], {"node": ev["name"]})
        yield frame("done", {"case_id": case_id})
    return StreamingResponse(gen(), media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"})
```

### 第 4 步：验收这份链路

用同一个 `case_id` 连发两次请求。第一次跑到 `panel` 节点时手动中断，第二次再请求，应该看到 `collect` 与 `analyze` 不再重复执行，直接从断点继续。这一步能证明 Checkpoint 真的生效，而不是只在 PPT 上。

### 解析表

| 步骤 | 关键动作 | 验收信号 |
|-|-|-|
| 定义状态 | 只存主键与结论，用 `Annotated` 追加 | 存档体积小于 1 MB |
| 采集节点 | 从队列或库里按 ID 取数 | 日志显示条数与去重后条数 |
| 分析节点 | 三路 `gather` + 情感融合 | 返回 topics / heat / ratio |
| 专家节点 | 四角色两轮 + 独立裁决 | 裁决是合法 JSON |
| 预警节点 | 双指标 + 样本量保护 | 小样本返回“样本不足” |
| 报告节点 | 每条结论带 evidence | 报告能指回具体数据行 |
| SSE | 事件分层 + 关缓冲 | 浏览器逐步刷新，不是一次性出现 |
| 断点恢复 | 同 thread_id 二次调用 | 已完成节点不重跑 |

<div class="callout tip"><span class="tag">老师建议</span>
<p>答辩时一定现场演示“中断再恢复”。把第二次执行的日志投到屏幕上，让评委看到节点被跳过——这比讲十页架构图有说服力。</p>
</div>

## 疑难点分级

| 知识点 | 难度 | 典型卡点 | 破解方式 |
|-|-|-|-|
| Supervisor 决策 | 高 | 反复派同一个 Agent | 状态里记录已完成角色，并设最大轮数 |
| 并行分析聚合 | 高 | 一路失败导致全部结果丢失 | `return_exceptions=True` + 单路降级 |
| 情感模型选型 | 中 | 跨领域准确率骤降 | 抽样 200 条人工标注，先算准确率再上线 |
| 热度公式 | 高 | 只算条数导致误判 | 引入增速、媒体权重、样本量三因子 |
| SOP 动态编排 | 高 | 流程写死，改需求就改代码 | SOP 存 JSON + 变量表注入 |
| NL2SQL 安全 | 高 | 模型生成写操作或越权表 | 只读账号 + 白名单 + 强制 LIMIT |
| 代码解释器逃逸 | 高 | 沙箱能访问宿主机文件 | 独立容器 + 无网络 + 非 root |
| SSE 被缓冲 | 中 | 前端一次性收到全部事件 | `X-Accel-Buffering: no` + 心跳 |
| Git 仓库安全读取 | 高 | 克隆大仓库或执行脚本 | 浅克隆 + 文件数上限 + 只读不执行 |
| Checkpoint 序列化 | 高 | 状态里有连接对象导致存失败 | 状态只放可 JSON 化的数据 |
| 断点恢复幂等 | 高 | 恢复后重复写数据 | 节点幂等 + 唯一索引兜底 |
| 报告可审计 | 中 | 结论无出处，业务方不敢用 | 每条结论绑定 commit、文件、行号 |
| 异步队列优先级 | 高 | 批量任务饿死紧急任务 | 多队列 + worker 权重分配 |
| 任务重试幂等 | 高 | 重复生成、重复扣费 | 结果缓存键 + 去重表 |
| Alembic 迁移 | 中 | autogenerate 误删列 | 迁移脚本人工评审 + 先测试库演练 |
| 数据备份恢复 | 中 | 有备份但没验证过 | 季度恢复演练，记录 RTO |

## 阶段项目

### 项目一：舆情分析系统

**背景**：某消费品牌每周收到上万条提及，运营靠人工看表格，重大负面常滞后一天才发现。需要一套 7×24 自动监控与预警系统。

**功能清单**：多源采集（新闻、微博、投诉平台，支持关键词与话题 ID）；去重与清洗（指纹、广告过滤、繁简归一）；情感研判（正负中性 + 风险等级 + 置信度）；并行分析（主题聚类、热度曲线、负面占比）；专家讨论（四角色 + 裁决）；多级预警（蓝黄橙红 + 钉钉推送）；报告与大盘（日报、趋势图）。

**技术选型**：Python 3.11 + httpx + Redis（队列与去重）+ PostgreSQL（业务与 Checkpoint）+ transformers（情感模型）+ FastAPI（接口与 SSE）+ Vue3（大盘）。

**验收标准**：

| 验收项 | 标准 |
|-|-|
| 采集稳定性 | 连续运行 2 小时，重复率低于 1% |
| 情感准确率 | 抽样 200 条，准确率不低于 80% |
| 预警时效 | 从数据入队到预警推送不超过 5 分钟 |
| 报告可追溯 | 每条结论能定位到原始数据 ID 与时间 |
| 故障恢复 | 杀掉进程重启后，未完成任务能续跑 |

**评分点**：采集与去重 20 分，情感融合策略 20 分，并行与专家讨论 25 分，预警与报告 20 分，工程可靠性 15 分。

### 项目二：市场罗盘

**背景**：业务方需要快速回答“某区域某品类下季度是否加投”，过去靠分析师手工查数加搜资料，两天出一份 PPT。

**功能清单**：问题澄清（改写为可检索子问题）；SOP 编排（按问题类型动态选路线）；双模态取证（联网搜索 + NL2SQL）；指标计算（代码解释器做同比环比、贡献度拆解）；结论生成（结论、依据、风险、建议四段式，带引用）；过程可视化（SSE 推送思考与工具调用）。

**技术选型**：LangGraph + FastAPI SSE + PostgreSQL（只读账号）+ 搜索 API + 沙箱代码执行 + Vue3。

**验收标准**：

| 验收项 | 标准 |
|-|-|
| 路线正确性 | 五类典型问题能走到正确 SOP 分支 |
| SQL 安全 | 10 次恶意提问无一次越权或写操作 |
| 沙箱隔离 | 沙箱内无法访问网络与业务密钥 |
| 结论可信 | 每条结论至少一条引用，可点开查看来源 |
| 过程可见 | 前端逐条渲染思考与工具结果 |

**评分点**：SOP 设计 25 分，NL2SQL 安全 20 分，双模态融合 20 分，SSE 体验 15 分，报告质量 20 分。

### 项目三：工程调研助手

**背景**：技术团队要评估三个开源方案，人工读代码成本高，结论无法沉淀。需要一个自动产出、且可复核的调研工具。

**功能清单**：仓库接入（浅克隆、白名单、大小限制）；结构扫描（语言分布、入口、依赖）；代码分析（函数类清单、分层、复杂度基线）；证据校验（结论绑定文件行号）；断点恢复（人工中断后续跑）；报告导出（Markdown / JSON，带 commit 号）。

**技术选型**：LangGraph StateGraph + PostgresSaver + Git CLI + Python AST + FastAPI。

**验收标准**：

| 验收项 | 标准 |
|-|-|
| 安全性 | 全程不执行仓库代码，不安装依赖 |
| 规模控制 | 万级文件仓库能在 3 分钟内完成扫描 |
| 可恢复 | 任意节点中断后能继续，已完成节点不重跑 |
| 可审计 | 报告 100% 结论带 evidence 字段 |
| 可复现 | 同一 commit 两次运行结论一致 |

**评分点**：图编排 20 分，安全读取 20 分，分析深度 25 分，断点恢复 20 分，报告可审计 15 分。

### 项目四：电商运营助手

**背景**：店铺每周上新 30 个 SKU，每个都要写文案、做主图、剪短视频、盯库存，运营团队严重超负荷。

**功能清单**：商品主数据整合（三源合并）；多角色协作（选品、文案、视觉提示词、视频脚本）；多模态生成（主图、场景图、宣传视频）；异步任务（提交返回 job_id）；优先级调度（大促优先）；失败重试与死信；迁移与备份（Alembic + 定时备份）。

**技术选型**：FastAPI + ARQ + Redis + PostgreSQL + SQLAlchemy + Alembic + 多模态 API + 对象存储。

**验收标准**：

| 验收项 | 标准 |
|-|-|
| 异步正确性 | 提交任务 1 秒内返回 job_id |
| 幂等性 | 同商品同脚本重复提交只生成一次 |
| 调度能力 | high 队列任务平均等待小于 30 秒 |
| 数据一致 | 三源合并后 SKU 不重复、字段不冲突 |
| 可回滚 | 任一迁移可成功 downgrade |

**评分点**：数据整合 20 分，多角色与多模态 25 分，队列与调度 25 分，幂等与重试 15 分，迁移与备份 15 分。

## 常见面试题

### 问题 1：多智能体系统里，Supervisor 和生产环境的调度器有什么区别？

要点：Supervisor 是**语义决策**，根据任务内容判断下一步找谁，输入是自然语言与状态；生产调度器是**确定性执行**，按 DAG 或队列规则跑，不允许随机。真实系统通常两层配合：上层用模型做规划，下层用图或队列保证可预测、可重试、可观测。只靠模型调度无法保证 SLA，只靠写死流程无法应对开放任务。

### 问题 2：为什么长任务必须做 Checkpoint？你存在哪里？

要点：长任务随时可能因重启、发布、人工中断而失败，没有存档就得从头再来。演示可用 `MemorySaver`，生产用 `PostgresSaver`，多实例部署可换 Redis。关键约束是状态必须可序列化，不能放连接对象、文件句柄，只放主键、结论和引用。

### 问题 3：断点恢复后怎么保证不重复执行有副作用的操作？

要点：第一，节点设计成幂等，写入用 upsert、生成用缓存键；第二，恢复时从最后一个成功节点之后开始，而不是整图重跑；第三，外部调用带幂等键，让对方系统去重。再加数据库唯一索引兜底，避免极端并发重复。

### 问题 4：多个 Agent 并行分析，一路失败怎么办？

要点：先明确业务语义：缺一路是否还能出结论。能，就降级并在报告里标注“该维度缺失”；不能，就让整图失败并进入重试。实现上用 `asyncio.gather(..., return_exceptions=True)` 逐路判断结果类型，同时给每路设超时，避免一路卡死拖住全局。

### 问题 5：情感分析为什么不能只用一个模型？

要点：准确率、成本、可解释性不可兼得。小模型快且便宜，但跨领域泛化差；大模型懂上下文与反讽，但贵且输出不稳定。工业方案是分层：小模型先筛，低置信度样本升级给大模型，关键样本人工复核。上线前必须用本领域标注集评估，而不是看公开榜单。

### 问题 6：舆情热度怎么算才不容易误导业务？

要点：不能只看条数。要综合讨论量、环比增速、来源权重、互动量、样本量。常用做法是滑动窗口内加权求和，再用增速判断“是否在爆发”。同时给出样本量提示，样本不足时明确说“不足以判断”，而不是硬给一个颜色。

### 问题 7：NL2SQL 怎么防止模型生成危险 SQL？

要点：四层防护。账号层用只读账号、独立库；语句层只允许 `SELECT`；对象层做表名与字段白名单；执行层强制 `LIMIT`、设超时、限制返回行数。再加结果校验：行数为 0、字段数异常、量级明显不合理时拒绝返回，改为提示用户澄清。

### 问题 8：代码解释器怎么做隔离？

要点：最低要求是独立进程 + 无网络 + 限时 + 不传密钥；生产建议独立容器，非 root、只读文件系统、CPU 与内存限额、禁止访问内网。不要在 web 进程里用 `exec` 跑模型生成的代码，还要限制可用包，避免引入未知依赖。

### 问题 9：SSE 和 WebSocket 怎么选？

要点：SSE 单向、基于 HTTP、自带断线重连，适合推送进度和 token；WebSocket 双向、需自己处理心跳与重连，适合用户边看边打断、边补充输入。过程可视化优先 SSE，实现简单、过网关容易；需要双向交互的对话场景再用 WebSocket。

### 问题 10：为什么 SSE 在本地正常，部署到 Nginx 后面就变成一次性返回？

要点：Nginx 默认开启响应缓冲，会把事件攒起来一起发。要设置 `proxy_buffering off`，后端响应头加 `X-Accel-Buffering: no`，并对 `text/event-stream` 关闭压缩。另外长连接要设足够的 `proxy_read_timeout`，并定期发心跳。

### 问题 11：让模型分析陌生代码仓库，最大的风险是什么？

要点：安全与可信度。安全上，克隆后绝不能执行仓库脚本或安装依赖，否则等于远程代码执行；可信度上，模型容易编造不存在的文件和函数，所以必须用静态分析拿事实，再让模型基于事实归纳，每条结论绑定文件与行号。

### 问题 12：异步任务队列如何设计优先级和重试？

要点：按紧急度分队列（high / default / low），worker 按权重消费，而不是所有任务挤一个队列。重试用指数退避，设最大次数，超过进死信队列并告警。重试必须幂等，用幂等键或结果缓存避免重复副作用。还要设任务超时，防止单任务长期占用 worker。

## 动手练习

<div class="callout task"><span class="tag">动手练习</span><ol>
<li>用 4 个 worker 消费同一个 Redis 队列，压测 1000 条任务，统计重复入库条数，要求为 0。</li>
<li>把情感融合的置信度阈值改成 0.7 和 0.95，各跑 500 条，记录大模型调用量与准确率变化。</li>
<li>给热度公式加入“互动量”因子，用同一批数据对比新旧排名差异，并解释原因。</li>
<li>给专家讨论加一个“反方角色”，专门挑结论漏洞，观察裁决结果是否变化。</li>
<li>把预警从四色改成五级，并加入“样本不足”分支，写清每一级的触发条件。</li>
<li>用 SSE 做一个最小页面，逐条显示节点开始与结束，验证刷新页面后能否重连。</li>
<li>给 NL2SQL 加一条“结果量级校验”：返回行数超过 10 万直接拒绝，并给出提示。</li>
<li>在代码解释器里尝试读取环境变量和访问网络，记录失败方式，并补一条防护。</li>
<li>用 LangGraph 实现“证据不足则回到分析节点”，设置最大重试次数，验证不会死循环。</li>
<li>把 MemorySaver 换成 PostgresSaver，杀掉进程后恢复任务，保存两次运行的日志对比。</li>
<li>给调研报告加 commit 号与生成时间，写脚本校验每个 evidence 路径真实存在。</li>
<li>用 ARQ 建 high / low 两个队列，投递 100 个任务，统计紧急任务的平均等待时间。</li>
<li>写一个 Alembic 迁移新增素材表，执行 upgrade 与 downgrade，验证数据不丢。</li>
<li>做一次备份恢复演练：导出数据库、删表、恢复，记录总耗时并写进 README。</li>
</ol></div>

## 阶段小结

- 多智能体的核心是**分工、路由、状态**，不是 Agent 数量。角色越多，协调成本越高。
- 长任务必须持久化：Checkpoint 是底线，幂等是保险，最大重试次数是刹车。
- 结构化输出比“漂亮的话”重要，每条结论都要能指回证据。
- 并行能省时间，但必须处理单路失败与限流，否则会把整体拖垮。
- 过程要可见：SSE 事件分层、关掉代理缓冲、加心跳，三件事缺一不可。
- 外部输入都不可信：仓库不执行、SQL 只读、代码跑沙箱、密钥不进沙箱。
- 异步队列要分优先级、要重试、更要幂等，否则省下的时间会变成对账的噩梦。
- 迁移与备份不是运维的事，是开发交付的一部分；没演练过的备份等于没有备份。

下一阶段换一条路径：不写这么多代码，用 Coze 与 Dify 在小时级把想法变成可用应用，并想清楚什么时候该用低代码、什么时候必须回到代码。
