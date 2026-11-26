# DeepAgents 框架与多智能体实战

> 素材出处：
> - `D:\pyhton\资料\01.DeepAgents框架.md`（2660 行）
> - `D:\pyhton\资料\02.多智能体实战.md`（旅游规划项目）
> - `D:\pyhton\资料\11.技能.py`（Skill 加载示例）
> - `D:\pyhton\资料\12.长期记忆-memory.py`（长期记忆示例）

## 1. DeepAgents 是什么

讲义原话：

> DeepAgents 是构建由大型语言模型（LLM）驱动的代理和应用的最简单方式——内置任务规划功能、用于上下文管理的文件系统、子代理生成和长期记忆，可以用它完成复杂、多步骤、自主规划的任务。

> DeepAgents 是一个独立库，建立在 LangChain 代理核心构建模块之上。它使用 LangGraph 运行时进行持久化执行、流式传输、人机交互和其他功能，主要实现**自主多智能体系统（Agentic AI）**。

四层家族关系：

| 层 | 定位 | 关键点 |
|---|---|---|
| langchain-core | 核心抽象层 | `BaseChatModel`、`BaseTool`、`Runnable`，不依赖其他包 |
| langgraph | 运行时层 | `StateGraph`、Checkpoint 持久化，解决循环/分支/状态 |
| langchain (V1.x) | 框架应用层 | 提供 `create_agent` 等高阶 API，深度集成 langgraph |
| deepagents | 开箱即用层 | 强制依赖 langchain + langgraph，打包 TodoList、文件系统、子智能体，暴露 `create_deep_agent` |

选型口径（讲义原文）：

```
LangGraph: 明确的多步骤长流程处理需要（如：RAG项目）
LangChain: 简单，快速，没有复杂的长流程处理需求
DeepAgents：比较复杂，需要进行多个方向处理和分析（如：网络搜索，dbRAG搜索，docRAG搜索等）
```

要解决的三个痛点：单模型注意力被多领域任务稀释、上下文窗口溢出、无法自主规划长任务。

## 2. 核心能力

| 能力 | 讲义说法 | 配置 |
|---|---|---|
| 任务规划 | 内置 `write_todos` 工具，拆分步骤、跟踪进度、动态调整 | 无显式参数，框架注入 |
| 文件系统 | 内置 `ls` / `read_file` / `write_file` / `edit_file`，把大上下文卸载到外部存储 | `backend=FilesystemBackend(...)` |
| 子智能体 | 内置 `task` 工具，主代理委派任务，实现上下文隔离 | `subagents=[...]` |
| 长期记忆 | 文件存储 / 内存 store / 组合式存储 | `StoreBackend`、`FilesystemBackend`、`CompositeBackend` |
| 技能 | 可插拔能力包，`SKILL.md` + 资源，按需加载 | `skills=["skills"]` |
| 人工审批 | 基于 LangGraph interrupt，指定需审批的工具 | `interrupt_on={...}` + `checkpointer` |
| 文件权限 | 声明式读写白/黑名单（≥0.5.2） | `permissions=[FilesystemPermission(...)]` |
| 流式输出 | 基于 LangGraph，实时看模型、工具、子代理调用 | `stream()` / `astream()` |

## 3. 快速入门

```bash
uv init
uv venv
uv add deepagents langchain-openai python-dotenv tavily-python
```

```python
from deepagents import create_deep_agent
from langchain.chat_models import init_chat_model

llm = init_chat_model(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
    model_provider="openai",
)

deep_agent = create_deep_agent(
        model="gpt-4o",
        # model=llm,
        tools=[internet_search],
        system_prompt="""你是一个助手，需要使用网络搜索工具来获取信息。
            请使用中文回答问题。
            """,
        subagents=[],
    )

result = deep_agent.invoke(
    {
        "messages": [
            {"role": "user", "content": "今天武汉天气怎么样?"}
        ]
    }
)

print(result)                 # 打印整个结果
print(result["messages"][-1].content)  # 打印目标结果内容
```

取结果三段式：`result["messages"]` 是全流程对话列表，`[-1]` 是最后一条，`.content` 是最终文本。

## 4. create_deep_agent 常用参数

