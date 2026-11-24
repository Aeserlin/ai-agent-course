## 本章导读

单个 Agent 的能力上限，往往不是模型不够聪明，而是三件事同时压在一个上下文里：角色太多、信息太杂、错误无法隔离。当一次任务需要同时完成需求澄清、方案设计、编码、评审时，提示词很容易超过 2000 字，模型对后半段指令的遵循率会明显下降。

更麻烦的是错误传播。单 Agent 在第 3 步产生一个错误假设，第 4 到第 10 步都会围绕这个错误继续推理，最后交出一份“逻辑自洽但事实错误”的结果。多智能体不能消灭错误，但能把错误限制在一个角色、一个阶段内，方便定位与回滚。

学完本章，你应该能做到四件事：第一，用一张判断表决定“这个需求到底要不要上多 Agent”；第二，手写串行、并行、辩论三种编排，并说清各自的延迟与成本；第三，用 LangGraph 把带循环、带分支的流程画成状态图；第四，给编排器加上轮次上限、无进展检测与预算熔断，让它不会跑飞。

先记住五条最常见的误区，后面每一节都会回来对应它们：

1. 角色越多越好。实际上 4 个以上 Agent 时，协调开销经常超过分工收益，除非任务天然分段。
2. 把多 Agent 当成“并发加速器”。并行只对无依赖子任务有效，有依赖还硬并行，只会得到互相矛盾的结论。
3. 用自然语言传状态。让下游 Agent 读一大段散文，关键字段丢失率很高，应该传结构化字典。
4. 没有全局终止条件。只给单个 Agent 设步数、不给编排器设总轮次，照样会无限转圈。
5. 不做成本核算。一次辩论任务轻松产生 20 次以上模型调用，账单会在你看不见的地方翻倍。

<div class="callout plain"><span class="tag">大白话</span>
<p>多智能体就像<b>组建一个项目组</b>。</p>
<p>一个人能搞定的小活，非要拉五个人开会，沟通成本比干活还高。只有任务<b>又大又能拆分</b>时，分工才划算。</p>
<p>所以第一原则是：<b>能单人就单人</b>。加 Agent 是为了降低单点复杂度，不是为了显得高级。</p>
</div>

## 教学路径

<div class="callout path"><span class="tag">教学路径</span>
<ol class="path-steps">
<li><b>第 1 步（25 分钟）：</b>用一个真实需求过“适用边界三问”，产出《是否需要多 Agent 判断表》。</li>
<li><b>第 2 步（30 分钟）：</b>画出串行、并行、辩论三张拓扑草图，标注每步延迟与调用次数。</li>
<li><b>第 3 步（60 分钟）：</b>手写规划 → 执行 → 汇总编排器，产出可运行的 <code>orchestrator.py</code>。</li>
<li><b>第 4 步（45 分钟）：</b>把无依赖子任务改成并行执行，记录串行与并行的耗时对比。</li>
<li><b>第 5 步（50 分钟）：</b>实现辩论编排与 JSON 裁决，产出带轮次上限的 <code>debate.py</code>。</li>
<li><b>第 6 步（60 分钟）：</b>用 LangGraph 重写执行 → 评审循环，产出编译后的状态图。</li>
<li><b>第 7 步（30 分钟）：</b>补齐角色漂移、死循环、预算熔断三类治理清单。</li>
<li><b>第 8 步（25 分钟）：</b>用“博客登录功能”做端到端跑通与复盘，产出失败处理表。</li>
</ol>
</div>

## 学习前准备

### 前置知识

| 能力 | 最低要求 | 不达标会怎样 |
|-|-|-|
| Python 基础 | 会写函数、类、类型注解，理解 `dict` 与 `list` | 看不懂状态传递代码，改不动示例 |
| 异步与并发 | 知道线程池与 `ThreadPoolExecutor` 的基本用法 | 并行编排写成串行，测不出加速效果 |
| OpenAI SDK | 用过 `openai>=1.0` 的 `chat.completions.create` | 无法运行本章任何一段代码 |
| 异常处理 | 会写 `try/except` 并区分异常类型 | 编排器一次限流就整体崩溃 |
| 结构化输出 | 知道如何让模型只返回 JSON 并做容错解析 | 规划结果无法被程序消费 |
| 成本意识 | 知道输入与输出 Token 分别计费 | 辩论模式跑一晚，账单失控 |

### 工具与材料

