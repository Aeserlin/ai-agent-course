（作者：尚硅谷研究院）

版本：V1.1.0

## LangGraph概述

### 什么是LangGraph

LangGraph 是一个低级编排框架和运行时环境，用于构建、管理和部署长期运行的有状态智能体（agents）。核心理念是将 Agent 工作流建模为图（Graph），其中：

节点（Nodes）：代表计算单元，可以是 LLM 调用、工具执行或任何自定义逻辑(函数)

边（Edges）：定义节点之间的转换逻辑，决定执行流程

状态（State）：在整个图执行过程中共享和传递的数据

![RAG 智能体检索文档并生成回答的流程图](assets/lessons-langgraph/image1.webp)

LangGraph提供了构建生产级智能体应用的核心能力：

持久化执行：构建能够从故障中恢复并长时间运行的智能体

人机协作：在任何时刻检查和修改智能体状态

记忆管理：支持短期工作记忆和跨会话的长期记忆

流式处理：专为流式工作流设计

生产级部署：为有状态、长期运行的工作流提供可扩展的基础设施

LangGraph官方源码地址及官网地址如下：

GitHub地址：https://github.com/langchain-ai/langgraph

官方文档：https://docs.langchain.com/oss/python/langgraph/overview

### 与LangChain区别

LangGraph与LangChain的高级抽象不同，它提供了更细粒度的控制，让开发者能够精确控制智能体的执行流程，适合需要定制化编排的复杂应用场景。

通过一句话概述LangChain和LangGraph的区别：当 LLM 应用需要「有状态、可循环、可分支的多步骤控制流（像一个可回溯的流程图/状态机）」时，LangChain 很难优雅完成，而必须用 LangGraph。

以下表格以更细粒度的方式展示了两者的区别：

| 特性 | LangGraph | LangChain |
|---|---|---|
| 抽象级别 | 低级，提供细粒度控制 | 高级，开箱即用 |
| 状态管理 | 内置状态机和检查点 | 需要自行管理状态 |
| 执行模型 | 基于图的并行执行 | 线性链式执行 |
| 持久化 | 原生支持 | 需要额外实现 |
| 适用场景 | 复杂、有状态的智能体应用开发 | 简单的链式调用 |

正是因为LangGraph和LangChain上述的区别，使得LangGraph在以下场景下，有了更加广泛的应用：

复杂的多智能体系统

需要长期记忆的应用

需要人工审核的工作流

后台处理任务和实时交互

需要精细控制的定制化智能体编排

下面通过快速入门示例来具体讲解如何通过LangGraph构建一个应用。

## 快速入门

### 环境安装

#### 创建环境

```bash
# 安装指定版本的 langgraph 库
pip install langgraph[==1.0.5]
```

#### 确认成功

```bash
# 查看已安装 langgraph 的版本信息，确认安装成功
pip show langgraph
```

### 简单示例

使用LangGraph构建一个应用，可以分为如下步骤：

1. 定义状态；
2. 定义节点函数；
3. 通过状态创建builder实例，并添加节点和边；
4. 对builder进行编译，得到可调用的graph对象；
5. 调用graph。
接下来的例子，以一个基于RAG的问答系统为例，来做一个快速入门展示。

该问答系统需要实现的功能如下：当接收用户问题之后，先分别进行联网搜索和基于知识库的检索，得到结果之后，使用大语言模型进行总结回答。

具体代码如下所示：

```python
# 导入类型提示工具：TypedDict 用于定义"状态"的键值类型
from typing import TypedDict
# 导入 Pydantic 的 BaseModel（本示例未直接用，保留以说明可选的定义方式）
from pydantic import BaseModel
# START / END 是图的虚拟起止节点（本质是特殊字符串常量）
from langgraph.constants import START, END
# StateGraph：以"状态"为核心构建有向图的核心类
from langgraph.graph import StateGraph
# Send / Command：跨节点下发消息、向图注入指令的辅助类型
from langgraph.types import Send,Command
# 定义状态：State 的每个键就是图中各节点共享、传递的"全局数据槽"
class MyState(TypedDict):
    rag_result:str
    web_search_result:str
    query:str
    final_answer:str

# 用 state_schema 指定图的完整状态结构
graph = StateGraph(state_schema=MyState)

# 知识库检索节点：从 state 读 query，返回"增量更新"写回 rag_result
def rag_search_node(state:MyState):
    query = state["query"]
    rag_result = f"关于{query}的rag_result"
    # 返回值只更新声明的键，自动与全局状态合并
    return {"rag_result":rag_result}

# 联网搜索节点：同理，只更新 web_search_result 键
def web_search_node(state:MyState):
    query = state["query"]
    web_search_result = f"关于{query}的web_search_result"
    return {"web_search_result":web_search_result}

# 汇总节点：聚合两个检索结果，由 LLM 生成最终回答
def final_answer_node(state:MyState):
    rag_result = state["rag_result"]
    web_search_result = state["web_search_result"]
    final_answer = f"LLM基于{rag_result}和{web_search_result}的最终回复"
    return {"final_answer":final_answer}

# 注册节点：直接传函数即可，节点名默认取函数名
graph.add_node(rag_search_node)
graph.add_node(web_search_node)
graph.add_node(final_answer_node)
# 并行分支：START 同时连向 rag 和 web 两个检索节点
graph.add_edge(START, "rag_search_node")
graph.add_edge(START,"web_search_node")
# 两条检索结果都汇入汇总节点，最后走向 END
graph.add_edge("rag_search_node", "final_answer_node")
graph.add_edge("web_search_node","final_answer_node")
graph.add_edge("final_answer_node", END)
# 编译图：得到可直接调用的可执行对象
compiled_graph = graph.compile()
# 传入初始状态（query）执行整张图，返回最终状态
res = compiled_graph.invoke({"query":"如何使用LangGraph"})
print(res)
```

编译好之后，可以通过mermaid查看图的结构。

```python
# pip install grandalf
# 如需渲染 ASCII 图，需先安装 grandalf：pip install grandalf
# 获取图的拓扑结构对象
graph_structure = compiled_graph.get_graph()
# 以 ASCII 形式打印节点与边的连接关系
res = graph_structure.draw_ascii()
print(res)
```

通过该例子，可以快速对LangGraph编程流程有一个概念。

## 状态

需要通过LangGraph构建一个应用程序时，第一步就是定义State，因为State代表了整个图的结果目标，和图当中节点需要修改的数据目标。

State作为LangGraph当中最重要的概念，有其专门的定义方式，和运行时的行为特点。

### 状态的定义

#### 定义状态类

State Schema可以通过以下两种方式定义：

TypedDict（推荐方式）: TypedDict是Python提供的一种类型提示工具，用于为字典（Dict）的键和值指定精确的类型信息。状态类继承TypedDict，定义键的类型和reducer函数（具体参看3.1.4 reducer章节内容）即可；

代码示例如下：

```python
from typing import TypedDict
# 方式一：继承 TypedDict 定义状态（官方推荐）。
# 键名即状态字段；值为类型提示，可选配 reducer 指定合并逻辑
class MyStateFull(TypedDict):
    rag_result:str
    web_search_result:str
    final_answer:str
    query:str
    a_new_key:str
```

Pydantic BaseModel：Pydantic 提供运行时数据校验，并支持静态类型检查工具进行类型推导。状态类通过继承Pydantic的BaseModel，定义键的类型和reducer函数；

代码示例如下：

```python
from pydantic import BaseModel
# 方式二：继承 Pydantic 的 BaseModel。
# 提供运行时数据校验 + 静态类型推导；字段同样可挂 reducer
class MyStateFull(BaseModel):
    rag_result:str
    web_search_result:str
    final_answer:str
    query:str
    a_new_key:str
```

#### 输入输出数据隔离

在LangGraph 当中，可以精细管理输入到图中的状态键有哪些，以及输出的状态键有哪些。这是通过初始化StateGraph时，分别指定三个参数：state_schema、input_schema 和 output_schema 来实现的。

其具体作用，可以参考如下图示：

![graph.invoke 执行流程与 input/output schema 校验示意](assets/lessons-langgraph/image2.webp)

##### state_schema

这是图的完整内部状态，包含了所有节点可能读写的字段，必须指定，不能为空。

特点：

是图的"全局状态空间"；

所有节点都可以访问和写入这个 schema 中的任何字段。

##### input_schema

定义图接受什么输入，是 state_schema 的子集

特点：

可选参数，如果不指定，默认等于 state_schema；

限制图的输入接口，只能传入这些字段；

是 state_schema 的子集或相等。

##### output_schema

定义图返回什么输出，是 state_schema 的子集

特点：

可选参数，如果不指定，默认等于 state_schema；

限制图的输出接口，只返回这些字段；

是 state_schema 的子集或相等。

代码如下所示：

