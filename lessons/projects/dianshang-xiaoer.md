# 电商小二：多智能体客服项目

> 素材出处（本机文件）：
> - `D:\pyhton\资料\01-电商小二-项目概述.md`
> - `D:\pyhton\资料\02-电商小二-项目开发-准备工作.md`
> - `D:\pyhton\资料\03-电商小二-DialogueService实现.md`
> - `D:\pyhton\资料\04-电商小二-DialogueState设计与定义.md`
> - `D:\pyhton\资料\05-电商小二-DialogueStateRepository实现.md`
> - `D:\pyhton\资料\06-电商小二-DialogueEngine设计.md`、`D:\pyhton\资料\12-电商小二-DialogueEngine实现.md`
> - `D:\pyhton\资料\07-电商小二-TaskHandler实现.md`
> - `D:\pyhton\资料\08-电商小二-KnowledgeHandler实现.md`
> - `D:\pyhton\资料\09-电商小二-ChitchatHandler实现.md`
> - `D:\pyhton\资料\10-电商小二-Planning模块实现.md`
> - `D:\pyhton\资料\11-电商小二-ClarifyResponder实现.md`
> - `D:\pyhton\资料\13-电商小二-FastAPI接口与应用生命周期.md`
> - `D:\pyhton\资料\附录-电商小二-自定义Action实现.md`
> - `D:\pyhton\资料\电商小二的面试指南.md`

## 1. 项目定位：LLM 只做规划，后端负责约束

电商小二是一个智能客服系统，核心设计原则一句话：

> **LLM 负责理解与生成，后端代码负责约束与执行。**

它把一轮对话分成三条互斥轨道：

| 轨道 | 处理者 | 适用场景 |
|---|---|---|
| task | TaskHandler | 有明确业务流程的任务，如查订单、退换货 |
| knowledge | KnowledgeHandler | 商品/政策等知识咨询 |
| chitchat | ChitchatHandler | 闲聊、兜底 |

单轮只允许一个轨道；LLM 输出的意图必须落在白名单内，越界就转澄清。

## 2. 分层架构

| 层 | 代表类 | 职责 | 边界 |
|---|---|---|---|
| 接口层 | `chat_router`、`dependencies`、`lifespan` | HTTP 解析、模型转换、依赖注入、资源启停 | 不写业务 |
| 服务层 | `DialogueService` | load_state → 调引擎 → save_state | 不碰状态内部 |
| 引擎层 | `DialogueEngine` | 建 Session/Turn、规划+校验、分流、汇总 | 不读写数据库 |
| 规划层 | `TurnPlanner`、`TurnPlanValidator` | LLM 产出 TurnPlan；确定性规则校验 | 校验器不改状态、不出话术 |
| 处理器层 | `TaskHandler`、`KnowledgeHandler`、`ChitchatHandler`、`ClarifyResponder` | 各轨道处理，统一返回 `list[BotMessage]` | 不提交 Turn |
| 状态层 | `DialogueState`、`DialogueStateRepository` | 内存聚合根 / JSON 持久化 | Repository 无业务 |
| 任务子层 | `CommandProcessor`、`FlowExecutor`、`ActionRegistry` | 改任务状态 / 推进一步 / 调业务 Action | Action 不直接回话 |

调用链：

```
API → DialogueService → Repository.load → DialogueEngine → TurnPlanner
    → Validator → (Task|Knowledge|Chitchat|Clarify) → Repository.save → API
```

`build_dialogue_engine()` 在应用启动时自底向上装配一次，全进程共享；Session、Repository、Service 每个请求一份。

## 3. 状态设计：一个用户一条 JSON

`DialogueState` 是聚合根，分 `shared` 与 `tasks` 两部分：

```python
@dataclass
class DialogueState:
    sender_id: str
    shared: SharedState = field(default_factory=lambda: SharedState())
    tasks: TaskState = field(default_factory=lambda: TaskState())

@dataclass
class SharedState:
    focused_object: FocusedObject | None = None
    sessions: list[Session] = field(default_factory=list)
```

任务侧：

```python
@dataclass
class TaskState:
    active: TaskInstance | None = None
    paused: list[TaskInstance] = field(default_factory=list)

@dataclass
class TaskInstance:
    flow_id: str
    step_id: str | None = None
    slots: dict[str, Any] = field(default_factory=dict)
    task_id: str = field(default_factory=lambda: str(uuid.uuid4()))
```

设计要点：

