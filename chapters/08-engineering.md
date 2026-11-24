## 本章导读

Demo 和产品的差距，几乎都在这五件事上：流式体验、错误处理、成本控制、效果评估、可观测性。本地跑得通，不代表上线能扛住。

先看一组真实差距。非流式接口要等整段生成结束才返回，首字延迟通常在 3 到 8 秒，用户盯着转圈就会离开；改成流式后，首字延迟可以压到 0.5 到 1.2 秒，体感完全不同。一次 20 轮的 Agent 任务，成本大约 0.1 到 0.5 元，日活 1000 个会话就是每天 100 到 500 元，不做预算控制，月底账单会非常难看。

再看稳定性。上游限流时无脑重试，会把 429 放大成重试风暴；没有超时，一个卡住的请求会占满连接池；没有降级，单点故障会直接变成全站不可用。这些问题都不是模型能力问题，而是工程细节没做。

学完本章，你应该能做到五件事：第一，用 SSE 打通“模型 Token → 浏览器像素”的完整链路；第二，写出带指数退避、抖动与熔断的调用封装；第三，给每个会话做 Token 预算与成本核算；第四，建立 30 到 50 条的离线评估集并设置回归门禁；第五，用日志、指标、追踪三件套定位一次失败任务。

先记住五条最常见的误区：

1. 把流式当成前端打字机效果。真正的难点在后端：代理缓冲、心跳、断线、上游取消。
2. 失败就重试，重试越多越稳。实际上只该重试限流、超时和 5xx，且必须退避加抖动。
3. 只看模型单价，不看 Token 结构。输出 Token 通常是输入单价的 3 到 4 倍，长回答才是成本大头。
4. 评估靠感觉。改完提示词觉得“好像好点了”，没有基线就无法判断是否回归。
5. 日志越多越好。没有 trace_id 的日志只是噪声，关键是把一次任务串起来。

<div class="callout plain"><span class="tag">大白话</span>
<p>Demo 像<b>家里做饭</b>：只有一个客人，咸了淡了都能凑合。产品像<b>开餐厅</b>：要出餐快、不能糊锅、成本可控、还要能查监控。</p>
<p>本章练的就是这四样本事，跟模型聪明不聪明关系不大。</p>
</div>

## 教学路径

<div class="callout path"><span class="tag">教学路径</span>
<ol class="path-steps">
<li><b>第 1 步（30 分钟）：</b>讲清 SSE 协议与流式链路，产出《流式时序图》。</li>
<li><b>第 2 步（60 分钟）：</b>实现 FastAPI 流式接口与前端 EventSource，产出可对话页面。</li>
<li><b>第 3 步（50 分钟）：</b>加入超时、指数退避、抖动与降级，产出 <code>resilient.py</code>。</li>
<li><b>第 4 步（40 分钟）：</b>实现熔断器三态与探测恢复，产出状态流转记录。</li>
<li><b>第 5 步（50 分钟）：</b>做 Token 预算预留与成本记账，产出 <code>cost.py</code>。</li>
<li><b>第 6 步（50 分钟）：</b>搭建 30 条离线评估集与回归门禁，产出评估报告。</li>
<li><b>第 7 步（70 分钟）：</b>接入日志、指标与 trace_id，再做压测与故障注入，产出排障记录与验收表。</li>
</ol>
</div>

## 学习前准备

### 前置知识

| 能力 | 最低要求 | 不达标会怎样 |
|-|-|-|
| Python 异步 | 会写 `async def` 与 `async for` | 流式接口会阻塞事件循环，吞吐极低 |
| Web 基础 | 理解 HTTP 响应头与状态码 | 看不懂 SSE 的 `Content-Type` 与代理配置 |
| OpenAI SDK | 用过 `stream=True` 与 `usage` 字段 | 无法统计 Token 与首字延迟 |
| 异常分类 | 能区分客户端错误与服务端错误 | 会把 400 也重试，浪费三倍成本 |
| 基础统计 | 理解平均值与 P95 的区别 | 用平均延迟掩盖长尾卡顿 |
| 日志规范 | 知道结构化日志与 trace_id | 出事只能靠猜，无法复现 |

### 工具与材料

