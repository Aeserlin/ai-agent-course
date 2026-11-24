## 本章导读

模型再聪明，如果输出是一段自然语言，程序也没法直接用。你在前面几章已经见过这个问题：同样的提示词，模型这次返回 `{"sentiment": "negative"}`，下次返回“这个用户看起来很不满意，置信度约 0.85”，第三次干脆多写了一句解释。对聊天来说这没问题，对 Agent 来说这是灾难——下一步代码要取 `data["confidence"]`，取不到就直接抛 `KeyError`。

这一章解决两件事：**让输出变成可靠的 JSON**（结构化输出），**让模型主动调用你的函数**（Function Calling / Tool Calling）。这两件事是 Agent 从“聊天”走向“干活”的分水岭。没有它们，你写的只是一个大号聊天框；有了它们，模型才能成为流水线里的一个可编程节点。

学完这一章，你应该能做到：用 JSON Schema 精确描述期望结构；用 Pydantic 在本地做二次校验；跑通“请求 → `tool_calls` → 执行 → 回传 → 再请求”的完整闭环；在解析失败时用重试与降级兜住，而不是让服务 500；并且能判断一个工具描述写得对不对。

最常见的五个误区，先摆在这里，讲课时可以让学生先猜再揭晓：

1. **以为 `response_format={"type": "json_object"}` 就能保证字段正确**。它只保证“是合法 JSON”，不保证有你需要的字段，也不保证类型对。
2. **以为模型会执行函数**。模型只是返回“我想调用 `get_weather`，参数是北京”，真正执行的是你的代码。
3. **工具描述只写“查询天气”**。模型不知道什么时候该用、参数填什么，于是该调不调、乱调。
4. **解析失败就整体重跑同一段请求**。同样的输入 + 同样的温度，大概率得到同样的错误；正确做法是把错误回传给模型让它修。
5. **用 `temperature=0.8` 做信息抽取**。结构化任务要的是稳定复现，不是文采。

<div class="callout plain"><span class="tag">大白话</span>
<p>自然语言输出像<b>手写信</b>，人能看懂但机器难处理；结构化输出像<b>填好的表格</b>，每一栏都有固定位置，程序直接取值。</p>
<p>Agent 要串联多个步骤，上一步的结果必须能被下一步稳定读取，所以必须结构化。你可以把“结构化输出”理解成给模型发一张<b>带格子的答题卡</b>，而不是一张白纸。</p>
</div>

## 教学路径

<div class="callout path"><span class="tag">教学路径</span>
<ol class="path-steps">
<li><b>第 1 步（15 分钟）：</b>用 JSON Schema 描述你要的结构，理解“约束”比“祈祷”可靠。<b>产出：</b>一份带 <code>enum</code>、<code>required</code>、<code>min/max</code> 的 schema 文件。</li>
<li><b>第 2 步（20 分钟）：</b>把 schema 接进 <code>response_format</code>，跑通一次结构化输出。<b>产出：</b>能打印出 dict 的脚本。</li>
<li><b>第 3 步（20 分钟）：</b>引入 Pydantic 做本地校验，观察非法数据如何被拦下。<b>产出：</b>校验失败的报错样例。</li>
<li><b>第 4 步（15 分钟）：</b>实现“错误回传 + 重试 + 降级”三级兜底。<b>产出：</b><code>extract_ticket</code> 函数。</li>
<li><b>第 5 步（20 分钟）：</b>定义工具、传入 <code>tools</code> 参数、接收 <code>tool_calls</code>。<b>产出：</b>第一次工具调用日志。</li>
<li><b>第 6 步（25 分钟）：</b>实现“模型请求 → 你执行 → 结果回传”的完整闭环，并支持多轮。<b>产出：</b>可跑的多步任务。</li>
<li><b>第 7 步（15 分钟）：</b>按“四铁律”重写工具描述，对比调用准确率。<b>产出：</b>改写前后的调用记录。</li>
<li><b>第 8 步（15 分钟）：</b>做一个小型批量抽取流水线，统计失败率。<b>产出：</b>带成功率与降级次数的报告。</li>
</ol>
</div>

## 学习前准备

先把门槛说清楚。这一章不是“听懂了就会”，下面三项任何一项不达标，课上一定卡壳。

