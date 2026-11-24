## 阶段导读

这是综合实战阶段：不再“一节一节学语法”，而是**用自然语言驱动 AI，把一个完整系统从零交付上线**。你要同时练三件事：Vibe Coding（AI 结对开发）、Skill（把能力封装成可复用资产）、端到端交付（前端 + 后端 + 数据库 + 实时通信 + 部署）。

这个阶段最大的变化是：**你从“写代码的人”变成“定方案、拆任务、审结果的人”**。AI 能把一个接口写出来，但它不知道你的业务约束、不知道线上库不能随便改、不知道这段代码三个月后谁维护。这些判断仍然在你身上。

具体交付两个项目。第一个是全栈平台，从六个行业里选一个（美途旅行、好房易租、倾听 FM、云尚课堂、谷德家政、好医在线），统一用 SpringBoot3 + Spring-AI + Vue3 + Element-Plus + MySQL / MyBatis-Plus / Redis，带 WebSocket 实时对话，最后用 Maven + Docker + Nginx 部署上线。第二个是专项 Agent 系统，从五个方向里选一个（商城风控、万应助手、漏洞挖掘、ETL-Agent、合同审批），重点考察你在某个技术方向上的深度。

学完这个阶段，你要能独立完成：把一句模糊需求拆成可执行任务卡、先定接口契约再让 AI 写实现、审查 AI 生成的代码、把重复能力封装成带版本的 Skill、通过 MCP 把能力接给 AI 工具、用容器部署并做基本运维。

最容易踩的坑有六个。**一次让 AI 写整个模块**，生成几百行看似能跑、实则无法维护的代码；**不给上下文**，AI 按通用模板写，和你项目规范完全不符；**不看 diff 直接接受**，埋下安全与逻辑漏洞；**Skill 粒度失控**，一个技能塞五种能力，参数爆炸；**前后端各写各的**，字段对不上，联调两天；**本地能跑线上不行**，环境变量、端口、Nginx 缓冲、时区全是坑。

<div class="callout plain"><span class="tag">大白话</span>
<p>Vibe Coding 像<b>带一个很能干但完全没有你公司背景的实习生</b>。</p>
<p>你只说“做个商城”，他会给你一个能跑但完全不符合你业务的商城。高效的做法是：<b>先给上下文（技术栈、目录、规范），再拆小任务，每步验收</b>。</p>
<p>所以核心能力不是写提示词，而是<b>拆任务 + 审代码</b>。这两件事 AI 替不了你。</p>
</div>

## 教学路径

<div class="callout path"><span class="tag">教学路径</span><ol class="path-steps">
<li><b>第 1 步（2 天）：</b>搭好三件套工具（Cursor / Claude Code / Codex），各用它完成同一个小任务，产出工具对比笔记。</li>
<li><b>第 2 步（2 天）：</b>上下文工程。写 PROJECT.md、AGENTS.md、目录规范，让 AI 第一次生成就符合项目风格。</li>
<li><b>第 3 步（2 天）：</b>需求拆解。把一个模糊需求拆成任务卡，先写接口契约与验收条件。</li>
<li><b>第 4 步（3 天）：</b>Skill 设计。定义、实现、注册一个真实技能，产出带版本的技能包。</li>
<li><b>第 5 步（2 天）：</b>Skill 编排与 MCP 集成。把技能注册成 MCP 工具，在 AI 工具里直接调用。</li>
<li><b>第 6 步（2 天）：</b>选项目。从全栈六选一与专项五选一中各定一个，写清业务边界与不做的范围。</li>
<li><b>第 7 步（4 天）：</b>后端。SpringBoot3 + Spring-AI 接口、MyBatis-Plus 数据层、Redis 缓存与限流。</li>
<li><b>第 8 步（3 天）：</b>前端。Vue3 + Element-Plus 页面、Axios 封装、SSE / WebSocket 实时对话。</li>
<li><b>第 9 步（2 天）：</b>联调。按接口契约逐条验证，补齐异常分支与空态。</li>
<li><b>第 10 步（3 天）：</b>专项系统。核心算法、沙箱、规则引擎或编排器，写出技术取舍说明。</li>
<li><b>第 11 步（3 天）：</b>部署上线。Maven 打包、Docker 镜像、Nginx 反代、健康检查与日志。</li>
<li><b>第 12 步（2 天）：</b>复盘答辩。整理架构图、演示脚本与三个最难的取舍。</li>
</ol></div>

## 学习前准备

### 前置知识

| 能力 | 最低要求 | 不达标会怎样 |
|-|-|-|
| Java / SpringBoot | 会写 Controller、Service、Mapper，懂依赖注入 | 后端代码看不懂，AI 写错也发现不了 |
| Vue3 | 会组件、`ref`、`computed`、路由 | 前端报错只能干瞪眼 |
| SQL 与 ORM | 会多表查询、索引、MyBatis-Plus 条件构造 | 数据层性能问题频发 |
| Docker | 会写 Dockerfile、compose，会看容器日志 | 部署阶段卡住 |
| Git | 会分支、提交、回滚、看 diff | 无法控制 AI 改动的风险 |
| LangGraph / MCP | 懂状态图与工具协议 | 专项项目做不深 |

### 环境与软件清单

| 软件 | 版本建议 | 用途 |
|-|-|-|
| JDK | 17 | SpringBoot3 最低要求 |
| Maven | 3.9+ | 构建与依赖管理 |
| Node.js / pnpm | 20 LTS / 最新 | 前端构建 |
| Cursor | 最新 | IDE 内 AI 结对 |
| Claude Code | 最新 CLI | 终端里的项目级 Agent |
| Codex CLI 或云端 | 最新 | 任务式代码生成 |
| Docker Desktop | 最新 | 本地起 MySQL、Redis、Nginx |
| MySQL | 8.0 | 业务库 |
| Redis | 7 | 缓存、会话、限流 |
| Nginx | 最新 | 静态资源与反向代理 |
| IDEA | 最新 | Java 开发 |