```python
from typing import TypedDict
from langgraph.constants import START, END
from langgraph.graph import StateGraph
# 完整内部状态：图中所有节点都可读写的"全局状态空间"
class MyStateFull(TypedDict):
    rag_result:str
    web_search_result:str
    final_answer:str
    query:str
    

# 输入 Schema：只允许这些字段从外部传入（必须是 state_schema 的子集）
class InputSchema(TypedDict):
    query:str

# 输出 Schema：只允许这些字段返回给外部调用者（state_schema 的子集）
class OutputSchema(TypedDict):
    final_answer:str

# 三参初始化：state_schema 必填；input/output_schema 缺省时默认等于 state_schema
graph = StateGraph(state_schema=MyStateFull,input_schema=InputSchema,output_schema=OutputSchema)

def rag_search_node(state:MyStateFull):
    print(state)
    query = state["query"]
    rag_result = f"关于{query}的rag_result"
    return {"rag_result":rag_result,"a_new_key":"a_new_key_value"}

def web_search_node(state:MyStateFull):
    print(state)
    query = state["query"]
    web_search_result = f"关于{query}的web_search_result"
    return {"web_search_result":web_search_result}

def final_answer_node(state:MyStateFull):
    print('在final_answer_node当中的state',state)
    rag_result = state["rag_result"]
    web_search_result = state["web_search_result"]
    final_answer = f"LLM基于{rag_result}和{web_search_result}的最终回复"
    return {"final_answer":final_answer}

graph.add_node(rag_search_node)
graph.add_node(web_search_node)
graph.add_node(final_answer_node)
# 并行检索：START 同时连向两个检索节点
graph.add_edge(START, "rag_search_node")
graph.add_edge(START,"web_search_node")
# 检索结果汇入汇总节点，最后走向 END
graph.add_edge("rag_search_node", "final_answer_node")
graph.add_edge("web_search_node","final_answer_node")
graph.add_edge("final_answer_node", END)
compiled_graph = graph.compile()
# 传入的初始状态必须符合 input_schema（含 query 与 a_new_key）
res = compiled_graph.invoke({"query":"如何使用LangGraph","a_new_key":"a_new_key_value"})
print('最终结果为',res)
```

#### 节点间数据隔离(了解)

LangGraph当中节点所接收的状态，还可以为一个非全局状态的私有状态。

示例代码如下：

```python
from typing import TypedDict
from pydantic import BaseModel
from langgraph.constants import START, END
from langgraph.graph import StateGraph
# 全局状态：所有节点共享
class MyState(TypedDict):
    query:str
    final_answer:str

# 私有状态：专供 final_answer_node 使用，只暴露给声明它的节点
class SearchState(TypedDict):
    rag_result:str
    web_search_result:str

# 输入 Schema：只允许 query 从外部传入
class InputSchema(TypedDict):
    query:str

# 输出 Schema：只允许 final_answer 返回给调用者
class OutputSchema(TypedDict):
    final_answer:str

# 只指定全局 state_schema，检索节点读取的是全局状态
graph = StateGraph(state_schema=MyState)

def rag_search_node(state:MyState):
    print(state)
    query = state["query"]
    rag_result = f"关于{query}的rag_result"
    # 注意：此处往全局状态里写入了 MyState 未声明的键（演示非法写入）
    return {"rag_result":rag_result,"a_new_key":"a_new_key_value"}

def web_search_node(state:MyState):
    query = state["query"]
    web_search_result = f"关于{query}的web_search_result"
    return {"web_search_result":web_search_result}

# final_answer_node 接收的入参类型是 SearchState（私有状态），而非全局 MyState
def final_answer_node(state:SearchState):
    print('在final_answer_node当中的state',state)
    rag_result = state["rag_result"]
    web_search_result = state["web_search_result"]
    final_answer = f"LLM基于{rag_result}，和{web_search_result}的最终回复"
    return {"final_answer":final_answer}

graph.add_node(rag_search_node)
graph.add_node(web_search_node)
graph.add_node(final_answer_node)
graph.add_edge(START, "rag_search_node")
graph.add_edge(START,"web_search_node")
graph.add_edge("rag_search_node", "final_answer_node")
graph.add_edge("web_search_node","final_answer_node")
graph.add_edge("final_answer_node", END)
compiled_graph = graph.compile()
res = compiled_graph.invoke({"query":"如何使用LangGraph"})
print('最终结果为',res)
```

#### Reducer函数

Reducer用于进行当前增量状态（节点输出的状态）和全局状态的合并。State中的每个键都有其独立的reducer函数。每个node的返回值中的每个key与全局state_schema中对应的key进行合并更新，具体更新逻辑取决于每个key指定的reducer函数。

Reducer常用函数有以下几种：

默认行为：未指定Reducer时使用覆盖更新

内置reducer函数：例如langgraph.graph.messages当中的add_messages函数

自定义Reducer：支持用户自定义合并逻辑

如果未明确指定reducer函数，则默认对该键的更新是覆盖行为。以下为默认覆盖行为：

```python
"""
LangGraph Reducer函数演示 - 默认Reducer（覆盖更新）
"""

from typing import List
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END

# 1. 默认Reducer（覆盖更新）
# 默认Reducer（覆盖更新）：foo/bar 均未配置 reducer，节点写入时直接"覆盖"旧值
class DefaultReducerState(TypedDict):
    foo: int
    bar: List[str]
def node_default_1(state: DefaultReducerState) -> dict:
    return {"foo": 2}
def node_default_2(state: DefaultReducerState) -> dict:
    return {"bar": ["bye"]}
def run_demo():
    print("1. 默认Reducer（覆盖更新）演示:")
    builder = StateGraph(DefaultReducerState)
    builder.add_node("node1", node_default_1)
    builder.add_node("node2", node_default_2)
    builder.add_edge(START, "node1")
    builder.add_edge("node1", "node2")
    builder.add_edge("node2", END)
    graph = builder.compile()
    # 初始 {"foo":1,"bar":["hi"]} 执行后被各节点返回值整体覆盖
    result = graph.invoke({"foo": 1, "bar": ["hi"]})
    print(f"初始状态: {{'foo': 1, 'bar': ['hi']}}")
    print(f"执行结果: {result}\n")

if __name__ == "__main__":
    run_demo()
```

可以自定义Reducer函数，用于合并操作。自定义Reducer函数接收两个参数，用以将其合并，最终返回一个结果。

例如此处定义一个add_message函数，用于将全局状态当中的message和节点的message进行合并操作：

```python
from langgraph.graph import StateGraph, add_messages
from langchain_core.messages import ToolMessage,HumanMessage,AIMessage,BaseMessage
from typing import Annotated, TypedDict,List
from langgraph.constants import START

# 自定义Reducer：接收两个参数并返回合并结果
# 自定义Reducer
def add_messages(ol_list:list,new_list:list):
    print("="*20)
    print("正在执行add_message")
    print('原列表',ol_list)
    print('新列表',new_list)
    print("="*20)
    # 合并策略：直接把原有的和新的列表的消息列表拼接
    return ol_list + new_list

class MyAgent(TypedDict):

    # 在初始使用自定义的reducer
    # Annotated[类型, reducer]：为该键绑定自定义合并函数 add_message
    # 这样每个节点写入的 messages 会累加，而不是覆盖
    messages:Annotated[List[BaseMessage],add_messages]

# 工具节点：向 messages 追加一条 ToolMessage（走 add_message 合并）
def tool_node(state:MyAgent):
    return {"messages":[ToolMessage(content="来自tool_node的内容",tool_call_id="xxx")]}

# LLM 节点：向 messages 追加一条 AIMessage
def llm_node(state:MyAgent):
    return {"messages":[AIMessage(content="来自llm_node的内容")]}

builder = StateGraph(state_schema=MyAgent)

builder.add_node(tool_node)
builder.add_node(llm_node)
builder.add_edge(START,"tool_node")
builder.add_edge("tool_node","llm_node")

graph = builder.compile()
# 初始 messages 是 HumanMessage，后续节点用 add_message 不断累加
resp = graph.invoke({"messages":[HumanMessage(content="你好")]})

print(resp)
```

### 状态的存储

#### 实际场景当中的问题

在前面的例子当中，我们看到，每次用户invoke时，LangGraph都会初始化一个空状态，然后将用户传入的初始状态合并进来，再继续往下执行。

这在一些一次性、简单任务过程中，没有什么问题。但是对于一些复杂任务，就会出现一些问题，考虑以下两个场景：

##### 场景一：在agent的一个会话里，需要在多次调用当中保持上下文

![场景一：同一会话多次调用保持上下文（天气助手）](assets/lessons-langgraph/image3.webp)

在这个场景下，我们定义的状态为messages列表，第一次调用过程中，图会在messages列表当中写入值。而第二次调用，又会初始化一个新的messages列表，导致缺失了第一次调用的上下文。

##### 场景二：图执行过程当中报错，不想重复已执行完节点，想要实现断点续传

![场景二：图执行中节点报错/断电时节点状态的写入](assets/lessons-langgraph/image4.webp)

在这个场景下，第一次调用过程中，图会在Node2节点因某些原因报错，但是我们想要拿到Node1节点所对应的值。并在修复完第二个节点之后，继续往下执行。

#### 状态的存储