| 名称 | 版本 / 说明 | 用途 |
|-|-|-|
| Python | 3.11 及以上 | 运行全部示例 |
| openai | 1.40 及以上 | 调用兼容 OpenAI 协议的模型 |
| python-dotenv | 1.0 及以上 | 读取 `.env` 中的密钥与端点 |
| langgraph | 0.2.20 及以上 | 状态图编排 |
| 模型端点 | 任意 OpenAI 兼容服务 | 需要支持 `tools` 与 JSON 输出 |
| 终端 | PowerShell 或 bash | 运行脚本、观察耗时 |
| 计时器 | 手机或秒表均可 | 对比串行与并行延迟 |

### 三道自测题

| 题目 | 参考答案要点 |
|-|-|
| 一个任务要写 200 行 CRUD，需要上多智能体吗 | 不需要。任务单一、上下文可控、验收标准明确，单 Agent 加一次代码评审足够 |
| 串行 3 个 Agent 各耗时 4 秒，总延迟大约多少 | 约 12 秒，再加 3 次网络与编排开销，通常 13 到 15 秒；并行则接近 4 到 6 秒 |
| 辩论模式为什么必须设最大轮次 | 双方都能不断生成新论据，没有终止条件就会持续消耗 Token，且边际收益快速下降 |

## 核心概念

### 一、适用边界：先证明“必须拆”，再动手拆

判断要不要上多智能体，不要看任务“大不大”，而要看三个条件是否同时成立：任务能否切成接口清晰的子任务、每个子任务是否有可验证的产出、单 Agent 的上下文是否真的接近上限。三个条件缺一个，优先优化单 Agent 的提示词与工具，而不是加角色。

一个可操作的门槛是：当单次任务需要超过 3 类专业知识，或预计交互步骤超过 15 步，或输入资料超过模型窗口的 60% 时，再考虑拆分。反例是“写一首关于秋天的诗”，它没有可分解结构，也没有客观验收标准，拆成“意象 Agent + 韵律 Agent”只会让结果更差。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| 任务可分解性 | 子任务之间能用明确的输入输出契约连接 | 登录功能可拆成接口设计、安全策略、测试用例 |
| 角色边界 | 每个 Agent 只负责一类判断，不越权 | 安全 Agent 只提风险，不改代码 |
| 单点复杂度 | 一个上下文里同时承载的角色与信息量 | 单 Agent 同时做设计与评审时提示词超 2000 字 |
| 协调成本 | 消息传递、结果汇总、冲突消解带来的额外开销 | 汇总 Agent 需要再调用一次模型 |
| 收益拐点 | 分工收益开始大于协调成本的位置 | 3 到 4 个角色通常是甜点区，超过 5 个要谨慎 |

<div class="callout plain"><span class="tag">大白话</span>
<p>三个人搬沙发刚刚好，十个人围上来反而谁都伸不开手。</p>
<p>多智能体也是这个道理：<b>角色数量存在甜点区</b>。先证明“一个人真的忙不过来”，再叫人。</p>
</div>

### 二、三种编排拓扑：串行、并行、辩论

串行是最容易理解的拓扑：A 的输出就是 B 的输入，适合阶段边界清楚的流程，例如“需求分析 → 编码 → 评审”。它的延迟等于各步之和，假设 3 个 Agent 各 4 秒，总延迟约 12 秒；任何一个环节出错，错误会原样传给下游。

并行采用扇出再扇入：同一份输入分给多个 Agent，最后统一汇总。延迟约等于最慢的那个分支，3 个分支各 4 秒时总延迟接近 4 到 6 秒。代价是汇总阶段要处理冲突，例如安全 Agent 要求加验证码、体验 Agent 要求减少步骤，必须有一个裁决者。

辩论让两个 Agent 持相反立场互相挑错，第三个小模型或强模型做裁决。它适合高风险决策，例如“是否拆微服务”“是否允许自动转账”。成本最高：3 轮辩论至少 7 次调用，Token 消耗通常是串行的 3 到 5 倍，所以必须设轮次上限与置信度阈值。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| 串行 | 上游输出作为下游输入，逐段推进 | 接口设计 → 安全评审 → 测试用例 |
| 并行 | 多分支同时处理，再统一汇总 | 安全、性能、可读性三路审查 |
| 辩论 | 正反双方多轮交锋，第三方裁决 | 登录方案是否引入短信验证码 |
| 扇入汇总 | 把多路结果去重、消歧、统一口径 | 汇总 Agent 输出最终方案 |
| 裁决节点 | 在冲突时强制给出结论的节点 | 辩论裁判输出 winner 与置信度 |

<div class="callout plain"><span class="tag">大白话</span>
<p>串行像<b>接力赛</b>，一棒接一棒；并行像<b>几个人同时查资料</b>，最后一起对答案；辩论像<b>开庭</b>，双方举证，法官敲槌。</p>
<p>选哪种不看哪个高级，只看任务有没有依赖、结论要不要经得起质疑、预算够不够。</p>
</div>