### 三道自测题

| 题目 | 参考答案要点 |
|-|-|
| 1. 让 AI 新增一个“查询订单详情”接口，你会先给它什么？ | 先给项目说明（技术栈、目录、分层规范）、相关实体与 Mapper、现有同类接口、接口契约（路径、入参、返回、错误码），再要求它只改必要文件并给出测试方式。 |
| 2. Skill 的 description 为什么比实现更重要？ | Agent 靠 description 判断“什么时候该用这个技能”。描述含糊会导致该用不用、乱用或参数传错；实现再好，选不中也等于不存在。 |
| 3. 部署后前端 SSE 一次性收到全部消息，先查什么？ | 先查 Nginx 是否开启了 `proxy_buffering`，再查后端是否设置 `X-Accel-Buffering: no`，最后查是否有中间层压缩或网关缓存。 |

<div class="callout tip"><span class="tag">老师建议</span>
<p>开一个专门的 <code>ai-log/</code> 目录，每次让 AI 做重要改动就把提示词、diff、验证结果存一份。答辩时这是你“会用 AI 且可控”的最好证据。</p>
</div>

## 模块精讲

### 模块1：Vibe Coding 工作法

#### 解决什么问题

需求方只会说“我要一个能预约家政的功能”，不会给你接口文档。传统做法是反复开会澄清，再手写。Vibe Coding 要解决的是：**在需求还模糊时，快速把可运行的原型做出来，同时保证代码可维护、可回滚**。它不是“让 AI 写完”，而是“让 AI 加速，你做判断”。

#### 核心概念

| 概念 | 含义 | 具体做法 |
|-|-|-|
| 自然语言驱动开发 | 用对话描述意图，由 AI 生成与修改代码 | 描述目标、约束、验收标准，而不是逐行口述 |
| 上下文工程 | 把项目知识喂给模型 | PROJECT.md、AGENTS.md、@文件引用、目录说明 |
| 垂直切片 | 一次只做一个端到端的小功能 | 从页面到接口到表，一次打通一条 |
| 契约先行 | 先定接口再写实现 | 路径、入参、返回、错误码写死 |
| 小步提交 | 每次可运行就提交 | 出问题能精准回滚 |
| 审查与验证 | 看 diff、跑测试、手动验证 | 重点看边界、异常、安全 |

三个工具的定位要分清：Cursor 是**编辑器内的结对**，适合在你熟悉的文件里改代码；Claude Code 是**终端里的项目级 Agent**，能跨文件搜索、执行命令、跑测试，适合“完成一个任务”；Codex 更偏**云端或任务式**，适合把明确的小任务丢出去等结果。工具不是越多越好，先用熟一个。

#### 关键实现

第一步，写项目说明。它是 AI 的“入职手册”，每次新会话先让它读。

```text
# PROJECT.md

【技术栈】
- 后端：SpringBoot 3.2 + Spring-AI + MyBatis-Plus + MySQL 8 + Redis 7
- 前端：Vue 3 + Vite + Element-Plus + Pinia
- 部署：Maven 打包 + Docker Compose + Nginx

【目录约定】
- controller 只做参数校验与编排，不写业务逻辑
- service 层接口 + impl 实现，事务加在 impl
- mapper 只写 SQL，不写业务判断
- 统一返回 Result<T>，错误码见 docs/error-code.md

【编码规范】
- 禁止在 Controller 里直接 new 对象做业务
- 所有外部调用必须有超时与降级
- 新增接口必须补一条集成测试
- 时间统一用 UTC 存储，展示层转东八区

【常用命令】
- 启动后端：mvn spring-boot:run
- 启动前端：pnpm dev
- 跑测试：mvn test
- 起中间件：docker compose up -d mysql redis
```

第二步，把“模糊需求”拆成任务卡。任务卡要小到一次能验收。

```yaml
# tasks/booking-create.yaml
id: booking-create
goal: 用户可以提交家政预约，返回预约单号与预计上门时间
scope:
  - 新增 POST /api/bookings
  - 新增 bookings 表与对应 Mapper
  - 前端预约表单页与提交逻辑
out_of_scope:
  - 支付
  - 派单算法
contract:
  request: { service_id: int, address: string, slot: string, remark: string }
  response: { booking_no: string, eta: string }
  errors: [40001 参数缺失, 40002 时段已满, 50001 服务不可用]
acceptance:
  - 参数缺失返回 40001 且前端有提示
  - 时段冲突返回 40002
  - 成功写入数据库且能在列表页看到
```

第三步，用小步提交把风险关进笼子：

