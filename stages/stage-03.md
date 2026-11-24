## 阶段导读

这是整门课最核心、也最能拉开差距的阶段。前两个阶段解决“代码能跑、服务能上线”，从这个阶段开始，你要解决的是：**怎么让大模型稳定地完成一件多步骤的事**。会调 API 不叫会做智能体，能把不可控的模型装进可控的工程框架里，才叫会做智能体。

这一阶段围绕四个词展开：**架构、管控、循环、编排**。架构回答“Agent 由哪些零件组成”（模型、提示词、工具、记忆、规划）；管控回答“怎么不让它越权、失控、烧钱”（Harness）；循环回答“它怎么一轮轮干活、失败怎么重试与回滚”（Loop）；编排回答“多个 Agent 怎么分工协作”（多智能体）。最后用 LangChain 与 LangGraph 两大框架把这些思想落成代码，再补上可观测、可评测、可部署的工程化能力。

学完你应该能做到：写出带 Function Call 的工具调用闭环；用提示词约束模型输出稳定的 JSON；设计工作记忆、会话记忆、长期记忆三层结构；给 Agent 加权限白名单、轮次上限、超时与审计日志；实现 Think-Act-Observe 循环并处理异常重试；用 LangGraph 编排带分支、循环、断点恢复的状态图；用 Trace 定位一次失败到底错在哪一步；用 Ragas 指标评估 RAG 链路质量。

最容易踩的坑有五个。第一，**只写提示词不做工程约束**，Demo 很惊艳，一上真实数据就胡编、越权、死循环。第二，**把所有历史对话塞进上下文**，token 爆掉、成本飙升、模型反而抓不住重点。第三，**循环没有终止条件**，Agent 自己调用自己几十轮，账单和延迟一起爆炸。第四，**工具描述写得含糊**，模型选错工具或传错参数，然后你以为是模型不行。第五，**没有 Trace**，线上答错时只能靠猜，无法定位是检索、提示词还是工具的问题。

<div class="callout plain"><span class="tag">大白话</span><p>大模型像一个能力很强但刚入职的实习生：知识面广、反应快，但不知道公司规矩、记不住上周的事、也不会主动承认自己不确定。Harness 是员工手册和门禁，Loop 是工作流程，记忆分层是工作笔记，多智能体是项目组分工。你做的不是“更聪明的模型”，而是“让普通模型稳定干活的组织”。</p></div>

## 教学路径

<div class="callout path"><span class="tag">教学路径</span><ol class="path-steps"><li><b>第 1 步（3 天）：</b>提示词入门与结构化输出，能稳定产出可解析的 JSON，产出：一套客服系统提示词模板。</li><li><b>第 2 步（4 天）：</b>Agent 构成与 Function Call，跑通“模型决定调工具 → 执行 → 结果回灌”的闭环，产出：带 3 个工具的查询助手。</li><li><b>第 3 步（2 天）：</b>规划执行与记忆机制，理解 ReAct 与 Plan-and-Execute 的差别，产出：带摘要记忆的多轮对话。</li><li><b>第 4 步（2 天）：</b>MCP 与 Skill 的概念与接入方式，产出：把本地工具暴露为 MCP 服务的方案。</li><li><b>第 5 步（4 天）：</b>Harness：权限、记忆分层、技能生命周期、预算与审计，产出：一个带管控壳的 Agent 运行器。</li><li><b>第 6 步（5 天）：</b>Loop：Think-Act-Observe、任务拆解、异常重试、自我修正、回滚，产出：可恢复的任务循环。</li><li><b>第 7 步（4 天）：</b>多智能体：角色划分、消息总线、通信编排与冲突处理，产出：三角色协作 Demo。</li><li><b>第 8 步（6 天）：</b>LangChain：模型 IO、提示模板、输出解析、Chains、Memory、ReAct、RAG，产出：电商商家对话助手。</li><li><b>第 9 步（6 天）：</b>LangGraph：State / Node / Edge、条件边、持久化、流式输出，产出：内部文档查询助手。</li><li><b>第 10 步（4 天）：</b>工程化：Trace、Ragas 评测、服务拆分与部署，产出：可观测、可评测的上线方案。</li></ol></div>

## 学习前准备

### 前置知识

必须完成阶段 01 与 02：能写类与装饰器、能写 FastAPI 接口、理解 HTTP 与 JSON、会用 Docker 起依赖。还需要能读懂英文报错，并准备好一个可用的模型 API（OpenAI 兼容协议即可，国内模型平台大多兼容）。

### 环境与软件清单

| 软件 / 服务 | 建议版本 | 用途 |
|-|-|-|
| Python | 3.11 / 3.12 | 开发语言 |
| OpenAI 兼容模型 API | 任选 | 对话与函数调用 |
| `openai` SDK | 1.x | 直接调用模型 |
| `langchain` / `langchain-openai` | 0.3.x | 链式编排与工具封装 |
| `langgraph` | 0.2.x 以上 | 状态图编排 |
| `chromadb` 或 Qdrant | 最新 | 向量检索 |
| `ragas` | 最新 | RAG 评测 |
| LangSmith（可选） | 云端 | Trace 与调试 |
| Docker | 最新版 | 部署向量库与推理服务 |

<div class="callout tip"><span class="tag">老师建议</span><p>所有模型调用都通过环境变量配置 <code>OPENAI_BASE_URL</code> 与 <code>OPENAI_API_KEY</code>，代码里不要写死厂商。这样换模型只改配置，阶段 06 做多模型拆分时也不用重写业务代码。</p></div>

### 三道自测题

1. 模型返回了一段带 Markdown 围栏的 JSON，你如何稳定解析并处理解析失败？
2. 一个 Agent 连续调用了 8 次工具还没给出答案，你会加哪些限制？分别防的是什么问题？
3. 用户问“上个月买的耳机能退吗”，这个问题需要哪几类信息才能回答？对应 Agent 的哪些组件？

## 模块精讲

### 模块1：智能体架构

**解决什么问题**

单次问答只能处理“一问一答”。真实任务是“查订单 → 判断是否符合退款规则 → 调用退款接口 → 回复用户”这种多步骤流程。智能体架构解决的是：让模型不只是生成文字，而是能**决定调用什么工具、按什么顺序做、记住做过什么**。

**核心概念**

- 提示词四要素：角色（你是谁）、任务（做什么）、约束（不能做什么）、输出格式（怎么返回）。缺一个，输出就不稳定。
- Agent 五个零件：模型（大脑）、提示词（岗位说明书）、工具（手脚）、记忆（笔记）、执行器（调度 Loop）。
- Function Call：模型不直接执行函数，而是返回“要调用哪个函数、参数是什么”，由你的代码执行后把结果回灌给模型。
- 规划执行：ReAct 是“边想边做”，适合步骤不确定；Plan-and-Execute 是“先列计划再执行”，适合步骤多且可并行的任务。
- 记忆机制：短期（当前上下文）、会话（多轮摘要）、长期（用户偏好与历史结论，通常放向量库）。
- MCP：Model Context Protocol，把工具与资源以标准协议暴露给任意支持它的客户端，避免每个框架各写一套适配。
- Skill：可复用的能力包，包含提示词、工具、脚本与验收标准，比单个工具更接近“一项完整技能”。

**关键代码**