- `shared` 三轨共用：聚焦对象 + 历史会话；
- `tasks` 是任务栈：`active` 当前任务，`paused` 是被顶替的任务（LIFO）；
- `slots` 挂在任务实例上，不同任务之间槽位天然隔离；
- `task_id` 区分同一个 flow 的不同执行，恢复任务时按它找回。

持久化用 Pydantic 的 `TypeAdapter` 整份序列化，MySQL 一条记录一个用户：

```python
DIALOGUE_STATE_ADAPTER = TypeAdapter(DialogueState)

async def load_state(self, sender_id: str) -> DialogueState:
    statement = select(DialogueStateRecord).where(
        DialogueStateRecord.sender_id == sender_id)
    record = (await self.session.execute(statement)).scalar_one_or_none()
    if record is None:
        return DialogueState(sender_id=sender_id)
    return DIALOGUE_STATE_ADAPTER.validate_json(record.state_json)

async def save_state(self, state: DialogueState) -> None:
    state_json = DIALOGUE_STATE_ADAPTER.dump_json(state).decode("utf-8")
    statement = insert(DialogueStateRecord).values(
        sender_id=state.sender_id, state_json=state_json)
    statement = statement.on_duplicate_key_update(
        state_json=statement.inserted.state_json)
    await self.session.execute(statement)
    await self.session.commit()
```

表结构：`dialogue_states(sender_id PK, state_json TEXT)`。`on_duplicate_key_update` 让新老用户共用一条保存路径。

## 4. 引擎：规划 → 校验 → 分流

```python
async def _handle_text_message(self, state, user_message):
    turn_plan = await self.turn_planner.predict(
        state, user_message, self.task_handler.flows,
        self.knowledge_handler.knowledge_intents)
    validation = self.turn_plan_validator.validate(
        turn_plan, state=state, flows=self.task_handler.flows,
        knowledge_intents=(self.knowledge_handler.knowledge_intents))
    if not validation.valid:
        return await self.clarify_responder.respond(
            state=state, user_message=user_message, reason=validation.reason)
    if turn_plan.task is not None:
        return await self.task_handler.handle(
            commands=turn_plan.task.commands, state=state,
            user_message=user_message)
    elif turn_plan.knowledge is not None:
        if state.tasks.active:
            state.tasks.suspend_active()
        return await self.knowledge_handler.handle(
            state=state, user_message=user_message,
            intents=turn_plan.knowledge.intents)
    if state.tasks.active:  # 剩余唯一方向为 chitchat
        state.tasks.suspend_active()
    return await self.chitchat_handler.handle(
        state=state, user_message=user_message)
```

注意：

- 这里没有 LangGraph 图对象，路由是命令式 `if/elif`；
- 进入 knowledge / chitchat 前先 `suspend_active()`，任务被暂停而不是丢弃；
- 对象消息（用户直接点商品卡片）走 `_object_slot_command`，命中则生成 `SetSlotsCommand`，否则转澄清。

会话保活：`_prepare_session` 判断距上次活动是否超过 1 小时，超时关闭旧会话、清理运行态再新建。

## 5. Planning 与校验：把不确定性关进笼子

`TurnPlanner` 用提示词 + `JsonOutputParser` 产出 `TurnPlan`：

```python
async def predict(self, state, user_message, flows, knowledge_intents) -> TurnPlan:
    prompt_inputs = self._build_prompt_inputs(
        state, user_message, flows, knowledge_intents)
    return await self._predict_from_prompt_inputs(prompt_inputs)
```

校验器只做确定性检查：

```python
def validate(self, turn_plan, state, flows, knowledge_intents):
    active_tracks = self._active_tracks(turn_plan)
    if not active_tracks:
        return self._reject(ClarifyReason.MISSING_TRACK)
    if len(active_tracks) > 1:
        return self._reject(ClarifyReason.MULTIPLE_TRACKS)
    track = active_tracks[0]
    if track == "task":
        return self._validate_task(turn_plan, state, flows)
    if track == "knowledge":
        return self._validate_knowledge(turn_plan, state, knowledge_intents)
    return TurnPlanValidationResult(valid=True)
```

任务轨道用 `<new-task-N>` 临时 id 按顺序模拟 Command：flow 必须存在、`resume_task` 的任务必须在 `paused`、`set_slots` 必须有 active 任务。知识轨道校验 intent 存在，且 `requires_object` 与 `focused_object.type` 匹配。

## 6. TaskHandler：Command 状态机 + YAML 流程

TaskHandler 不识别意图，只执行白名单 Command：

```python
async def handle(self, commands, state, user_message) -> list[BotMessage]:
    events = self.command_processor.run(commands, state, self.flows)
    messages = self.lifecycle_responder.respond(events)
    messages.extend(await self.flow_executor.run_task(
        state, self.flows, user_message))
    return messages
```