```bash
git checkout -b feat/booking-create
# 让 AI 先只生成接口与测试，确认后再生成实现
git add -A && git commit -m "feat: booking contract and failing test"
# 实现通过测试后再提交一次
git add -A && git commit -m "feat: booking create api"
# 任何一步结果不对，直接丢弃工作区，不用手工删代码
git restore .
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| PROJECT.md 的“目录约定” | 约束生成位置 | 不写的话 AI 会把业务逻辑塞进 Controller |
| 任务卡的 `out_of_scope` | 主动划边界 | 不划边界，AI 会顺手改一堆无关文件 |
| `contract` 段 | 前后端共同依据 | 契约稳定，联调成本最低 |
| `acceptance` 段 | 验收标准 | 没有验收标准就无法判断“做完了” |
| 先写失败测试再实现 | 强制可验证 | AI 很容易写出“看起来对”的代码 |
| 小步 commit | 精准回滚 | 一次几百行改动，出问题只能全丢 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>一次让它“实现整个后台”</b>：生成几百行，无法审查，改一处崩三处。按垂直切片拆。</li>
<li><b>新会话不复述约束</b>：AI 忘了分层规范，开始往 Controller 里堆逻辑。每轮先让它读 PROJECT.md。</li>
<li><b>只看“能不能跑”</b>：不看 diff 就接受，SQL 注入、越权、空指针全进来了。</li>
<li><b>把整个仓库贴进上下文</b>：又慢又贵，还稀释重点。只给相关文件。</li>
<li><b>让 AI 改测试来通过测试</b>：测试是验收标准，不能被实现方修改。</li>
<li><b>没有回滚点</b>：一次生成两百行再提交，出问题只能手工回退。</li>
</ul>
</div>

### 模块2：Skill 体系与 MCP

#### 解决什么问题

同一套“查库存、算价格、生成报价单”的逻辑，你在聊天窗口教过 AI 一次，换个会话它又忘了；团队里三个人各写一版提示词，结果互不一致。Skill 要解决的是**把“会做的事”变成有名字、有契约、有版本、可检索、可复用的能力单元**，并能被不同的 AI 工具调用。

#### 核心概念

| 概念 | 含义 | 类比 |
|-|-|-|
| Skill 定义 | 名称、用途、触发条件、输入输出、依赖工具、权限、版本 | 岗位说明书 |
| 生命周期 | 设计 → 实现 → 注册 → 检索 → 编排 → 观测 → 迭代 → 下线 | 员工从入职到离职 |
| 注册 | 把技能暴露到注册表，供 Agent 发现 | 把工具挂上工具箱 |
| 检索 | 按描述、标签、向量相似度找到合适技能 | 按标签找工具 |
| 编排 | 多个技能按顺序、并行或条件组合 | 流水线 |
| 复用 | 参数化后跨场景使用 | 一把扳手拧多种螺丝 |
| 构建与集成 | 用 SKILL.md 描述，或通过 MCP 暴露为工具 | 插件安装 |
| 版本管理 | 语义化版本、灰度、变更日志、回滚 | 工具换代 |
| MCP | 模型与工具之间的标准协议 | USB 接口标准 |

Skill 的 description 是检索的唯一依据，所以要写“什么时候用”，而不是“我实现了什么”。比如“当用户需要根据 SKU 查询实时库存并判断是否可售时使用”，比“库存查询工具”有效得多。

MCP 解决的是“工具接入标准化”。它定义了三类能力：**tools**（可调用的函数）、**resources**（可读取的数据）、**prompts**（预置提示模板）。传输上，本地进程用 stdio，远程服务用 HTTP/SSE。把 Skill 包成 MCP Server，Claude Code、Cursor 等工具就能直接发现并调用，不用每家单独适配。

#### 关键实现

一个 Skill 的说明文件，重点在触发条件与契约：

```text
# SKILL.md

name: inventory-check
version: 1.2.0
description: 当用户需要根据 SKU 查询实时库存、判断是否可售、估算发货时效时使用。
when_to_use:
  - 用户给出 SKU 并询问有没有货
  - 下单前需要校验库存
inputs:
  sku: { type: string, required: true }
  region: { type: string, required: false, default: "全国" }
outputs:
  available: boolean
  stock: integer
  eta_days: integer
  warehouse: string
tools: [mysql_readonly, redis_cache]
permissions: [inventory:read]
steps:
  1. 先查 Redis 缓存，命中直接返回
  2. 未命中查只读库，写入缓存 60 秒
  3. 按区域仓规则计算预计时效
changelog:
  - 1.2.0 增加区域仓时效计算
  - 1.1.0 增加 Redis 缓存
```

用 MCP 把技能暴露成工具：

```python
# mcp_server.py
import asyncio
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("inventory-skill")

@mcp.tool()
async def inventory_check(sku: str, region: str = "全国") -> dict:
    """查询 SKU 实时库存与预计发货时效。
    当用户询问是否有货、能否今天发货时调用。"""
    # 真实实现：先查 Redis，再查只读库；此处返回示例（简化实现）
    return {"sku": sku, "available": True, "stock": 42,
            "eta_days": 2, "warehouse": f"{region}-1号仓"}

if __name__ == "__main__":
    mcp.run()          # 默认 stdio；远程部署可改用 streamable HTTP
```

多个技能编排时，用统一的调用协议，并把失败包装成结构化结果：

```python
# orchestrator.py
from skills.registry import registry

async def quote(sku: str, qty: int, region: str) -> dict:
    inv = await registry.call("inventory_check", sku=sku, region=region)
    if not inv["ok"] or not inv["data"]["available"]:
        return {"ok": False, "stage": "inventory", "reason": inv.get("error", "库存不足")}
    price = await registry.call("price_calc", sku=sku, qty=qty)
    if not price["ok"]:
        return {"ok": False, "stage": "price", "reason": price["error"]}
    total = price["data"]["unit"] * qty
    return {"ok": True, "sku": sku, "qty": qty, "total": total,
            "eta_days": inv["data"]["eta_days"]}