```python
# agent_loop.py：最小可运行的 Function Call 闭环
import json
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
    base_url=os.environ.get("OPENAI_BASE_URL"),   # 兼容国内模型平台
)

# 工具的真实实现：模型只负责“决定调用”，执行永远在你的代码里
def get_order(order_id: str) -> dict:
    fake_db = {"A1001": {"status": "paid", "amount": 299, "days": 12}}
    return fake_db.get(order_id, {"error": "订单不存在"})

def refund(order_id: str) -> dict:
    return {"ok": True, "order_id": order_id, "msg": "退款已受理"}

TOOLS = {"get_order": get_order, "refund": refund}

# 给模型看的工具描述：名字、用途、参数 schema 都要清楚
TOOL_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "get_order",
            "description": "根据订单号查询订单状态、金额与购买天数",
            "parameters": {
                "type": "object",
                "properties": {"order_id": {"type": "string", "description": "订单号，如 A1001"}},
                "required": ["order_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "refund",
            "description": "对指定订单发起退款，仅当订单已支付且购买不超过 7 天时调用",
            "parameters": {
                "type": "object",
                "properties": {"order_id": {"type": "string"}},
                "required": ["order_id"],
            },
        },
    },
]

SYSTEM_PROMPT = """你是电商客服助手。
规则：
1. 涉及订单必须先调用 get_order 查询，禁止编造订单信息。
2. 只有 status=paid 且 days<=7 才能调用 refund。
3. 信息不足时向用户提问，不要猜测。
4. 最终回答不超过 120 字，先给结论再给理由。"""

def run_agent(user_input: str, max_rounds: int = 5) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_input},
    ]
    for _ in range(max_rounds):                    # 轮次上限，防止死循环
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=TOOL_SCHEMA,
            tool_choice="auto",
            temperature=0,
        )
        msg = resp.choices[0].message
        if not msg.tool_calls:                     # 没有工具调用 = 给出最终答案
            return msg.content or ""

        messages.append(msg.model_dump(exclude_none=True))
        for call in msg.tool_calls:
            name = call.function.name
            args = json.loads(call.function.arguments or "{}")
            try:
                result = TOOLS[name](**args)
            except Exception as e:                 # 工具异常要回灌给模型，而不是直接崩
                result = {"error": str(e)}
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": json.dumps(result, ensure_ascii=False),
            })
    return "抱歉，处理步骤过多，请转人工客服。"
```

```python
# 记忆：只保留最近 N 轮 + 一段滚动摘要，避免上下文无限膨胀
def trim_messages(messages: list[dict], keep_last: int = 6) -> list[dict]:
    system = [m for m in messages if m["role"] == "system"]
    dialog = [m for m in messages if m["role"] != "system"]
    if len(dialog) <= keep_last:
        return system + dialog
    summary = {"role": "system", "content": "前文摘要：用户已咨询订单 A1001 的退款政策。"}
    return system + [summary] + dialog[-keep_last:]
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `tools` + `tool_choice` | 声明可用工具 | 模型只能从声明过的工具里选，不能凭空造 |
| `description` 写清触发条件 | 提高选工具准确率 | 工具描述是模型唯一的判断依据，含糊就会选错 |
| `if not msg.tool_calls` | 终止条件 | 没有工具调用说明模型准备回答，循环结束 |
| 追加 `assistant` 消息 | 保留调用记录 | 回灌工具结果前必须先放模型的调用请求 |
| `role: tool` + `tool_call_id` | 结果与调用配对 | 一次返回多个调用时，靠 id 对应，不能乱序 |
| `try/except` 转成错误 JSON | 工具容错 | 让模型知道“工具失败了”，它可以换方案或致歉 |
| `max_rounds` | 轮次上限 | 没有上限的 Agent 迟早遇到死循环 |
| `trim_messages` | 控制上下文 | 只保留最近几轮 + 摘要，兼顾成本与连贯性 |

<div class="callout tip"><span class="tag">老师建议</span><p>提示词里最重要的不是“你是一个专业的助手”，而是“禁止做什么”和“什么情况下必须停下来问”。模型胡编，八成是因为你没写“信息不足时必须询问用户”。把约束写成编号规则，比写一大段形容词有效得多。</p></div>

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>把工具执行写在“以为模型会执行”的地方。模型只返回调用意图，执行必须由你的代码完成。</li><li>工具返回非 JSON 字符串，回灌后模型解析困难，统一用 <code>json.dumps</code>。</li><li>一次返回多个 <code>tool_calls</code> 时只处理第一个，导致后续结果缺失。</li><li>工具描述写成“查询数据”，模型根本不知道查什么数据、什么时候该查。</li><li>把全部历史消息无限追加，几轮之后 token 超限或成本失控。</li><li>没有给模型“拒绝执行”的出口，遇到越权请求只能硬答。</li></ul></div>

### 模块2：智能体管控框架 Harness Engineering

**解决什么问题**

当 Agent 能调工具、能循环、能记忆之后，风险从“答得不好”升级为“做错事”：删了不该删的数据、调用了付费接口、把用户隐私发给外部模型、一个任务跑了半小时还在烧钱。Harness 就是套在 Agent 外面的管控层，规定它能做什么、能记多久、能跑多长、出事怎么追责。

**核心概念**

- Harness 五层：输入护栏（注入与越权请求拦截）、权限层（工具白名单与参数校验）、记忆层（分层存储与过期）、技能层（注册、启停、版本）、生命周期层（轮次、超时、预算、审批、审计）。
- 记忆分层：工作记忆（当前任务，内存）、会话记忆（摘要，Redis / DB）、长期记忆（偏好与结论，向量库）、技能记忆（工具成功率与用法，统计表）。
- 技能生命周期：注册 → 审核 → 启用 → 执行 → 评估 → 升级 / 退役。每个状态都要有明确准入条件。
- 权限模型：最小权限原则；高风险工具（退款、删除、发消息）必须二次确认或人工审批。
- 生命周期管控：最大轮次、最大时长、最大 token 预算、并发上限、失败熔断。
- 审计：每次工具调用记录 who / when / tool / args / result / cost，出问题能回溯。

**关键代码**

```python
# harness.py：一个可运行的管控壳
import json
import time
from dataclasses import dataclass, field
from enum import Enum

class SkillState(str, Enum):
    DRAFT = "draft"          # 草稿，不可用
    REVIEW = "review"        # 待审核
    ACTIVE = "active"        # 可用
    RETIRED = "retired"      # 已退役

@dataclass
class Skill:
    name: str
    risk: str = "low"                       # low / medium / high
    state: SkillState = SkillState.DRAFT
    success: int = 0
    fail: int = 0
    version: str = "1.0.0"

    @property
    def success_rate(self) -> float:
        total = self.success + self.fail
        return self.success / total if total else 0.0

class SkillRegistry:
    def __init__(self):
        self._skills: dict[str, Skill] = {}

    def register(self, skill: Skill) -> None:
        if skill.name in self._skills:
            raise ValueError(f"技能已存在：{skill.name}")
        self._skills[skill.name] = skill

    def activate(self, name: str) -> None:
        skill = self._skills[name]
        if skill.state != SkillState.REVIEW:     # 必须走完审核才能启用
            raise PermissionError(f"{name} 当前状态 {skill.state} 不允许启用")
        skill.state = SkillState.ACTIVE

    def get(self, name: str) -> Skill:
        skill = self._skills.get(name)
        if not skill or skill.state != SkillState.ACTIVE:
            raise PermissionError(f"技能不可用：{name}")
        return skill

@dataclass
class Budget:
    max_rounds: int = 8
    max_seconds: float = 30.0
    max_tokens: int = 20_000

@dataclass
class Audit:
    events: list[dict] = field(default_factory=list)

    def log(self, **kw) -> None:
        kw["ts"] = round(time.time(), 3)
        self.events.append(kw)

class Harness:
    """所有 Agent 调用都必须经过这里，不允许绕过"""
    DANGEROUS = {"refund", "delete_user", "send_mail"}

    def __init__(self, registry: SkillRegistry, budget: Budget | None = None):
        self.registry = registry
        self.budget = budget or Budget()
        self.audit = Audit()
        self.started = time.time()
        self.rounds = 0
        self.tokens = 0

    def before_call(self, tool: str, args: dict) -> None:
        self.rounds += 1
        if self.rounds > self.budget.max_rounds:
            raise TimeoutError("超过最大轮次，任务终止")
        if time.time() - self.started > self.budget.max_seconds:
            raise TimeoutError("超过最大执行时长，任务终止")
        skill = self.registry.get(tool)              # 未启用 / 未注册直接拒绝
        if skill.risk == "high" and not args.get("_confirmed"):
            raise PermissionError(f"高风险技能 {tool} 需要人工确认")
        self.audit.log(action="tool_call", tool=tool, args=args, version=skill.version)

    def after_call(self, tool: str, ok: bool) -> None:
        skill = self.registry._skills[tool]
        skill.success += int(ok)
        skill.fail += int(not ok)
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `SkillState` 枚举 | 技能状态机 | 避免“写完就能用”，强制经过审核与启用 |
| `register` 查重 | 防止覆盖 | 同名技能重复注册会让版本与审计混乱 |
| `activate` 校验状态 | 流程约束 | 只能在 `REVIEW` 状态启用，防止草稿直接上线 |
| `before_call` 统一入口 | 强制管控 | 只要所有调用都走这里，就不存在绕过权限的路径 |
| `_confirmed` 标记 | 二次确认 | 高风险操作需要人工或上层显式确认 |
| `time.time()` 计时 | 超时控制 | 防止模型陷入长时间循环 |
| `Audit.log` | 可追溯 | 出事时能还原“谁在什么时候调了什么、参数是什么” |
| `success_rate` | 技能评估 | 长期成功率低的技能应降级或退役 |