| 参数 | 示例 | 说明 |
|---|---|---|
| `model` | `"gpt-4o"` 或 `init_chat_model(...)` 实例 | 可传字符串或模型对象 |
| `tools` | `[internet_search]` | 主代理可用工具 |
| `system_prompt` | 字符串 | 主代理指令 |
| `subagents` | `[{...}]` / `[CompiledSubAgent]` | 子代理配置 |
| `backend` | `FilesystemBackend(root_dir=".", virtual_mode=True)` | 文件系统后端 |
| `store` | `InMemoryStore()` | 配 `StoreBackend` 使用 |
| `skills` | `["skills"]` | 技能目录 |
| `interrupt_on` | `{"delete_table": True}` | 需人工审批的工具 |
| `checkpointer` | `InMemorySaver()` | 人工审批必需 |
| `permissions` | `[FilesystemPermission(...)]` | 文件读写权限 |
| `name` | `"CODER"` | 代理名称（嵌套时用） |

子代理字典字段：`name`（必填）、`description`（必填，决定委派判断）、`system_prompt`、`tools`、`model`、`middleware`、`interrupt_on`、`skills`、`response_format`。

两种形态：字典（简单，**不支持嵌套**）与 `CompiledSubAgent`（可包 `create_agent` 或 LangGraph 编译图，支持多层嵌套）。讲义建议嵌套 2-3 层即可。

## 5. 流式输出解析

```python
def query_stream(query: str):
    stream = deep_agent.stream({"messages": [{"role": "user", "content": query}]})
    for chunk in stream:
        for key, value in chunk.items():
            if not value or "messages" not in value: continue
            messages = value["messages"]
            if (messages and isinstance(messages, list)):
                last_msg = messages[-1]
                if key == 'model':
                    if last_msg.tool_calls:
                        for tool_call in last_msg.tool_calls:
                            print(f"智能体决定调用工具{tool_call['name']} 传入参数：{tool_call['args']}")
                    elif last_msg.content:
                        print(f"智能体最终执行结果：{last_msg.content}")
                elif key == 'tools':
                    print(f"智能体调用{last_msg.name}工具返回结果：{last_msg.content}")
```

chunk 外层只有两类 key：

- `model`：`AIMessage`。`content` 有值是最终回答；为空且带 `tool_calls` 是在决策（调用工具或子代理）。
- `tools`：`ToolMessage`，带 `.name` 与 `.content`。

子代理调用会伪装成名为 `task` 的工具调用，参数含 `subagent_type` 与 `description`。异步版本用 `astream()` + `async for`。

## 6. 技能（Skill）机制

定义：可复用、可插拔的能力包，核心是指令文档 `SKILL.md` 及配套资源，根据任务场景动态加载，不改 Agent 核心逻辑。

目录结构：

```
skills/
└── skill-xxx/
    ├── SKILL.md          # 必需：YAML Frontmatter + Markdown 指令
    ├── requirements.txt  # 可选
    ├── resources/        # 可选：template/examples/config
    └── scripts/          # 可选：helper.py
```

`SKILL.md` 头部示例：

```markdown
---
name: code-review
description: 审查 Python 代码，检查命名、异常处理与安全问题
---
# 代码审查技能
1. 先读取目标文件
2. 按 checklist 输出问题与修改建议
```

加载三要素（缺一不可）：

```python
deep_agent = create_deep_agent(
    model=llm,
    system_prompt="你是一个高级智能助手，必须调用技能回答用户的问题",
    backend=FilesystemBackend(root_dir=".", virtual_mode=True),
    skills=["skills"]
)
```

- `SKILL.md` 必须存在于真实目录；
- 必须用 `FilesystemBackend` 挂载；
- `skills=["skills"]` 指定目录。

渐进式披露：启动时只读元数据（名称、适用场景、触发词），命中触发条件才加载详细指令，节省上下文。

`11.技能.py` 就是这套最小示例：

```python
deep_agent = create_deep_agent(
    model=llm,
    system_prompt="你是一个高级智能助手，必须调用技能回答用户的问题",
    backend=FilesystemBackend(root_dir=".",virtual_mode=True),
    skills=["skills"]
)

result = deep_agent.invoke(
    input={"messages": [
        {"role":"user","content":"审查一下 11.技能.py 这个文件中的代码"}
    ]}
)
```

长期记忆则是把规则写进 `AGENTS.md`，并在创建时挂载（`12.长期记忆-memory.py`）：

```python
deep_agent = create_deep_agent(
    model=llm,
    system_prompt="你是一个高级智能助手",
    backend=FilesystemBackend(root_dir=".",virtual_mode=True),
    memory=["memories/AGENTS.md"],
)
```

> 注意：`memory=` / `AGENTS.md` 在 `01.DeepAgents框架.md` 中**没有出现**，讲义只讲了三种存储方式；这一写法来自 `12.长期记忆-memory.py`，以脚本为准。

## 7. 多智能体实战：旅游规划助手

项目目标：用户一句话输入（出发地、目的地、日期、预算、偏好），系统完成景点推荐、车票方案、预算估算与最终汇总。