前面所涉及到的问题，解决方案都是将第一次调用的结果，存储起来，然后在第二次调用时，从存储的结果当中取出状态，而不是让LangGraph去初始化空状态。

由于同一个agent会存在多用户或者单用户多会话等场景，要实现状态存储，并且后续能够找到正确的状态，就需要在状态当中做一个id映射，写入时指定一个id，读取时读取指定id的状态。

首先需要将状态存储起来，LangGraph为我们提供了一个存储状态的方式：**Checkpointer**。Checkpointer也即检查点， 它可以存储图执行过程当中所产生的状态，具体存储的位置，有内存、数据库等。Checkpointer所有相关的实例化类都来自于langgraph.checkpointer包。

LangGraph同样做了前述的id隔离，这个id在langgraph当中就称之为**thread_id**。需要注意：Thread_id和实际编码当中的线程没有联系，只是一种隔离状态空间的方式。

实际编码进行状态隔离的步骤，如下所示：

1. 创建checkpointer实例
2. 图编译时，传入checkpointer实例
3. 图调用时，传递thread_id：保证上下文空间，就传入相同的thread_id，需要开辟新的上下文空间，就传入新的thread_id。
对于前面所讲到的场景一，要想在一个会话中保持上下文，只需要在多次调用时，传入同一个thread_id即可；要想启动一个新会话，就传入一个新的thread_id。这也就是所谓“Agent短期记忆”。

```python
import os
import datetime
from langchain_tavily import TavilySearch
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langgraph.checkpoint.memory import InMemorySaver

# ---------------------- 1.初始化工具 ----------------------
# 实例化 Tavily 联网搜索工具，最多返回5条搜索结果
search = TavilySearch(max_results=5)
tools = [search]

# ---------------------- 2.初始化大模型 ----------------------
llm = init_chat_model(
    model="qwen/qwen3.8-max",          # 使用的模型名称
    model_provider="openai",           # openai兼容接口模式
    base_url=os.getenv("OPENAI_BASE_URL"), # 兼容接口地址，从环境变量读取
    api_key=os.getenv("OPENAI_API_KEY"),  # api密钥，从环境变量读取
)

# ---------------------- 3.创建带记忆的Agent ----------------------
# InMemorySaver：内存存储器，保存会话历史，程序重启记忆就丢失，仅调试使用
agent = create_agent(
    model=llm,
    tools=tools,
    checkpointer=InMemorySaver(),  # 开启会话记忆
)

# 会话配置：thread_id 会话id，同一个id代表同一段对话，记忆靠这个区分会话
config = {"configurable": {"thread_id": "1"}}

# 获取当前系统时间，作为system提示词内容
sys_content = f"当前时间：{datetime.datetime.now()}"

# ---------------------- 4.把消息单独提取到外部变量，代码整洁 ----------------------
# 第一轮对话消息
msg1 = [
    {"role": "system", "content": sys_content},   # 系统提示，告知模型当前时间
    {"role": "user", "content": "今天北京天气怎么样？"} # 用户提问
]

# 第二轮对话消息，依靠thread_id，agent自动读取历史，不需要手动拼接历史消息
msg2 = [
    {"role": "system", "content": sys_content},
    {"role": "user", "content": "上海呢？"}
]

# ---------------------- 5.调用Agent，非流式invoke，等待全部执行完成返回结果 ----------------------
# 第一轮提问
res1 = agent.invoke(input={"messages": msg1}, config=config)
print("=====第一轮回答=====")
# messages最后一条是AI输出的回答内容
print(res1["messages"][-1].content, "\n")

# 第二轮提问，使用同一个thread_id，Agent记得上一轮问的北京天气
res2 = agent.invoke(input={"messages": msg2}, config=config)
print("=====第二轮回答=====")
print(res2["messages"][-1].content)
```

#### 从状态中恢复执行

在上边的案例中，checkpointer是通过InMemorySaver进行实例化的，这个实例会将状态全部存储到内存当中，这仍然不能解决场景二的问题，场景二涉及的问题不再是多次调用之间，保持上下文不中断，而是如何进行**故障恢复**。

在因为故障导致进程退出后，内存状态空间当中的内容，将全部丢失。在实际生产环境下，需要使用数据库做持久化状态存储。

下面代码当中，Node2节点表示在实际执行过程中，因为某些原因导致的错误。如果将相关的状态存储到数据库中，在第一次执行时，node2前面节点的状态，会写入到数据库中，示例代码如下（关键点参见带序号注释）：

```bash
pip install langgraph.checkpoint.sqlite
```

```python
from langgraph.graph import StateGraph, START
from typing import TypedDict
import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver

# 持久化
conn = sqlite3.connect("./crash_demo.db", check_same_thread=False)
memory = SqliteSaver(conn)

class State(TypedDict):
    a: str
    b: str

def node1(state: State):
    print("\n>>>【执行 node1】")
    return {"a": "node1产出的数据"}

def node2(state: State):
    print("\n>>>【进入 node2】")
    # 模拟业务报错，普通Exception，不是interrupt
    raise RuntimeError("模拟网络调用失败，程序炸了")
    return {"b": "node2的数据"}  # 永远走不到

def node3(state: State):
    print("\n>>>【执行 node3】全部完成")
    return {}

# 构图
builder = StateGraph(State)
builder.add_node("node1", node1)
builder.add_node("node2", node2)
builder.add_node("node3", node3)

builder.add_edge(START, "node1")
builder.add_edge("node1", "node2")
builder.add_edge("node2", "node3")

graph = builder.compile(checkpointer=memory)
config = {"configurable": {"thread_id": "crash_001"}}

if __name__ == "__main__":
    print("=====①第一次运行，node2抛出异常崩溃=====")
    try:
        graph.invoke({}, config=config)
    except Exception as e:
        print(f"捕获异常: {e}")

```

在node2节点问题处理完成后，要想从故障中恢复，需要以下两点：

1. invoke时传递None作为初始参数；
2. 传入相同的thread_id。
满足以上两点，即可让图从断点开始，以第一次调用的历史状态，继续往下执行，示例代码如下（关键点参见带序号注释）：

```python
from langgraph.graph import StateGraph, START
from typing import TypedDict
import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver

# 持久化
conn = sqlite3.connect("./crash_demo.db", check_same_thread=False)
memory = SqliteSaver(conn)

class State(TypedDict):
    a: str
    b: str

def node1(state: State):
    print("\n>>>【执行 node1】")
    return {"a": "node1产出的数据"}

def node2(state: State):
    print("\n>>>【进入 node2】")
    # 模拟业务报错，普通Exception，不是interrupt
    # raise RuntimeError("模拟网络调用失败，程序炸了")
    return {"b": "node2的数据"}  # 永远走不到

def node3(state: State):
    print("\n>>>【执行 node3】全部完成")
    return {}

# 构图
builder = StateGraph(State)
builder.add_node("node1", node1)
builder.add_node("node2", node2)
builder.add_node("node3", node3)

builder.add_edge(START, "node1")
builder.add_edge("node1", "node2")
builder.add_edge("node2", "node3")

graph = builder.compile(checkpointer=memory)
config = {"configurable": {"thread_id": "crash_001"}}

if __name__ == "__main__":
    print("\n=====②恢复：invoke(None, config)，同一个thread_id =====")
    try:
        graph.invoke(None, config=config)
    except Exception as e:
        print(f"再次捕获异常: {e}")

    conn.close()

```



### 获取历史状态

前面我们了解到，构造checkpointer之后，langgraph可以保证在多次调用之间，保证状态的连续，或者是通过状态进行恢复。不过，要想再深入了解状态，就需要知道状态的保存时机和如何获取到所有的历史状态。

#### LangGraph底层运行算法

在了解如何获取历史状态之前，首先我们需要了解一下LangGraph底层算法—Pregel。

Pregel 是LangGraph底层的一个类，管理 LangGraph 应用程序的运行时（runtime）行为。也就是说，整个图结构，从开始到结束的迭代执行过程，是由Pregel控制管理的。

在这个类当中，有两大主要组件：

##### Actors (节点)

Actor即为在前面介绍的Node，对应在LangGraph当中的类为PregelNode，其订阅某些通道（channels），从通道当中读取数据，或者写入数据。PregelNode也实现了LangChain的Runnable接口。

##### Channels（通道）

Channels用于actors之间通信，每个通道都有一个值类型、一个更新类型和一个更新函数 —— 该函数接收一系列更新并修改存储的值。

正是因为这种设计，在LangGraph中通过边和节点构建的图，不是一个传统的有向无环图（DAG）。在传统的有向无环图下，节点的执行顺序，完全边的连接，某个节点只有在和它连接的所有的上游节点都执行完成了后，才会执行。

而在LangGraph图当中，节点的执行来自于一个Pregel的超步（SuperStep）。而一个超步的执行逻辑，分为如下三个过程：