<div class="callout plain"><span class="tag">大白话</span><p>Harness 就是公司的门禁、审批单和监控。员工能力再强，也不能自己进机房、不能自己批预算、不能无限加班。把这些规则写进系统，而不是指望模型“自觉”。</p></div>

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>把权限判断写进提示词，以为模型会遵守。提示词只是建议，权限必须写在代码里。</li><li>只在入口做一次校验，循环中途换了工具就不再检查。</li><li>记忆不分层，所有内容都塞进上下文，成本高且干扰判断。</li><li>没有 token 预算，长对话把费用跑超。</li><li>审计只记录成功调用，失败与拒绝的调用同样要记，它们才是排障关键。</li><li>技能没有版本号，升级后无法对比效果，也无法回滚。</li></ul></div>

### 模块3：智能体任务循环 Loop Engineering

**解决什么问题**

Agent 真正干活的过程不是一次调用，而是“想一步、做一步、看结果、再决定下一步”。这个过程必须可拆解、可重试、可中断、可回滚，否则一个失败的工具调用就能让整个任务卡死或产生脏数据。Loop Engineering 解决的就是“让循环既跑得动，也停得住、退得回”。

**核心概念**

- Think-Act-Observe：思考（下一步做什么）→ 行动（调用工具）→ 观察（读取结果）→ 更新状态，循环直到完成或触发终止条件。
- 任务拆解：把大目标拆成有依赖关系的小步骤（DAG），能并行的并行，有依赖的串行。
- 异常重试：区分可重试错误（超时、限流、5xx）与不可重试错误（参数错、权限拒绝、404）。
- 自我修正：把失败原因喂回模型，让它改参数或换工具，但必须限制修正次数。
- 检查点：每完成一步保存状态，失败后从最近检查点恢复，而不是从头再来。
- 回滚：写操作前记录补偿动作（如“创建订单”对应“取消订单”），失败时按逆序补偿。
- 终止条件：任务完成、达到最大轮次、超时、预算耗尽、连续失败超过阈值。

**关键代码**

```python
# loop.py：Think-Act-Observe + 重试 + 检查点 + 回滚（简化实现）
import time
from dataclasses import dataclass, field

@dataclass
class Step:
    name: str
    tool: str
    args: dict
    compensate: str | None = None      # 补偿工具名，用于回滚

@dataclass
class LoopState:
    goal: str
    plan: list[Step] = field(default_factory=list)
    done: list[dict] = field(default_factory=list)
    failed: list[dict] = field(default_factory=list)

class Loop:
    RETRYABLE = {"timeout", "rate_limit", "server_error"}

    def __init__(self, tools: dict, max_rounds: int = 12, max_retry: int = 3):
        self.tools = tools
        self.max_rounds = max_rounds
        self.max_retry = max_retry

    def decompose(self, goal: str) -> list[Step]:
        # 真实实现调用模型输出计划 JSON；这里固定计划，便于演示
        return [
            Step("查库存", "check_stock", {"sku": "E1001"}),
            Step("锁库存", "lock_stock", {"sku": "E1001", "qty": 1}, compensate="unlock_stock"),
            Step("创建订单", "create_order", {"sku": "E1001", "qty": 1}, compensate="cancel_order"),
        ]

    def run(self, goal: str) -> LoopState:
        state = LoopState(goal=goal, plan=self.decompose(goal))
        for i, step in enumerate(state.plan):
            if i >= self.max_rounds:
                state.failed.append({"reason": "max_rounds"})
                self._rollback(state)
                return state
            ok = self._execute_with_retry(step, state)      # Think-Act-Observe 的单步封装
            if not ok:
                state.failed.append({"step": step.name, "reason": "unrecoverable"})
                self._rollback(state)                      # 失败后按逆序补偿
                return state
        return state

    def _execute_with_retry(self, step: Step, state: LoopState) -> bool:
        for attempt in range(1, self.max_retry + 1):
            try:
                result = self.tools[step.tool](**step.args)   # Act
                state.done.append({"step": step.name, "result": result})  # Observe
                return True
            except Exception as e:
                code = getattr(e, "code", "unknown")
                if code not in self.RETRYABLE:
                    return False                          # 不可重试，直接失败
                time.sleep(0.3 * 2 ** (attempt - 1))      # 指数退避
        return False

    def _rollback(self, state: LoopState) -> None:
        for item in reversed(state.done):                 # 逆序补偿
            step = next(s for s in state.plan if s.name == item["step"])
            if step.compensate:
                try:
                    self.tools[step.compensate](**step.args)
                except Exception:
                    pass                                  # 补偿失败要告警，不能静默吞
```

```python
# 防止“自我修正”无限循环：连续失败两次就停止
def correct(state: LoopState, feedback: str) -> str:
    if len(state.failed) >= 2:
        return "STOP"
    return feedback
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `decompose` 返回 Step 列表 | 任务拆解 | 每步都有工具、参数与补偿动作，便于重试与回滚 |
| `RETRYABLE` 白名单 | 区分错误类型 | 参数错误重试一百次也没用，只会浪费额度 |
| `2 ** (attempt - 1)` | 指数退避 | 避免限流时越重试压力越大 |
| `compensate` | 补偿动作 | 写操作必须能撤销，否则失败会留下脏数据 |
| `reversed(state.done)` | 逆序回滚 | 后做的先撤，符合依赖顺序 |
| `max_rounds` | 终止保险 | 任何循环都要有硬上限 |
| `correct` 的 `STOP` | 限制自我修正 | 反复修不好说明信息不足，应转人工 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>对所有异常都重试，把“参数错”也重试三次，浪费时间与费用。</li><li>只重试不记录，失败原因丢失，无法判断该改提示词还是改工具。</li><li>没有补偿动作，创建订单成功但后续步骤失败，留下半成品数据。</li><li>检查点只存内存，进程一重启全部丢失。</li><li>循环没有“连续失败”阈值，模型反复改参数直到轮次耗尽。</li></ul></div>

### 模块4：多智能体设计模式

**解决什么问题**

一个 Agent 既当客服、又当查库、又当审核，提示词会互相打架，工具权限也无法隔离。多智能体把复杂任务拆给多个角色，各自有独立提示词、工具与权限，通过消息协作。难点不在“多”，而在**角色边界、通信协议与冲突处理**。

**核心概念**

- 协作范式：主管-工人（Orchestrator-Worker）、流水线（Pipeline）、辩论（Debate）、黑板（Blackboard）。生产中最常用主管-工人。
- 角色划分：每个角色只给一个动词职责，如“检索”“审核”“生成”，不要出现“万能助手”。
- 消息总线：统一消息格式（发送者、接收者、类型、负载、会话 id），解耦 Agent 之间的直接调用。
- 通信编排：串行（有依赖）、并行（互不依赖）、条件路由（按结果决定下一个角色）。
- 冲突处理：投票、优先级仲裁、主管裁决、超时兜底；写操作必须做幂等。
- 共享状态：通过会话 id 关联同一任务，避免消息串线。

**关键代码**

```python
# bus.py：基于 asyncio.Queue 的消息总线（简化实现）
import asyncio
from dataclasses import dataclass, field