| 能力 | 最低要求 | 不达标会怎样 |
|-|-|-|
| Python 基础 | 会写函数、字典、`try/except`、类型注解 | 看不懂 `**args` 解包，调试时无从下手 |
| HTTP 与 API | 知道请求/响应、JSON、状态码 400/429 | 遇到 `tool_call_id` 报错只会重装环境 |
| OpenAI SDK | 用 `openai>=1.0` 发过一次 `chat.completions.create` | 把旧版 `openai.ChatCompletion` 写法混进来，直接报错 |
| 环境变量 | 会用 `.env` 与 `load_dotenv()` | API Key 写死在代码里，泄露风险 |
| 调试习惯 | 会打印中间变量、会看完整报错 | 只看到“解析失败”，不知道是模型错还是代码错 |

工具与材料清单：

| 材料 | 版本或要求 | 用途 |
|-|-|-|
| Python | 3.11 及以上 | 本章代码基线 |
| openai | 1.0 及以上（建议最新 1.x） | 调用模型与工具 |
| pydantic | 2.x | 本地校验，`model_validate_json` 只在 v2 可用 |
| python-dotenv | 任意近期版本 | 读取 `.env` |
| API Key | 支持 `json_schema` 与 `tools` 的模型 | 没有可用账号时，先读代码，跑通再说 |
| 一个空目录 | 放 `03_demo.py` | 避免与旧脚本混在一起 |

安装命令：

```bash
pip install "openai>=1.0" "pydantic>=2" python-dotenv
```

三道自测题，答不上来就先补前置知识：

| 题目 | 参考答案要点 |
|-|-|
| JSON Schema 里 `required` 和 `additionalProperties: false` 分别管什么 | `required` 管“哪些字段必须有”；`additionalProperties: false` 管“不许出现没声明的字段”。两者配合才能把结构收紧 |
| `json.loads` 抛 `JSONDecodeError` 的根本原因是什么 | 输入不是合法 JSON，常见于模型多写了“好的，结果如下”这类前后缀，或字符串里有未转义的引号 |
| Function Calling 中模型到底返回了什么 | 返回 `tool_calls` 列表，每项含 `id`、`function.name`、`function.arguments`（JSON 字符串），不含执行结果 |

## 核心概念

### 一、JSON Schema：把“随便说”变成“填表”

JSON Schema 是一份描述“JSON 应该长什么样”的声明式文档。你声明 `type`、`properties`、`required`、`enum`、`minimum`，模型就按这个格子填。它的价值不是“好看”，而是把**隐式约定变成显式契约**：以前你在提示词里写“请返回情感和置信度”，现在是机器可校验的规则。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| `type` | 字段的数据类型，如 `object`、`string`、`integer` | 情感分析里 `confidence` 必须是 `number`，不能是字符串 `"0.85"` |
| `properties` | 对象有哪些字段，各自 schema 是什么 | 工单的 `category`、`priority`、`summary` |
| `required` | 哪些字段必须出现，缺一即非法 | 缺 `summary` 的抽取结果直接判失败 |
| `enum` | 取值只能从固定集合里选 | `category` 只允许 `billing/bug/feature/other` |
| `minimum` / `maximum` | 数值上下界 | `priority` 限定 1 到 5，防止模型返回 0 或 99 |
| `additionalProperties` | 是否允许未声明字段 | 设为 `false` 可避免模型塞一堆“解释性字段” |
| `strict` | 服务端严格模式开关 | 只有支持 structured outputs 的模型才认，开启后模型侧保证符合 schema |

一张 schema 的约束力，和它的严格程度成正比。下面两版对比，左边几乎等于没约束：

```json
{
  "type": "object",
  "properties": {
    "priority": {"type": "string"}
  }
}
```

```json
{
  "type": "object",
  "properties": {
    "priority": {"type": "integer", "minimum": 1, "maximum": 5}
  },
  "required": ["priority"],
  "additionalProperties": false
}
```

左边模型可以返回 `"高"`、`"P0"`、`"3（紧急）"`，你的 `int()` 全部崩掉；右边只可能是 1 到 5 的整数。

<div class="callout plain"><span class="tag">大白话</span>
<p>JSON Schema 就是<b>表格的印刷模板</b>。你印好格子、标好“必填”、限定“只能选 A/B/C”，模型就只能往里填。</p>
<p>不写 schema 等于递给模型一张白纸，然后祈祷它写对格式——这在 demo 里能过，上线第一天就会被真实输入打穿。</p>
</div>

### 二、Pydantic：把契约写成代码

