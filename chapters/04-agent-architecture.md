## 本章导读

这是全课程最核心的一章。前面学的提示词、结构化输出、函数调用，都是零件；这一章教你把零件**装成一台会自己运转的机器**。我们要实现两样东西：**ReAct 循环**（Reason + Act）与**记忆系统**。

先说清楚痛点。很多人以为“多轮对话 + 几个工具”就是 Agent，结果上线后遇到三类问题：模型反复调用同一个工具，10 轮还在原地打转；上下文越滚越长，第 8 轮开始频繁超时；任务失败时没有任何中间记录，只能靠猜。这三个问题都不是“模型不够聪明”，而是**控制器和预算没设计**。

学完这一章，你应该能做到：手写一个 100 行以内、可运行的最小 Agent；给它加上两个终止条件和三类预算（步数、Token、时间）；实现短期记忆的压缩与长期记忆的向量检索；并且能判断一个需求到底该用 Agent 还是普通工作流。

先摆出五个最常见的误区，讲课可以让学生先猜再揭晓：

1. **把“多轮对话”当 Agent**。没有工具调用、没有观察回传、没有终止判断，只是聊天，不是 Agent。
2. **只写 `while True` 不设上限**。模型一旦陷入“查了再查”，账单会以肉眼可见的速度上涨。
3. **把所有历史原样塞进上下文**。20 轮对话轻松超过 8000 Token，成本翻倍、延迟翻倍，关键指令还被稀释。
4. **以为工具越多越强**。工具超过 20 个，选择准确率明显下降，还会互相干扰。
5. **所有场景都上 Agent**。步骤固定的报表、金额计算、合规校验，用工作流更快、更便宜、更可预测。

<div class="callout plain"><span class="tag">大白话</span>
<p>Agent 就是<b>一个会自己决定下一步干什么的实习生</b>：你给他目标（用户输入）、给他工具箱（tools）、给他一本笔记本（messages），然后规定“最多干 6 步、最多花 20 块钱、干不完就回来问我”。</p>
<p>没有预算和终止条件的 Agent，等于让实习生无限期加班——他可能很努力，但公司会先破产。</p>
</div>

## 教学路径

<div class="callout path"><span class="tag">教学路径</span>
<ol class="path-steps">
<li><b>第 1 步（15 分钟）：</b>理解 ReAct 的三拍子：思考 → 行动 → 观察。<b>产出：</b>能画出一次循环的消息时序图。</li>
<li><b>第 2 步（25 分钟）：</b>手写最小 Agent 循环，先不管优雅，先跑通。<b>产出：</b><code>run_agent()</code> 可运行。</li>
<li><b>第 3 步（15 分钟）：</b>加入两个终止条件与 <code>max_steps</code>，观察死循环如何被截断。<b>产出：</b>步数耗尽的返回结果。</li>
<li><b>第 4 步（15 分钟）：</b>加入 Token 预算与时间预算，打印每一步消耗。<b>产出：</b>带 <code>trace</code> 的执行报告。</li>
<li><b>第 5 步（20 分钟）：</b>实现“无进展检测”，识别重复调用同一工具。<b>产出：</b><code>no_progress</code> 终止案例。</li>
<li><b>第 6 步（20 分钟）：</b>实现短期记忆压缩，注意不要切断 tool 消息对。<b>产出：</b>压缩前后的 Token 对比。</li>
<li><b>第 7 步（20 分钟）：</b>实现长期记忆的写入与检索。<b>产出：</b>跨任务召回用户偏好。</li>
<li><b>第 8 步（15 分钟）：</b>复盘：什么时候不该用 Agent，给出判断清单。<b>产出：</b>一张选型对照表。</li>
</ol>
</div>

## 学习前准备

| 能力 | 最低要求 | 不达标会怎样 |
|-|-|-|
| Python 控制流 | 熟练使用 `for/while`、异常处理、字典 | 写不出循环，或异常直接穿透整个程序 |
| 消息协议 | 知道 `system/user/assistant/tool` 四种角色 | 消息顺序错，第二次请求直接 400 |
| Tool Calling | 跑通过一次 `tool_calls` 闭环 | 不知道 `tool_call_id` 的作用，回传必错 |
| Token 概念 | 知道输入输出都计费、上下文有上限 | 无法理解为什么要压缩历史、为什么要截断结果 |
| 向量基础 | 知道 embedding 是定长向量、余弦相似度 | 长期记忆只能照抄，无法按语义召回 |

