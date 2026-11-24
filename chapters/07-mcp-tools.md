## 本章导读

到目前为止，工具都是你一个个手写、硬编码在代码里的。项目一大，问题就来了：工具散落各处、权限无法统一、换一个 Agent 又要重写一遍。假设有 5 个 Agent、8 个内部工具，两两对接最多会产生 40 份胶水代码；接入 MCP 后，只需要 5 个 Client 加 8 个 Server。

MCP（Model Context Protocol，模型上下文协议）解决的就是这件事：把工具接入标准化，让 Agent 像插 U 盘一样接入外部能力。它统一了三件事：能力怎么被发现、参数怎么描述、调用结果怎么返回。

学完本章，你应该能做到：第一，用一句话说清 MCP 与 Function Calling 的分工，不再把两者当成二选一；第二，画出 Host、Client、Server 三个角色与一次完整调用链；第三，写出可运行的 MCP Server 与 Client，覆盖 tools、resources、prompts 三类能力；第四，给工具做风险分级、白名单与审计，知道哪些操作必须人工确认。

先记住五条最常见的误区：

1. 认为 MCP 会取代 Function Calling。实际上 MCP 负责“工具从哪来、怎么描述”，Function Calling 负责“模型怎么发起调用”。
2. 把 MCP 等同于远程 HTTP API。MCP 是协议，传输层可以是 stdio，也可以是 Streamable HTTP，本地场景根本不需要网络。
3. 把所有内部系统都暴露成工具。工具越多，模型选错的概率越高，20 个以上工具时准确率通常明显下降。
4. 只接工具不做权限与审计。工具一旦接上，模型就拥有了对应能力，出事时没有日志就无法追责。
5. 以为 schema 会自动正确。类型注解缺失、docstring 含糊，生成的 schema 就是错的，模型调用必然失败。

<div class="callout plain"><span class="tag">大白话</span>
<p>Function Calling 是<b>点菜的话术</b>：你告诉服务员“我要宫保鸡丁，少辣”。</p>
<p>MCP 是<b>餐厅的标准化接口</b>：菜单、厨房、传菜口都有统一规范，换一家餐厅也照样能点。</p>
<p>两者不冲突：<b>MCP 管“工具从哪来、怎么描述”，Function Calling 管“模型怎么点”</b>。</p>
</div>

## 教学路径

<div class="callout path"><span class="tag">教学路径</span>
<ol class="path-steps">
<li><b>第 1 步（20 分钟）：</b>用分层图讲清 MCP 与 Function Calling 的关系，产出《两层职责对照表》。</li>
<li><b>第 2 步（20 分钟）：</b>拆解 Host、Client、Server 与一次握手流程，产出调用时序图。</li>
<li><b>第 3 步（50 分钟）：</b>写最小 MCP Server，暴露 2 个工具、1 个资源、1 个提示词。</li>
<li><b>第 4 步（40 分钟）：</b>写 Client 完成握手、发现、调用、读资源，产出可运行脚本。</li>
<li><b>第 5 步（50 分钟）：</b>把 MCP 工具桥接进 OpenAI Function Calling 循环，产出 <code>bridge.py</code>。</li>
<li><b>第 6 步（25 分钟）：</b>故意污染 stdout、删掉类型注解，观察两类典型故障。</li>
<li><b>第 7 步（30 分钟）：</b>设计工具风险分级、白名单与审计字段，产出权限矩阵。</li>
<li><b>第 8 步（25 分钟）：</b>用团队知识库场景做端到端演练，产出失败处理表。</li>
</ol>
</div>

## 学习前准备

### 前置知识