方案：1 个主智能体 + 3 个子智能体 + 1 个高德 Skill + 1 个 12306 MCP。

```
用户 → main_agent
        ├─ map_agent ── 高德 Skill（POI/路径/地图二维码）
        ├─ ticket_agent ── 12306 MCP（车次/票价/中转）
        └─ summary_agent ── 只做汇总，不查外部数据
```

各子智能体都是“名称 + 描述 + 提示词 + 可选工具”：

```python
map_agent = {
    "name": "map_agent",
    "description": "负责景点推荐、路线分析、地图生成",
    "system_prompt": MAP_AGENT_PROMPT,
    "skills": ["/skills"]
}
```

车票子智能体通过 MCP 加载远程工具：

```python
async def build_ticket_agent():
    client = MultiServerMCPClient(
        {
            "12306-mcp": {
                "transport": "streamable_http",
                "url": "https://mcp.api-inference.modelscope.net/49af93122b7447/mcp"
            }
        }
    )
    ticket_tools = await client.get_tools()

    ticket_agent = {
        "name": "ticket_agent",
        "description": "负责12306车次查询、票价分析、出发时间建议",
        "system_prompt": TICKET_AGENT_PROMPT,
        "tools": ticket_tools
    }

    return ticket_agent


ticket_agent = asyncio.run(build_ticket_agent())
```

主智能体统一挂载：

```python
main_agent = create_deep_agent(
    model=llm,
    backend=backend,
    system_prompt=MAIN_AGENT_PROMPT,
    memory=["/config/memory/AGENTS.md"],
    subagents=[map_agent, ticket_agent, summary_agent]
)
```

关键实践：

- 12306 MCP 返回异步工具，主程序必须用 `astream()`，否则会报 `StructuredTool does not support sync invocation`；
- 子代理的 `description` 直接决定主代理是否会委派，写清楚“负责什么、不负责什么”；
- 汇总子代理只做整理，避免重复查询外部数据；
- `FilesystemBackend(root_dir=base_dir, virtual_mode=True)` 把文件访问限制在项目目录内。

## 8. 常见坑

1. `stream()` 用 `for`，`astream()` 必须 `async for`，入口用 `asyncio.run`；
2. chunk 解析先判 `if not value or "messages" not in value: continue`，否则会拿到空节点；
3. 讲义示例里 `message.content` 有一处笔误写成 `message.conten`，照抄会 `AttributeError`；
4. 人工审批必须配 `checkpointer`，恢复时用同一个 `thread_id` 的 config；
5. 字典形态子代理写 `"subagents"` 无效，嵌套必须用 `CompiledSubAgent`；
6. 只写 `skills=` 不配 `FilesystemBackend` 会加载失败；
7. `InMemoryStore` 重启即丢，持久化要换 Redis/Postgres Store；
8. 讲义未覆盖 DeepAgents 接 MCP 的官方写法，旅游项目里的 MCP 是 `langchain_mcp_adapters` 直接挂到子代理工具上。

## 9. 练习与验收标准

### 练习 1：创建第一个 DeepAgent

用 `create_deep_agent` 创建一个带 Tavily 搜索工具的研究助手，问一个需要联网的问题。

**验收标准**

- `result["messages"][-1].content` 能输出中文答案；
- 流式模式下能分别打印“决定调用工具”和“工具返回结果”两类事件；
- 把 `tools` 去掉后，模型不会再发起工具调用，仍然能给出回答；
- 输出中能看到 `write_todos` 相关的规划行为（若模型触发）。

### 练习 2：写一个自定义 Skill

在 `skills/code-review/SKILL.md` 写一个代码审查技能，用 `skills=["skills"]` 加载，让 Agent 审查一篇 Python 文件。

**验收标准**

- `SKILL.md` 含 `name` 与 `description` Frontmatter；
- Agent 回答中体现出技能里的审查步骤，而不是泛泛而谈；
- 把 `skills` 参数去掉后，回答不再遵循该 checklist；
- 目录里增加 `resources/checklist.md` 后，技能能读取并引用。

### 练习 3：搭建“主代理 + 两个子代理”

仿照旅游项目，写一个“资料收集 + 汇总”两子代理系统：`search_agent` 负责检索，`summary_agent` 负责整理，`main_agent` 调度。

**验收标准**

- 主代理通过 `task` 工具调用子代理，流式输出中能看到 `subagent_type`；
- 两个子代理的 `description` 能区分职责，主代理不会把汇总任务派给检索代理；
- 汇总代理不重复调用检索工具（打印工具调用记录验证）；
- 最终输出包含“来源列表 + 摘要”两部分。