@dataclass
class Message:
    sender: str
    topic: str
    payload: dict
    session_id: str

class Bus:
    def __init__(self):
        self.queues: dict[str, asyncio.Queue] = {}
        self.history: list[Message] = []

    def register(self, name: str) -> asyncio.Queue:
        q = asyncio.Queue()
        self.queues[name] = q
        return q

    async def publish(self, msg: Message) -> None:
        self.history.append(msg)                 # 全量留痕，便于回放与排障
        for name, q in self.queues.items():
            if name != msg.sender:               # 不回发给发送者
                await q.put(msg)

async def worker(name: str, bus: Bus, handler):
    q = bus.register(name)
    while True:
        msg = await q.get()
        reply = await handler(msg)
        if reply:
            await bus.publish(reply)

# 角色 1：检索，只负责找资料
async def retriever(msg: Message):
    if msg.topic != "question":
        return None
    docs = [f"文档片段：{msg.payload['q']} 的相关说明"]
    return Message("retriever", "evidence", {"docs": docs}, msg.session_id)

# 角色 2：审核，只负责判断证据是否充分
async def reviewer(msg: Message):
    if msg.topic != "evidence":
        return None
    enough = len(msg.payload["docs"]) >= 1
    return Message("reviewer", "verdict",
                   {"enough": enough, "docs": msg.payload["docs"]}, msg.session_id)

# 角色 3：生成，只负责基于证据写答案
async def writer(msg: Message):
    if msg.topic != "verdict" or not msg.payload["enough"]:
        return None
    return Message("writer", "final", {"answer": msg.payload["docs"][0]}, msg.session_id)
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `Message` 统一结构 | 协议标准化 | 所有角色用同一种消息，新增角色不需要改总线 |
| `session_id` | 会话隔离 | 并发多个任务时不会把别人的消息混进来 |
| `history` | 可回放 | 多智能体出问题时，看消息顺序比看日志更直观 |
| `topic` 路由 | 松耦合 | 发送者不需要知道谁处理，只声明消息类型 |
| 每个 handler 只做一件事 | 职责单一 | 提示词与权限都能收窄，准确率更高 |
| `enough` 判定 | 冲突前置 | 证据不足直接不生成，避免模型硬编 |

<div class="callout plain"><span class="tag">大白话</span><p>多智能体像一个项目组：产品经理拆需求，开发写代码，测试挑毛病。如果有人既写代码又给自己打分，质量一定出问题。角色分开不是为了好看，是为了让每个角色的标准足够单一。</p></div>

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>角色职责重叠，两个 Agent 都能查库，结果重复调用、结论冲突。</li><li>消息没有会话 id，多用户并发时答案串线。</li><li>没有终止条件，Agent 之间互相“请对方确认”无限往返。</li><li>写操作不做幂等，重试导致重复下单。</li><li>把所有角色放在一个进程里串行调用，吞吐上不去，应并行的地方要并行。</li><li>没有统一裁决机制，冲突时谁最后说话听谁的。</li></ul></div>

### 模块5：LangChain 框架

**解决什么问题**

手写 Function Call 循环能跑，但模型切换、提示模板、输出解析、记忆、检索这些重复逻辑每个项目都要重写。LangChain 提供统一抽象：模型 IO、Prompt、Parser、Chain、Memory、Retriever、Tool，让你把精力放在业务编排上。

**核心概念**

- 模型 IO：`ChatOpenAI` 统一不同厂商；`invoke / stream / batch` 三种调用方式。
- 提示模板：`ChatPromptTemplate`，用变量占位，支持系统消息与少样本示例。
- 输出解析：`JsonOutputParser`、`PydanticOutputParser`，把模型文本变成结构化对象，解析失败可重试。
- 函数调用：`@tool` 装饰器把 Python 函数变成工具，`bind_tools` 让模型知道有哪些工具。
- Chains：`prompt | model | parser` 的管道式组合，`RunnableParallel` 做并行分支。
- Memory：现代版本用 `RunnableWithMessageHistory` 管理会话历史，按 `session_id` 隔离。
- ReAct Agent：思考 → 调工具 → 观察，LangChain 提供 `create_react_agent`。
- RAG：`DocumentLoader → TextSplitter → Embeddings → VectorStore → Retriever → Prompt → LLM`。

**关键代码**

```python
# lc_basic.py：模型 IO + 提示模板 + 结构化输出
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o-mini", temperature=0)

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是电商客服。只输出 JSON，不要输出任何解释。"),
    ("human", "用户问题：{question}\n订单信息：{order}"),
])

parser = JsonOutputParser()
chain = prompt | model | parser          # 管道组合：输出自动流入下一步

result = chain.invoke({
    "question": "这个耳机能退吗？",
    "order": '{"status": "paid", "days": 12, "category": "耳机"}',
})
print(result["can_refund"], result["reason"])
```

```python
# 会话记忆：同一 session_id 共享历史，不同会话互相隔离
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory

chat_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是电商客服，回答不超过 80 字。"),
    MessagesPlaceholder("history"),            # 历史消息插槽，由记忆模块填充
    ("human", "{question}"),
])
store: dict[str, InMemoryChatMessageHistory] = {}

def get_history(session_id: str) -> InMemoryChatMessageHistory:
    return store.setdefault(session_id, InMemoryChatMessageHistory())

chat = RunnableWithMessageHistory(
    chat_prompt | model,
    get_history,
    input_messages_key="question",
    history_messages_key="history",
)
chat.invoke({"question": "A1001 能退吗"},
            config={"configurable": {"session_id": "u1"}})
chat.invoke({"question": "那多久到账？"},          # 同一 session 能接上文
            config={"configurable": {"session_id": "u1"}})
```

```python
# lc_tools.py：工具定义与 ReAct Agent
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

@tool
def get_order(order_id: str) -> dict:
    """根据订单号查询订单状态、金额与购买天数。订单号形如 A1001。"""
    return {"order_id": order_id, "status": "paid", "days": 12}

@tool
def refund(order_id: str) -> dict:
    """对订单发起退款。仅当订单已支付且购买不超过 7 天时调用。"""
    return {"ok": True, "order_id": order_id}

model = ChatOpenAI(model="gpt-4o-mini", temperature=0)
agent = create_react_agent(model, [get_order, refund])

resp = agent.invoke({"messages": [("user", "帮我查 A1001 能不能退")]})
print(resp["messages"][-1].content)
```

