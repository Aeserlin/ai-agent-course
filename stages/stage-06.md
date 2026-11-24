## 阶段导读

前两个阶段你的系统已经能“答得对”：RAG 把文档检索准，Java 中台把权限、租户、审计管住。但业务方真正愿意付钱的是“把事办了”：用户一句“我昨天买的耳机要退”，系统要认出意图、问到订单号、查订单状态、判断是否在七天无理由期内、生成退货单；运营一句“上周华东销售额为什么掉了 18%”，系统要自己写 SQL、拉数据、拆维度、给结论。前者考验多轮对话的状态管理，后者考验自然语言到数据的可靠转换。

本阶段三块内容连成一条链：电商小二负责“听懂并办成”，智数归因负责“查准并解释”，微调负责“让模型更懂你们的说法”。它们共用同一套工程底座：外部 API、异步并发、流式输出、评测集。学完你能独立交付一个可演示的任务型客服、一个能安全取数的归因平台，并在单卡上完成一次 LoRA/QLoRA 微调，给出微调前后的量化对比。

最容易踩的四个坑：把微调当成知识注入，公司文档一更新就得重训；让纯模型决定关键业务分支，订单、退款这类流程必须规则兜底；NL2SQL 生成完直接执行，没有 AST 校验和只读账号；只盯 loss 不看评测集，训练“收敛”了但线上回答更差。

<div class="callout plain"><span class="tag">大白话</span>
<p>任务型对话像<b>银行柜员</b>：先问你要办什么业务（意图），再要身份证和卡号（槽位），然后按流程一步步办（策略），办完给回执（action 调外部系统）。</p>
<p>微调像<b>岗前培训</b>：教的是“怎么说话、怎么处理”，不是“公司所有资料”。资料天天变，靠 RAG 查；说话方式和业务套路稳定，才值得训进参数里。</p>
</div>

## 教学路径

<div class="callout path"><span class="tag">教学路径</span>
<ol class="path-steps">
<li><b>第 1 步（5 天）：</b>任务型对话基础与 Rasa 工程骨架。产出：能跑通 greet → 查订单的最小工程。</li>
<li><b>第 2 步（5 天）：</b>Sparse + Dense 特征融合与 DIET 训练。产出：意图/实体评测报告，准确率有数字。</li>
<li><b>第 3 步（4 天）：</b>Rule + TED 混合策略、自定义 action 调订单 API。产出：查单与退换货闭环。</li>
<li><b>第 4 步（3 天）：</b>长上下文记忆与多轮回归。产出：10 轮对话的回归用例集。</li>
<li><b>第 5 步（4 天）：</b>智能客服五选一，换领域复用脚手架。产出：带免责声明的垂直客服 demo。</li>
<li><b>第 6 步（4 天）：</b>智数归因架构与 NL2SQL 校验。产出：只读、可拦截的取数链路。</li>
<li><b>第 7 步（4 天）：</b>多模型归因、AsyncIO 并发、SSE 流式。产出：一句话问数并出图的前端页面。</li>
<li><b>第 8 步（4 天）：</b>微调原理与数据集规范。产出：1000 条清洗后的 SFT jsonl。</li>
<li><b>第 9 步（5 天）：</b>LoRA/QLoRA 训练、合并、vLLM 部署。产出：adapter + 可调用的推理服务。</li>
<li><b>第 10 步（4 天）：</b>三选一微调实战与考试五答辩。产出：基线/微调对比报告与选型说明。</li>
</ol>
</div>

## 学习前准备

**前置知识**：阶段 03 的 RAG 与 Agent 基础、阶段 04 的向量库与评测、阶段 05 的 SpringBoot 中台必须已完成；会写 Python 函数与类，懂 `async/await` 基本用法；SQL 要能独立写 `GROUP BY`、`JOIN`、子查询；Linux 能改文件、看日志、起进程。微调部分建议有 24G 显存显卡，没有就按小时租云端卡。

| 软件 | 建议版本 | 用途 | 说明 |
|-|-|-|-|
| Python | 3.10 | 对话与训练 | Rasa 3.6 对 3.11 支持不佳 |
| Rasa / Rasa SDK | 3.6.x | 任务型对话 | 含 DIET、TED、RulePolicy |
| PyTorch | 2.3 + CUDA 12.1 | 训练底座 | 版本要和驱动匹配 |
| transformers / peft / trl | 4.44 / 0.12 / 0.9 | 微调库 | QLoRA 需 bitsandbytes |
| LLaMA-Factory | 0.9.x | 训练脚手架 | 命令行 + WebUI |
| vLLM | 0.6.x | 推理部署 | 支持 OpenAI 兼容协议 |
| Node.js | 20 LTS | 前端 | 归因平台可视化 |
| Docker | 24+ | 依赖隔离 | ES、Qdrant 都用容器 |
| Elasticsearch | 8.13 | 混合检索 | 中文需装 IK 分词 |
| Qdrant | 1.9 | 向量检索 | 与 ES 互补 |

**三道自测题**：

1. 用户说“帮我退一下前天那个蓝色的”，系统缺哪个槽位？该追问什么？答不出先看模块 1 的槽位设计。
2. 一条 SQL 里有 `DELETE` 和两张未授权表，你在哪一层拦截？答不出说明 NL2SQL 安全链路没建立，看模块 3。
3. LoRA 的 `r` 和 `alpha` 各控制什么？调大分别有什么代价？答不出先看模块 4。

## 模块精讲

### 模块1：项目三 电商小二（Harness + 单智能体）

**解决什么问题**：把“用户随便说一句话”变成“系统按流程办完一件事”。闲聊机器人只需生成回复，任务型系统还要记住用户说过什么、缺哪些信息、当前走到哪一步、失败时怎么兜底。这是客服、政务、银行、运营商业务机器人的共同骨架。本模块的**特征工程**覆盖正则、字符 n-gram、词性、词典与同义词映射，再由自定义 action 调外部 API 完成业务动作。