schema 是给模型看的，Pydantic 是给你自己看的。两份东西描述同一个结构，一份发给模型做约束，一份留在本地做校验。这看起来重复，实际上是**纵深防御**：模型侧的严格模式可能因为换模型、换网关、降级到小模型而失效，本地校验永远在你手里。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| `BaseModel` | 声明数据模型的基类 | `class Ticket(BaseModel)` |
| `Field` | 给字段加约束与默认值 | `priority: int = Field(ge=1, le=5)` |
| `Literal` | 枚举类型的类型注解写法 | `category: Literal["billing", "bug"]` |
| `model_validate_json` | 直接从 JSON 字符串解析并校验 | 省掉一次 `json.loads`，报错信息更具体 |
| `ValidationError` | 校验失败异常，含字段级原因 | 把 `e` 原样回传给模型做修复 |
| `model_json_schema()` | 由模型反生成 schema | 避免 schema 与代码两处维护、逐渐漂移 |

为什么强调“两处维护会漂移”？举个真实场景：产品要求 `priority` 从 1 到 5 改成 1 到 3，你只改了 Pydantic 没改 schema，模型继续返回 4 和 5，本地校验天天报错。反过来只改 schema 不改 Pydantic，非法数据会直接进数据库。**要么用 `model_json_schema()` 单一来源，要么在 CI 里加一条断言比对两者。**

<div class="callout plain"><span class="tag">大白话</span>
<p>JSON Schema 是<b>贴在门上的规矩</b>，Pydantic 是<b>门口的保安</b>。规矩写得再清楚，也总有人不看；保安会真的把你拦下来。</p>
<p>只贴规矩不设保安，遇到不听话的模型（或者降级后的小模型）就全线崩；只设保安不贴规矩，模型每次都靠猜，重试成本高。</p>
</div>

### 三、Function Calling：让模型“申请”调用工具

Function Calling 的本质一句话：**模型不执行函数，它只是告诉你“我想调用哪个函数、参数是什么”**。执行权始终在你的代码里。OpenAI 在 2024 年之后统一叫 Tool Calling，两者在 `chat.completions` 接口里是同一套字段。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| `tools` | 工具声明数组，每项含 `name`、`description`、`parameters` | 天气、检索、计算器三个工具 |
| `tool_choice` | 调用策略，`auto`/`none`/`required`/指定函数 | 强制先检索时用 `required` 或指定函数 |
| `tool_calls` | 模型返回的调用申请列表，可能一次多个 | 并行查北京和上海天气 |
| `tool_call_id` | 调用与结果的关联 ID | 回传结果时必须原样带回 |
| `arguments` | 参数 JSON 字符串，注意是字符串不是对象 | 必须 `json.loads` 后再用 |
| `role="tool"` | 工具结果消息的角色 | 顺序错了服务端直接 400 |

全流程是五拍：**声明工具 → 第一次请求 → 收到 `tool_calls` → 本地执行并回传 → 第二次请求生成最终答案**。很多同学只做到第三次请求就以为结束了，结果模型拿到工具结果后还想再调一个工具，于是需要把整个流程放进 `while` 循环，直到模型不再返回 `tool_calls`。

<div class="callout plain"><span class="tag">大白话</span>
<p>Function Calling 就像<b>员工填报销单</b>：员工（模型）不能直接从公司账户拿钱，他只能填一张单子（<code>tool_calls</code>）说明“我要报销什么、多少钱”。财务（你的代码）审核后真正打款（执行函数），再把结果告诉员工。</p>
<p>为什么不让模型直接执行？因为<b>执行权必须留在人手里</b>，否则模型可以删库、转账、发邮件。你才是那个按按钮的人。</p>
</div>

### 四、工具设计的四条铁律

工具描述是“模型能否正确调用”的第一决定因素，比模型大小还重要。同一个模型，描述写得好坏，调用准确率能差出 30 个百分点以上。

| 铁律 | 反例 | 正例 | 在本项目里的影子 |
|-|-|-|-|
| 一个工具只做一件事，名字用动词开头 | `handle_data` 同时查库、算钱、发邮件 | `get_order`、`refund_order` 分开 | 天气和文档检索必须是两个工具 |
| 描述写清“什么时候用”，不只写“是什么” | “查询天气” | “查询城市当前天气。用户询问气温、下雨、穿衣建议时调用；不用于历史天气” | 不写触发条件，模型遇到“明天要不要带伞”就不调 |
| 参数少而明确，枚举优于自由字符串 | `date: string` 让模型自由发挥 | `unit: enum[celsius, fahrenheit]` | `priority` 用 1 到 5，而不是“高/中/低” |
| 返回结构化结果，错误也结构化 | 抛异常或返回 `"失败"` | `{"ok": false, "error_code": "CITY_NOT_FOUND"}` | Agent 靠错误码决定重试还是换城市 |

