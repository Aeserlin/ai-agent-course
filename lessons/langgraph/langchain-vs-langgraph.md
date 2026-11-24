> **LangChain提供AI应用的各类组件；LangGraph是复杂流程的编排运行时，二者不是替代，是搭配使用。**

## 1.分工对比

| 项目     | LangChain（含LCEL Chain）                                    | LangGraph                                                    |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 核心定位 | **组件工具箱**：大模型、提示词、向量库、检索器、工具调用等现成组件 | **流程调度引擎**：专门负责控制整个流程怎么走                 |
| 流程模式 | **线性流水线A→B→C**，单向向前，不支持循环                    | **图模型：节点+边+全局State**，支持循环、分支、并行汇合、跳转回之前节点 |
| 状态记忆 | 数据靠步骤之间互相传递，没有统一全局内存                     | **显式全局State（状态）**，所有节点共享同一份记忆快照        |
| 擅长场景 | 固定顺序任务，简单RAG，一步接一步的流水线                    | Agent智能体、循环反思、并行任务、人工介入、断点续跑          |
| 局限     | 很难做循环、动态分支、暂停中断                               | 不提供大模型/检索组件，需要复用LangChain组件或者自己实现     |

## 2.通俗比喻

- **LangChain**：一堆零件，电机、齿轮、传感器。LCEL Chain就是把零件排成一条流水线，只能从头走到尾。
- **LangGraph**：电控主板。**零件依旧用LangChain的，但是流程流转、循环、分叉、等待、暂停，交给主板来调度**。

> 不是换掉旧流水线，而是给流水线增加“大脑”，让流程可以动态改变走向。

## 3.我们为什么接下来要学习LangGraph

我们已经学会LangChain/LCEL，可以写**流程完全固定**的程序：输入→检索→大模型→输出。

但是真实Agent智能体经常遇到这些需求，**Chain原生很难优雅实现**：

1. 需要循环：大模型调用工具拿到结果，判断信息不足，**重新再调用一次工具**（ReAct智能体核心逻辑）
2. 需要分支：根据中间结果，动态选择走A路径还是B路径
3. 需要并行：多个任务同时执行，全部完成之后再汇总（前面RAG+联网搜索并行案例）
4. 需要统一记忆：多节点之间大量中间数据，不想手动到处传参
5. 需要暂停：流程跑一半，交给人工审核，修改后继续执行

> ✅**LangGraph就是用来解决以上问题。它保留我们学过全部LangChain组件，只升级流程编排能力，这就是我们要学习它的背景。**

## 4.重要提醒

简单固定流程，依旧优先使用LCEL Chain，不要盲目上LangGraph；**只有流程需要动态变化、循环、并行时，才选用LangGraph**。

---

## 动手练习与验收标准

> 素材出处：`举个栗子/举个栗子/day29/demo1/lg_1.py`、`举个栗子/举个栗子/day27/day27-代码/day27/demo2/lc_1.py`、`举个栗子/举个栗子/day27/day27-代码/day27/demo2/lc_2.py`、`举个栗子/举个栗子/LangGraph-课件/尚硅谷大模型技术之LangGraph.md`（条件边）、`lessons/langchain/langchain.md`（RunnableBranch）

### 练习 1：同一任务，用 LCEL Chain 写一遍

任务：输入一个问题 `query`，同时产出“RAG 答案”和“WEB 答案”，再把两段答案拼成最终答案。全流程不调用大模型，只观察编排方式。

说明：本机没有现成的“RAG+WEB 合并”LCEL 文件，下面按 `day27/demo2/lc_1.py` 的 `RunnableParallel`、`demo2/lc_2.py` 的 `RunnableLambda` 写法，把任务对齐到 `day29/demo1/lg_1.py` 的同一任务改写，未引入本机之外的新 API。