**核心概念**：

| 概念 | 一句话解释 | 在本项目中的位置 |
|-|-|-|
| 任务型对话 | 任务型智能客服：围绕目标推进的多轮交互 | 查订单、退换货两条主流程 |
| 意图 intent | 用户想干什么 | `query_order`、`request_refund` |
| 槽位 slot | 办成事需要的参数 | `order_id`、`refund_reason` |
| Sparse 特征 | 词袋、字符 n-gram、词典、正则 | 抓订单号、“退货”等关键词 |
| Dense 特征 | 预训练模型输出的语义向量 | 区分“我要退货”和“退货政策是什么” |
| DIET | 多任务模型，同时做意图分类与实体抽取 | 一个模型干两件事，省资源 |
| RulePolicy | 命中规则就走固定路径 | 退款必须先确认订单号 |
| TEDPolicy | 学习式对话策略 | 处理规则没覆盖的开放表达 |
| Tracker | 对话状态存储 | 槽位、历史事件都在这里 |
| Custom Action | 自定义动作，可调外部 API | 查订单、生成退货单 |

```yaml
# config.yml：Sparse 与 Dense 两路特征一起喂给 DIET
recipe: default.v1
language: zh
pipeline:
  - name: JiebaTokenizer
  - name: RegexFeaturizer            # 正则特征：订单号、手机号
  - name: LexicalSyntacticFeaturizer # 词性/前后词特征
  - name: CountVectorsFeaturizer     # Sparse：字符 n-gram 词袋
    analyzer: char_wb
    min_ngram: 1
    max_ngram: 4
  - name: LanguageModelFeaturizer    # Dense：语义向量
    model_name: bert
    model_weights: bert-base-chinese
  - name: DIETClassifier             # 多任务：意图 + 实体
    epochs: 100
    constrain_similarities: true
  - name: EntitySynonymMapper
policies:
  - name: RulePolicy                 # 关键路径规则兜底
    core_fallback_threshold: 0.3
    enable_fallback_prediction: true
  - name: TEDPolicy                  # 开放场景学出来的策略
    max_history: 8                   # 长上下文：看最近 8 轮
    epochs: 100
```

```yaml
# domain.yml：意图、槽位、回复、动作
version: "3.1"
intents: [greet, query_order, request_refund, provide_order_id, goodbye]
entities: [order_id]
slots:
  order_id: {type: text, mappings: [{type: from_entity, entity: order_id}]}
  refund_reason: {type: text, mappings: [{type: from_text}]}
  history_summary: {type: text, mappings: [{type: custom}]}  # 早期对话摘要
responses:
  utter_greet:
    - text: "您好，我是电商小二，可以帮您查订单、办退换货。"
  utter_ask_order_id:
    - text: "请提供订单号，通常是 12 位数字。"
actions: [action_query_order, action_create_refund, action_summarize_history]
session_config:
  session_expiration_time: 60
  carry_over_slots_to_new_session: true
```

```yaml
# rules.yml：关键流程写死，模型再飘也不会漏掉确认订单
version: "3.1"
rules:
  - rule: 查询订单必须拿到订单号
    steps:
      - intent: query_order
      - action: utter_ask_order_id
      - intent: provide_order_id
      - action: action_query_order
  - rule: 退款前先确认订单归属
    steps:
      - intent: request_refund
      - action: utter_ask_order_id
      - intent: provide_order_id
      - action: action_create_refund
```

```python
# actions.py：自定义动作，真正去调订单系统
import requests
from rasa_sdk import Action, Tracker
from rasa_sdk.events import SlotSet
from rasa_sdk.executor import CollectingDispatcher

ORDER_API = "http://127.0.0.1:9001/orders"


class ActionQueryOrder(Action):
    def name(self):
        return "action_query_order"

    def run(self, dispatcher, tracker, domain):
        order_id = tracker.get_slot("order_id")
        try:
            resp = requests.get(f"{ORDER_API}/{order_id}", timeout=3)
            resp.raise_for_status()
            data = resp.json()
        except requests.RequestException:
            dispatcher.utter_message(text="订单系统暂时不可用，请稍后再试。")  # 兜底
            return []
        dispatcher.utter_message(
            text=f"订单 {order_id} 状态：{data['status']}，金额 {data['amount']} 元，"
                 f"预计 {data['eta']} 送达。")
        return []


class ActionSummarizeHistory(Action):
    """超过 6 轮时把早期对话压成摘要，避免上下文无限增长"""

    def name(self):
        return "action_summarize_history"

    def run(self, dispatcher, tracker, domain):
        turns = [e["text"] for e in tracker.events
                 if e.get("event") == "user" and e.get("text")]
        if len(turns) <= 6:
            return []
        # 简化实现：真实项目调用小模型摘要，这里用截断拼接示意
        return [SlotSet("history_summary", "；".join(turns[:-4])[:200])]
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `CountVectorsFeaturizer` | Sparse 特征 | 订单号、关键词这类信号，向量模型反而容易丢 |
| `LanguageModelFeaturizer` | Dense 特征 | 解决“退一下”和“申请售后”说法不同的问题 |
| `DIETClassifier` | 意图 + 实体 | 共享底层特征，小样本下比两个模型更稳 |
| `RulePolicy` 优先 | 关键路径兜底 | 退款、金额相关流程不允许模型即兴发挥 |
| `TEDPolicy max_history=8` | 多轮策略 | 太长稀释当前意图，太短记不住上下文 |
| `requests` 超时 + try | 外部依赖设边界 | 订单系统挂掉不能把对话拖死 |
| `SlotSet` | 摘要写回槽位 | 摘要作为后续 prompt 的一部分，控制 token |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>只写 stories 不写 rules</b>：模型会“创造性”跳过确认订单号，退款流程必须规则锁死。</li>
<li><b>槽位不清理</b>：用户换了订单，旧槽位还在，必须显式重置。</li>
<li><b>把所有逻辑塞进 action</b>：action 只做“调接口 + 回话”，业务判断放服务端才可复用。</li>
<li><b>不处理接口超时</b>：一个慢接口会让整个 session 卡住，外部调用都要 timeout。</li>
<li><b>忽略高频未识别意图</b>：上线后每周看 fallback 日志，比盲目加数据有效。</li>
</ul>
</div>

### 模块2：项目实战二 智能客服（五选一）

**解决什么问题**：真实项目不会只做电商。换到医疗、教育、音频、金融、文旅，意图、槽位、合规要求全变，但骨架一模一样。这一模块训练的是“把通用底盘改造成垂直业务”的能力，也是简历上最能体现业务理解的部分。

**核心概念**：

| 方向 | 典型意图 | 特有槽位 | 合规红线 |
|-|-|-|-|
| 尚医助手（医疗） | 挂科室、问症状、查报告 | 症状、持续时间、科室 | 不做诊断结论，必须建议就医 |
| 知学助手（教育） | 选课、查成绩、问政策 | 学号、课程、学期 | 不承诺录取与提分 |
| 倾听助手（音频） | 找节目、续费、退订 | 会员账号、订单 | 不诱导未成年人消费 |
| 金融助手（金融） | 查账单、挂失、问费率 | 卡号后四位、身份校验 | 不承诺收益，敏感操作转人工 |
| 美途助手（文旅） | 查行程、改签、退票 | 订单号、证件号 | 不承诺赔付金额 |

```text
vertical-bot/                  # 以尚医助手为例，复制即可换领域
├── config.yml                 # 管道与策略：五选一共用
├── domain.yml                 # 意图、槽位、回复、动作
├── data/                      # nlu.yml / rules.yml / stories.yml
├── actions/actions.py         # 调医院 HIS 接口（这里用 mock）
└── eval/                      # intent_test.jsonl / dialogue_cases.yml
```

```yaml
# domain.yml（尚医助手节选）
version: "3.1"
intents: [greet, ask_department, describe_symptom, ask_report, ask_emergency]
entities: [department, symptom, duration, report_id]
slots:
  department: {type: text, mappings: [{type: from_entity, entity: department}]}
  duration: {type: text, mappings: [{type: from_entity, entity: duration}]}