| 名称 | 版本 / 说明 | 用途 |
|-|-|-|
| Python | 3.11 及以上 | 运行全部示例 |
| fastapi | 0.115 及以上 | 提供流式 HTTP 接口 |
| uvicorn | 0.30 及以上 | 启动本地服务 |
| openai | 1.40 及以上 | 模型调用与流式响应 |
| python-dotenv | 1.0 及以上 | 读取密钥与端点 |
| 压测工具 | hey、wrk 或 Locust 任选 | 观察并发下的 P95 与错误率 |

### 三道自测题

| 题目 | 参考答案要点 |
|-|-|
| SSE 与 WebSocket 的核心区别 | SSE 是单向服务端推送，基于普通 HTTP，自带断线重连；WebSocket 是双向长连接，适合交互频繁场景 |
| 为什么要加随机抖动 | 多个客户端同时失败会在同一时刻重试，抖动把重试时间打散，避免二次拥塞 |
| P95 延迟比平均延迟更能说明什么 | 长尾体验。平均 1 秒但 P95 是 6 秒，说明 5% 的用户明显卡顿，不能只看均值 |

## 核心概念

### 一、流式链路：从模型 Token 到浏览器像素

SSE（Server-Sent Events）用普通 HTTP 长连接持续推送文本。响应头必须是 `text/event-stream`，每条消息由 `event:`、`data:` 和一个空行组成；以冒号开头的行是注释，常用来发心跳。浏览器端用 `EventSource` 接收，服务端每 15 秒发一次心跳，可以防止中间代理把空闲连接掐断。

链路上有三个容易忽略的点。第一是代理缓冲：Nginx 默认会攒够一批才转发，必须设置 `X-Accel-Buffering: no` 或关闭 `proxy_buffering`。第二是上游取消：用户关掉页面后，后端应停止继续请求模型，否则白花钱。第三是错误表达：流已经开始后不能再改 HTTP 状态码，只能发一个 `event: error` 的事件体。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| TTFT | 从请求发出到第一个 Token 到达的时间 | 目标控制在 1.2 秒以内 |
| TPOT | 相邻 Token 的平均间隔 | 20 到 50 毫秒属于正常区间 |
| SSE | 基于 HTTP 的单向事件流 | `/api/chat/stream` 的响应格式 |
| 心跳 | 周期性注释行，保活连接 | 每 15 秒发送 `: ping` |
| 断线重连 | 连接断开后重新建立 | EventSource 默认自动重连 |

<div class="callout plain"><span class="tag">大白话</span>
<p>流式就像<b>看厨师现场做菜</b>：菜一道一道端上来，你能马上动筷；非流式像等整桌菜全做完才开门，中途只能在门口干等。</p>
<p>用户感知的是<b>第一道菜什么时候到</b>（TTFT），不是整桌菜做完的总时长。</p>
</div>

### 二、超时、重试、退避与熔断

超时要分三层设置：连接超时 3 秒、读取超时 30 秒、单次总超时 60 秒。只设一个总超时，无法区分“连不上”和“连上了但很慢”，排查会很痛苦。

重试要克制。只对限流 429、超时、连接错误和 5xx 重试；400、401、403 这类客户端错误重试多少次都一样。最多 3 次，基础等待 0.5 秒，按 2 的幂增长，加 20% 随机抖动，单次上限 8 秒。更稳的做法是加“重试预算”：重试请求不超过总请求量的 10%，超过就停止重试，防止雪崩。

熔断器解决“下游已经挂了还继续打”的问题。连续 5 次失败后打开，30 秒内直接走降级；30 秒后进入半开状态，只放 1 个请求试探，成功则关闭，失败则重新计时。熔断要按依赖分别维护，不能一个全局开关。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| 连接超时 | 建立 TCP/TLS 连接的最长等待 | 建议 3 秒 |
| 读取超时 | 等待响应数据的最长时间 | 建议 30 秒 |
| 指数退避 | 每次重试等待时间翻倍 | 0.5、1、2、4 秒 |
| 抖动 | 在等待时间上加随机偏移 | 避免同一时刻集体重试 |
| 重试预算 | 重试量占总请求的比例上限 | 建议不超过 10% |
| 熔断三态 | 关闭、打开、半开 | 5 次失败打开，30 秒后半开 |

<div class="callout plain"><span class="tag">大白话</span>
<p>重试像<b>打电话</b>：对方占线，你隔一会儿再打，越打间隔越长；如果一直打不通，就先别打了，过半小时再试。</p>
<p>无脑连拨一百次，只会把对方的交换机也打挂。</p>
</div>