工具与材料清单：

| 材料 | 版本或要求 | 用途 |
|-|-|-|
| Python | 3.11 及以上 | 本章代码基线 |
| openai | 1.0 及以上 | 模型调用与工具协议 |
| numpy | 1.24 及以上 | 长期记忆的向量运算 |
| python-dotenv | 任意近期版本 | 读取 `.env` |
| 一个可写目录 | 用于 `memory.json` | 长期记忆持久化 |
| 秒表或计时函数 | `time.time()` 即可 | 观察每步延迟 |

自测题：

| 题目 | 参考答案要点 |
|-|-|
| ReAct 中“观察”是谁产生的 | 不是模型产生，是代码把工具执行结果以 `role="tool"` 写回消息历史 |
| 为什么 `max_steps` 不能省 | 模型可能重复调用同一工具或陷入无效循环；没有上限会无限消耗 Token 与时间 |
| 短期记忆和长期记忆的本质区别 | 短期是本次任务的完整轨迹，放在 messages；长期是跨任务可复用的结论，放在外部存储并按需检索 |

## 核心概念

### 一、什么是 ReAct：三拍子与消息账本

ReAct = **Reason（思考）+ Act（行动）**。模型在每一步先说明自己的推理，再决定调用什么工具，然后读取工具结果，继续下一轮。注意，“思考”不一定是显式的 `Thought:` 文本，现代工具调用模型把推理放在内部，你看到的外在表现就是“这一轮要不要调工具、调哪个”。

真正要理解的是**消息账本**：每一步都在往 `messages` 里追加记录，模型下一轮看到的全部信息都来自这本账。账记错了，后面全错。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| Reason | 模型判断“还缺什么信息、下一步用什么工具” | 第一轮决定先查天气还是先查文档 |
| Act | 模型发起一次或多次工具调用 | 返回 `tool_calls`，含名称与参数 |
| Observation | 代码执行工具并把结果写回 | `role="tool"` + `tool_call_id` |
| Transcript | 整本消息账，Agent 的唯一状态 | `messages` 数组 |
| Step | 一次“模型请求 + 工具执行”的完整回合 | `for step in range(max_steps)` |

<div class="callout plain"><span class="tag">大白话</span>
<p>ReAct 就像<b>看病流程</b>：医生先想“患者发烧咳嗽，可能是感染”（思考）→ 开个血常规（行动）→ 看化验单（观察）→ 再想“白细胞高，是细菌感染”（思考）→ 开药（行动）。</p>
<p>注意：<b>每一步都要基于上一步的结果</b>，而不是一开始就把所有检查全做完。这就是“循环”的意义，也是它比“一次性让模型输出全部步骤”更可靠的原因。</p>
</div>

### 二、Agent 的四个零件

把 Agent 拆开，只有四样东西。任何框架（LangGraph、AutoGen、自己写）本质上都在配置这四样。

| 零件 | 作用 | 设计要点 | 在本项目里的影子 |
|-|-|-|-|
| 模型 | 决策中枢 | 选支持工具调用的模型；简单任务用小模型 | `MODEL` 环境变量 |
| 工具 | 与外部世界交互 | 单一职责、参数强校验、错误结构化 | 天气、检索、计算器 |
| 记忆 | 保存轨迹与经验 | 短期压缩、长期检索、写入去重 | `messages` + `memory.json` |
| 控制器 | 循环、终止、预算、重试 | 所有“防失控”的逻辑都在这里 | `run_agent()` 主循环 |

一个常见误解是“换个更强的模型，Agent 就稳了”。实际项目里，稳定性提升最大的往往不是换模型，而是给控制器加三条规则：**工具结果截断、重复调用检测、失败重试上限**。

<div class="callout plain"><span class="tag">大白话</span>
<p>四个零件就像<b>司机、车、导航、刹车</b>。模型是司机，工具是车能去的路，记忆是导航里的历史路线，控制器是刹车和限速。</p>
<p>很多人只升级司机（换模型），却忘了装刹车（预算与终止）。车越好，冲下悬崖越快。</p>
</div>

### 三、终止条件与预算控制

一个能上线的 Agent，必须有“什么时候停”的明确规则，而且不止一条。任何一条触发都要能安全退出，并说清原因。