1. Plan阶段：确定在此步骤中要执行哪些Actors。例如，在第一步中，选择订阅特殊输入通道的Actors；在后续步骤中，选择订阅上一步骤中更新的通道的参与者
2. Execute阶段：并行执行所有选定的Actors，直到所有参与者完成、其中一个失败或达到超时时间
3. Update阶段：用本步骤中Actors所写的值更新channels。
由以上三个步骤组合而成的超步会重复执行，直到没有Actors被选中执行，或者达到最大步骤数为止。

以如下的图为例：

![逻辑图经 builder.compile() 编译为 Pregel Graph（Actors 与 Channels）](assets/lessons-langgraph/image5.webp)

图中展示了builder.compile()内部逻辑：将逻辑图，转换成Pregel实例，而节点和边，分别转换成了Actors和Channels实例。

针对于Actors实例，每个Actor实例都有其订阅和写入的Channels，如下图所示：

![Actors（节点）内部的订阅渠道与写入渠道](assets/lessons-langgraph/image6.webp)

整个图的执行流程，可以分为如下几个Step，Step索引从0开始：

![Pregel 运行算法 Step0~Step3 的执行演进示意](assets/lessons-langgraph/image7.webp)

整个执行流程如下：

首先在step为-1时，__START__节点执行（图中未标注），将相关状态写入到branch:to:a当中；在Step0当中，节点a执行，将状态写入到branch:to:b和branch:to:c；在Step1当中，节点b和c执行，将状态写入到branch:to:b_2和branch:to:d当中；在Step2，节点b_2和节点d执行，b_2节点再次将状态写入到branch:to:d当中。在Step3当中，节点d再次执行，由于没有新的状态更新，图执行过程结束。

示例代码如下所示：

```python
import operator
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END

# -------------------------- 1. 定义状态
class State(TypedDict):
    # operator.add：多次写入做列表拼接，而不是直接覆盖
    item: Annotated[list, operator.add]

# -------------------------- 2. 定义节点函数
def node_a(state: State):
    print(f"【node_a】 当前item: {state['item']}")
    return {"item": ["A"]}

def node_b(state: State):
    print(f"【node_b】 当前item: {state['item']}")
    return {"item": ["B"]}

def node_b2(state: State):
    print(f"【node_b2】 当前item: {state['item']}")
    return {"item": ["B2"]}

def node_c(state: State):
    print(f"【node_c】 当前item: {state['item']}")
    return {"item": ["C"]}

def node_d(state: State):
    print(f"【node_d】 当前item: {state['item']}")
    return {"item": ["D"]}

# -------------------------- 3. 构建图拓扑
builder = StateGraph(State)
builder.add_node("a", node_a)
builder.add_node("b", node_b)
builder.add_node("b2", node_b2)
builder.add_node("c", node_c)
builder.add_node("d", node_d)

# 拓扑关系
# START → a 分出两路：a→b→b2，a→c；b2与c全部完成后才跑d
builder.add_edge(START, "a")
builder.add_edge("a", "b")
builder.add_edge("a", "c")
builder.add_edge("b", "b2")
builder.add_edge("b2", "d")
builder.add_edge("c", "d")
builder.add_edge("d", END)

graph = builder.compile()

# -------------------------- 4. 打印底层Pregel信息
print("===== ① channels：状态通道 =====")
print(graph.channels, "\n")

print("===== ② node:a 订阅/写入通道 =====")
# triggers(订阅)：哪些通道更新会触发本节点执行
# writers(写入)：本节点允许写入哪些通道
print("a的订阅 =", graph.nodes["a"].triggers)
print("a的写入  =", graph.nodes["a"].writers, "\n")

print("===== ③ node:d 订阅/写入通道 =====")
print("d的订阅 =", graph.nodes["d"].triggers)
print("d的写入  =", graph.nodes["d"].writers, "\n")

print("="*80)

# -------------------------- 5. 运行图
result = graph.invoke({"item": []})
print("\n===== 最终状态 =====")
print(result)

```

#### 获取图执行的历史状态

理解了Pregel和Step的概念之后，现在可以来学习如何获取图执行的历史状态，以及如何看懂历史状态当中所存储的内容。

构建好的graph实例，可以通过get_state() / get_state_history()方法，传入想要获取的历史状态的thread_id，即可拿到图执行过程中的历史状态，get_state()方法获取到的是最近一个时间步的状态，get_state_history()获取到的是图执行当中所有时间步的历史状态，其输出值为一个迭代器，按照时间步倒序排列。

历史状态由StateSnapShot实例表示，也即状态快照，其中包含的信息如下：

| 名称 | 类型 | 描述 |
|---|---|---|
| values | dict[str, Any] | Any | 当前状态信息 |
| next | tuple[str, ...] | 本超步中每个任务要执行的节点名称 |
| config | RunnableConfig | 用于获取此快照的配置。 |
| metadata | CheckpointMetadata | 与此快照相关联的元数据 |
| parent_config | RunnableConfig | 用于获取父快照（如果有的话）的配置。 |
| interrupts | tuple[Interrupt, ...] | 此超步中发生且有待解决的中断。 |

我们重点需要关注的是，在状态快照中，除了有当前状态值以外，还包含接下来需要执行的节点名称，这也为从故障中恢复提供了有用的信息，我们可以通过状态快照直接知道，从哪一个节点开始继续往下执行。

示例代码如下所示：

```python
import operator
from typing import Annotated, Any
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3

# 用 SQLite 持久化，才能读取历史状态快照
connection = sqlite3.connect('checkpointer.db', check_same_thread=False)
checkpointer = SqliteSaver(connection)


class State(TypedDict):
    """
    状态类型定义
    """
    item: Annotated[list, operator.add]


def a(state: State, config):
    print(f'Adding "A" to {state["item"]}', flush=True)
    return {"item": ["A"]}


def b(state: State, config):
    print(f'Adding "B" to {state["item"]}', flush=True)
    return {"item": ["B"]}


def b_2(state: State, config):
    print(f'Adding "B_2" to {state["item"]}', flush=True)
    return {"item": ["B_2"]}


def c(state: State, config):
    print(f'Adding "C" to {state["item"]}', flush=True)
    return {"item": ["C"]}


def d(state: State, config):
    print(f'Adding "D" to {state["item"]}', flush=True)
    return {"item": ["D"]}


builder = StateGraph(State)

builder.add_node("a", a)
builder.add_node("b", b)
builder.add_node("b_2", b_2)
builder.add_node("c", c)
builder.add_node("d", d)

builder.add_edge(START, "a")
builder.add_edge("a", "b")
builder.add_edge("a", "c")
builder.add_edge("b", "b_2")
builder.add_edge("b_2", "d")
builder.add_edge("c", "d")
builder.add_edge("d", END)

# 编译并传入 checkpointer
graph = builder.compile(checkpointer=checkpointer)
res = graph.invoke({"item": []}, config={'configurable': {'thread_id': '1'}})

# 1、最终状态
print(res)

print("*" * 100)

# 2、查看历史所有状态
# get_state_history 返回生成器
all_states = graph.get_state_history(config={'configurable': {'thread_id': '1'}})
all_states_list = list(all_states)
print("历史所有状态如下：\n")
for state in all_states_list:
    print(state, end="\n" + "=" * 30 + "\n")

print("\n\n最近一次状态如下：\n")
# 查看最近一次状态快照
last_state = graph.get_state(config={'configurable': {'thread_id': '1'}})
print(last_state)

```

## 节点

### 节点的输入输出

#### 节点输入

在LangGraph中，一般来讲，节点都是Python函数（可以是同步的，也可以是异步的），它们接受以下参数：

state：图的状态，代表了具体的业务数据；

config：一个RunnableConfig对象，包含诸如thread_id之类的配置信息，在调用图时，也可以传递用户定义的其他配置；

runtime：一个Runtime对象，包含运行时context（可自定context，在调用图时传入即可）以及其他信息，如store和stream_writer等；

以上参数，会在运行过程中，自动被LangGraph运行时注入。

节点定义config和runtime入参如下所示，在运行时，这两个参数LangGraph名称会通过关键字传参方式进行传参，因此两个参数位置可以调换。

具体示例如下：

```python
import time
from typing import TypedDict, List
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, START, END
from langgraph.runtime import Runtime


# 模拟大模型外部依赖
class MockLLM:
    def generate(self, prompt: str):
        return f"AI回答{prompt}问题: xxxxxx"


# 定义图状态结构
class ChatState(TypedDict):
    user_query: str
    ai_response: str
    log: List[str]


def chat_node(state: ChatState, config: RunnableConfig, runtime: Runtime) -> dict:

    print(state)
    print(config)
    print(runtime)

    print("**************************************")
    """
    节点函数，三个参数由LangGraph运行时自动注入
    state: 图内部状态
    config: 运行配置，存放业务参数
    runtime: 运行时对象，用于获取注入依赖、输出中间流数据
    """
    # 1. 从state读取图状态数据
    question = state["user_query"]

    # 2. 从config中读取业务参数
    configurable = config.get("configurable")
    user_id = configurable.get("user_id")

    # 3. 从runtime.context获取外部注入的对象
    llm = runtime.context["llm"]

    # 调用模拟大模型
    result = llm.generate(f"user[{user_id}] 提问: {question}")

    # 返回字典，会增量合并更新到图状态，不需要返回全部字段
    return {
        "ai_response": result,
        "log": [f"当前用户id:{user_id}"]
    }


def run_demo():
    builder = StateGraph(ChatState)
    builder.add_node("chat_node", chat_node)

    builder.add_edge(START, "chat_node")
    builder.add_edge("chat_node", END)
    graph = builder.compile()

    # 实例化外部依赖对象
    my_llm = MockLLM()

    # 图初始状态
    init_state = {"user_query": "如何学习LangGraph?"}

    # config：传递业务参数，会注入节点的config参数
    config = {
        "configurable": {
            "user_id": "stu_10086"
        }
    }

    # context：外部对象注入到节点的runtime.context
    context = {
        "llm": my_llm
    }

    final_state = graph.invoke(init_state, config=config, context=context)
    print("\n工作流执行完成，最终状态：")
    print(final_state)


if __name__ == "__main__":
    run_demo()

```