<div class="callout plain"><span class="tag">大白话</span>
<p>工具描述就像<b>给新同事写的操作手册</b>：只写“管数据”，他永远不知道该在什么场景下手；写清“用户问订单金额时用，退款时不要用”，他才知道边界在哪。</p>
<p>模型就是那个新同事。写完描述做一次“<b>盲测</b>”：把描述给没看过代码的同事，看他会不会调。他犹豫的地方，就是模型犹豫的地方。工具总数控制在 <b>5 到 8 个</b>比较舒服；超过 20 个，选择准确率明显下降，这时应该做工具路由，而不是继续堆。</p>
</div>

## 实操一：可校验的结构化抽取

目标：从一段用户抱怨里抽出工单结构，要求字段合法、失败可兜底。代码可直接运行，只需要 `.env` 里有 `OPENAI_API_KEY`。

先看基线版：只用 `json_object`，靠提示词描述格式。它能跑通，但不保证字段齐全。

```python
resp = client.chat.completions.create(
    model=MODEL,
    messages=[
        {"role": "system", "content": "你是情感分析器。只输出 JSON，字段为 sentiment、confidence。"},
        {"role": "user", "content": "这个版本更新后卡顿严重，太失望了。"},
    ],
    temperature=0,
    response_format={"type": "json_object"},   # 只保证是合法 JSON，不保证字段
)
print(resp.choices[0].message.content)         # 字段是否齐全，要靠运气
```

生产版把结构交给 schema 和 Pydantic 双重约束：

```python
import json
import os
from typing import Literal

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field, ValidationError

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=os.getenv("OPENAI_BASE_URL"))
MODEL = os.getenv("MODEL_NAME", "gpt-4o-mini")

#---- 1. 手写 JSON Schema：类型、枚举、范围、必填、禁止额外字段，全部收紧 ----
TICKET_SCHEMA = {
    "type": "object",
    "properties": {
        "category": {"type": "string", "enum": ["billing", "bug", "feature", "other"]},
        "priority": {"type": "integer", "minimum": 1, "maximum": 5},
        "summary": {"type": "string", "minLength": 5, "maxLength": 60},
        "keywords": {"type": "array", "items": {"type": "string"}, "maxItems": 5},
    },
    "required": ["category", "priority", "summary", "keywords"],
    "additionalProperties": False,
}

#---- 2. 同一份契约的本地版本，负责二次校验（注意字段与 schema 一一对应）----
class Ticket(BaseModel):
    category: Literal["billing", "bug", "feature", "other"]
    priority: int = Field(ge=1, le=5)
    summary: str = Field(min_length=5, max_length=60)
    keywords: list[str] = Field(max_length=5)

def extract_ticket(text: str, max_repair: int = 2) -> dict:
    """三级兜底：严格 schema -> 错误回传修复 -> 规则降级"""
    messages = [
        {"role": "system", "content": "你是工单抽取器，只输出符合 schema 的 JSON，不要解释。"},
        {"role": "user", "content": text},
    ]
    for attempt in range(max_repair + 1):
        resp = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0,                      # 抽取任务必须稳定
            response_format={
                "type": "json_schema",
                "json_schema": {"name": "ticket", "strict": True, "schema": TICKET_SCHEMA},
            },
        )
        raw = resp.choices[0].message.content or ""
        try:
            return Ticket.model_validate_json(raw).model_dump()
        except (ValidationError, json.JSONDecodeError) as e:
            if attempt == max_repair:           # 重试次数用完，进入降级
                break
            # 关键：把错误原文回传给模型，让它针对性修复，而不是重复同一请求
            messages.append({"role": "assistant", "content": raw})
            messages.append({
                "role": "user",
                "content": f"上面的输出不合法：{e}。请只输出修正后的 JSON，不要解释。",
            })
    # 3. 降级：宁可用保守值进人工审核队列，也不要让整个请求失败
    return {
        "category": "other",
        "priority": 3,
        "summary": text[:60].strip() or "待人工处理",
        "keywords": [],
        "_degraded": True,
    }

if __name__ == "__main__":
    result = extract_ticket("昨天扣了两次会员费，请立刻退款，否则我要投诉。")
    print(json.dumps(result, ensure_ascii=False, indent=2))
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `TICKET_SCHEMA` | 发给模型的强约束 | 每个字段都有类型与范围，模型没有自由发挥的空间 |
| `additionalProperties: False` | 禁止多余字段 | 不写的话模型常附赠 `reason`、`explanation`，白烧 Token 还干扰校验 |
| `strict: True` | 开启服务端严格模式 | 需要模型支持；不支持时接口会报错，正好暴露环境问题，而不是静默降级 |
| `Ticket.model_validate_json` | 一步完成解析与校验 | 比 `json.loads` + 手动判空少 20 行代码，报错还带字段名 |
| `except (ValidationError, JSONDecodeError)` | 同时兜住“不是 JSON”和“字段不对” | 两种失败原因不同，但处理策略相同：回传错误、重试 |
| `messages.append({"role": "assistant", ...})` | 把错误输出放进历史 | 不追加的话，模型看不到自己写错了什么，修复无从谈起 |
| `_degraded: True` | 标记降级结果 | 下游可以据此把单子路由到人工，而不是当成正常数据入库 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>重试时原样再发一遍</b>：<code>temperature=0</code> 下大概率得到同样的错误，纯浪费钱。必须把错误信息作为新消息追加。</li>
<li><b>把异常吞掉直接返回 <code>{}</code></b>：下游以为成功，空字段进了报表，比报错更难查。</li>
<li><b>降级值不留标记</b>：人工审核无法区分“模型判断为 other”和“系统兜底为 other”。</li>
<li><b>用 <code>except Exception</code> 一把抓</b>：超时、限流也被当成格式错误去重试，429 会越重试越糟。</li>
</ul>
</div>

## 实操二：Function Calling 完整闭环

目标：让模型自己决定查天气还是查文档，支持多轮、多工具、并行调用，并且任何工具异常都不会让程序崩掉。

```python
import json
import os
from typing import Callable, Literal

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field, ValidationError

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=os.getenv("OPENAI_BASE_URL"))
MODEL = os.getenv("MODEL_NAME", "gpt-4o-mini")