| 机制 | 触发条件 | 触发后的行为 | 在本项目里的影子 |
|-|-|-|-|
| 自然终止 | 模型不再返回 `tool_calls` | 返回最终答案 | `if not msg.tool_calls: return` |
| 步数上限 | `step >= max_steps` | 返回“任务未完成，请拆分” | `max_steps=6` |
| Token 预算 | 累计用量超过阈值 | 停止并返回已得结论 | `token_budget=20000` |
| 时间预算 | 墙钟时间超过阈值 | 停止，避免用户等到超时 | `time_budget_s=60` |
| 无进展检测 | 连续两轮调用完全相同 | 判定卡死，主动终止 | 比较 `(name, args)` 签名 |
| 人工确认 | 命中高危工具 | 暂停，等待审批 | 转账、删除类工具 |

关于 `max_steps` 的经验值：**单跳任务 3 到 4 步，多跳检索 6 到 8 步，复杂任务 10 步**。超过 10 步还没收敛，通常不是步数不够，而是任务该拆了。

<div class="callout plain"><span class="tag">大白话</span>
<p>预算控制就是给实习生定 KPI：<b>最多打 6 个电话、最多花 20 块、半小时没结果就回来汇报</b>。</p>
<p>不设上限的后果不是“可能多花一点”，而是“可能花光一个月预算”。真实事故里，一个死循环一晚上烧掉几千美元并不罕见。</p>
</div>

### 四、记忆系统：短期压缩 + 长期检索

Agent 的“记不住”分两种：一种是本次任务聊到后面忘了前面（上下文太长被截断），另一种是下次任务完全不认识这个用户（没有跨会话存储）。对应两种记忆，实现方式完全不同。

| 记忆类型 | 存什么 | 实现方式 | 生命周期 | 在本项目里的影子 |
|-|-|-|-|-|
| 短期记忆 | 本次任务的对话与工具结果 | `messages` 数组 + 压缩 | 一次任务 | 主循环中的消息账本 |
| 长期记忆 | 用户偏好、历史结论、稳定事实 | 向量库 / 数据库 | 跨任务 | `memory.json` + embedding |
| 程序性记忆 | 工具用法、成功策略 | 提示词或规则库 | 长期 | `SYSTEM_PROMPT` 里的规则 |
| 工作记忆 | 当前子目标的中间结果 | 变量或草稿区 | 一个子任务 | `trace` 里的中间结论 |

短期压缩的关键不是“摘要”，而是**压缩后格式仍然合法**：不能把 `assistant(tool_calls)` 和对应的 `tool` 消息拆散，否则下一次请求直接报错。很多教程的压缩函数就栽在这里。

<div class="callout plain"><span class="tag">大白话</span>
<p>短期记忆就像<b>开会记的便签</b>：会议开太久，你不会把每句话都记下来，而是记“结论 + 待办”。</p>
<p>长期记忆就像<b>客户档案</b>：下次客户再来，你先翻档案看他的偏好，而不是从零开始问一遍。档案要按“像不像”来查，所以要用向量。</p>
</div>

## 实操一：手写最小 Agent

目标：三个工具、两个终止条件、三类预算、重复检测、完整 trace，全部放在一个文件里，100 多行。

