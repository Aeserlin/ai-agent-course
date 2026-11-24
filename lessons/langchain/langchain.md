## 尚硅谷大模型技术之LangChain

（作者：尚硅谷研究院）

版本：V1.0.2

## LangChain概述

### 大模型与大语言模型

大模型（Large Model，也称基础模型，即 Foundation Model），是指具有大量参数和复杂结构的机器学习模型，能够处理海量数据、完成各种复杂的任务，如自然语言处理、计算机视觉、语音识别等。

大语言模型（Large Language Model）通常是具有大规模参数和计算能力的自然语言处理模型，例如 OpenAI的GPT-5 模型。这些模型通过大量的数据和参数进行训练，以生成人类类似的文本或回答自然语言的问题。大语言模型在自然语言处理、文本生成和智能对话等领域有广泛应用。

### 大模型相关岗位介绍

![image1](assets/lessons-langchain/image1.webp)

应用开发是大模型最值得关注的方向，学习LangChain框架，高效开发大模型应用。

### LangChain介绍

#### 什么是 LangChain

github地址：https://github.com/langchain-ai/langchain

官网地址：https://www.langchain.com/langchain

官方文档：https://docs.langchain.com/oss/python/langchain/overview

API 文档：https://reference.langchain.com/python/langchain/

LangChain是2022年10月，由哈佛大学的Harrison Chase（哈里森·蔡斯）发起研发的一个开源框架，用于开发由大语言模型（LLMs）驱动的应用程序。

比如，搭建 Agent、问答系统（QA）、对话机器人、文档搜索系统等。

LangChain的发布比ChatGPT问世还要早一个月，从这个启动日期也可以看出创始人的眼光，占了先机的它迅速获得广泛关注和支持！

LangChain在Github上的热度变化：

![image2](assets/lessons-langchain/image2.webp)

简单概括：

LangChain ≠ LLMs。LangChain 之于 LLMs，类似 Spring 之于 Java，Django 之于 Python。

顾名思义，LangChain中的“Lang”是指language，即大语言模型，“Chain”即“链”，也就是将大模型与外部数据&各种组件连接成链，以此构建AI应用程序。

#### 有哪些大模型应用开发框架

| 框架 | 描述 |
| --- | --- |
| LangChain （Python） | 出现最早、最成熟的，适合复杂任务分解和单Agent应用 |
| LlamaIndex （Python） | 专注于高效的索引和检索，适合 RAG 场景 |
| LangChain4J （Java） | LangChain出了Java、JavaScript（LangChain.js）两个语言的版本，LangChain4j的功能略少于LangChain，但是主要的核心功能都是有的 |
| SpringAI / SpringAI Alibaba （Java） | 有待进一步成熟，只是简单的对于一些接口进行了封装 |
| SemanticKernel （C#） | 微软推出的，对于C#同学来说，那就是5颗星 |

#### 为什么需要 LangChain

##### 问题1：LLMs用的好好的，为什么还需要LangChain？

在大语言模型（LLM）如 ChatGPT、Claude、DeepSeek 等快速发展的今天，开发者不仅希望能“使用”这些模型，还希望能将它们灵活集成到自己的应用中，实现更强大的对话能力、检索增强生成（RAG）、工具调用（Tool Calling）、多轮推理等功能。

![image3](assets/lessons-langchain/image3.webp)

##### 问题2：我们可以使用GPT 或GLM4 等模型的API进行开发，为何需要LangChain这样的框架？

不使用LangChain，确实可以使用GPT 或GLM4 等模型的API进行开发。比如，搭建Agent、问答系统（QA）、对话机器人、文档搜索系统等复杂的 LLM 应用。

但使用LangChain的好处：

- 简化开发难度：更简单、更高效、效果更好。

- 开发人员可以更专注于业务逻辑，而无须花费大量时间和精力处理底层技术细节。

- 学习成本更低：不同模型的API不同，调用方式也有区别，切换模型时学习成本高。使用LangChain，可以以统一、规范的方式进行调用，有更好的移植性。

- 现成的链式组装：LangChain提供了一些现成的链式组装，用于完成特定的高级任务。让复杂的逻辑变得结构化、易组合、易扩展。

![image4](assets/lessons-langchain/image4.webp)

##### 问题3：LangChain提供了哪些功能？

LangChain 是一个帮助你构建 LLM 应用的全套工具集。这里涉及到prompt 构建、LLM 接入、记忆管理、工具调用、RAG、Agent开发等模块。

学习 LangChain 最好的方式就是做项目。

#### LangChain 使用场景

| 项目场景 | 技术点 |
| --- | --- |
| 文档问答助手 | Prompt + Embedding + RetrievalQA |
| 智能日程规划助手 | Agent + Tool + Memory |
| LLM+数据库问答 | SQLDatabaseToolkit + Agent |
| 多模型路由对话系统 | RouterChain + 多 LLM |
| 互联网智能客服 | ConversationChain + RAG +Agent |
| 企业知识库助手（RAG + 本地模型） | VectorDB + LLM + Streamlit |

比如：医院智能助手

![image5](assets/lessons-langchain/image5.webp)

比如：万象知识库

![image6](assets/lessons-langchain/image6.webp)

比如：京东助手

![image7](assets/lessons-langchain/image7.webp)

#### LangChain 生态位置

![image8](assets/lessons-langchain/image8.webp)

- 项目类型1：文档问答助手

案例：企业使用 LangChain 加载内部文档（如员工手册、产品说明），结合向量存储实现语义搜索，回答员工或客户的问题。

示例：新员工入职培训中，销售岗位有哪些注意事项呢？检索相关手册并生成自然语言回答。

场景：基于私有或外部数据构建问答系统。

- 项目类型2：智能助理开发

案例：LangChain 的 Agent 模块（如 ReAct Agent）结合工具，完成任务。

示例1：用户请求调用天气 API、计算器和日历，规划户外旅游活动。

示例2：结合使用Google Search、Firecrawl网页爬取工具，实现“分析某股票趋势并生成报告”的任务。

场景：构建自主决策的Agent，执行复杂任务。

- 项目类型3：对话聊天机器人

案例：电商平台使用 LangChain 的 ConversationChain，结合 ConversationBufferMemory，记录用户历史对话，提供个性化客服。

示例：用户问“推荐一款跑鞋”，机器人根据之前提到的偏好（如“喜欢轻量鞋”）推荐合适产品。

场景：开发上下文感知的聊天机器人，支持多轮对话。

- 项目类型4：数据分析与洞察生成

案例：金融分析师使用 LangChain 加载 CSV 数据，结合 LLM 分析销售趋势，生成自然语言报告。

示例：从销售数据中提取“哪些产品在特定地区销量最高”并生成可视化描述。

场景：处理结构化或非结构化数据，生成报告或洞察。

- 项目类型5：多模态应用

案例：平台使用 LangChain 结合 CLIP 模型，分析产品图片、视频等，生成高质量回复。

示例1：教育平台分析教学视频和讲义，生成互动式学习内容。

示例2：零售平台结合产品图片和描述，回答“哪些产品适合户外使用？”。

场景：结合文本、图像、语音等多模态数据。

- 项目类型6：教育与学习助手

案例：在线教育平台使用 LangChain 构建数学助手，结合 Wolfram Alpha 工具解答复杂公式。

示例：学生提问“积分的定义”，LangChain 检索教材并生成逐步讲解。

场景：开发个性化教育工具，支持学习和练习。

- 项目类型7：自动化工作流

案例：营销团队使用 LangChain 整合市场数据，自动生成社交媒体帖子。

示例：从 CRM 数据生成客户跟进邮件，结合日历安排发送时间。

场景：自动化复杂业务流程，如报告生成、任务调度。

- 项目类型8：研究与创新

案例：研究者使用 LangChain 分析文献，结合知识图谱提取跨领域的概念关系。

示例：从气候变化文献中提取关键趋势，生成研究报告。

场景：支持学术或行业研究，挖掘数据关联。

#### LangChain 架构

##### 总体架构

![image9](assets/lessons-langchain/image9.webp)

- LangChain 帮助快速开始构建 Agent ，支持选择的任何模型提供商。

- LangGraph 允许通过低级编排、记忆和人工参与支持来控制自定义 Agent 的每一步。可以管理具有持久执行能力的长时间运行任务。

- LangSmith 是一个帮助 AI 团队使用实时生产数据进行持续测试和改进的平台。提供观测、评估与部署功能。

- Deep Agents 用于构建能够规划、使用子 Agent 并利用文件系统处理复杂任务的 Agent，受 Claude Code、Deep Research 和 Manus 等应用的启发。

##### LangChain 架构

![image10](assets/lessons-langchain/image10.webp)

| 包 | 描述 |
| --- | --- |
| langchain | 包含构建使用 LLM 的应用所需的所有实现的主入口点 |
| langchain-core | LangChain 生态系统中的核心接口和抽象 |
| langchain-text-splitters | 用于文档处理的文本分割工具 |
| langchain-mcp-adapters | 在 LangChain 和 LangGraph 应用中提供 MCP 工具 |
| langchain-tests | 用于验证 LangChain 集成包实现的标准化测试套件 |
| langchain-classic | 遗留的 langchain 实现和组件 |

### 开发架构与开发场景介绍

#### RAG开发

##### 背景

大模型的知识冻结：随着 LLM 规模扩大，训练成本与周期相应增加，模型无法实时学习到最新的信息或动态变化。导致 LLM 难以应对诸如“请推荐现在的热门影片”等时间敏感的问题。

大模型幻觉：涉及到大模型从未在训练过程中学习过的信息时，大模型无法给出准确的答复，转而开始臆想和编造答案。

##### RAG举例

LLM在考试的时候面对陌生的领域，答复能力有限，然后就准备放飞自我了，而此时RAG给了一些提示和参考，让LLM根据参考回答，最终考试的正确率从60%到了90%！

![image11](assets/lessons-langchain/image11.webp)

#### Agent开发

充分利用 LLM 的推理决策能力，通过增加规划、记忆和工具调用的能力，构造一个能够独立思考、逐步完成给定目标的Agent。

![image12](assets/lessons-langchain/image12.webp)

OpenAI的元老翁丽莲(Lilian Weng)于2023年6月在个人博客（https://lilianweng.github.io/posts/2023-06-23-agent/）首次提出了现代AI Agent架构。

![image13](assets/lessons-langchain/image13.webp)

一个数学公式来表示：

Agent = LLM + Memory + Tools + Planning + Action

比如，打车到西藏玩。

大脑中枢：规划行程的你

规划：步骤1：规划打车路线，步骤2：订饭店、酒店，。。。

调用工具：调用MCP或FunctionCalling等API，滴滴打车、携程、美团订酒店饭店

记忆能力：沟通时，要知道上下文。比如订酒店得知道是西藏路上的酒店，不能聊着聊着忘了最初的目的。

能够执行上述操作。说走就走，不能纸上谈兵。

Agent核心要素被细化为以下模块：

##### 大模型（LLM）作为“大脑”

提供推理、规划和知识理解能力，是AI Agent的决策中枢。

大脑主要由一个大型语言模型 LLM 组成，承担着信息处理和决策等功能， 并可以呈现推理和规划的过程，能很好地应对未知任务。

##### 记忆（Memory）

Agent 像人类一样，能留存学到的知识以及交互习惯等，这样的机制能让 Agent 在处理重复工作时调用以前的经验，从而避免用户进行大量重复交互。

- 短期记忆：存储单次对话周期的上下文信息，属于临时信息存储机制。受限于模型的上下文窗口长度。

- 长期记忆：可以横跨多个任务或时间周期，可存储并调用核心知识，非即时任务。长期记忆可以通过模型参数微调（固化知识）、知识图谱（结构化语义网络）或向量数据库（相似性检索）方式实现。

以人作类比：

- 短期记忆：在进行心算时临时记住几个数字

- 长期记忆：学会骑自行车后，多年后再次骑起来时仍能掌握这项技能

##### 工具使用（Tool Use）：调用外部工具（如API、数据库）扩展能力边界。

![image14](assets/lessons-langchain/image14.webp)

##### 规划决策（Planning）：通过任务分解、反思与自省框架实现复杂任务处理。

例如，利用思维链（Chain of Thought）将目标拆解为子任务，并通过反馈优化策略。

![image15](assets/lessons-langchain/image15.webp)

![image16](assets/lessons-langchain/image16.webp)

##### 行动（Action）：实际执行决策的模块，涵盖软件接口操作（如自动订票）和物理交互（如机器人执行搬运）。

Agent 会形成完整的计划流程。例如先读取以前工作的经验和记忆，之后规划子目标并使用相应工具去处理问题，最后输出给用户并完成反思。

#### 大模型应用开发的4个场景

##### 场景1：纯 Prompt

Prompt是操作大模型的唯一接口

当人看：你说一句，ta回一句，你再说一句，ta再回一句…

![image17](assets/lessons-langchain/image17.webp)

##### 场景2：Agent + Function Calling

Agent：AI 主动提要求

Function Calling：需要对接外部系统时，AI 要求执行某个函数

当人看：你问 ta「我明天去杭州出差，要带伞吗？」，ta 让你先看天气预报，你看了告诉ta，ta 再告诉你要不要带伞

![image18](assets/lessons-langchain/image18.webp)

##### 场景3：RAG (Retrieval-Augmented Generation)

RAG：需要补充领域知识时使用

Embeddings：把文字转换为更易于相似度计算的编码。这种编码叫向量

向量数据库：把向量存起来，方便查找

向量搜索：根据输入向量，找到最相似的向量

举例：考试答题时，到书上找相关内容，再结合题目组成答案

![image19](assets/lessons-langchain/image19.webp)

这个在智能客服上用的最广泛。

##### 场景4：Fine-tuning(精调/微调)

举例：努力学习考试内容，长期记住，活学活用。

![image20](assets/lessons-langchain/image20.webp)

特点：成本最高；在前面的方式解决不了问题的情况下，再使用。

##### 如何选择

面对一个需求，如何开始，如何选择技术方案？下面是个常用思路：

![image21](assets/lessons-langchain/image21.webp)

注意：其中最容易被忽略的，是准备测试数据。

后面我们重点介绍大模型应用的开发两类：基于RAG的架构，基于Agent的架构。

### LangChain的核心组件

LangChain的核心组件主要涉及四个部分：Model I/O、Chains、RAG、Agents。

##### Model I/O

标准化大模型的输入和输出，包含提示模版，模型调用和格式化输出。

![image22](assets/lessons-langchain/image22.webp)

###### Format(格式化)：通过模板管理大模型的输入。将原始数据格式化成模型可以处理的形式，插入到一个模板中，然后送入模型进行处理。

###### Predict(预测)：调用 LLM 接收输入，进行预测或生成回答。

###### Parse(解析)：规范化模型输出。比如将模型输出格式化为 JSON。

##### Chains

“链条”用于将多个组件组合成一个完整的流程，方便链式调用。

##### Retrieval

对应RAG：检索外部数据，作为参考信息输入LLM辅助生成答案。

![image23](assets/lessons-langchain/image23.webp)

###### Source：多种类型的数据源：视频、图片、文本、代码、文档等。

###### Load：将多源异构数据统一加载为文档对象。

###### Transform：对文档进行转换和处理，比如将文本切分为小块。

###### Embed：将文本编码为向量。

###### Store：将向量化后的数据存储起来。

###### Retrieve：从文本库中检索相关的文本段落。

##### Agents

Agent 自主规划执行步骤并使用工具来完成任务。

![image24](assets/lessons-langchain/image24.webp)

## Model I/O

### Model I/O 介绍

Model I/O 部分是与语言模型进行交互的核心组件，包括输入提示（Prompt Template）、调用模型（Model）、输出解析（Output Parser）。简单来说，就是输入、处理、输出这三个步骤。

### 调用在线模型

#### 大模型服务平台

LangChain作为一个“工具”，依赖于第三方集成各种大模型。

有许多提供大模型API服务的平台，使用时只需要注册、充值并创建API-Key，之后即可使用API-Key与URL来调用平台提供的相应的模型的服务。

##### CloseAI：https://platform.closeai-asia.com/

API-Key管理：https://platform.closeai-asia.com/developer/api

API文档：https://doc.closeai-asia.com/tutorial/api/openai.html

模型：https://platform.closeai-asia.com/pricing

##### OpenRouter：https://openrouter.ai/

API-Key管理：https://openrouter.ai/settings/keys

API文档：https://openrouter.ai/docs/community/frameworks-and-integrations-overview

模型：https://openrouter.ai/models

##### 阿里云百炼：https://bailian.console.aliyun.com/

API-Key管理：https://bailian.console.aliyun.com/?tab=model#/api-key

API文档：https://bailian.console.aliyun.com/?tab=doc#/doc/?type=model

模型：https://bailian.console.aliyun.com/?tab=model#/model-market/all

##### 百度千帆：https://console.bce.baidu.com/qianfan/overview

API-Key管理：https://console.bce.baidu.com/qianfan/ais/console/apiKey