`start_flow` 分支会创建 `TaskInstance` 并调用 `TaskState.start`：

```python
def start(self, task: TaskInstance) -> TaskEvent:
    if self.active is None:
        self.active = task
        return TaskStarted(task=task.to_ref())
    previous = self.active
    self.paused.append(previous)
    self.active = task
    return TaskSwitched(previous=previous.to_ref(), current=task.to_ref())
```

`FlowExecutor` 按步骤类型循环推进，`max_steps_per_turn` 默认 100 防死循环：

```python
for _ in range(self.max_steps_per_turn):
    task = state.tasks.active
    if task is None:
        return messages
    flow = flows.get_flow(task.flow_id)
    step = flow.get_step(task.step_id)
    if isinstance(step, StartFlowStep):
        self._advance(step, state); continue
    if isinstance(step, CollectSlotStep):
        should_wait = await self._run_collect_step(
            step, state, messages, user_message)
        if should_wait:
            return messages
        continue
    if isinstance(step, EndFlowStep):
        state.tasks.complete_active(); return messages
```

缺槽位或校验失败时出话术并等待用户；成功则 `_advance` 根据 `Step.next`（StaticLink / ConditionalLink / FallbackLink）改写 `step_id`。

## 7. 三个处理器与澄清

- **KnowledgeHandler**：按 intent 找到 `provider_ids`，去重后 `asyncio.gather` 并发检索，再交给 KnowledgeResponder 组织答案；
- **ChitchatHandler**：历史 + 当前句直接交给 LLM，不查业务数据；
- **ClarifyResponder**：先按 `ClarifyReason` 取固定话术，再让 LLM 只做自然化改写：

```python
if reason is ClarifyReason.MULTIPLE_TRACKS:
    return ("你这次同时提到了多个方向。我们先处理一个，"
            "你想先办业务还是先咨询信息呢？")
if reason is ClarifyReason.MISSING_FOCUSED_OBJECT:
    return "请先发送你想咨询的对象，我再继续帮你看。"
```

关键点：**澄清目标由代码决定，LLM 只负责措辞**。

## 8. FastAPI 接口与生命周期

```python
async def lifespan(app: FastAPI):
    init_http_client(); init_dialogue_engine(); init_db_engine()
    yield
    await close_db_engine(); await close_http_client()

async def get_db():
    async with database.session_factory() as session:
        yield session

@chat_router.post("/api/chat")
async def chat(chat_request: ChatRequest,
               dialogue_service=Depends(get_dialogue_service)) -> ChatResponse:
    user_message = _build_user_message(chat_request)
    process_result = await dialogue_service.process_message(user_message)
    return _build_chat_response(process_result)
```

`GET /api/chat/history` 只读状态、不调引擎、不回写；按 sessions→turns 展平，每轮先 user 再若干 bot。

## 9. 自定义 Action：业务接口与话术解耦

```python
class Action(ABC):
    name: str
    @abstractmethod
    async def run(self, state: DialogueState,
                  action_kwargs: dict[str, Any]) -> ActionResult:
        pass

class LookupOrderStatusAction(Action):
    name = "action_lookup_order_status"
    async def run(self, state, action_kwargs) -> ActionResult:
        order_number = state.tasks.active.slots.get("order_number")
        url = f"{settings.commerce_api_base_url}/orders/{order_number}"
        payload = (await get_http_client().get(url)).json()["data"]
        return ActionResult(slot_updates={
            "order_status": payload.get("status_desc")
                            or payload.get("status") or "未知",
            "order_summary": f"订单金额 ¥{payload['amount']}。",
        })
```

注册由包扫描完成：`register_custom_actions` 遍历 `atguigu.task.action.custom` 下的模块，把所有 `Action` 子类实例注册进 `ActionRegistry`。新增 Action 只需放文件，不改构建代码。

调用链：YAML `type: action` + `action: <name>` → FlowExecutor 构造 `ActionCall` → `ActionRunner` 从注册表取实例 → `run()` → `slot_updates` 写回 `state.tasks.active.slots` → 下一步渲染话术。

## 10. 一次请求的完整链路