```python
import json
import os
import time
from typing import Callable

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=os.getenv("OPENAI_BASE_URL"))
MODEL = os.getenv("MODEL_NAME", "gpt-4o-mini")

#---- 1. 工具实现 ----
def get_weather(city: str, unit: str = "celsius") -> dict:
    return {"ok": True, "city": city, "temp": 18, "unit": unit, "desc": "多云"}

def search_docs(query: str) -> dict:
    return {"ok": True, "query": query, "hits": ["Agent 需要设定最大步数", "工具失败要返回结构化错误"]}

def calculator(expression: str) -> dict:
    """受限计算器；生产环境请用 ast 解析，不要直接 eval"""
    try:
        value = eval(expression, {"__builtins__": {}}, {})
    except Exception as e:
        return {"ok": False, "error_code": "BAD_EXPRESSION", "message": str(e)}
    return {"ok": True, "expression": expression, "value": value}

TOOL_IMPL: dict[str, Callable[..., dict]] = {
    "get_weather": get_weather,
    "search_docs": search_docs,
    "calculator": calculator,
}

TOOLS = [
    {"type": "function", "function": {
        "name": "get_weather",
        "description": "查询城市当前天气。用户询问气温、降雨、穿衣建议时调用。",
        "parameters": {"type": "object",
            "properties": {"city": {"type": "string"}, "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}},
            "required": ["city"], "additionalProperties": False}}},
    {"type": "function", "function": {
        "name": "search_docs",
        "description": "检索内部技术文档。问题涉及项目规则、最佳实践时调用。",
        "parameters": {"type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"], "additionalProperties": False}}},
    {"type": "function", "function": {
        "name": "calculator",
        "description": "计算数学表达式，如 18*2 或 (3+5)/2。仅用于算术，不用于查数据。",
        "parameters": {"type": "object",
            "properties": {"expression": {"type": "string"}},
            "required": ["expression"], "additionalProperties": False}}},
]

SYSTEM_PROMPT = """你是一个会使用工具的助手。
规则：
1. 需要外部信息时必须调用工具，不要编造。
2. 每次拿到结果后再决定下一步。
3. 工具返回 ok 为 false 时，判断是改参数、换工具还是如实告知。
4. 信息足够时直接给出最终答案。"""

def execute_tool(name: str, raw_args: str) -> dict:
    if name not in TOOL_IMPL:
        return {"ok": False, "error_code": "TOOL_NOT_FOUND", "message": name}
    try:
        args = json.loads(raw_args or "{}")
        result = TOOL_IMPL[name](**args)
    except Exception as e:
        return {"ok": False, "error_code": "TOOL_ERROR", "message": f"{type(e).__name__}: {e}"}
    # 截断，防止一次结果撑爆上下文
    return json.loads(json.dumps(result, ensure_ascii=False)[:2000])

def run_agent(user_input: str, max_steps: int = 6,
              token_budget: int = 20000, time_budget_s: float = 60.0) -> dict:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_input},
    ]
    trace: list[dict] = []
    used_tokens = 0
    started = time.time()
    last_sig, repeat = None, 0

    for step in range(1, max_steps + 1):
        if used_tokens > token_budget:
            return {"ok": False, "reason": "token_budget_exceeded", "steps": step - 1,
                    "tokens": used_tokens, "trace": trace}
        if time.time() - started > time_budget_s:
            return {"ok": False, "reason": "time_budget_exceeded", "steps": step - 1,
                    "tokens": used_tokens, "trace": trace}

        resp = client.chat.completions.create(
            model=MODEL, messages=messages, tools=TOOLS, temperature=0,
        )
        used_tokens += resp.usage.total_tokens if resp.usage else 0
        msg = resp.choices[0].message

        if not msg.tool_calls:                  # 终止条件一：模型不再要工具
            trace.append({"step": step, "type": "final", "tokens": used_tokens})
            return {"ok": True, "answer": msg.content or "", "steps": step,
                    "tokens": used_tokens, "trace": trace}

        # 无进展检测：连续两轮调用完全相同，说明卡死
        sig = json.dumps([(c.function.name, c.function.arguments) for c in msg.tool_calls], ensure_ascii=False)
        if sig == last_sig:
            repeat += 1
            if repeat >= 2:
                return {"ok": False, "reason": "no_progress", "steps": step,
                        "tokens": used_tokens, "trace": trace}
        else:
            repeat, last_sig = 0, sig

        messages.append(msg)                    # 顺序不能反：assistant 在 tool 之前
        for call in msg.tool_calls:
            result = execute_tool(call.function.name, call.function.arguments)
            trace.append({"step": step, "tool": call.function.name,
                          "args": call.function.arguments, "ok": result.get("ok", False)})
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": json.dumps(result, ensure_ascii=False),
            })

    # 终止条件二：步数用完
    return {"ok": False, "reason": "max_steps_exceeded", "steps": max_steps,
            "tokens": used_tokens, "trace": trace}

if __name__ == "__main__":
    out = run_agent("北京天气怎么样？如果 18 度，帮我算一下华氏度。")
    print(json.dumps(out, ensure_ascii=False, indent=2))
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `TOOL_IMPL` 映射表 | 名字到函数的动态分发 | 避免 `if/elif` 长链，新增工具只改一行 |
| `execute_tool` 统一入口 | 参数解析、异常兜底、结果截断 | 所有工具共享同一套容错，逻辑不会各写各的 |
| `token_budget` | 成本硬上限 | 按 `usage.total_tokens` 累加，比按字符估算准确 |
| `time_budget_s` | 延迟硬上限 | 用户不会等 3 分钟，超时不如早返回部分结论 |
| `sig` 签名比对 | 无进展检测 | 模型常重复同一调用，两轮相同即可判定卡死 |
| `messages.append(msg)` 的位置 | 保持协议顺序 | 必须在追加 `tool` 之前，否则第二次请求 400 |
| `trace` | 可观测性 | 出问题时能看清每一步调了什么、花了多少 Token |
| 返回结构化结果 | 便于上层处理 | `ok/reason/steps/tokens` 可直接进监控与告警 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>没有最大步数</b>：模型可能反复调用同一个工具，成本瞬间爆炸。这是最贵的一课。</li>
<li><b>工具异常直接抛出</b>：一个工具失败导致整个 Agent 挂掉。正确做法是把错误回传给模型。</li>
<li><b>把工具结果只打印不写回</b>：模型看不到结果，会重复调用，直到步数耗尽。</li>
<li><b>用字符数估算 Token</b>：中文、代码、JSON 的折算比例差别很大，预算会严重失真。优先用接口返回的 usage。</li>
<li><b>终止原因不返回</b>：上层无法区分“答完了”和“被截断了”，会把半成品当成品展示给用户。</li>
</ul>
</div>

## 实操二：记忆系统

目标一：把长对话压成摘要，且不破坏消息协议；目标二：把用户偏好存成向量，下次任务按语义召回。

```python
import json
import os
import numpy as np
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=os.getenv("OPENAI_BASE_URL"))
MODEL = os.getenv("MODEL_NAME", "gpt-4o-mini")