#### 节点输出

节点的输出为当前节点对状态的增量更新，而不能将接收到的整个状态实例返回出去。

LangGraph底层会将所有节点输出的状态，都作为增量状态，并尝试和当前的全局状态做一次合并操作。如果将整个状态都输出，对于没有配置任何reducer的状态键，langgraph底层无法完成合并，会抛出异常；对于配置了reducer的状态键，如果节点输出了不属于该节点更新的状态，也会导致数据产生问题。

以下演示错误返回了整个状态的问题：

```python
from typing import TypedDict
from langgraph.constants import START,END
from langgraph.graph import StateGraph

class MyState(TypedDict):
    query:str
    file_result:str 
    web_result:str 
    final_answer:str 

# 错误演示：直接 return 整个 state，而非当前节点增量修改的状态
def query_web(state:MyState)->dict:
    """
    做网络搜索，返回搜索结果
    :return:
    """
    # 1、错误演示：直接return整个state，而非当前节点增量修改的状态
    query = state['query']
    state['web_result'] = f'{query}的网络搜索结果'
    return state

graph = StateGraph(state_schema=MyState)
graph.add_node(query_web)

graph.add_edge(START,"query_web")
graph.add_edge("query_web",END)

graph_compile = graph.compile()

res = graph_compile.invoke({"query": "什么是LangChain？"})

print(res)

```

### 特殊节点

START和END节点都是LangGraph当中的特殊节点。START它代表着将用户输入发送到图中的节点。引用此节点的主要目的是确定应首先调用哪些节点。END节点是一个特殊节点，代表终止节点。当想表示哪些边在完成后没有动作时，会引用这个节点。

START和END节点本质上是一个字符串，如下所示：

```python
# END / START 本质上就是被驻留（intern）的字符串常量，
# LangGraph 靠这些字符串在图中定位虚拟起止节点
END = sys.intern("__end__")
"""The last (maybe virtual) node in graph-style Pregel."""
START = sys.intern("__start__")
"""The first (maybe virtual) node in graph-style Pregel."""
```

START作为一个特殊节点，在图执行完START节点之后，也会创建一个checkpoint，参考3.3.2节。

### 节点缓存

LangGraph支持基于节点输入对节点进行缓存。对于配置了缓存的节点，且缓存结果没有过期，以相同的输入再次调用节点时，可直接从缓存当中读取结果，不需要再进行节点计算。

使用缓存的方法如下：

1. 编译图时指定缓存存储后端：langgraph.cache包当中提供了内存级别的缓存后端，Redis缓存后端，和Sqlite缓存后端的具体实现，需要构造相关实例，并在图编译时传入。
2. 为节点指定缓存策略。每个缓存策略需配置：
key_func：用于根据节点的输入生成缓存键，默认情况下是使用pickle对输入进行hash运算的结果。

ttl：缓存的生存时间（以秒为单位）。如果未指定，缓存将永不过期。

```python
import time
from typing_extensions import TypedDict
from langgraph.graph import StateGraph
from langgraph.cache.memory import InMemoryCache

from langgraph.types import CachePolicy
from langgraph.constants import START
from langgraph.checkpoint.memory import InMemorySaver

class State(TypedDict):
    x: int
    result: int

builder = StateGraph(State)
checkpointer = InMemorySaver()

# 1、定义节点：模拟一些有耗时计算的节点
# 1、定义节点：模拟有耗时计算的节点
def expensive_node(state: State) -> dict[str, int]:
    # expensive computation
    print(f"expensive_node 被调用")
    time.sleep(5)
    print(f"expensive_node 计算完成")
    return {"result": state["x"] * 2}

# 2、添加节点时，为节点配置缓存策略，这里设置为10秒缓存，缓存键的配置同样使用默认的方式，可以在CachePolicy当中传入key_func配置不同的缓存键生成策略
# 2、添加节点时配置缓存策略：ttl=10 表示 10 秒缓存。
# 缓存键默认用 pickle 对输入 hash，也可在 CachePolicy 中传 key_func 自定义
builder.add_node("expensive_node", expensive_node, cache_policy=CachePolicy(ttl=10))
builder.add_edge(START, "expensive_node")

# 3、图编译时，传入缓存器，此处使用InMemoryCache，也可以使用RedisCache等
# 3、编译时传入缓存器：InMemoryCache（也可用 RedisCache 等）
graph = builder.compile(cache=InMemoryCache(),checkpointer=checkpointer)

# 4、第一次调用，传入的状态为5
# 4、第一次调用，传入状态 x=5
print(graph.invoke({"x": 5},config={"configurable":{"thread_id":"1"}}))

# 5、第二次调用，传入相同的状态，由于缓存策略，会直接从缓存中返回结果，而不会重新调用节点
# 5、第二次调用相同状态：命中缓存直接返回，不再重新执行节点
# 必须使用不同的id 因为在开启缓存的情况下 再次访问会将上一次的结果作为输入 再次进行访问
# {"x" : 5 , "result" : 10} 所以缓存不会命中

print(graph.invoke({"x": 5},config={"configurable":{"thread_id":"2"}}))
```

### 节点重试

在很多使用场景中，有些节点由于客观原因限制，导致其执行过程是不稳定的。因此，我们可能希望节点拥有自定义的重试策略，例如在调用API、查询数据库或调用大语言模型（LLM）等情况下。

为节点添加重试策略，需要在add_node中设置retry_policy参数。retry_policy参数接受一个RetryPolicy命名元组对象。RetryPolicy对象有两个属性：max_attempts和retry_on参数，前者定义了总共重试次数，后者定义了对于哪些异常类型进行重试。

示例代码如下：

```python
from typing import Dict, Any
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.types import RetryPolicy

class State(TypedDict):
    result: str

attempt_counter = 0


def unstable_api_call(state: State) -> Dict[str, Any]:
    """模拟不稳定API，前2次失败，第3次成功"""
    global attempt_counter
    attempt_counter += 1
    print(f"👉 第 {attempt_counter} 次调用API")
    if attempt_counter < 3:
        raise ValueError("值错误，将无法重试")  #raise Exception(f"API失败")   #
    return {"result": f"成功，共尝试{attempt_counter}次"}


def run_demo():
    global attempt_counter
    # --------演示1：默认重试策略 --------
    attempt_counter = 0
    builder1 = StateGraph(State)
    builder1.add_node("api_node", unstable_api_call, retry_policy=RetryPolicy(max_attempts=5))
    builder1.add_edge(START, "api_node")
    builder1.add_edge("api_node", END)
    graph1 = builder1.compile()
    res = graph1.invoke({"result": ""})
    print(res)


if __name__ == "__main__":
    run_demo()
    print("不会重试的异常包括: ValueError, TypeError, ArithmeticError, ImportError,")
    print("LookupError, NameError, SyntaxError, RuntimeError,")
    print("ReferenceError, StopIteration, StopAsyncIteration, OSError\n")

```

### 图内外数据传递

默认情况下，通过graph.invoke调用图时，仅在整个图的执行过程都结束之后，我们才能够拿到最终的状态，那么如果想要在图的执行过程当中，想要获取到图内部所产生的数据，应该如何实现？

考虑Agent的一个场景：首先，我们希望在LLM输出时，就能够拿到LLM所产生的token，在前端进行展示；其次，如果Agent的流程较长，我们希望能够拿到，当前正在执行的节点或者流程是什么。

由于LangGraph实现了langchain_core当中的Runnable接口，其为我们提供了stream和astream方法，也即流式输出方法，通过流式输出，就能解决前面所说到的问题。

Stream方法提供了多种不同的模式，如下表所示：

| 模式 | 描述 |
|---|---|
| values | 每一个执行后，流式输出完整的状态 |
| updates | 图执行过程中，每一步执行后流式输出增量更新。如果在同一个步当中产生了多个增量更新，这些增量更新会分别流式输出。 |
| custom | 流式输出节点内部的自定义数据。 |
| messages | 在任何调用了LLM的节点当中，流式输出两元组数据：（LLM Token，metadata） |
| debug | 流式输出所有能输出的信息 |
| 混合模式 | 流模式传入列表，在列表当中添加多种不同的模式，可以得到多种流式输出 |