| 能力 | 最低要求 | 不达标会怎样 |
|-|-|-|
| Python 基础 | 会写函数、装饰器、类型注解 | 看不懂 FastMCP 的装饰器写法 |
| 异步编程 | 理解 `async/await` 与 `async with` | Client 代码几乎每行都带 `await`，会全程卡住 |
| OpenAI SDK | 用过 `tools` 参数的 Function Calling | 无法完成 MCP 与模型的桥接 |
| JSON Schema | 看得懂 `type`、`properties`、`required` | 无法判断工具 schema 是否正确 |
| 进程与标准流 | 知道 stdin、stdout、stderr 的区别 | 会踩 stdio 模式最经典的坑 |
| 基本安全常识 | 理解最小权限与审计日志 | 容易把危险工具直接开放给模型 |

### 工具与材料

| 名称 | 版本 / 说明 | 用途 |
|-|-|-|
| Python | 3.11 及以上 | 运行 Server 与 Client |
| mcp | 1.2 及以上官方 Python SDK | 提供 FastMCP 与 ClientSession |
| openai | 1.40 及以上 | Function Calling 桥接 |
| python-dotenv | 1.0 及以上 | 读取模型配置 |
| MCP Inspector | 可选，官方调试工具 | 可视化查看工具与资源 |
| 终端 | 两个窗口更佳 | 一个跑 Server，一个跑 Client |
| 示例数据 | 本地 JSON 或文本文件 | 模拟知识库检索 |

### 三道自测题

| 题目 | 参考答案要点 |
|-|-|
| MCP 和 Function Calling 是替代关系吗 | 不是。MCP 是接入层，负责工具发现与描述；Function Calling 是调用层，负责模型表达调用意图，两者配合 |
| stdio 模式下为什么不能随便 `print` | stdout 是协议消息通道，业务日志混进去会破坏 JSON-RPC 消息，日志必须写 stderr |
| 一个 Host 可以有多个 Client 吗 | 可以。每个 Client 与一个 Server 保持一对一连接，Host 负责聚合多个 Client 的能力 |

## 核心概念

### 一、MCP 与 Function Calling：两层，不是二选一

Function Calling 解决的是“模型如何表达我要调用某个工具”：模型输出一个结构化的 `tool_calls`，包含函数名与参数 JSON。它不关心工具部署在哪里、由谁维护、怎么发现。MCP 解决的是“工具如何被标准化地发现、描述与调用”：Host 通过 MCP Client 向 Server 请求工具清单，拿到名称、描述、参数 schema，再把这些信息转换成模型能理解的工具定义。

完整的链路是：Host 启动或连接 Server → Client 握手并 `tools/list` → Host 把 schema 转成 Function Calling 的 `tools` 参数 → 模型返回 `tool_calls` → Host 通过 Client 执行 `tools/call` → 结果回填给模型继续推理。少了任何一层，链路都断。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| 调用层 | 模型表达“调用哪个工具、传什么参数” | `tools` 参数与 `tool_calls` 返回 |
| 接入层 | 工具被发现、描述、执行的统一协议 | MCP 的 `tools/list` 与 `tools/call` |
| 工具 schema | 名称、描述、参数类型的结构化定义 | FastMCP 由函数签名自动生成 |
| 传输层 | 协议消息如何在进程间传递 | stdio 或 Streamable HTTP |
| 能力协商 | 握手时声明双方支持哪些能力 | `initialize` 返回的 capabilities |

<div class="callout plain"><span class="tag">大白话</span>
<p>Function Calling 是<b>你和服务员之间的暗号</b>，MCP 是<b>整家餐厅的供应链标准</b>。</p>
<p>暗号再熟，厨房不按标准备菜也白搭；供应链再规范，你不会点菜也吃不上。两层都要有。</p>
</div>

### 二、三个核心角色：Host、Client、Server

Host 是承载 Agent 的应用，例如 IDE、聊天客户端、你自己的后端服务；它决定把哪些工具暴露给模型，也负责弹窗确认与审计。Client 是 Host 内部的连接器，一个 Client 与一个 Server 保持一对一连接，负责握手、转发请求、接收通知。Server 是能力提供方，暴露工具、资源与提示词，可以是本地子进程，也可以是远程服务。