responses:
  utter_ask_department:
    - text: "您想看哪个科室？如果不确定，可以描述症状，我帮您推荐。"
  utter_medical_disclaimer:
    - text: "以上建议仅供参考，不能替代医生诊断，症状持续或加重请尽快就医。"
  utter_emergency:
    - text: "如出现胸痛、呼吸困难、意识模糊，请立即拨打 120，不要等待在线回复。"
```

```python
# eval_intents.py：算意图准确率，并找出最容易混的两类
import json
from collections import Counter

samples = [json.loads(l) for l in open("eval/intent_test.jsonl", encoding="utf-8")]
hit, confuse = 0, Counter()
for s in samples:
    # 简化实现：真实项目调用 rasa 的 POST /model/parse 拿 intent
    pred = "request_refund" if "退" in s["text"] else "query_order"
    if pred == s["intent"]:
        hit += 1
    else:
        confuse[f'{s["intent"]} -> {pred}'] += 1
print(f"意图准确率 {hit / len(samples):.2%}", confuse.most_common(3))
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `domain.yml` 统一意图命名 | 脚手架复用 | 换领域只改词表与接口，不动策略 |
| 每个意图 20~50 条说法 | 小样本训练 | 少于 10 条 DIET 学不出边界 |
| `utter_medical_disclaimer` | 合规话术 | 医疗、金融类必须固定回复，不能交给模型生成 |
| `utter_emergency` 独立意图 | 高风险优先 | 急症表达必须先于普通咨询被识别 |
| 混淆对统计 | 指导标注 | 优先补混淆最多的两类样本，而不是平均加数据 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>直接抄电商意图</b>：字段名、合规话术完全不同，照抄会做出“不像本行业”的机器人。</li>
<li><b>把免责声明交给模型生成</b>：每次措辞不同，合规审查过不了，必须用固定 response。</li>
<li><b>没有多轮用例</b>：单轮准确率 95%，多轮一问就乱，要覆盖换槽位、改主意。</li>
<li><b>行业术语不做同义词</b>：患者说“心口疼”，系统只认“胸痛”，用同义词表补齐。</li>
</ul>
</div>

### 模块3：项目四 智数归因平台（Harness + 多智能体）

**解决什么问题**：业务人员不会写 SQL，但每天都要问“为什么”。把问题变成查询、把查询变成结论，需要一条既聪明又安全的链路：会写 SQL 的 Agent、会拆维度的 Agent，以及一层绝不放权的校验。

**核心概念**：

| 概念 | 一句话解释 | 工程要点 |
|-|-|-|
| DataAgent | 负责取数：理解问题、生成 SQL、执行 | 只读、限流、超时、结果行数上限 |
| AttributionAgent | 负责归因：拆维度、算贡献度、出结论 | 结论必须能追溯到 SQL 与数据 |
| Schema 注入 | 把表结构、字段注释、枚举值写进 prompt | 字段注释比字段名更重要 |
| NL2SQL | 自然语言转 SQL | 生成容易，校验和安全才是难点 |
| SQL AST 校验 | 解析语法树，检查类型与表名 | 比正则可靠，能挡多语句与子查询越权 |
| 混合检索 | BM25 + 向量召回 | 指标名、表名这类专有词靠关键词更准 |
| CoT 推理 | 先列拆解步骤再给结论 | 让归因过程可审计 |
| AsyncIO | 单线程内并发多个 IO，支撑高并发问数 | 多表查询、多模型调用并行，降低总耗时 |
| SSE / WebSocket | 服务端流式推送 | 思考过程逐条显示；SSE 更轻，双向交互才用 WebSocket |
| 四库分工 | Qdrant 向量、ES 关键词、MySQL 明细、Redis 缓存 | 各司其职，不互相替代 |