1. `POST /api/chat` → Pydantic 校验 → `_build_user_message`（有 text 即 TEXT，否则 OBJECT）；
2. `DialogueService.process_message`：`load_state`，无记录则新建；
3. `DialogueEngine`：`_prepare_session`（新建/沿用/超 1 小时重建）→ 创建 Turn；
4. TEXT：`TurnPlanner.predict` → `TurnPlanValidator.validate`；失败 → ClarifyResponder 直接返回；
5. 通过 → TaskHandler（Command→事件→提示→FlowExecutor）或 KnowledgeHandler 或 ChitchatHandler；
6. OBJECT：写 `focused_object` → 匹配当前 collect slot → `SetSlotsCommand`，否则澄清；
7. 回复写入 Turn → `append_turn` → 返回 ProcessResult；
8. Service `save_state`（TypeAdapter → JSON → upsert）→ Router 转 `ChatResponse`。

## 11. 面试高频问题

1. 为什么不让 LLM 直接回最终答案？→ 业务不可信模型，三层防护：Validator、Command 白名单、FlowExecutor；
2. Command 状态机与传统状态机的区别？→ 意图由 LLM 表达，状态变更由后端白名单命令执行；
3. 任务中断后怎么恢复？→ 新任务顶替时旧任务进 `paused`，`resume_task` 按 `task_id` 取回；
4. 为什么任务栈是 LIFO？→ 用户习惯先处理新问题再回到刚才的；
5. 对象消息有什么价值？→ 卡片直接填槽，减少手输和抽取错误；
6. 查询 Action 为什么只写槽位不回话？→ 查询与表达解耦，结果可复用不同话术、易测试；
7. JSON 整体存储的优缺点？→ 恢复简单，但难按 turn 查询、整份更新；需限制 Session 数与 turn 数；
8. 如何降低幻觉？→ 单轨道、flow/intent 白名单、对象校验、失败转澄清；
9. 为什么这里不用 LangGraph？→ 任务是线性 SOP，YAML 可读可配；LangGraph 更适合并行、循环、多路检索；
10. 还能怎么优化？→ 去掉 `eval`、YAML 做 Pydantic 校验、执行 trace、真实 RAG 重排、SSE。

## 12. 讲义口径提醒

1. 字段路径：正文是 `state.tasks.active.slots`，附录 Action 写成 `state.task_state.active.slots`，后者不存在，按 04 章为准；
2. 面试指南里的状态结构（`active_task` / `paused_tasks` / `current_session_id`）与正文实现不同，教材以正文 `shared + tasks` 为准；
3. 指南的方法名 `handle_message`、`ChitchatHandler` 与正文 `process_message`、`ChitchatHandler` 拼写不一致；
4. 指南讨论的 `ActionResult.messages` 在讲义实现里只有 `slot_updates`；
5. 本项目是“轨道分流 + 处理器”，不是 LangGraph 多智能体图，讲“多智能体”时要说明这一区别。

## 13. 练习与验收标准

### 练习 1：实现三轨路由与澄清

用最小的假数据实现 `DialogueEngine._handle_text_message`：给定 TurnPlan，正确分发到 task / knowledge / chitchat；同时提到两类意图时走澄清。

**验收标准**

- 只命中 task 时调用 TaskHandler，且不触发 `suspend_active`；
- 命中 knowledge 且存在 active 任务时，先暂停再处理；
- 没有任何轨道时返回澄清话术，不调用 LLM 生成答案；
- 同时命中两条轨道时返回 `MULTIPLE_TRACKS` 对应话术；
- 能打印每次分流的轨道名与是否暂停了任务。

### 练习 2：给任务栈加“恢复任务”

在 `TaskState` 上实现 `suspend_active()`、`resume(task_id)`、`complete_active()`，并接入 `resume_task` 命令。

**验收标准**

- 新任务开始时，原 active 进入 paused 末尾；
- `resume` 按 `task_id` 从 paused 取出并设为 active，其余任务顺序不变；
- 恢复不存在的 `task_id` 返回失败事件，不修改状态；
- 完成当前任务后 active 为 `None`，paused 不自动恢复；
- 打印每次操作前后的 `active.flow_id/step_id` 与 paused 列表，能手工核对。

### 练习 3：新增一个自定义 Action

仿照 `LookupOrderStatusAction`，实现 `action_lookup_logistics`：从 active 任务槽位取 `order_number`，调用物流接口，把 `logistics_status` 写回槽位。

**验收标准**

- Action 类放在 `custom` 包下即可被 `register_custom_actions` 自动注册，无需改构建代码；
- YAML 中 `type: action`、`action: action_lookup_logistics` 能命中并执行；
- 接口失败时返回可渲染的错误槽位或抛出被 FlowExecutor 捕获的异常，不把异常直接透给用户；
- 执行后 `state.tasks.active.slots["logistics_status"]` 有值，下一步话术能引用。