一次标准生命周期包含四步：`initialize` 协商协议版本与能力；`tools/list` 拉取工具清单，结果可能分页，需要带 `cursor` 继续取；`tools/call` 执行具体工具并返回内容或错误；最后关闭连接。传输层有两种主流选择：stdio 适合本地工具，零网络配置；Streamable HTTP 适合远程与多租户，早期的 HTTP+SSE 方式已逐步被替代。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| Host | 承载 Agent 的应用，决定权限与交互 | 你的 FastAPI 后端或 IDE 插件 |
| Client | 与单个 Server 的一对一连接器 | `ClientSession` 实例 |
| Server | 能力的提供方 | `server.py` 里的 FastMCP 实例 |
| 握手 | 协商版本与能力的初始化过程 | `session.initialize()` |
| 传输 | 消息通道 | stdio 或 Streamable HTTP |

<div class="callout plain"><span class="tag">大白话</span>
<p>Host 是<b>电脑</b>，Client 是<b>USB 接口</b>，Server 是<b>U 盘</b>。</p>
<p>电脑决定允不允许读这个 U 盘，接口负责传数据，U 盘负责真正存东西。换一个 U 盘，接口不用改，这就是标准化的价值。</p>
</div>

### 三、三类能力：resources、prompts、tools

MCP Server 可以暴露三类能力，关键区别是“谁来决定使用”。resources 由应用控制，通常只读，用 URI 标识，例如 `docs://agent/limits`，适合把制度、配置、文档注入上下文。prompts 由用户选择，是带参数的提示词模板，例如“代码评审模板”，适合把团队的最佳实践固化成可复用入口。tools 由模型决定，会产生实际动作，可能是只读查询，也可能是写文件、发消息，风险最高。

很多团队一上来把所有能力都做成 tool，结果模型在 30 个工具里反复选错。正确做法是：稳定上下文放 resources，人工触发的模板放 prompts，只有需要模型自主决策并产生副作用的动作才做成 tools。工具数量控制在 15 个以内，超过就按领域拆成多个 Server。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| resource | 应用控制的只读上下文，用 URI 定位 | `docs://agent/limits` 返回运行约束 |
| prompt | 用户选择的参数化提示词模板 | `review_code(code, language)` |
| tool | 模型可自主调用的动作，可能产生副作用 | `get_weather`、`search_docs` |
| URI 模板 | 用路径参数定位一类资源 | `docs://kb/{doc_id}` |
| 能力声明 | Server 在握手时声明支持哪几类 | capabilities 中的 resources、tools、prompts |

<div class="callout plain"><span class="tag">大白话</span>
<p>resource 像<b>墙上贴的规章制度</b>，谁需要谁看，不会自己动；prompt 像<b>前台的标准表格</b>，用户来办事才领一张；tool 像<b>仓库里的叉车</b>，能真把货搬走，所以钥匙要管好。</p>
<p>三种东西放对位置，模型才不会把“看制度”当成“开叉车”。</p>
</div>

### 四、工具权限边界与审计

工具一旦接上，模型就拥有了对应能力。必须提前定边界：只读工具可以直接放开；写入工具要白名单加二次确认；危险工具默认禁用，必须人工审批。权限控制至少做三层：Server 端校验参数与调用者身份，Host 端维护允许列表与确认弹窗，模型端通过描述明确“何时不该调用”。

审计日志要能回答五个问题：谁、在哪个会话、调了什么工具、参数是什么、结果如何。建议字段包括时间戳、会话 ID、工具名、参数哈希、是否命中审批、耗时、结果码。敏感参数要脱敏，日志保留至少 30 天。没有审计，工具越强，风险越大。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| 最小权限 | 只授予完成任务所需的最小能力 | 检索 Server 不暴露删除接口 |
| 白名单 | 只允许清单内的工具被调用 | `allowed_tools` 配置项 |
| 二次确认 | 写入前要求人工点击确认 | 发消息、改文档前弹窗 |
| 审计日志 | 记录每次调用的完整上下文 | JSONL 一行一条记录 |
| 脱敏 | 隐藏密钥、手机号等敏感字段 | 参数哈希替代明文 |