### 三、消息传递与状态共享：别让 Agent 靠“回忆”协作

多智能体最常见的隐形 bug，是下游 Agent 看不到上游的关键结论。有人把整段对话历史塞进 prompt，短期能跑，长期一定崩：10 个子任务、每段输出 500 Token，全量拼接的累计输入约为 500 × (1 + 2 + … + 10) = 27500 Token，成本呈平方级增长。

更稳的做法是维护一个结构化状态字典，只传必要字段：目标、当前计划、各角色产出、评审意见、轮次、预算余量。需要长文本时传“摘要 + 指针”，例如把完整文档写到对象存储，只把摘要和 URL 传给下一个 Agent。这样 10 步任务可以稳定控制在 8000 Token 以内。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| 共享状态 | 所有节点读写同一份结构化数据 | `AgentState` 里的 goal、draft、round |
| 消息信封 | 统一的消息格式，含发送者、类型、负载 | `role` 与 `output` 组成的字典 |
| 黑板模式 | 各 Agent 往公共区域写结论，按需读取 | 汇总节点读取所有子任务产出 |
| 摘要压缩 | 长文本压成要点，降低上下文占用 | 评审意见只保留 3 条以内 |
| 幂等键 | 同一步骤重复执行不会产生副作用 | 子任务 ID 加会话 ID 组成唯一键 |

<div class="callout plain"><span class="tag">大白话</span>
<p>状态共享就像工厂里的<b>托盘</b>：每个工位往托盘里放自己的零件，下一个工位只拿需要的，不用把整条流水线的历史都背下来。</p>
<p>只传“交接单”，不传“全部聊天记录”，是控制成本的第一招。</p>
</div>

### 四、失败与死循环治理：给编排器装刹车

编排器必须有四道刹车：最大轮次、最大工具调用次数、墙钟超时、预算上限。经验值是单次任务最多 3 到 5 轮评审、20 次工具调用、180 秒总耗时、0.5 元预算；任意一项触发就停止并返回“部分结果 + 未完成原因”，而不是继续硬跑。

第二道防线是“无进展检测”：把每轮输出做哈希，如果连续两轮哈希相同，说明 Agent 在原地打转，直接终止。第三道是强制裁决节点：辩论或评审出现平局时，由一个温度设为 0 的裁决 Agent 拍板，禁止把问题抛回给用户。最后是人工兜底：高风险操作在预算耗尽或置信度低于 0.6 时转人工确认。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| 最大轮次 | 循环最多执行几次 | 评审最多 3 轮，超过直接交付草稿 |
| 无进展检测 | 输出没有变化就判定空转 | 连续两轮草稿哈希一致则退出 |
| 强制裁决 | 冲突时由固定节点拍板 | 裁判输出 winner 与 confidence |
| 预算熔断 | 花费超限立即停止调用 | 单任务 0.5 元上限 |
| 墙钟超时 | 总耗时超过阈值即中断 | 180 秒未完成返回部分结果 |
| 人工兜底 | 高风险或低置信度转人工 | 涉及资金、删除操作必须确认 |

<div class="callout plain"><span class="tag">大白话</span>
<p>开会最怕没有主持人：两个人越说越远，最后忘了为什么开会。</p>
<p>编排器就是那个主持人，手里必须有三样东西：<b>议程（轮次）、计时器（超时）、预算（经费）</b>。到点就散会，给出结论。</p>
</div>

## 代码实操一：手写一个可运行的串行 + 并行编排器

下面的例子把“规划 → 执行 → 汇总”三段式写完整，并加入三处工程保护：规划结果结构校验、无依赖子任务并行执行、汇总前对上下文做硬截断。运行前准备 `.env` 中的 `OPENAI_API_KEY`、`OPENAI_BASE_URL` 与 `MODEL_NAME`。