```text
用户问题
   ├─ 意图路由 ─► DataAgent（生成 SQL）─► 校验 ─► 只读执行 ─┐
   │                  ▲ schema 知识（Qdrant + ES）          ├─► 归因计算 ─► 结论
   └─ 问原因 ────► AttributionAgent（拆维度、算贡献度）──────┘
                                        SSE / WebSocket ◄───┘
```

```python
# guard.py：NL2SQL 的生死线，解析 AST + 表白名单 + 单语句
import sqlglot
from sqlglot import exp

ALLOWED_TABLES = {"dwd_order", "dim_region", "dim_channel"}
FORBIDDEN_WORDS = ("insert", "update", "delete", "drop", "alter", "truncate", "grant")


def validate_sql(sql: str) -> str:
    trees = sqlglot.parse(sql, read="mysql")
    if len(trees) != 1:
        raise ValueError("只允许单条语句")
    tree = trees[0]
    if not isinstance(tree, exp.Select):
        raise ValueError("只允许 SELECT 查询")
    tables = {t.name.lower() for t in tree.find_all(exp.Table)}
    if not tables <= ALLOWED_TABLES:
        raise ValueError(f"越权访问表：{tables - ALLOWED_TABLES}")
    if any(w in sql.lower() for w in FORBIDDEN_WORDS):
        raise ValueError("包含危险关键字")
    return tree.sql(dialect="mysql")   # 返回规范化后的 SQL
```

```python
# agents.py：schema prompt、只读执行、维度归因
from sqlalchemy import text

SCHEMA_PROMPT = """你是电商数仓取数助手，只能使用下列表，只输出一条 MySQL SELECT。
dwd_order(order_id, region_id, channel_id, amount, pay_time, status)
dim_region(region_id, region_name)
dim_channel(channel_id, channel_name)
约束：金额字段是 amount；时间用 pay_time；有效状态为 paid / refunded。
问题：{question}
SQL："""


def run_sql(engine, sql: str):
    with engine.connect() as conn:            # 账号本身只读，双保险
        conn.execute(text("SET SESSION MAX_EXECUTION_TIME=5000"))
        return [dict(r._mapping) for r in conn.execute(text(sql)).fetchmany(200)]


# 简化实现：按维度拆解环比变化，算各维度对总变化的贡献度
def attribute(rows, dim="channel_name"):
    total_delta = sum(r["cur"] - r["prev"] for r in rows)
    detail = [{
        "dimension": r[dim], "current": r["cur"], "previous": r["prev"],
        "delta": round(r["cur"] - r["prev"], 2),
        "contribution": round((r["cur"] - r["prev"]) / total_delta, 4) if total_delta else 0,
    } for r in rows]
    return sorted(detail, key=lambda x: x["delta"])
```

接口层用 FastAPI 的 `StreamingResponse` 返回 `text/event-stream`，事件依次为 plan → sql → data → attribution → answer；模型调用与同步数据库驱动统一包进 `asyncio.to_thread`，否则会阻塞事件循环。前端用 `EventSource` 订阅，收到 answer 后主动关闭。完整可运行版本见综合实战步骤 3、步骤 4。

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| 意图路由 | 分流两类 Agent | 用错 Agent 会让“为什么”变成一张没结论的报表 |
| `sqlglot.parse` | 结构化校验 | 正则挡不住 `SELECT ...; DROP`，AST 能看语句数量与类型 |
| 表白名单 | 防越权 | 模型会“好心”去查用户表拿手机号 |
| `MAX_EXECUTION_TIME` | 查询超时 | 大表笛卡尔积能拖垮数据库 |
| `fetchmany(200)` | 结果限流 | 防止一次拉几十万行打爆内存与前�� |
| `asyncio.to_thread` | 同步 IO 不堵循环 | 模型与驱动多为同步库，直接调会把协程串行化 |
| `StreamingResponse` | SSE | 思考过程逐步展示，用户愿意等 |
| `EventSource` | 前端消费 | 自带断线重连，比手写 WebSocket 省事 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>用执行结果判断对错</b>：SQL 能跑不等于答对问题，必须让用户看到 SQL 与口径说明。</li>
<li><b>只校验关键字</b>：注释、函数、子查询都能绕过黑名单，必须以 AST 为主。</li>
<li><b>归因没有对比基准</b>：只说“直播跌了”，没说“相对上周跌了 42%”，结论没有信息量。</li>
<li><b>SSE 被 Nginx 缓冲</b>：所有事件一次性到达，必须 <code>proxy_buffering off</code>。</li>
<li><b>把 Redis 当数据库</b>：缓存只放聚合结果和会话，明细仍要回源。</li>
</ul>
</div>

### 模块4：大模型微调

**解决什么问题**：通用模型不知道你们公司的黑话、回复格式、拒答边界。提示词能解决一部分，但当风格要求稳定、任务固定、数据量大时，微调更划算。反过来，如果需求是“知道最新政策”，微调是错误工具。

**核心概念**：

| 概念 | 一句话解释 | 关键参数/工具 |
|-|-|-|
| SFT | 监督微调，用“问题-标准答案”教模型 | 数据质量 > 数据数量 |
| 全参数微调 | 更新所有参数 | 显存需求最高，小模型才考虑 |
| PEFT | 参数高效微调的总称 | 只训练少量新增参数 |
| LoRA | 冻结底座，旁路加低秩矩阵 | `r` 容量、`alpha` 缩放 |
| QLoRA | 底座 4bit 量化后再 LoRA | NF4 + 双重量化，单卡可跑 7B |
| ZeRO | 把优化器状态/梯度/参数切分到多卡 | stage 1/2/3，stage 3 最省显存 |
| Accelerate | 统一多卡与混合精度启动层 | 一行命令切换单机多卡 |
| Unsloth | 优化过的训练内核 | 单卡提速明显，兼容有限 |
| LLaMA-Factory | 训练/评估/导出一体化脚手架 | yaml 配置，最适合交付 |
| vLLM | 推理部署优化：高吞吐引擎 | PagedAttention，OpenAI 兼容 |

