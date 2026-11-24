## 阶段导读

这一阶段只解决一个问题：让你从“能看懂 Python 代码”变成“能独立写出一个结构清楚、出错能查、别人能接着改的程序”。后面所有内容——FastAPI 接口、Agent 工具调用、RAG 文档处理、微调数据清洗——本质上都是 Python 代码，这一层不稳，后面每一章都会变成抄代码。

零基础学员最容易误解的一点是：把 Python 当成“语法课”来背。实际上企业里用到的 Python 只有四件事：**选对数据结构、把逻辑拆成函数和类、把错误挡住、把并发用对**。所以本阶段的重心不是背完所有关键字，而是这四件事反复练，练到看见需求就能想到“用什么容器装数据、拆成几个函数、异常在哪里兜底”。

学完之后你应该能做到：独立配置虚拟环境并用 IDE 调试；根据场景在 list / dict / set 之间做选择并说清复杂度；用面向对象设计出 3 个以上类的协作结构；用装饰器统一加日志与鉴权；判断一个任务是 IO 密集还是 CPU 密集并选对并发模型；用正则从日志里抽出结构化字段。这些能力会直接迁移到阶段 02 的接口开发和阶段 03 的工具函数编写。

最容易踩的坑有三个。第一，**只写脚本不分层**，几百行代码全堆在一个文件里，到了 FastAPI 阶段完全无法复用。第二，**不理解可变对象的引用语义**，函数传参、默认参数、深浅拷贝三处连环出错，而且报错现象很隐蔽。第三，**以为加了 `async` 就变快**，结果在协程里写了 `time.sleep` 或大量计算，整个服务照样卡死。

<div class="callout plain"><span class="tag">大白话</span><p>学 Python 就像学开手动挡：语法是知道哪个是离合、哪个是刹车；真正上路靠的是“什么路况挂什么挡”。这一阶段我们花大量时间在“什么场景用什么写法”，而不是背说明书。</p></div>

## 教学路径

<div class="callout path"><span class="tag">教学路径</span><ol class="path-steps"><li><b>第 1 步（2 天）：</b>装好 Python、配置虚拟环境与 IDE 调试，写出第一个带输入输出的脚本，产出：一个能断点调试的工程目录。</li><li><b>第 2 步（3 天）：</b>基础语法与流程控制，包括分支、循环、格式化输出，产出：成绩统计与猜数字两个小脚本。</li><li><b>第 3 步（5 天）：</b>容器四件套与推导式，练到能按场景选 list / dict / set，产出：词频统计与通讯录。</li><li><b>第 4 步（4 天）：</b>函数、递归、匿名函数、文件 IO 与 JSON / CSV 读写，产出：可持久化的记账本。</li><li><b>第 5 步（6 天）：</b>面向对象全体系：封装、继承、多态、多继承 MRO、魔术方法、常用设计模式，产出：一个小型类库。</li><li><b>第 6 步（3 天）：</b>异常机制、自定义异常、模块与包、日志、pip 依赖管理，产出：可被别人 import 的包。</li><li><b>第 7 步（5 天）：</b>深浅拷贝、property、装饰器、元类、垃圾回收，产出：带缓存与重试的装饰器。</li><li><b>第 8 步（6 天）：</b>多线程、多进程、协程、Socket 与 Starlette 最小 Web 服务，产出：并发下载器。</li><li><b>第 9 步（3 天）：</b>正则表达式与日志解析实战，产出：日志字段提取脚本。</li><li><b>第 10 步（6 天）：</b>综合项目：愤怒的小鸟与客户信息管理系统，产出：可演示的两个项目并通过考试一。</li></ol></div>

## 学习前准备

### 前置知识

只需要会开关机、会装软件、能看懂简单的英文报错。不需要任何编程基础。如果你连“变量”是什么都不知道，也可以直接开始，但要把第 1 步的 2 天延长到 4 天，把每个例子手敲三遍。

### 环境与软件清单

| 软件 | 建议版本 | 用途 | 必装 |
|-|-|-|-|
| Python | 3.11 或 3.12 | 解释器，3.11 之后报错信息更友好 | 是 |
| VS Code | 最新版 | 编辑器，轻量，装 Python 扩展即可调试 | 是 |
| PyCharm 社区版 | 2024 以后 | 备选 IDE，代码提示更完整 | 否 |
| Git | 最新版 | 版本管理，阶段 04 会系统讲 | 否 |
| SQLite 命令行 | 随 Python 自带 | 提前熟悉数据库文件 | 否 |

<div class="callout tip"><span class="tag">老师建议</span><p>不要用系统自带的 Python 直接开发，每个项目建一个虚拟环境。<code>python -m venv .venv</code> 之后激活，再 <code>pip install</code>，这样项目之间不会互相污染依赖版本。这是后面所有阶段的默认动作。</p></div>

### 三道自测题

学之前先做，答不上来没关系，学完再回来做一遍。

1. 用一行 Python 代码生成 1 到 10 的平方列表，并说明这行代码在内存里产生了什么。
2. 写出一个函数，接收任意数量的数字并返回平均值；如果传入空参数应该怎么处理？
3. 判断下面两段代码的输出是否一致，并解释原因：`a = [1,2]; b = a; b.append(3); print(a)` 与 `a = [1,2]; b = a[:]; b.append(3); print(a)`。

```bash
# 检查 Python 是否安装成功，以及版本是否满足要求
python --version
# 创建并激活虚拟环境（Windows PowerShell）
python -m venv .venv
.\.venv\Scripts\Activate.ps1
# 升级包管理工具，避免安装依赖时报版本过旧
python -m pip install --upgrade pip
```

## 模块精讲

### 模块1：环境配置与基础语法

**解决什么问题**

把“写代码”这件事的物理条件准备好：解释器、虚拟环境、编辑器调试。同时建立最基本的程序执行观念——代码从上到下执行、分支决定走哪条路、循环决定重复几次。没有这一步，后面任何一个例子你都跑不起来。

**核心概念**

- 解释器：Python 是解释执行的，`.py` 文件逐行翻译成字节码再运行。
- 虚拟环境：一个独立目录，装着自己的第三方包，项目之间隔离。
- 变量与类型：`int`、`float`、`str`、`bool`、`None`，Python 是动态类型，但类型错误照样会在运行时爆炸。
- 流程控制：`if / elif / else`、`for`、`while`、`break / continue`。
- 格式化输出：优先用 f-string，别再用 `%` 拼接。

**关键代码**

```python
# demo_basic.py
# 读取学员成绩，输出等级与统计结果

scores = []                       # 用列表收集所有成绩
while True:                       # 循环读取，直到用户输入 done
    raw = input("请输入成绩（输入 done 结束）：").strip()
    if raw.lower() == "done":     # 统一转小写，兼容 DONE / Done
        break
    if not raw.isdigit():         # 先判断合法性，避免 int() 抛异常
        print("请输入非负整数，已跳过")
        continue
    score = int(raw)
    if not 0 <= score <= 100:     # 边界校验比事后处理更省事
        print("成绩必须在 0-100 之间")
        continue
    scores.append(score)

# for-else：循环正常跑完才执行 else，被 break 打断则不执行
for s in scores:
    if s < 60:
        level = "不及格"
    elif s < 75:
        level = "及格"
    elif s < 90:
        level = "良好"
    else:
        level = "优秀"
    print(f"{s:>3} 分 -> {level}")   # :>3 表示右对齐占 3 个字符

if scores:
    avg = sum(scores) / len(scores)
    print(f"共 {len(scores)} 人，平均分 {avg:.1f}")   # :.1f 保留一位小数
else:
    print("没有输入任何有效成绩")
```

```bash
# 创建项目标准目录，后面所有练习都按这个结构放
mkdir python-core && cd python-core
python -m venv .venv
# macOS / Linux 用下面这行激活
source .venv/bin/activate
# 生成依赖清单，方便别人复现你的环境
pip freeze > requirements.txt
```

```text
// .vscode/launch.json：按 F5 直接断点调试当前文件
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: 当前文件",
      "type": "debugpy",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      "justMyCode": true
    }
  ]
}
```