#---- 1. 工具参数模型：模型传错也能被本地拦住 ----
class WeatherArgs(BaseModel):
    city: str = Field(min_length=2, max_length=20)
    unit: Literal["celsius", "fahrenheit"] = "celsius"

class SearchArgs(BaseModel):
    query: str = Field(min_length=1, max_length=100)

#---- 2. 真实工具实现 ----
def get_weather(city: str, unit: str = "celsius") -> dict:
    return {"ok": True, "city": city, "temp": 18, "unit": unit, "desc": "多云"}

def search_docs(query: str) -> dict:
    return {"ok": True, "query": query, "hits": ["Agent 需要设定最大步数", "工具失败要返回结构化错误"]}

#---- 3. 分发表：工具名 -> (参数模型, 实现函数) ----
REGISTRY: dict[str, tuple[type[BaseModel], Callable[..., dict]]] = {
    "get_weather": (WeatherArgs, get_weather),
    "search_docs": (SearchArgs, search_docs),
}

TOOLS = [
    {"type": "function", "function": {
        "name": "get_weather",
        "description": "查询城市当前天气。用户询问气温、降雨、穿衣建议时调用；不用于历史天气。",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "城市中文名，如 北京"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
            },
            "required": ["city"],
            "additionalProperties": False,
        },
    }},
    {"type": "function", "function": {
        "name": "search_docs",
        "description": "检索内部技术文档。问题涉及项目规则、最佳实践、参数建议时调用。",
        "parameters": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
            "additionalProperties": False,
        },
    }},
]

def run_tool(name: str, raw_args: str) -> dict:
    """参数解析 + 校验 + 执行 + 截断，任何一步失败都返回结构化错误"""
    if name not in REGISTRY:
        return {"ok": False, "error_code": "TOOL_NOT_FOUND", "message": name}
    arg_model, fn = REGISTRY[name]
    try:
        args = arg_model.model_validate_json(raw_args or "{}")
    except ValidationError as e:
        return {"ok": False, "error_code": "BAD_ARGS", "message": e.errors()[0]["msg"]}
    try:
        result = fn(**args.model_dump())
    except Exception as e:
        return {"ok": False, "error_code": "EXEC_ERROR", "message": f"{type(e).__name__}: {e}"}
    # 结果截断：防止一次检索把 3 万字符塞回上下文
    return json.loads(json.dumps(result, ensure_ascii=False)[:2000])

SYSTEM_PROMPT = """你是一个会使用工具的助手。
规则：
1. 需要外部信息时调用工具，不要编造。
2. 拿到结果后再决定下一步，信息足够就直接回答。
3. 工具返回 ok 为 false 时，根据 error_code 决定换参数重试、换工具或如实告知用户。"""