```python
import json
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=os.getenv("OPENAI_BASE_URL"))
MODEL = os.getenv("MODEL_NAME", "gpt-4o-mini")
MAX_SUBTASKS = 5


@dataclass
class SubTask:
    role: str
    task: str
    depends_on: int = -1          # -1 表示无依赖，可以并行


def call_agent(role: str, task: str, context: str = "", temperature: float = 0.2) -> str:
    """统一 Agent 入口：角色靠 system prompt 区分，上下文显式传入。"""
    messages = [
        {"role": "system", "content": f"你是{role}。只做本职范围内的事，输出具体可执行，不要客套话。"},
        {"role": "user", "content": f"任务：{task}\n\n可用上下文：\n{context or '无'}"},
    ]
    resp = client.chat.completions.create(model=MODEL, messages=messages, temperature=temperature)
    return (resp.choices[0].message.content or "").strip()


def plan(goal: str) -> list[SubTask]:
    """规划节点：把目标拆成带角色的子任务，并对输出做结构校验。"""
    prompt = f"""把目标拆成 2 到 {MAX_SUBTASKS} 个子任务，每个子任务绑定一个角色。
依赖规则：能独立完成的 depends_on 填 -1；必须等第 i 个任务完成的填 i。
只输出 JSON 数组，不要解释。格式：[{{"role":"角色","task":"子任务","depends_on":-1}}]
目标：{goal}"""
    raw = call_agent("任务规划专家", prompt, temperature=0.1)
    match = re.search(r"\[[\s\S]*\]", raw)
    if not match:
        raise ValueError(f"规划结果不含 JSON 数组：{raw[:120]}")
    items = json.loads(match.group(0))

    tasks: list[SubTask] = []
    for item in items[:MAX_SUBTASKS]:
        if not isinstance(item, dict) or not item.get("role") or not item.get("task"):
            continue
        dep = item.get("depends_on", -1)
        tasks.append(SubTask(str(item["role"]), str(item["task"]), dep if isinstance(dep, int) else -1))
    if not tasks:
        raise ValueError("规划结果为空，终止编排")
    return tasks


def execute(tasks: list[SubTask], goal: str) -> dict:
    """执行节点：无依赖则并行，有依赖则按顺序。"""
    outputs: dict[int, str] = {}
    started = time.time()

    def run_one(index: int) -> tuple[int, str]:
        task = tasks[index]
        context = f"总目标：{goal}\n"
        if 0 <= task.depends_on < index:
            context += f"上游结论：\n{outputs.get(task.depends_on, '')}"
        return index, call_agent(task.role, task.task, context)

    independent = [i for i, t in enumerate(tasks) if t.depends_on < 0]
    if independent and len(independent) == len(tasks):
        with ThreadPoolExecutor(max_workers=min(4, len(tasks))) as pool:
            for index, text in pool.map(run_one, independent):
                outputs[index] = text
    else:
        for i in range(len(tasks)):
            _, text = run_one(i)
            outputs[i] = text

    return {"outputs": outputs, "elapsed": round(time.time() - started, 2)}


def synthesize(goal: str, tasks: list[SubTask], outputs: dict[int, str]) -> str:
    """汇总节点：去掉重复与矛盾，输出最终方案并单列风险。"""
    context = "\n\n".join(f"[{tasks[i].role}] {outputs[i]}" for i in sorted(outputs))
    return call_agent(
        "项目总负责人",
        f"整合各角色产出，去掉重复与互相矛盾之处，输出可直接执行的最终方案，并单列风险清单。\n目标：{goal}",
        context[:12000],          # 硬截断，防止上下文爆炸
        temperature=0.3,
    )


def orchestrate(goal: str) -> dict:
    tasks = plan(goal)
    result = execute(tasks, goal)
    summary = synthesize(goal, tasks, result["outputs"])
    return {"plan": tasks, "summary": summary, "elapsed": result["elapsed"]}


if __name__ == "__main__":
    out = orchestrate("为一个博客系统设计登录功能，覆盖注册、登录、找回密码")
    print(json.dumps({"plan": [t.__dict__ for t in out["plan"]], "elapsed": out["elapsed"]},
                     ensure_ascii=False, indent=2))
    print("\n===== 最终方案 =====\n")
    print(out["summary"])
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `call_agent(role, task, context)` | 统一 Agent 入口 | 一套调用逻辑复用，角色只靠 system prompt 区分，便于加日志与计费 |
| `plan()` 中 `re.search(r"\[[\s\S]*\]")` | 容错提取 JSON 数组 | 模型经常在 JSON 外套 Markdown 代码块或解释文字 |
| `MAX_SUBTASKS = 5` | 限制规划规模 | 子任务越多协调成本越高，5 个是可控上限 |
| `depends_on` 字段 | 声明依赖关系 | 有依赖必须串行，无依赖才能并行，避免读到空结果 |
| `ThreadPoolExecutor(max_workers=4)` | 并行执行 | 把总延迟从“各步之和”降到“最慢分支” |
| `context[:12000]` | 硬截断 | 上下文超窗口会直接报错，截断比崩溃好 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>不校验规划结果</b>：模型可能返回空数组、缺字段或纯文字，直接循环会静默产出空方案。</li>
<li><b>依赖判断写错</b>：`depends_on` 指向未来任务时，`outputs.get()` 取到空字符串，下游会基于空气推理。</li>
<li><b>并行里共享可变对象</b>：多个线程同时写同一个字典要加锁；本例先收集结果再写入，规避了竞争。</li>
<li><b>汇总不设上限</b>：10 个角色全量拼接可达 2 万 Token，必须截断或摘要。</li>
</ul>
</div>

## 代码实操二：用 LangGraph 写带循环的状态图

当流程出现“评审不通过就回到执行节点”的循环时，用 `if/else` 会越写越乱。LangGraph 用“状态 + 节点 + 边”表达这类流程，条件边负责决定下一步走向。下面的图只有两个节点，但已经包含循环、条件分支和最大轮次保护。

```python
import os
from typing import Literal, TypedDict