```python
# lc_rag.py：最小 RAG 链路
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

docs = TextLoader("faq.md", encoding="utf-8").load()
chunks = RecursiveCharacterTextSplitter(
    chunk_size=500, chunk_overlap=80      # 重叠是为了不把一句话切断
).split_documents(docs)

store = Chroma.from_documents(chunks, OpenAIEmbeddings(model="text-embedding-3-small"))
retriever = store.as_retriever(search_kwargs={"k": 4})

question = "退款多久到账？"
hits = retriever.invoke(question)
context = "\n\n".join(d.page_content for d in hits)

answer = ChatOpenAI(model="gpt-4o-mini", temperature=0).invoke(
    f"只根据以下资料回答，资料没有就说不知道。\n资料：\n{context}\n问题：{question}"
)
print(answer.content)
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `prompt \| model \| parser` | 链式组合 | 每一步输出即下一步输入，结构清晰可替换 |
| `JsonOutputParser` | 结构化输出 | 省去手工找 `{}` 与处理围栏 |
| `temperature=0` | 降低随机性 | 客服与结构化任务需要稳定复现 |
| `@tool` 装饰器 | 工具封装 | 函数签名与 docstring 自动变成工具描述 |
| `create_react_agent` | ReAct 循环 | 框架负责多轮调用，业务只写工具 |
| `chunk_overlap=80` | 切片重叠 | 避免关键句被切断，提升召回 |
| `k=4` | 召回数量 | 太少漏信息，太多噪声大，需要评测调优 |
| 提示词“资料没有就说不知道” | 抑制幻觉 | RAG 最常见的失败是模型拿常识补全 |

<div class="callout tip"><span class="tag">老师建议</span><p>LangChain 的版本更新很快，遇到 <code>ImportError</code> 先查官方文档对应版本，不要照抄两年前的博客。本阶段只要求掌握“模型 IO、Prompt、Parser、Tool、Retriever、Chain”六个概念，API 细节以你安装的版本为准。</p></div>

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>输出解析失败直接崩，没有重试或降级，应该捕获后让模型重答一次。</li><li>提示模板里的变量名与传入字典不一致，报 KeyError。</li><li>工具 docstring 写得太短，模型不知道何时调用。</li><li>把所有文档一次性塞进上下文，成本和延迟都不可接受，必须先检索。</li><li>记忆没有按 <code>session_id</code> 隔离，不同用户看到彼此的对话。</li><li>照抄旧版本 API，<code>langchain</code> 与 <code>langchain-core</code> 版本不匹配。</li></ul></div>

### 模块6：LangGraph 框架

**解决什么问题**

LangChain 的链是线性的：A → B → C。但真实 Agent 需要“不通过就回到上一步”“根据分类走不同分支”“中途等人工审批”“断点后继续”。这些用链写会非常别扭。LangGraph 用图来表达：状态在节点间流动，边决定下一步去哪，天然支持分支、循环与持久化。

**核心概念**

- State：所有节点共享的数据结构，通常用 `TypedDict` 定义；节点返回“增量”，框架负责合并。
- Node：一个纯函数，输入 State，返回要更新的字段；不要在里面做发消息、写库等副作用。
- Edge：普通边（固定下一步）与条件边（根据 State 决定走哪条）。
- Compile：把图编译成可执行对象，编译时会校验入口与边是否完整。
- Checkpointer：持久化每一步状态，支持断点恢复、人工介入、多轮记忆。
- `thread_id`：会话标识，同一 id 的多次调用共享历史状态。
- Stream：`stream_mode="values" / "updates" / "messages"`，把中间过程实时推给前端。

**关键代码**

```python
# graph_rag.py：带审核回退与持久化的文档问答图
from typing import Literal, TypedDict

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph

class State(TypedDict, total=False):
    question: str
    docs: list[str]
    answer: str
    score: float
    rounds: int

def retrieve(state: State) -> State:
    # 真实实现调用向量库；这里用固定片段演示
    return {"docs": [f"与「{state['question']}」相关的制度条款"]}

def answer(state: State) -> State:
    # 真实实现调用模型；这里用模板模拟
    text = f"根据制度：{state['docs'][0]}"
    return {"answer": text, "rounds": state.get("rounds", 0) + 1}

def review(state: State) -> State:
    # 真实实现用模型或规则评分；0-1，低于阈值需要重写
    score = 0.9 if state["docs"] else 0.2
    return {"score": score}

def route(state: State) -> Literal["answer", "end"]:
    if state["score"] >= 0.7:
        return "end"
    if state["rounds"] >= 2:          # 最多重写两次，防止死循环
        return "end"
    return "answer"

builder = StateGraph(State)
builder.add_node("retrieve", retrieve)
builder.add_node("answer", answer)
builder.add_node("review", review)

builder.set_entry_point("retrieve")
builder.add_edge("retrieve", "answer")
builder.add_edge("answer", "review")
builder.add_conditional_edges("review", route, {"answer": "answer", "end": END})

graph = builder.compile(checkpointer=MemorySaver())   # 持久化每一步状态

config = {"configurable": {"thread_id": "user-001"}}
result = graph.invoke({"question": "年假怎么计算？"}, config=config)
print(result["answer"], result["score"])

# 流式输出：前端可以逐步展示“检索中 / 生成中 / 审核中”
for chunk in graph.stream({"question": "病假需要什么材料？"}, config=config,
                          stream_mode="updates"):
    print(chunk)
```

```python
# 人工介入：在敏感节点前中断，等待审批后继续
from langgraph.types import interrupt

def send_reply(state: State) -> State:
    approved = interrupt({"draft": state["answer"], "ask": "是否发送给用户？"})
    if not approved:
        return {"answer": "已取消发送"}
    return {"answer": state["answer"]}
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `TypedDict` + `total=False` | 定义共享状态 | 允许节点只返回自己修改的字段 |
| 节点返回增量字典 | 状态合并 | 框架负责更新，避免节点之间互相覆盖 |
| `add_conditional_edges` | 条件分支 | 实现“审核不通过回到生成” |
| `rounds >= 2` | 循环出口 | 图里有回边就必须有终止条件 |
| `MemorySaver` | 持久化 | 同一 `thread_id` 可继续上次对话 |
| `stream_mode="updates"` | 过程可见 | 前端能显示每步状态，便于调试与体验优化 |
| `interrupt` | 人工审批 | 高风险动作不自动执行，符合 Harness 要求 |

<div class="callout tip"><span class="tag">老师建议</span><p>画图先于写代码。把每个节点写在一张纸上，标清“输入什么、输出什么、失败去哪”，再用 <code>StateGraph</code> 落地。凡是图里出现回边，第一件事就是确定终止条件，第二件事是确定状态里用哪个字段判断。</p></div>

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>节点直接修改传入的 state，导致状态不可追踪；应返回新字典。</li><li>条件边返回了未声明的分支名，编译或运行时直接报错。</li><li>循环没有轮次上限，图跑飞。</li><li>忘记传 <code>thread_id</code>，持久化记忆不生效，每次都是新会话。</li><li>把数据库写入放在节点里，重跑节点会产生重复数据，应放到工具层并做幂等。</li><li>用 <code>MemorySaver</code> 上生产，进程重启记忆全丢，应换数据库 checkpointer。</li></ul></div>

### 模块7：智能体工程化

**解决什么问题**

Demo 能答对不代表系统可用。上线要回答四个问题：出了问题怎么定位（Trace）、效果变差怎么量化（评测）、检索不准怎么调（RAG 优化）、流量上来怎么部署（服务规划）。工程化就是把“感觉还行”变成“可观测、可评估、可扩容”。

**核心概念**

- 提示词工程：结构化模板、少样本示例、明确禁止项、输出 schema；版本化管理，改动可对比。
- 自定义 Tool：入参用 schema 严格约束，返回结构化结果，错误分类（可重试 / 不可重试），超时与幂等。
- 会话状态管理：`session_id` 贯穿全链路，短期上下文、摘要、长期偏好分开存。
- Trace：记录一次请求的完整链路（输入、每轮模型输出、工具调用、耗时、token、错误），用 OpenTelemetry / LangSmith 等采集。
- Ragas 评测：faithfulness（忠实度）、answer_relevancy（答案相关性）、context_precision（上下文精确率）、context_recall（召回率）。
- RAG 调优：切片策略、混合检索（向量 + 关键词）、重排、查询改写（HyDE、多查询）、元数据过滤。
- 服务规划：向量服务、重排服务、推理服务、业务 API 分开部署；按 QPS 与延迟要求做多模型拆分。

常见故障与对应动作：

- 检索为空：先确认文档是否入库、切片是否过碎，再做查询改写与混合检索。
- 答非所问：上下文噪声过大，降低 `k`、加重排、增加元数据过滤。
- 编造答案：提示词要求“只依据资料回答”，并用 faithfulness 低分告警兜底。
- 延迟过高：检索与重排并行、缩小召回数量、缓存高频问题。

**关键代码**

```python
# trace.py：轻量链路追踪，每次请求生成一个 trace_id
import json
import time
import uuid
from functools import wraps

def traced(name: str):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            trace_id = kwargs.pop("trace_id", None) or uuid.uuid4().hex[:8]
            start = time.perf_counter()
            record = {"trace_id": trace_id, "step": name, "status": "ok"}
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                record.update(status="error", error=type(e).__name__, msg=str(e))
                raise
            finally:
                record["ms"] = round((time.perf_counter() - start) * 1000, 1)
                print(json.dumps(record, ensure_ascii=False))   # 生产写日志/上报
        return wrapper
    return decorator

@traced("retrieve")
def retrieve_docs(query: str) -> list[str]:
    return [f"{query} 的相关制度"]

@traced("generate")
def generate_answer(query: str, docs: list[str]) -> str:
    return f"依据：{docs[0]}"
```