<div class="callout tip"><span class="tag">老师建议</span><p>IDE 高阶配置只做三件事：把解释器指向项目里的 <code>.venv</code>、打开保存时格式化、给入口文件配一个断点调试配置。做完这三件，后面所有报错都能单步复现，比 <code>print</code> 快十倍。</p></div>

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `while True` + `break` | 不确定循环次数时使用 | 由用户输入决定何时结束，比预先算次数更稳 |
| `raw.isdigit()` | 输入合法性预判 | 直接 `int()` 遇到字母会抛 `ValueError`，程序中断 |
| `0 <= score <= 100` | 链式比较 | Python 特有语法，等价于两个条件与 |
| `f"{s:>3}"` | 格式化对齐 | 输出表格时列才对得齐 |
| `sum(scores) / len(scores)` | 求平均 | 必须先判断非空，否则除零异常 |
| `pip freeze` | 导出依赖 | 保证换台机器能装出同样的环境 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>用系统 Python 直接 <code>pip install</code>，装了几十个包之后项目互相冲突，只能重装系统级环境。</li><li>Windows 上激活虚拟环境失败，多半是 PowerShell 执行策略限制，用 <code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code> 放开一次即可。</li><li>把 <code>input()</code> 的返回值当数字用，忘了它永远是字符串。</li><li>循环里做 <code>scores = []</code> 的初始化，导致每轮都把之前的数据清空。</li></ul></div>

### 模块2：字符串、列表、字典、集合

**解决什么问题**

程序的核心是“把数据装起来再处理”。选错容器，代码会又慢又难读：该用字典做索引时用了列表，查找就从 O(1) 退化成 O(n)；该用集合去重时用列表，要写一堆判断。这个模块练的是“看到数据长什么样，就知道该用哪个容器”。

**核心概念**

| 容器 | 是否有序 | 是否可变 | 查找复杂度 | 典型场景 |
|-|-|-|-|-|
| `str` 字符串 | 有序 | 不可变 | O(n) | 文本、ID、路径 |
| `list` 列表 | 有序 | 可变 | O(n) | 有序集合、队列、结果集 |
| `tuple` 元组 | 有序 | 不可变 | O(n) | 固定结构、函数多返回值、字典键 |
| `dict` 字典 | 有序（3.7+ 插入序） | 可变 | O(1) | 按 key 索引、计数、缓存 |
| `set` 集合 | 无序 | 可变 | O(1) | 去重、交并差、成员判断 |

字符串常用操作：切片 `s[start:end:step]`、`split / join / strip / replace / startswith`。列表常用操作：`append / extend / insert / pop / remove / sort / sorted`。字典常用操作：`get / setdefault / items / keys / values / update`。集合常用操作：`add / discard / | & - ^`。

**关键代码**

```python
# demo_container.py
# 统计一段文本的词频，并演示四种容器的分工

text = "AI agent calls tools. AI agent remembers context. Agent loops."
words = text.lower().replace(".", "").split()   # 统一小写并去掉句号

# 1. 字典做计数：key 是单词，value 是出现次数
counter = {}
for w in words:
    counter[w] = counter.get(w, 0) + 1   # get 的默认值 0 省掉 if 判断

# 2. 集合去重：不关心顺序，只关心有哪些不同的词
unique_words = set(words)
print(f"总词数 {len(words)}，不同词 {len(unique_words)}")

# 3. 列表 + sorted 做排序：按次数倒序，次数相同按字母序
top = sorted(counter.items(), key=lambda kv: (-kv[1], kv[0]))
print(top[:3])

# 4. 推导式：一行完成过滤与转换，比 for 循环更清晰
long_words = [w for w in unique_words if len(w) > 3]
word_length = {w: len(w) for w in unique_words}   # 字典推导式

# 5. 切片：取前 3 个、反转、步长
print(words[:3], words[::-1][:3])

# 6. 集合运算：找出两段文本共有的词
other = set("agent tools memory".split())
print(counter.keys() & other)      # 交集：两边都有的词
print(unique_words - other)        # 差集：只在第一段出现的词
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `counter.get(w, 0) + 1` | 安全计数 | 第一次出现的词没有 key，`counter[w]` 会 `KeyError` |
| `set(words)` | 去重 | 底层哈希表，成员判断 O(1) |
| `sorted(..., key=lambda kv: (-kv[1], kv[0]))` | 多字段排序 | 取负号实现倒序，第二字段做稳定次序 |
| `[w for w in ... if ...]` | 列表推导式 | 比 append 循环快且可读，但不要嵌套超过两层 |
| `words[::-1]` | 反转 | 切片生成新列表，不改原列表 |
| `keys() & other` | 集合交集 | 字典的 keys 支持集合运算 |

<div class="callout tip"><span class="tag">老师建议</span><p>判断用哪个容器只问三句话：需不需要按位置取？需要按名字取？需要去重？按位置用 list / tuple，按名字用 dict，去重用 set。三个都不需要，说明你其实还没想清楚数据长什么样。</p></div>

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>在遍历 list 的同时 <code>remove</code> 元素，导致跳过元素。正确做法是遍历副本 <code>for x in lst[:]</code> 或倒序遍历。</li><li>把可变对象（list / dict）当字典的 key 或集合元素，直接报 <code>TypeError: unhashable type</code>。</li><li><code>dict.get(k)</code> 与 <code>dict[k]</code> 混用，前者缺失返回 None，后者直接抛异常。</li><li>以为 <code>sorted()</code> 会改原列表，其实它返回新列表；原地排序要用 <code>list.sort()</code>。</li><li>嵌套推导式写成三层，自己第二天都看不懂，应拆成普通循环。</li></ul></div>

### 模块3：函数、递归、匿名函数与文件 IO

**解决什么问题**

当一段逻辑要重复使用，就必须抽成函数；当一个结构要反复读写，就必须落成文件。函数决定了代码能不能复用，文件 IO 决定了程序能不能“记住昨天的事”。真实项目里，工具的入参校验、数据清洗、配置读取，全是函数 + 文件。

**核心概念**

- 参数形态：位置参数、默认参数、关键字参数、`*args`、`**kwargs`，以及“可变默认参数”这个经典陷阱。
- 作用域：`LEGB`（Local → Enclosing → Global → Builtin），`global` 与 `nonlocal` 的使用边界。
- 递归：必须有终止条件，且问题规模要能收敛；Python 默认递归深度约 1000。
- 匿名函数：`lambda` 只适合一行表达式，复杂逻辑仍应写 `def`。
- 文件 IO：`open(path, mode, encoding)`，`with` 自动关闭，文本与二进制模式区别。
- JSON / CSV：结构化数据的两种最常见落盘格式。

**关键代码**

```python
# demo_function_io.py
import json
from pathlib import Path

def load_records(path: str) -> list[dict]:
    """读取 JSON 记录；文件不存在时返回空列表而不是崩溃"""
    p = Path(path)
    if not p.exists():                 # 先判断存在，避免 FileNotFoundError
        return []
    with p.open("r", encoding="utf-8") as f:   # with 结束自动关闭文件
        return json.load(f)

def save_records(path: str, records: list[dict]) -> None:
    """写回 JSON；ensure_ascii=False 保证中文可读"""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

def total_amount(records: list[dict], *tags: str) -> float:
    """统计金额；*tags 表示可选标签过滤"""
    picked = records
    if tags:
        picked = [r for r in records if r["tag"] in tags]
    return round(sum(r["amount"] for r in picked), 2)

def fib(n: int, memo: dict | None = None) -> int:
    """带记忆化的递归，避免指数级重复计算"""
    if memo is None:                   # 不能写 memo={}，那是可变默认参数陷阱
        memo = {}
    if n < 2:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]

# 匿名函数：按金额倒序，适合只在一处使用的小逻辑
records = [{"name": "打车", "amount": 38.5, "tag": "交通"},
           {"name": "午饭", "amount": 26, "tag": "餐饮"}]
records.sort(key=lambda r: r["amount"], reverse=True)

save_records("records.json", records)
print(total_amount(records, "餐饮"))
print(fib(30))
```

```python
# CSV 读写：适合表格型数据，Excel 可直接打开
import csv