<div class="callout plain"><span class="tag">大白话</span>
<p>给 Agent 配工具，就像<b>给新员工发门禁卡</b>。</p>
<p>实习生第一天，只开放公共区域（只读工具）；熟悉之后，再逐级开放机房、财务室（写入工具）。<b>一上来就给最高权限，出事只是时间问题。</b></p>
</div>

## 代码实操一：写一个最小 MCP Server

下面的 Server 同时暴露三类能力：两个工具、一个资源、一个提示词。它通过 stdio 通信，日志统一写 stderr，参数做了显式校验。运行方式是 `python server.py`，由 Client 启动，不需要手动常驻。

```python
import json
import sys
from datetime import datetime, timezone

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("demo-tools")


def audit(tool: str, args: dict, ok: bool) -> None:
    """审计日志写 stderr，绝不能写 stdout。"""
    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "tool": tool,
        "args": args,
        "ok": ok,
    }
    print(json.dumps(record, ensure_ascii=False), file=sys.stderr)


@mcp.tool()
def get_weather(city: str, unit: str = "celsius") -> dict:
    """查询城市当前天气。

    Args:
        city: 城市名，例如 北京、上海
        unit: 温度单位，只支持 celsius 或 fahrenheit
    """
    if not city.strip():
        raise ValueError("city 不能为空")
    if unit not in {"celsius", "fahrenheit"}:
        raise ValueError("unit 只能是 celsius 或 fahrenheit")
    result = {"city": city, "temp_c": 18, "desc": "多云", "unit": unit}
    audit("get_weather", {"city": city, "unit": unit}, True)
    return result


@mcp.tool()
def search_docs(query: str, top_k: int = 3) -> list[dict]:
    """检索内部技术文档，只读操作。

    Args:
        query: 检索关键词，至少 2 个字符
        top_k: 返回条数，范围 1 到 10
    """
    if len(query.strip()) < 2:
        raise ValueError("query 至少 2 个字符")
    top_k = max(1, min(top_k, 10))
    fake_db = [
        {"title": "Agent 最大步数", "content": "建议 6 到 10，防止死循环"},
        {"title": "工具错误处理", "content": "返回结构化错误，让模型自行决策"},
        {"title": "MCP 权限分级", "content": "只读直放，写入确认，危险禁用"},
    ]
    hits = [d for d in fake_db if query in d["title"] or query in d["content"]]
    audit("search_docs", {"query": query, "top_k": top_k}, True)
    return hits[:top_k]


@mcp.resource("docs://agent/limits")
def agent_limits() -> str:
    """只读运行约束，供 Host 注入上下文。"""
    return "最大步数 8；单任务预算 0.5 元；工具调用上限 20 次；超限需人工确认。"


@mcp.prompt()
def review_code(code: str, language: str = "python") -> str:
    """可复用的代码评审提示词模板。"""
    return (
        f"请以资深 {language} 工程师身份评审下面的代码。\n"
        "只指出会导致线上故障的问题，按严重程度排序，每条给出修复示例。\n"
        f"代码：\n{code}"
    )


if __name__ == "__main__":
    mcp.run()          # 默认 stdio 传输
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `FastMCP("demo-tools")` | 创建 Server 实例 | 名字用于客户端识别与日志区分 |
| `@mcp.tool()` | 把函数注册为工具 | 函数签名与 docstring 自动转成参数 schema |
| 函数类型注解 | 生成 schema 的依据 | 缺注解会导致参数字段缺失，模型无法正确填参 |
| `raise ValueError` | 参数校验 | SDK 会转成 `isError` 结果，模型可读到错误原因 |
| `@mcp.resource("docs://...")` | 暴露只读上下文 | 用 URI 定位，与应用控制的使用方式匹配 |
| 日志写 `sys.stderr` | 避免污染协议通道 | stdio 模式下 stdout 只允许协议消息 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>在工具里 `print()`</b>：stdout 被日志占满后，Client 解析 JSON-RPC 直接失败，表现为“调用无响应”。</li>
<li><b>docstring 只写一句“查询天气”</b>：模型不知道 `unit` 的取值，容易传 `kelvin`，调用必然报错。</li>
<li><b>工具名用名词或缩写</b>：`weather` 不如 `get_weather` 清晰，动词开头能显著降低选错率。</li>
<li><b>返回不可序列化对象</b>：`datetime`、自定义类要先转成字符串或字典。</li>
</ul>
</div>

## 代码实操二：写一个最小 MCP Client

Client 的职责是启动 Server、握手、发现能力、调用工具。下面这段代码把四件事都跑一遍，并给调用加了 30 秒超时。注意 `read_resource` 需要传 `AnyUrl` 类型，这是新手最常踩的类型坑。

```python
import asyncio
import json

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from pydantic import AnyUrl