API文档：https://cloud.baidu.com/doc/qianfan-docs/s/Mm8r1mejk

模型：https://console.bce.baidu.com/qianfan/modelcenter/model/buildIn/list

##### 硅基流动：https://www.siliconflow.cn/

API-Key管理：https://cloud.siliconflow.cn/me/account/ak

API文档：https://docs.siliconflow.cn/cn/userguide/capabilities/text-generation

模型：https://cloud.siliconflow.cn/me/models

#### OpenAI SDK 调用模型

OpenAI 的 GPT 系列模型影响了大模型技术发展的开发范式和标准。所以无论是 Qwen、ChatGLM 等模型，它们的使用方法和函数调用逻辑基本遵循 OpenAI 定义的规范，没有太大差异。这就使得能够通过一个较为通用的接口来接入和使用不同的模型。

```python
# pip install langchain langchain-openai
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",  # 平台提供的 URL
    api_key="sk-...",  # 平台提供的 API-Key
)

completion = client.chat.completions.create(
    model="openai/gpt-oss-20b:free",  # 模型名称
    messages=[{"role": "user", "content": "将'你好'翻译成意大利语"}],  # 用户输入
)
print(completion.choices[0].message.content)
```

#### API-Key 管理

通常有3种方式来管理API-Key：硬编码、写入.env文件、写入环境变量。

刚才我们就是将 API-Key 硬编码仅代码中，这仅适用于临时测试，存在密钥泄露风险。

##### 使用 .env 配置文件

使用 python-dotenv 加载本地配置文件，支持多环境管理。该方式有以下优势：

- 配置文件可加入 .gitignore 避免泄露

- 支持多环境配置（如 .env.prod 和 .env.dev）

- 创建 .env 文件（项目根目录）：

```python
OPENAI_API_KEY="sk-…"
OPENAI_BASE_URL=" https://openrouter.ai/api/v1"
```

举例：显式读取 .env 中的环境变量

```python
# pip install python-dotenv
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()  # 默认加载 .env

client = OpenAI(
    base_url=os.getenv("OPENAI_BASE_URL"),  # 平台提供的 URL
    api_key=os.getenv("OPENAI_API_KEY"),  # 平台提供的 API Key
)

completion = client.chat.completions.create(
    model="openai/gpt-oss-20b:free", 
        messages=[{"role": "user", "content": "将'你好'翻译成意大利语"}],
)
print(completion.choices[0].message.content)
```

举例：依靠 OpenAI 的默认行为读取 .env 环境变量

OpenAI 在创建时，会自动到环境变量中找 OPENAI_API_KEY 以及OPENAI_BASE_URL。如果在 .env 中配置的名字和上面的两个名字一样，无需再次赋值，只通过 dotenv.load_dotenv() 加载环境配置信息即可。

```python
# pip install python-dotenv
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()  # 默认加载 .env

client = OpenAI()

completion = client.chat.completions.create(
    model="openai/gpt-oss-20b:free", 
    messages=[{"role": "user", "content": "将'你好'翻译成意大利语"}],
)
print(completion.choices[0].message.content)
```

##### 在环境变量中配置

通过系统环境变量存储 API-Key，避免代码明文暴露。

终端设置变量（临时生效）：

export OPENAI_API_KEY="sk-…"  # Linux/Mac

set OPENAI_API_KEY="sk-…"    # Windows CMD

在代码中通过 os.getenv() 读取API-Key：

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
)

completion = client.chat.completions.create(
    model="openai/gpt-oss-20b:free",
    messages=[{"role": "user", "content": "你好"}],
)
print(completion.choices[0].message.content)
```

#### LangChain API 调用模型

通常通过聊天模型接口访问 LLM，该接口通常以消息列表作为输入并返回一条消息作为输出。

输入：接受文本 PromptValue 或消息列表 List[BaseMessage]，每条消息需指定角色（如 SystemMessage、HumanMessage、AIMessage）

输出：返回带角色的消息对象（BaseMessage 子类），通常是 AIMessage

![image25](assets/lessons-langchain/image25.webp)

举例：

```python
import os
from langchain.chat_models import init_chat_model
from langchain.messages import SystemMessage, HumanMessage, AIMessage