### 三、Token 预算与成本核算

成本公式很朴素：输入 Token 数除以 1000 乘以输入单价，加上输出 Token 数除以 1000 乘以输出单价。以一个示例价格计算，输入 3000 Token 约 0.0033 元，输出 500 Token 约 0.0022 元，单次约 0.0055 元；20 轮就是 0.11 元，1 万个会话就是每天 1100 元。

控制成本有四个抓手：限制 `max_tokens`、压缩上下文、启用上下文缓存、按会话设上限。上下文缓存对重复的 system prompt 和文档特别有效，命中后输入成本可以降 50% 到 90%。预算控制要“先预留、后记账”：调用前按最坏情况估算并检查余额，调用后按真实 `usage` 结算，避免并发下超支。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| 输入 Token | 提示词、上下文、工具定义的总量 | 决定单次基础成本 |
| 输出 Token | 模型生成的 Token 数 | 单价通常是输入的 3 到 4 倍 |
| 上下文缓存 | 复用相同前缀，降低输入计费 | system prompt 与知识库文档 |
| 预算预留 | 调用前先冻结一笔预估费用 | 防止并发超支 |
| 单会话上限 | 一个会话最多花多少钱 | 建议 0.5 元 |

<div class="callout plain"><span class="tag">大白话</span>
<p>Token 就像<b>打车计价</b>：上车有起步价（输入），路上越堵越贵（输出），堵车前先看钱包够不够。</p>
<p>不做预算的 Agent，等于给一张不限额的信用卡让模型随便刷。</p>
</div>

### 四、评估与可观测性三件套

离线评估回答“有没有变好”。准备 30 到 50 条高质量样例，覆盖正常、边界、对抗三类问题；每次改提示词、换模型、调参数都跑一遍，记录通过率、P95 延迟、单任务成本。门禁规则可以设成“通过率下降超过 2 个百分点就阻断合入”。

可观测性回答“为什么坏了”。日志记录离散事件，指标记录聚合趋势，追踪记录一次任务的完整调用链。三者用同一个 `trace_id` 串起来：用户反馈某次回答很慢，先按会话找到 trace，再看到底是模型慢、工具慢还是排队慢。

| 概念 | 一句话解释 | 在本项目里的影子 |
|-|-|-|
| 评估集 | 固定的输入与期望输出集合 | `EVAL_SET` 里的 30 条样例 |
| 通过率 | 满足判定规则的样例占比 | 回归门禁的核心指标 |
| 结构化日志 | 一行一个 JSON，字段固定 | 记录 llm_call 与 tool_call |
| 指标 | 可聚合的数值，如 QPS、错误率 | 面板上的曲线 |
| 追踪 | 用 trace_id 串起完整调用链 | 定位某一步的耗时 |

<div class="callout plain"><span class="tag">大白话</span>
<p>评估集是<b>月考</b>，可观测性是<b>体检</b>。</p>
<p>月考告诉你最近学得好不好，体检告诉你哪里不舒服。两样都没有，只能等用户投诉才知道出事了。</p>
</div>

## 代码实操一：用 SSE 打通流式前后端

后端用 FastAPI 的 `StreamingResponse` 包装一个异步生成器，每拿到一个 Token 就推一条 `delta` 事件；15 秒没新内容就发一次注释心跳；出错时发 `error` 事件而不是改状态码。前端用 `EventSource` 接收，收到 `done` 必须主动关闭，否则浏览器会自动重连。

```python
import asyncio
import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=os.getenv("OPENAI_BASE_URL"))
MODEL = os.getenv("MODEL_NAME", "gpt-4o-mini")
app = FastAPI()


def sse(event: str, data: dict) -> str:
    """按 SSE 规范拼一条事件：event 行 + data 行 + 空行。"""
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


async def token_stream(prompt: str):
    stream = await client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        stream=True,
        temperature=0.3,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        if delta:
            yield delta


@app.get("/api/chat/stream")
async def chat_stream(q: str = Query(..., min_length=1, max_length=2000)):
    async def gen():
        yield sse("start", {"model": MODEL})
        iterator = token_stream(q).__aiter__()
        try:
            while True:
                try:
                    token = await asyncio.wait_for(iterator.__anext__(), timeout=15)
                except StopAsyncIteration:
                    break
                except asyncio.TimeoutError:
                    yield ": ping\n\n"          # 注释行，保活但不触发前端事件
                    continue
                yield sse("delta", {"text": token})
            yield sse("done", {"reason": "stop"})
        except Exception as exc:
            yield sse("error", {"message": str(exc)[:200]})

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",       # 关闭 Nginx 缓冲
        },
    )
```