async def main() -> None:
    params = StdioServerParameters(command="python", args=["server.py"])

    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await asyncio.wait_for(session.initialize(), timeout=10)

            tools = await session.list_tools()
            for t in tools.tools:
                schema = json.dumps(t.inputSchema, ensure_ascii=False)
                print(f"工具 {t.name}：{t.description}｜参数 {schema}")

            resources = await session.list_resources()
            for r in resources.resources:
                print("资源：", r.uri, "｜", r.name)

            prompts = await session.list_prompts()
            for p in prompts.prompts:
                print("提示词：", p.name)

            content = await session.read_resource(AnyUrl("docs://agent/limits"))
            for item in content.contents:
                print("资源内容：", getattr(item, "text", ""))

            result = await asyncio.wait_for(
                session.call_tool("get_weather", arguments={"city": "北京"}),
                timeout=30,
            )
            print("isError：", result.isError)
            for item in result.content:
                print("调用结果：", getattr(item, "text", ""))

            bad = await session.call_tool("get_weather", arguments={"city": "北京", "unit": "kelvin"})
            print("错误是否正确返回：", bad.isError)
            for item in bad.content:
                print("错误内容：", getattr(item, "text", ""))

            prompt = await session.get_prompt("review_code", arguments={"code": "print(1)"})
            print("提示词消息数：", len(prompt.messages))


if __name__ == "__main__":
    asyncio.run(main())
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `StdioServerParameters` | 声明如何启动 Server | 本地工具最常见方式，无需部署与端口 |
| `session.initialize()` | 协议握手 | 不握手直接调用会失败，超时建议 10 秒 |
| `list_tools()` | 动态发现工具 | Host 不需要硬编码工具名，换 Server 也无需改代码 |
| `read_resource(AnyUrl(...))` | 读取只读资源 | 参数类型是 `AnyUrl`，传字符串会被类型校验拒绝 |
| `call_tool(name, arguments)` | 执行工具 | 参数用字典，与 Function Calling 的结构一致 |
| `asyncio.wait_for` | 单次调用超时 | 工具可能卡死，必须有超时兜底 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>忘记 `await`</b>：MCP 客户端接口几乎全是异步的，漏一个 `await` 会拿到协程对象而不是结果。</li>
<li><b>把 Server 路径写死成相对路径</b>：Client 的工作目录不一定和 Server 相同，建议用绝对路径或 `Path(__file__).parent`。</li>
<li><b>不处理 `isError`</b>：工具报错不会抛异常，而是返回 `isError=True`，不检查就会把错误当成功。</li>
<li><b>多个 Client 共用一个 Session</b>：一个 Session 对应一个连接，并发调用要确认 SDK 的并发安全性。</li>
</ul>
</div>

## 代码实操三：把 MCP 工具接进 Function Calling 循环

这一步是整章的“合龙”：MCP 提供工具清单，OpenAI SDK 负责让模型选工具，Host 负责把模型的选择翻译成 MCP 调用。下面用 `AsyncOpenAI` 避免阻塞事件循环，并限制最多 6 步，防止模型反复调用同一个工具。