具体代码如下所示：

```python
import os
import time
from typing import TypedDict, Annotated, List
import operator

from langchain.chat_models import init_chat_model
from langchain_core.callbacks.manager import handle_event
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END
from langgraph.types import StreamWriter
from langgraph.runtime import Runtime

llm = init_chat_model(
    model= "qwen/qwen3.8-omni-flash",
    model_provider="openrouter", #模型供应商和选择 openrouter
    api_key  = os.getenv("OPENAI_API_KEY"),
    base_url = os.getenv("OPENAI_BASE_URL")
)

# --- 1. 定义状态 ---
class State(TypedDict):
    # messages 用 operator.add 累加；current_step 记录当前步骤
    messages: Annotated[List[BaseMessage], operator.add]
    current_step: str

# --- 2. 定义节点 ---

def node_input(state: State):
    """模拟接收用户输入"""
    return {
        "messages": [HumanMessage(content="请帮我写一段Python代码")],
        "current_step": "input_received"
    }

def node_processing(state: State, runtime: Runtime):
    """
    模拟中间处理过程，并使用 writer 输出自定义流式数据
    这对应 stream_mode="custom"
    """
    steps = ["正在分析意图...", "正在检索知识库...", "正在构建Prompt..."]
    writer = runtime.stream_writer
    for i, step in enumerate(steps):
        time.sleep(0.5)  # 模拟耗时操作

        # 使用 writer 发送自定义数据 (不影响图的状态)
        # 这些数据只能通过 stream_mode="custom" 接收到
        writer({
            "step_index": i + 1,
            "description": step,
            "timestamp": time.time()
        })

    return {"current_step": "processing_complete"}

def node_generation(state: State):
    """
    模拟 LLM 生成过程
    LangGraph 的 stream_mode="messages" 会自动捕获 LLM 的流式输出
    """
    # 调用 LLM
    response = llm.invoke(state["messages"])
    return {
        "messages": [response],
        "current_step": "generation_complete"
    }

# --- 3. 构建图 ---
builder = StateGraph(State)
builder.add_node("input", node_input)
builder.add_node("process", node_processing)
builder.add_node("generate", node_generation)

builder.add_edge(START, "input")
builder.add_edge("input", "process")
builder.add_edge("process", "generate")
builder.add_edge("generate", END)

graph = builder.compile()


# --- 4. 演示不同的流式输出模式 ---
def run_demo():
    initial_state = {"messages": [], "current_step": "start"}

    print(f"\n{'=' * 20} 1. Mode: values (输出完整状态) {'=' * 20}")
    print("描述: 每执行完一个节点，输出当前的完整 State")
    for event in graph.stream(initial_state, stream_mode="values"):
        # event 就是当前的 State 字典
        print(f"State: keys={list(event.keys())}, step={event.get('current_step')}")

    print(f"\n{'=' * 20} 2. Mode: updates (输出增量更新) {'=' * 20}")
    print("描述: 每执行完一个节点，输出该节点返回的增量数据")
    for event in graph.stream(initial_state, stream_mode="updates"):
        # event 是一个字典，key是节点名，value是该节点的输出
        print(f"Update: {event}")

    print(f"\n{'=' * 20} 3. Mode: custom (输出自定义数据) {'=' * 20}")
    print("描述: 仅输出节点内部通过 writer() 发送的数据")
    for event in graph.stream(initial_state, stream_mode="custom"):
        # event 就是 writer() 中传入的对象
        print(f"Custom Data: {event}")

    print(f"\n{'=' * 20} 4. Mode: messages (输出 LLM Token) {'=' * 20}")
    print("描述: 输出 LLM 生成的消息片段 (Token)")
    # 注意：FakeListChatModel 默认是一次性返回，但在 messages 模式下会被包装成 chunk
    for chunk, metadata in graph.stream(initial_state, stream_mode="messages"):
        # chunk 是 BaseMessageChunk 对象
        # metadata 包含 node 信息
        node_name = metadata.get('langgraph_node', 'unknown')
        print(f"[{node_name}] Token: {chunk.content!r}")
        # print(chunk.content,end="")
        time.sleep(0.2)

    print(f"\n{'=' * 20} 5. Mode: debug (调试模式) {'=' * 20}")
    print("描述: 输出所有详细的执行信息，包括任务调度、输入输出等")
    # debug 模式输出量很大，这里只打印前几条示意
    count = 0
    for event in graph.stream(initial_state, stream_mode="debug"):
        if count < 3:
            print(f"Debug Event: {event['type']} - {event.get('payload', {}).get('name')}")
        count += 1
    print("... (省略后续 debug 信息)")



if __name__ == "__main__":
    run_demo()
```

### 人工审核节点

Agent在完成用户设定的任务时，有时候我们希望用户参与当中部分重要决策过程。LangGraph为此提供了一个非常方便的原语：interrupt。其原理如下图所示：

![人工审核节点：interrupt 中断与人机交互恢复流程](assets/lessons-langgraph/image8.webp)

可以在节点内部任意位置引入interrupt，当节点执行到interrupt所在位置时，就会停止执行，并可以得到从图内传递出来的，需要用户审核的数据，在用户进行相关审核完成后，又可通过graph.invoke，让图继续往下执行。

具体示例如下：

```python
"""
LangGraph interrupt 演示：让用户参与关键决策

场景：准备执行一笔“转账”，在真正执行前让用户审核/修改转账信息。
"""

from __future__ import annotations

from typing import Any
from typing_extensions import TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt

# 转账相关状态
class TransferState(TypedDict):
    recipient: str
    amount: int
    memo: str
    approved: bool
    final_status: str

def review_transfer(state: TransferState) -> dict[str, Any]:
    print("\n[Node] review_transfer：生成待执行的转账请求")
    pending_transfer = {
        "recipient": state["recipient"],
        "amount": state["amount"],
        "memo": state["memo"],
    }

    # interrupt：执行到这里暂停，把待审核数据传给图外用户，并等待用户决策
    user_review = interrupt(
        {
            "title": "转账审核",
            "pending_transfer": pending_transfer,
            "instruction": "请返回 bool(是否批准) 或 dict(可改 recipient/amount/memo，并带 approved 字段)。",
        }
    )

    # 解析用户的审核结果：可能是 bool，也可能是修改后的 dict
    approved = False
    updated_transfer = dict(pending_transfer)
    if isinstance(user_review, bool):
        approved = user_review
    elif isinstance(user_review, dict):
        approved = bool(user_review.get("approved", True))
        for k in ("recipient", "amount", "memo"):
            if k in user_review:
                updated_transfer[k] = user_review[k]

    print(f"[Node] review_transfer：用户审核结果 approved={approved}，transfer={updated_transfer}")
    return {
        "approved": approved,
        "recipient": updated_transfer["recipient"],
        "amount": updated_transfer["amount"],
        "memo": updated_transfer["memo"],
    }

def execute_transfer(state: TransferState) -> dict[str, str]:
    # 未批准则取消转账
    if not state["approved"]:
        print("\n[Node] execute_transfer：用户未批准，取消转账")
        return {"final_status": "已取消：用户未批准转账"}

    print("\n[Node] execute_transfer：模拟执行转账")
    recipient = state["recipient"]
    amount = state["amount"]
    memo = state["memo"]
    return {"final_status": f"已转账：收款人={recipient}，金额={amount}，备注={memo}"}

def build_graph():
    builder = StateGraph(TransferState)
    builder.add_node("review_transfer", review_transfer)
    builder.add_node("execute_transfer", execute_transfer)

    builder.add_edge(START, "review_transfer")
    builder.add_edge("review_transfer", "execute_transfer")
    builder.add_edge("execute_transfer", END)

    # 中断功能依赖 checkpointer 持久化执行进度
    return builder.compile(checkpointer=InMemorySaver())

def run_demo():
    graph = build_graph()
    # 同一 thread_id 保证中断后能用相同会话恢复
    config = {"configurable": {"thread_id": "interrupt-demo-1"}}

    print("==================================================")
    print("场景：转账前人工审核（interrupt）")
    print("第一次 invoke 会停在 interrupt，并把审核数据带出来")
    print("第二次 invoke 使用 Command(resume=...) 把用户决策传回去继续执行")
    print("==================================================")

    initial_state: TransferState = {
        "recipient": "Alice",
        "amount": 100,
        "memo": "午饭AA",
        "approved": False,
        "final_status": "",
    }

    # 第一次调用：执行到 interrupt 暂停，返回 __interrupt__ 中的待审核数据
    first = graph.invoke(initial_state, config=config)
    interrupt_payload = first["__interrupt__"][0].value
    print("\n[System] 图已暂停，等待用户审核。可给用户展示的数据如下：")
    print(interrupt_payload)

    user_resume_value = {"approved": True}  # , "amount": 80, "memo": "改为80元（实际应付）"
    # 第二次调用：用 Command(resume=...) 把决策传回图，从断点继续执行
    final = graph.invoke(Command(resume=user_resume_value), config=config)
    print("\n[System] 已恢复执行，最终结果：")
    print(final["final_status"])

if __name__ == "__main__":
    run_demo()
```