def estimate_tokens(text: str) -> int:
    """粗估：中文约 1 字 0.6 到 1 token，这里按 0.7 折算，仅用于触发压缩"""
    return max(1, int(len(text) * 0.7))

def safe_cut(messages: list, keep_recent: int) -> int:
    """找压缩切点，保证不会从 tool 消息开始，避免拆散 assistant/tool 对"""
    idx = max(1, len(messages) - keep_recent)
    while idx < len(messages) and messages[idx]["role"] == "tool":
        idx += 1
    return idx

def compress_history(messages: list, keep_recent: int = 6, max_tokens: int = 3000) -> list:
    total = sum(estimate_tokens(m.get("content") or "") for m in messages)
    if total <= max_tokens or len(messages) <= keep_recent + 1:
        return messages

    cut = safe_cut(messages, keep_recent)
    system_msg = messages[0]                    # system 永远保留
    old, recent = messages[1:cut], messages[cut:]

    summary = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "把对话压缩成不超过 120 字的要点，保留结论、待办与未解决问题。"},
            {"role": "user", "content": json.dumps(old, ensure_ascii=False)},
        ],
        temperature=0,
    ).choices[0].message.content

    return [system_msg, {"role": "system", "content": f"历史摘要：{summary}"}] + recent

#---- 长期记忆：存语义指纹，按相似度召回 ----
def embed(texts: list[str]) -> np.ndarray:
    resp = client.embeddings.create(model="text-embedding-3-small", input=texts)
    return np.array([d.embedding for d in resp.data], dtype=np.float32)

class LongTermMemory:
    def __init__(self, path: str = "memory.json"):
        self.path = path
        self.items: list[dict] = []
        if os.path.exists(path):
            self.items = json.load(open(path, encoding="utf-8"))

    def add(self, text: str, meta: dict | None = None) -> None:
        vec = embed([text])[0]
        self.items.append({"text": text, "meta": meta or {}, "vec": vec.tolist()})
        json.dump(self.items, open(self.path, "w", encoding="utf-8"), ensure_ascii=False)

    def search(self, query: str, top_k: int = 3) -> list[dict]:
        if not self.items:
            return []
        q = embed([query])[0]
        q = q / (np.linalg.norm(q) + 1e-9)
        mat = np.array([it["vec"] for it in self.items], dtype=np.float32)
        mat = mat / (np.linalg.norm(mat, axis=1, keepdims=True) + 1e-9)
        scores = mat @ q
        idx = np.argsort(scores)[::-1][:top_k]
        return [{"text": self.items[i]["text"], "score": float(scores[i])} for i in idx]