```python
import asyncio
import json
import os

from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from openai import AsyncOpenAI

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=os.getenv("OPENAI_BASE_URL"))
MODEL = os.getenv("MODEL_NAME", "gpt-4o-mini")


def to_openai_tools(mcp_tools) -> list[dict]:
    """把 MCP 工具描述转换成 Function Calling 的 tools 参数。"""
    return [
        {
            "type": "function",
            "function": {
                "name": t.name,
                "description": t.description or "",
                "parameters": t.inputSchema,
            },
        }
        for t in mcp_tools
    ]


async def run(question: str, max_steps: int = 6) -> str:
    params = StdioServerParameters(command="python", args=["server.py"])

    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            mcp_tools = (await session.list_tools()).tools
            tools = to_openai_tools(mcp_tools)

            messages = [
                {"role": "system", "content": "你是工具调用助手。需要外部信息时必须调用工具，不要编造。"},
                {"role": "user", "content": question},
            ]

            for step in range(1, max_steps + 1):
                resp = await client.chat.completions.create(model=MODEL, messages=messages, tools=tools)
                msg = resp.choices[0].message
                messages.append(msg.model_dump(exclude_none=True))

                if not msg.tool_calls:
                    return msg.content or ""

                for call in msg.tool_calls:
                    name = call.function.name
                    args = json.loads(call.function.arguments or "{}")
                    print(f"[step {step}] 调用 {name} 参数 {args}")

                    result = await asyncio.wait_for(
                        session.call_tool(name, arguments=args), timeout=30
                    )
                    text = "\n".join(getattr(c, "text", "") for c in result.content)
                    messages.append({
                        "role": "tool",
                        "tool_call_id": call.id,
                        "content": f"ERROR: {text}" if result.isError else text,
                    })

            return "达到最大步数仍未得到最终答案，请缩小问题范围。"


if __name__ == "__main__":
    answer = asyncio.run(run("北京天气怎么样？另外帮我查一下 Agent 最大步数建议"))
    print("\n最终回答：\n", answer)
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `to_openai_tools()` | 协议转换 | MCP 的 `inputSchema` 与 OpenAI 的 `parameters` 结构一致，可直接复用 |
| `msg.model_dump(exclude_none=True)` | 回填助手消息 | 必须带上 `tool_calls`，否则下一轮模型不知道调过什么 |
| `role="tool"` 加 `tool_call_id` | 关联调用与结果 | 缺 `tool_call_id` 会直接报 400 |
| `max_steps=6` | 限制循环 | 模型可能反复调用同一工具，必须设上限 |
| `isError` 转 `ERROR:` 前缀 | 让模型感知失败 | 明确告诉模型工具失败，便于它改用其他策略 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>工具名冲突</b>：多个 Server 都提供 `search`，Host 必须加前缀重命名，例如 `kb_search`。</li>
<li><b>参数直接透传不校验</b>：模型可能传多余字段，Server 端应只接受声明过的参数。</li>
<li><b>结果太大</b>：一次返回 200KB 文档会撑爆上下文，Server 端要截断或分页。</li>
<li><b>无审计</b>：桥接层是唯一能同时看到模型意图与工具参数的位置，必须在这里记日志。</li>
</ul>
</div>

## 综合案例：给团队知识库接一个 MCP Server

**输入**：团队有 3 个 Agent（客服、研发助手、文档机器人）都要检索同一套知识库，过去每个项目各写一份检索代码，权限也无法统一。

**流程**：把知识库封装成一个 MCP Server，只暴露 `search_docs`、`get_doc` 两个只读工具和一个 `docs://kb/style-guide` 资源；写入类操作单独放在另一个 Server，并要求人工审批。Host 侧用配置文件声明允许的工具与审计路径，三个 Agent 共用同一份配置。

```yaml
mcpServers:
  kb:
    command: python
    args: ["servers/kb_server.py"]
    env:
      KB_ROOT: "/srv/kb"
    allowed_tools: ["search_docs", "get_doc"]
    denied_tools: ["delete_doc", "reindex_all"]
    require_approval: ["update_doc"]
    timeout_seconds: 30
    max_calls_per_minute: 60
    audit_log: "/var/log/mcp/kb-audit.jsonl"
```