def run_agent(user_input: str, max_steps: int = 6) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_input},
    ]
    for step in range(max_steps):
        resp = client.chat.completions.create(
            model=MODEL, messages=messages, tools=TOOLS,
            tool_choice="auto", temperature=0,
        )
        msg = resp.choices[0].message
        if not msg.tool_calls:                  # 终止条件：模型不再要工具
            return msg.content or ""
        messages.append(msg)                    # 必须先记录 assistant 的调用意图
        for call in msg.tool_calls:             # 支持并行多个 tool_calls
            result = run_tool(call.function.name, call.function.arguments)
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,        # 必须与调用一一对应
                "content": json.dumps(result, ensure_ascii=False),
            })
    return "已达到最大步数，任务未完成，请拆分为更小的任务。"

if __name__ == "__main__":
    print(run_agent("北京今天天气如何？顺便查一下 Agent 的最佳实践。"))
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `REGISTRY` 分发表 | 工具名映射到参数模型与函数 | 新增工具只加一行，不用写 `if/elif` 长链 |
| `WeatherArgs` / `SearchArgs` | 本地参数校验 | 模型可能给 `unit` 传“摄氏度”或漏 `city`，先拦住再回传错误 |
| `raw_args or "{}"` | 兜住空参数 | 无参工具时 `arguments` 可能是空串，直接 `json.loads` 会崩 |
| `[:2000]` 截断 | 控制上下文体积 | 一次检索返回上万字，会把关键指令挤出窗口 |
| `messages.append(msg)` | 保持消息顺序 | 顺序必须是 `assistant(tool_calls)` 在前、`tool` 在后，否则 400 |
| `for call in msg.tool_calls` | 支持并行调用 | 模型一次可能申请查两个城市，只处理第一个会丢结果 |
| `error_code` 分类 | 让模型能自主决策 | 统一返回 `"失败"` 模型无法区分该重试还是该放弃 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>忘记 <code>messages.append(msg)</code></b>：第二次请求时历史里只有 <code>tool</code> 消息没有对应的 <code>assistant</code> 调用，服务端直接报格式错误。</li>
<li><b>把 <code>arguments</code> 当 dict 用</b>：它是 JSON <b>字符串</b>，直接 <code>call.function.arguments["city"]</code> 会报 <code>TypeError</code>。</li>
<li><b><code>tool_call_id</code> 写错或复用</b>：多个工具结果必须各自对应自己的 <code>id</code>，错一个整轮请求失败。</li>
<li><b>只支持单轮</b>：模型拿到第一个结果后可能还想调第二个工具，循环必须有，且要有 <code>max_steps</code>。</li>
</ul>
</div>

## 综合案例：批量工单抽取流水线

场景：客服系统每天导入 2000 条用户反馈，需要抽成结构化工单，写入数仓。单条跑通不算数，真正的问题是“其中 3% 失败怎么办”。

输入是一条原始文本；流程是“切批 → 并发抽取 → 校验 → 失败重试一次 → 仍失败则降级入人工队列 → 输出 JSONL”；输出是 `tickets.jsonl` 与一份统计报告。

```python
import json
from concurrent.futures import ThreadPoolExecutor, as_completed

BATCH = [
    "昨天扣了两次会员费，请退款。",
    "App 一打开就闪退，安卓 14。",
    "希望增加导出 Excel 的功能。",
    "嗯。",                                     # 信息量极低，预期进入降级
]

def process_one(text: str) -> dict:
    """单条处理：先严格抽取，失败重试一次，再失败走降级并标记原因"""
    try:
        item = extract_ticket(text, max_repair=1)   # 复用实操一
    except Exception as e:                          # 网络等外层异常
        return {"text": text, "ok": False, "reason": type(e).__name__}
    degraded = item.pop("_degraded", False)
    return {"text": text, "ok": not degraded, "data": item,
            "reason": "schema_repair_failed" if degraded else None}

stats = {"total": 0, "ok": 0, "degraded": 0, "error": 0}
with open("tickets.jsonl", "w", encoding="utf-8") as f, \
     ThreadPoolExecutor(max_workers=5) as pool:     # 并发 5，避免触发限流
    futures = [pool.submit(process_one, t) for t in BATCH]
    for fut in as_completed(futures):
        row = fut.result()
        stats["total"] += 1
        if row["ok"]:
            stats["ok"] += 1
        elif row.get("data"):
            stats["degraded"] += 1
        else:
            stats["error"] += 1
        f.write(json.dumps(row, ensure_ascii=False) + "\n")

print(stats, "成功率", round(stats["ok"] / stats["total"], 3))
```

失败处理按“原因”分流，不要一律重试：