if __name__ == "__main__":
    mem = LongTermMemory()
    mem.add("用户偏好：回答尽量简短，先给结论再给原因。", {"user_id": "u_001"})
    mem.add("用户所在时区为 Asia/Shanghai，早上 9 点前不要发提醒。", {"user_id": "u_001"})
    print(mem.search("这个用户喜欢什么样的回答风格"))
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `estimate_tokens` | 触发压缩的阈值判断 | 只是触发器，不用于计费；计费仍以 usage 为准 |
| `safe_cut` | 找合法切点 | 若切点落在 `tool` 上，会拆散消息对，下一次请求直接 400 |
| `system` 永远保留 | 保住角色与规则 | 摘要可能丢掉“必须调用工具”这类硬约束 |
| `old` 压成摘要 | 控制上下文长度 | 保留结论与待办，丢掉寒暄与重复试错 |
| `embed` + 归一化 | 语义相似度 | 归一化后点积等于余弦，省一次除法 |
| `add` 即落盘 | 跨进程可用 | 记忆不落盘，重启就丢，等于没做 |
| `meta` 字段 | 支持按用户过滤 | 多用户场景必须先过滤再算相似度，避免串号 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>按条数截断而不是按 Token</b>：一条工具结果可能 3000 Token，条数少不代表上下文短。</li>
<li><b>压缩后把所有旧消息直接删掉</b>：模型会忘记“已经查过什么”，于是重复调用。</li>
<li><b>长期记忆不做去重</b>：同一偏好存 50 遍，检索结果全是重复内容，反而挤掉有用信息。</li>
<li><b>多用户共用一份记忆</b>：A 用户的偏好被 B 用户召回，这是隐私事故，不是 bug。</li>
</ul>
</div>

## 综合案例：差旅报销 Agent

场景：员工用自然语言提交报销，Agent 负责抽取字段、查规则、判限额、决定是否转人工。

输入示例：

```json
{"text": "下周去上海出差三天，酒店两晚共 1500 元，打车 260 元，客户餐 480 元。"}
```

流程：

1. 用结构化输出抽成 `{city, days, hotel_total, taxi_total, meal_total}`。
2. 调用 `check_policy` 工具，逐项比对限额，返回违规项。
3. 若存在超限或缺少发票，调用 `ask_human` 工具生成待确认清单。
4. 若全部合规，生成报销单号并返回摘要。
5. 任一步工具失败，最多重试一次；仍失败则整体转人工，并保留 trace。

输出示例：

```json
{"claim_id": "BX20261124-001", "approved": false, "issues": [{"item": "hotel", "limit": 1200, "actual": 1500}], "need_invoice": true, "handoff": true}
```

```python
POLICY = {"hotel_per_night": 600, "taxi_total": 300, "meal_total": 500, "invoice_required_over": 200}

def check_policy(city: str, days: int, hotel_total: float,
                 taxi_total: float, meal_total: float) -> dict:
    """纯规则工具：金额计算不要交给模型"""
    issues = []
    hotel_limit = POLICY["hotel_per_night"] * max(days - 1, 1)   # 三天两晚
    if hotel_total > hotel_limit:
        issues.append({"item": "hotel", "limit": hotel_limit, "actual": hotel_total})
    if taxi_total > POLICY["taxi_total"]:
        issues.append({"item": "taxi", "limit": POLICY["taxi_total"], "actual": taxi_total})
    if meal_total > POLICY["meal_total"]:
        issues.append({"item": "meal", "limit": POLICY["meal_total"], "actual": meal_total})
    return {"ok": True, "approved": not issues, "issues": issues,
            "need_invoice": max(hotel_total, taxi_total, meal_total) > POLICY["invoice_required_over"]}

if __name__ == "__main__":
    print(check_policy("上海", 3, 1500, 260, 480))
    # 输出：hotel 超限 300 元，approved 为 False，need_invoice 为 True
```

失败处理按类型分流：

| 失败类型 | 表现 | 处理 |
|-|-|-|
| 字段抽取失败 | 结构化输出降级，`_degraded=True` | 重试一次；仍失败转人工，不要猜金额 |
| 金额缺失 | 必填字段为空 | 调用 `ask_human` 补录，不默认填 0 |
| 规则工具异常 | `ok=False` | 重试一次；仍失败则整单挂起，禁止“模型自行判断合规” |
| 超限 | `approved=False` | 生成违规清单，交人工审批，不自动拒绝 |
| 步数耗尽 | `max_steps_exceeded` | 返回已完成部分 + trace，提示用户补充信息 |