**输出**：三个 Agent 拿到的工具 schema 完全一致，检索命中率与之前持平，但接入代码从 3 份减少到 1 份；所有调用都能按会话 ID 追溯，敏感文档的访问可以按白名单收紧。

**失败处理**：

| 失败模式 | 如何发现 | 处理动作 |
|-|-|-|
| Server 启动失败 | Client 握手超时 | 检查命令、路径与依赖，返回明确错误而非空工具列表 |
| 工具返回超大结果 | 单条结果超过 100KB | Server 端截断并附分页游标 |
| 模型选错工具 | 审计日志出现高频误调用 | 收紧工具描述、减少工具数量、加正反例 |
| 未授权调用 | 命中 `denied_tools` | 直接拒绝并记录安全事件，不把细节回传给模型 |
| 调用频率过高 | 每分钟超过 60 次 | 限流并降级为缓存结果 |

<div class="callout tip"><span class="tag">老师建议</span>
<p>课堂上先让学生用 Inspector 连一次 Server，亲眼看到工具 schema 长什么样，再回来看代码。很多人对“docstring 决定调用准确率”没概念，看一眼生成结果就懂了。</p>
</div>

## 疑难点分级

| 知识点 | 难度 | 典型卡点 | 破解方式 |
|-|-|-|-|
| MCP 与 Function Calling 区别 | 中 | 以为二选一 | 记住接入层与调用层，二者配合 |
| 三角色职责 | 中 | Host 与 Client 混为一谈 | 一个 Host 可含多个 Client，Client 与 Server 一对一 |
| stdio 通信 | 中 | 调用无响应 | 检查 stdout 是否被日志污染 |
| 工具 schema 生成 | 中 | 参数缺失或类型错误 | 补全类型注解与 docstring 参数说明 |
| resources 使用 | 中 | 把资源当工具调用 | 资源由应用读取，用 URI 定位，不产生副作用 |
| prompts 使用 | 低 | 不知道和普通提示词的区别 | prompts 是带参数的模板，由用户主动选择 |
| 传输层选择 | 高 | 本地工具也上远程服务 | 本地用 stdio，远程多租户用 Streamable HTTP |
| 握手与版本协商 | 中 | 跳过 initialize | 任何调用前必须先握手 |
| 错误处理 | 高 | 把 isError 当成功 | 显式检查并回传结构化错误 |
| 工具数量膨胀 | 高 | 30 个工具后准确率下降 | 控制在 15 个以内，按领域拆 Server |
| 权限分级 | 高 | 工具滥用 | 只读直放、写入确认、危险禁用 |
| 审计日志 | 中 | 出事无法追责 | 记录会话、工具、参数哈希、结果码 |
| 多 Server 工具重名 | 中 | 调用到错误实现 | Host 侧加前缀并维护映射 |
| 大结果传输 | 中 | 上下文被撑爆 | 截断、分页、摘要加指针 |
| 密钥管理 | 高 | 密钥写进 Server 代码 | 用环境变量注入，日志脱敏 |
| 并发调用 | 高 | 同一 Session 并发出错 | 确认 SDK 并发模型，必要时串行或建连接池 |

## 常见面试题