```python
from langchain_core.runnables import RunnableParallel, RunnableLambda


def rag_branch(query: str) -> str:
    return f"根据用户的问题：{query}，结合RAG整理的答案"


def web_branch(query: str) -> str:
    return f"根据用户的问题：{query}，结合WEB整理的答案"


def merge(parts: dict) -> str:
    return parts["rag_result"] + parts["web_result"]


chain = (
    RunnableParallel(
        rag_result=RunnableLambda(rag_branch),
        web_result=RunnableLambda(web_branch),
    )
    | RunnableLambda(merge)
)

print(type(chain))
print(chain.invoke("什么是LangChain？"))
```

**验收标准**

- `print(type(chain))` 输出 `RunnableSequence`：`RunnableParallel | RunnableLambda` 组合后仍是一个可 `invoke` 的 Runnable；
- `chain.invoke("什么是LangChain？")` 返回 `str`，且同时包含“结合RAG整理的答案”和“结合WEB整理的答案”；
- 两条分支的中间结果只存在于 `RunnableParallel` 输出的字典里，离开 `merge` 后无法再按名字取回；
- 整条链是单向的：没有循环、没有条件跳转、没有可暂停的全局状态。

### 练习 2：同一任务，用 StateGraph 写一遍

任务、输出字符串与练习 1 完全一致，只把编排从“管道”换成“图 + 全局 State”。

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
resp = graph.invoke({"query" : "什么是LangChain？"})

print(resp)


# 第八步 画图
get_graph = graph.get_graph()

print(get_graph.draw_ascii())
```

**验收标准**

- `resp` 是 `dict`，含 `query`、`rag_result`、`web_result`、`final_answer` 四个键；
- `resp["final_answer"]` 与练习 1 中 `chain.invoke("什么是LangChain？")` 的返回值逐字符相同（同一 query、同一拼接规则）；
- `draw_ascii()` 输出里 `START` 同时指向 `rag_node` 和 `web_node`，两者再汇入 `final_node`，能直观看到“并行 + 汇合”；
- 与 LCEL 版的关键差异：中间结果 `rag_result`、`web_result` 落在全局状态里，可在运行结束后单独取出检查，也能被后续任意节点读取；
- 交换 `add_edge("rag_node", "final_node")` 与 `add_edge("web_node", "final_node")` 的书写顺序，结果不变，说明图结构不依赖代码行顺序。

### 练习 3：分支场景的两种写法

同一个“偶数走 B、奇数走 C”的路由，LCEL 用 `RunnableBranch`，LangGraph 用条件边。

LCEL 版（分支写法取自 `langchain.md` 的 `RunnableBranch` 示例，条件换成本练习的奇偶判断）：

```python
from langchain_core.runnables import RunnableBranch, RunnableLambda

branch = RunnableBranch(
    (lambda v: v % 2 == 0, RunnableLambda(lambda v: {"value": v * 2, "step": "B执行完毕"})),
    RunnableLambda(lambda v: {"value": v - 1, "step": "C执行完毕"}),
)

print(branch.invoke(2))
print(branch.invoke(1))
```

LangGraph 版（课件条件边原文）：

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

- LCEL 版：`branch.invoke(2)` 输出 `{'value': 4, 'step': 'B执行完毕'}`，`branch.invoke(1)` 输出 `{'value': 0, 'step': 'C执行完毕'}`；
- LangGraph 版：输入 `2` 打印“执行节点A”“执行节点B”、结果为 `{'value': 4, 'step': 'B执行完毕'}`；输入 `1` 打印“执行节点A”“执行节点C”、结果为 `{'value': 0, 'step': 'C执行完毕'}`；
- 两个版本的业务结果一致，但 LCEL 只返回分支函数的结果，没有“A 执行过”的记录；LangGraph 返回完整状态，`step` 能证明经过了哪个节点；
- LCEL 分支按顺序匹配，第一个为 `True` 的条件生效，最后的 `RunnableLambda` 是默认分支；LangGraph 路由函数返回的是映射表的键（或 `END`），删掉映射表就必须直接返回真实节点名；
- 结论可复述：流程固定选 LCEL，需要保留中间状态、分支日志、后续可扩展循环/暂停时选 LangGraph。