```python
# eval_rag.py：用 Ragas 评估检索与生成质量
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import answer_relevancy, context_precision, faithfulness

data = {
    "question": ["退款多久到账？", "年假怎么计算？"],
    "answer": ["退款 1-3 个工作日到账。", "年假按工龄计算。"],
    "contexts": [["退款将在 1-3 个工作日原路退回。"], ["年假依据工龄分为 5/10/15 天。"]],
    "ground_truth": ["1-3 个工作日", "按工龄 5/10/15 天"],
}
result = evaluate(
    Dataset.from_dict(data),
    metrics=[faithfulness, answer_relevancy, context_precision],
)
print(result)
```

```yaml
# 部署拓扑：按能力拆分服务，避免一个服务扛所有压力
services:
  api:                 # 业务接口，负责鉴权、编排、会话
    image: shop-agent-api:1.2.0
    ports: ["8000:8000"]
  embedding:           # 向量化服务，CPU 即可，可多副本
    image: tei-embedding:latest
    ports: ["8081:80"]
  rerank:              # 重排服务，延迟敏感，独立扩容
    image: tei-rerank:latest
    ports: ["8082:80"]
  llm-gateway:         # 模型网关，统一鉴权、限流、多模型路由
    image: llm-gateway:latest
    ports: ["8080:8080"]
  vector-db:           # 向量库，挂持久化卷
    image: qdrant/qdrant:latest
    volumes: ["qdrant-data:/qdrant/storage"]
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `trace_id` 贯穿调用 | 串起一次请求 | 没有 trace_id，跨服务日志无法关联 |
| `finally` 记录耗时 | 每步都上报 | 慢在检索还是生成，一眼能看出来 |
| `json.dumps` 结构化日志 | 可被采集 | 文本日志难聚合，JSON 可直接进 ELK |
| Ragas 四个指标 | 分环节评估 | 忠实度看幻觉，召回率看检索，精确率看噪声 |
| 评测集含 `ground_truth` | 可对比 | 没有标准答案就无法判断优化是否有效 |
| 服务拆分 | 独立扩容 | 重排与推理的 QPS、延迟特性不同，不能绑死 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>只埋点不建 trace_id，日志一堆但串不起来。</li><li>评测集只有 3 条，指标波动全是噪声，至少几十条覆盖典型问题。</li><li>只看答案相关性，不看忠实度，模型答得流畅但全是编的。</li><li>检索不准就换更大模型，成本翻倍但问题在切片与召回。</li><li>所有模型共用一个实例，重排把推理服务拖垮。</li><li>上线不做灰度，提示词一改全量生效，效果回退无法快速止损。</li></ul></div>

## 综合实战

目标：做一个“电商商家对话助手”，能查订单、查销售数据、按规则发起退款，并具备权限管控、轮次上限、会话记忆与全链路 Trace。它把本阶段的架构、Harness、Loop、多智能体思想、LangChain 工具封装、LangGraph 编排和工程化串在一起。

**第 1 步：定义工具与管控层**

工具只做一件事；Harness 在工具执行前统一检查权限与预算。

```python
# shop_agent.py
import json
import logging
from dataclasses import dataclass, field
from typing import Annotated, TypedDict

from langchain_core.messages import HumanMessage, ToolMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

@tool
def get_order(order_id: str) -> dict:
    """查询订单状态、金额与购买天数。订单号形如 A1001。"""
    return {"order_id": order_id, "status": "paid", "amount": 299, "days": 12}

@tool
def query_sales(month: str) -> dict:
    """查询指定月份的销售额与订单量，月份格式 YYYY-MM。"""
    return {"month": month, "amount": 128000, "orders": 642}

@tool
def refund(order_id: str) -> dict:
    """对订单发起退款。仅当订单已支付且购买不超过 7 天时调用。"""
    return {"ok": True, "order_id": order_id, "eta": "1-3 个工作日"}

TOOLS = {t.name: t for t in (get_order, query_sales, refund)}

@dataclass
class Harness:
    allowed: set[str] = field(default_factory=lambda: {"get_order", "query_sales"})
    max_rounds: int = 6
    rounds: int = 0

    def check(self, name: str, args: dict) -> None:
        self.rounds += 1
        if self.rounds > self.max_rounds:
            raise TimeoutError("超过最大轮次")
        if name not in self.allowed:
            # 退款属于高风险操作，必须走人工审批，不直接放行
            raise PermissionError(f"工具 {name} 未授权自动执行")
        logging.info("tool_call name=%s args=%s", name, args)
```

**第 2 步：用 LangGraph 编排“模型思考 → 工具执行 → 再思考”**

```python
class State(TypedDict, total=False):
    messages: Annotated[list, add_messages]     # add_messages 负责追加与去重

MODEL = ChatOpenAI(model="gpt-4o-mini", temperature=0).bind_tools(
    list(TOOLS.values())
)
harness = Harness()

def agent_node(state: State) -> State:
    # 这一轮模型只负责“决定说什么 / 调什么工具”
    reply = MODEL.invoke(state["messages"])
    return {"messages": [reply]}

def tool_node(state: State) -> State:
    last = state["messages"][-1]
    outputs = []
    for call in last.tool_calls:                 # 可能一次返回多个调用
        try:
            harness.check(call["name"], call["args"])
            result = TOOLS[call["name"]].invoke(call["args"])
            content = json.dumps(result, ensure_ascii=False)
        except Exception as e:
            content = json.dumps({"error": str(e)}, ensure_ascii=False)
        outputs.append(ToolMessage(content=content, tool_call_id=call["id"]))
    return {"messages": outputs}

def should_continue(state: State) -> str:
    return "tools" if state["messages"][-1].tool_calls else END

builder = StateGraph(State)
builder.add_node("agent", agent_node)
builder.add_node("tools", tool_node)
builder.set_entry_point("agent")
builder.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
builder.add_edge("tools", "agent")               # 工具执行完回到模型继续思考
graph = builder.compile(checkpointer=MemorySaver())
```

**第 3 步：加入系统提示词、调用并观察**

```python
SYSTEM = """你是电商商家助手。
1. 订单相关问题必须先调用 get_order，禁止编造。
2. 只有 status=paid 且 days<=7 才建议退款；退款需人工确认。
3. 销售数据问题调用 query_sales。
4. 信息不足时向用户提问，回答不超过 150 字。"""

config = {"configurable": {"thread_id": "shop-001"}}
inputs = {"messages": [("system", SYSTEM), HumanMessage("A1001 能退吗？")]}

for event in graph.stream(inputs, config=config, stream_mode="updates"):
    for node, payload in event.items():           # 每一步都能看到，便于前端展示
        logging.info("node=%s payload=%s", node, payload)