| 问题 | 考察点 | 答题要点 |
|-|-|-|
| MCP 和 Function Calling 是什么关系 | 分层理解 | MCP 是接入层，负责发现与描述；Function Calling 是调用层，负责模型表达意图；两者串联使用 |
| MCP 的三个角色分别做什么 | 架构理解 | Host 承载应用并管权限，Client 一对一连接 Server，Server 提供 tools、resources、prompts |
| stdio 和 Streamable HTTP 怎么选 | 传输层 | 本地单机工具用 stdio，零配置；远程、多租户、需要鉴权用 HTTP |
| tools、resources、prompts 的区别 | 能力模型 | tools 由模型调用且可能有副作用，resources 由应用读取且只读，prompts 由用户选择 |
| 为什么工具不能超过 15 个 | 工程经验 | 工具越多选择空间越大，模型选错率上升，应按领域拆分 Server |
| 工具报错应该怎么返回 | 错误处理 | 返回 `isError=True` 加结构化错误信息，让模型自行决策，而不是抛异常中断 |
| 如何防止模型调用危险工具 | 安全设计 | 默认禁用、白名单、二次确认、参数校验、审计五件套 |
| 审计日志至少记录什么 | 可观测性 | 时间、会话 ID、工具名、参数哈希、审批状态、耗时、结果码 |
| 多个 Server 工具重名怎么办 | 集成细节 | Host 侧统一加前缀并维护映射表，避免模型与路由歧义 |
| MCP Server 能不能有状态 | 协议理解 | 可以，但工具应尽量幂等；状态放外部存储，避免连接重建后丢失 |
| 什么时候不该用 MCP | 边界判断 | 只有两三个工具、单项目使用、无复用需求时，直接 Function Calling 更快 |
| 如何测试一个 MCP Server | 测试方法 | 用 Inspector 看 schema，用 Client 跑正常与异常参数，校验 isError 与超时 |

## 动手练习

<div class="callout task"><span class="tag">动手练习</span>
<ol>
<li>（低）跑通 <code>server.py</code> 与 <code>client.py</code>，打印出完整工具清单。</li>
<li>（低）新增一个 <code>get_time</code> 工具，返回当前时区时间，并在 Client 中调用。</li>
<li>（低）修改 <code>docs://agent/limits</code> 的内容，观察 Client 读取结果的变化。</li>
<li>（中）故意在 Server 里 <code>print()</code> 一行日志，观察通信如何被破坏。</li>
<li>（中）删掉 <code>get_weather</code> 的 <code>unit</code> 类型注解，对比生成的 schema 差异。</li>
<li>（中）给 <code>search_docs</code> 加 <code>top_k</code> 越界校验，验证 <code>isError</code> 是否正确返回。</li>
<li>（中）用 <code>get_prompt</code> 取出评审模板，把生成结果发给模型执行一次。</li>
<li>（中）把 <code>read_resource</code> 的 <code>AnyUrl</code> 改成字符串，记录报错信息并修正。</li>
<li>（高）新增一个写入型工具 <code>update_doc</code>，在 Client 侧加人工确认开关。</li>
<li>（高）实现审计日志落盘为 JSONL，按会话 ID 聚合统计工具调用次数。</li>
<li>（高）再写一个 Server，提供同名 <code>search</code> 工具，在 Host 侧加前缀解决冲突。</li>
<li>（高）给 Client 加 30 秒超时与一次重试，构造一个故意休眠 40 秒的工具验证。</li>
<li>（高）把 stdio 版本改造成 Streamable HTTP 版本，说明需要额外处理哪些鉴权问题。</li>
<li>（高）设计一套权限矩阵，覆盖 10 个工具的三级风险与对应审批流程。</li>
</ol>
</div>

## 本章小结

- MCP 是工具接入的标准化协议，解决复用、解耦与统一权限，不替代 Function Calling。
- 三个角色分工明确：Host 管应用与权限，Client 管连接，Server 管能力。
- 三类能力按“谁决定使用”区分：resources 归应用、prompts 归用户、tools 归模型。
- Server 的工具 schema 由函数签名与 docstring 生成，写得含糊，调用就失败。
- stdio 模式下 stdout 是协议通道，任何业务日志都必须写 stderr。
- 桥接层是 MCP 与 Function Calling 的合龙点，也是审计与限流的最佳位置。
- 工具安全靠五件套：默认禁用、白名单、二次确认、参数校验、审计日志。
- 工具数量控制在 15 个以内，超过就按领域拆分 Server，避免模型选择困难。

下一章，我们把 Demo 变成能上线的工程：流式、评估与可观测性。