```json
{"messages": [{"role": "system", "content": "你是掌柜智库客服，只回答商品、订单与售后问题，不确定时建议转人工。"}, {"role": "user", "content": "耳机进水还能保修吗？"}, {"role": "assistant", "content": "进水属于人为损坏，不在免费保修范围内。若购买了意外保，可在订单详情页申请理赔；没有意外保可付费维修。"}]}
```

```yaml
# train_lora.yaml：LLaMA-Factory 训练配置，一条命令跑完 SFT
model_name_or_path: Qwen/Qwen2.5-7B-Instruct
stage: sft
do_train: true
finetuning_type: lora          # 全参改成 full
lora_rank: 8
lora_alpha: 16
lora_dropout: 0.05
lora_target: all               # 所有线性层都加，效果通常更稳
dataset: zhanggui_sft          # 对应 data/dataset_info.json 的注册名
template: qwen
cutoff_len: 2048
per_device_train_batch_size: 2
gradient_accumulation_steps: 8 # 等效 batch = 16
learning_rate: 1.0e-4
num_train_epochs: 3
bf16: true
output_dir: saves/qwen2.5-7b-lora
```

```json
{"bf16": {"enabled": "auto"},
 "zero_optimization": {"stage": 3, "offload_optimizer": {"device": "cpu"}, "overlap_comm": true},
 "train_batch_size": "auto"}
```

```bash
# 1. 训练：单卡直接跑，多卡加 --deepspeed ds_zero3.json
llamafactory-cli train train_lora.yaml

# 2. 合并 adapter 与底座，导出完整模型
llamafactory-cli export --model_name_or_path Qwen/Qwen2.5-7B-Instruct \
  --adapter_name_or_path saves/qwen2.5-7b-lora --export_dir models/zhanggui-merged

# 3. 部署：对外暴露 OpenAI 兼容接口
vllm serve models/zhanggui-merged --served-model-name zhanggui \
  --max-model-len 8192 --gpu-memory-utilization 0.9 --port 8000
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `messages` 三段式 | 训练样本格式 | 与推理时的 chat template 保持一致 |
| `finetuning_type: lora` | 选 PEFT | 显存有限时先跑通再谈上限 |
| `lora_target: all` | 注入范围 | 只加 q/v 省显存，全加效果更稳 |
| `gradient_accumulation_steps` | 模拟大 batch | 小显存下稳定训练的标准手段 |
| `zero stage 3 + offload` | 多卡省显存 | 用通信和 CPU 换显存，单机多卡常用 |
| `vllm serve` | 生产推理 | 吞吐远高于 transformers 逐条生成 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>用模型自己生成的答案训练</b>：错误会被固化，SFT 数据必须人工或强模型校验过。</li>
<li><b>不保留系统提示</b>：训练时没有 system，推理时加了，分布不一致，效果明显变差。</li>
<li><b>学习率照搬全参</b>：LoRA 常用 1e-4~2e-4，用 1e-5 几乎学不动。</li>
<li><b>只看 train loss</b>：loss 降但回答变啰嗦是常见退化，必须留验证集。</li>
<li><b>忘记合并或挂载 adapter</b>：直接加载底座推理，等于没训。</li>
</ul>
</div>

### 模块5：项目实战三 微调实战（三选一）

**解决什么问题**：真正交付一次微调，难点不在敲命令，而在“数据从哪来、怎么清洗、怎么证明有用”。这一模块把前面模块的数据、评测、部署串成一次包含评估工作流的完整交付。

**核心概念**：

| 选项 | 数据来源 | 微调目标 | 主评估指标 |
|-|-|-|-|
| 掌柜智库 | 历史客服会话 + 人工修订 | 固定话术、拒答边界 | 事实命中率、越权回答率 |
| 电商小二 | 对话日志 + 槽位标注 | 意图与实体更准 | 意图准确率、槽位 F1 |
| 智数归因 | 问题-SQL 对 + 执行结果 | SQL 方言与口径 | 执行成功率、结果一致率 |

```python
# build_dataset.py：把线上日志清洗成 SFT 数据
import json

SYSTEM = "你是掌柜智库客服，只回答商品、订单与售后问题，不确定时建议转人工。"


def to_sample(log):
    return {"messages": [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": log["question"].strip()},
        {"role": "assistant", "content": log["answer"].strip()},
    ]}


seen, kept = set(), 0
with open("data/raw_chat.jsonl", encoding="utf-8") as fin, \
     open("data/train.jsonl", "w", encoding="utf-8") as fout:
    for line in fin:
        log = json.loads(line)
        if not log.get("accepted") or len(log["answer"]) < 20:   # 人工认可 + 长度过滤
            continue
        key = log["question"].strip()
        if key in seen:                                          # 去重，防背题
            continue
        seen.add(key)
        fout.write(json.dumps(to_sample(log), ensure_ascii=False) + "\n")
        kept += 1
print("可用样本", kept)
```

```python
# evaluate.py：同一批问题对比底座与微调模型，按关键事实打分
import json
import requests


def ask(model: str, question: str) -> str:
    resp = requests.post("http://127.0.0.1:8000/v1/chat/completions", json={
        "model": model, "temperature": 0,
        "messages": [{"role": "user", "content": question}],
    }, timeout=30)
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