# 第二轮：验证同一 thread_id 能记住上下文
graph.invoke({"messages": [HumanMessage("那退款多久到账？")]}, config=config)
```

**第 4 步：验证与排障**

```bash
python shop_agent.py
# 观察日志顺序：agent -> tools -> agent，说明循环正确
# 提问“帮我退款 A1001”，应被 Harness 拒绝并转人工
# 换一个 thread_id 再问“那退款多久到账”，应无法引用上一轮上下文
```

### 逐段代码解析

| 代码段 | 核心技术点 | 为什么这样设计 |
|-|-|-|
| `@tool` + docstring | 工具描述 | 描述决定模型是否会在正确时机调用 |
| `TOOLS` 字典 | 名称到实现的映射 | 执行层按名字查表，避免 eval 或动态导入 |
| `Harness.check` | 权限与轮次 | 高风险工具默认不在白名单，必须人工介入 |
| `bind_tools` | 工具声明 | 模型只知道声明过的工具，减少乱调 |
| `agent_node` | 单轮推理 | 节点只负责一次模型调用，职责单一 |
| `tool_node` | 工具执行 | 异常转成错误 JSON 回灌，循环不中断 |
| `should_continue` | 条件边 | 有工具调用就继续，否则结束，天然终止 |
| `add_messages` | 消息合并 | 自动追加消息，避免手工拼接导致结构错误 |
| `MemorySaver` + `thread_id` | 会话记忆 | 同一用户多轮可延续，不同用户互相隔离 |
| `stream_mode="updates"` | 可观测 | 每一步节点输出都能被前端或日志消费 |

<div class="callout tip"><span class="tag">老师建议</span><p>先把“工具白名单”设得很窄，只放开查询类工具，跑通再逐个放开写操作。每放开一个，就在评测集里加对应的越权用例。Harness 的价值不是限制能力，而是让每次扩权都有记录、可回滚。</p></div>

## 疑难点分级

| 知识点 | 难度 | 典型卡点 | 破解方式 |
|-|-|-|-|
| 提示词约束 | 中 | 模型不按格式输出 | 给出 JSON 示例，温度设 0，解析失败重试一次 |
| Function Call 流程 | 中 | 以为模型会执行函数 | 记住模型只返回调用意图，执行在自己的代码里 |
| 多工具调用 | 中 | 只处理第一个 tool_call | 遍历全部调用，按 `tool_call_id` 回灌 |
| ReAct 与 Plan 区别 | 中 | 什么时候用哪种分不清 | 步骤不确定用 ReAct，步骤多且可并行用计划 |
| 记忆膨胀 | 高 | 多轮后 token 超限 | 最近 N 轮 + 滚动摘要 + 长期记忆外置 |
| 权限绕过 | 高 | 提示词写了禁止仍被调用 | 权限必须写在代码层，默认拒绝 |
| 技能状态机 | 中 | 草稿技能被直接调用 | 只有 ACTIVE 状态可执行，启用需审核 |
| 循环终止 | 高 | Agent 反复调工具不结束 | 轮次、时长、预算、连续失败四重上限 |
| 重试策略 | 高 | 参数错误也重试 | 区分可重试错误，指数退避，限制次数 |
| 回滚补偿 | 高 | 失败后留下脏数据 | 每个写操作配补偿动作，逆序执行 |
| 多智能体串线 | 高 | 并发时答案互相污染 | 消息带 `session_id`，状态按会话隔离 |
| 角色冲突 | 中 | 两个 Agent 结论相反 | 明确裁决者与优先级，写操作做幂等 |
| LangChain 版本 | 中 | 照抄旧代码 ImportError | 锁定版本，按官方文档核对导入路径 |
| 输出解析失败 | 中 | 模型带 Markdown 围栏 | 用 Parser + 重试，或提示词禁止围栏 |
| 图的条件边 | 高 | 返回未声明分支 | 分支名统一用常量，编译期校验 |
| 检查点持久化 | 高 | 重启后记忆丢失 | 生产换数据库 checkpointer |
| Trace 断链 | 高 | 日志无法关联一次请求 | 入口生成 trace_id，逐层透传 |
| RAG 评测失真 | 高 | 指标好看但线上差 | 评测集贴近真实问题，分检索与生成看 |

## 阶段项目

### 项目一：电商商家对话助手

**背景**

商家每天要回答“这单能退吗”“这个月卖了多少”这类问题，人工重复且容易答错。做一个能查订单、查销售、按规则处理售后的对话助手，要求可控、可追溯、可评估，而不是一个只会聊天的 Demo。

**功能清单**

- 多轮对话：同一会话记住上下文，不同会话隔离。
- 订单查询：按订单号返回状态、金额、购买天数。
- 销售查询：按月份返回销售额与订单量。
- 售后判断：根据规则给出“可退 / 不可退 / 需人工”，不直接执行退款。
- 权限管控：退款工具默认不可自动调用，需人工确认。
- 终止保护：最大轮次、最大时长、连续失败阈值。
- 全链路 Trace：每次请求记录各节点耗时、工具调用与错误。
- 评测集：至少 30 条问题，覆盖查询、售后、越权、无答案四类。

**技术选型**

`LangGraph + LangChain + OpenAI 兼容模型`；工具层用 `@tool`；记忆用 checkpointer（生产换 Postgres/Redis）；向量检索可选 Chroma；Trace 用自建装饰器或 LangSmith；服务用 `FastAPI` 暴露 `/chat` 接口，Docker 部署。

**验收标准**

- 典型问题回答正确率不低于 90%，越权请求 100% 被拦截。
- 同一 `thread_id` 第二轮能正确引用上下文，换 id 后不能。
- 单次请求轮次不超过 6，超时有兜底回复。
- 每次请求都能用 `trace_id` 查到完整节点链路。
- 评测报告包含忠实度、答案相关性、上下文召回率三项指标。

**评分点**

| 维度 | 分值 | 说明 |
|-|-|-|
| 工具与调用正确性 | 25 | 选对工具、参数正确、结果回灌完整 |
| 管控与安全 | 25 | 白名单、轮次、审批、审计齐全 |
| 编排与记忆 | 20 | 图结构清晰、会话隔离、可恢复 |
| 可观测与评测 | 20 | Trace 完整、评测集覆盖典型场景 |
| 代码质量 | 10 | 分层、命名、异常处理 |

### 项目二：企业内部文档查询助手（RAG）

**背景**

公司制度、产品手册、FAQ 散落在多个文档里，员工找不到答案。做一个基于 RAG 的查询助手，要求“答得出、答得准、答不出就说不知道”，并能持续评估优化。

**功能清单**

- 文档入库：支持 Markdown / PDF / Word，按标题层级切片。
- 检索：向量召回 + 关键词召回，合并后重排。
- 回答：必须基于检索片段，附来源文件与段落。
- 兜底：检索分数低于阈值时明确回答“资料中未找到”。
- 多轮：支持追问，但每轮重新检索。
- 评测：Ragas 四项指标，至少 50 条评测集。
- 管理：文档新增、删除、重建索引。

**技术选型**

`LangChain + LangGraph`；切片用 `RecursiveCharacterTextSplitter`；向量库 Chroma / Qdrant；Embedding 与 Rerank 用独立服务；评测用 `ragas`；接口用 FastAPI；部署用 Docker Compose。

**验收标准**

- 50 条评测集上 faithfulness 不低于 0.85，context_recall 不低于 0.8。
- 每个回答都能给出至少一个来源片段。
- 无答案问题不编造，兜底率 100%。
- 新增文档后 1 分钟内可被检索到。
- 单次回答 P95 延迟低于 5 秒（不含模型排队）。

**评分点**

| 维度 | 分值 | 说明 |
|-|-|-|
| 检索质量 | 30 | 切片合理、混合检索、重排有效 |
| 回答忠实度 | 25 | 不编造、有来源、兜底明确 |
| 工程完整度 | 25 | 入库、索引、接口、管理闭环 |
| 评测与调优 | 20 | 有基线、有对比、有优化记录 |

## 常见面试题

### 问题1：Agent 和普通 LLM 调用的区别是什么？

**答案要点**

- 普通调用是“输入文本 → 输出文本”，一次完成。
- Agent 增加了工具、记忆、规划与循环，能根据中间结果决定下一步。
- Agent 的核心不是模型更强，而是把模型放进“可执行、可观察、可约束”的循环里。
- 代价是延迟、成本与不确定性都上升，需要 Harness 管控。

### 问题2：Function Call 的完整流程是什么？

**答案要点**

- 把工具名称、描述、参数 schema 随请求传给模型。
- 模型返回 `tool_calls`，包含函数名与 JSON 参数，但不执行。
- 业务代码解析参数、执行工具、捕获异常。
- 以 `role=tool` 和对应 `tool_call_id` 把结果回灌。
- 模型基于结果继续推理，直到不再调用工具。

### 问题3：ReAct 和 Plan-and-Execute 怎么选？

**答案要点**

- ReAct：边想边做，适合步骤不确定、需要根据观察调整的任务。
- Plan-and-Execute：先产出计划再逐步执行，适合步骤多、可并行、需要人工审计划的场景。
- 生产常见组合：先计划，执行中允许局部 ReAct 调整。
- 两者都必须有终止条件与失败处理。

### 问题4：为什么需要 Harness？它通常包含哪些层？

**答案要点**

- 模型不可控，必须用工程手段限制权限、成本、时长与影响范围。
- 常见分层：输入护栏、权限白名单、记忆管理、技能生命周期、预算与审计。
- 权限必须写在代码里，提示词只能作为辅助。
- Harness 还负责高风险操作的人工审批与回滚。

### 问题5：Agent 的记忆应该怎么分层？

**答案要点**

- 工作记忆：当前任务的中间结果，放内存，任务结束即释放。
- 会话记忆：多轮对话摘要，按 `session_id` 存 Redis / DB。
- 长期记忆：用户偏好、历史结论，存向量库或结构化表。
- 技能记忆：工具成功率、常用参数，用于优化调度。
- 关键原则：不是所有内容都进上下文，按需检索。

### 问题6：如何防止 Agent 死循环？

**答案要点**

- 最大轮次、最大执行时长、最大 token 预算三重上限。
- 连续失败次数阈值，超过则终止并转人工。
- 检测重复调用：同一工具同一参数重复 N 次即中断。
- 图编排中每条回边都必须有明确出口条件。

### 问题7：工具调用失败应该怎么处理？

**答案要点**

- 区分可重试（超时、限流、5xx）与不可重试（参数错、权限拒绝、404）。
- 可重试采用指数退避，限制次数。
- 把错误信息结构化回灌给模型，让它改参数或换方案。
- 写操作必须幂等，避免重试造成重复副作用。

### 问题8：多智能体常见的协作模式有哪些？

**答案要点**

- 主管-工人：主管拆任务、分派、汇总，最常用。
- 流水线：角色按顺序处理，适合文档处理类任务。
- 辩论：多角色给结论再裁决，适合需要降低偏差的判断。
- 黑板：共享状态，各角色按需读写，适合复杂协作。
- 无论哪种，都要有会话 id、终止条件与冲突裁决机制。

### 问题9：LangChain 和 LangGraph 的区别？

**答案要点**

- LangChain 侧重组件与链式组合：模型、提示、解析、工具、检索。
- LangGraph 侧重状态图编排：分支、循环、持久化、人工介入。
- 简单线性流程用 LangChain 链即可；复杂控制流用 LangGraph。
- 两者常一起用：LangGraph 的节点内部调用 LangChain 组件。

### 问题10：LangGraph 的 State、Node、Edge 分别是什么？

**答案要点**

- State：共享数据结构，节点返回增量，框架负责合并。
- Node：处理函数，输入 State，返回要更新的字段。
- Edge：固定边与条件边，决定下一个节点。
- `compile` 后成为可执行图，可配 checkpointer 持久化。
- 循环靠条件边回到之前的节点实现。

### 问题11：RAG 效果不好，你会从哪些方面排查？

**答案要点**

- 检索层：切片是否合理、召回数量、是否混合检索、是否需要重排。
- 数据层：文档是否最新、是否有多版本冲突、元数据是否可过滤。
- 生成层：提示词是否要求基于资料、是否允许说不知道。
- 评测层：分检索指标（召回、精确）与生成指标（忠实度、相关性）。
- 常见误区：直接换更大模型，实际问题在召回。

### 问题12：Ragas 的四个核心指标分别衡量什么？

**答案要点**

- faithfulness：答案是否完全由检索上下文支持，衡量幻觉。
- answer_relevancy：答案是否切题。
- context_precision：召回片段中有多少是真正有用的，衡量噪声。
- context_recall：标准答案需要的信息是否被召回，衡量漏检。
- 四个指标要一起看，单看一个容易误判。

### 问题13：智能体服务上线时如何规划部署？

**答案要点**

- 业务 API、模型网关、Embedding、Rerank、向量库分开部署，独立扩容。
- 模型网关统一鉴权、限流、重试与多模型路由。
- 向量库挂持久化卷，定期备份。
- 按延迟与成本做多模型拆分：简单任务用小模型，复杂任务用大模型。
- 全链路 Trace 与告警，先灰度再全量。

## 动手练习

<div class="callout task"><span class="tag">动手练习</span><ol><li>写一个系统提示词，让模型只输出包含 <code>intent</code> 与 <code>slots</code> 两个字段的 JSON，并用 5 条输入验证稳定性。</li><li>用 OpenAI SDK 跑通单工具 Function Call，打印每一轮 messages 的结构。</li><li>把工具数量增加到 3 个，故意让两个工具描述相近，观察模型选错并优化描述。</li><li>给对话加“最近 6 轮 + 摘要”的记忆裁剪，比较裁剪前后的 token 消耗。</li><li>实现一个技能注册表，要求只有审核通过的技能才能被调用。</li><li>给 Agent 加最大轮次、最大时长、最大 token 三个限制，并写测试验证触发。</li><li>实现一个高风险工具的“二次确认”流程，未确认时返回明确拒绝信息。</li><li>把循环中的重试改成区分错误类型，并记录每次失败原因。</li><li>为一个写操作设计补偿动作，模拟第三步失败后逆序回滚。</li><li>用 asyncio 实现三个角色的消息总线，跑通“检索 → 审核 → 生成”。</li><li>用 LangChain 的 Prompt + Model + Parser 实现结构化意图识别。</li><li>用 LangChain 实现一个最小 RAG，回答必须附来源。</li><li>用 LangGraph 画一个带“审核不通过回到生成”的图，并加轮次上限。</li><li>给 LangGraph 加 checkpointer，验证同一 <code>thread_id</code> 的多轮记忆。</li><li>给一次请求加 trace_id，输出每个节点的耗时与状态。</li><li>构造 20 条评测集，用 Ragas 跑一次基线，再调整切片大小对比指标。</li></ol></div>

## 阶段小结

- 智能体不是“更会聊天的模型”，而是“模型 + 工具 + 记忆 + 规划 + 循环”的工程系统。
- 提示词解决“怎么想”，工具描述解决“会不会选对”，权限代码解决“能不能做”。
- Harness 的核心是默认拒绝：白名单、预算、超时、审批、审计，一个都不能少。
- Loop 的核心是“跑得动也停得住”：任务拆解、错误分类、指数退避、检查点、补偿回滚。
- 多智能体的难点在边界与协议：角色单一、消息统一、会话隔离、冲突有裁决。
- LangChain 提供组件，LangGraph 提供控制流；线性用链，分支循环用图。
- 工程化的三件套：Trace 定位、评测量化、部署拆分；没有度量就没有优化。
- 上线前先问四个问题：出错能否定位、效果能否量化、越权能否拦住、流量能否扛住。

下一阶段进入模型训练与私有化：你会用这一阶段积累的评测集与 Trace 数据，反过来指导数据构造与微调，把“通用模型 + 提示词”升级为“行业模型 + 可控智能体”。

---

## 素材缺口与补充练习（2026-11-24 核对）

### 可跟练的部分

- 提示词、工具调用、MCP：对应 `举个栗子\举个栗子\day26\day26-代码`、`day28\day28-代码` 下的 `lc_*.py`，具体练习见 `lessons/langchain/langchain.md` 末尾。
- LangGraph：对应 `LangGraph-课件\尚硅谷大模型技术之LangGraph.md` 与 `day29\demo1`、`day29\demo2` 的 `lg_*.py`，具体练习见 `lessons/langgraph/langgraph.md` 末尾。

### 待补：本机无对应素材

| 大纲子项 | 本机核查结果 |
|---|---|
| 智能体 Skill | 课件、目录、视频名、代码全文均 0 命中 |
| 多智能体设计模式 | `LangGraph-课件` 仅 1 处提到“多智能体”，无专门章节、无视频、无对应代码 |
| RAGAS 评测 | 全库 0 命中；本机只有 LangSmith 的零散提及，无 RAGAS 安装、指标与评测脚本 |
| GraphRAG / HyDE / BGE-Rerank | 全库 0 命中 |

以上内容暂不补写。多智能体可先用 `day29\demo2` 的 LangGraph 代码做“单图多节点”练习打底，但不要把它等同于大纲要求的多智能体协作项目。