```text
const input = document.querySelector("#question");
const box = document.querySelector("#answer");
let es = null;

function ask() {
  if (es) es.close();
  box.textContent = "";
  es = new EventSource("/api/chat/stream?q=" + encodeURIComponent(input.value));

  es.addEventListener("delta", (e) => {
    box.textContent += JSON.parse(e.data).text;
  });
  es.addEventListener("done", () => {
    es.close();
    es = null;
  });
  es.addEventListener("error", (e) => {
    if (e.data) box.textContent += "\n[错误] " + JSON.parse(e.data).message;
    es.close();
    es = null;
  });
}
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `sse(event, data)` | 统一事件格式 | SSE 要求 `data:` 行加空行，格式错前端收不到 |
| `AsyncOpenAI` | 非阻塞调用 | 同步客户端会卡住事件循环，并发直接退化 |
| `wait_for(..., timeout=15)` | 心跳超时 | 上游久无输出时发 ping，避免代理掐连接 |
| `media_type="text/event-stream"` | 声明流式响应 | 不设置浏览器不会按 SSE 解析 |
| `X-Accel-Buffering: no` | 关闭代理缓冲 | 否则 Nginx 会攒一批再发，流式变假流式 |
| 前端 `done` 里 `es.close()` | 主动结束 | 不关闭会触发自动重连，造成重复请求 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>流开始后还想返回 500</b>：响应头已发出，只能发 <code>event: error</code>，前端要单独处理。</li>
<li><b>只看后端日志不看代理</b>：Cloudflare、Nginx 都可能缓冲，部署后必须在真实链路测 TTFT。</li>
<li><b>用户断开后仍继续生成</b>：要在生成器里检测断连并取消上游请求，否则白烧 Token。</li>
<li><b>心跳写成 <code>data: ping</code></b>：会触发前端 message 事件，应该用冒号注释行。</li>
</ul>
</div>

## 代码实操二：超时、重试、指数退避与熔断

下面把重试与熔断写在一个封装里。关键点是异常捕获顺序：`RateLimitError` 是 `APIStatusError` 的子类，必须先捕获；4xx 客户端错误直接降级，不浪费重试次数；熔断器只统计真正的服务失败。

```python
import os
import random
import time

from dotenv import load_dotenv
from openai import APIConnectionError, APIStatusError, APITimeoutError, OpenAI, RateLimitError

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=os.getenv("OPENAI_BASE_URL"))
MODEL = os.getenv("MODEL_NAME", "gpt-4o-mini")
FALLBACK = "抱歉，服务暂时繁忙，请稍后再试。"


class CircuitBreaker:
    """三态熔断：关闭 -> 打开 -> 半开 -> 关闭。"""

    def __init__(self, fail_threshold: int = 5, open_seconds: float = 30.0):
        self.fail_threshold = fail_threshold
        self.open_seconds = open_seconds
        self.failures = 0
        self.opened_at = 0.0

    def allow(self) -> bool:
        if self.opened_at == 0.0:
            return True
        if time.time() - self.opened_at >= self.open_seconds:
            self.opened_at = 0.0          # 半开：只放一个请求试探
            return True
        return False

    def record(self, ok: bool) -> None:
        if ok:
            self.failures = 0
            return
        self.failures += 1
        if self.failures >= self.fail_threshold:
            self.opened_at = time.time()


breaker = CircuitBreaker()


def retry_after_seconds(exc: RateLimitError) -> float:
    raw = exc.response.headers.get("retry-after", "")
    try:
        return min(float(raw), 30.0)
    except ValueError:
        return 0.0