tests = [json.loads(l) for l in open("data/eval.jsonl", encoding="utf-8")]
for model in ("Qwen/Qwen2.5-7B-Instruct", "zhanggui"):
    hit = 0
    for t in tests:
        out = ask(model, t["q"])
        hit += all(k in out for k in t["must_include"])   # 关键事实必须出现
    print(model, f"{hit}/{len(tests)}", f"{hit / len(tests):.1%}")
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `accepted` 过滤 | 只学被认可的答案 | 线上原样回答里有大量错误与敷衍 |
| 问题去重 | 防背题 | 重复样本会让模型记住特定问法 |
| 固定 system | 与推理一致 | system 是最省力的行为约束 |
| `temperature: 0` | 评测可复现 | 随机采样会让对比结果抖动 |
| `must_include` | 事实级评分 | 比 BLEU 更贴近客服场景 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>样本量不足就宣称有效</b>：几十条数据只能做流程验证，不能下结论。</li>
<li><b>测试问题来自训练集</b>：准确率 100% 也没意义，必须留出未见过的问题。</li>
<li><b>只比平均分</b>：要看哪类问题变差，往往“更听话”的代价是“更啰嗦”。</li>
<li><b>不记录显存与耗时</b>：交付时要说明成本，否则无法上线评审。</li>
</ul>
</div>

## 综合实战

做一个“一句话问数并流式归因”的最小闭环：前端一句话，后端校验 SQL、查数、算贡献度、逐条推送。为了让例子真能跑，这里用 SQLite 代替数仓，并省略大模型生成 SQL 的一步（固定语句），其余链路完整。

### 步骤1：初始化演示数据

```python
# init_db.py
import sqlite3

conn = sqlite3.connect("demo.db")
conn.executescript("""
CREATE TABLE IF NOT EXISTS dwd_order (
  order_id INTEGER PRIMARY KEY, channel TEXT NOT NULL,
  amount REAL NOT NULL, prev_amount REAL NOT NULL, pay_time TEXT NOT NULL);
DELETE FROM dwd_order;
INSERT INTO dwd_order VALUES
 (1, '直播', 1200, 1800, '2026-11-15'), (2, '搜索', 900, 850, '2026-11-16'),
 (3, '私域', 600, 400, '2026-11-17'), (4, '直播', 300, 700, '2026-11-18');
""")
conn.commit()
conn.close()
```

### 步骤2：写校验、查询、归因三个函数

```python
# analytics.py
import sqlite3

import sqlglot
from sqlglot import exp

DB = "demo.db"
ALLOWED_TABLES = {"dwd_order"}
FORBIDDEN_WORDS = ("insert", "update", "delete", "drop", "alter", "attach", "pragma")


def validate_sql(sql: str) -> str:
    trees = sqlglot.parse(sql, read="sqlite")
    if len(trees) != 1 or not isinstance(trees[0], exp.Select):
        raise ValueError("只允许单条 SELECT")
    tables = {t.name.lower() for t in trees[0].find_all(exp.Table)}
    if not tables <= ALLOWED_TABLES:
        raise ValueError(f"越权表：{tables - ALLOWED_TABLES}")
    if any(w in sql.lower() for w in FORBIDDEN_WORDS):
        raise ValueError("包含危险关键字")
    return trees[0].sql(dialect="sqlite")


def run_sql(sql: str) -> list[dict]:
    conn = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)   # 只读连接，物理层再保一道
    conn.row_factory = sqlite3.Row
    try:
        return [dict(r) for r in conn.execute(sql).fetchmany(200)]
    finally:
        conn.close()


def attribute(rows: list[dict]) -> dict:
    deltas = {r["channel"]: round(r["cur"] - r["prev"], 2) for r in rows}
    total = sum(deltas.values())
    detail = [{"channel": k, "delta": v,
               "contribution": round(v / total, 4) if total else 0.0}
              for k, v in sorted(deltas.items(), key=lambda x: x[1])]
    return {"total_delta": round(total, 2), "detail": detail}
```

### 步骤3：暴露 SSE 接口

```python
# app.py
import asyncio
import json

from fastapi import FastAPI
from fastapi.responses import StreamingResponse

from analytics import attribute, run_sql, validate_sql

app = FastAPI()


def sse(event: str, data) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@app.get("/api/ask/stream")
async def ask_stream(q: str):
    async def gen():
        yield sse("plan", {"steps": ["解析口径", "生成 SQL", "安全校验", "查询", "归因"]})
        # 简化实现：真实项目由模型按 schema 生成 SQL
        sql = ("SELECT channel, SUM(amount) AS cur, SUM(prev_amount) AS prev "
               "FROM dwd_order WHERE pay_time >= '2026-11-01' GROUP BY channel")
        try:
            safe_sql = validate_sql(sql)
        except ValueError as e:
            yield sse("error", {"msg": str(e)})
            return
        yield sse("sql", {"sql": safe_sql})
        rows = await asyncio.to_thread(run_sql, safe_sql)
        yield sse("data", rows)
        yield sse("attribution", await asyncio.to_thread(attribute, rows))
        yield sse("answer", {"text": "直播渠道环比减少 1000 元，是本次下滑主因，建议核查投放与库存。"})
    return StreamingResponse(gen(), media_type="text/event-stream")
```

### 步骤4：前端逐事件渲染

```tsx
// AskPanel.tsx
import { useEffect, useState } from "react";

export default function AskPanel({ question }: { question: string }) {
  const [sql, setSql] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const es = new EventSource(`/api/ask/stream?q=${encodeURIComponent(question)}`);
    es.addEventListener("sql", (e) => setSql(JSON.parse(e.data).sql));
    es.addEventListener("answer", (e) => { setAnswer(JSON.parse(e.data).text); es.close(); });
    es.addEventListener("error", () => es.close());
    return () => es.close();
  }, [question]);

  return <div><pre>{sql}</pre><p>{answer}</p></div>;
}
```

### 步骤5：启动并验证