| 失败原因 | 判定依据 | 处理策略 |
|-|-|-|
| 模型输出不是 JSON | `JSONDecodeError` | 追加错误消息重试，最多 2 次 |
| 字段类型或范围不对 | `ValidationError` | 回传字段级错误，让模型定点修复 |
| 信息量不足（如“嗯。”） | 降级后 `summary` 过短 | 直接入人工队列，不要反复重试 |
| 429 限流 | 异常状态码 | 指数退避（1s、2s、4s），不要立刻重试 |
| 连续失败 | 同一批失败率超过 10% | 熔断，先检查 schema 与模型版本，而不是继续跑 |

<div class="callout tip"><span class="tag">老师建议</span>
<p>流水线一定要输出<b>成功率、降级率、平均重试次数</b>三个数。只看“跑完了”没有意义：成功率 97% 且降级可追溯，才算可上线；成功率 80% 还在闷头重试，是在烧钱。</p>
</div>

## 疑难点分级

| 知识点 | 难度 | 典型卡点 | 破解方式 |
|-|-|-|-|
| JSON Schema 设计 | 中 | 字段太宽松，模型乱填 | 用 `enum`、`required`、`min/max`、`additionalProperties: false` 收窄 |
| `json_object` 与 `json_schema` 区别 | 低 | 以为都能保证字段 | 前者只保证合法 JSON，后者才约束结构 |
| Pydantic v1/v2 写法混用 | 中 | `parse_obj` 报弃用或不存在 | v2 用 `model_validate_json`、`model_dump` |
| 解析失败处理 | 中 | `json.loads` 直接崩 | `try/except` + 错误回传 + 有限重试 |
| 重试策略 | 中 | 原样重发，永远同样错误 | 把错误信息作为新消息追加，最多 2 次 |
| 降级设计 | 中 | 降级后数据污染 | 加 `_degraded` 标记并路由人工 |
| 工具描述撰写 | 高 | 模型不调用或乱调用 | 写清触发条件、排除条件与参数示例 |
| 工具粒度 | 高 | 一个工具干五件事 | 拆成单一职责，名字用动词开头 |
| `arguments` 类型 | 低 | 当 dict 直接取键 | 先 `json.loads`，并用 Pydantic 校验 |
| 消息顺序 | 高 | 第二次请求报 400 | 严格 `assistant` → `tool`，`tool_call_id` 对应 |
| 多轮工具循环 | 高 | 只支持一次调用 | `while` 直到没有 `tool_calls`，并设 `max_steps` |
| 并行工具调用 | 高 | 只处理第一个 `tool_call` | 遍历 `msg.tool_calls`，逐个执行逐个回传 |
| 工具结果过长 | 中 | 上下文被撑爆、成本飙升 | 截断到 2000 字符或摘要后再回传 |
| 限流与超时 | 中 | 429 后立即重试 | 指数退避 + 并发上限 5 |
| 结构漂移 | 高 | 提示词与 schema 不同步 | schema 由 Pydantic 生成，或 CI 比对 |
| 流式输出结构化 | 高 | 边流边解析导致半截 JSON | 先缓冲完整再解析，或用增量 JSON 解析器 |

## 常见面试题

| 问题 | 考察点 | 答题要点 |
|-|-|-|
| `response_format={"type": "json_object"}` 能保证字段正确吗 | 对 JSON 模式的理解 | 不能。它只保证合法 JSON，字段、类型、必填都不保证。要强约束用 `json_schema` + `strict`，或本地 Pydantic 校验 |
| JSON 模式和 Structured Outputs 有什么区别 | 约束层级 | JSON 模式只约束语法；Structured Outputs 用 schema 约束结构，支持模型会在解码阶段保证符合。前者兼容性广，后者可靠性高 |
| 既然模型侧有严格模式，为什么还要 Pydantic | 纵深防御 | 换模型、走网关、降级小模型都可能丢失严格约束；本地校验永远可控，还能给出字段级报错用于重试 |
| Function Calling 中模型执行了函数吗 | 职责边界 | 没有。模型只返回 `tool_calls`（名称、参数、id），执行在你代码里，安全边界也在你这里 |
| 为什么必须把 `assistant` 的 tool_calls 消息写回历史 | 消息协议 | `tool` 消息必须对应一条 `assistant` 调用，否则服务端无法匹配 `tool_call_id`，直接 400 |
| 一次返回多个 `tool_calls` 怎么处理 | 并行调用 | 全部执行并按各自 `id` 回传。可以串行也可以并发，但回传顺序不要求与调用顺序一致，`id` 对得上即可 |
| 模型传错参数怎么办 | 容错设计 | 本地用 Pydantic 校验，失败时返回结构化错误（`BAD_ARGS` + 原因），让模型改参数重试；不要让异常穿透 |
| 工具描述怎么写才准 | 工具体验 | 写“什么时候用 + 什么时候不用 + 参数示例”，名字用动词开头。经验上描述优化能提升 20 到 30 个百分点调用准确率 |
| 工具数量有上限吗 | 规模化 | 建议 5 到 8 个；超过 20 个选择准确率明显下降，应做路由分层（先选类别再给子集） |
| 解析失败重试几次合适 | 成本与收益 | 结构修复重试 2 次足够，第 3 次成功率很低；429 用指数退避；总失败率超过 10% 应熔断排查 |
| 如何控制工具调用成本 | 预算控制 | `max_steps` 限制轮数、结果截断 2000 字符、只传必要历史、简单任务用小模型 |
| 如何防止模型调用危险工具 | 安全 | 写操作二次确认、工具白名单、参数强校验（如金额上限）、权限最小化、审计日志 |
| 流式输出下怎么做结构化 | 工程细节 | 工具调用需拼接增量 `arguments`；结构化正文建议先缓冲完整再解析，或使用支持增量 JSON 的解析器 |