def call_with_retry(prompt: str, max_attempts: int = 3) -> str:
    if not breaker.allow():
        return FALLBACK

    for attempt in range(max_attempts):
        try:
            resp = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                timeout=30,
            )
            breaker.record(True)
            return resp.choices[0].message.content or ""
        except RateLimitError as exc:
            wait = retry_after_seconds(exc) or min(
                0.5 * 2 ** attempt * (1 + random.random() * 0.2), 8.0
            )
            print(f"限流，第 {attempt + 1} 次，等待 {wait:.2f}s")
            time.sleep(wait)
        except (APITimeoutError, APIConnectionError):
            wait = min(0.5 * 2 ** attempt, 8.0)
            print(f"超时或连接失败，等待 {wait:.2f}s")
            time.sleep(wait)
        except APIStatusError as exc:
            if 400 <= exc.status_code < 500 and exc.status_code != 429:
                return FALLBACK            # 参数或鉴权错误，重试无意义
            time.sleep(min(0.5 * 2 ** attempt, 8.0))

    breaker.record(False)
    return FALLBACK
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `CircuitBreaker.allow()` | 判断是否放行 | 打开状态直接降级，保护下游 |
| `opened_at = 0.0` 后放行 | 半开探测 | 只放一个请求，避免恢复瞬间被流量打死 |
| `retry_after_seconds` | 尊重服务端建议 | 429 响应头常带 `Retry-After`，比盲目退避更准 |
| `2 ** attempt` | 指数退避 | 0.5、1、2 秒递增，给下游恢复时间 |
| `random.random() * 0.2` | 抖动 | 打散并发重试，避免同一秒再次拥塞 |
| 4xx 直接返回兜底 | 区分错误类型 | 参数错误重试一百次也不会成功 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>对所有异常重试</b>：400、401 重试只会浪费额度，还拖慢整体响应。</li>
<li><b>没有上限</b>：退避没有 cap，等到第 10 次已经过了十几分钟。</li>
<li><b>熔断器全局一个</b>：一个模型故障把其他正常依赖也熔断，应按依赖分别维护。</li>
<li><b>降级文案当成功</b>：调用方要知道这是降级结果，否则会污染评估指标。</li>
</ul>
</div>

## 代码实操三：Token 预算与成本核算

预算控制的正确顺序是“估算 → 预留 → 调用 → 按真实用量结算”。只做事后记账，在并发场景下一定会超支；只在调用前检查、不结算，又会导致余额永远不变。

```python
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=os.getenv("OPENAI_BASE_URL"))
MODEL = os.getenv("MODEL_NAME", "gpt-4o-mini")

PRICE = {
    "gpt-4o-mini": {"in": 0.0011, "out": 0.0044},
    "gpt-4o": {"in": 0.018, "out": 0.072},
}


class CostTracker:
    """按会话与按天双重限额，单位：元。"""

    def __init__(self, session_cap: float = 0.5, daily_cap: float = 20.0):
        self.session_cap = session_cap
        self.daily_cap = daily_cap
        self.session_used = 0.0
        self.daily_used = 0.0
        self.calls = 0

    def price(self, model: str) -> tuple[float, float]:
        p = PRICE.get(model) or PRICE["gpt-4o-mini"]
        return p["in"], p["out"]

    def estimate(self, model: str, prompt_tokens: int, max_output_tokens: int = 800) -> float:
        pin, pout = self.price(model)
        return prompt_tokens / 1000 * pin + max_output_tokens / 1000 * pout

    def reserve(self, estimate: float) -> None:
        if self.session_used + estimate > self.session_cap:
            raise RuntimeError(
                f"单会话预算不足：已用 {self.session_used:.4f}，本次预估 {estimate:.4f}"
            )
        if self.daily_used + estimate > self.daily_cap:
            raise RuntimeError(f"日预算不足：已用 {self.daily_used:.2f}")

    def record(self, model: str, usage) -> float:
        pin, pout = self.price(model)
        cost = usage.prompt_tokens / 1000 * pin + usage.completion_tokens / 1000 * pout
        self.session_used += cost
        self.daily_used += cost
        self.calls += 1
        return cost


tracker = CostTracker()


def budgeted_chat(prompt: str, model: str = MODEL) -> str:
    # 粗估：中文约 1 字 1 Token，英文约 4 字符 1 Token，生产建议用 tiktoken
    estimate = tracker.estimate(model, prompt_tokens=len(prompt), max_output_tokens=800)
    tracker.reserve(estimate)

    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800,
    )
    cost = tracker.record(model, resp.usage)
    print(f"本次 {cost:.4f} 元，会话累计 {tracker.session_used:.4f} 元，调用 {tracker.calls} 次")
    return resp.choices[0].message.content or ""
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `PRICE` 按模型分档 | 支持多模型核算 | 不同模型单价差 10 倍以上，混用必须分开算 |
| `estimate()` | 调用前估算 | 用最大输出 Token 估最坏情况，避免低估 |
| `reserve()` | 双重限额检查 | 会话级防单用户刷爆，天级防整体失控 |
| `record()` | 按真实 `usage` 结算 | 估算只用于预留，最终以服务端返回为准 |
| `max_tokens=800` | 限制输出 | 输出单价高，限制长度是最直接的成本手段 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>只做调用后记账</b>：并发 10 个请求同时通过检查，最后一起超支。</li>
<li><b>用字符数当 Token 数</b>：中文、英文、代码差异很大，误差可达 50%，生产要用分词器。</li>
<li><b>忽略工具定义占用的输入 Token</b>：20 个工具的 schema 可能就有 2000 Token。</li>
<li><b>流式响应拿不到 usage</b>：需要在请求里开启用量统计，或在结束后单独结算。</li>
</ul>
</div>

## 代码实操四：离线评估与可观测性

评估集不需要大，30 到 50 条就能发现大部分回归。下面的实现同时输出通过率、P95 延迟和逐条明细，并设置回归门禁：比基线低超过 2 个百分点就退出，让 CI 直接失败。

```python
import json
import time
import uuid