<div class="callout tip"><span class="tag">老师建议</span>
<p>涉及钱、权限、合规的判断，一律做成<b>确定性工具</b>，让模型只负责“填参数”和“解释结果”。让模型心算 1500 除以 2 是否超过 600，是在给自己埋雷。</p>
<p>Agent 的价值在于“理解自然语言输入 + 编排流程”，不在于“算得准”。算得准交给代码。</p>
</div>

## 什么时候不该用 Agent

<div class="callout tip"><span class="tag">老师建议</span>
<p>以下场景，用工作流更划算：</p>
<ul>
<li>步骤固定、异常情况少（如每天定时生成报表）。</li>
<li>结果必须 100% 可预测（如金额计算、合规校验）。</li>
<li>延迟要求极高（Agent 多轮调用天然慢，通常 3 轮就要 5 到 15 秒）。</li>
<li>工具调用成本敏感（每多一轮就多一次完整上下文计费）。</li>
</ul>
<p>判断标准：<b>路径是否需要临场判断</b>。不需要，就别上 Agent；需要但分支有限，用工作流 + 一个分类节点往往更好。</p>
</div>

一张选型对照表：

| 场景特征 | 推荐方案 | 理由 |
|-|-|-|
| 固定 3 步以内的数据处理 | 工作流 | 可预测、可测试、延迟低 |
| 需要按结果决定下一步，分支多 | Agent | 临场判断是它的强项 |
| 金额、权限、合规 | 工作流 + 规则引擎 | 不允许概率性错误 |
| 开放式研究、多源检索 | Agent | 路径无法预先枚举 |
| 高并发、低延迟 | 工作流或小模型 + 缓存 | Agent 多轮放大会放大成本与延迟 |

## 疑难点分级

| 知识点 | 难度 | 典型卡点 | 破解方式 |
|-|-|-|-|
| ReAct 循环结构 | 高 | 不知道何时停止 | 明确终止条件：无 `tool_calls`、达到步数、预算耗尽 |
| 消息顺序 | 高 | 第二次请求报 400 | 严格 `assistant` → `tool`，`tool_call_id` 一一对应 |
| 工具错误处理 | 中 | 一错就全崩 | 捕获异常并回传结构化错误 |
| 记忆压缩 | 高 | 历史越来越长 | 摘要 + 保留最近 N 条，按 Token 触发 |
| 压缩切点 | 高 | 切在 `tool` 消息上导致 400 | `safe_cut` 向后找到非 tool 边界 |
| 成本控制 | 中 | 一次任务烧很多 Token | 步数上限 + 结果截断 + 只传必要历史 |
| 无进展检测 | 高 | 模型反复调同一工具 | 比对 `(name, args)` 签名，连续两轮即终止 |
| Token 估算 | 中 | 预算与实际差一倍 | 用 `usage.total_tokens`，不要只按字符估 |
| 长期记忆写入 | 中 | 越存越多、检索变差 | 去重、加时间戳、定期合并 |
| 长期记忆召回 | 高 | 召回不相关偏好 | 先按用户过滤，再算相似度，设分数阈值 |
| 多用户隔离 | 高 | 偏好串号 | 记忆分区，`meta.user_id` 强制过滤 |
| 并行工具调用 | 高 | 只处理第一个 | 遍历全部 `tool_calls`，按 `id` 回传 |
| 工具结果过长 | 中 | 上下文被撑爆 | 截断 2000 字符或先摘要 |
| 超时与限流 | 中 | 429 后立即重试 | 指数退避 + 并发上限 |
| 可观测性 | 中 | 失败无法复盘 | 记录 `trace`：步数、工具、参数、耗时、Token |
| Agent 选型 | 高 | 什么需求都上 Agent | 按“路径是否需要临场判断”做判断 |

## 常见面试题