## 动手练习

<div class="callout task"><span class="tag">动手练习</span>
<ol>
<li>（低）把情感分析的 schema 抄一遍，故意传一个不符合的输入，观察模型行为。</li>
<li>（低）把 <code>response_format</code> 从 <code>json_schema</code> 换成 <code>json_object</code>，对比 20 次调用里字段缺失的次数。</li>
<li>（低）给 <code>Ticket</code> 加一个 <code>channel</code> 字段，枚举为 <code>app/web/phone</code>，同步修改 schema 并跑通。</li>
<li>（中）写一个 <code>validate_or_raise</code> 函数，输入 JSON 字符串，输出 <code>Ticket</code> 或抛出带字段名的错误。</li>
<li>（中）把 <code>max_repair</code> 设为 0、2、5，统计同一批 50 条数据的最终成功率与总 Token 消耗。</li>
<li>（中）新增 <code>search_docs</code> 工具，让模型在回答项目规则问题前必须先检索。</li>
<li>（中）把单次工具调用改造成 <code>while</code> 循环，支持模型连续调用多个工具。</li>
<li>（中）给工具加 2000 字符截断，构造一个返回超长文本的工具，对比截断前后的 Token 数。</li>
<li>（中）实现 <code>error_code</code> 分类，让模型在 <code>BAD_ARGS</code> 时重试、在 <code>NOT_FOUND</code> 时换关键词。</li>
<li>（高）实现并行 <code>tool_calls</code> 的并发执行（<code>ThreadPoolExecutor</code>），对比串行与并发的总耗时。</li>
<li>（高）做一次“工具描述 A/B 测试”：同一批 30 个问题，分别用模糊描述和精确描述，统计调用准确率。</li>
<li>（高）给流水线加熔断：连续 5 条失败或失败率超过 10% 时停止并打印诊断信息。</li>
<li>（高）把结构化输出接进 FastAPI，返回 422 时带上字段级错误，并用 curl 验证。</li>
<li>（高）设计一个“金额转账”工具，加入上限校验、二次确认与审计日志，说明如何防止模型误调用。</li>
</ol>
</div>

## 本章小结

- 结构化输出让结果可被程序消费，schema 越严越稳；`json_object` 只是语法约束，`json_schema` 才是结构约束。
- Pydantic 是本地保安：模型侧约束可能失效，本地校验永远在；两份契约要么单一来源生成，要么 CI 比对。
- Function Calling 是“模型申请、你来执行”，执行权必须留在业务侧，安全边界也在业务侧。
- 完整的工具闭环需要五拍：声明 → 请求 → `tool_calls` → 执行回传 → 再请求，并且要能循环多轮。
- 工具描述质量直接决定调用准确率，四铁律是：单一职责、写清触发条件、参数少而明确、返回结构化结果（错误也结构化）。
- 解析失败的正确姿势是“错误回传修复 + 有限重试 + 带标记降级”，而不是原样重发或直接抛异常。
- 上线看三个数：成功率、降级率、平均重试次数；失败率超过 10% 先熔断排查，别继续烧钱。

下一章，我们把这些能力串成一个真正的循环：ReAct。你会看到，所谓 Agent，不过是“工具调用 + 一个带终止条件的 while 循环 + 记忆”。