with open("expenses.csv", "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "amount", "tag"])
    writer.writeheader()               # 先写表头
    writer.writerows(records)          # 再写每行字典

with open("expenses.csv", newline="", encoding="utf-8-sig") as f:
    rows = list(csv.DictReader(f))     # 读回来是字典列表，值全是字符串
print(rows[0]["amount"], type(rows[0]["amount"]))   # 注意需要自行转 float
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `Path(path).exists()` | 路径存在性判断 | 比 `try/except` 更直观，且可跨平台 |
| `with open(...)` | 上下文管理 | 即使中途异常也能关闭文件句柄 |
| `ensure_ascii=False` | 中文不转义 | 否则文件里全是 `\u4e2d\u6587` |
| `memo=None` 再赋值 | 规避可变默认参数 | 默认值只在函数定义时创建一次，会跨调用共享 |
| `*tags` | 可变位置参数 | 调用方可以传 0 个或多个标签 |
| `encoding="utf-8-sig"` | 带 BOM 的 UTF-8 | Excel 打开 CSV 不乱码 |
| `DictReader` | 按表头读成字典 | 比按列下标取值更抗字段顺序变化 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li><code>def f(items=[])</code>：默认列表被所有调用共享，第二次调用会看到第一次的数据。</li><li>递归没有终止条件或规模不收敛，报 <code>RecursionError</code>。</li><li>读文件忘记 <code>encoding</code>，在 Windows 上默认 GBK，读 UTF-8 文件直接乱码或报错。</li><li>用 <code>json.loads</code> 去读文件对象，应该用 <code>json.load</code>；反过来也一样。</li><li>CSV 读出来的数字是字符串，直接参与计算会变成字符串拼接。</li></ul></div>

### 模块4：面向对象全体系

**解决什么问题**

当程序从“几十行的脚本”长成“有状态、有协作的系统”，函数就不够用了。你需要把“数据 + 操作数据的方法”绑在一起，需要让不同对象用同一套接口，需要控制哪些属性可以被外部修改。AI 项目里的 `Tool`、`Memory`、`Agent`、`LLMClient`，本质都是类。

**核心概念**

- 封装：用 `_protected` / `__private` 约定可见性，用 `@property` 控制读写。
- 继承：子类复用父类，`super()` 调用父类实现。
- 多态：同一接口不同实现，调用方只依赖抽象，不依赖具体类。
- 多继承与 MRO：`C3` 线性化算法，用 `Cls.__mro__` 查看真实查找顺序。
- 魔术方法：`__init__`、`__str__`、`__repr__`、`__len__`、`__eq__`、`__call__`、`__enter__/__exit__`。
- 设计模式：单例（配置）、工厂（按类型造对象）、策略（可替换算法）、观察者（事件回调）。

**关键代码**

```python
# demo_oop.py
from abc import ABC, abstractmethod

class Tool(ABC):
    """所有工具的抽象基类：规定子类必须实现 run"""
    def __init__(self, name: str):
        self.name = name
        self._calls = 0              # 单下划线：约定为内部属性

    @abstractmethod
    def run(self, query: str) -> str:
        ...

    def __call__(self, query: str) -> str:
        """让对象可以像函数一样调用，Agent 调度时很常用"""
        self._calls += 1
        return self.run(query)

    def __str__(self) -> str:
        return f"<Tool {self.name} calls={self._calls}>"

class SearchTool(Tool):
    def run(self, query: str) -> str:
        return f"搜索「{query}」的结果"

class CalcTool(Tool):
    def run(self, query: str) -> str:
        return f"计算结果：{eval(query)}"   # 演示用，生产环境禁止 eval

class ToolRegistry:
    """单例：全局只保留一个注册表"""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._tools = {}
        return cls._instance

    def register(self, tool: Tool) -> None:
        self._tools[tool.name] = tool

    def get(self, name: str) -> Tool:
        if name not in self._tools:
            raise KeyError(f"未注册的工具：{name}")
        return self._tools[name]

class Calculator(CalcTool, SearchTool):
    """多继承演示：MRO 决定 run 优先取 CalcTool 的实现"""
    pass

reg = ToolRegistry()
reg.register(SearchTool("search"))
reg.register(CalcTool("calc"))
print(reg.get("calc")("1+2"))
print(Calculator("combo").run("1+1"))
print([c.__name__ for c in Calculator.__mro__])
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `ABC` + `@abstractmethod` | 定义接口契约 | 子类漏实现时在实例化阶段就报错，而不是运行到一半 |
| `__call__` | 对象可调用 | Agent 里统一用 `tool(query)` 调度，无需关心是不是函数 |
| `__new__` 单例 | 控制实例创建 | 注册表必须全局唯一，避免各模块各建一份 |
| `super().__new__(cls)` | 走父类创建流程 | 不调用会导致实例未正确初始化 |
| `super()` | 调用父类 | 多继承下按 MRO 顺序调用，不是简单“父类” |
| `Calculator.__mro__` | 查看方法查找顺序 | 多继承出问题时第一个要打印的东西 |

<div class="callout plain"><span class="tag">大白话</span><p>继承像“儿子随爸”，能直接用爸的本事；多态像“都会开车”，不管开的是卡车还是轿车，你只说“开”，它自己知道怎么开；MRO 像“家里有事先找谁”，排了一个固定顺序，不会来回踢皮球。</p></div>

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>以为双下划线是“真私有”，其实只是改名成 <code>_类名__属性</code>，仍可访问。</li><li>多继承时子类直接调 <code>父类名.method(self)</code>，绕过 MRO，导致父类被重复初始化。</li><li>忘了在子类 <code>__init__</code> 里调 <code>super().__init__()</code>，父类属性不存在。</li><li>把“组合”硬写成“继承”，比如 <code>Agent(LLMClient)</code>，语义错误。能用组合就别用继承。</li><li><code>__eq__</code> 重写了却没重写 <code>__hash__</code>，对象放进 set 直接报不可哈希。</li></ul></div>

### 模块5：异常机制、模块打包与工程化

**解决什么问题**

真实程序一定会遇到脏数据、网络超时、文件被删。异常机制决定“出错时是程序崩掉，还是给用户一句人话并继续服务”。模块与包决定“代码能不能拆开、能不能被别人引用”。这两件事合起来，就是“能不能交付”。

**核心概念**

- 异常继承体系：`BaseException` → `Exception` → 具体异常；业务异常应继承 `Exception`。
- `try / except / else / finally`：`else` 是没异常时执行，`finally` 一定执行。
- 异常链：`raise ... from e` 保留原始错误，排查时非常关键。
- 自定义异常：用不同异常类型区分“参数错”“资源不存在”“权限不足”。
- 模块与包：一个 `.py` 是模块，带 `__init__.py` 的目录是包；`if __name__ == "__main__"` 区分脚本与导入。
- 依赖与打包：`requirements.txt`、`pyproject.toml`，`pip install -e .` 本地可编辑安装。
- 日志：用 `logging` 代替 `print`，分级、可输出到文件、可被采集。

**关键代码**

```python
# demo_exception.py
import logging

logging.basicConfig(
    level=logging.INFO,                                  # 只输出 INFO 及以上
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

class AppError(Exception):
    """业务异常基类：所有可预期错误都从它派生"""
    code = "APP_ERROR"

class ValidationError(AppError):
    code = "VALIDATION_ERROR"

class NotFoundError(AppError):
    code = "NOT_FOUND"

def parse_age(raw: str) -> int:
    try:
        age = int(raw)
    except (TypeError, ValueError) as e:
        # raise ... from e 保留原始异常，日志里能看到完整链路
        raise ValidationError(f"年龄必须是整数，收到 {raw!r}") from e
    if not 0 <= age <= 150:
        raise ValidationError(f"年龄超出范围：{age}")
    return age

def find_user(users: dict, uid: str) -> dict:
    if uid not in users:
        raise NotFoundError(f"用户不存在：{uid}")
    return users[uid]

def main() -> None:
    users = {"u1": {"name": "张三"}}
    for raw in ["18", "abc", "200"]:
        try:
            age = parse_age(raw)
        except AppError as e:                 # 只捕获自己认识的异常
            logging.warning("跳过非法输入 %s：%s（code=%s）", raw, e, e.code)
        else:
            logging.info("解析成功：%s", age)
        finally:
            logging.debug("这一轮结束")        # 清理逻辑放这里

    try:
        find_user(users, "u2")
    except NotFoundError as e:
        logging.error("查询失败：%s", e)

if __name__ == "__main__":                    # 被 import 时不执行 main
    main()
```

```text
project/
├── pyproject.toml          # 项目元信息与依赖声明
├── requirements.txt        # 锁定版本的依赖清单
├── src/
│   └── myapp/
│       ├── __init__.py     # 包的入口，可导出公共 API
│       ├── services.py     # 业务逻辑
│       └── utils.py        # 工具函数
└── tests/
    └── test_services.py    # 单元测试
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `except (TypeError, ValueError)` | 合并捕获同类错误 | 转换失败本质是同一种问题，处理方式一致 |
| `raise ... from e` | 保留异常链 | 否则日志只剩“参数错误”，看不到真正原因 |
| `else` 分支 | 无异常时的正常逻辑 | 让 `try` 块只放可能出错的代码，范围更小 |
| `finally` | 必执行清理 | 关闭连接、释放锁、删除临时文件 |
| `if __name__ == "__main__"` | 区分入口 | 被 import 时不会误触发主流程 |
| `logging` 占位符 `%s` | 延迟格式化 | 日志级别不满足时不浪费字符串拼接 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li><code>except Exception: pass</code> 吞掉所有错误，线上出问题完全查不到，这是最严重的坏习惯。</li><li>把 <code>try</code> 包住几十行代码，出错后根本不知道是哪一行。</li><li>捕获了异常却只 <code>print</code>，不记录堆栈，排查时没有上下文。</li><li>模块循环导入：A 导入 B，B 又导入 A。解决方式是抽公共模块或把导入放进函数内。</li><li>用 <code>print</code> 代替日志，线上无法分级过滤，也无法落盘。</li></ul></div>

### 模块6：深浅拷贝、property、装饰器、元类、垃圾回收

**解决什么问题**

这一组是 Python 的“内功”，也是面试与排障的高频区。你会在这些场景撞上它们：把配置字典传给函数后被意外修改（浅拷贝）、给对象属性赋值时想加校验（property）、给一批接口统一加耗时统计与重试（装饰器）、读框架源码看到 `class X(metaclass=...)`（元类）、服务跑久了内存一直涨（垃圾回收与循环引用）。

**核心概念**

- 浅拷贝：只复制最外层容器，内层对象仍是同一引用（`copy.copy`、`list[:]`、`dict.copy`）。
- 深拷贝：递归复制所有层级（`copy.deepcopy`），代价高，遇到大对象要谨慎。
- `property`：把方法伪装成属性，实现赋值校验、惰性计算、只读属性。
- 装饰器：本质是“接收函数、返回新函数”的高阶函数；多个装饰器“由内向外装饰，由外向内执行”。
- 元类：类的类，负责创建类；`type` 是最基础的元类，框架用它做自动注册。
- 垃圾回收：引用计数为主（立即回收），分代回收为辅（处理循环引用），`gc` 模块可手动干预。

**关键代码**

```python
# demo_advanced.py
import copy
import time
from functools import wraps

# ---------- 1. 深浅拷贝 ----------
config = {"name": "demo", "tags": ["a", "b"], "db": {"host": "127.0.0.1"}}
shallow = copy.copy(config)
deep = copy.deepcopy(config)
shallow["tags"].append("shallow")      # 污染原对象，因为内层是同一个 list
deep["db"]["host"] = "10.0.0.1"        # 不影响原对象，因为递归复制
print(config["tags"], config["db"]["host"])

# ---------- 2. property ----------
class ModelConfig:
    def __init__(self, temperature: float = 0.7):
        self._temperature = temperature

    @property
    def temperature(self) -> float:
        return self._temperature

    @temperature.setter
    def temperature(self, value: float) -> None:
        if not 0 <= value <= 2:
            raise ValueError("temperature 必须在 0 到 2 之间")
        self._temperature = value

cfg = ModelConfig()
cfg.temperature = 1.2                  # 走 setter，自动校验
print(cfg.temperature)

# ---------- 3. 装饰器：计时 + 重试 ----------
def timer(func):
    @wraps(func)                       # 保留原函数名与 docstring
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            cost = time.perf_counter() - start
            print(f"{func.__name__} 耗时 {cost:.4f}s")
    return wrapper

def retry(times: int = 3, delay: float = 0.2):
    """带参数的装饰器：外层再包一层"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last = None
            for i in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last = e
                    time.sleep(delay)
            raise last
        return wrapper
    return decorator

@timer
@retry(times=3)
def unstable_call() -> str:
    return "ok"

# ---------- 4. 元类：自动注册子类 ----------
class PluginMeta(type):
    registry = {}
    def __new__(mcls, name, bases, ns):
        cls = super().__new__(mcls, name, bases, ns)
        if name != "Plugin":
            mcls.registry[name] = cls       # 类一创建就登记，不用手动注册
        return cls

class Plugin(metaclass=PluginMeta):
    pass

class PdfPlugin(Plugin):
    pass

print(PluginMeta.registry)                  # {'PdfPlugin': <class ...>}
```

```python
# 垃圾回收观察：循环引用不会被引用计数回收，需要 gc
import gc

class Node:
    def __init__(self, name):
        self.name = name
        self.peer = None

a, b = Node("a"), Node("b")
a.peer, b.peer = b, a          # 互相引用，引用计数永远不为 0
del a, b                       # 变量删了，但对象仍在循环里
print(gc.collect())            # 手动触发分代回收，返回回收的对象数
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `copy.copy` vs `deepcopy` | 一层复制 vs 递归复制 | 嵌套结构必须用深拷贝才真正隔离 |
| `@property` + `@x.setter` | 属性校验 | 外部仍用 `obj.x = v` 的写法，内部自动拦截非法值 |
| `@wraps(func)` | 保留元信息 | 否则函数名全变成 `wrapper`，日志和调试都失真 |
| `retry(times=3)` | 带参装饰器 | 外层函数接收参数，内层才是真正的装饰器 |
| `metaclass=PluginMeta` | 创建类时介入 | 插件系统、ORM 模型注册都靠这个机制 |
| `gc.collect()` | 处理循环引用 | 引用计数管不到环状结构，需要分代回收 |

<div class="callout tip"><span class="tag">老师建议</span><p>装饰器不要一开始就追求“万能”。先写死参数，能跑通再加参数化。带参装饰器的三层嵌套是新手最容易写错的地方：最外层收参数，中间层收函数，最内层收调用参数。写的时候三层分别打印一下，确认执行顺序。</p></div>

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>用 <code>copy.copy</code> 处理嵌套字典，改内层污染原数据，而且现象很隐蔽。</li><li>装饰器忘了 <code>@wraps</code>，导致被装饰函数的签名、文档、名字全部丢失。</li><li>在 <code>property</code> 的 setter 里给同名属性赋值，写成 <code>self.temperature = value</code>，无限递归。</li><li>以为 <code>del obj</code> 就释放内存，其实只是删掉一个引用。</li><li>在类里用元类做太多隐式魔法，接手的人完全看不懂，框架代码才值得这么写。</li></ul></div>

### 模块7：并发与网络编程

**解决什么问题**

AI 应用几乎全是“等”：等模型返回、等数据库、等第三方接口。如果串行等待，10 个 1 秒的请求就要 10 秒；并发之后只要 1 秒多。同时，服务要能被别的程序调用，就必须理解 Socket 与 HTTP 的基本过程，这也是后面 FastAPI 能“接住请求”的底层原因。

**核心概念**

- GIL：同一时刻只有一个线程执行 Python 字节码，所以多线程适合 IO 密集，不适合 CPU 密集。
- 多线程：`threading.Thread`，适合网络请求、文件读写；共享数据需要 `Lock`。
- 多进程：`multiprocessing.Process`，每个进程独立解释器，绕开 GIL，适合计算密集。
- 协程：`async def` + `await`，单线程内切换，适合海量 IO 并发；必须由事件循环驱动。
- 线程池 / 进程池：`concurrent.futures`，比手动管理线程更省心。
- Socket：`TCP` 三次握手后收发字节流，服务端 `bind → listen → accept`。
- Starlette：轻量 ASGI 框架，FastAPI 的底层就是它。

**关键代码**

```python
# demo_concurrency.py
import asyncio
import time
from concurrent.futures import ThreadPoolExecutor

def io_task(name: str, seconds: float) -> str:
    """模拟一次阻塞 IO：真实场景是 requests 或数据库查询"""
    time.sleep(seconds)
    return f"{name} 完成"

def run_serial() -> None:
    start = time.perf_counter()
    for i in range(3):
        io_task(f"任务{i}", 0.5)
    print(f"串行耗时 {time.perf_counter() - start:.2f}s")     # 约 1.5s

def run_thread_pool() -> None:
    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=3) as pool:          # 3 个线程同时等
        list(pool.map(lambda i: io_task(f"任务{i}", 0.5), range(3)))
    print(f"线程池耗时 {time.perf_counter() - start:.2f}s")   # 约 0.5s

async def async_io(name: str, seconds: float) -> str:
    # 必须用 asyncio.sleep，不能用 time.sleep，否则整个事件循环被阻塞
    await asyncio.sleep(seconds)
    return f"{name} 完成"

async def run_async() -> None:
    start = time.perf_counter()
    results = await asyncio.gather(                          # 并发发起，一起等
        async_io("A", 0.5), async_io("B", 0.5), async_io("C", 0.5)
    )
    print(results, f"协程耗时 {time.perf_counter() - start:.2f}s")

if __name__ == "__main__":
    run_serial()
    run_thread_pool()
    asyncio.run(run_async())
```

```python
# 多进程：绕开 GIL，真正并行做 CPU 计算
from multiprocessing import Pool

def square(x: int) -> int:
    return x * x

if __name__ == "__main__":            # Windows 上创建进程必须放在 main 保护内
    with Pool(processes=4) as pool:
        print(pool.map(square, range(10)))
```

```python
# demo_starlette.py
# 运行：pip install starlette uvicorn，然后 uvicorn demo_starlette:app --reload
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route

async def health(request):
    return JSONResponse({"status": "ok"})

async def echo(request):
    name = request.path_params["name"]        # 路径参数
    q = request.query_params.get("q", "")     # 查询参数
    return JSONResponse({"name": name, "q": q})

app = Starlette(routes=[
    Route("/health", health),
    Route("/echo/{name}", echo),
])
```

```python
# TCP 服务端最小示例：理解“服务”是怎么接住连接的
import socket

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # 端口复用，避免重启报占用
server.bind(("127.0.0.1", 9000))
server.listen(5)
print("监听 9000")
while True:
    conn, addr = server.accept()        # 阻塞等待客户端连接
    data = conn.recv(1024)              # 收字节流
    conn.sendall(b"HTTP/1.1 200 OK\r\n\r\nhello")
    conn.close()
```

| 模型 | 适用任务 | 不适用 | 关键限制 |
|-|-|-|-|
| 多线程 | 网络请求、文件读写 | 大量计算 | GIL |
| 多进程 | 图像处理、数据计算 | 频繁进程间通信 | 内存开销大，序列化成本 |
| 协程 | 高并发 API 调用 | CPU 密集 | 一处阻塞会拖垮全事件循环 |

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `time.sleep` vs `asyncio.sleep` | 阻塞 vs 让出控制权 | 协程里用错前者，并发直接失效 |
| `asyncio.gather` | 并发等待多个协程 | 等价于“同时发起，全部完成后返回” |
| `ThreadPoolExecutor` | 线程池管理 | 避免手动创建/回收线程，控制并发上限 |
| `SO_REUSEADDR` | 端口复用 | 服务重启时 TIME_WAIT 状态不会报端口被占 |
| `accept` / `recv` | 阻塞式收发 | 理解 HTTP 请求本质是 TCP 字节流 |
| `Route("/echo/{name}")` | 路径参数 | 后面 FastAPI 的路由就是这套机制的上层封装 |

<div class="callout tip"><span class="tag">老师建议</span><p>不要在协程里调用同步库（<code>requests</code>、<code>time.sleep</code>、同步数据库驱动），这是新手最常见的性能事故。要么换成异步库（<code>httpx</code>、<code>asyncpg</code>），要么用 <code>asyncio.to_thread</code> 把阻塞调用丢到线程池。</p></div>

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>多线程里对共享计数器做 <code>+= 1</code>，结果少了，因为不是原子操作，需要加锁。</li><li>多进程里修改全局变量，父进程看不到，进程之间内存不共享。</li><li>协程函数定义成 <code>async def</code> 但调用时忘了 <code>await</code>，得到一个协程对象，什么也没发生。</li><li>在 <code>async</code> 函数里用 <code>requests.get</code>，整个服务被一个请求卡住。</li><li>Socket 服务端没有循环 <code>accept</code>，只能接一个连接就退出。</li></ul></div>

### 模块8：正则表达式

**解决什么问题**

日志、订单号、手机号、模型输出里的 JSON 片段，都需要从一堆杂乱文本里精确捞出字段。正则就是“文本的筛子”。AI 项目里，结构化输出失败后的兜底提取、日志脱敏、文档分块的标题识别，都靠它。

**核心概念**

- 元字符：`.` `\d` `\w` `\s` `^` `$` `*` `+` `?` `{m,n}` `[]` `|` `()`。
- 贪婪与非贪婪：`.*` 尽可能多，`.*?` 尽可能少。
- 分组：`()` 捕获，`(?:...)` 不捕获，`(?P<name>...)` 命名分组。
- 常用函数：`re.match`（从头匹配）、`re.search`（任意位置找第一个）、`re.findall`（找全部）、`re.sub`（替换）、`re.split`（切分）。
- 编译复用：`re.compile` 避免重复解析模式，循环里尤其重要。
- 标志位：`re.I` 忽略大小写、`re.M` 多行、`re.S` 让 `.` 匹配换行。

**关键代码**

```python
# demo_regex.py
import re

log = """2026-11-20 10:01:02 INFO user=u1001 action=login cost=32ms
2026-11-20 10:02:11 ERROR user=u1002 action=pay cost=1500ms err=timeout
2026-11-20 10:03:45 INFO user=u1003 action=logout cost=8ms"""

# 命名分组：把每一段起个名字，后面按名字取，比下标可读
pattern = re.compile(
    r"^(?P<date>\d{4}-\d{2}-\d{2})\s+"
    r"(?P<time>\d{2}:\d{2}:\d{2})\s+"
    r"(?P<level>INFO|WARN|ERROR)\s+"
    r"user=(?P<user>\w+)\s+"
    r"action=(?P<action>\w+)\s+"
    r"cost=(?P<cost>\d+)ms",
    re.M,                                # 多行模式，^ 才能匹配每一行开头
)

rows = []
for m in pattern.finditer(log):          # finditer 返回 Match 对象，可取名
    d = m.groupdict()
    d["cost"] = int(d["cost"])
    rows.append(d)

errors = [r for r in rows if r["level"] == "ERROR"]
print(errors)

# 非贪婪：只取第一个引号内的内容
html = '<div class="a">x</div><div class="b">y</div>'
print(re.findall(r'class="(.*?)"', html))       # ['a', 'b']

# 替换与脱敏：保留前 3 后 4 位
phone = "联系 13812345678 或 13987654321"
masked = re.sub(r"(\d{3})\d{4}(\d{4})", r"\1****\2", phone)
print(masked)

# 切分：按多个分隔符拆开
print(re.split(r"[,;\s]+", "a,b; c  d"))

# 常见校验：邮箱与手机号（简化规则，生产需更严格）
print(bool(re.fullmatch(r"[\w.+-]+@[\w-]+\.[\w.]+", "test@example.com")))
print(bool(re.fullmatch(r"1[3-9]\d{9}", "13812345678")))
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `re.M` | 多行模式 | 不加时 `^` 只匹配整个字符串开头 |
| `(?P<name>...)` | 命名分组 | `groupdict()` 直接得到字典，字段自解释 |
| `finditer` | 迭代匹配 | 比 `findall` 多了位置信息与分组能力 |
| `.*?` | 非贪婪 | 避免一口气吞到最后一个引号 |
| `r"\1****\2"` | 反向引用 | 替换时保留捕获组内容 |
| `re.fullmatch` | 整串匹配 | 校验手机号必须整串符合，`match` 只要求开头 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>用 <code>re.match</code> 做整串校验，它只从头匹配，尾部多余字符不会报错。</li><li>忘记加 <code>r"..."</code> 原始字符串，<code>\d</code> 被当成转义字符。</li><li>贪婪匹配导致跨行吞掉大量内容，需要 <code>.*?</code> 或 <code>re.S</code> 配合。</li><li>在循环里反复 <code>re.compile</code>，白白消耗性能。</li><li>正则写得太复杂，无法维护。能拆成两步就先拆，能用字符串方法（<code>startswith</code>、<code>split</code>）就别上正则。</li></ul></div>

### 模块9：综合项目落地思路

**解决什么问题**

语法学完不等于能交付。两个项目分别训练两种能力：**愤怒的小鸟**训练“对象建模 + 实时循环 + 碰撞检测”，**客户信息管理系统**训练“分层 + 持久化 + 异常处理”。它们覆盖了本阶段全部知识点，也是考试一的载体。

**核心概念**

- 游戏循环：`事件处理 → 更新状态 → 绘制 → 刷新`，每帧执行一次。
- 碰撞检测：矩形碰撞用 AABB（轴对齐包围盒），判断两个矩形是否有重叠区域。
- 数据分层：`model`（数据）→ `repository`（存取）→ `service`（业务）→ `ui`（交互）。
- 持久化策略：程序启动加载、每次变更后保存，避免异常退出丢数据。

**关键代码**

```python
# 简化实现：AABB 碰撞检测，真实项目用 pygame.Rect.colliderect
def hit(bird: dict, pig: dict) -> bool:
    """判断两个矩形是否重叠；坐标为左上角 x, y 加宽高"""
    return (
        bird["x"] < pig["x"] + pig["w"] and
        bird["x"] + bird["w"] > pig["x"] and
        bird["y"] < pig["y"] + pig["h"] and
        bird["y"] + bird["h"] > pig["y"]
    )

# 游戏主循环骨架（简化实现）
while running:
    for event in events:                 # 1. 处理输入
        if event.type == "QUIT":
            running = False
    bird["x"] += vx                      # 2. 更新状态
    bird["y"] += vy
    vy += gravity
    for pig in pigs:                     # 3. 碰撞判定
        if hit(bird, pig):
            pigs.remove(pig)
            score += 10
    draw(scene)                          # 4. 绘制
    clock.tick(60)                       # 5. 控制帧率
```

```python
# 客户信息管理系统：仓储层只负责存取，不写业务规则
import json
from pathlib import Path

class CustomerRepo:
    def __init__(self, path: str = "customers.json"):
        self.path = Path(path)
        self.data: dict[str, dict] = self._load()

    def _load(self) -> dict:
        if not self.path.exists():
            return {}
        with self.path.open(encoding="utf-8") as f:
            return {c["id"]: c for c in json.load(f)}

    def save(self) -> None:
        with self.path.open("w", encoding="utf-8") as f:
            json.dump(list(self.data.values()), f, ensure_ascii=False, indent=2)

    def add(self, customer: dict) -> None:
        if customer["id"] in self.data:
            raise ValueError("客户编号已存在")
        self.data[customer["id"]] = customer
        self.save()
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| 四个不等式同时成立 | AABB 碰撞 | 任一方向分离就不算碰撞，逻辑最简 |
| `clock.tick(60)` | 固定帧率 | 不同电脑速度一致，物理表现才稳定 |
| 游戏循环五段式 | 结构清晰 | 输入、更新、判定、绘制、限速各司其职 |
| 仓储层 `_load / save` | 封装持久化 | 上层不关心是 JSON 还是数据库 |
| `{c["id"]: c}` | 建索引 | 按 id 查找 O(1)，避免每次遍历列表 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>把游戏逻辑写进事件循环里，越写越乱，最后无法加新关卡。</li><li>每帧都读写文件，卡顿且伤磁盘。应只在数据变更后保存。</li><li>删除列表元素时用正序遍历，导致漏判，应倒序或先收集再删。</li><li>业务规则（如编号不能重复）写进 UI 层，换个界面就得重写。</li><li>异常退出时数据没落盘，重启后全丢。关键操作后立即持久化。</li></ul></div>

## 综合实战

把本阶段所有知识点串成一个能真正跑起来的命令行程序：客户信息管理系统。它包含数据类、校验、仓储持久化、业务规则、正则搜索、异常处理和日志。新建 `crm.py`，把下面代码完整粘贴即可运行。

**第 1 步：定义数据结构与校验规则**

用 `dataclass` 描述客户，把校验写在对象自己身上，避免每个入口重复判断。

```python
import json
import logging
import re
from dataclasses import asdict, dataclass, field
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

@dataclass
class Customer:
    cid: str
    name: str
    phone: str
    tags: list[str] = field(default_factory=list)   # 可变默认值必须用工厂函数

    def validate(self) -> None:
        if not re.fullmatch(r"C\d{4}", self.cid):
            raise ValueError("编号格式应为 C0001 这种形式")
        if not self.name.strip():
            raise ValueError("姓名不能为空")
        if not re.fullmatch(r"1[3-9]\d{9}", self.phone):
            raise ValueError("手机号格式不正确")
```

**第 2 步：写仓储层，只负责读写文件**

```python
class CustomerRepo:
    def __init__(self, path: str = "customers.json"):
        self.path = Path(path)
        self.items: dict[str, Customer] = self.load()

    def load(self) -> dict[str, Customer]:
        if not self.path.exists():
            return {}
        try:
            with self.path.open(encoding="utf-8") as f:
                return {d["cid"]: Customer(**d) for d in json.load(f)}
        except (json.JSONDecodeError, TypeError) as e:
            logging.error("数据文件损坏，已按空库启动：%s", e)
            return {}

    def flush(self) -> None:
        with self.path.open("w", encoding="utf-8") as f:
            json.dump([asdict(c) for c in self.items.values()], f,
                      ensure_ascii=False, indent=2)
```

**第 3 步：写业务层，集中管理规则**

```python
class CustomerService:
    def __init__(self, repo: CustomerRepo):
        self.repo = repo

    def add(self, cid: str, name: str, phone: str, tags: str = "") -> None:
        if cid in self.repo.items:
            raise ValueError(f"编号 {cid} 已存在")
        c = Customer(cid, name, phone,
                     [t.strip() for t in tags.split(",") if t.strip()])
        c.validate()
        self.repo.items[cid] = c
        self.repo.flush()

    def delete(self, cid: str) -> None:
        if cid not in self.repo.items:
            raise KeyError(f"编号 {cid} 不存在")
        del self.repo.items[cid]
        self.repo.flush()

    def search(self, keyword: str) -> list[Customer]:
        # 用正则做忽略大小写的模糊匹配，姓名、手机号、标签都参与
        pattern = re.compile(re.escape(keyword), re.I)
        return [c for c in self.repo.items.values()
                if pattern.search(c.name) or pattern.search(c.phone)
                or any(pattern.search(t) for t in c.tags)]
```

**第 4 步：写命令行交互层**

```python
def main() -> None:
    service = CustomerService(CustomerRepo())
    menu = """
1) 新增客户  2) 删除客户  3) 查询客户  4) 列出全部  0) 退出
请选择："""
    while True:
        choice = input(menu).strip()
        try:
            if choice == "1":
                cid = input("编号：")
                name = input("姓名：")
                phone = input("手机号：")
                tags = input("标签（逗号分隔）：")
                service.add(cid, name, phone, tags)
                print("新增成功")
            elif choice == "2":
                service.delete(input("编号："))
                print("删除成功")
            elif choice == "3":
                kw = input("关键词：")
                for c in service.search(kw):
                    print(c)
            elif choice == "4":
                for c in service.repo.items.values():
                    print(c)
            elif choice == "0":
                break
            else:
                print("无效选项")
        except (ValueError, KeyError) as e:
            logging.warning("操作失败：%s", e)   # 业务异常不退出程序
```

**第 5 步：运行与验证**

```bash
python crm.py
# 依次输入：1 -> C0001 -> 张三 -> 13812345678 -> vip,新客
# 再输入 3 搜索“张”，应能查到刚新增的记录
# 关闭后重新运行，输入 4，验证数据已持久化
```

### 逐段代码解析

| 代码段 | 核心技术点 | 为什么放在这一层 |
|-|-|-|
| `@dataclass` + `field(default_factory=list)` | 数据类、可变默认值 | 数据与校验内聚，避免默认列表跨实例共享 |
| `validate()` 中的 `re.fullmatch` | 正则整串校验 | 编号与手机号必须完整匹配，尾部不能有多余字符 |
| `CustomerRepo.load()` | 文件 IO、异常处理 | 数据损坏时降级为空库，而不是让程序起不来 |
| `asdict(c)` + `json.dump` | 序列化、中文可读 | 对象要落盘必须先转成字典 |
| `CustomerService.add` | 业务规则集中 | 编号唯一、字段合法这两条规则只能有一个地方管 |
| `re.escape(keyword)` | 正则转义 | 用户输入可能含 `.` `*`，不转义会当成元字符 |
| `pattern.search` + `re.I` | 模糊搜索、忽略大小写 | 姓名、手机号、标签统一搜索，体验更接近真实系统 |
| `main()` 的 `try/except` | 异常隔离 | 单次操作失败不能导致整个程序退出 |
| `repo.flush()` 在写操作后调用 | 持久化时机 | 只在数据变更后落盘，避免每次查询都写文件 |

<div class="callout tip"><span class="tag">老师建议</span><p>这个程序看着简单，但它就是后面所有后端项目的缩小版：<code>Customer</code> 对应 ORM 模型，<code>CustomerRepo</code> 对应 DAO 层，<code>CustomerService</code> 对应 Service 层，<code>main</code> 对应 Controller。阶段 02 换成数据库和 HTTP 接口时，你会发现分层几乎不用改。</p></div>

## 疑难点分级

| 知识点 | 难度 | 典型卡点 | 破解方式 |
|-|-|-|-|
| 虚拟环境 | 低 | 装了包却 import 失败 | 确认 IDE 选中的解释器是 `.venv` 里的那个 |
| 可变默认参数 | 中 | 第二次调用拿到上次的数据 | 默认写 `None`，函数内再创建空容器 |
| list 遍历时删除 | 中 | 元素被跳过 | 遍历副本 `lst[:]` 或倒序遍历 |
| 浅拷贝与深拷贝 | 中 | 改副本污染原数据 | 画引用图，嵌套结构一律 `deepcopy` |
| 作用域 LEGB | 中 | 函数内赋值后外面变量没变 | 明确是否要 `global` / `nonlocal`，优先返回值 |
| 装饰器执行顺序 | 高 | 叠加两个装饰器就晕 | 记住“由内向外装饰，由外向内执行”，打日志验证 |
| 带参装饰器 | 高 | 三层嵌套写错返回值 | 分别打印三层，确认最内层返回函数 |
| 多继承 MRO | 高 | 不知道调用了哪个父类方法 | 打印 `Cls.__mro__`，统一用 `super()` |
| property 递归 | 高 | setter 里无限递归 | 内部属性加下划线，如 `self._x` |
| `__eq__` 与 `__hash__` | 中 | 对象放进 set 报不可哈希 | 两者要么都重写，要么都不重写 |
| GIL 与并发选型 | 高 | 多线程做计算反而更慢 | 计算用多进程，IO 用线程或协程 |
| 协程阻塞 | 高 | 一个请求卡住整个服务 | 协程内禁止 `time.sleep` 与同步 HTTP 库 |
| 异常吞掉 | 中 | 线上出错无日志 | 禁止 `except: pass`，至少记录堆栈 |
| 正则贪婪匹配 | 中 | 一次匹配吞掉整段文本 | 用 `.*?` 或缩小字符集 |
| 文件编码 | 低 | 中文乱码 | 读写都显式指定 `encoding="utf-8"` |
| 循环导入 | 中 | 一启动就 ImportError | 抽公共模块，或把导入移到函数内部 |
| 内存持续增长 | 高 | 服务跑久了 OOM | 排查全局缓存、循环引用、未关闭的连接 |

## 阶段项目

### 项目一：愤怒的小鸟

**背景**

用 pygame 复刻经典弹射玩法。它不是为了做游戏，而是训练“对象建模 + 实时循环 + 物理更新 + 碰撞检测”这套能力，后面做可视化 Agent 前端、实时数据大屏时是同一套思路。

**功能清单**

- 弹弓发射小鸟，鼠标拖拽决定角度与力度。
- 小鸟受重力影响做抛物线运动，落地后停止。
- 场上至少 3 只小猪，被小鸟命中即消失并加分。
- 至少 2 个关卡，通关后进入下一关。
- 显示当前分数、剩余小鸟数、当前关卡。
- 支持重新开始。

**技术选型**

`Python 3.11` + `pygame 2.x`；对象建模用类，物理用简单的速度/加速度积分，碰撞用 `pygame.Rect.colliderect`，资源用本地图片，配置用 JSON。

**验收标准**

- 程序可稳定运行 5 分钟不崩溃，帧率不低于 50。
- 小鸟轨迹符合直觉，能正常命中与未命中。
- 关卡切换、分数累计、重新开始都正确。
- 代码至少拆成 `Bird`、`Pig`、`Level`、`Game` 四个类，单个文件不超过 300 行。

**评分点**

| 维度 | 分值 | 说明 |
|-|-|-|
| 核心玩法 | 30 | 发射、飞行、碰撞、得分完整 |
| 代码结构 | 25 | 类的职责清晰，无明显重复代码 |
| 关卡与状态 | 20 | 多关卡、重开、状态显示正确 |
| 健壮性 | 15 | 窗口关闭、资源缺失不崩溃 |
| 代码规范 | 10 | 命名清晰、关键逻辑有注释 |

### 项目二：客户信息管理系统

**背景**

模拟企业最基础的 CRM 需求：客户信息要能增删改查、要能搜索、要能持久化、输入错了不能崩。它是阶段 02 数据库与接口项目的雏形。

**功能清单**

- 新增客户：编号、姓名、手机号、标签，字段必须校验。
- 删除客户：按编号删除，不存在时给出提示。
- 修改客户：支持修改姓名、手机号、标签。
- 查询客户：按编号精确查、按关键词模糊查。
- 列出全部客户，按编号排序。
- 数据保存到 JSON 文件，重启后仍在。
- 所有异常都有友好提示，程序不退出。

**技术选型**

`Python 3.11` 标准库；`dataclass` 建模，`json` 持久化，`re` 做校验与搜索，`logging` 记录操作日志，`pathlib` 处理路径。

**验收标准**

- 五类操作全部可用，且都有成功/失败反馈。
- 非法编号、非法手机号、重复编号都被拦截。
- 删除不存在的编号不会抛未捕获异常。
- 重启程序后数据完整。
- 至少 3 层结构（模型 / 仓储 / 业务），CLI 只负责输入输出。

**评分点**

| 维度 | 分值 | 说明 |
|-|-|-|
| 功能完整度 | 30 | 增删改查搜索全部实现 |
| 分层设计 | 25 | 业务规则不写在 CLI 里 |
| 校验与异常 | 20 | 非法输入有明确提示 |
| 持久化 | 15 | 读写正确、损坏文件可降级 |
| 代码质量 | 10 | 命名、注释、函数长度合理 |

## 常见面试题

### 问题1：Python 中 list 和 dict 的查找效率为什么不同？

**答案要点**

- list 是连续数组，按值查找要逐个比较，复杂度 O(n)；按下标访问是 O(1)。
- dict 基于哈希表，通过 key 的哈希值定位桶，平均 O(1)。
- dict 的代价是额外内存与哈希冲突，key 必须可哈希（不可变）。
- 需要按位置访问用 list，需要按名字快速查找用 dict。

### 问题2：深拷贝和浅拷贝的区别？哪些场景必须用深拷贝？

**答案要点**

- 浅拷贝只复制最外层容器，内层对象仍是同一引用；深拷贝递归复制所有层级。
- 修改浅拷贝的内层可变对象会影响原对象，深拷贝不会。
- 嵌套配置、缓存快照、函数间传递复杂结构时必须深拷贝。
- 深拷贝有性能成本，大对象可用“不可变数据 + 重建”替代。

### 问题3：Python 的参数传递是值传递还是引用传递？

**答案要点**

- 准确说法是“对象引用传递”（call by object reference）。
- 传入不可变对象（int、str、tuple）时，函数内重新赋值不影响外部。
- 传入可变对象（list、dict）时，函数内原地修改会影响外部。
- 面试时用“可变 / 不可变 + 是否原地修改”来解释，比背结论更稳。

### 问题4：装饰器的本质是什么？多个装饰器的执行顺序？

**答案要点**

- 本质是高阶函数：接收函数作为参数，返回一个新函数。
- `@deco` 等价于 `func = deco(func)`。
- 多个装饰器由内向外装饰，调用时由外向内执行。
- 必须用 `@wraps` 保留原函数的 `__name__`、`__doc__`。

### 问题5：什么是 GIL？它带来什么影响？

**答案要点**

- GIL 是 CPython 的全局解释器锁，保证同一时刻只有一个线程执行字节码。
- 多线程无法利用多核做 CPU 密集计算，甚至因切换开销更慢。
- IO 操作会释放 GIL，所以多线程适合网络、文件等 IO 密集任务。
- CPU 密集用多进程，海量 IO 用协程。

### 问题6：多线程、多进程、协程怎么选？

**答案要点**

- 多线程：IO 密集、需要共享内存、任务数量不大。
- 多进程：CPU 密集、需要绕开 GIL、任务可独立拆分。
- 协程：超高并发 IO、单线程事件循环、追求低内存开销。
- 判断标准：先看任务是等 IO 还是算 CPU，再看并发量级。

### 问题7：`async def` 里调用 `time.sleep` 会怎样？

**答案要点**

- 会阻塞整个事件循环，所有协程都无法推进，表现为服务“假死”。
- 应使用 `await asyncio.sleep()`。
- 同步阻塞库用 `await asyncio.to_thread(func, ...)` 丢到线程池。
- 这是异步服务最常见的性能事故，排查时看是否有同步调用。

### 问题8：`__new__` 和 `__init__` 的区别？

**答案要点**

- `__new__` 负责创建实例并返回，是类方法；`__init__` 负责初始化已创建的实例。
- 单例、不可变类型子类化通常重写 `__new__`。
- `__init__` 返回值必须是 `None`，返回其他值会报错。

### 问题9：Python 的垃圾回收机制是怎样的？

**答案要点**

- 以引用计数为主，引用归零立即回收。
- 引用计数处理不了循环引用，因此引入分代回收（三代）。
- 可用 `gc.collect()` 手动触发，`gc.disable()` 关闭自动回收（慎用）。
- 内存泄漏常见原因：全局缓存不清理、循环引用、未关闭的连接。

### 问题10：`is` 和 `==` 的区别？

**答案要点**

- `is` 比较对象身份（内存地址），`==` 比较值。
- 小整数与短字符串有缓存，可能出现 `is` 为 True 的巧合，不能依赖。
- 与 `None` 比较用 `is None`，这是唯一推荐的 `is` 用法。

### 问题11：异常处理中 `else` 和 `finally` 分别什么时候执行？

**答案要点**

- `else` 在 `try` 块没有异常时执行。
- `finally` 无论是否异常都会执行，用于释放资源。
- `finally` 里有 `return` 会覆盖 `try` 里的返回值，应避免。

### 问题12：如何判断一个 Python 项目的结构是否合理？

**答案要点**

- 入口、配置、业务、数据访问、工具函数分离，不堆在一个文件里。
- 依赖声明完整（`requirements.txt` 或 `pyproject.toml`），能一键复现环境。
- 有日志、有异常边界、有关键路径的测试。
- 模块之间单向依赖，不出现循环导入。

## 动手练习

<div class="callout task"><span class="tag">动手练习</span><ol><li>写一个成绩统计脚本：输入若干成绩，输出最高、最低、平均、及格率，非法输入要跳过并提示。</li><li>用字典统计一段英文文本的词频，输出出现次数最多的 5 个词，并用集合统计不同词数量。</li><li>把词频结果写入 JSON 与 CSV 两个文件，再分别读回来验证内容一致。</li><li>写一个函数，接收任意数量的数字返回平均值，空参数时抛出明确的自定义异常。</li><li>用递归实现目录遍历，统计某个文件夹下所有 <code>.py</code> 文件的总行数。</li><li>写一个带参数的装饰器 <code>retry(times, delay)</code>，让随机失败的函数最多重试 3 次。</li><li>用 <code>property</code> 实现一个带范围校验的 <code>Temperature</code> 类，非法赋值抛异常。</li><li>设计 <code>Shape</code> 抽象类与 <code>Circle</code>、<code>Rect</code> 子类，用多态统一计算面积。</li><li>用单例模式实现一个配置管理器，保证全程序只加载一次配置文件。</li><li>分别用多线程、线程池、协程下载 10 个网页（可用 <code>time.sleep</code> 模拟），对比耗时。</li><li>用 Socket 写一个最简单的回声服务端与客户端，客户端发什么服务端回什么。</li><li>从一段 Nginx 访问日志中用正则提取 IP、时间、状态码、耗时，输出为字典列表。</li><li>把综合实战的客户系统扩展成支持“修改”和“按标签筛选”，并为每次写操作记录日志。</li><li>给客户系统补一套单元测试，覆盖新增成功、编号重复、手机号非法、删除不存在四种情况。</li><li>把客户系统的存储从 JSON 换成 SQLite（用标准库 <code>sqlite3</code>），保持分层不变。</li></ol></div>

## 阶段小结

- 环境先行：每个项目一个虚拟环境，IDE 解释器必须指向它。
- 容器选型只看三件事：按位置、按名字、要不要去重，分别对应 list、dict、set。
- 函数解决复用，模块解决拆分，异常解决“出错不崩”，日志解决“出事能查”。
- 面向对象的核心是职责划分，不是语法堆砌；能组合就不要继承。
- 深浅拷贝看内层是否共享；装饰器的本质是函数替换；元类负责创建类；GC 以引用计数为主、分代回收兜底。
- 并发选型先判断任务类型：IO 用线程或协程，CPU 用多进程；协程里禁止同步阻塞调用。
- 正则优先用命名分组与 `finditer`，能用字符串方法就别硬上正则。
- 两个项目证明你具备“建模 + 分层 + 持久化 + 异常处理”的完整闭环能力。

下一阶段把这套代码搬到真实工程环境：Linux 上部署、MySQL 里存数据、Docker 中运行、FastAPI 对外提供接口、Vue3 做页面。你在这一阶段写的 `CustomerRepo` 与 `CustomerService`，会原样升级成 DAO 层与 Service 层。






---

## 素材缺口与补充练习（2026-11-24 核对）

> 依据：`2026-11-24\syllabus-audit\outputs\大纲-素材-站点三方差异核对报告.md`

### 已可跟练的部分

Python 基础的 16 章教材在 `lessons/python/01-16.md`，配套代码在 `阶段1python基础\day01-12\dayNN\dayNN-代码`。每篇教材末尾都已补“动手练习与验收标准”，练习中的代码均取自对应日期的真实示例文件。

### 待补：本机无对应素材

| 大纲子项 | 本机核查结果 |
|---|---|
| 元类（metaclass） | `尚硅谷AI全能开发技术之Python1.0.docx` 与 `day01-12` 视频清单均未涉及 |
| Socket 编程 | 同上，课件正文与视频名 0 命中 |
| Starlette | 同上；`FastAPI_SQLAlchemy学习笔记.md` 只讲 ASGI 概念，无 Starlette 专门内容 |
| 设计模式 | 同上，无独立章节、无视频 |
| 考试一 | 本机只有 `260820晨考`、`261015晨考` 的 day01-20 晨考 PDF，没有阶段考试卷 |

以上内容暂不补写，避免无来源扩写；拿到对应课件后再补。可替代的阶段性验收：独立完成 `lessons/python/16.md` 末尾的“补全删除客户”练习，并保证添加、查询、删除三条流程都能跑通。