| 问题 | 考察点 | 答题要点 |
|-|-|-|
| ReAct 和普通多轮对话的本质区别 | 概念边界 | ReAct 每轮有“行动 + 观察”闭环，观察来自真实工具；普通对话只有文本往返，没有外部状态改变 |
| 一个可上线的 Agent 需要哪些终止条件 | 工程思维 | 至少四条：无 `tool_calls`、`max_steps`、Token 预算、时间预算；再加无进展检测与人工确认 |
| `max_steps` 设多少合适 | 经验值 | 单跳 3 到 4，多跳 6 到 8，复杂 10；超过 10 步不收敛应拆任务 |
| 为什么工具异常要回传给模型 | 容错设计 | 让模型能改参数、换工具或如实告知；直接抛出会让整个任务失败，且模型无从修正 |
| 短期记忆怎么压缩 | 工程细节 | 按 Token 触发，system 保留，旧消息摘要成 120 字以内，最近 6 条原样保留，切点避开 `tool` 消息 |
| 压缩时最容易出什么错 | 协议细节 | 切点落在 `tool` 消息上，导致 `assistant(tool_calls)` 与 `tool` 分离，请求 400 |
| 长期记忆怎么实现 | 架构 | embedding + 向量检索；写入去重、带 `meta` 过滤；召回设相似度阈值，低于阈值不注入 |
| 什么时候不该用 Agent | 选型判断 | 步骤固定、结果必须确定、延迟敏感、成本敏感；用工作流或规则引擎更合适 |
| 如何防止 Agent 死循环 | 控制策略 | 步数上限、重复调用签名检测、同工具调用次数上限、Token 预算四层防护 |
| 并行工具调用如何回传 | 协议 | 每条结果单独一条 `role="tool"` 消息，`tool_call_id` 对应各自调用，顺序不要求一致 |
| 如何做 Agent 的可观测性 | 运维 | 记录每步工具名、参数、结果摘要、耗时、Token；失败时输出 trace；关键指标做告警 |
| 高风险工具如何治理 | 安全 | 白名单、参数上限、二次确认、人工审批、审计日志、最小权限 |
| 如何评估一个 Agent 好不好 | 评估 | 任务成功率、平均步数、平均 Token、P95 延迟、人工接管率；用固定测试集回归 |

## 动手练习

<div class="callout task"><span class="tag">动手练习</span>
<ol>
<li>（低）给 Agent 增加第三个工具 <code>calculator</code>，实现“先查天气再算温差”的多步任务。</li>
<li>（低）把 <code>max_steps</code> 改为 2，观察复杂任务如何失败，理解为什么需要拆任务。</li>
<li>（低）让 <code>get_weather</code> 故意抛异常，验证 Agent 能否优雅处理。</li>
<li>（中）用 <code>compress_history</code> 处理一段 20 轮对话，对比压缩前后的 Token 数。</li>
<li>（中）把 <code>token_budget</code> 设为 3000，构造一个检索型任务，观察在哪一步被截断。</li>
<li>（中）实现无进展检测，构造“模型反复查同一城市”的场景并验证能终止。</li>
<li>（中）给 <code>trace</code> 加上每步耗时，找出最慢的一次工具调用。</li>
<li>（中）把工具结果截断阈值从 2000 改成 500，观察答案质量与 Token 的变化。</li>
<li>（中）实现长期记忆的写入去重：相同文本不重复入库，统计条目数变化。</li>
<li>（高）给记忆加 <code>user_id</code> 过滤，验证 A 用户的偏好不会被 B 用户召回。</li>
<li>（高）把 Agent 改成“流式输出 + 步数进度回调”，在终端实时打印每一步。</li>
<li>（高）把工具调用改成并发执行，对比串行与并发的总耗时（构造两个慢工具）。</li>
<li>（高）为差旅报销案例加人工审批节点：超限时暂停并等待确认，确认后继续。</li>
<li>（高）写一份选型说明：给定三个需求（日报生成、客服问答、合同审查），分别说明为什么用或不用 Agent。</li>
</ol>
</div>

## 本章小结

- ReAct = 思考 → 行动 → 观察 → 再思考，本质是一个带工具调用的受控循环。
- Agent 只有四个零件：模型、工具、记忆、控制器；稳定性主要来自控制器，不是模型大小。
- 一个可用的循环必须有多个终止条件：无 `tool_calls`、步数上限、Token 预算、时间预算、无进展检测。
- 工具异常要回传给模型，而不是让程序崩溃；金额、权限、合规判断交给确定性代码。
- 短期记忆靠“按 Token 触发的摘要 + 保留最近 N 条”，切点必须避开 `tool` 消息。
- 长期记忆靠 embedding + 向量检索，写入要去重、读取要先按用户过滤。
- 全程要留 `trace`：步数、工具、参数、耗时、Token，否则失败无法复盘。
- 路径固定、结果必须确定、延迟敏感的场景，工作流优于 Agent。

到这里，你的 Agent 已经会“办事”了。但它还不认识你的私有知识，也不擅长在大量文档里找依据——下一章 RAG 来解决。