```bash
python init_db.py
pip install fastapi uvicorn sqlglot
uvicorn app:app --port 8000
curl -N "http://127.0.0.1:8000/api/ask/stream?q=上周各渠道销售额变化"
```

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `init_db.py` | 准备可复现数据 | 演示环境必须一条命令重建 |
| `validate_sql` | 安全入口 | 与生产同一套逻辑，演示不降标准 |
| `mode=ro` | 数据库层只读 | 应用层校验被绕过后仍有兜底 |
| `asyncio.to_thread` | 不阻塞事件循环 | sqlite 是同步库，直接调用会卡住 SSE |
| `yield sse(...)` | 分阶段推送 | 前端能看到“正在校验”“正在归因” |
| `EventSource` | 接收流 | 浏览器原生支持，代码量最小 |
| `curl -N` | 命令行验收 | 关闭缓冲，直接看到流式输出 |

## 疑难点分级

| 知识点 | 难度 | 典型卡点 | 破解方式 |
|-|-|-|-|
| 意图识别 | 中 | “退货政策”被识别成“我要退货” | 补对比样本，区分咨询与办理两类 |
| 槽位设计 | 中 | 槽位太多，追问到用户失去耐心 | 只留必填槽位，其余从上下文推断 |
| DIET 训练 | 高 | 数据少时过拟合，验证集虚高 | 交叉验证 + 早停，数据量不少于类别数 10 倍 |
| Rule 与 TED 冲突 | 高 | 规则和模型抢下一步，对话来回跳 | 规则只锁关键路径，其余交给 TED |
| 多轮记忆 | 高 | 轮次一多就跑题 | 摘要 + 最近 8 轮 + 关键槽位固定注入 |
| 自定义 action 超时 | 中 | 外部接口慢导致会话卡死 | 全部设 timeout，失败走兜底话术 |
| Schema prompt | 高 | 模型用错字段或写错方言 | 字段注释、枚举值、示例 SQL 一起给 |
| SQL AST 校验 | 高 | 只做正则被多语句绕过 | sqlglot 解析 + 单语句 + 白名单 |
| 归因口径 | 高 | 结论与业务方理解不一致 | 输出固定展示 SQL、时间范围、对比基准 |
| 混合检索配置 | 中 | 只留向量，指标名召不回 | BM25 与向量并行，RRF 融合后重排 |
| AsyncIO 误用 | 中 | 协程里调同步库，全部串行 | 同步 IO 一律 `to_thread` |
| SSE 断流 | 中 | Nginx 缓冲导致一次蹦出全部 | `proxy_buffering off` + 心跳 |
| 数据集构造 | 高 | 直接拿线上回答训练，错误被固化 | 人工抽检 + 强模型清洗 + 去重 |
| LoRA 参数 | 高 | 效果差或显存爆 | 从 r=8、alpha=16 起步，先小后大 |
| QLoRA 精度 | 中 | 全 4bit 后效果明显掉 | `bnb_4bit_compute_dtype` 用 bf16 |
| 微调评估 | 高 | 只看 loss 或平均分 | 固定评测集 + 分类看 + 人工盲评 |

## 阶段项目

### 项目一：电商小二（任务型客服）

**背景**：电商售后人力成本高，80% 的咨询是查订单、问物流、办退换货，适合先自动化。

**功能清单**：意图识别与槽位抽取；订单查询、物流查询、退换货三个外部 API；退款前强制确认订单归属；超过 6 轮自动摘要历史；接口异常兜底话术；对话日志落库供复盘。

**技术选型**：Rasa 3.6 + DIET（Sparse/Dense 双特征）+ RulePolicy/TEDPolicy 混合；Action Server 用 FastAPI 写订单 mock；MySQL 存对话日志；Docker Compose 一键起。

**验收标准**：20 条标注句意图准确率不低于 90%；10 轮混合对话不错乱；订单接口超时 3 秒内给出兜底回复；退款流程未确认订单号时不允许提交。

**评分点**：槽位设计是否最小必要（20 分）；规则与模型的边界是否清晰（25 分）；外部接口异常处理（20 分）；多轮回归用例质量（20 分）；代码结构与可演示性（15 分）。

### 项目二：智数归因平台

**背景**：运营每天追问“为什么跌”，数据团队疲于拉数，需要自助取数并自动归因的平台。

**功能清单**：自然语言问数；SQL 生成与 AST 校验；只读执行与超时限制；按渠道/地区/品类多维度归因；SSE 流式展示思考过程；SQL 与口径可追溯；结果缓存。

**技术选型**：FastAPI + AsyncIO；Qdrant 存指标与字段说明向量，ES 做关键词召回；MySQL 存明细；Redis 缓存聚合结果；React + TypeScript 前端；SSE 推送，需要双向交互时换 WebSocket。

**验收标准**：50 条测试问题执行成功率不低于 85%；危险 SQL 拦截率 100%；单次问答 P95 不超过 8 秒；前端能逐步看到 plan/sql/data/attribution；每条结论都能点开看到对应 SQL。

**评分点**：安全链路完整性（30 分）；归因结论可解释性（25 分）；并发与流式体验（20 分）；混合检索效果（15 分）；前端交互（10 分）。

### 项目三：微调实战（三选一）

**背景**：通用模型回复风格不稳定，拒答边界模糊，需要一次可量化的领域适配。

**功能清单**：数据清洗与去重脚本；训练/验证/测试三份数据；LoRA 或 QLoRA 训练；adapter 合并与 vLLM 部署；基线与微调模型对比报告；显存与耗时记录。

**技术选型**：LLaMA-Factory + Qwen2.5-7B-Instruct；单卡 QLoRA，或双卡 ZeRO-3 全参对照；vLLM 部署为 OpenAI 兼容服务；评测脚本固定温度与提示。

**验收标准**：训练集不少于 1000 条且人工抽检合格率 90% 以上；测试集与训练集无重叠；关键事实命中率相对基线提升 10 个百分点以上；报告含失败案例分析；服务可被现有中台直接调用。