from dotenv import load_dotenv
from langgraph.graph import END, StateGraph
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=os.getenv("OPENAI_BASE_URL"))
MODEL = os.getenv("MODEL_NAME", "gpt-4o-mini")


class AgentState(TypedDict):
    """所有节点共享的状态。字段越少越稳，长文本只放必要的。"""
    goal: str
    draft: str
    critique: str
    round: int
    max_rounds: int


def llm(system: str, user: str) -> str:
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        temperature=0.2,
    )
    return (resp.choices[0].message.content or "").strip()


def worker(state: AgentState) -> dict:
    """执行节点：根据上一轮评审意见修改草稿。"""
    fix = f"\n上一轮评审意见：\n{state['critique']}" if state["critique"] else ""
    text = llm("你是资深后端工程师，输出可执行方案，不写空话。",
               f"完成任务：{state['goal']}{fix}")
    return {"draft": text, "round": state["round"] + 1}


def reviewer(state: AgentState) -> dict:
    """评审节点：只给结论与修改意见，不直接改稿。"""
    verdict = llm(
        "你是严格的评审专家。只输出两行：第一行 PASS 或 FAIL；第二行给出 3 条以内具体修改意见。",
        f"验收标准：可执行、覆盖异常分支、不含未定义术语。\n待评审内容：\n{state['draft']}",
    )
    return {"critique": verdict}


def route(state: AgentState) -> Literal["worker", "done"]:
    """条件边：决定回到执行节点还是结束。"""
    passed = state["critique"].upper().startswith("PASS")
    if passed or state["round"] >= state["max_rounds"]:
        return "done"
    return "worker"


builder = StateGraph(AgentState)
builder.add_node("worker", worker)
builder.add_node("reviewer", reviewer)
builder.set_entry_point("worker")
builder.add_edge("worker", "reviewer")
builder.add_conditional_edges("reviewer", route, {"worker": "worker", "done": END})
graph = builder.compile()


if __name__ == "__main__":
    final = graph.invoke(
        {"goal": "为登录接口设计限流与防爆破方案", "draft": "", "critique": "", "round": 0, "max_rounds": 3},
        config={"recursion_limit": 12},     # 双保险：图本身也有轮次上限
    )
    print(final["draft"])
    print("\n实际轮次：", final["round"])
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `class AgentState(TypedDict)` | 定义全局状态结构 | 节点之间通过字段名约定接口，比散文可靠 |
| 节点返回 `dict` | 只更新自己负责的字段 | LangGraph 会把返回值合并回状态，避免整份状态被覆盖 |
| `add_conditional_edges` | 条件跳转 | 评审结果决定继续循环还是结束，这是状态图的核心价值 |
| `route()` 同时判断 PASS 与轮次 | 双终止条件 | 只判 PASS，模型永远不给 PASS 时就会转圈 |
| `recursion_limit=12` | 运行时保护 | 默认上限 25，主动调低能更早发现流程写错 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>节点里原地修改 state</b>：直接 `state["draft"] = ...` 在部分版本不会触发更新，应返回新字典。</li>
<li><b>只加边不加条件</b>：`worker → reviewer → worker` 会形成无条件环，必须由条件边决定出口。</li>
<li><b>轮次计数放在边里</b>：计数应由节点自增并写回状态，否则条件判断读到旧值。</li>
<li><b>状态字段塞整个历史</b>：每轮全量追加会让 Token 线性上涨，只保留当前稿与最近一次评审。</li>
</ul>
</div>

## 代码实操三：辩论编排与裁决

辩论模式的价值不在“吵”，而在逼双方给出可验证的论据。下面的实现给每轮设字数上限、用置信度提前停止、并且无论结果如何都要有 JSON 裁决，避免出现“没有结论”的收尾。