**需要注意的是**，使用interrupt时，在第二次调用graph.invoke(command)继续执行时，有interrupt的函数，会从函数起点往下执行，如果在函数当中，有更新数据、调用API接口等相关操作时，会造成多次重复执行的情况。因此，一定要保证这种类型操作的幂等性，或者是将其封装到一个单独的节点当中，避免在恢复时再次执行。

## 边

### 边的本质

定义边，本质上是定义了，Pregel当中节点订阅的状态通道和节点执行之后，需要更新的状态通道。

边有几种关键类型：

Normal Edges: 普通边。直接从一个节点连接到下一个节点。

Conditional Edges: 条件边。调用函数以确定接下来要前往哪个（哪些）节点。

### 条件边

条件边的本质是一个路由函数，其根据当前状态动态决定下一个要执行的节点。

```python
from typing import Literal
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END

# 定义状态
# 状态：value 用于路由判断，step 记录当前执行步骤
class GraphState(TypedDict):
    value: int
    step: str

# 定义节点函数
def node_a(state: GraphState) -> dict:
    """节点A"""
    print("执行节点A")
    return {"value": state["value"], "step": "A执行完毕"}

def node_b(state: GraphState) -> dict:
    """节点B"""
    print("执行节点B")
    return {"value": state["value"] * 2, "step": "B执行完毕"}

def node_c(state: GraphState) -> dict:
    """节点C"""
    print("执行节点C")
    return {"value": state["value"] - 1, "step": "C执行完毕"}

# 条件边的路由函数
# 条件边的路由函数：根据状态动态决定下一个执行哪个节点
def route_condition(state: GraphState) -> Literal["node_b", "node_c"]:
    """根据value值决定路由到哪个节点"""
    if state["value"] % 2 == 0:
        return "node_b_alias"  # 偶数路由到节点B
    else:
        return "node_c_alias"  # 奇数路由到节点C

def main():
    """演示条件边"""
    print("=== 条件边演示 ===")
    
    # 创建图
    builder = StateGraph(GraphState)
    
    # 添加节点
    builder.add_node("node_a", node_a)
    builder.add_node("node_b", node_b)
    builder.add_node("node_c", node_c)
    
    # 添加边
    builder.add_edge(START, "node_a")  # 入口点
    
    # 添加条件边
    # 添加条件边：源节点 node_a → 路由函数 route_condition → 路由映射表
    builder.add_conditional_edges(
        "node_a",  # 源节点
        route_condition,  # 路由函数
        {  # 路由映射
            "node_b_alias": "node_b",
            "node_c_alias": "node_c"
        }
    )
    
    # 从B和C到结束
    builder.add_edge("node_b", END)
    builder.add_edge("node_c", END)
    
    # 编译图
    graph = builder.compile()
    
    # 执行图 - 偶数情况
    print("输入值为偶数:")
    result = graph.invoke({"value": 2})
    print(f"执行结果: {result}")
    
    # 执行图 - 奇数情况
    print("\n输入值为奇数:")
    result = graph.invoke({"value": 1})
    print(f"执行结果: {result}\n")

if __name__ == "__main__":
    main()
```

### 可控循环

通过条件边，我们可以构建带有循环结构的图，例如在典型的REACT模式下，工具调用和大模型总结生成结果形成了一个循环，如下图所示：

![图内外数据传递：input→model→(tools)→output](assets/lessons-langgraph/image9.webp)

需要注意的是，这种带循环的图结构，有一个隐藏的问题：图执行过程当中，可能因为某些原因，导致一直在循环内循环往复执行，因此LangGraph也提供了一个强制使图的执行终止的递归限制参数。

递归限制设定了图在抛出错误之前允许执行的超级步骤数量，默认值25，在graph.invoke的config参数中指定。在经过指定数量的超级步骤后，图还没有自然停止执行时，LangGraph会抛出异常GraphRecursionError。

示例代码如下所示：

```python
from typing import Annotated, Dict, Literal
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.errors import GraphRecursionError

# 状态：count 当前循环次数，result 处理结果，max_count 终止条件
class LoopState(TypedDict):
    count: int
    result: str
    max_count: int

def node_a(state: LoopState) -> dict:
    """节点a：处理逻辑并更新计数"""
    print(f"执行节点a，当前计数: {state['count']}")
    return {
        'count': state['count'] + 1,
        'result': f"已处理{state['count']}次"
    }

def node_b(state: LoopState) -> dict:
    """节点b：辅助处理"""
    print(f"执行节点b，当前计数: {state['count']}")
    return {
        'result': f"已处理{state['count']}次 - 辅助处理"
    }

# 条件路由函数：决定是继续循环还是终止
def route(state: LoopState) -> Literal["b", END]:
    """条件路由函数：决定是继续循环还是终止"""
    # 终止条件：当计数达到最大值时终止
    if state['count'] >= state['max_count']:
        print(f"满足终止条件，计数 {state['count']} >= {state['max_count']}，返回END")
        return END
    else:
        print(f"未满足终止条件，计数 {state['count']} < {state['max_count']}，返回b")
        return "b"

# 创建图
builder = StateGraph(LoopState)

# 添加节点
builder.add_node("a", node_a)
builder.add_node("b", node_b)

# 添加边
builder.add_edge(START, "a")
# a 经条件边 route 决定去 b 还是 END
builder.add_conditional_edges("a", route)
# b→a 形成循环
builder.add_edge("b", "a")

# 编译图
graph = builder.compile()

# 执行图
print("=== 开始执行工作流 ===")
try:
    result = graph.invoke(input={
        'count': 0,
        'result': '',
        'max_count': 10
    }, config={
        # 设置递归限制：最多执行 6 个超步，防止死循环
        'recursion_limit': 6  # 设置递归限制
    })
    print("=== 执行结果 ===")
    print(result)
except GraphRecursionError as e:
    print(f"递归错误: {e}")
```

---

## 动手练习与验收标准

> 素材出处：`举个栗子/举个栗子/day29/demo1/lg_1.py`、`举个栗子/举个栗子/day29/demo2/lg_3.py`、`举个栗子/举个栗子/day29/demo2/lg_4.py`、`举个栗子/举个栗子/LangGraph-课件/尚硅谷大模型技术之LangGraph.md`

### 练习 1：最小 StateGraph（并行节点 + 汇合）

下面的代码从零画一张图：`START` 同时连到 `rag_node` 与 `web_node`，两个节点各自写入状态字段，再由 `final_node` 合并。注意节点函数必须接收状态、返回字典。

```python
"""
    第一个LangGraph案例

    对于LangGraph中的节点 要求
        1.必须传入状态对象
        2.必须返回字典 如果没有任何状态需要改变 返回空字典 {}

"""
from typing import TypedDict

from langgraph.constants import START, END
from langgraph.graph import StateGraph


# 第一步 定义状态
class MyState(TypedDict): # 继承此类 表示此类对象属于字典格式的数据 我们定义的属性 属于字典中的键
    query : str
    rag_result : str
    web_result : str
    final_answer : str


# 第二步 定义节点 节点即函数
def rag_node(state : MyState):
    # 获取到用户输入的问题
    query = state["query"]
    rag_result = f"根据用户的问题：{query}，结合RAG整理的答案"
    return {"rag_result" : rag_result} # 这里的返回值属于给字典中的rag_result 进行赋值


def web_node(state : MyState):
    query = state["query"]
    web_result =  f"根据用户的问题：{query}，结合WEB整理的答案"
    return {"web_result" : web_result}


def final_node(state : MyState):
    rag =  state["rag_result"]
    web =  state["web_result"]
    final_answer = rag + web
    return {"final_answer" : final_answer}


# 第三步 画图纸 指定当前图中使用的状态对象
graph_state = StateGraph(state_schema=MyState)


# 第四步 添加节点

graph_state.add_node(rag_node)
graph_state.add_node(web_node)
graph_state.add_node(final_node)

# 第五步 添加变 用于连接各个节点

graph_state.add_edge(START, "rag_node")
graph_state.add_edge(START, "web_node")
graph_state.add_edge("rag_node", "final_node")
graph_state.add_edge("web_node", "final_node")
graph_state.add_edge("final_node", END)


# 第六步 编译图
graph  = graph_state.compile()


# 第七步 运行
resp = graph.invoke({"query" : "什么是LangGraph？"})

print(resp)


# 第八步 画图
get_graph = graph.get_graph()

print(get_graph.draw_ascii())
```

**验收标准**

- `resp` 是 `dict`，且同时包含 `query`、`rag_result`、`web_result`、`final_answer` 四个键；
- `resp["final_answer"]` 由 `rag_result` 与 `web_result` 两段字符串拼成，两段都出现了用户问题原文；
- `draw_ascii()` 的输出里能看到 `START`、`rag_node`、`web_node`、`final_node`、`END`，且 `START` 分出两条边、两个节点都汇入 `final_node`；
- 只删掉 `graph_state.add_edge("web_node", "final_node")` 后重跑，`final_node` 读取 `state["web_result"]` 时抛 `KeyError`，说明汇合边缺一不可；
- `rag_node` 与 `web_node` 属于同一超步，打印顺序不固定，但两者都必须执行。