```

版本管理不要只写在文档里，要能灰度与回滚：

| 版本 | 变更 | 状态 | 回滚方式 |
|-|-|-|-|
| 1.0.0 | 基础库存查询 | 已下线 | 不可用 |
| 1.1.0 | 增加 Redis 缓存 | 稳定 | 切回 1.0.0 镜像 |
| 1.2.0 | 增加区域仓时效 | 灰度 20% | 配置切回 1.1.0 |
| 1.3.0 | 改用新库存服务 | 开发中 | 未上线 |

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `description` 含触发场景 | 供 Agent 检索 | 只写功能名，模型不知道何时该用 |
| `inputs` 标注 required | 参数校验 | 缺参时能明确要求用户补充 |
| `permissions` | 最小权限 | 技能不该拿到超出职责的数据权限 |
| `changelog` | 版本可追溯 | 出问题能定位是哪个版本引入的 |
| `@mcp.tool()` | 暴露为 MCP 工具 | 一次适配，多端可用 |
| docstring 写调用时机 | 工具描述 | MCP 客户端靠它选择工具 |
| `registry.call` 返回 `ok` | 统一错误结构 | 编排层能判断失败并决定下一步 |
| 灰度状态 | 控制风险 | 新版本先给小流量，出问题快速切回 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>description 写成“库存工具”</b>：Agent 不知道什么时候用、参数怎么给。必须写场景与边界。</li>
<li><b>一个技能做五件事</b>：参数爆炸、职责不清。一个技能对应一个动词。</li>
<li><b>直接改线上技能</b>：出问题无法回滚。必须升版本、留 changelog。</li>
<li><b>权限给太大</b>：查询库存的技能拿到了写权限，风险不可控。按最小权限授予。</li>
<li><b>MCP 返回自然语言</b>：调用方无法稳定解析。统一返回结构化 JSON。</li>
<li><b>忽略协议版本</b>：客户端与服务端 MCP 版本不兼容，工具直接发现不了。</li>
</ul>
</div>

### 模块3：全栈实战（六选一）

#### 解决什么问题

会写接口不等于能交付系统。真实项目要处理登录、权限、分页、文件上传、实时对话、缓存、部署。这一模块训练的是**把六个行业需求中的一个完整落地**，重点不在业务多复杂，而在链路完整、能上线、能演示。

#### 核心概念

| 选项 | 业务重点 | 实时能力用在哪 |
|-|-|-|
| 美途旅行 | 行程规划、景点检索、订单 | 行程调整实时同步 |
| 好房易租 | 房源检索、预约看房、合同 | 房东与租客在线沟通 |
| 倾听 FM | 音频节目、订阅、播放记录 | 播放进度与评论推送 |
| 云尚课堂 | 课程、学习进度、答疑 | 课堂答疑实时对话 |
| 谷德家政 | 服务预约、派单、评价 | 派单通知与进度跟踪 |
| 好医在线 | 挂号、问诊、报告解读 | 医患图文问诊 |

统一技术栈：

| 层 | 技术 | 关键点 |
|-|-|-|
| 前端 | Vue3 + Vite + Element-Plus + Pinia | 组件复用、请求封装、路由守卫 |
| 后端 | SpringBoot3 + Spring-AI | 分层、统一返回、全局异常 |
| 数据 | MySQL 8 + MyBatis-Plus | 索引、分页、逻辑删除 |
| 缓存 | Redis 7 | 会话、热点缓存、限流 |
| 实时 | WebSocket + SSE | 对话用 WS，进度用 SSE |
| 构建 | Maven | 多环境 profile |
| 部署 | Docker Compose + Nginx | 反代、静态资源、健康检查 |

#### 关键实现

后端流式接口，Spring-AI 负责调模型，SSE 负责推送：

```java
// ChatController.java
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam String question, @RequestParam Long sessionId) {
        SseEmitter emitter = new SseEmitter(120_000L);   // 两分钟超时
        // 独立线程执行，避免阻塞 Tomcat 工作线程
        CompletableFuture.runAsync(() -> {
            try {
                chatClient.prompt()
                    .user(question)
                    .stream()
                    .content()
                    .subscribe(
                        token -> {
                            try { emitter.send(SseEmitter.event().name("token").data(token)); }
                            catch (IOException e) { emitter.completeWithError(e); }
                        },
                        emitter::completeWithError,
                        emitter::complete
                    );
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
        return emitter;
    }
}
```

前端用 `EventSource` 接收，注意它只能发 GET，且浏览器会自动重连：

```javascript
// useChatStream.js
import { ref } from "vue";

export function useChatStream() {
  const answer = ref("");
  let es = null;

  function start(question, sessionId) {
    stop();
    answer.value = "";
    // EventSource 只支持 GET，参数走 query
    es = new EventSource(`/api/chat/stream?question=${encodeURIComponent(question)}&sessionId=${sessionId}`);
    es.addEventListener("token", (e) => { answer.value += e.data; });
    es.addEventListener("done", () => { stop(); });
    es.onerror = () => { stop(); };     // 出错要主动关闭，否则会无限重连
  }

  function stop() { if (es) { es.close(); es = null; } }

  return { answer, start, stop };
}
```

部署用一份 compose 管住依赖，Nginx 负责静态资源与反代：

```yaml
# docker-compose.yml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: app
    volumes: ["mysql-data:/var/lib/mysql"]
  redis:
    image: redis:7-alpine
  backend:
    build: ./backend
    environment:
      SPRING_PROFILES_ACTIVE: prod
      MYSQL_HOST: mysql
      REDIS_HOST: redis
    depends_on: [mysql, redis]
  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    volumes:
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on: [backend]
volumes:
  mysql-data:
```

```text
# nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;

    location /api/ {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;          # 长连接必须放大
        proxy_buffering off;              # 否则 SSE 会攒着一起发
    }

    location /ws/ {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        try_files $uri $uri/ /index.html; # 前端路由刷新不 404
    }
}
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `SseEmitter(120_000L)` | 长连接超时 | 默认超时太短，模型还没答完就断开 |
| `CompletableFuture.runAsync` | 异步执行 | 同步会占满 Tomcat 线程 |
| `produces = TEXT_EVENT_STREAM` | 声明流式响应 | 浏览器据此按事件解析 |
| `EventSource` | 接收 SSE | 自动重连，但只能 GET |
| `es.close()` | 主动停止 | 不关闭会无限重连、重复请求 |
| `proxy_buffering off` | 关闭 Nginx 缓冲 | SSE 实时性的关键开关 |
| `proxy_read_timeout 300s` | 放宽读超时 | 长任务默认 60 秒会被掐断 |
| `try_files ... /index.html` | 前端路由回退 | 否则刷新子路由 404 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>前后端字段命名不一致</b>：后端 <code>userId</code>，前端 <code>user_id</code>，联调全靠猜。先定契约。</li>
<li><b>流式接口放在事务里</b>：事务开着等模型输出，连接池很快耗尽。</li>
<li><b>WebSocket 不做鉴权</b>：握手时带上 token，服务端校验后再建立连接。</li>
<li><b>Nginx 没配 Upgrade 头</b>：WebSocket 握手失败，前端一直重连。</li>
<li><b>时区不统一</b>：数据库存 UTC，页面直接展示成差 8 小时。展示层统一转换。</li>
<li><b>文件上传大小没调</b>：Spring 与 Nginx 都有默认限制，大文件直接 413。</li>
<li><b>生产用 root 连数据库</b>：权限过大且容易被拖库。按服务建最小权限账号。</li>
</ul>
</div>

### 模块4：专项系统（五选一）

#### 解决什么问题

全栈项目证明你能交付，专项项目证明你有深度。五个方向分别对应风控、工具编排、安全、数据工程、文档智能，选一个做到能讲清算法与工程取舍，比五个都浅尝更有价值。

#### 核心概念

| 方向 | 核心能力 | 关键难点 | 交付物 |
|-|-|-|-|
| 商城风控 | 三阶段思维链识别刷单与欺诈 | 特征设计、误杀控制 | 风险分 + 处置建议 |
| 万应助手 | Orchestrator + MCP + Text-to-SQL | 工具选择、SQL 安全 | 自然语言取数与执行 |
| 漏洞挖掘 | Docker 沙箱 + 多 Agent 验证 | 隔离、可复现 | 漏洞报告 + PoC |
| ETL-Agent | Harness + SeaTunnel Zeta | 任务编排、失败恢复 | 数据同步流水线 |
| 合同审批 | OCR + 规则引擎 | 条款抽取、规则冲突 | 审查意见 + 风险等级 |

以商城风控为例，Deep-Risk 的三阶段是：**第一阶看行为序列**（下单频率、设备聚集、地址雷同），**第二阶看关系网络**（同设备多账号、同收货地址多账号），**第三阶做对抗推理**（针对前两阶的漏网样本，让模型解释“为什么可能是正常用户”）。三阶段串行，前两阶快速过滤，第三阶只处理少量疑难样本，兼顾成本与准确率。

万应助手的关键是 Orchestrator 不直接干活，它只做三件事：理解意图、选择工具、合并结果。工具通过 MCP 注册，Text-to-SQL 只是其中一个工具，和搜索、HTTP 请求地位相同。合同审批的链路则是：版面分析 / OCR → 条款抽取（金额、期限、付款比例、违约责任）→ 规则引擎比对 → 生成审查意见；规则命中必须能指到原文，否则业务不敢用。漏洞挖掘方向用多个 Agent 分工：一个读代码找可疑点、一个生成 PoC、一个在 Docker 沙箱执行验证、一个复核并写报告；ETL-Agent 则由 Harness 管控任务与重试，执行层交给 SeaTunnel Zeta。

#### 关键实现

三阶段风控的核心逻辑：

```python
# risk/deep_risk.py
def stage1_behavior(order: dict) -> dict:
    """第一阶段：规则 + 统计特征，快速筛掉明显异常"""
    score = 0
    if order["orders_last_hour"] > 5:
        score += 40
    if order["device_accounts"] > 3:
        score += 30
    if order["address_accounts"] > 5:
        score += 20
    return {"score": score, "passed": score < 50}

def stage2_graph(order: dict, graph: dict) -> dict:
    """第二阶段：关系网络，看是否与已知黑名单连通"""
    neighbors = graph.get(order["device_id"], [])
    risky = sum(1 for n in neighbors if n in graph.get("blacklist", set()))
    return {"score": min(risky * 15, 45), "risky_neighbors": risky}

def stage3_reason(order: dict, llm) -> dict:
    """第三阶段：只对疑难样本做对抗推理，输出可解释结论"""
    prompt = f"""你是风控专家。判断这笔订单是否可疑，必须给出支持与反对两方理由。
订单：{order}
只输出 JSON：{{"risk":"低|中|高","support":["..."],"oppose":["..."],"action":"放行|人工|拦截"}}"""
    return llm(prompt)

def assess(order: dict, graph: dict, llm) -> dict:
    s1 = stage1_behavior(order)
    if s1["passed"]:
        return {"risk": "低", "score": s1["score"], "action": "放行"}
    s2 = stage2_graph(order, graph)
    total = s1["score"] + s2["score"]
    if total >= 80:                       # 高分直接拦截，不必再花模型成本
        return {"risk": "高", "score": total, "action": "拦截"}
    return {**stage3_reason(order, llm), "score": total}
```

Text-to-SQL 工具必须带闸门，和阶段 07 的思路一致：

```python
# tools/text2sql.py
import re

FORBIDDEN = re.compile(r"\b(insert|update|delete|drop|alter|grant|truncate)\b", re.I)

def safe_sql(sql: str, allowed_tables: set[str]) -> str:
    if FORBIDDEN.search(sql):
        raise ValueError("禁止写操作")
    if not re.match(r"^\s*(select|with)\b", sql, re.I):
        raise ValueError("只允许查询")
    for t in re.findall(r"(?:from|join)\s+(\w+)", sql, re.I):
        if t not in allowed_tables:
            raise ValueError(f"未授权表：{t}")
    return sql if "limit" in sql.lower() else sql + " LIMIT 500"
```

漏洞验证与 ETL 的工程骨架，重点在隔离与可恢复：

```bash
# 在一次性容器里验证 PoC：无网络、只读挂载、限定内存与时间
docker run --rm \
  --network none \
  --read-only \
  --memory 512m --cpus 1 \
  --pids-limit 128 \
  -v "$PWD/poc:/poc:ro" \
  vuln-sandbox:latest python /poc/verify.py
```

```yaml
# etl/job.yaml（Harness 管控的任务描述）
job: sync-orders
source: { type: mysql, table: orders, cursor: updated_at }
sink: { type: doris, table: dwd_orders }
schedule: "0 */2 * * *"
retry: { max: 3, backoff: exponential, dead_letter: etl_failed }
checkpoint: { store: redis, key: "etl:orders:offset" }
quality:
  - row_count_ratio: [0.8, 1.2]     # 行数波动超过 20% 告警
  - null_ratio: { column: order_id, max: 0 }
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| 三阶段串行 | 成本分层 | 简单样本不调模型，疑难样本才推理 |
| `passed` 早退 | 快速放行 | 大部分订单是正常的，不必全量走模型 |
| `total >= 80` 直接拦 | 高风险免推理 | 明显异常不需要再花钱解释 |
| 第三阶段要求正反理由 | 降低误杀 | 强制模型自我对抗，结论更稳 |
| SQL 关键字黑名单 | 防写操作 | 只读账号之外再加一道 |
| `limit` 兜底 | 防全表扫描 | 模型极爱不带限制 |
| `--network none` | 断网 | 防止 PoC 回连或下载载荷 |
| `--read-only` + 只读挂载 | 防篡改 | 沙箱内不能写宿主文件 |
| ETL checkpoint | 断点续跑 | 大表同步失败不能从头来 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>风控只看单条订单</b>：刷单是团伙行为，必须看设备、地址、支付账号的关系网络。</li>
<li><b>为了抓坏人牺牲体验</b>：误杀正常用户成本更高。要设人工复核通道与申诉。</li>
<li><b>Text-to-SQL 用高权限账号</b>：一句 <code>drop</code> 就没了。只读账号 + 白名单 + 关键字拦截。</li>
<li><b>沙箱里挂载了宿主目录</b>：等于没隔离。只挂只读的 PoC 目录。</li>
<li><b>ETL 不做幂等</b>：重跑一次数据翻倍。按主键 upsert 或按分区覆盖。</li>
<li><b>合同只做 OCR 不做结构化</b>：一堆文字没法审。要抽条款、金额、期限、违约责任。</li>
<li><b>专项项目只讲模型</b>：面试官更关心你如何处理失败、如何评测、如何控制成本。</li>
</ul>
</div>

## 综合实战

### 实战目标

用 Vibe Coding 的方式，把一个**合同风险审查能力**做成可复用的 Skill，通过 MCP 暴露给 AI 工具，同时提供 HTTP 接口并容器化部署。这条链路把本阶段三个核心能力（任务拆解、Skill 封装、部署上线）串在一起。

### 第 1 步：写项目说明与任务卡

先给 AI 上下文，再让它动手。任务卡里明确“只做条款识别与风险提示，不做法律意见”。

```yaml
# tasks/contract-review.yaml
id: contract-review-skill
goal: 输入合同文本，输出条款清单与风险提示
inputs: { text: string }
outputs:
  clauses: [{ type: string, content: string, page: integer }]
  risks: [{ level: "低|中|高", clause: string, reason: string }]
acceptance:
  - 至少识别 5 类条款
  - 每条风险必须引用原文片段
  - 无风险时返回空数组而不是编造
```

### 第 2 步：实现 Skill

```python
# skills/contract_review.py
import re

CLAUSE_PATTERNS = {
    "付款": r"(付款|支付|结算).{0,80}",
    "违约": r"(违约|赔偿|罚则).{0,80}",
    "期限": r"(期限|有效期|履行期).{0,80}",
    "保密": r"(保密|机密).{0,80}",
    "解除": r"(解除|终止).{0,80}",
}

def extract_clauses(text: str) -> list[dict]:
    """按关键词粗抽条款（简化实现，生产用版面分析 + 条款分类模型）"""
    clauses = []
    for ctype, pattern in CLAUSE_PATTERNS.items():
        for m in re.finditer(pattern, text):
            clauses.append({"type": ctype, "content": m.group(0), "page": 1})
    return clauses

def review(text: str, llm) -> dict:
    clauses = extract_clauses(text)
    if not clauses:
        return {"clauses": [], "risks": [], "note": "未识别到标准条款，请人工复核"}
    prompt = f"""你是合同审查助手。基于下列条款找出风险，只输出 JSON。
每条风险必须引用原文，不确定就不要写。
条款：{clauses}
格式：{{"risks":[{{"level":"低|中|高","clause":"","reason":""}}]}}"""
    return {"clauses": clauses, "risks": llm(prompt)["risks"]}
```

### 第 3 步：注册为 MCP 工具

```python
# mcp_server.py
from mcp.server.fastmcp import FastMCP
from skills.contract_review import review

mcp = FastMCP("contract-review")

@mcp.tool()
def contract_review(text: str) -> dict:
    """审查合同文本，返回条款清单与风险提示。
    当用户上传合同并要求审查、找风险、提取关键条款时调用。"""
    return review(text, llm=lambda p: {"risks": [
        {"level": "中", "clause": "违约金按合同总额 30% 计算",
         "reason": "比例偏高，建议核对行业惯例与上限"}
    ]})   # 真实项目替换为模型调用

if __name__ == "__main__":
    mcp.run()
```

### 第 4 步：提供 HTTP 接口

```python
# server.py
from fastapi import FastAPI
from pydantic import BaseModel
from skills.contract_review import review

app = FastAPI()

class Req(BaseModel):
    text: str

@app.post("/api/contract/review")
def api_review(req: Req):
    if len(req.text) < 50:
        return {"ok": False, "error": "文本过短"}
    return {"ok": True, "data": review(req.text, llm=lambda p: {"risks": []})}
```

### 第 5 步：容器化部署

```text
# Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t contract-skill:1.0.0 .
docker run -d --name contract-skill -p 8000:8000 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY contract-skill:1.0.0
curl -s http://localhost:8000/docs | head -n 5     # 验证服务已起
```

### 第 6 步：验收

用三份合同测试：一份正常、一份缺少违约条款、一份条款表述模糊。正常合同风险应为空；缺条款要提示“未识别到违约条款”；模糊条款要给出“需人工确认”而不是硬判。再在 Claude Code 里通过 MCP 调用一次，确认工具能被发现、参数能被正确传入。

### 解析表

| 步骤 | 关键动作 | 验收信号 |
|-|-|-|
| 任务卡 | 明确输入输出与验收 | AI 不会越界做法律意见 |
| 条款抽取 | 关键词 + 原文定位 | 每条条款能指回原文 |
| 风险审查 | 强制引用原文 | 无依据的风险不出现 |
| MCP 暴露 | tool 描述写调用时机 | AI 工具能自动选中该技能 |
| HTTP 接口 | 入参校验 + 统一返回 | Postman 可直接调用 |
| 容器化 | 镜像可重复构建 | 换机器一条命令起服务 |
| 验收 | 三份合同覆盖正常/缺失/模糊 | 三种结果都符合预期 |

<div class="callout tip"><span class="tag">老师建议</span>
<p>把 Skill 的 <code>version</code> 和镜像 tag 对齐（如 1.0.0），答辩时能清楚说明“这个版本改了什么、怎么回滚”，这比说“我会 Docker”更有说服力。</p>
</div>

## 疑难点分级

| 知识点 | 难度 | 典型卡点 | 破解方式 |
|-|-|-|-|
| 任务拆分 | 高 | 一次需求太大，AI 跑偏 | 拆到“一次只改一个文件或一个函数” |
| 上下文维护 | 高 | 聊着聊着前后矛盾 | PROJECT.md + 每轮复述约束 |
| 代码审查 | 高 | 只看能不能跑 | 重点看边界、异常、权限、SQL |
| Skill 粒度 | 高 | 太粗或太细 | 一个技能对应一个动词 |
| Skill 检索 | 高 | 该用时没选中 | description 写触发场景，加标签与示例 |
| 版本管理 | 中 | 直接改线上无法回滚 | 语义化版本 + 灰度 + changelog |
| MCP 集成 | 高 | 客户端发现不了工具 | 检查协议版本、传输方式与 tool 描述 |
| 接口契约 | 高 | 前后端字段对不上 | 先写 OpenAPI 或示例 JSON，再各自开发 |
| SSE 流式 | 高 | 部署后一次性返回 | 关 Nginx 缓冲 + 放大超时 |
| WebSocket 鉴权 | 高 | 握手无法带 Header | token 放 query 或子协议，服务端校验 |
| 事务与流式冲突 | 高 | 长事务占满连接池 | 流式接口不包事务，写完再提交 |
| 容器化 | 中 | 本地能跑线上不行 | 固定基础镜像、环境变量外置、健康检查 |
| Nginx 配置 | 中 | 刷新子路由 404 | `try_files` 回退 index.html |
| 专项算法取舍 | 高 | 只讲模型不讲成本 | 说明分层策略、误杀控制、评测方法 |
| 沙箱隔离 | 高 | 容器仍能访问宿主 | 断网、只读、非 root、限额 |
| 演示风险 | 中 | 现场网络或额度出问题 | 准备录屏与本地备用数据 |

## 阶段项目

### 项目一：全栈平台（六选一）

**背景**：从美途旅行、好房易租、倾听 FM、云尚课堂、谷德家政、好医在线中选一个，模拟真实企业需求，交付一个可上线的业务系统。以“谷德家政”为例：用户预约保洁、平台派单、服务人员接单、完成后评价。

**功能清单**：

- 用户注册登录、角色区分（用户 / 服务人员 / 管理员）
- 服务列表与详情、按区域与时间筛选
- 预约下单、时段冲突校验、订单状态机
- 派单与接单、实时进度推送
- 在线沟通（WebSocket）
- 评价与服务人员评分
- 管理后台：订单、人员、评价管理

**技术选型**：SpringBoot3 + Spring-AI + MyBatis-Plus + MySQL 8 + Redis 7 + Vue3 + Element-Plus + Pinia + WebSocket + SSE + Maven + Docker Compose + Nginx。

**验收标准**：

| 验收项 | 标准 |
|-|-|
| 主链路 | 注册 → 下单 → 派单 → 接单 → 完成 → 评价全通 |
| 实时性 | 消息 2 秒内到达对端 |
| 权限 | 三种角色越权访问全部被拒 |
| 数据 | 订单状态流转无非法跳转，冲突时段不可重复下单 |
| 部署 | 一条 `docker compose up -d` 可在新机器起全栈 |

**评分点**：业务完整性 25 分，后端设计 20 分，前端体验 15 分，实时通信 15 分，权限与安全 15 分，部署与文档 10 分。

### 项目二：专项 Agent 系统（五选一）

**背景**：从商城风控、万应助手、自动化漏洞挖掘、ETL-Agent、企业合同审批中选一个，做出可演示、可讲清取舍的深度项目。以“商城风控”为例：识别刷单、羊毛党与异常退款。

**功能清单**：

- 行为特征计算（频次、设备、地址、支付）
- 关系网络构建与黑名单传播
- 三阶段思维链风险判定
- 风险分与处置建议（放行 / 人工 / 拦截）
- 人工复核与申诉入口
- 规则与模型效果看板

**技术选型**：Python + LangGraph（三阶段编排）+ Redis（特征缓存）+ PostgreSQL（订单与图数据）+ 规则引擎 + 可选图数据库。

**验收标准**：

| 验收项 | 标准 |
|-|-|
| 识别效果 | 标注样本召回率不低于 80%，误杀率低于 5% |
| 可解释 | 每条高风险结论有支持与反对理由 |
| 成本 | 只有疑难样本调用大模型，调用占比低于 20% |
| 可运营 | 有人工复核与申诉闭环 |
| 可复现 | 同一订单两次判定结果一致 |

**评分点**：特征与图设计 25 分，三阶段编排 25 分，可解释性 20 分，成本控制 15 分，运营闭环 15 分。

## 常见面试题

### 问题 1：Vibe Coding 和“让 AI 写代码”有什么区别？

要点：Vibe Coding 是一套工作法：给上下文、拆小任务、契约先行、每步验证、小步提交、人工审查。让 AI 写代码只是其中一个动作。区别在于可控性——前者出问题能定位、能回滚，后者只能推倒重来。

### 问题 2：怎么保证 AI 生成的代码质量？

要点：四道关。第一，给足上下文与规范，减少跑偏；第二，任务拆小，一次改动可审查；第三，先写测试或验收条件，让结果可验证；第四，人工看 diff，重点查边界、异常、权限与 SQL。最后用 CI 做静态检查与测试兜底。

### 问题 3：AI 老是忘记项目规范怎么办？

要点：把规范写进 PROJECT.md / AGENTS.md，每次新会话先让它读；关键约束在每轮对话里复述一遍；用目录结构与示例代码“示范”而不是“描述”；把规范做成 lint 规则，让机器强制而不是靠模型自觉。

### 问题 4：Skill 和普通函数、和 MCP 工具是什么关系？

要点：Skill 是能力单元，强调可发现、可复用、有版本；普通函数是实现细节；MCP 工具是 Skill 的一种对外暴露方式。一个 Skill 可以有多种暴露形式（内部函数、HTTP 接口、MCP tool），核心是同一份契约与实现。

### 问题 5：Skill 的 description 怎么写才好用？

要点：写“什么时候用、解决什么问题、输入输出是什么、有什么限制”，并给 1–2 个触发示例。避免只写功能名。描述是检索与选择的唯一依据，写得含糊，实现再好也不会被选中。

### 问题 6：Skill 为什么要版本管理？

要点：技能会被多个 Agent 和业务流程依赖，直接改线上会导致不可预期的行为变化；有版本才能灰度、对比、回滚。实践上用语义化版本，配套 changelog、灰度比例与回滚开关。

### 问题 7：MCP 的 tools、resources、prompts 分别是什么？

要点：tools 是可调用的函数，有参数与返回；resources 是可读取的数据（文件、记录），通常只读；prompts 是预置的提示模板，供用户或客户端复用。三者解决“能做什么、能读什么、怎么问”三类需求。

### 问题 8：SpringBoot 里做流式输出有哪些方式？

要点：`SseEmitter` 适合服务端单向推送；`ResponseBodyEmitter` 更通用；WebFlux 的 `Flux<ServerSentEvent>` 适合响应式栈；WebSocket 适合双向。关键点都是异步执行、设置超时、处理客户端断开，并在 Nginx 关闭缓冲。

### 问题 9：SSE 和 WebSocket 在全栈项目里怎么分工？

要点：进度、日志、模型 token 这类单向推送用 SSE，实现简单、过网关容易；在线聊天、协同编辑这类双向交互用 WebSocket。两者可以共存，按场景选，不要为了统一而强行用一种。

### 问题 10：前后端联调最常见的冲突是什么？怎么避免？

要点：字段命名、类型、空值语义、错误码、分页结构、时间格式。避免方式只有一个：先定契约（OpenAPI 或示例 JSON），双方按契约开发，联调时用契约做对照测试。

### 问题 11：专项项目里，你怎么证明方案有效？

要点：要有评测集与指标。风控看召回率、误杀率、人工复核量；Text-to-SQL 看执行准确率与危险 SQL 拦截率；漏洞挖掘看复现率与误报率；ETL 看数据一致性与失败恢复时间。没有指标，优化都是自我感觉。

### 问题 12：部署上线前你会检查什么？

要点：环境变量是否齐全、密钥是否外置、数据库连接池与超时、健康检查、日志级别、Nginx 缓冲与超时、静态资源缓存、端口与防火墙、备份与回滚方案。最后按验收清单完整走一遍主链路。

## 动手练习

<div class="callout task"><span class="tag">动手练习</span><ol>
<li>用 Cursor、Claude Code、Codex 各完成同一个“新增分页查询接口”的任务，记录耗时与返工次数。</li>
<li>为你的项目写一份 PROJECT.md，包含技术栈、目录约定、编码规范与常用命令。</li>
<li>把一个模糊需求拆成 3 张任务卡，每张都要有 scope、out_of_scope 与验收条件。</li>
<li>让 AI 先写接口契约与失败测试，再写实现，观察返工率是否下降。</li>
<li>故意让 AI 改一次测试，体验“实现方改验收标准”的风险，并写进团队规范。</li>
<li>封装一个真实 Skill（如库存查询），写全 description、inputs、permissions 与 changelog。</li>
<li>把 Skill 注册成 MCP 工具，在 AI 工具里验证它能被自动选中。</li>
<li>给 Skill 做两个版本，用配置切换灰度，验证能回滚。</li>
<li>在 SpringBoot 里实现 SSE 流式接口，用 curl 验证逐条输出。</li>
<li>把 SSE 部署到 Nginx 后面，故意不关缓冲，观察现象后再修复。</li>
<li>实现 WebSocket 聊天，握手时带 token 做鉴权，测试无 token 是否被拒。</li>
<li>写一份 docker-compose，把前端、后端、MySQL、Redis、Nginx 全部拉起。</li>
<li>选一个专项方向，实现最小可演示版本，并准备 10 条评测样本。</li>
<li>做一次故障演练：停掉 Redis，观察系统是否有降级而不是整体崩溃。</li>
</ol></div>

## 阶段小结

- Vibe Coding 的核心是拆任务与审代码，不是“让 AI 全写完”。
- 上下文靠 PROJECT.md 与任务卡维持，规范要写成可执行的约束。
- 先定接口契约再开发，是降低联调成本最有效的手段。
- Skill 要有名字、场景描述、契约、权限与版本；description 决定它会不会被选中。
- MCP 让能力一次适配、多端可用；工具描述同样要写“什么时候用”。
- 全栈交付的关键链路是：契约 → 后端 → 前端 → 联调 → 容器化 → 反代 → 验收。
- SSE 与 WebSocket 按单向/双向分工，Nginx 缓冲与超时是两个必查项。
- 专项项目要讲清算法、成本、误杀控制与评测，而不是只讲模型多强。

下一阶段进入就业冲刺：把这一路做过的项目与技术点整理成能讲、能写、能扛住追问的表达体系，转化为 offer。