MODEL = "gpt-4o-mini"

EVAL_SET = [
    {"q": "Agent 最大步数设多少合适", "expect": ["6", "10"]},
    {"q": "工具报错应该怎么处理", "expect": ["结构化", "回传"]},
    {"q": "RAG 检索不准先排查什么", "expect": ["检索", "context"]},
]


def trace(records: list[dict], session_id: str, step: int, event: str, payload: dict) -> None:
    records.append({
        "ts": round(time.time(), 3),
        "session": session_id,
        "step": step,
        "event": event,                 # llm_call / tool_call / final
        "payload": payload,
    })


def run_eval(agent_fn, baseline: float = 0.6) -> dict:
    rows = []
    for case in EVAL_SET:
        started = time.time()
        try:
            answer = agent_fn(case["q"])
            ok = any(key.lower() in answer.lower() for key in case["expect"])
        except Exception as exc:
            answer, ok = f"ERROR {exc}", False
        rows.append({
            "q": case["q"],
            "ok": ok,
            "latency": round(time.time() - started, 2),
            "answer": answer[:80],
        })

    pass_rate = sum(r["ok"] for r in rows) / len(rows)
    latencies = sorted(r["latency"] for r in rows)
    p95 = latencies[max(0, int(len(latencies) * 0.95) - 1)]

    if pass_rate + 0.02 < baseline:
        raise SystemExit(f"回归门禁失败：{pass_rate:.2%} 低于基线 {baseline:.2%}")

    return {"pass_rate": round(pass_rate, 3), "p95_latency": p95, "details": rows}


if __name__ == "__main__":
    records: list[dict] = []
    sid = str(uuid.uuid4())[:8]
    trace(records, sid, 1, "llm_call", {"model": MODEL, "prompt_tokens": 320})
    trace(records, sid, 2, "tool_call", {"name": "search_docs", "elapsed": 0.42})
    print(json.dumps(records, ensure_ascii=False, indent=2))

    report = run_eval(lambda q: "建议 6 到 10 步，工具错误要结构化回传")
    print(json.dumps(report, ensure_ascii=False, indent=2))
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `EVAL_SET` 三字段结构 | 输入、期望关键词、可扩展元数据 | 结构越简单，维护成本越低 |
| `try/except` 包住单条 | 单条失败不影响整体 | 评估要的是全量得分，不是第一个异常 |
| `p95 = latencies[...]` | 长尾延迟 | 小样本下取排序后的 95% 分位，比均值更有意义 |
| `pass_rate + 0.02 < baseline` | 回归门禁 | 容忍 2 个百分点抖动，超过就阻断 |
| `trace()` 统一字段 | 可串联 | session 加 step 能还原一次任务的完整路径 |

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>评估集与训练样例重叠</b>：模型见过答案，通过率虚高，必须留出独立样例。</li>
<li><b>只用关键词匹配</b>：同义表达会被判错，重要场景应加人工抽检或模型评分。</li>
<li><b>没有冻结基线</b>：每次换模型都重设基线，永远发现不了回归。</li>
<li><b>日志缺 trace_id</b>：只能看到零散调用，无法还原一次任务的完整链路。</li>
</ul>
</div>