llm = init_chat_model(
    model="openai/gpt-oss-20b:free",
    model_provider="openai",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

messages = [
    SystemMessage(content="你是一个诗人"),
    HumanMessage(content="写一首关于春天的诗"),
]
resp = llm.invoke(messages)
print(type(resp))  # <class 'langchain_core.messages.ai.AIMessage'>
print(resp.content)
```

#### 模型初始化相关参数

初始化一个模型最简单的方法就是使用 init_chat_model，并设置必要的参数，例如 API-Key 和模型名称。除此之外还有一些其他参数。

| 参数 | 说明 |
| --- | --- |
| model | 模型名称或标识符 |
| base_url | 发送请求的 API 端点的 URL。常由模型的提供商提供 |
| api_key | 与模型提供商进行身份验证所需的 API 密钥 |
| temperature | 控制模型输出的随机性。数字越高，回答越有创意；数字越低，回答越确定 |
| timeout | 在取消请求之前，等待模型响应的最大时间（以秒为单位） |
| max_tokens | 限制响应中的总tokens 数量，控制输出长度 |
| max_retries | 请求失败时系统尝试重新发送请求的最大次数 |

Token是什么？

大模型处理的最小单位是 token（相当于自然语言中的词或字），输出时逐个 token 依次生成。模型提供商通常也是以 token 的数量作为其计量或收费的依据。1个中文Token≈1-1.8个汉字，1个英文Token≈3-4字母。

Token与字符转化的可视化工具：

OpenAI提供：https://platform.openai.com/tokenizer

百度智能云提供：https://console.bce.baidu.com/support/#/tokenizer

#### 对话模型的 Message

对话模型的输入可以是文本提示、消息提示或是字典格式。

##### 文本提示

文本提示是字符串，适用于不需要保留对话历史的直接生成任务。

```python
resp = llm.invoke("你好")
```

##### 消息提示

将消息对象列表输入模型，方便管理对话历史，包含系统指令以及处理多模态数据。

```python
messages = [
    SystemMessage("你是个诗人"),
    HumanMessage("写首关于春天的诗"),
]
resp = llm.invoke(messages)
```

##### 字典格式

也可以按照 OpenAI 聊天补全格式创建字典列表组成消息。一条消息通常包含 role（角色）、content（内容）、metadata（元数据）。

```python
messages = [
    {"role": "system", "content": "你是个诗人"},
    {"role": "user", "content": "写首关于春天的诗"},
]
resp = llm.invoke(messages)
```

##### 消息类型

| 消息类型 | 描述 |
| --- | --- |
| SystemMessage | 代表一组初始指令，用于引导模型的行为。可以使用系统消息来设定语气、定义模型的角色，并建立响应的指导方针 |
| HumanMessage | 表示用户输入 |
| AIMessage | 模型生成的响应，包括文本内容、工具调用和元数据 |
| ToolMessage | 表示工具调用的输出 |

HumanMessage、AIMessage 和 SystemMessage 是常用的消息类型。

ToolMessage 是在工具调用场景下才会使用的特殊消息类型。

#### 调用方法

聊天模型提供了三种主要的调用方法：

| invoke / ainvoke | 将单个输入转换为输出 |
| --- | --- |
| batch / abatch | 批量将多个输入转换为输出 |
| stream / astream | 从单个输入生成流式输出 |

带有“a”前缀的方法是异步的，需要与 asyncio 和 await 语法一起使用以实现并发。

##### 非流式/流式输出

在Langchain中，语言模型的输出分为了两种主要的模式：流式输出与非流式输出。

- 非流式输出：用户提出需求请编写一首诗，系统在静默数秒后突然弹出了完整的诗歌。如同一种“提交请求，等待结果”的流程，实现简单，但体验单调。

- 流式输出：用户提问，请编写一首诗，当问题刚刚发送，系统就开始一字一句（逐个token）进行回复，更像是“实时对话”，贴近人类交互的习惯。

##### 非流式输出：

这是 LangChain 与 LLM 交互时的默认行为，是最简单、最稳定的语言模型调用方式。当用户发出请求后，系统在后台等待模型生成完整响应，然后一次性将全部结果返回。

举例：invoke() 调用

```python
import os
from langchain.chat_models import init_chat_model

llm = init_chat_model(
    model="openai/gpt-oss-20b:free",
    model_provider="openai",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

messages = [
    {"role": "system", "content": "你是一名数学家"},
    {"role": "user", "content": "请证明以下黎曼猜想"},
]
resp = llm.invoke(messages)
print(resp.content)
```

##### 流式输出

流式输出是一种更具交互感的模型输出方式，用户不再需要等待完整答案，而是能看到模型逐个 token地实时返回内容。适合构建强调“实时反馈”的应用。

举例：stream() 流式输出

```python
import os
from langchain.chat_models import init_chat_model

llm = init_chat_model(
    model="openai/gpt-oss-20b:free",
    model_provider="openai",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

messages = [
    {"role": "system", "content": "你是一名数学家"},
    {"role": "user", "content": "请证明以下黎曼猜想"},
]
# 使用 stream() 方法流式输出
for chunk in llm.stream(messages):
    # 逐个打印内容块，并刷新缓冲区以即时显示内容
    print(chunk.content, end="", flush=True)
```

##### 批量调用

将一组独立的请求批量发送给模型并行处理。

举例：batch() 批量调用

```python
import os
from langchain.chat_models import init_chat_model

llm = init_chat_model(
    model="openai/gpt-oss-20b:free",
    model_provider="openai",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

messages = [
    [
        {"role": "system", "content": "你是一位诗人"},
        {"role": "user", "content": "写一首关于春天的诗"},
    ],
    [
        {"role": "system", "content": "你是一位诗人"},
        {"role": "user", "content": "写一首关于夏天的诗"},
    ],
    [
        {"role": "system", "content": "你是一位诗人"},
        {"role": "user", "content": "写一首关于秋天的诗"},
    ],
]
resp = llm.batch(messages)  # 批量调用,返回一个消息列表
print(resp)
```

batch 默认没有依赖底层 API 的原生批量接口，而是使用线程池并行执行多个 invoke()。所以它对 IO 密集型任务（如调用远程 LLM API）很有效。

如果底层 API 自身提供批量接口（一次请求多个 prompt），那么子类可以重写 batch 方法来直接使用批量接口，这样效率会更高。

##### 同步/异步调用

##### 同步调用

每个操作依次执行，直到当前操作完成后才开始下一个操作，总的执行时间是各个操作时间的总和。

举例：使用 invoke() 同步调用

```python
import os
import time
from langchain.chat_models import init_chat_model

llm = init_chat_model(
    model="openai/gpt-oss-20b:free",
    model_provider="openai",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

messagess = [
    [
        {"role": "system", "content": "你是一位诗人"},
        {"role": "user", "content": "写一首关于春天的诗"},
    ],
    [
        {"role": "system", "content": "你是一位诗人"},
        {"role": "user", "content": "写一首关于夏天的诗"},
    ],
    [
        {"role": "system", "content": "你是一位诗人"},
        {"role": "user", "content": "写一首关于秋天的诗"},
    ],
]

start_time = time.time()

resps = [llm.invoke(messages) for messages in messagess]
print(resps)

end_time = time.time()
print(f"Total time: {end_time - start_time}")
# Total time: 17.789486169815063
```

##### 异步调用

异步调用，允许程序在等待某些操作完成时继续执行其他任务，而不是阻塞等待。这在处理 I/O 操作（如网络请求、文件读写等）时特别有用，可以显著提高程序的效率和响应性。

举例：使用 ainvoke() 异步调用

```python
import os
import time
import asyncio
from langchain.chat_models import init_chat_model

llm = init_chat_model(
    model="openai/gpt-oss-20b:free",
    model_provider="openai",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

messagess = [
    [
        {"role": "system", "content": "你是一位诗人"},
        {"role": "user", "content": "写一首关于春天的诗"},
    ],
    [
        {"role": "system", "content": "你是一位诗人"},
        {"role": "user", "content": "写一首关于夏天的诗"},
    ],
    [
        {"role": "system", "content": "你是一位诗人"},
        {"role": "user", "content": "写一首关于秋天的诗"},
    ],
]

async def async_invoke():
    tasks = [llm.ainvoke(messages) for messages in messagess]
    return await asyncio.gather(*tasks)

start_time = time.time()

resps = asyncio.run(async_invoke())
print(resps)

end_time = time.time()
print(f"Total time: {end_time - start_time}")
# Total time: 8.280137062072754
```

使用 asyncio.gather() 并行执行时，因为多个任务几乎同时开始，它们的执行时间将重叠。理想情况下，如果多个任务的执行时间相同，那么总执行时间应该接近单个任务的执行时间。

### 调用本地模型

#### Ollama介绍

Ollama是一个开源项目，其项目定位是：一个本地运行大模型的集成框架。目前主要针对主流的LlaMA架构的开源大模型设计，可以实现如 Qwen、Deepseek 等主流大模型的下载、启动和本地运行的自动化部署及推理流程。

目前作为一个非常热门的大模型托管平台，已被包括LangChain、Taskweaver等在内的多个热门项目高度集成。

Ollama官方地址：https://ollama.com

Ollama Github开源地址：https://github.com/ollama/ollama

#### Ollama安装

Ollama项目支持跨平台部署，目前已兼容Mac、Linux和Windows操作系统。

![image26](assets/lessons-langchain/image26.webp)

无论使用哪个操作系统，Ollama项目的安装过程都设计得非常简单。

访问 https://ollama.com/download 下载对应系统的安装文件。

- Windows 系统执行.exe文件安装

- Linux 系统执行以下命令安装：

curl -fsSL https://ollama.com/install.sh | sh

这行命令的目的是从https://ollama.com/ 网站读取 install.sh脚本，并立即通过 sh 执行该脚本，在安装过程中会包含以下几个主要的操作：

检查当前服务器的基础环境，如系统版本等；

下载Ollama的二进制文件；

配置系统服务，包括创建用户和用户组，添加Ollama的配置信息；

启动Ollama服务；

#### 模型下载

访问https://ollama.com/search可以查看Ollama支持的模型。使用命令行可以下载并运行模型，例如运行deepseek-r1:7b模型：

ollama run deepseek-r1:7b

因为文件比较大，所以直接用我给大家提供的资料，需要做如下配置

##### 进入到Settings

![image27](assets/lessons-langchain/image27.webp)

##### 切换模型目录

![image28](assets/lessons-langchain/image28.webp)

##### 运行模型 ollama run deepseek-r1:7b

ollama run deepseek-r1:7b

调用本地模型

举例：

```python
# pip install langchain-ollama
from langchain_ollama import ChatOllama

ollama_llm = ChatOllama(model="deepseek-r1:7b")
messages = {"role": "user", "content": "你好，请介绍一下你自己"}
resp = ollama_llm.invoke(messages)
print(resp.content)
```

若 Ollama 不在本地默认端口运行，需指定 base_url，即：

```python
# pip install langchain-ollama
from langchain_ollama import ChatOllama

ollama_llm = ChatOllama(
    model="deepseek-r1:7b",
    base_url="http://your-ip:port",  #  自定义地址
)
messages = {"role": "user", "content": "你好，请介绍一下你自己"}
resp = ollama_llm.invoke(messages)
print(resp.content)
```

### Prompt Template

#### 提示词模板介绍

在应用开发中，固定的提示词限制了模型的灵活性和适用范围。所以，Prompt Template 是一个模板化的字符串，我们可以将变量插入到模板中，从而创建出不同的提示。Prompt Template 接收用户输入，返回一个传递给LLM的信息（即提示词 prompt）。

提示模板以字典作为输入，其中每个键代表要填充的提示模板中的变量。并输出一个 PromptValue。这个 PromptValue 可以传递给聊天模型，也可以转换为字符串或消息列表。PromptValue 存在的目的是为了方便在字符串和消息之间切换。

有多种类型的提示模板，常用的有 PromptTemplate（字符串提示模板）和 ChatPromptTemplate（聊天提示模板）。

#### 复习：str.format()

Python的str.format()方法是一种字符串格式化的手段，允许在字符串中插入变量。使用这种方法，可以创建包含占位符的字符串模板，占位符由花括号{}标识。

- 调用format()方法时，可以传入一个或多个参数，这些参数将被顺序替换进占位符中。

- str.format()提供了灵活的方式来构造字符串，支持多种格式化选项。

- 在LangChain的默认设置下， PromptTemplate 使用Python的str.format()方法进行模板化。这样在模型接收输入前，可以根据需要对数据进行预处理和结构化。

基本用法

```python
# 简单示例，直接替换
greeting = "Hello, {}!".format("Alice")
print(greeting)
# 输出: Hello, Alice!
```

带有位置参数的用法

```python
# 使用位置参数
info = "Name: {0}, Age: {1}".format("Jerry", 25)
print(info)
# 输出:Name: Jerry, Age: 25
```

带有关键字参数的用法

```python
# 使用关键字参数
info = "Name: {name}, Age: {age}".format(name="Tom", age=25)
print(info)
#输出: Name: Tom, Age: 25
```

使用字典解包的方式

```python
# 使用字典解包
person = {"name": "David", "age": 40}
info = "Name: {name}, Age: {age}".format(**person)
print(info)
#输出: Name: David, Age: 40
```

#### PromptTemplate

PromptTemplate 用于快速构建包含变量的提示词模板，并通过传入不同的参数值生成自定义的提示词。

| 参数 | 参数 |
| --- | --- |
| template | 提示模板，包括变量占位符 |
| input_variables | 需要将其值作为提示输入的变量名称列表 |
| partial_variables | 提示模板携带的部分变量的字典。使用部分变量预先填充模板，无需后续在每次调用时再传递这些变量 |
| 方法 | 方法 |
| format() | 使用输入格式化提示 |

##### 实例化

方式1：使用构造方法实例化提示词模板

```python
from langchain_core.prompts import PromptTemplate

# 使用构造方法实例化提示词模板
template = PromptTemplate(
    template="请评价{product}的优缺点，包括{aspect1}和{aspect2}。",
    input_variables=["product", "aspect1", "aspect2"],
)

# 使用模板生成提示词
prompt_1 = template.format(product="智能手机", aspect1="电池续航", aspect2="拍照质量")
prompt_2 = template.format(product="笔记本电脑", aspect1="处理速度", aspect2="便携性")

print(prompt_1)  # 请评价智能手机的优缺点，包括电池续航和拍照质量。
print(prompt_2)  # 请评价笔记本电脑的优缺点，包括处理速度和便携性。
```

方式2：使用 from_template 方法实例化提示词模板

```python
from langchain_core.prompts import PromptTemplate

# 使用 from_template 方法实例化提示词模板
template = PromptTemplate.from_template("请给我一个关于{topic}的{type}解释。")

# 使用模板生成提示
prompt = template.format(type="详细", topic="量子力学")

print(prompt)  # 请给我一个关于量子力学的详细解释。
```

##### 部分提示模版

在生成提示之前可以赋予部分变量默认值。

- 方式1：实例化过程中指定 partial_variables 参数

```python
from langchain_core.prompts import PromptTemplate

template = PromptTemplate(
    template="{foo} {bar}",
    input_variables=["foo", "bar"],
    partial_variables={"foo": "hello"},  # 预先定义部分变量
)

prompt = template.format(bar="world")

print(prompt)  # hello world
```

- 方式2：使用 partial 方法指定默认值

```python
from langchain_core.prompts import PromptTemplate

template = PromptTemplate.from_template("{foo} {bar}")
partial_template = template.partial(foo="hello")  # 预先定义部分变量

prompt = partial_template.format(bar="world")

print(prompt)  # hello world
```

##### 调用方式

除了 format 方法，也可以使用 invoke 方法调用。

invoke 方法返回 PromptValue 对象，可以使用 to_string 方法将其转换为字符串。

举例：invoke 方法调用

```python
from langchain_core.prompts import PromptTemplate

template = PromptTemplate.from_template("{foo} {bar}")

prompt = template.invoke({"foo": "hello", "bar": "world"})

print(prompt, type(prompt))
# text='hello world' <class 'langchain_core.prompt_values.StringPromptValue'>

prompt_str = prompt.to_string()
print(prompt_str, type(prompt_str))
# hello world <class 'str'>
```

#### ChatPromptTemplate

ChatPromptTemplate是创建聊天消息列表的提示模板。相较于普通 PromptTemplate更适合处理多角色、多轮次的对话场景。支持 System/Human/AI 等不同角色的消息模板。

##### 实例化

ChatPromptTemplate 可以通过构造方法或 from_messages 方法来实例化提示词模板。

实例化时需要传入 messages 参数，messages 参数支持如下格式：

- tuple 构成的列表，格式为[(role, content)]

- dict 构成的列表，格式为[{“role”:... , “content”:...}]

- Message 类构成的列表

举例：

```python
from langchain_core.prompts import ChatPromptTemplate

template = ChatPromptTemplate(
    [
        ("system", "你是一个AI开发工程师，你的名字是{name}。"),
        ("human", "你能帮我做什么?"),
        ("ai", "我能开发很多{thing}。"),
        ("human", "{user_input}"),
    ]
)

prompt = template.format_messages(name="小谷AI", thing="AI", user_input="行")
print(prompt)
# [
# SystemMessage(content="你是一个AI开发工程师，你的名字是小谷AI。",...),
# HumanMessage(content="你能帮我做什么?", ...),
# AIMessage(content="我能开发很多AI。", ...),
# HumanMessage(content="行", ...),
# ]
```

##### 调用方式

推荐使用 from_messages 方法或 invoke 方法调用。

举例：invoke 方法调用

```python
from langchain_core.prompts import ChatPromptTemplate

template = ChatPromptTemplate(
    [
        ("system", "你是一个AI开发工程师，你的名字是{name}。"),
        ("human", "你能帮我做什么?"),
        ("ai", "我能开发很多{thing}。"),
        ("human", "{user_input}"),
    ]
)

prompt = template.invoke({"name": "小谷AI", "thing": "AI", "user_input": "行"})
print(prompt)
# messages=[
# SystemMessage(content="你是一个AI开发工程师，你的名字是小谷AI。",...),
# HumanMessage(content="你能帮我做什么?", ...),
# AIMessage(content="我能开发很多AI。", ...),
# HumanMessage(content="行", ...),
# ]
```

##### 消息占位符

当希望在格式化过程中插入消息列表时，比如 Agent 暂存中间步骤，需要使用 MessagesPlaceholder，负责在特定位置添加消息列表。

举例：

```python
from langchain_core.prompts import ChatPromptTemplate

template = ChatPromptTemplate.from_messages(
    [
        ("system", "你是一个助手。"),
        ("placeholder", "{conversation}"),
        # 等同于 MessagesPlaceholder(variable_name="conversation", optional=True)
    ]
)

prompt = template.format_messages(
    conversation=[
        ("human", "你好！"),
        ("ai", "想让我帮你做些什么？"),
        ("human", "能帮我做一个冰淇凌吗？"),
        ("ai", "不能"),
    ]
)
print(prompt)
# [
#     SystemMessage(content="你是一个助手。", ...),
#     HumanMessage(content="你好！", ...),
#     AIMessage(content="想让我帮你做些什么？", ...),
#     HumanMessage(content="能帮我做一个冰淇凌吗？", ...),
#     AIMessage(content="不能", ...),
# ]
```

##### 多模态提示词

可以使用提示模板来格式化多模态输入，比如将图片链接作为输入。

举例：

```python
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
load_dotenv()
llm = init_chat_model(
    model="qwen3.8-max",#（现在用qwen4.0max）
    model_provider="openai",
    api_key="sk-ws-H.EEIRHED.GiWc.MEUCIQCaqEJjqbodZma5sUW7n4qFzAyIt-pUcQn8-bMtDl36HwIgctZmf5G6opNj2HeaImeUUaKlYU_GId0Fq46M2O14Vd8",
    base_url="https://llm-xmmta79tvx7xf6tm.cn-beijing.maas.aliyuncs.com/compatible-mode/v1",
    # https://llm-xmmta79tvx7xf6tm.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
)
template = ChatPromptTemplate([
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "请描述这张图片"},
            {"image_url": "{image_url}"} //图片地址
        ]
    },
])
t1 = template.format_messages(image_url = "https://gips1.baidu.com/it/u=3874647369,3220417986&fm=3028&app=3028&f=JPEG&fmt=auto?w=720&h=1280")
resp = llm.invoke(t1)
print(resp.content)
```

#### 外部加载Prompt

可以将 prompt 保存为 JSON 或者 YAML 等格式的文件，通过读取指定路径的格式化文件，获取相应的 prompt。这样方便对 prompt 进行管理和维护。

##### json格式提示词

prompts目录下创建json文件：prompt.json

```python
{
    "_type": "prompt",
    "input_variables": ["name", "what"],
    "template": "请{name}讲一个{what}的故事"
}
```

代码：

```python
from langchain_core.prompts import load_prompt

template = load_prompt("prompts/prompt.json", encoding="utf-8")
print(template.format(name="张三", what="搞笑的"))
# 请张三讲一个搞笑的的故事
```

##### yaml格式提示词

prompts目录下创建yaml文件：prompt.yaml

```python
_type: "prompt"
input_variables: ["name", "what"]
template: "请{name}讲一个{what}的故事"
```

代码：

```python
from langchain_core.prompts import load_prompt

template = load_prompt("prompts/prompt.yaml", encoding="utf-8")
print(template.format(name="年轻人", what="滑稽"))
# 请年轻人讲一个滑稽的故事
```

### Output Parsers

#### 输出解析器介绍

在应用开发中，大模型的输出可能是下一步逻辑处理的关键输入。因此，在这种情况下，规范化输出是必须要做的任务，以确保应用能够顺利进行后续的逻辑处理。

语言模型返回的内容通常都是文本字符串，而实际 AI 应用开发过程中有时希望模型可以返回更直观、更格式化的内容，LangChain 提供了输出解析器（Output Parser）将模型输出解析为结构化数据。

有多种类型的输出解析器，常用的有 StrOutputParser（字符串解析器）与 JsonOutputParser（JSON解析器）。

#### StrOutputParser

StrOutputParser 是一个简单的解析器，从结果中提取 content 字段。

举例：将模型输出结果解析为字符串

```python
import os
from langchain.chat_models import init_chat_model
from langchain_core.output_parsers import StrOutputParser

llm = init_chat_model(
    model="openai/gpt-oss-20b:free",
    model_provider="openai",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

messages = [
    {"role": "system", "content": "你是一个机器人"},
    {"role": "user", "content": "你好"},
]

resp = llm.invoke(messages)
print(resp)  # content='你好！有什么我可以帮忙的吗？' additional_kwargs=......

str_resp = StrOutputParser().invoke(resp)
print(str_resp)  # 你好！有什么我可以帮忙的吗？
```

#### JsonOutputParser

JSON 解析器用于将大模型的自由文本输出转换为结构化JSON数据的工具。特别适用于需要严格结构化输出的场景，比如 API 调用、数据存储或下游任务处理。

JsonOutputParser 能够结合 Pydantic 模型进行数据验证，自动验证字段类型和内容（如字符串、数字、嵌套对象等）

使用 get_format_instructions() 获取JSON解析的格式化指令：

```python
from langchain_core.output_parsers import JsonOutputParser

parser = JsonOutputParser() # 不写 pydantic_object

# 解析器只是把字符串json转为python字典

json_str = '{"scores":[22,33,55],"hobbies":["唱","跳","RAP"],"name" :"赵四"}'

res = parser.parse(json_str)
print(res)
print(type(res)) # <class 'dict'>
```

举例：

```python
import os

from langchain.chat_models import init_chat_model
from pydantic import BaseModel, Field
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
# 这就是一张图纸：规定返回什么字段、什么类型
class Student(BaseModel):
    name: str = Field(description="学生姓名")
    age: int = Field(description="学生年龄")
llm = init_chat_model(
    model = "qwen/qwen3.8-max",
    model_provider="openai",
    base_url = os.getenv("OPENAI_BASE_URL"),
    api_key = os.getenv("OPENAI_API_KEY"),
)
parse = JsonOutputParser(pydantic_object=Student)
messages = [
    {"role" : "system" , "content" : parse.get_format_instructions()},
    {
        "role" : "user" , "content" : "请结合格式随机生成1个学生对象"
    }
]
result = llm.invoke(messages)
print(result)
results = parse.parse(result.content)

print(results,type(results))

```



```python
import os

from langchain.chat_models import init_chat_model
from langchain_core.output_parsers import JsonOutputParser

llm = init_chat_model(
    model = "qwen/qwen3.8-max",
    model_provider="openai",
    base_url = os.getenv("OPENAI_BASE_URL"),
    api_key = os.getenv("OPENAI_API_KEY"),
)
parse = JsonOutputParser()

print(parse.get_format_instructions())


print("------------------------------------------------")

messages = [
    {"role" : "system" , "content" : parse.get_format_instructions()},
    {
        "role" : "user" , "content" : "生成一段JSON格式的随机测试数据"
    }
]
result = llm.invoke(messages)
print(result.content) # 直接获取JSON格式数据
print(parse.parse(result.content)) #转换为字典

```

### Structured Outputs

可以要求模型按照给定的模式格式提供其响应，这有助于确保输出可以被轻松解析并在后续处理中使用。LangChain 支持多种模式类型和强制结构化输出的方法。

#### TypedDict

TypedDict 提供了一个使用 Python 内置类型的简单方案，但是没有验证功能。

```python
import os
from typing import TypedDict, Annotated
from langchain.chat_models import init_chat_model

llm = init_chat_model(model = "qwen/qwen3.8-max",model_provider="openai",base_url = os.getenv("OPENAI_BASE_URL"),api_key = os.getenv("OPENAI_API_KEY"),)

class Animal(TypedDict):
    animal: Annotated[str, "动物"]
    emoji: Annotated[str, "表情"]

class Zoo(TypedDict):
    animals: Annotated[list[Animal], "动物与表情列表"]

messages = [{"role": "user", "content": "任意生成三种动物，以及他们的 emoji 表情"}]

llm_with_structured_output = llm.with_structured_output(Zoo)
resp = llm_with_structured_output.invoke(messages)
print(resp)
# {'animals': [{'animal': '猫', 'emoji': '🐱'}, {'animal': '老虎', 'emoji': '🐯'}, {'animal': '企鹅', 'emoji': '🐧'}]}
```

#### Pydantic

Pydantic 模型提供了丰富的功能集，包括字段验证、描述和嵌套结构。

```python
import os
from pydantic import BaseModel, Field
from langchain.chat_models import init_chat_model

llm = init_chat_model(model = "qwen/qwen3.8-max",model_provider="openai",base_url = os.getenv("OPENAI_BASE_URL"),api_key = os.getenv("OPENAI_API_KEY"),)


class Animal(BaseModel):
    animal: str = Field(description="动物")
    emoji: str = Field(description="表情")

class AnimalList(BaseModel):
    animals: list[Animal] = Field(description="动物与表情列表")

messages = [{"role": "user", "content": "任意生成三种动物，以及他们的 emoji 表情"}]

output = llm.with_structured_output(AnimalList)
resp = output.invoke(messages)
print(resp)
# animals=[Animal(animal='猫', emoji='🐱'), Animal(animal='乌龟', emoji='🐢'), Animal(animal='企鹅', emoji='🐧')]
```

#### JSON Schema

若需最大程度的控制或互操作性，可以提供一个原始的 JSON Schema。详情可参考 https://platform.openai.com/docs/guides/structured-outputs/json-schema#supported-schemas。

可以将原始响应与解析后的表示一起返回，可在调用 with_structured_output 时设置 include_raw=True 来实现。

```python
# 导入操作系统模块，用来读取环境变量（存放api_key、base_url，避免硬编码密钥）
import os
# 导入langchain模型初始化函数，统一方式实例化各类大模型
from langchain.chat_models import init_chat_model

# 初始化聊天大模型对象
# model：指定调用的模型名称 qwen/qwen3.8‑max
# model_provider：模型服务商，这里兼容openai接口格式
# base_url：中转/兼容接口地址，从环境变量读取
# api_key：接口密钥，从环境变量读取，不写死在代码中
llm = init_chat_model(
    model = "qwen/qwen3.8-max",
    model_provider="openai",
    base_url = os.getenv("OPENAI_BASE_URL"),
    api_key = os.getenv("OPENAI_API_KEY"),
)

# 定义JSON‑Schema结构化输出约束规则
# schema作用：强制大模型输出必须遵守这个JSON格式，不要自由聊天文本
schema = {
    "name": "test_list",   # schema的标识名称，json_schema模式需要，自定义即可
    "schema": {
        "type": "array",        # 根结构是数组，也就是返回[]列表
        "items": {              # 数组里面每一个元素的格式
            "type": "object",   # 数组每一项是对象（字典）
            "properties": {      # 对象里面包含哪些字段
                "animal": {"type": "string", "description": "动物名称"}, # 字段1：字符串类型，给模型提示该字段含义
                "emoji": {"type": "string", "description": "动物的emoji表情"}, # 字段2：字符串类型
            },
            "required": ["animal", "emoji"], # 必填字段，模型必须返回这两个key，不能缺失
        },
    },
}

# 构造对话消息列表，遵循openai消息格式
# role角色：user代表用户提问；content用户输入的问题内容
messages = [{"role": "user", "content": "任意生成5种动物，以及他们的 emoji 表情"}]

# 给大模型绑定结构化输出能力
# with_structured_output：给llm包装一层，让模型强制输出符合schema的JSON
# schema：传入上面定义好的json规则
# method="json_schema"：使用原生OpenAI标准结构化输出模式，强校验格式
# include_raw=True：返回结果同时保留原始完整响应，不仅仅返回解析后的字典
llm_with_structured_output = llm.with_structured_output(
    schema, method="json_schema", include_raw=True
)

# 调用模型执行请求，传入对话消息，得到返回对象
resp = llm_with_structured_output.invoke(messages)

# 打印完整的返回包，包含raw原始消息、parsed解析好的数据
print(resp)
# raw：大模型API返回的原始ChatMessage完整对象，调试排错用，可以看原始返回内容
print(resp["raw"])
# parsed：已经解析完成的Python列表/字典对象，直接业务代码使用，示例输出：
# [{'animal': '企鹅', 'emoji': '🐧'}, {'animal': '大象', 'emoji': '🐘'}, {'animal': '袋鼠', 'emoji': '🦘'}]
print(resp["parsed"])
```

## Chains

### Runnable与LCEL

##### Runnable

Runnable 是 LangChain 中可以调用、批处理、流式传输、转换和组合的工作单元。

Runnable 接口是使用 LangChain 组件的基础，它在许多组件中实现，例如语言模型、输出解析器、检索器、编译的 LangGraph 图等。

Runnable 接口强制要求所有 LCEL 	组件实现一组标准方法：

| invoke / ainvoke | 将单个输入转换为输出 |
| --- | --- |
| batch / abatch | 批量将多个输入转换为输出 |
| stream / astream | 从单个输入生成流式输出 |
| … | … |

为什么需要统一调用方式？

假设没有统一调用方式，每个组件调用方式不同，组合时需要手动适配：

- 提示词渲染用 .format()

- 模型调用用 .generate()

- 解析器解析用 .parse()

- 工具调用用 .run()

代码会变成：

```python
prompt_text = prompt.format(topic="猫")  # 方法1
model_out = model.generate(prompt_text)  # 方法2
result = parser.parse(model_out)  # 方法3
```

Runnable 统一调用方式：

```python
# 分步调用
prompt_text = prompt.invoke({"topic": "猫"})  # 方法1
model_out = model.invoke(prompt_text)  # 方法2
result = parser.invoke(model_out)  # 方法3

# LCEL管道式
chain = prompt | model | parser  # 用管道符组合
result = chain.invoke({"topic": "猫"})  # 所有组件统一用invoke
```

无论组件的功能多复杂（模型/提示词/工具），调用方式完全相同。并且可以通过管道符 | 组合，自动处理类型匹配和中间结果传递。

##### LCEL

LangChain 表达式语言（LCEL，LangChain Expression Language）是一种从现有的Runnable 构建新的 Runnable 的声明式方法，用于声明、组合和执行各种组件（模型、提示、工具、函数等）。

我们称使用 LCEL 创建的 Runnable 为“链”，“链”本身就是 Runnable。

LCEL 两个主要的组合原语是 RunnableSequence 和 RunnableParallel。许多其他组合原语可以被认为是这两个原语的变体。

### RunnableSequence 可运行序列

RunnableSequence 按顺序“链接”多个可运行对象，其中一个对象的输出作为下一个对象的输入。

LCEL重载了 | 运算符，以便从两个 Runnables 创建 RunnableSequence。

```python
chain = runnable1 | runnable2
# 等同于
chain = RunnableSequence(runnable1, runnable2) # 不支持列表 多个Runnbale 逗号分割 书写即可   
```

举例：提示模板➡️模型➡️输出解析器

```python
import os
from langchain.chat_models import init_chat_model
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

prompt_template = PromptTemplate(
    template="讲一个关于{topic}的笑话",
    input_variables=["topic"],
)

llm = init_chat_model(
    model="openai/gpt-oss-20b:free",
    model_provider="openai",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

parser = StrOutputParser()

chain = prompt_template | llm | parser

resp = chain.invoke({"topic": "人工智能"})
print(resp)
```

### RunnableParallel 可运行并行

RunnableParallel 同时运行多个可运行对象，并为每个对象提供相同的输入。

对于同步执行，RunnableParallel 使用 ThreadPoolExecutor 来同时运行可运行对象。

对于异步执行，RunnableParallel 使用 asyncio.gather 来同时运行可运行对象。

在 LCEL 表达式中，字典会自动转换为 RunnableParallel。

举例：

```python
import os
from langchain.chat_models import init_chat_model
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableParallel
from langchain_core.output_parsers import StrOutputParser

llm = init_chat_model(
    model="openai/gpt-oss-20b:free",
    model_provider="openai",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

joke_chain = (
    PromptTemplate.from_template("讲一个关于{topic}的笑话") | llm | StrOutputParser()
)
poem_chain = (
    PromptTemplate.from_template("写一首关于{topic}的诗歌") | llm | StrOutputParser()
)

map_chain = RunnableParallel(joke=joke_chain, poem=poem_chain)

resp = map_chain.invoke({"topic": "人工智能"})
print(resp)
```

### RunnableLambda 可运行λ

RunnableLambda 将 Python 可调用函数转换为 Runnable，使得函数可以在同步或异步上下文中使用。

举例：

```python
from langchain_core.runnables import RunnableLambda

chain = {
    "text1": lambda x: x + " world",
    "text2": lambda x: x + ", how are you",
} | RunnableLambda(lambda x: len(x["text1"]) + len(x["text2"]))

result = chain.invoke("hello")
print(result)  # 29
```

也可以通过装饰器来使用：

```python
from langchain_core.runnables import RunnableLambda

@RunnableLambda
def total_len(x):
    return len(x["text1"]) + len(x["text2"])

chain = {
    "text1": lambda x: x + " world",
    "text2": lambda x: x + ", how are you",
} | total_len

result = chain.invoke("hello")
print(result)  # 29
```

### RunnablePassthrough 可运行透传

RunnablePassthrough 接收输入并将其原样输出。RunnablePassthrough 是 LangChain LCEL 体系中的“无操作节点”，用于在流水线中透传输入或保留上下文，也可以用于向输出中添加键。

举例：保留中间结果

```python
from langchain_core.runnables import RunnablePassthrough, RunnableParallel

chain = RunnableParallel(
    original=RunnablePassthrough(),  # 保留中间结果
    word_count=lambda x: len(x),
)

result = chain.invoke("hello world")
print(result)  # {'original': 'hello world', 'word_count': 11}
```

举例：使用 assign() 向输出中添加键

```python
from langchain_core.runnables import RunnablePassthrough

chain = {
    "text1": lambda x: x + " world",
    "text2": lambda x: x + ", how are you",
} | RunnablePassthrough.assign(word_count=lambda x: len(x["text1"] + x["text2"]))

result = chain.invoke("hello")
print(result)

# {'text1': 'hello world', 'text2': 'hello, how are you', 'word_count': 29}
```

### RunnableBranch 可运行分支

RunnableBranch 使用 (条件，Runnable) 对列表和默认分支进行初始化。对输入进行操作时，选择第一个计算结果为 True 的条件，并在输入上运行相应的 Runnable。如果没有条件为 True，则在输入上运行默认分支。

举例：

```python
from langchain_core.runnables import RunnableBranch

branch = RunnableBranch(
    (lambda x: isinstance(x, str), lambda x: x.upper()),
    (lambda x: isinstance(x, int), lambda x: x + 1),
    (lambda x: isinstance(x, float), lambda x: x * 2),
    lambda x: "goodbye",
)

result = branch.invoke("hello")
print(result)  # HELLO

result = branch.invoke(None)
print(result)  # goodbye
```

### RunnableWithFallbacks 可运行带回退

RunnableWithFallbacks 使得 Runnable 失败后可以回退到其他 Runnable。可以直接在Runnable 上使用 with_fallbacks 方法。

举例：

```python
import os
from langchain.chat_models import init_chat_model
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda

llm = init_chat_model(
    model="openai/gpt-oss-20b:free",
    model_provider="openai",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

chain = PromptTemplate.from_template("hello {name}") | llm
chain_with_fallback = chain.with_fallbacks([RunnableLambda(lambda x: "sorry")])

result = chain_with_fallback.invoke("1")  # 提示词模板中没有需要填充的变量，会报错
print(result)  # sorry
```

## Retrieval

### RAG介绍

#### 大模型的局限

##### 知识滞后

LLM 因其具有海量参数，需要花费相当的物力与时间成本进行预训练和微调，同时商用 LLM 还需要进行各种安全测试与风险评估等。因此 LLM 会存在知识滞后的问题。

##### 知识缺失

在专有领域，LLM 无法学习到所有的专业知识细节，因此在面向专业领域知识的提问时，无法给出可靠准确的回答。

##### 幻觉

LLM 在生成回答时，可能会“胡言乱语”，这种现象称之为 LLM 的“幻觉”。“幻觉”可以体现为错误陈述、编造事实、错误的复杂推理或者复杂语境下理解能力不足等。

“幻觉”产生的原因：

训练知识存在偏差，这些错误信息被 LLM 学习后在输出中复现

LLM 训练时过度泛化，将普通的模式应用在特定场合导致不准确输出

- LLM 本身没有真正学习到训练数据中深层次的含义，导致在一些需要深入理解或复杂推理的任务中出错

- LLM 缺乏某些领域的相关知识，在面临这些领域的相关问题时编造不存在的信息

- 大模型生成内容的不可控，尤其是在金融和医疗领域等领域，一次金额评估的错误，一次医疗诊断的失误，哪怕只出现一次都是致命的。但这些错误对于非专业人士来说难以辨识。目前还没有能够百分之百解决这种情况的方案。

#### 什么是RAG

为了改善大模型在时效性、可靠性与准确性方面的不足，各种针对 LLM 优化的方法应运而生。RAG（Retrieval-Augmented Generation，检索增强生成）就是其中一种被广泛研究和应用的优化架构。

RAG 的基本思想为：将传统的生成式大模型和实时信息检索技术相结合，为大模型补充来自外部的相关数据和上下文，来帮助大模型生成更加准确可靠的内容。这使得大模型在生成内容时可以依赖实时与个性化的数据和知识，而非仅仅依赖训练知识。就相当于在大模型回答时给它一本参考书。

![image29](assets/lessons-langchain/image29.webp)

可以说，当应用需求集中在利用大模型去回答特定私有领域的知识，且知识库足够大时，那么除了微调大模型外，RAG 就是非常有效的一种解决方案。LangChain 对这一流程提供了解决方案。

#### RAG优缺点

##### RAG的优点

- 相比提示词工程，RAG 有更丰富的上下文和数据样本，可以不需要用户提供过多的背景描述，就能生成比较符合用户预期的答案。

- 相比于模型微调，RAG 可以提升问答内容的时效性和可靠性。

- 在一定程度上保护了业务数据的隐私性。

##### RAG的缺点

- 由于每次问答都涉及外部系统数据检索，因此 RAG 的响应时延相对较高。

- 引用的外部知识数据会消耗大量的模型 Token 资源。

#### RAG流程

典型的RAG有两个主要流程：

索引：从数据源提取数据，构建索引。

检索生成：接受用户查询并从索引中检索相关数据，然后将其传递给模型。。

索引阶段：

从各种数据源加载数据➡️

将文档切分为小块➡️

对文本块进行嵌入➡️

存储嵌入向量。

![image30](assets/lessons-langchain/image30.webp)

检索生成阶段：

根据用户输入，使用检索器从存储中检索相关文本块➡️

大模型使用包含问题和检索结果的提示生成回答。

![image31](assets/lessons-langchain/image31.webp)

### 文档加载

数据源可能包含多种格式的文件，如文本文档、Markdown，PDF 等。因此我们首先需要对各种格式的文件进行处理。LangChain 实现和集成了众多文档加载器，方便从不同格式的文件中加载数据。可在 https://docs.langchain.com/oss/python/integrations/document_loaders 查看所有集成的文档加载器。

LangChain 所有文档加载器都实现了 BaseLoader 接口，接口提供了通用的 load（一次加载所有文档） 与 lazy_load（以延迟方式加载文档） 方法，用于从数据源加载数据并处理为 Document 对象。

LangChain 实现了 Document 抽象，用于表示文本单元及其元数据，它包含三个属性：

- page_content：文本内容字符串。

- metadata：包含元数据的字典，如文档的来源等。

- id：可选，文档标识符。

#### 加载 TXT

```python
# pip install langchain_community
from langchain_community.document_loaders import TextLoader

docs = TextLoader(
    file_path="assets/sample.txt",  # 文件路径
    encoding="utf-8",  # 文件编码方式
).load()  # 返回List[Document]

print(docs)
# [Document(metadata={'source': 'asset/sample.txt'}, page_content='...')]
```

#### 加载 CSV

```python
# pip install langchain_community
from langchain_community.document_loaders.csv_loader import CSVLoader

# 加载所有列
docs = CSVLoader(
    file_path="assets/sample.csv",  # 文件路径
).load()  # 返回List[Document]

print(docs)

# 加载部分列
docs = CSVLoader(
    file_path="assets/sample.csv",  # 文件路径
    metadata_columns=["title", "author"],  # 将指定列作为元数据
    content_columns=["content"],  # 将指定列作为内容
).load()  # 返回List[Document]

print(docs)
```

#### 加载 JSON

LangChain 实现了 JSONLoader，用来将 JSON 和 JSONL 数据转换为 LangChain 文档对象。它使用指定的 jq 模式来解析 JSON 文件，从而将特定字段提取到 LangChain 文档的内容和元数据中。

如果要从 JSON Lines 文件加载文档，需传递 json_lines=True。

常见 jq schema 参考：

```python
JSON        -> [{"text": ...}, {"text": ...}, {"text": ...}]
jq_schema   -> ".[].text"

JSON        -> {"key": [{"text": ...}, {"text": ...}, {"text": ...}]}
jq_schema   -> ".key[].text"

JSON        -> ["...", "...", "..."]
jq_schema   -> ".[]"
```

详细用法可参考 https://jqlang.org/manual/#basic-filters。

举例：提取所有字段

```python
# pip install langchain_community jq
from langchain_community.document_loaders import JSONLoader

# 提取所有字段
docs = JSONLoader(
    file_path="assets/sample.json",  # 文件路径
    jq_schema=".",  # 提取所有字段
    text_content=False,  # 提取内容是否为字符串格式
).load()

print(docs)
```

举例：提取指定字段中的内容

```python
# pip install langchain_community jq
from langchain_community.document_loaders import JSONLoader

# 提取指定字段中的内容
docs = JSONLoader(
    file_path="assets/sample.json",  # 文件路径
    jq_schema=".data.items[]",  # 提取data.items中的数据
    text_content=False,  # 提取内容是否为字符串格式
).load()

print(docs)

docs = JSONLoader(
    file_path="assets/sample.json",  # 文件路径
    jq_schema=".data.items[].content",  # 提取data.items[].content中的数据
).load()

print(docs)

docs = JSONLoader(
    file_path="assets/sample.json",  # 文件路径
    jq_schema="""
        .data.items[] | {
            author,
            created_at,
            content: (.title + "\n" + .content)
        }
    """,  # 提取data.items中指定字段的数据
    text_content=False,  # 提取内容是否为字符串格式
).load()

print(docs)
```

#### 加载 HTML 网页

```python
# pip install langchain_community beautifulsoup4
import os
# 导入任何 langchain 组件之前，第一时间设置 UA
os.environ["USER_AGENT"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

from langchain_community.document_loaders import WebBaseLoader

# 先不加任何过滤，拿完整网页内容，验证是否能正常获取
loader = WebBaseLoader(
    web_paths=("https://www.atguigu.com",)
)

docs = loader.load()
print("=== 内容长度 ===", len(docs[0].page_content))
print(docs[0].page_content[:500])  # 只打印前500字，看是不是正常正文
```

#### 加载 Markdown

可以使用 Unstructured 文档加载器来加载多种类型的文件，关于如何在 LangChain 中使用 unstructured 生态系统，可参考这里。

可使用 UnstructuredMarkdownLoader 加载 Markdown 文件，需要 unstructured 包。

```python
# pip install langchain_community unstructured[md]
from langchain_community.document_loaders import UnstructuredMarkdownLoader

docs = UnstructuredMarkdownLoader(
    # 文件路径
    file_path="assets/sample.md",
    # 加载模式:
    #   single 返回单个Document对象
    #   elements 按标题等元素切分文档
    mode="elements",
).load()

print(docs)
```

#### 加载 Doc/Docx

```python
# pip install langchain_community unstructured[docx]
from langchain_community.document_loaders import UnstructuredWordDocumentLoader

docs = UnstructuredWordDocumentLoader(
    # 文件路径
    file_path="assets/sample.docx",
    # 加载模式:
    #   single 返回单个Document对象
    #   elements 按标题等元素切分文档
    mode="single",
).load()

print(docs)
```

#### 加载 PDF

PDF 存在多种来源格式，包括扫描版（图片 PDF）、电子文本版、混合版。并且布局格式也多种多样，包括单列布局、双列布局甚至竖排文本布局。并且包含段落、标题、页眉页脚、表格、数学公式、化学式、特殊符号、图片等各种元素。

因此，PDF 解析存在很多挑战。对于复杂 PDF，需要进行文本提取、布局检测、表格解析、公式识别等处理。

##### PyPDFLoader

```python
# pip install langchain_community
from langchain_community.document_loaders import PyPDFLoader

docs = PyPDFLoader(
    # 文件路径，支持本地文件和在线文件链接，如"https://arxiv.org/pdf/alg-geom/9202012"
    file_path="assets/sample.pdf",
    # 提取模式:
    #   plain 提取文本
    #   layout 按布局提取
    extraction_mode="plain",
).load()

print(docs)
```

##### UnstructuredPDFLoader

UnstructuredPDFLoader是对 unstructured 库的封装。支持布局识别与 OCR 提取文字。

使用UnstructuredPDFLoader，需要先下载 Poppler 和 Tesseract OCR。

Poppler 是一个开源的 PDF 文档处理库，用于渲染、解析和操作 PDF 文件。下载解压后将 .../poppler-24.08.0/Library/bin 添加到环境变量 Path 中即可。

Tesseract OCR 用于提取图片中的文字，在安装时需要选择 Additional language data(download) 来添加中文语言包。

![image32](assets/lessons-langchain/image32.webp)

安装后，将安装时设置的安装目录添加到环境变量 Path 中。

举例：

```python
# pip install unstructured[local-inference]
from langchain_community.document_loaders import UnstructuredPDFLoader

docs = UnstructuredPDFLoader(
    file_path="assets/sample.pdf",  # 文件路径
    # 加载模式:
    #   single: 返回单个Document对象
    #   elements: 按标题等元素切分文档
    mode="elements",
    # 加载策略:
    #   fast: pdfminer 提取并处理文本
    #   ocr_only: 转换为图片并进行 OCR
    #   hi_res: 识别文档布局，将OCR 输出与 pdfminer 输出融合
    strategy="hi_res",
    # 推断表格结构:仅 hi_res 下起效，如果为 True 则会在表格元素的元数据中添加 text_as_html
    infer_table_structure=True,
    # OCR 使用的语言: eng 英文，chi_sim 中文简体。语言列表参考 https://github.com/tesseract-ocr/langdata
    languages=["eng", "chi_sim"],
    # 更多参数详见 https://github.com/Unstructured-IO/unstructured/blob/main/unstructured/partition/pdf.py
).load()

print(docs)
```

##### MinerU（推荐使用）

MinerU 提供了 PDF、Word、PPT、图片等文件的解析，支持图像提取、OCR、公式、表格解析等功能。

调用在线服务：https://mineru.net/apiManage/docs。可以从本地批量上传文件进行解析，并接收解析结果。

```python
# MinerU API密钥（注意：不要硬编码密钥到公开代码，生产环境建议使用环境变量）
# sk-Omlm1szENvJ8FDVG3AC0X4ZQLevyycNkJkwJ9qlegpUsltSC

import os
import requests


def upload_files(file_paths: list[str]) -> str:
    """
    批量上传文件到MinerU服务
    1. 先请求接口获取预签名上传URL
    2. 使用PUT请求把本地文件上传到预签名地址
    :param file_paths: 本地文件路径列表
    :return: batch_id 批量任务ID，后续轮询结果需要使用该ID；异常返回None
    """
    # MinerU批量获取上传地址接口
    url = "https://mineru.net/api/v4/file-urls/batch"
    api_key = "sk-Omlm1szENvJ8FDVG3AC0X4ZQLevyycNkJkwJ9qlegpUsltSC"
    # 请求头，身份认证+JSON格式
    header = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    # 组装每个文件的元信息
    files_info = [
        {
            "name": os.path.basename(file_path),  # 提取文件名
            "is_ocr": True,                       # 开启OCR识别，扫描版PDF必须打开
            "data_id": f"file_{i}",               # 每个文件的唯一业务标识，用于后续结果匹配
        }
        for i, file_path in enumerate(file_paths)
    ]

    # 请求参数：文档解析配置 + 文件元信息
    data = {
        "enable_formula": True,    # 开启数学公式识别
        "enable_table": True,       # 开启表格识别
        "language": "ch",           # 文档语言 ch中文 en英文
        "files": files_info,
    }

    try:
        # POST请求，申请一批预签名上传地址
        response = requests.post(url, headers=header, json=data)
        # HTTP状态码200代表网络请求成功
        if response.status_code == 200:
            result = response.json()
            print("response success. result:{}".format(result))
            # code=0代表业务成功，拿到batch_id和各个文件的上传url
            if result["code"] == 0:
                batch_id = result["data"]["batch_id"]
                urls = result["data"]["file_urls"]
                print("batch_id:{}\nurls:{}".format(batch_id, urls))

                # 循环：读取本地文件，PUT上传到预签名URL
                for i in range(0, len(urls)):
                    with open(file_paths[i], "rb") as f:
                        res_upload = requests.put(urls[i], data=f)
                        if res_upload.status_code == 200:
                            print(f"{urls[i]} upload success")
                        else:
                            print(f"{urls[i]} upload failed")
                return batch_id
            else:
                # API业务返回错误，打印错误信息
                print("apply upload url failed,reason:{}".format(result.msg))
        else:
            # HTTP非200，打印状态码与原始响应
            print(
                "response not success. status:{} ,result:{}".format(
                    response.status_code, response
                )
            )
    except Exception as err:
        # 捕获网络异常、解析异常等
        print(err)


def download_files(batch_id):
    """
    批量获取解析任务结果，轮询直到全部任务完成/失败
    :param batch_id: 上传阶段返回的批量任务ID
    输出：解析后的zip包保存到 parsed_files 文件夹
    """
    # 没有文件夹就自动创建
    os.makedirs("parsed_files", exist_ok=True)
    # 批量任务结果查询接口
    url = f"https://mineru.net/api/v4/extract-results/batch/{batch_id}"
    # 注意：这里代码读取环境变量，和upload_files写死api_key不一致，生产建议统一用环境变量
    api_key =  "sk-Omlm1szENvJ8FDVG3AC0X4ZQLevyycNkJkwJ9qlegpUsltSC"
    header = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    failed_files = set()  # 存储处理失败的文件信息
    done_files = set()    # 存储处理完成的文件信息

    # 轮询循环：等待所有文件处理结束（done / failed）
    while True:
        # 请求获取当前批次所有文件的处理状态
        res = requests.get(url, headers=header)
        extract_results = res.json()["data"]["extract_result"]

        for result in extract_results:
            if result["state"] == "failed":
                # 文件解析失败，加入失败集合
                failed_files.add(str(result))
            elif result["state"] == "done":
                # 文件解析完成，下载完整结果zip包
                done_files.add(str(result))
                full_zip_url = result["full_zip_url"]
                # stream=True流式下载，适合大文件，不会一次性读入内存
                res_download = requests.get(full_zip_url, stream=True)
                # 保存zip到本地，文件名拼接原文件名+data_id防止重名覆盖
                with open(
                    f"parsed_files/{result['file_name']}_{result['data_id']}.zip", "wb"
                ) as f:
                    for chunk in res_download.iter_content(chunk_size=1024):
                        f.write(chunk)

        # 退出条件：失败+完成的文件总数 = 总文件数，全部处理完毕跳出循环
        if len(failed_files) + len(done_files) == len(extract_results):
            break

    # 打印失败、成功的文件信息
    for i in failed_files:
        print(i)
    for i in done_files:
        print(i)


# ----------------主程序入口----------------
# 需要解析的本地PDF文件路径
file_paths = ["assets/sample.pdf"]
# 1.上传文件，拿到batch_id
batch_id = upload_files(file_paths)
# 2.轮询等待解析完成，下载结果zip包
download_files(batch_id)
```

### 文档切分

#### 为什么切分

获取 Document 对象后，需要将其切分成 Chunk。之所以要进行切分是出于以下考虑：

- 后续需要根据提问检索出相关的内容放入 Prompt，如果答案出现在某一个 Document 对象中，那么将检索到的整个 Document 对象直接放入 Prompt 中并不是最优的选择，因为 Document 可能包含非常多无关的信息，这些无效信息会干扰大模型的生成。

有研究发现，尽管大模型能够处理长文本输入，但它们在利用长上下文方面存在显著不足。尤其是在多文档问答和键值检索等任务中，当相关信息位于输入文本的中间时，模型的性能显著下降。这种现象表明，当前的语言模型在长输入上下文中未能充分利用信息，尤其是位于中间部分的信息。

- 大模型存在最大输入的 Token 限制，如果一个 Document 非常大，在输入大模型时会被截断，导致信息缺失。

基于此，一个方法是将完整的 Document 进行分块处理（Chunking），将 Document 切分为一个个小块（Chunk）。无论是在存储还是检索过程中，都将以这些块为基本单位，这样能有效地避免内容噪声干扰和超出最大 Token 的问题。

#### 切分策略

- 按照固定字符数或 Token 数来切分，但可能会在不适当的位置切断句子。

- 递归使用多个分隔符切分，同时尽量保证字符数或 Token 数不超出限制。能保证不切断完整的句子。

- 语义切分：根据文本的语义内容切分，旨在保持相关信息的集中和完整，适用于需要高度语义保持的场景。但处理速度较慢，且可能出现不同块之间长度极不均衡的情况。具体切分过程为：将相邻的几个句子拼成一个句组。对所有句组进行嵌入，并比较嵌入向量的距离，找到语义变化大的位置，根据阈值确定切分点（比如计算相邻句子嵌入向量的余弦距离，取距离分布的第 N 百分位值作为阈值，高于此值则切分）。按照切分点切分出若干个语义段，并合并某些长度很短的语义段。

#### RecursiveCharacterTextSplitter

RecursiveCharacterTextSplitte（递归字符文本切分器）是最常用的切分器，它由一个字符列表作为参数，默认列表为 ["\n\n", "\n", " ", ""]，并且会尝试按顺序使用这些字符进行切分，直到块足够小。由此尽可能地将所有段落（然后是句子，最后是词）保持在一起，因为这些段落通常看起来是语义上最相关的文本片段。

同时为了保证段之间语义完整，可以设置每个块之间有一部分重叠。

![image33](assets/lessons-langchain/image33.webp)

举例：

```python
# pip install langchain-text-splitters
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import UnstructuredWordDocumentLoader

# 加载文档
docs = UnstructuredWordDocumentLoader(
    file_path="assets/sample.docx", mode="single"
).load()

# 切分为文本块
chunks = RecursiveCharacterTextSplitter(
    separators=["\n\n", "\n", "。", "！", "？", "……", "，", ""],  # 分隔符列表
    chunk_size=400,  # 每个块的最大长度
    chunk_overlap=50,  # 每个块重叠的长度
    length_function=len,  # 可选：计算文本长度的函数，默认为字符串长度，可自定义函数来实现按 token 数切分
    add_start_index=True,  # 可选：块的元数据中添加此块起始索引
).split_documents(docs)

print(chunks)
```

### 文档嵌入

使用嵌入模型生成文档的嵌入向量，后续检索时用于与查询的嵌入向量进行相似度计算。

![image34](assets/lessons-langchain/image34.webp)

2018年谷歌推出的 BERT 能够将文本嵌入为简单的向量表示，但是 BERT 并未针对有效生成句子嵌入进行优化，由此促使了 Sentence-BERT 的诞生。Sentence-BERT 调整了 BERT 的架构以及预训练任务以生成包含语义的句子嵌入向量，这些嵌入向量可以通过余弦相似度等相似性指标轻松进行比较，大大降低了查找相似句子等任务的计算开销。

常用嵌入模型：

| 模型 | 机构 | 描述 |
| --- | --- | --- |
| bge-large-zh | 北京智源研究院（BAAI） | 开源，向量维度1024，序列长度512 |
| bge-base-zh | BAAI | 开源，向量维度768，序列长度512 |
| bge-small-zh | BAAI | 开源，向量维度512，序列长度512 |
| bge-m3 | BAAI | 开源，多语言，向量维度1024，序列长度8192 |
| text-embedding-3-small | OpenAI | 多语言，向量维度1536，序列长度8192 |
| text-embedding-3-large | OpenAI | 多语言，向量维度3072，序列长度8192 |

举例：

```python
# pip install sentence-transformers langchain_huggingface
import os
from langchain_huggingface import HuggingFaceEmbeddings

# 加载嵌入模型
embed_model = HuggingFaceEmbeddings(
    model_name=os.path.expanduser("~/models/bge-base-zh-v1.5")
)

# 单文本嵌入
query = "你好，世界"
print(embed_model.embed_query(query))

# 多文本嵌入
docs = ["你好，世界", "你好，世界"]
print(embed_model.embed_documents(docs))
```

### 向量存储

#### 向量数据库的理解

假设你是一名摄影师，拍了大量的照片。为了方便管理和查找，你决定将这些照片存储到一个数据库中。传统的关系型数据库（如 MySQL、PostgreSQL 等）可以帮助你存储照片的元数据，比如拍摄时间、地点、相机型号等。

但是，当你想要根据照片的内容（如颜色、纹理、物体等）进行搜索时，传统数据库可能无法满足你的需求，因为它们通常以数据表的形式存储数据，并使用查询语句进行精确搜索。那么此时，向量数据库就可以派上用场。

我们可以构建一个多维的空间使得每张照片特征都存在于这个空间内，并用已有的维度进行表示，比如时间、地点、相机型号、颜色….此照片的信息将作为一个点，存储于其中。以此类推，即可在该空间中构建出无数的点，而后我们将这些点与空间坐标轴的原点相连接，就成为了一条条向量，当这些点变为向量之后，即可利用向量的计算进一步获取更多的信息。当要进行照片的检索时，也会变得更容易更快捷。

注意，在向量数据库中进行检索时，并不是检索唯一的匹配结果，而是查询和目标向量最为相似的一些向量，具有模糊性。

延伸思考一下，只要对图片、视频、商品等素材进行向量化，就可以实现以图搜图、视频相关推荐、相似商品推荐等功能。

#### 常用的向量数据库

LangChain提供了众多向量存储的集成，包括开源的本地向量存储与云托管的私有向量存储。并公开了一个标准接口，可以轻松地在向量存储之间进行交换。

常用向量数据库：

| 向量数据库 | 描述 |
| --- | --- |
| FAISS | 一个用于高效相似性搜索和密集向量聚类的库 |
| Chroma | 开源的轻量级向量数据库，有极简的 API |
| Milvus | 开源的专为向量搜索设计的云原生数据库。性能强悍，功能丰富。覆盖轻量级的原型开发到十亿级向量的大规模生产系统 |
| Pgvector | 开源关系型数据库 PostgreSQL 的扩展，为PostgreSQL增加了向量数据类型和相似性搜索功能 |
| Redis | 开源内存数据结构存储，现已原生支持向量相似性搜索功能 |
| Elasticsearch | 开源分布式搜索和分析引擎，提供了一个基于文档的数据库，结构化、非结构化和向量数据通过高效的列式存储统一管理 |

这里我们使用 Milvus 作为向量存储。

#### Milvus 介绍

Milvus 通过 数据库—Collections—实体 的结构管理数据。Collections 和实体就类似关系型数据库中的表和记录。具体来说，Collection 是一个二维表，具有固定的列和变化的行。每列代表一个字段，每行代表一个实体。

![image35](assets/lessons-langchain/image35.webp)

Collection 通过 Collection Schema 来定义有哪些字段以及字段的类型、索引等。一个 Collection Schema 有一个主键、最多四个向量字段和若干标量字段。

主键用于唯一标识一个实体，只接受 Int64 或 VarChar 值。插入实体时，默认情况下应包含主键值。但是，如果在创建 Collections 时启用了 AutoId，Milvus 将在插入数据时生成主键值，此时插入的实体中不应包含主键值。

向量字段用于存储文本、图像和音频等非结构化数据类型的嵌入，可以是密集向量、稀疏向量或二进制向量。通常，密集向量用于语义搜索，而稀疏向量则更适合全文或词性匹配。

标量字段通常用来存储一些元数据，并可以在搜索时通过元数据进行过滤，以提高搜索结果的正确性。

| 字段类型 | 字段类型 | 字段 | 描述 |
| --- | --- | --- | --- |
| 向量字段 | 密集向量 | FLOAT_VECTOR | 32位浮点数列表 |
| 向量字段 | 密集向量 | FLOAT16_VECTOR | 16位半精度浮点数列表 |
| 向量字段 | 密集向量 | BFLOAT16_VECTOR | 16位浮点数列表，精度稍低，但指数范围与 Float32 相同 |
| 向量字段 | 密集向量 | INT8_VECTOR | 8位有符号整数向量 |
| 向量字段 | 稀疏向量 | SPARSE_FLOAT_VECTOR | 非零数字及其序列号列表 |
| 向量字段 | 二进制向量 | BINARY_VECTOR | 一个0和1的列表 |
| 标量字段 | 标量字段 | VARCHAR | 字符串 |
| 标量字段 | 标量字段 | BOOL | 存储true或false |
| 标量字段 | 标量字段 | INT | INT8、INT16、INT32、INT64 |
| 标量字段 | 标量字段 | FLOAT | 32位浮点数 |
| 标量字段 | 标量字段 | DOUBLE | 64位双精度浮点数 |
| 标量字段 | 标量字段 | ARRAY | 相同数据类型元素的有序集合 |
| 标量字段 | 标量字段 | JSON | 结构化的键值数据 |

索引是建立在数据之上的附加结构，可以加快搜索速度。不同字段数据类型适用不同的索引类型。比如 FLOAT_VECTOR 可使用 HNSW（分层导航小世界）索引，VARCHAR 可使用 INVERTED（反转）索引。详见https://milvus.io/docs/index-explained.md。

Milvus 提供了多个版本以在不同场景下选择合适的使用方式：

- Milvus Lite：本地轻量化运行，通过 pip install pymilvus[milvus-lite] 即可安装。但 Milvus Lite 有一些限制，比如 Milvus Lite 仅支持 FLAT 索引类型。无论在 Collections 中指定了哪种索引类型，它都使用 FLAT 类型。

- Milvus Standalone：单点部署，支持通过 Docker 部署。

- Milvus Distributed：分布式部署，支持在 Kubernetes 集群上部署。

#### 创建 Collection

```python
# pip install pymilvus[milvus-lite] 
# pip install milvus-lite 
from pprint import pprint
from pymilvus import MilvusClient, DataType

# 实例化向量数据库客户端
client = MilvusClient(
    uri="./milvus_demo.db",  # 数据存储在本地当前目录下
)
# 创建 schema
def build_schema():
    return (
        MilvusClient.create_schema(
            # 自动分配主键
            auto_id=True,
            # 启用动态字段，未在 Schema 中声明的字段会以键值对的形式存储在这个动态字段
            enable_dynamic_field=True,
        )
        # 添加 id 字段，类型为整数，设置为主键
        .add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
        # 添加 vector 字段，类型为浮点数向量，维度为 768
        .add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=768)
        # 添加 text 字段，类型为字符串，最大长度为 1024
        .add_field(field_name="text", datatype=DataType.VARCHAR, max_length=1024)
        # 添加 metadata 字段，类型为 JSON
        .add_field(field_name="metadata", datatype=DataType.JSON)
    )

# 创建 index
def build_index():
    index_params = MilvusClient.prepare_index_params()
    index_params.add_index(
        field_name="vector",  # 建立索引的字段
        index_type="FLAT",  # 索引类型
        metric_type="L2",  # 向量相似度度量方式
    )
    return index_params

# 创建 collection
if client.has_collection(collection_name="demo_collection"):
    client.drop_collection(collection_name="demo_collection")
client.create_collection(
    collection_name="demo_collection",  # collection 名称
    schema=build_schema(),  # collection 的 schema
    index_params=build_index(),  # collection 的 index
)

# 查看 collection
print(client.list_collections())

print("*" * 100)

# 查看 collection 描述
pprint(client.describe_collection(collection_name="demo_collection"))
```

#### 操作实体

##### 插入实体

```python
import os

from langchain.chat_models import init_chat_model
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from pymilvus import MilvusClient
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import UnstructuredWordDocumentLoader

# 创建Milvus‑Lite客户端对象，连接本地向量数据库
client = MilvusClient(
    uri="./demo.db",  # uri指定本地数据库存放目录，当前项目下milvus_demo.db文件夹
)

# 创建Word文档加载器对象，指定要读取的docx文件路径
loader = UnstructuredWordDocumentLoader(
    file_path="assets/sample.docx",  # word文件路径
    mode="single",  # single模式：整个文档读取为1个Document对象，不按页面拆分
)
# 调用load()执行读取，返回Document对象列表，每个Document包含page_content(文本)、metadata(元数据)
docs = loader.load()

# 实例化递归字符文本分割器，用来切割长文本
text_splitter = RecursiveCharacterTextSplitter(
    # 分割符列表：从左到右优先使用，找不到就用下一个，最后空字符串强制切割
    separators=["\n\n", "\n", "。", "！", "？", "……", "，", ""],
    chunk_size=400,       # 每个文本块最大字符长度
    chunk_overlap=50,     # 相邻块重叠50个字符，避免一句话被切分到两个块丢失语义
)
# 对读取到的文档执行切分，返回切分后的多个Document对象列表
chunks = text_splitter.split_documents(docs)
# 实例化BGE中文嵌入模型对象，用于文本转向量
embed_model = HuggingFaceEmbeddings(
    # expanduser解析路径，加载本地bge-base-zh-v1.5模型文件夹
    model_name=os.path.expanduser("D:/课件/尚硅谷大模型/14_尚硅谷大模型技术之langchain/2.资料/bge-base-zh-v1.5")
)
# 取出每个chunk的page_content（文本内容），批量转为向量，得到向量列表
# embed_documents：批量对多个文本生成向量
embeddings = embed_model.embed_documents([chunk.page_content for chunk in chunks])
# 初始化空列表，用来存准备插入Milvus的数据
data = []
# 同时遍历文本块、对应向量，一一配对
for chunk, embedding in zip(chunks, embeddings):
    # 构造一条Milvus需要的字典记录
    row = {
        "vector": embedding,          # 文本对应的向量
        "text": chunk.page_content,   # 切分后的原始文本
        "metadata": chunk.metadata,   # 元数据，文档来源信息
    }
    # 把这条记录追加到data列表
    data.append(row)
# 批量插入数据到demo_collection集合中
res = client.insert(collection_name="demo_collection", data=data)
print(res)  # 打印插入返回结果，包含insert_count插入数量、ids自动生成的主键ID列表
```

##### 查询实体

```python
# 从pymilvus库导入MilvusClient，用于操作Milvus‑Lite本地向量数据库
from pymilvus import MilvusClient

# 创建Milvus‑Lite客户端实例，连接本地向量数据库
client = MilvusClient(
    uri="./milvus_demo.db",  # uri 指定本地数据库存放目录，会生成milvus_demo.db文件夹
)

# load_collection：把集合的索引加载进内存
# 新开脚本运行必须执行，否则get、query、search会报集合处于released状态
client.load_collection(collection_name="demo_collection")

# get方法：根据主键_id精确查询数据，ids参数填写要查询的主键编号
# output_fields：指定查询之后，返回哪些字段，这里返回text文本、metadata元数据
res = client.get(
    collection_name="demo_collection",
    ids=[1, 2],                      # 根据主键_id，查询id等于1和2的两条记录
    output_fields=["text", "metadata"], # 指定需要返回的字段，不写不会返回文本和元数据
)

print(res)

print("*" * 100)

# query方法：条件查询，可以写过滤表达式，不依赖向量，类似数据库的where条件
res = client.query(
    collection_name="demo_collection",
    # 过滤条件：JSON元数据里面source字段等于文档路径assets/sample.docx
    filter='metadata["source"] == "assets/sample.docx"',
    output_fields=["text", "metadata"], # 指定返回文本和元数据字段
    limit=2,                              # limit：最多返回满足条件的2条结果，不是取id=2
)

# 打印query查询返回的结果
# 注意：metadata字段返回的是字符串，不是python字典，需要ast.literal_eval解析
print(res)
```

##### 删除实体

```python
from pymilvus import MilvusClient

# 实例化向量数据库客户端
client = MilvusClient(
    uri="./milvus_demo.db",  # 数据存储在本地当前目录下
)

# 通过主键删除实体
res = client.delete(
    collection_name="demo_collection",
    ids=[1, 2],
)
print(res)

# 通过过滤条件(https://milvus.io/docs/zh/boolean.md)删除实体
res = client.delete(
    collection_name="demo_collection",
    filter='text LIKE "第%"',  # 使用 text 前缀过滤
)
print(res)
```

### 检索与生成

#### 检索

检索阶段：用户输入查询➡️计算嵌入向量➡️在向量存储中检索相似向量➡️返回相似向量对应的内容。

![image36](assets/lessons-langchain/image36.webp)



| 度量                      | 关注点                             | 得分规律       | 值域                                      | 关键特点                                                     | RAG 文本场景是否推荐           |
| ------------------------- | ---------------------------------- | -------------- | ----------------------------------------- | ------------------------------------------------------------ | ------------------------------ |
| **L2 欧氏距离**           | 向量在空间的直线距离（位置）       | **越小越相似** | `[0,+∞)`                                  | 关注向量的绝对距离；向量长度会影响结果                       | 不优先推荐，多用于图像、空间点 |
| **IP 内积 Inner Product** | 向量夹角 + 向量模长（长度）        | **越大越相似** | 无固定范围                                | 同时受方向、向量长度影响；**向量归一化后，IP 等价于 COSINE** | 向量做归一化后可以用，速度略快 |
| **COSINE 余弦相似度**     | **只看夹角方向，完全忽略向量长度** | **越大越相似** | `[-1,1]`；1 完全相同，0 无关，-1 完全相反 | 只关心 “语义像不像”，不受文本长短带来向量模长干扰            | ✅**RAG 文本检索首选**          |

举例：检索过程

```python
import os

from langchain.chat_models import init_chat_model
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from pymilvus import MilvusClient
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import UnstructuredWordDocumentLoader

# 创建Milvus‑Lite客户端对象，连接本地向量数据库
client = MilvusClient(
    uri="./milvus_demo.db",  # uri指定本地数据库存放目录，当前项目下milvus_demo.db文件夹
)

# 创建Word文档加载器对象，指定要读取的docx文件路径
loader = UnstructuredWordDocumentLoader(
    file_path="assets/sample.docx",  # word文件路径
    mode="single",  # single模式：整个文档读取为1个Document对象，不按页面拆分
)
# 调用load()执行读取，返回Document对象列表，每个Document包含page_content(文本)、metadata(元数据)
docs = loader.load()

# 实例化递归字符文本分割器，用来切割长文本
text_splitter = RecursiveCharacterTextSplitter(
    # 分割符列表：从左到右优先使用，找不到就用下一个，最后空字符串强制切割
    separators=["\n\n", "\n", "。", "！", "？", "……", "，", ""],
    chunk_size=400,       # 每个文本块最大字符长度
    chunk_overlap=50,     # 相邻块重叠50个字符，避免一句话被切分到两个块丢失语义
)
# 对读取到的文档执行切分，返回切分后的多个Document对象列表
chunks = text_splitter.split_documents(docs)
# 实例化BGE中文嵌入模型对象，用于文本转向量
embed_model = HuggingFaceEmbeddings(
    # expanduser解析路径，加载本地bge-base-zh-v1.5模型文件夹
    model_name=os.path.expanduser("D:/课件/尚硅谷大模型/14_尚硅谷大模型技术之langchain/2.资料/bge-base-zh-v1.5")
)
# 取出每个chunk的page_content（文本内容），批量转为向量，得到向量列表
# embed_documents：批量对多个文本生成向量
embeddings = embed_model.embed_documents([chunk.page_content for chunk in chunks])
# 初始化空列表，用来存准备插入Milvus的数据
data = []
# 同时遍历文本块、对应向量，一一配对
for chunk, embedding in zip(chunks, embeddings):
    # 构造一条Milvus需要的字典记录
    row = {
        "vector": embedding,          # 文本对应的向量
        "text": chunk.page_content,   # 切分后的原始文本
        "metadata": chunk.metadata,   # 元数据，文档来源信息
    }
    # 把这条记录追加到data列表
    data.append(row)
# 批量插入数据到demo_collection集合中
res = client.insert(collection_name="demo_collection", data=data)
print(res)  # 打印插入返回结果，包含insert_count插入数量、ids自动生成的主键ID列表

client.load_collection(collection_name="demo_collection")

def retrieval(query, embed_model, client):
    """检索并返回上下文"""
    query_embedding = embed_model.embed_query(query)  # 查询嵌入
    context = client.search(
        collection_name="demo_collection",  # collection 名称
        data=[query_embedding],  # 搜索的向量
        anns_field="vector",  # 进行向量搜索的字段
        # 度量方式：L2 欧氏距离/IP 内积/COSINE 余弦相似度
        search_params={"metric_type": "L2"},
        output_fields=["text", "metadata"],  # 输出字段
        limit=3,  # 搜索结果数量
    )
    return context

context = retrieval("不动产被占有了怎么办?", embed_model, client)
print(context)


```

向量相似性搜索算法：

ANN（近似近邻）和 KNN（最近邻）搜索是向量相似性搜索的常用方法。

在 KNN 搜索中，必须将向量空间中的所有向量与搜索请求中携带的查询向量进行比较，然后找出最相似的向量，费时费力。

而 ANN 搜索算法要求提供一个索引文件，记录向量 Embeddings 的排序顺序。当收到搜索请求时，使用索引文件作为参考，找到可能包含与查询向量最相似的向量嵌入的子组，根据指定的度量类型来测量查询向量与子组中的向量之间的相似度，根据与查询向量的相似度对组成员进行排序，并返回前 K 个成员。不过 ANN 搜索依赖于预建索引，搜索吞吐量、内存使用量和搜索正确性可能会因选择的索引类型而不同。

HNSW （分层导航小世界）是当下常用的一种基于图的索引算法，可以提高搜索高维浮点数向量时的性能。它具有出色的搜索精度和低延迟，但需要较高的内存开销来维护其分层图结构。该算法构建了一个多层图（类似不同缩放级别的地图），底层包含所有数据点，而上层则由从底层采样的数据点子集组成。在这种层次结构中，每一层都包含代表数据点的节点，节点之间由表示其接近程度的边连接。上层提供远距离跳转，以快速接近目标，而下层则进行细粒度搜索，以获得最准确的结果。其工作原理如下：

- 入口点：搜索从顶层的一个固定入口点开始，该入口点是图中的一个预定节点。

- 贪婪搜索：算法贪婪地移动到当前层的近邻，直到无法再接近查询向量为止。上层起到导航作用，作为粗过滤器，为下层的精细搜索找到潜在的入口点。

- 层层下降：一旦当前层达到局部最小值，算法就会利用预先建立的连接跳转到下层，并重复贪婪搜索。

- 最后细化：这一过程一直持续到最底层，在最底层进行最后的细化步骤，找出最近的邻居。

![image37](assets/lessons-langchain/image37.webp)

#### 生成

```python
import os

from langchain.chat_models import init_chat_model
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from pymilvus import MilvusClient
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import UnstructuredWordDocumentLoader

# ---------------------- 1.初始化Milvus‑Lite本地向量数据库客户端 ----------------------
# MilvusLite是轻量版本，不需要启动独立服务，直接读写本地db文件
client = MilvusClient(
    uri="./milvus_demo.db",  # uri指定本地数据库存放路径，生成milvus_demo.db本地数据库文件
)

# ---------------------- 2.加载Word文档 ----------------------
# 创建Word文档加载器对象，读取docx格式文档
loader = UnstructuredWordDocumentLoader(
    file_path="assets/sample.docx",  # word文档文件路径
    mode="single",  # single模式：将整个文档读取为1个Document对象，不按页面拆分
)
# 调用load()执行文档读取，返回Document对象列表
# Document对象包含page_content(文档文本内容)、metadata(文档元数据，来源、页码等)
docs = loader.load()

# ---------------------- 3.文档文本切分 ----------------------
# 实例化递归字符文本分割器：专门处理长文档，把大文本切为多个小块(chunk)
text_splitter = RecursiveCharacterTextSplitter(
    # 分割符优先级列表：优先使用前面符号切分，切分失败再使用后面符号，最后空字符强制切割
    separators=["\n\n", "\n", "。", "！", "？", "……", "，", ""],
    chunk_size=400,       # 每个文本块最大字符长度
    chunk_overlap=50,     # 相邻文本块重叠50字符，防止一句话被切割拆分丢失上下文语义
)
# 对读取的完整文档执行切分，输出切分完成后的Document对象列表
chunks = text_splitter.split_documents(docs)

# ---------------------- 4.初始化Embedding嵌入模型 ----------------------
# BGE中文向量模型，把自然语言文本转为向量，用于向量检索
embed_model = HuggingFaceEmbeddings(
    # os.path.expanduser解析本地模型路径，读取本地下载好的bge-base-zh-v1.5模型文件夹
    model_name=os.path.expanduser("D:/课件/尚硅谷大模型/14_尚硅谷大模型技术之langchain/2.资料/bge-base-zh-v1.5")
)

# ---------------------- 5.文本块生成向量 ----------------------
# embed_documents：批量接口，一次性对多个文本生成向量
# 遍历每一个chunk，取出page_content文本内容，批量向量化
embeddings = embed_model.embed_documents([chunk.page_content for chunk in chunks])

# ---------------------- 6.组装Milvus插入数据格式 ----------------------
data = []  # 空列表，用来存放待插入向量库的数据
# zip同时遍历切分后的文本块 和 对应的向量，一一配对
for chunk, embedding in zip(chunks, embeddings):
    row = {
        "vector": embedding,          # 文本对应的向量数组
        "text": chunk.page_content,   # 切分后的原始文本片段
        "metadata": chunk.metadata,   # 文档元数据，记录文件来源信息
    }
    data.append(row)

# ---------------------- 7.批量写入Milvus向量库 ----------------------
# 将组装完成的数据批量插入集合demo_collection
res = client.insert(collection_name="demo_collection", data=data)
print(res)  # 打印插入返回结果，包含insert_count插入数量、ids自动生成的主键ID列表

# 将集合加载到内存，后续才可以执行向量搜索
client.load_collection(collection_name="demo_collection")


def retrieval(query, embed_model, client):
    """
    RAG检索函数：输入用户问题，完成向量检索，返回匹配的文档片段
    :param query: 用户原始提问字符串
    :param embed_model: 嵌入模型实例
    :param client: Milvus客户端实例
    :return: 向量库搜索返回的匹配文档结果
    """
    # embed_query：把用户查询语句转为查询向量
    query_embedding = embed_model.embed_query(query)
    # 执行向量相似度搜索
    context = client.search(
        collection_name="demo_collection",  # 要检索的集合名称
        data=[query_embedding],  # 用户问题生成的查询向量，列表格式传入
        anns_field="vector",  # 指定执行向量检索的字段名
        # metric_type度量方式：L2欧氏距离 / IP内积 / COSINE余弦相似度
        search_params={"metric_type": "L2"},
        output_fields=["text", "metadata"],  # 查询结果返回的字段，取出原文和元数据
        limit=3,  # 返回top3相似度最高的文档片段
    )
    return context


# 测试检索函数，模拟用户提问
context = retrieval("不动产被占有了怎么办?", embed_model, client)
print(context)


# ========== LLM生成链路：构建RAG完整Chain ==========
# 初始化大模型，使用openai兼容接口调用qwen3.8-max
llm = init_chat_model(
    model="qwen/qwen3.8-max",
    model_provider="openai",
    base_url=os.getenv("OPENAI_BASE_URL"),
    api_key=os.getenv("OPENAI_API_KEY")
)

# 构建Prompt模板：system设定任务，传入检索出来的参考上下文；human传入用户问题
template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "# 任务\n\n根据上下文参考，回答用户的问题。\n\n# 上下文参考\n\n{context}",
        ),
        ("human", "{query}"),
    ]
)

# 组装RAG执行链
rag_chain = (
    # RunnablePassthrough原样透传用户输入；lambda调用检索函数拿到检索上下文
    {
        "query": RunnablePassthrough(),
        "context": lambda x: retrieval(query=x, embed_model=embed_model, client=client),
    }
    | template       # 填充prompt模板
    | llm            # 送入大模型推理
    | StrOutputParser()  # 将模型输出转为普通字符串
)

# stream流式调用，逐块输出回答结果
res_chunks = rag_chain.stream(input="不动产被占有了怎么办?")
for chunk in res_chunks:
    print(chunk, end="", flush=True)
```

## Agents

### Agent 介绍

通用人工智能（AGI）将是 AI 的终极形态，几乎已成为业界共识。同样，构建 Agent则是 AI 工程应用当下的“终极形态”。

将 AI 和人类协作的程度类比自动驾驶的不同阶段：

![image38](assets/lessons-langchain/image38.webp)

语言模型本身无法采取行动——它们只是输出文本。LangChain 的一个重要功能是创建Agent。Agent 是一种使用 LLM 作为推理引擎的系统，它决定要采取哪些行动以及这些行动的输入应该是什么。这些行动的结果可以反馈给 Agent，由 Agent 决定是否需要采取更多行动，或者是否可以完成。

与传统的固定流程链不同，Agent 具备一定的自主决策能力，更适合处理开放式、多步骤的问题。它可以拆解任务，根据任务动态决定调用哪些工具，并利用中间结果推进任务。

![image39](assets/lessons-langchain/image39.webp)

Agent 的核心能力/组件：

![image40](assets/lessons-langchain/image40.webp)

###### 大模型(LLM)：作为大脑，提供推理、规划和知识理解能力。

###### 记忆(Memory)：具备短期记忆和长期记忆，支持快速知识检索。

###### 工具(Tools)：调用外部工具（如API、数据库）的执行单元。

###### 规划(Planning)：任务分解、反思与自省框架实现复杂任务处理。

###### 行动(Action)：实际执行决策的能力。

###### 协作：通过与其他 Agent 交互合作，完成更复杂的任务目标。

### Tools

#### Tools 介绍

要构建更强大的 AI 工程应用，只有生成文本这样的“纸上谈兵”能力自然是不够的，借助工具，才能让 AI 应用的能力真正具备无限的可能。

工具封装了一个可调用函数及其输入模式。这些参数可以传递给兼容的聊天模型，从而允许模型决定是否调用工具以及调用哪些参数。在这种情况下，工具调用使模型能够生成符合指定输入模式的请求。

#### 创建工具

一个 Tool 通常包括工具名称，工具描述，以及工具参数的类型注解。

可以通过 @tool 装饰器来创建工具。

举例：通过 @tool 创建工具

```python
from langchain.tools import tool

@tool
def add_number(a: int, b: int) -> int:
    """两个整数相加"""
    return a + b

print(f"{add_number.name=}\n{add_number.description=}\n{add_number.args=}")

# add_number.name='add_number'
# add_number.description='两个整数相加'
# add_number.args={'a': {'title': 'A', 'type': 'integer'}, 'b': {'title': 'B', 'type': 'integer'}}
```

举例：通过 @tool 的参数修改属性

```python
from langchain.tools import tool
from pydantic import BaseModel, Field

class FieldInfo(BaseModel):
    a: int = Field(description="第1个参数")
    b: int = Field(description="第2个参数")

@tool(
    name_or_callable="add_2_number",
    description="计算两整数之和",
    args_schema=FieldInfo,  # 定义参数模式
)
def add_number(a: int, b: int) -> int:
    """两个整数相加"""
    return a + b

print(f"{add_number.name=}\n{add_number.description=}\n{add_number.args=}")

# add_number.name='add_2_number'
# add_number.description='计算两整数之和'
# add_number.args={'a': {'description': '第1个参数', 'title': 'A', 'type': 'integer'}, 'b': {'description': '第2个参数', 'title': 'B', 'type': 'integer'}}
```

#### 绑定工具

要想让大模型能够使用工具，首先需要将工具给到大模型。

创建模型实例，并通过 bind_tools 方法将工具绑定到大模型。

![image41](assets/lessons-langchain/image41.webp)

###### 大模型通过分析用户需求，判断是否需要调用工具。

###### 如果需要则在响应的 additional_kwargs 参数中包含工具调用的详细信息。

###### 使用模型提供的参数执行工具。

```python
import os
from langchain.tools import tool
from langchain.chat_models import init_chat_model
@tool
def query_user_info(user_id: int) -> str:
    """查询用户信息"""
    return {1001: "Jack", 1002: "Tom", 1003: "Alice"}[user_id]
llm = init_chat_model(model="qwen/qwen3.8-max", model_provider="openai", base_url=os.getenv("OPENAI_BASE_URL"),
                      api_key=os.getenv("OPENAI_API_KEY"), )
# 为模型提供工具
tools = [query_user_info]
llm_with_tools = llm.bind_tools(tools)
resp = llm_with_tools.invoke("帮我查下1001用户的信息")
print(resp.content)
print("*" * 20)
# content='\n\n我来帮您查询1001用户的信息。\n'
# additional_kwargs={'tool_calls': [{'id': '...', 'function': {'arguments': '{"user_id": 1001}', 'name': 'query_user_info'}
# 返回的响应中 additional_kwargs 参数中包括了工具调用的信息，此时还没有调用工具，只是返回了要调用的工具及参数
print(globals()["query_user_info"])
# 手动执行工具
for tool_call in resp.tool_calls:
    print(tool_call["name"])
    tool_name = tool_call["name"]  # 获取工具名称
    tool_args = tool_call["args"]  # 获取工具参数
    if tool_name == "query_user_info":
        tool_result = globals()[tool_name].invoke(tool_args)  # 执行工具
        print(tool_name, tool_args, tool_result)
```

### 构建 Agent

使用 create_agent 来创建 Agent，create_agent 使用 LangGraph 构建基于图的 Agent运行时。此 Agent 会在一个循环中反复调用模型和工具，直到某次模型输出中不再包含工具调用则结束。

![image42](assets/lessons-langchain/image42.webp)

使用 create_agent 创建 Agent 时，需传入模型和工具、可选地也可以传入系统提示词。

这里使用 Tavily （搜索引擎）作为工具，需要先获取它的 API-Key 并添加到环境变量。

```python
# pip install langchain-tavily
import os
from langchain_tavily import TavilySearch
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
# 定义模型
llm = init_chat_model(model="qwen/qwen3.8-max", model_provider="openai", base_url=os.getenv("OPENAI_BASE_URL"),
                      api_key=os.getenv("OPENAI_API_KEY"), )
# 定义 Tavily 搜索工具
search = TavilySearch(max_results=5)
tools = [search]
# 创建 Agent
agent = create_agent(
    model=llm,  # 模型
    tools=tools,  # 工具
    system_prompt="你是位助手，需要调用工具来帮助用户。",  # 系统提示词
)
# 调用 Agent
res = agent.invoke(
    {"messages": [{"role": "user", "content": "今天北京的天气怎么样？"}]}
)
# print(res)
final_answer = res["messages"][-1].content
print(final_answer)
```

如果 Agent 执行多个步骤，这可能需要一些时间。为了显示中间进度，我们可以使用 stream 流式返回消息。



### LangSmith

使用 LangChain 构建的许多应用程序都包含多个步骤，需要多次调用 LLM。随着这些应用程序变得越来越复杂，能够检查链或 Agent 内部的具体情况变得至关重要。最好的方法是使用 LangSmith。

注册 LangSmith，在 Settings ➡️ API Keys 下创建 API-Key 并复制。之后在环境变量中添加以开始记录跟踪：

LANGSMITH_TRACING="true"
LANGSMITH_API_KEY="..."

配置好环境变量之后，可在 LangSmith 的 Tracing Projects 中查看跟踪记录。

LangSmith 默认将跟踪记录到 default 项目，可通过 LANGSMITH_PROJECT 环境变量设置 LangSmith 跟踪记录保存到哪个项目，如果该项目不存在则会创建。

### 记忆

为了给代理添加短期记忆（线程级持久化），在创建代理时需要指定一个 checkpointer，并在调用代理时指定线程 ID。这个短期记忆的能力是借助 LangGraph 的状态和检查点实现的。

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

### MCP

#### MCP 介绍

Model Context Protocol（MCP，模型上下文协议）是一个开源协议，它标准化了大语言模型与外部工具和数据源通信的方式，允许开发者和工具提供商只需集成一次，就能与任何兼容 MCP 的系统交互。MCP 就像 USB-C 标准：不需要为每个设备使用不同的连接器，而是使用一个端口来处理多种类型的连接。

![image43](assets/lessons-langchain/image43.webp)

![image44](assets/lessons-langchain/image44.webp)

#### MCP 架构

MCP 遵循客户端-服务器架构，架构中包括：

| MCP 主机 | 协调和管理一个或多个 MCP 客户端的 AI 应用 |
| --- | --- |
| MCP 客户端 | 一个保持与 MCP 服务器连接的组件，通过 MCP 定义的消息处理通信，从服务器查找并请求资源和工具，并管理与服务器的连接生命周期 |
| MCP 服务器 | 一个向 MCP 客户端提供服务的程序，通过协议暴露工具、资源和提示模板功能 |

![image45](assets/lessons-langchain/image45.webp)

#### MCP 层级

MCP 分为两个层级：

###### 数据层

数据层实现了一个基于 JSON-RPC 2.0 的交换协议，该协议定义了消息结构和语义。

数据层包括生命周期管理（连接初始化、能力协商、连接终止）、服务器功能（提供工具、资源和提示模板）、客户端功能（调用LLM、获取输入、记录消息）、其他功能（实时更新通知、长时运行操作跟踪）。

###### 传输层

传输层定义了客户端与服务器之间数据交换的通信机制和通道，包括特定传输方式的连接建立、消息帧定界和授权。

MCP 支持多种传输机制，包括 Stdio、Streamable HTTP、SSE。

| Stdio | 使用标准输入和输出流，与在终端输入命令并看到响应时使用的机制相同。适用于本地开发 |
| --- | --- |
| Streamable HTTP | 该传输使用 HTTP POST 和 GET 请求，服务器可以选择使用SSE来流式传输多个服务器消息。支持流式传输和服务器到客户端通知，并支持标准 HTTP 身份验证方法，包括授权令牌、API 密钥和自定义头信息 |
| SSE | 带有 SSE（Server-Sent Events 服务器发送事件）的 HTTP，MCP早期传输机制，现逐渐被 Streamable HTTP 取代 |

#### MCP 工作流程

###### 初始化

在初始化过程中，AI 应用程序的 MCP 客户端管理器连接到配置的服务器，并将它们的能力存储起来以供后续使用。应用程序使用这些信息来确定哪些服务器可以提供特定类型的功能（工具、资源、提示），以及它们是否支持实时更新。

初始化有几个重要的作用：

| 协议版本协商 | 确保客户端和服务器使用兼容的协议版本，避免因版本不一致导致的通信问题 |
| --- | --- |
| 能力发现 | 声明各自支持的功能，包括他们能够处理的基元类型（工具、资源、提示）以及是否支持通知等特性 |
| 身份交换 | 交换客户端与服务器的身份及版本信息，便于后续的调试与兼容性管理 |

###### 工具发现

AI 应用程序从所有连接的 MCP 服务器中获取可用工具，并将它们组合成一个语言模型可以访问的统一工具注册表。这使得 LLM 能够理解它可以执行哪些操作，并在对话期间自动生成相应的工具调用。

连接建立之后，客户端可以通过发送 tools/list 请求来发现可用的工具。这个请求是 MCP 工具发现机制的基础—它允许客户端在尝试使用工具之前了解服务器上有哪些可用的工具。响应包含一个 tools 数组，该数组提供了关于每个可用工具的全面元数据。这种基于数组的结构允许服务器同时展示多个工具，同时保持不同功能之间的清晰界限。响应中的每个工具包括几个关键字段：

| name | 工具标识符 |
| --- | --- |
| title | 工具的易读显示名称 |
| description | 工具描述 |
| inputSchema | 一个定义预期输入参数的 JSON Schema，支持类型验证并提供关于必需和可选参数的清晰文档 |

###### 工具执行

当语言模型在对话中决定使用工具时，AI 应用程序会拦截工具调用，将其路由到合适的 MCP 服务器，执行该工具，并将结果作为对话流程的一部分返回给 LLM。这使 LLM 能够访问实时数据并在外部世界中执行操作。

客户端使用 tools/call 方法执行一个工具。tools/call 请求遵循结构化格式，确保客户端和服务器之间的类型安全和清晰通信。请求结构包括几个重要组件：

| name | 工具标识符 |
| --- | --- |
| arguments | 包含工具的 inputSchema 定义的输入参数 |

响应返回一个内容对象数组，允许进行丰富、多格式的响应（文本、图片、资源等）。每个内容对象都有一个 type 字段。

###### 实时更新

MCP 支持实时通知，使服务器能够在未经明确请求的情况下通知客户端有关变更。当 AI 应用程序收到关于工具变更的通知时，它会立即刷新其工具注册表并更新 LLM 的可用功能。这确保了正在进行的对话始终能够访问最新的一组工具，并且 LLM 可以随着新功能的可用而动态适应。

#### MCP SDK

##### Streamable HTTP 服务端与客户端

服务端 mcp_server_streamablehttp.py：

```python
# pip install fastmcp
from fastmcp import FastMCP

# 创建 MCP 实例
mcp = FastMCP("Demo")

# 为 MCP 实例添加工具
@mcp.tool()
def add(a: int, b: int) -> int:
    return a + b

# 为 MCP 实例添加资源
@mcp.resource("greeting://default")
def get_greeting() -> str:
    return "Hello from static resource!"

# 为 MCP 实例添加提示词
@mcp.prompt()
def greet_user(name: str, style: str = "friendly") -> str:
    styles = {
        "friendly": "写一句友善的问候",
        "formal": "写一句正式的问候",
        "casual": "写一句轻松的问候",
    }
    return f"为{name}{styles.get(style, styles['friendly'])}"

if __name__ == "__main__":
    # streamable‑http 默认 127.0.0.1:8000，访问路径 http://127.0.0.1:8000/mcp
    mcp.run(transport="streamable-http")

```

客户端：

```python
import asyncio
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

async def streamablehttp_run():
    url = "http://127.0.0.1:8000/mcp"

   
    async with streamable_http_client(url) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            # 获取工具
            tools = await session.list_tools()
            print("工具列表：", tools)
            # 调用工具
            call_res = await session.call_tool(name="add", arguments={"a": 1, "b": 2})
            print("调用add结果：", call_res)
            # 获取资源
            resources = await session.list_resources()
            print("资源列表：", resources)

if __name__ == "__main__":
    asyncio.run(streamablehttp_run())

```

#### LangChain 使用 MCP

LangChain Agent 可以通过 langchain-mcp-adapters 包使用 MCP 服务器上定义的工具。

这里使用了如下工具，需要先在相关平台创建 API-Key 并添加到环境变量：

阿里云百炼：https://bailian.console.aliyun.com/?tab=mcp#/mcp-market/detail/WebSearch

DASHSCOPE_API_KEY = your key

```python
# ========== 依赖安装说明 ==========

# pip install langchain-mcp-adapters

# ========== 导入所需模块 ==========
import os                     # 读取系统环境变量
import asyncio                # 异步编程支持，MCP和Agent调用均为异步接口
from dotenv import load_dotenv  # 加载 .env 文件中的环境变量，避免密钥硬编码
from langchain.agents import create_agent  # 创建具备工具调用能力的智能体
from langchain.chat_models import init_chat_model  # 统一初始化大语言模型
from langchain_mcp_adapters.client import MultiServerMCPClient  # MCP多服务客户端，对接MCP工具



# ========== 主异步函数 ==========
async def main():
    # 从环境变量中读取百炼API密钥，避免硬编码泄露
    api_key = os.getenv("DASHSCOPE_API_KEY")

    # ========== 配置 MCP 客户端 ==========
    # MultiServerMCPClient 可以同时管理多个 MCP 服务，这里只接入百炼网页搜索工具
    mcp_client = MultiServerMCPClient(
        {
            # 自定义服务名称，用于区分多个MCP服务
            "WebSearch": {
                # 传输协议：使用 http 协议（Streamable HTTP，MCP新版标准协议）
                "transport": "http",
                # 阿里云百炼 WebSearch MCP 服务的官方请求端点
                "url": "https://dashscope.aliyuncs.com/api/v1/mcps/WebSearch/mcp",
                # 请求头：携带鉴权密钥 + 指定请求体格式为JSON
                "headers": {
                    "Authorization": f"Bearer {api_key}",  # Bearer Token 鉴权
                    "Content-Type": "application/json"     # 指定请求数据格式
                },
            }
        }
    )

    # ========== 获取 MCP 工具列表 ==========
    # 异步连接MCP服务，拉取服务端定义的所有工具，转为LangChain可识别的工具对象
    tools = await mcp_client.get_tools()
    print("成功加载MCP工具：", [t.name for t in tools])

    # ========== 初始化大语言模型 ==========
    # 通过 OpenAI 兼容格式接入模型，base_url 和 api_key 从环境变量读取
    llm = init_chat_model(
        model="qwen/qwen3.8-max",       # 指定使用的模型名称
        model_provider="openai",        # 声明使用OpenAI兼容协议调用
        base_url=os.getenv("OPENAI_BASE_URL"),  # 模型服务的接口地址
        api_key=os.getenv("OPENAI_API_KEY"),    # 模型服务的鉴权密钥
    )

    # ========== 创建 Agent 智能体 ==========
    # 将大模型和MCP工具绑定，生成具备工具调用能力的Agent，自动判断何时调用工具
    agent = create_agent(model=llm, tools=tools)

    # ========== 流式调用 Agent ==========
    # 以流式方式执行对话，逐块返回结果；Agent会自主决定是否调用搜索工具来回答问题
    async for chunk in agent.astream(
        {
            "messages": [
                # 系统提示词：设定Agent的角色和行为规则
                {"role": "system", "content": "你是助手，必要时调用搜索工具回答问题。"},
                # 用户提问：触发Agent推理，必要时自动调用WebSearch搜索实时信息
                {"role": "user", "content": "深圳今天天气怎么样"}
            ]
        }
    ):
        # 逐块打印流式返回的内容
        print(chunk, end="\n\n")

# ========== 程序入口 ==========
# Python异步程序标准写法，通过asyncio.run启动主协程
if __name__ == "__main__":
    asyncio.run(main())
```

### 监督者模式多 Agnet 架构

监督者（主管）模式是一种多 Agnet 架构，其中中央主管 Agnet 负责协调各专业工作 Agent 。当任务需要不同类型的专业知识时，这种方法非常有效。与其构建一个管理跨领域工具选择的 Agnet ，不如创建由了解整体工作流程的主管协调的、专注的专家。

在 LangChain 中可以将 Agent 封装为工具，将工具绑定到主管 Agent 来实现主管多代理模式。

![image46](assets/lessons-langchain/image46.webp)

举例：创建两个子 Agent，分别带有搜索功能和发送邮件功能，并通过主管 Agent 调用子 Agent。

```python
import os
import asyncio
import smtplib
from dotenv import load_dotenv
from langchain.tools import tool
from email.mime.text import MIMEText
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain_mcp_adapters.client import MultiServerMCPClient

# 加载 .env 文件中的环境变量（必须放在读取密钥之前）
load_dotenv()

llm = init_chat_model(
    model="qwen/qwen3.8-max",  # 指定使用的模型名称
    model_provider="openai",  # 声明使用OpenAI兼容协议调用
    base_url=os.getenv("OPENAI_BASE_URL"),  # 模型服务的接口地址
    api_key=os.getenv("OPENAI_API_KEY"),  # 模型服务的鉴权密钥
)
# ========== 创建一个有搜索功能的子Agent ==========
class SearchSubAgent:
    """带搜索功能的子Agent，仅使用阿里云百炼WebSearch MCP"""

    def __init__(self):
        # 移除了Smithery RailService，仅保留百炼网页搜索工具
        self.tools = asyncio.run(
            MultiServerMCPClient(
                {
                    "WebSearch": {
                        "transport": "http",  # 改用新版Streamable HTTP协议，兼容最新SDK
                        "url": "https://dashscope.aliyuncs.com/api/v1/mcps/WebSearch/mcp",  # 官方新版端点
                        "headers": {
                            "Authorization": f"Bearer {os.getenv('DASHSCOPE_API_KEY')}",
                            "Content-Type": "application/json"
                        },
                    }
                }
            ).get_tools()
        )

        self.agent = create_agent(model=llm, tools=self.tools)

    async def __call__(self, input: str) -> str:
        return await self.agent.ainvoke(
            {"messages": [{"role": "user", "content": input}]}
        )

# ========== 创建一个能发送邮件的子Agent ==========
@tool
async def send_email(to: list[str], subject: str, body: str) -> str:
    """
    发送邮件。需要自动生成邮件主题。

    Args:
        to: 收件人
        subject: 邮件主题
        body: 邮件正文
    """
    SMTP_HOST = "smtp.qq.com"
    SMTP_USER = "dong-1122@qq.com"
    SMTP_PASS = "vyghsxxshoaqbiib"  # 需要在邮箱中开启 SMTP 并生成授权码

    msg = MIMEText(body, "plain", "utf-8")
    msg["From"] = SMTP_USER
    msg["Subject"] = subject

    try:
        server = smtplib.SMTP_SSL(SMTP_HOST, 465, timeout=10)
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, to, msg.as_string())
        try:
            server.quit()
        except smtplib.SMTPResponseException as e:
            if e.smtp_code == -1 and e.smtp_error == b"\x00\x00\x00":
                pass  # 忽略无害的关闭异常
            else:
                raise
        return "success"
    except Exception as e:
        return f"Send failed: {type(e).__name__} - {e}"

class EmailSubAgent:
    """带发送邮件功能的子代理"""

    def __init__(self):
        self.tools = [send_email]

        self.agent = create_agent(model=llm, tools=self.tools)

    async def __call__(self, input: str) -> str:
        return await self.agent.ainvoke(
            {"messages": [{"role": "user", "content": input}]}
        )

search_subagent = SearchSubAgent()
email_subagent = EmailSubAgent()

# ========== 将子 Agent 包装为工具 ==========
@tool
async def search(input: str) -> str:
    """
    一个具有搜索功能的子Agent，功能包括：
    - 搜索网页
    - 搜索天气、公开票务信息等网络内容
    """
    return await search_subagent(input)

@tool
async def email(input: str) -> str:
    """
    一个具有发送邮件功能的子Agent
    """
    return await email_subagent(input)

# ========== 创建主管 Agent ==========
supervisor_agent = create_agent(
    model=llm,
    tools=[search, email],
    system_prompt="你是一个主管，需要调用子Agent来帮助用户",
)

async def main():
    async for chunk in supervisor_agent.astream(
        {
            "messages": [
                {
                    "role": "user",
                    "content": "北京明天天气怎么样，要是还不错的话，帮我看看明天上海到北京的车票。如果天气好的话，发送邮件给442334952@qq.com告诉他我明天去北京。如果天气不好的话就告诉他我明天不去北京了。",
                }
            ]
        }
    ):
        print(chunk, end="\n\n")

asyncio.run(main())
```

---

## 动手练习与验收标准

> 素材出处：`举个栗子/举个栗子/day27/day27-代码/day27/demo1/lc_1.py`、`举个栗子/举个栗子/day27/day27-代码/day27/demo2/lc_1.py`、`举个栗子/举个栗子/day28/day28-代码/day28/demo1/lc_6.py`、`举个栗子/举个栗子/day28/day28-代码/day28/demo3/lc_2.py`

### 练习 1：Model + Prompt + Parser 三段式调用

先不用 Chain，手动把“提示词模板 → 大模型 → 字符串解析器”串起来，确认每一步的输入输出类型。模型接口通过环境变量配置，密钥需自己到平台申请。

```python
"""
    非Chains方式调用
"""
import os

from langchain.chat_models import init_chat_model
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate

llm = init_chat_model(
    model="qwen/qwen3.5-122b-a10b",
    model_provider="openrouter",  # 很多模型书写 openai也是可以的
    api_key = os.getenv("OPENAI_API_KEY"),
    base_url = os.getenv("OPENAI_API_URL")
)

template = PromptTemplate.from_template("你是一个{role},请围绕{topic}主题科普一个小知识")


t1 = template.invoke({"role" : "科学家" , "topic" : "地理"})

resp = llm.invoke(t1)

str_parser = StrOutputParser()

print(str_parser.invoke(resp))
```

**验收标准**

- `print(type(t1))` 输出 `StringPromptValue`，`t1.to_string()` 中的 `{role}`、`{topic}` 已被替换为“科学家”“地理”；
- `print(type(resp))` 输出 `AIMessage`，`resp.content` 是一段中文科普文本；
- 最终输出为 `<class 'str'>`，不再带 `content=`、`additional_kwargs=` 等 `AIMessage` 的字段包装；
- 缺少 `OPENAI_API_KEY` 或 `OPENAI_API_URL` 时，构造 `init_chat_model` 或 `invoke` 阶段抛出认证/连接异常，而不是静默返回空串。

### 练习 2：用 LCEL 把两条链并行执行

同一个输入 `{"topic": "程序员"}` 要同时产出笑话和诗歌，用 `RunnableParallel` 让两条链并行，而不是先后调用两次。

```python
"""
    RunnableParallel 可运行并行
"""
import os

from langchain.chat_models import init_chat_model
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableParallel

llm = init_chat_model(
    model="qwen/qwen3.5-122b-a10b",
    model_provider="openrouter",  # 很多模型书写 openai也是可以的
    api_key = os.getenv("OPENAI_API_KEY"),
    base_url = os.getenv("OPENAI_API_URL")
)


t1 = PromptTemplate.from_template("讲一个关于{topic}的笑话")
t2 = PromptTemplate.from_template("写一首关于{topic}的诗歌")


chain_1 = t1 | llm | StrOutputParser()
chain_2 = t2 | llm | StrOutputParser()

all_chains = RunnableParallel(c1 = chain_1,c2 = chain_2)

resp = all_chains.invoke({"topic" : "程序员"})

print(resp)
```

**验收标准**

- `resp` 是 `dict`，键恰好为 `c1`、`c2`，两个值都是非空字符串；
- `c1` 的内容是笑话、`c2` 的内容是诗歌，没有互相串味；
- `print(type(all_chains))` 输出 `RunnableParallel`；把 `RunnableParallel(...)` 换成同结构的字典 `{"c1": chain_1, "c2": chain_2}`，输出结构不变（LCEL 会把字典自动当作并行处理）；
- 两条链共用一个 `llm` 实例，不需要写两次 `invoke`，也不需要手动合并两个返回值。

### 练习 3：RAG 的“检索 + 生成”最小闭环

前置条件：本机 `day28/demo1` 目录下已有 Milvus Lite 数据库 `demo.db`，集合名为 `collection_demo`；嵌入模型需使用本机实际下载的 `bge-base-zh-v1.5` 目录，把下面 `model_name` 改成自己的路径，目录不存在会抛 `OSError`。若检索报集合处于 `released` 状态，先执行 `client.load_collection(collection_name="collection_demo")`（见同目录 `lc_5.py` 注释）。课件原文的 `output_fields` 写成了 `meda_data`（拼写错误），这里按 collection 实际字段改为 `metadata`，否则可能报字段不存在。

```python
"""
    生成答案
"""
import os

from langchain.chat_models import init_chat_model
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from pymilvus import MilvusClient

llm = init_chat_model(
    model="qwen/qwen3.5-122b-a10b",
    model_provider="openrouter",  # 很多模型书写 openai也是可以的
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_API_URL")
)


def retrieval(query: str, embed_model: HuggingFaceEmbeddings, ms_client: MilvusClient):
    query_vector = embed_model.embed_query(query)

    content = ms_client.search(
        collection_name="collection_demo",
        data=[query_vector],
        anns_field="vector",
        search_params={"metric_type": "L2"},
        output_fields=["text", "metadata"],
        limit=3
    )
    return content


embed = HuggingFaceEmbeddings(
    model_name=os.path.expanduser("D:/课件/尚硅谷大模型/14_尚硅谷大模型技术之langchain/大模型相关资料/bge-base-zh-v1.5")
)

client = MilvusClient(
    uri="./demo.db"  # 必须以db结尾 否则报错
)

result = retrieval("不动产被占用了怎么办？", embed, client)

print(result)

template = ChatPromptTemplate.from_messages(
    [
        ("system", "任务\n\n 根据上下文参考,回答用户的问题。  上下文参考\n\n{context}  "),
        ("user", "{query}")
    ]
)

rag_chain = ({
                 "query": RunnablePassthrough(),
                 "context": lambda x: retrieval(query=x, embed_model=embed, ms_client=client)
             }
             | template
             | llm
             | StrOutputParser()
             )

res_chunks = rag_chain.stream(input="不动产被占用了怎么办？")

for chunk in res_chunks:
    print(chunk,end="",flush=True)
```

**验收标准**

- `print(result)` 输出嵌套列表：外层长度为 1（一次查询），内层长度为 3（`limit=3`）；
- 内层每条命中是 `dict`，含 `id`、`distance`、`entity`，且 `entity["text"]` 是非空的 `sample.docx` 原文片段；`distance` 为 L2 距离，数值越小越相似；
- `rag_chain.stream` 逐块打印中文且不换行，拼接后是一段围绕“不动产被占用”的完整回答，而不是“我无法回答”；
- 把 `retrieval` 的返回值临时改成 `[]` 再运行，模型回答明显变成不引用原文的泛泛而谈，可与原结果对比。

### 练习 4：用 create_agent 让模型自己调用工具

前置条件：`pip install langchain-tavily`，并到 Tavily 控制台申请密钥配置到环境变量 `TAVILY_API_KEY`；模型密钥仍用 `OPENAI_API_KEY` / `OPENAI_API_URL`。

```python
"""
    使用工具进行天气的查询
"""
import os

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain_tavily import TavilySearch

llm = init_chat_model(
    model="qwen/qwen3.5-122b-a10b",
    model_provider="openrouter",  # 很多模型书写 openai也是可以的
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_API_URL")
)

tavily_tool = TavilySearch(max_results = 5)

tools = [tavily_tool]

agent = create_agent(
    model=llm,
    tools = tools,
    system_prompt="你是一个小助手，需要调用工具来解答用户的问题。"
)

resp = agent.invoke( {"messages": [{"role": "user", "content": "今天深圳的天气怎么样？"}]})

# print(resp)
print(resp["messages"][-1].content)

resp = agent.invoke( {"messages": [{"role": "user", "content": "上海呢？"}]})

print(resp["messages"][-1].content)
```

**验收标准**

- 第一次输出的末尾消息是具体的深圳天气描述（含温度或天气状况），不是“我无法联网”；
- 在第一次 `agent.invoke` 之后立刻打印 `[type(m).__name__ for m in resp["messages"]]`，能看到 `HumanMessage`、带 `tool_calls` 的 `AIMessage`、`ToolMessage`、最终的 `AIMessage`，证明工具被真正调用过；
- 第二次问“上海呢？”时，因为本次没有配置 checkpointer，模型不会自动继承“上一轮问的是天气”，回答可能答非所问；这与同目录 `lc_3.py` 用 `InMemorySaver` + `thread_id` 的版本形成对照；
- 未配置 `TAVILY_API_KEY` 时，程序在构造 `TavilySearch` 或首次调用工具时抛出缺少密钥/认证失败异常。