**评分点**：数据质量与合规（30 分）；训练配置合理性（25 分）；评估严谨性（25 分）；部署可用性（10 分）；成本说明（10 分）。

## 常见面试题

### 问题1：任务型对话和闲聊机器人的核心区别是什么？

答案要点：任务型有明确目标和流程状态，需要意图、槽位、策略、外部动作；闲聊只需生成合理回复。任务型必须可回滚、可兜底、可审计，关键路径通常用规则锁定，模型负责理解与开放表达。

### 问题2：为什么 DIET 要同时用 Sparse 和 Dense 特征？

答案要点：Sparse（字符 n-gram、词典、正则）对专有名词、订单号、关键词敏感且小样本稳定；Dense（预训练向量）泛化好，能处理同义表达。两者拼接后 DIET 同时做意图分类与实体抽取，共享表示，比两个独立模型更省资源。

### 问题3：RulePolicy 和 TEDPolicy 怎么分工？

答案要点：RulePolicy 管确定性流程与安全边界，比如退款前必须确认订单号、急症必须先给急救提示；TEDPolicy 学多轮策略，处理规则没覆盖的开放表达。冲突时规则优先，所以规则要少而关键，否则对话会僵化。

### 问题4：多轮对话怎么防止上下文无限增长？

答案要点：三层：槽位固定保存关键事实；只保留最近 N 轮原文；更早的对话压成摘要写入独立槽位或外部存储。检索时按需回捞，而不是把所有历史塞进 prompt。

### 问题5：NL2SQL 最大的风险是什么，怎么防？

答案要点：风险是生成越权、危险或错误的 SQL。防线：AST 解析只允许单条 SELECT；表与字段白名单；只读账号；查询超时与结果行数上限；SQL 回显给用户确认口径；高风险问题转人工。

### 问题6：归因分析怎么保证结论可信？

答案要点：结论必须绑定 SQL、时间范围、对比基准和维度拆解方法；贡献度之和要与总变化对得上；异常维度要能下钻到明细；多次运行结果稳定；必要时用独立口径交叉验证。

### 问题7：为什么要用 AsyncIO 和 SSE，而不是一次性返回？

答案要点：问数涉及模型调用、多表查询、归因计算多个 IO，串行耗时长；AsyncIO 让独立步骤并发。SSE 把计划、SQL、数据、结论分阶段推送，用户能感知进度，也比 WebSocket 更轻。

### 问题8：什么时候应该微调，什么时候用 RAG 或提示词？

答案要点：知识频繁更新、需要引用出处用 RAG；输出格式与口吻约束用提示词；任务固定、风格稳定、数据量大且提示词难以约束时用微调；降低成本可用蒸馏或小模型微调。三者常组合使用。

### 问题9：LoRA 和 QLoRA 的区别，怎么选？

答案要点：LoRA 冻结底座、训练低秩旁路矩阵；QLoRA 先把底座量化到 4bit（NF4）再训练 LoRA，显存大幅下降。显存紧、先验证可行性选 QLoRA；追求效果上限、显存充足选 LoRA 或全参。QLoRA 计算精度用 bf16，避免量化误差累积。

### 问题10：ZeRO 的三个 stage 分别切什么？

答案要点：stage 1 切优化器状态；stage 2 再切梯度；stage 3 再切模型参数，并在前向/反向按需通信。stage 越大越省显存，通信开销越高。单机多卡常用 stage 2/3，配合 CPU offload 进一步省显存但会变慢。

## 动手练习

<div class="callout task"><span class="tag">动手练习</span>
<ol>
<li>给电商小二补 20 条“我要退货”的口语说法，观察意图准确率变化。</li>
<li>故意把订单接口改成超时 10 秒，验证兜底话术是否生效。</li>
<li>设计一个“改地址”意图，写出需要的槽位与规则流程。</li>
<li>构造 5 条多轮对话，覆盖用户中途改主意，加入回归集。</li>
<li>把电商小二复制成尚医助手，只改意图、槽位与免责声明，跑通挂号流程。</li>
<li>为 NL2SQL 写 10 条危险请求（多语句、越权表、写操作），验证全部被拦截。</li>
<li>给 SQL 加 5 秒超时与 200 行上限，构造大结果集测试。</li>
<li>实现按地区、渠道两个维度的归因，对比结论差异。</li>
<li>把 SSE 接口改成带心跳，验证 Nginx 代理下不会断流。</li>
<li>从对话日志构造 300 条 SFT 数据，统计去重前后的数量。</li>
<li>用 QLoRA 在单卡训一次 7B，记录可训练参数占比与峰值显存。</li>
<li>对比 LoRA 的 r=4 与 r=16，在同一评测集上看差异。</li>
</ol>
</div>

## 阶段小结

- 任务型对话的核心不是生成，而是状态：意图、槽位、策略、动作四件套，关键路径用规则锁死。
- Sparse 与 Dense 特征互补，DIET 一个模型同时做意图与实体，小样本场景更划算。
- 长上下文靠“槽位 + 最近 N 轮 + 摘要”三层控制，不要把历史全塞进 prompt。
- NL2SQL 的价值在可靠：AST 校验、白名单、只读账号、超时与行数上限，一个都不能少。
- 归因结论必须可追溯，SQL、口径、对比基准要一起呈现给用户。
- AsyncIO 解决 IO 并发，SSE 解决等待焦虑，两者是问数产品的体验底座。
- 微调解决风格与稳定任务，不解决知识更新；数据质量比训练技巧更决定上限。
- LoRA/QLoRA 让单卡训练成为可能，ZeRO 让多卡更省显存，vLLM 让推理成本可控。
- 没有评测集就没有微调，报告里必须同时有提升项与退化项。

下一阶段进入多智能体高阶实战：把这里的对话、取数、微调能力拆成多个可协作的 Agent，用状态图编排、断点恢复与流式推送，做出企业级复杂系统。