## 综合案例：上线前 24 小时的完整演练

**输入**：一个带 3 个工具的 RAG Agent，准备上线，日活预估 1000 会话。团队需要在 24 小时内回答三个问题：扛不扛得住、花不花得起、坏了能不能查。

**流程**：先用 50 并发压测拿基线，再注入限流与超时验证熔断，接着跑 30 条评估集确认质量，最后模拟一次用户投诉做排障演练。四步都通过才允许发布。

| 检查项 | 方法 | 通过标准 | 不通过的动作 |
|-|-|-|-|
| 首字延迟 | 50 并发压测 | P95 小于 1.5 秒 | 检查代理缓冲与上游并发限制 |
| 错误率 | 统计 5xx 与超时 | 小于 1% | 调整超时与重试预算 |
| 单会话成本 | 抽样 100 个会话 | 小于 0.05 元 | 压缩上下文、限制输出长度 |
| 评估通过率 | 跑 30 条评估集 | 不低于基线 2 个百分点 | 回滚提示词或模型版本 |
| 熔断有效性 | 注入连续 429 | 5 次后 30 秒内直接降级 | 检查熔断阈值与降级路径 |
| 可追溯性 | 按会话 ID 查 trace | 能还原每一步耗时与工具参数 | 补 trace_id 与结构化日志 |

**输出**：一份带数字的验收表，加一份失败处理预案。压测不通过就不发版，评估回归就先回滚，成本超标就先砍上下文，不靠“感觉应该没问题”。

**失败处理**：

| 失败模式 | 如何发现 | 处理动作 |
|-|-|-|
| 流式被代理缓冲 | 压测 TTFT 远高于本地 | 关闭 `proxy_buffering`，加 `X-Accel-Buffering` |
| 重试风暴 | 429 比例在故障后飙升 | 降低重试次数，加抖动与重试预算 |
| 熔断误伤 | 正常请求被批量降级 | 熔断按依赖拆分，阈值调到 5 次以上 |
| 成本超支 | 日报显示单会话均值翻倍 | 限制 `max_tokens`，压缩工具 schema |
| 无法排障 | 日志里找不到会话 | 统一 trace_id，补齐 step 与耗时字段 |

<div class="callout tip"><span class="tag">老师建议</span>
<p>课堂演练时，让学生先不看代码，只给一份“用户说回答很慢”的工单，让他们自己决定先查哪三个指标。这个过程比直接讲日志字段更能建立工程直觉。</p>
</div>

## 疑难点分级

| 知识点 | 难度 | 典型卡点 | 破解方式 |
|-|-|-|-|
| SSE 事件格式 | 中 | 前端收不到消息 | `data:` 行加空行，`Content-Type` 正确 |
| 代理缓冲 | 高 | 本地是流式，线上变整段 | 关闭 Nginx 缓冲并设置响应头 |
| 首字延迟统计 | 中 | 把总耗时当 TTFT | 单独记录第一个非空 delta 的时间 |
| 客户端断连 | 高 | 用户走了还在烧 Token | 检测断连并取消上游请求 |
| 重试边界 | 高 | 越重试越糟 | 只重试 429、超时、5xx，最多 3 次 |
| 指数退避与抖动 | 中 | 重试时间过于集中 | `0.5 × 2^n` 加 20% 随机抖动 |
| 熔断三态 | 高 | 熔断后恢复不了 | 半开只放一个探测请求，成功即关闭 |
| 重试预算 | 高 | 故障时流量翻倍 | 重试量控制在总请求 10% 以内 |
| Token 估算 | 中 | 字符数当 Token | 用分词器，中文与代码单独校准 |
| 输出成本 | 中 | 只盯输入单价 | 输出单价高 3 到 4 倍，限制 `max_tokens` |
| 并发超支 | 高 | 检查通过后一起超限 | 先预留再结算，加锁或原子操作 |
| 上下文缓存 | 中 | 命中率低 | 稳定前缀放前面，动态内容放后面 |
| 评估集设计 | 高 | 样例与线上分布不符 | 从真实日志抽样，覆盖正常与对抗 |
| 回归门禁 | 中 | 不敢设阈值 | 先跑两周记录波动，再定 2 个百分点 |
| 日志与追踪 | 中 | 日志很多但串不起来 | 统一 trace_id，固定字段名 |