```python
import json
import os
import re
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=os.getenv("OPENAI_BASE_URL"))
MODEL = os.getenv("MODEL_NAME", "gpt-4o-mini")
MAX_ROUNDS = 3


def call_agent(role: str, task: str, context: str = "", temperature: float = 0.2) -> str:
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": f"你是{role}。输出具体、可执行。"},
            {"role": "user", "content": f"任务：{task}\n\n上下文：\n{context or '无'}"},
        ],
        temperature=temperature,
    )
    return (resp.choices[0].message.content or "").strip()

TOPIC = "订单服务是否应该从单体拆分为独立微服务"


def debate_round(topic: str, pro_history: str, con_history: str) -> tuple[str, str]:
    """一轮辩论：正反双方并行发言，各自看到自己的历史。"""
    def argue(side: str, history: str) -> str:
        return call_agent(
            f"辩论选手（{side}方）",
            f"议题：{topic}\n你的历史发言：\n{history or '无'}\n"
            "请给出 2 条新论据，必须包含可量化依据，不要重复旧观点，不超过 120 字。",
            temperature=0.7,
        )

    with ThreadPoolExecutor(max_workers=2) as pool:
        pro = pool.submit(argue, "正", pro_history)
        con = pool.submit(argue, "反", con_history)
        return pro.result(), con.result()


def judge(topic: str, pro: str, con: str) -> dict:
    """裁决：强制输出结构化结论，解析失败也要有兜底值。"""
    raw = call_agent(
        "中立裁决者",
        f"议题：{topic}\n正方：\n{pro}\n反方：\n{con}\n"
        '只输出 JSON：{"winner":"pro 或 con 或 tie","reason":"不超过 80 字","confidence":0.0}',
        temperature=0.0,
    )
    match = re.search(r"\{[\s\S]*\}", raw)
    try:
        data = json.loads(match.group(0)) if match else {}
    except json.JSONDecodeError:
        data = {}
    return {
        "winner": data.get("winner", "tie"),
        "reason": data.get("reason", "裁决输出不可解析"),
        "confidence": float(data.get("confidence", 0.0)),
    }


def run_debate(topic: str) -> dict:
    pro_all, con_all = "", ""
    transcript = []
    verdict = {"winner": "tie", "reason": "未开始", "confidence": 0.0}

    for r in range(1, MAX_ROUNDS + 1):
        pro, con = debate_round(topic, pro_all, con_all)
        pro_all += f"\n第{r}轮：{pro}"
        con_all += f"\n第{r}轮：{con}"
        transcript.append({"round": r, "pro": pro, "con": con})

        verdict = judge(topic, pro_all, con_all)
        if verdict["confidence"] >= 0.8:      # 高置信度提前结束，省 Token
            return {"rounds": r, "verdict": verdict, "transcript": transcript}

    return {"rounds": MAX_ROUNDS, "verdict": verdict, "transcript": transcript}


if __name__ == "__main__":
    result = run_debate(TOPIC)
    print(json.dumps(result["verdict"], ensure_ascii=False, indent=2))
    print("实际轮次：", result["rounds"], "｜发言条数：", len(result["transcript"]) * 2)
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| 正反双方并行发言 | 降低单轮延迟 | 双方互不依赖，串行只会白白多等一倍时间 |
| 历史发言只传自己一方 | 控制上下文 | 传对方历史会诱导模型复读，也会增加 Token |
| `confidence >= 0.8` | 提前停止 | 第 2 轮已高置信，再吵第 3 轮是纯浪费 |
| `temperature=0.0` 裁决 | 稳定输出 | 裁判要的是可复现结论，不是创意 |
| JSON 解析兜底 | 防御性编程 | 裁判也可能输出解释文字，不能让整个流程崩掉 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>不限制发言长度</b>：每轮 500 字，3 轮后双方历史超过 3000 Token，成本翻倍。</li>
<li><b>用同一个模型当选手和裁判</b>：可以，但裁判必须换 system prompt 且温度归零，否则容易偏袒。</li>
<li><b>把“平局”当失败</b>：平局也是结论，应输出双方共识与分歧点，而不是重跑。</li>
<li><b>辩论用于事实查询</b>：查天气、查文档不需要辩论，事实问题用工具，不用立场。</li>
</ul>
</div>

## 综合案例：用多智能体交付“博客登录功能”

**输入**：一句需求“为博客系统设计登录功能，覆盖注册、登录、找回密码，要求能抵御常见爆破攻击”。目标不是直接生成代码，而是产出一份可评审的技术方案。

**流程**：规划 Agent 先拆成 3 个子任务；接口 Agent 与安全 Agent 无依赖，并行执行；测试 Agent 依赖前两者，串行执行；最后汇总 Agent 合并并列出风险。整个流程 5 次模型调用，串并行混合后总延迟约为串行的 60%。

| 阶段 | 负责角色 | 输入 | 交付物 | 验收标准 |
|-|-|-|-|-|
| 规划 | 任务规划专家 | 原始需求 | 3 条子任务与依赖 | 每条含角色、任务、依赖索引 |
| 并行 A | 接口设计专家 | 总目标 | 接口清单与字段定义 | 覆盖注册、登录、找回密码 |
| 并行 B | 安全专家 | 总目标 | 威胁清单与对策 | 至少覆盖爆破、撞库、枚举 |
| 串行 C | 测试专家 | 前两路结论 | 测试用例表 | 每个风险点至少 1 条用例 |
| 汇总 | 项目总负责人 | 三路产出 | 最终方案 + 风险清单 | 无互相矛盾的建议 |

**输出**：汇总节点返回结构化结果，建议同时落库保存，便于复盘。下面是一个可直接展示给评审者的 JSON 形态。

```json
{
  "goal": "博客系统登录功能",
  "modules": ["注册", "登录", "找回密码"],
  "decisions": [
    {"item": "密码存储", "choice": "bcrypt cost=12", "reason": "抗离线爆破"},
    {"item": "登录限流", "choice": "单 IP 每分钟 10 次 + 单账号 5 次", "reason": "兼顾正常用户与攻击防护"}
  ],
  "risks": [
    {"level": "high", "risk": "短信接口被刷", "mitigation": "图形验证码 + 单手机号日限 5 条"},
    {"level": "medium", "risk": "找回密码枚举账号", "mitigation": "统一返回文案，不暴露账号是否存在"}
  ],
  "open_questions": ["是否接入第三方登录"]
}
```

**失败处理**：多智能体不会因为“角色多”就自动可靠，必须为每类失败准备动作。

| 失败模式 | 如何发现 | 处理动作 |
|-|-|-|
| 规划返回空数组 | `tasks` 长度为 0 | 降级为单 Agent 直接执行，并记录一次规划失败 |
| 某个 Agent 超时 | 单次调用超过 30 秒 | 重试 1 次，仍失败则用“该角色缺失”占位继续 |
| 两路结论冲突 | 汇总时检测到相反建议 | 交给裁决节点，按风险优先原则选择更保守方案 |
| 循环不收敛 | 轮次达到 3 或输出哈希连续相同 | 停止循环，交付当前草稿并标注“未通过评审” |
| 预算耗尽 | 累计费用超过 0.5 元 | 立即停止新调用，返回已完成部分 |

<div class="callout tip"><span class="tag">老师建议</span>
<p>课堂演示时，故意把规划 prompt 改成“只输出文字”，让学生看到 <code>ValueError</code> 被抛出，再一起补容错。比单纯讲“要做校验”有效得多。</p>
</div>

## 疑难点分级

| 知识点 | 难度 | 典型卡点 | 破解方式 |
|-|-|-|-|
| 适用边界判断 | 中 | 一上来就堆角色 | 用“可分解、可验证、上下文超限”三问过滤 |
| 串行编排 | 低 | 上下游字段对不上 | 先定义输入输出契约，再写 prompt |
| 并行依赖识别 | 高 | 有依赖也硬并行 | 显式 `depends_on`，先拓扑排序再决定并行集合 |
| 扇入汇总冲突 | 高 | 汇总时各说各话 | 设裁决节点，按风险优先与可验证性排序 |
| 辩论轮次控制 | 高 | 停不下来 | 最大 3 轮 + 置信度阈值 + 字数上限 |
| 共享状态设计 | 高 | 字段越来越多 | 只保留目标、产出、评审、轮次、预算五类 |
| 上下文膨胀 | 中 | Token 随轮次线性上涨 | 摘要压缩 + 硬截断 + 指针替代全文 |
| 规划 JSON 解析 | 中 | 模型夹带解释文字 | 正则提取 + 结构校验 + 空结果降级 |
| 角色漂移 | 高 | 评审 Agent 开始改代码 | system prompt 限定职责 + 输出格式约束 |
| 死循环 | 高 | 两个 Agent 互相甩锅 | 最大轮次 + 无进展哈希检测 + 强制裁决 |
| 条件边写法 | 高 | 图编译后不跳转 | 条件函数返回字符串键，映射到目标节点 |
| `recursion_limit` | 中 | 报递归超限 | 主动调低到 10 到 12，并同步业务轮次 |
| 状态覆盖与累加 | 高 | 节点返回后字段丢失 | 节点只返回自己负责的字段，理解合并语义 |
| 成本核算 | 中 | 跑完才发现很贵 | 每次调用记账，单任务设 0.5 元上限 |
| 人工介入 | 中 | 高风险操作无人确认 | 预算耗尽或置信度低于 0.6 时转人工 |
| 结果可验证性 | 高 | 方案看着好但无法验收 | 每个子任务提前写验收标准 |

## 常见面试题

| 问题 | 考察点 | 答题要点 |
|-|-|-|
| 什么情况下该上多智能体 | 边界判断 | 三个条件同时满足：任务可分解、子任务可验证、单 Agent 上下文接近上限；否则先优化单 Agent |
| 串行、并行、辩论怎么选 | 拓扑理解 | 有阶段依赖选串行；子任务独立选并行；高风险决策选辩论。3 个 4 秒任务串行约 12 秒，并行约 4 到 6 秒 |
| 多 Agent 一定比单 Agent 准吗 | 批判性思维 | 不一定。协调成本与信息损失可能让结果更差，角色超过 5 个时收益通常递减 |
| 如何防止两个 Agent 无限互怼 | 治理手段 | 最大 3 到 5 轮、输出哈希无进展检测、强制裁决节点，三道一起上 |
| 共享状态应该放什么 | 工程设计 | 目标、计划、各角色产出、最近评审、轮次、预算余量；长文本放摘要与指针 |
| LangGraph 的节点和边是什么 | 框架理解 | 节点是处理函数，边是流转；条件边根据状态返回目标节点，适合循环与分支 |
| 节点直接改 state 有什么问题 | 细节掌握 | 可能不触发更新或污染其他分支，应返回新字典由框架合并 |
| 并行结果冲突怎么处理 | 冲突消解 | 先检测相反建议，再按风险优先、证据充分度裁决，最后在输出中标注分歧 |
| 如何控制多 Agent 成本 | 成本意识 | 限制角色数、轮次、上下文长度；每次调用记账；单任务 0.5 元熔断 |
| 辩论模式适合什么场景 | 场景匹配 | 高不确定性、高风险、需要正反证据的决策；不适合事实查询与简单任务 |
| 如何评估多 Agent 系统 | 评估方法 | 固定 20 到 50 条任务集，看端到端通过率、平均轮次、单任务成本、P95 延迟 |
| 上游 Agent 失败怎么办 | 容错设计 | 重试 1 次；仍失败则占位继续并标注缺失，最后在汇总里显式说明 |

## 动手练习

<div class="callout task"><span class="tag">动手练习</span>
<ol>
<li>（低）运行实操一，把 <code>MAX_SUBTASKS</code> 从 5 改成 3，观察规划质量与总耗时。</li>
<li>（低）把 <code>temperature</code> 从 0.2 调到 0.9，记录三次运行结果的差异。</li>
<li>（低）故意让规划节点返回纯文字，确认 <code>ValueError</code> 被正确抛出。</li>
<li>（中）把无依赖子任务改成并行，打印串行与并行的耗时差，计算加速比。</li>
<li>（中）给每个子任务增加“验收标准”字段，并在执行后让评审 Agent 逐条打分。</li>
<li>（中）实现“连续两轮输出哈希相同则退出”，用固定输入构造一次空转。</li>
<li>（中）把汇总上下文的 12000 字符截断改成按 Token 估算截断。</li>
<li>（中）给编排器加一个简单的调用计数器，超过 20 次直接终止。</li>
<li>（高）用 LangGraph 增加一个“人工确认”节点，在预算超过 80% 时暂停等待输入。</li>
<li>（高）把辩论模式改成正反方共享部分事实卡，观察结论稳定性变化。</li>
<li>（高）实现一个裁决失败重试机制：JSON 解析失败时让裁判只回答 pro、con 或 tie。</li>
<li>（高）为三篇不同需求各跑一次编排，统计角色数量与最终方案质量的关系。</li>
<li>（高）给每个 Agent 加独立预算，单角色超支只降级该角色，不影响整体流程。</li>
<li>（高）把整章代码整理成一个小型框架，支持通过配置切换串行、并行、辩论。</li>
</ol>
</div>

## 本章小结

- 多智能体是“降复杂度”的工具，不是炫技；先过适用边界三问，能单人就单人。
- 三种拓扑各有代价：串行延迟相加、并行受最慢分支限制、辩论 Token 成本最高。
- 编排器的最小结构是规划 → 执行 → 汇总，规划结果必须做结构校验与空值降级。
- 状态共享要结构化，只传交接单，不传全部聊天记录，长文本用摘要加指针。
- 状态图擅长表达循环与分支，条件边必须同时判断业务通过条件与最大轮次。
- 四道刹车缺一不可：最大轮次、工具调用上限、墙钟超时、预算熔断。
- 角色漂移靠强约束 system prompt 与输出格式治理，不能靠“请自觉”。
- 评估多智能体要看端到端通过率、平均轮次、单任务成本与 P95 延迟，而不是只看单次观感。

下一章，我们把“工具”做成标准件：用 MCP 协议统一工具的发现、描述、调用与权限。