### 练习 2：默认覆盖 vs Reducer 累计

先跑默认行为：状态字段没有 reducer 时，节点返回值直接覆盖同名字段。再跑 `add_messages` 版本：消息列表会追加而不是覆盖。

```python
"""
    演示状态的默认效果：覆盖 对同一个状态重新赋值 将覆盖原来的值
"""
from typing import TypedDict, List

from langgraph.constants import START, END
from langgraph.graph import StateGraph


class DefaultState(TypedDict):
    foo : int
    bar : List[str]

def first_node(state : DefaultState):
    return {"foo" : 100}

def second_node(state : DefaultState):
    return {"bar" : ["hello"]}


state_graph = StateGraph(state_schema=DefaultState)

state_graph.add_node(first_node)
state_graph.add_node(second_node)

state_graph.add_edge(START,"first_node")
state_graph.add_edge("first_node" , "second_node")
state_graph.add_edge("second_node" , END)

graph_compile = state_graph.compile()

resp = graph_compile.invoke({"foo": 666, "bar": ["hi"]})

print(resp)
```

```python
"""
    状态的累计效果
"""
from typing import TypedDict, Annotated, List

from langchain_core.messages import BaseMessage, ToolMessage, SystemMessage, HumanMessage
from langgraph.constants import END, START
from langgraph.graph import StateGraph, add_messages


# def all_messages(old_list : list, new_list : list) -> list:
#     return old_list + new_list

class MyState(TypedDict):
    messages : Annotated[List[BaseMessage] , add_messages]


def tool_node(state :MyState ):
    return {"messages" : [ToolMessage(content="工具输出的内容……" , tool_call_id="xxx")]}

def llm_node(state : MyState ):
    return {"messages" : [SystemMessage(content="大模型输出的内容……")]}


state_graph = StateGraph(state_schema=MyState)

state_graph.add_node(tool_node)
state_graph.add_node(llm_node)

state_graph.add_edge(START , "tool_node")
state_graph.add_edge( "tool_node" , "llm_node")
state_graph.add_edge( "llm_node", END)

graph_compile = state_graph.compile()

resp = graph_compile.invoke({"messages": [HumanMessage(content="用户输入的数据")]})

print(resp)
```

**验收标准**

- 第一段输出 `{'foo': 100, 'bar': ['hello']}`：传入的 `666` 和 `['hi']` 都被节点返回值覆盖；
- `first_node` 只返回 `foo`，最终结果里 `bar` 仍然存在；`second_node` 只返回 `bar`，最终结果里 `foo=100` 仍然存在，说明状态按键合并，而不是整体替换；
- 第二段输出 `messages` 长度为 3，顺序为 `HumanMessage` → `ToolMessage` → `SystemMessage`，最初的用户消息没有被覆盖；
- 把第二段 `Annotated[List[BaseMessage], add_messages]` 改回 `List[BaseMessage]` 再运行，`messages` 只剩最后一条 `SystemMessage`，证明“累计”来自 reducer 而不是框架默认行为。

### 练习 3：条件边做二选一路由

路由函数只负责“选下一个节点”，返回值对应映射表的键。输入偶数走 `node_b`（乘 2），奇数走 `node_c`（减 1）。

```python
from typing import Literal
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END

# 定义状态
# 状态：value 用于路由判断，step 记录当前执行步骤
class GraphState(TypedDict):
    value: int
    step: str

# 定义节点函数
def node_a(state: GraphState) -> dict:
    """节点A"""
    print("执行节点A")
    return {"value": state["value"], "step": "A执行完毕"}

def node_b(state: GraphState) -> dict:
    """节点B"""
    print("执行节点B")
    return {"value": state["value"] * 2, "step": "B执行完毕"}

def node_c(state: GraphState) -> dict:
    """节点C"""
    print("执行节点C")
    return {"value": state["value"] - 1, "step": "C执行完毕"}

# 条件边的路由函数
# 条件边的路由函数：根据状态动态决定下一个执行哪个节点
def route_condition(state: GraphState) -> Literal["node_b", "node_c"]:
    """根据value值决定路由到哪个节点"""
    if state["value"] % 2 == 0:
        return "node_b_alias"  # 偶数路由到节点B
    else:
        return "node_c_alias"  # 奇数路由到节点C

def main():
    """演示条件边"""
    print("=== 条件边演示 ===")
    
    # 创建图
    builder = StateGraph(GraphState)
    
    # 添加节点
    builder.add_node("node_a", node_a)
    builder.add_node("node_b", node_b)
    builder.add_node("node_c", node_c)
    
    # 添加边
    builder.add_edge(START, "node_a")  # 入口点
    
    # 添加条件边
    # 添加条件边：源节点 node_a → 路由函数 route_condition → 路由映射表
    builder.add_conditional_edges(
        "node_a",  # 源节点
        route_condition,  # 路由函数
        {  # 路由映射
            "node_b_alias": "node_b",
            "node_c_alias": "node_c"
        }
    )
    
    # 从B和C到结束
    builder.add_edge("node_b", END)
    builder.add_edge("node_c", END)
    
    # 编译图
    graph = builder.compile()
    
    # 执行图 - 偶数情况
    print("输入值为偶数:")
    result = graph.invoke({"value": 2})
    print(f"执行结果: {result}")
    
    # 执行图 - 奇数情况
    print("\n输入值为奇数:")
    result = graph.invoke({"value": 1})
    print(f"执行结果: {result}\n")

if __name__ == "__main__":
    main()
```

**验收标准**

- 输入 `2` 时依次打印“执行节点A”“执行节点B”，结果为 `{'value': 4, 'step': 'B执行完毕'}`；
- 输入 `1` 时依次打印“执行节点A”“执行节点C”，结果为 `{'value': 0, 'step': 'C执行完毕'}`；
- 每次运行只会经过 B、C 中的一个，不会两者都执行；
- 路由函数返回的是 `node_b_alias` 这类映射键，而不是真实节点名；把映射表整体删掉再运行，图会因为找不到对应节点而报错，说明第三个参数不是可选的装饰。

### 练习 4：Checkpointer 断点续跑

用 SQLite 持久化状态：`node2` 抛异常导致图崩溃，但 `node1` 的产出已落盘；修好 `node2` 后用同一个 `thread_id` 从断点继续，而不是从头再跑。

操作步骤：先原样运行一次，观察崩溃；随后注释掉 `node2` 中的 `raise`，并把 `graph.invoke({}, config=config)` 改成 `graph.invoke(None, config=config)`，再运行一次。

```python
from langgraph.graph import StateGraph, START
from typing import TypedDict
import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver

# 持久化
conn = sqlite3.connect("./crash_demo.db", check_same_thread=False)
memory = SqliteSaver(conn)

class State(TypedDict):
    a: str
    b: str

def node1(state: State):
    print("\n>>>【执行 node1】")
    return {"a": "node1产出的数据"}

def node2(state: State):
    print("\n>>>【进入 node2】")
    # 模拟业务报错，普通Exception，不是interrupt
    raise RuntimeError("模拟网络调用失败，程序炸了")
    return {"b": "node2的数据"}  # 永远走不到

def node3(state: State):
    print("\n>>>【执行 node3】全部完成")
    return {}

# 构图
builder = StateGraph(State)
builder.add_node("node1", node1)
builder.add_node("node2", node2)
builder.add_node("node3", node3)

builder.add_edge(START, "node1")
builder.add_edge("node1", "node2")
builder.add_edge("node2", "node3")

graph = builder.compile(checkpointer=memory)
config = {"configurable": {"thread_id": "crash_001"}}

if __name__ == "__main__":
    print("=====①第一次运行，node2抛出异常崩溃=====")
    try:
        graph.invoke({}, config=config)
    except Exception as e:
        print(f"捕获异常: {e}")
```

**验收标准**

- 第一次运行依次打印 `>>>【执行 node1】`、`>>>【进入 node2】`，最后打印 `捕获异常: 模拟网络调用失败，程序炸了`，进程不退出；
- 运行目录下生成 `crash_demo.db` 文件，说明状态被 SQLite 持久化，而不是只存在内存；
- 注释掉 `node2` 里的 `raise` 后，用 `graph.invoke(None, config=config)`（同一个 `thread_id`）再次运行，只打印 node2、node3，不再打印 node1，即从断点续跑；
- 在第二次运行后执行 `print(graph.get_state(config).values)`，能看到 `{'a': 'node1产出的数据', 'b': 'node2的数据'}`；
- 把第二次调用的 `thread_id` 改成新值，node1 会重新执行，说明恢复依赖相同的 `thread_id`；
- 运行前需 `pip install langgraph.checkpoint.sqlite`（课件已给出该安装命令）。