## 常见面试题

| 问题 | 考察点 | 答题要点 |
|-|-|-|
| SSE 和 WebSocket 怎么选 | 传输方案 | 单向推送选 SSE，普通 HTTP、自带重连；双向高频交互选 WebSocket |
| 流式接口为什么线上会变“假流式” | 部署细节 | Nginx 或 CDN 缓冲，需关闭 `proxy_buffering` 并设置 `X-Accel-Buffering: no` |
| 首字延迟怎么优化 | 性能优化 | 减少输入长度、启用缓存、就近接入、避免排队，目标 1.2 秒以内 |
| 哪些错误可以重试 | 错误分类 | 429、超时、连接错误、5xx 可重试；400、401、403 不重试 |
| 为什么要加随机抖动 | 重试策略 | 避免大量客户端同一时刻重试造成二次拥塞，通常加 20% 抖动 |
| 熔断器三个状态怎么流转 | 稳定性设计 | 关闭态累计 5 次失败转打开，30 秒后半开放 1 个探测，成功关闭、失败重开 |
| Token 成本怎么估 | 成本核算 | 输入数除以 1000 乘输入单价，加输出数除以 1000 乘输出单价；输出通常贵 3 到 4 倍 |
| 如何防止单用户刷爆预算 | 限额设计 | 会话级 0.5 元、日级 20 元双限额，调用前预留、调用后结算 |
| 评估集要多大 | 评估方法 | 30 到 50 条高质量样例即可发现大部分回归，关键在覆盖边界与对抗 |
| 回归门禁怎么设 | 工程流程 | 通过率下降超过 2 个百分点阻断合入，同时看 P95 延迟与单任务成本 |
| 一次慢请求怎么定位 | 可观测性 | 按 session 找 trace，拆分模型、工具、排队三段耗时，再下钻到具体 span |

## 动手练习

<div class="callout task"><span class="tag">动手练习</span>
<ol>
<li>（低）跑通 SSE 后端与前端，记录首字延迟与总耗时。</li>
<li>（低）在浏览器断网再恢复，观察 EventSource 的重连行为。</li>
<li>（中）给流式接口加 <code>event: error</code> 分支，构造一次上游异常。</li>
<li>（中）把重试次数从 3 改成 5，观察限流场景下的失败率变化。</li>
<li>（中）去掉随机抖动，用 20 个并发请求观察重试时间分布。</li>
<li>（中）给熔断器加日志，打印关闭、打开、半开三种状态切换。</li>
<li>（中）把 <code>max_tokens</code> 从 800 降到 300，计算单次成本下降比例。</li>
<li>（高）用真实分词器替换字符估算，比较两者误差。</li>
<li>（高）实现并发安全预算：10 个协程同时申请，验证不会超支。</li>
<li>（高）把评估集扩到 30 条，加入 5 条对抗样例并记录基线。</li>
<li>（高）实现按 session 聚合的 trace 查看脚本，输出每一步耗时。</li>
<li>（高）做一次 50 并发压测，输出 TTFT P95、错误率与单会话成本三项报告。</li>
</ol>
</div>

## 本章小结

- 流式的核心指标是首字延迟，不是总耗时；目标通常控制在 1.2 秒以内。
- SSE 落地要处理三件事：正确的事件格式、关闭代理缓冲、15 秒心跳保活。
- 重试只针对限流、超时与 5xx，指数退避加抖动，最多 3 次，并设 10% 重试预算。
- 熔断器按依赖维护，5 次失败打开、30 秒后半开探测，避免故障扩散。
- 成本控制要“先预留、后结算”，同时设会话级与天级上限，输出长度是最直接的成本开关。
- 评估集 30 到 50 条即可，关键是冻结基线并设置 2 个百分点的回归门禁。
- 可观测性三件套缺一不可：结构化日志、聚合指标、带 trace_id 的调用链。
- 上线前用压测、故障注入、评估、排障演练四步验收，用数字说话，不靠感觉。

下一章，我们把前面所有能力拼装成一个完整项目，从需求到部署走一遍。
