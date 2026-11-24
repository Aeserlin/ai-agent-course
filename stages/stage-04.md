## 阶段导读

阶段 03 结束时，你的 Agent 会调工具、会规划，但它只认识训练数据里的公共知识。用户问“我们这台 XG-2000 保修几年”，模型只能编。这一阶段干三件事：把私有知识接进模型，做成**能溯源、能评测、能优化**的 RAG 系统；补齐 Git、Redis、Nginx 三个上线组件；用掌柜智库把这个组合交付成企业级项目。

学完你能做到：解析几十份图文 PDF 手册，建出稀疏 + 稠密双路召回的向量库，接上 HyDE 与 BGE-Rerank，用 RAGAS 给出优化前后的量化对比，并通过 Nginx 暴露成稳定域名。

最容易踩的五个坑，提前说清：

1. **只做向量检索**。型号、编号、条款号这类精确匹配，向量经常找不准，必须补关键词路。
2. **切片拍脑袋**。固定 500 字硬切，答案正好被切成两半，后面再换模型也没用。
3. **把评测当形式**。没有基线分数，“我优化了”就没有任何说服力。
4. **Nginx 配完 502**。九成是 SELinux 没开 `httpd_can_network_connect`，不是配置写错。
5. **密钥进 Git**。`.env` 推到远程，删文件没用，必须换 key 并清理历史。

<div class="callout plain"><span class="tag">大白话</span>
<p>RAG 就像<b>开卷考试</b>：模型是考生，向量库是那本书，检索是“翻到正确那页”的动作。</p>
<p>很多同学上来就换更贵的模型，相当于给考生换脑子；但真正丢分的原因是<b>书翻错了页</b>。所以调 RAG 的顺序永远是：先查检索，再查提示词，最后才怀疑模型。</p>
</div>

## 教学路径

<div class="callout path"><span class="tag">教学路径</span>
<ol class="path-steps">
<li><b>第 1 步（2 天）：</b>Git 安装配置、本地仓库、分支与冲突、GitLab 集中式协作。产出：走完一次 MR 合并。</li>
<li><b>第 2 步（2 天）：</b>Redis 安装、五大数据类型、Jedis、RDB 与 AOF。产出：带过期时间与连接池的缓存 Demo。</li>
<li><b>第 3 步（3 天）：</b>Nginx 安装、配置结构、静态资源、反向代理、SELinux、负载均衡。产出：80 端口同时代理前后端并轮询两台后端。</li>
<li><b>第 4 步（2 天）：</b>SpringCloud Gateway 负载均衡实战，理清 Nginx 与 Gateway 的分工。产出：Nginx → Gateway → 服务完整链路。</li>
<li><b>第 5 步（4 天）：</b>RAG 原理：文档处理、切片、Embedding、向量库、检索预处理。产出：手写百行最小 RAG。</li>
<li><b>第 6 步（3 天）：</b>混合检索、RRF 融合、BGE-Rerank、HyDE、GraphRAG。产出：纯向量 vs 混合检索的对比数据与一张实体图谱。</li>
<li><b>第 7 步（6 天）：</b>掌柜智库：LangGraph 工作流、MinerU + OCR、Milvus、高级切片。产出：可回答图文手册并给出页码的知识库。</li>
<li><b>第 8 步（3 天）：</b>RAGAS 全链路评测与针对性调优。产出：基线 vs 优化后的四项指标报告。</li>
<li><b>第 9 步（5 天）：</b>项目实战一：五选一行业知识库，独立完成解析、检索、评测与部署。产出：可演示的行业知识库。</li>
<li><b>第 10 步（1 天）：</b>考试三与项目答辩。产出：能讲清每个技术选型的理由。</li>
</ol>
</div>

## 学习前准备

**前置知识**：Python 函数与类、FastAPI 写接口、Docker 基本命令、MySQL 增删改查。如果 `docker run` 还不敢敲，先回阶段 02。

| 软件 | 建议版本 | 用途 | 说明 |
|-|-|-|-|
| Git | 2.40+ | 版本管理 | 装完必须配 user.name / user.email |
| Redis | 7.2 | 缓存与限流 | 用 Docker 起，别装老版 Windows 包 |
| Nginx | 1.24 | 反向代理 | Docker 或云服务器 yum 安装 |
| Milvus | 2.4.x | 向量库 | 需 etcd + MinIO，用官方 compose |
| Python | 3.10/3.11 | 主语言 | 3.12 部分库轮子还不全 |
| pymilvus / ragas | 2.4.x / 0.1.x | 向量与评测 | 版本要对齐，接口变动大 |
| MinerU | 最新 | PDF 解析 | 扫描件必须开 OCR 后端 |

**三道自测题**，答不上来就先补对应内容：

1. 一个 PDF 有 80 页，包含目录、表格和截图，你会怎么切 chunk？答不出说明还不懂文档处理，先看模块 4。
2. 用户问“XG-2000 的滤网型号”，向量检索返回了“XG-2000 使用说明”，为什么可能答错？答不出说明还没建立“精确匹配”意识。
3. 线上接口 502，Nginx 日志写 `connect() failed (13: Permission denied)`，你先查什么？答不出说明没接触过 SELinux。

## 模块精讲

### 模块1：Git / GitHub / Gitee / GitLab

**解决什么问题**：多人改同一份代码不互相覆盖；上线出问题能回到任意历史版本；面试一定问分支模型与冲突处理。

| 概念 | 含义 | 必须记住的点 |
|-|-|-|
| 工作区 / 暂存区 / 本地库 | 改文件 → add → commit | commit 只提交暂存区内容 |
| 远程库 | GitHub / Gitee / GitLab | 命令完全一致，只有地址不同 |
| 分支 | 独立开发线 | main 保护，功能一律开 feature 分支 |
| merge | 合并并保留分叉历史 | 团队协作默认用它 |
| rebase | 把自己的提交挪到别人后面 | 只能用于自己的本地分支 |
| MR / PR | 合并请求 | GitLab 叫 MR，GitHub 叫 PR；tag 标记可上线版本 |

```bash
# 1. 安装后先配身份，否则 commit 记录不到作者
git config --global user.name "张三"
git config --global user.email "zhangsan@example.com"
git config --global core.autocrlf true      # Windows 换行符转换，避免整文件 diff
git config --global init.defaultBranch main

# 2. 本地库：初始化 + 第一次提交
mkdir zhanggui-brain && cd zhanggui-brain
git init
printf "data/\n*.pdf\n.env\n__pycache__/\n.venv/\n" > .gitignore   # 数据与密钥不入库
git add .gitignore && git commit -m "chore: 初始化仓库与忽略规则"

# 3. 日常三步：改 -> 看 -> 提交
git status                        # 确认哪些文件变了，防止误提交
git diff                          # 逐行看改动，防止把调试代码提交上去
git add app/rag/pipeline.py
git commit -m "feat(rag): 增加父子切片"

# 4. 分支：一个功能一条分支，禁止直接在 main 上写业务
git switch -c feature/hyde        # 新建并切换
git switch main && git merge feature/hyde    # 合并，产生 merge commit
git branch -d feature/hyde        # 合并完删本地分支

# 5. 远程协作（三家命令一样，只换地址）
git remote add origin git@gitlab.com:team/zhanggui-brain.git
git push -u origin main
git clone git@gitlab.com:team/zhanggui-brain.git   # 新同学拉代码
git pull --rebase origin main     # 拉取并把自己的提交垫到最新

# 6. 打 tag 标记可上线版本，回滚时不用猜提交
git tag -a v1.0.0 -m "掌柜智库首个可演示版本" && git push origin v1.0.0
```

**集中式协作（GitLab）**：`main` 设为保护分支，feature 分支推送后发起 MR，至少一人评审 + CI 通过才能合并，所有改动可追溯。

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `core.autocrlf true` | 统一换行符 | Windows 与 Linux 混用时不产生整文件冲突 |
| 先提交 `.gitignore` | 排除数据、模型、密钥 | 大文件与密钥一旦入库很难彻底清除 |
| `git diff` 后 add | 提交前自检 | 防止把调试代码、打印密钥提交上去 |
| 主干用 merge | 保留真实分叉 | 已推送的公共分支 rebase 会让同事历史错乱 |
| MR + 保护分支 | 强制评审 | 集中式协作靠流程，不靠自觉 |
| tag 打版本 | 精确定位线上代码 | 回滚不靠“大概是上周那个提交” |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>把 .env 提交上去</b>：推到远程后删文件也还在历史里，必须立刻换 key，再清理历史。</li>
<li><b>对公共分支 rebase</b>：同事拉过的分支被改写，下一次 pull 会出现大量重复提交。</li>
<li><b>冲突时一键“接受当前更改”</b>：会把对方逻辑整段删掉，必须逐段读再合。</li>
<li><b>把 PDF 与模型权重直接 add</b>：仓库几百 MB，clone 极慢，应放对象存储或用 Git LFS。</li>
</ul>
</div>

### 模块2：Redis

**解决什么问题**：同一个问题每天被问几百遍，每次都跑向量检索 + 大模型既慢又贵。Redis 用来缓存答案、存多轮会话、做限流计数、当轻量任务队列。

| 类型 | 结构 | 典型用途 | 在本阶段项目里的用法 |
|-|-|-|-|
| String | key → 字符串/数字 | 缓存、计数器 | 缓存问答结果，`SETEX` 10 分钟过期 |
| Hash | key → 多个 field | 对象、会话状态 | 存 `session:{uid}` 的轮次与最近问题 |
| List | 双向链表 | 队列、最新 N 条 | 文档入库任务队列 `LPUSH/BRPOP` |
| Set | 无序去重集合 | 标签、去重 | 文档标签索引、UV 统计 |
| ZSet | 带分数有序集合 | 排行榜、延时任务 | 高频问题榜、热度加权 |

**持久化**：RDB 定时快照，恢复快但丢一个周期；AOF 追加写日志，最多丢 1 秒但文件大、恢复慢。生产两个都开。

```bash
# Docker 启动：必须设密码并只监听内网，公网裸奔的 6379 几小时就会被挖矿
docker run -d --name redis -p 6379:6379 -v /data/redis:/data \
  redis:7.2 redis-server --requirepass "Rag@2024" --appendonly yes

docker exec -it redis redis-cli -a "Rag@2024"
SET  kb:doc:1001 "售后手册 v3"                    # String
HSET session:u8 last_q "空调不制冷" turn 3         # Hash
LPUSH queue:ingest doc_102 doc_103               # List
SADD  kb:tag:空调 doc_1001 doc_1007               # Set
ZADD  hot:question 42 "保修多久" 17 "怎么退货"     # ZSet
ZINCRBY hot:question 1 "保修多久"                  # 热度 +1
TTL  kb:doc:1001                                  # -1 表示永不过期，缓存必须设 TTL
```

```java
// JedisDemo.java —— 模块要求掌握 Jedis 直连方式
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

public class JedisDemo {
    // Jedis 实例不是线程安全的，生产必须用连接池复用
    private static final JedisPool POOL;

    static {
        JedisPoolConfig cfg = new JedisPoolConfig();
        cfg.setMaxTotal(32);          // 最大连接数，按并发量估
        cfg.setMaxIdle(8);
        POOL = new JedisPool(cfg, "127.0.0.1", 6379, 2000, "Rag@2024");
    }

    public static void main(String[] args) {
        try (Jedis jedis = POOL.getResource()) {          // 用完自动归还
            String key = "rag:ans:空调不制冷";
            jedis.setex(key, 600, "先断电，再拆滤网清洗");   // 10 分钟过期
            System.out.println(jedis.get(key));   // ZSet 用法见上方 redis-cli 示例
        }
    }
}
```

```text
# redis.conf 关键配置
appendonly yes                  # 开 AOF
appendfsync everysec            # 每秒刷盘：最多丢 1 秒
save 900 1                      # 900 秒内至少 1 次写就 RDB 快照
maxmemory 2gb                   # 必须设上限，否则会吃光服务器内存
maxmemory-policy allkeys-lru    # 缓存场景用 LRU 淘汰
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `--requirepass` | 访问密码 | 裸奔 Redis 是最常见的入侵入口 |
| `SETEX` | 带过期时间写入 | 知识更新后缓存能自然失效 |
| `HSET session` | 存结构化会话 | 比整个 JSON 塞 String 更省、可局部更新 |
| `ZINCRBY` | 热度累加 | 高频问题榜与知识库选题都靠它 |
| `JedisPool` | 连接复用 | 每次 new Jedis 频繁建连，高并发直接打满 |
| `allkeys-lru` | 内存淘汰 | 缓存机内存有限，必须有淘汰规则 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>在生产执行 <code>keys *</code></b>：单线程被阻塞，整个服务卡死，要用 <code>SCAN</code> 游标遍历。</li>
<li><b>大 key</b>：一个 Hash 塞几十万字段，读写都拖慢主线程，拆成多个小 key。</li>
<li><b>只开 RDB</b>：宕机丢最近几分钟数据。缓存可接受，会话与任务队列不行。</li>
<li><b>缓存不设 TTL / 把 Redis 当数据库</b>：知识更新后用户还看旧答案；核心业务数据仍要落 MySQL。</li>
</ul>
</div>

### 模块3：Nginx

**解决什么问题**：对外只暴露 80/443，前面挂静态页面，`/api` 转给后端；后端扩到两台能自动分摊；上传大文件、流式回答要单独调参数。

**配置是层级结构** `main → events → http → server → location`。`location` 优先级为 `=` 精确 > `^~` 前缀 > 正则 > 普通前缀，写错顺序会出现“明明配了却没生效”。

```bash
# 方式一：Docker（推荐，配置与日志挂载出来方便改）
docker run -d --name nginx -p 80:80 -p 443:443 \
  -v /data/nginx/conf.d:/etc/nginx/conf.d:ro \
  -v /data/nginx/html:/usr/share/nginx/html:ro \
  nginx:1.24

# 方式二：Linux 包管理
sudo yum install -y nginx && sudo systemctl enable --now nginx
sudo nginx -t && sudo systemctl reload nginx   # 改完先测语法，再热重载

# SELinux：Enforcing 状态下，Nginx 反代后端会 502
getenforce
sudo setsebool -P httpd_can_network_connect 1          # -P 永久生效
sudo semanage port -a -t http_port_t -p tcp 8080       # 允许监听非标准端口
sudo tail -f /var/log/nginx/error.log                  # 502 先看这里
```

```nginx
# /etc/nginx/conf.d/zhanggui.conf
upstream rag_backend {
    least_conn;                    # 连接数最少优先，比轮询更适合长耗时推理
    server 172.18.0.11:8000 max_fails=2 fail_timeout=10s;
    server 172.18.0.12:8000 max_fails=2 fail_timeout=10s;
    keepalive 32;                  # 与后端保持长连接，减少握手
}

server {
    listen 80;
    server_name kb.zhanggui.com;
    client_max_body_size 50m;      # 不配这行，上传 PDF 直接 413
    root /usr/share/nginx/html;

    location / {                   # 前端 Vue 打包产物
        try_files $uri $uri/ /index.html;   # history 路由刷新 404 的修复
    }

    location /api/ {               # 反向代理到 RAG 服务
        proxy_pass http://rag_backend;        # 结尾无斜杠：/api/ 原样透传
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;   # SSE / WebSocket 必需
        proxy_set_header Connection "";
        proxy_read_timeout 300s;   # 大模型流式回答常超过默认 60 秒
        proxy_buffering off;       # 关闭缓冲，否则流式会被攒着一次性吐出
    }
}
```

**基于 SpringCloud 网关的负载均衡实战**：真实企业通常是两层。Nginx 做入口层（TLS 终止、静态资源、按域名转发、粗粒度限流）；Gateway 做业务层（按服务名路由、JWT 鉴权、细粒度限流、灰度）。两层都做负载均衡不冲突，关键是职责写清楚。

```yaml
# gateway 服务的 application.yml：Nginx 把 /api/ 交给 Gateway，Gateway 再分发
server:
  port: 9000
spring:
  application:
    name: api-gateway
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848     # 从 Nacos 拿服务实例列表
    gateway:
      routes:
        - id: rag-service
          uri: lb://rag-service          # lb:// 走注册中心 + 客户端负载均衡
          predicates:
            - Path=/rag/**
          filters:
            - StripPrefix=1              # 去掉 /rag 前缀再转发
        - id: agent-service
          uri: lb://agent-service
          predicates:
            - Path=/agent/**
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `upstream` + `least_conn` | 多实例分摊 | 推理耗时不均，按连接数比轮询更均衡 |
| `proxy_pass` 无尾斜杠 | 保留 `/api` 前缀 | 后端按 `/api` 设计路由，去掉会 404 |
| `try_files ... /index.html` | 前端路由兜底 | 否则刷新 `/chat/1` 直接 404 |
| `client_max_body_size` | 放宽上传体积 | 默认 1m，PDF 手册必然超过 |
| `proxy_buffering off` | 边生成边下发 | 流式回答的前提，否则用户等十几秒才见字 |
| `setsebool` | 允许 Nginx 建外连 | SELinux 是 502 的高频原因 |
| `lb://` | 服务发现式负载均衡 | 实例扩缩容无需改 Nginx 配置 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>proxy_pass 尾斜杠写错</b>：<code>http://backend/</code> 会替换掉匹配的 <code>/api/</code>，路径少一段。</li>
<li><b>SELinux 拦截</b>：日志是 <code>Permission denied</code> 而非 connection refused，先 <code>setsebool</code>。</li>
<li><b>忘记 client_max_body_size</b>：上传 PDF 报 413，后端日志里什么都看不到。</li>
<li><b>流式被缓冲</b>：SSE 在 curl 下正常、浏览器要等全部生成完，关掉 <code>proxy_buffering</code>。</li>
<li><b>容器里写 127.0.0.1 当后端</b>：容器内 127.0.0.1 是它自己，要用服务名或宿主机 IP。</li>
</ul>
</div>

### 模块4：RAG 原理及优化

**解决什么问题**：让模型回答它没训练过的私有知识，并指到原文位置。难点从来不是“调通”，而是“答得准、答得全、答得可验证”。

| 阶段 | 做法 | 主要问题 |
|-|-|-|
| Naive RAG | 切块 → 向量检索 top-k → 拼 prompt | 切片粗暴、单路召回、无重排 |
| Advanced RAG | 查询改写 + 混合检索 + 重排 + 元数据过滤 | 工程复杂、参数多 |
| Modular RAG | 检索/路由/记忆/生成拆成可插拔模块 | 架构设计要求高 |

**离线索引**：解析（PDF/Word/HTML/扫描件 OCR）→ 清洗（去页眉页脚、合并断行）→ 切片（按标题层级、带重叠）→ Embedding → 入向量库并写元数据（doc_id、页码、章节、生效日期）。**在线检索**：问题改写 → 双路召回 → 融合去重 → 重排 → 组装上下文 → 生成并附引用。

| 向量库 | 特点 | 适用 |
|-|-|-|
| Milvus | 分布式、支持稀疏+稠密混合 | 企业级、千万级向量 |
| Qdrant | 部署轻、过滤强 | 中台、单机几十万级 |
| pgvector | 与 PostgreSQL 一体、事务方便 | 已有 PG、数据量中等 |

**RAGAS 四项指标**：忠实度（答案是否被 context 支撑）、答案相关性（是否答到点上）、上下文精确率（召回片段里有用占比）、上下文召回率（该找到的有没有找到）。前两个看生成，后两个看检索，**优化前必须先测基线**。

```python
# 简化实现：按标题切片 + RRF 融合，生产可直接用 LangChain 的 splitter
from collections import defaultdict

def split_by_heading(md: str, max_len: int = 600, overlap: int = 80) -> list[dict]:
    """按 Markdown 标题切，超长再按长度切并保留重叠，避免答案被切断"""
    chunks, buf, title = [], "", "正文"
    for line in md.splitlines():
        if line.startswith("#"):
            if buf.strip():
                chunks.append({"title": title, "text": buf.strip()})
            title, buf = line.lstrip("# ").strip(), ""
        else:
            buf += line + "\n"
            if len(buf) >= max_len:                 # 超长兜底切分
                chunks.append({"title": title, "text": buf.strip()})
                buf = buf[-overlap:]                # 保留尾部重叠，衔接上下文
    if buf.strip():
        chunks.append({"title": title, "text": buf.strip()})
    return chunks

def rrf_fuse(dense: list[dict], sparse: list[dict], k: int = 60) -> list[dict]:
    """Reciprocal Rank Fusion：只用排名不用原始分，避免两路分数不可比"""
    score, pool = defaultdict(float), {}
    for rank, item in enumerate(dense):
        score[item["id"]] += 1 / (k + rank + 1)
        pool[item["id"]] = item
    for rank, item in enumerate(sparse):
        score[item["id"]] += 1 / (k + rank + 1)
        pool[item["id"]] = item
    merged = sorted(score.items(), key=lambda x: x[1], reverse=True)
    return [{**pool[i], "rrf": s} for i, s in merged]

def build_prompt(question: str, contexts: list[dict]) -> str:
    """上下文编号，强制模型引用，便于前端溯源"""
    ctx = "\n".join(f"[{i+1}]（{c['title']}）{c['text']}" for i, c in enumerate(contexts))
    return (f"只依据资料回答，资料没有就说不知道，并用 [编号] 标注出处。\n"
            f"资料：\n{ctx}\n\n问题：{question}")
```

```python
# 用 RAGAS 跑一次基线评测（ragas 0.1.x 接口）
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall

samples = [{"question": "XG-2000 滤网多久清洗一次", "answer": "建议每两周清洗一次 [1]。",
            "contexts": ["第 3 章维护保养：滤网建议每两周清洗一次..."],
            "ground_truth": "每两周清洗一次，粉尘环境每周一次。"}]
result = evaluate(Dataset.from_list(samples),
                  metrics=[faithfulness, answer_relevancy, context_precision, context_recall])  # 存为基线
```

**GraphRAG**：普通 RAG 检索的是“相似片段”，遇到“A 和 B 是什么关系”“这批故障的共同上游是谁”就失效。GraphRAG 先用模型抽实体与关系（“XG-2000 —使用→ 滤网 F3”“滤网 F3 —属于→ 耗材”），建成图谱，提问时先找关联子图，再把子图文本交给模型。全量抽取成本高，**只在关系型、多跳问题上用**。

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| 按标题切片 | 保持语义边界 | 标题天然是主题分界，比定长切准得多 |
| `overlap=80` | 重叠衔接 | 防止答案正好跨在两块之间 |
| RRF 公式 | 排名融合 | 向量分 0~1、BM25 分 0~30，直接比大小毫无意义 |
| `k=60` | 平滑常数 | 经验值，让头部排名优势不过分极端 |
| 上下文编号 | 强制引用 | 用户能核对原文，也便于 RAGAS 判忠实度 |
| 四项指标分开看 | 定位问题环节 | 召回低是检索问题，忠实度低是生成问题 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>chunk 过大</b>：一块塞 2000 字，向量被稀释，召回不准还浪费 token；过小又会丢失指代关系。</li>
<li><b>top_k 拍脑袋设 20</b>：无关片段挤占上下文，忠实度反而下降，先小后调。</li>
<li><b>把两路分数直接相加</b>：量纲不同，融合结果没有意义，用 RRF 或归一化。</li>
<li><b>不做 query 改写</b>：用户一句“这个咋整”，检索必然失败。</li>
<li><b>只测 3 条样本就宣称优化成功</b>：评测集至少 50 条且覆盖不同题型。</li>
</ul>
</div>

### 模块5：项目一：掌柜智库（RAG 知识库）

**解决什么问题**：家电企业售后有 60 余份图文 PDF 手册，含参数表、爆炸图、截图，客服靠关键词搜 PDF，平均响应 4 分钟，型号参数经常答错。

**整体链路**：

```text
PDF/扫描件 → MinerU 解析(OCR) → 清洗结构化 → 高级切片(父子/表格独立)
   → BGE-M3 稠密 + 稀疏向量 → Milvus 入库
提问 → LangGraph 工作流 → HyDE 改写 → 双路召回 → BGE-Rerank → 生成 + 引用
```

**LangGraph 可插拔工作流**：改写、检索、重排、生成各是一个节点，检索器与重排器通过参数注入，换 Milvus 换 Qdrant、换 BGE 换其他模型都不改图结构。

```python
from typing import TypedDict, List
from langgraph.graph import StateGraph, END

class RAGState(TypedDict):
    question: str
    rewritten: str
    contexts: List[dict]
    answer: str

def build_graph(retriever, reranker, llm, top_k: int = 40, top_n: int = 5):
    """retriever / reranker / llm 全部从外部注入，这就是可插拔"""
    def rewrite(s):
        # HyDE：先让模型写一段假设答案，用更完整的文本去检索
        fake = llm.complete(f"请写一段关于「{s['question']}」的技术说明，200 字以内")
        return {"rewritten": f"{s['question']}\n{fake}"}
    def retrieve(s):
        return {"contexts": retriever.search(s["rewritten"], top_k=top_k)}   # 双路召回
    def rerank(s):
        return {"contexts": reranker.top_n(s["question"], s["contexts"], top_n)}

    def generate(s):
        return {"answer": llm.answer(s["question"], s["contexts"])}

    g = StateGraph(RAGState)
    for name, fn in [("rewrite", rewrite), ("retrieve", retrieve),
                     ("rerank", rerank), ("generate", generate)]:
        g.add_node(name, fn)
    g.set_entry_point("rewrite")
    g.add_edge("rewrite", "retrieve")
    g.add_edge("retrieve", "rerank")
    g.add_edge("rerank", "generate")
    g.add_edge("generate", END)
    return g.compile()

# 换检索实现只改这一行
app_graph = build_graph(MilvusHybridRetriever(), BGEReranker("BAAI/bge-reranker-v2-m3"), QwenLLM())
result = app_graph.invoke({"question": "XG-2000 显示 E3 是什么故障"})
```

**Milvus 建表：稠密 + 稀疏同库**，一次查询同时走语义与关键词：

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="http://localhost:19530")

schema = client.create_schema(auto_id=False, enable_dynamic_field=True)
schema.add_field("id", DataType.VARCHAR, is_primary=True, max_length=64)
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=1024)     # BGE-M3 稠密向量
schema.add_field("sparse", DataType.SPARSE_FLOAT_VECTOR)       # 稀疏向量：型号/故障码
schema.add_field("text", DataType.VARCHAR, max_length=8192)
schema.add_field("doc_id", DataType.VARCHAR, max_length=64)    # 溯源用
schema.add_field("page", DataType.INT64)                       # 页码，回答里要标
schema.add_field("parent_id", DataType.VARCHAR, max_length=64) # 父块：补全上下文

index_params = client.prepare_index_params()
index_params.add_index(field_name="dense", index_type="HNSW", metric_type="COSINE",
                       params={"M": 16, "efConstruction": 200})
index_params.add_index(field_name="sparse",
                       index_type="SPARSE_INVERTED_INDEX", metric_type="IP")

client.create_collection("zhanggui_kb", schema=schema, index_params=index_params)
# 插入示例：dense 是 1024 维浮点数组，sparse 是 {token_id: 权重} 字典
client.insert("zhanggui_kb", [{"id": "c1", "dense": [0.01] * 1024, "sparse": {12: 0.8, 507: 0.6},
    "text": "E3 表示排水异常，请检查排水管是否弯折", "doc_id": "manual_v3", "page": 27, "parent_id": "p9"}])
```

**MinerU + OCR**：`pdfplumber` 对扫描件与爆炸图毫无办法。MinerU 做版面分析，把标题、正文、表格、图片说明分开，扫描页开 OCR；表格单独存为 Markdown 表格块，切片时**不切断表格**，否则参数表会变成一堆无意义数字。

**高级切片**：父子切片——子块 200~300 字用于精准召回，父块 1000 字用于补全上下文，命中子块后取 `parent_id` 对应父块。比单纯放大 chunk 更准，也更省 token。

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| LangGraph 节点拆分 | 流程可见可插拔 | 每步能单独替换与调试，出问题知道卡在哪 |
| 检索器参数注入 | 解耦存储 | 换向量库不动工作流，也方便写单测 |
| 稀疏 + 稠密双字段 | 语义 + 精确 | 型号、故障码走稀疏，描述性提问走向量 |
| `parent_id` | 父子切片 | 小子块召回准，父块上下文全 |
| `HNSW` + `COSINE` | 向量索引 | 召回快，适合归一化后的语义向量 |
| `SPARSE_INVERTED_INDEX` + `IP` | 稀疏索引 | 倒排加速关键词命中 |
| 表格独立成块 | 保结构 | 参数表切断后模型无法还原行列关系 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>扫描件没开 OCR</b>：解析出来全是空白，向量库里只有页码没有内容。</li>
<li><b>PDF 表格按行切断</b>：表头与数据分离，模型把“额定功率”答成“噪音值”。</li>
<li><b>父子块只存子块</b>：召回准了但上下文不全，回答缺前提条件。</li>
<li><b>HyDE 的假设答案直接当回答</b>：那是编的，只能用于检索。</li>
<li><b>评测集用知识库原文问题</b>：等于开卷考原题，分数虚高，要用真实客服提问。</li>
</ul>
</div>

### 模块6：项目实战一：RAG 知识库实战（五选一）

**解决什么问题**：换一个完全陌生的行业，验证你掌握的是方法而不是掌柜智库的配置。五个方向数据形态完全不同，选一个做深。

| 方向 | 项目 | 资料特点 | 专项难点 |
|-|-|-|-|
| 医疗 | 好医智库 | 药品说明书、诊疗指南，术语多 | 剂量与禁忌不能错，强引用；隐私脱敏 |
| 教育 | 伴学智库 | 教材、讲义、真题，版本多 | 教材版本作为元数据过滤，不能混答 |
| 音频 | 倾听智库 | 课程录音、客服通话 | 先 ASR 转写，带时间戳切片，回答定位到秒 |
| 金融 | 金融智库 | 研报、财报，表格与数字密集 | 数字必须可核对，禁止模型做算术 |
| 文旅 | 美途智库 | 景点介绍、攻略、票价 | 强时效性，必须带生效日期并提示可能变化 |

**通用入库流水线**（五个方向复用，只换解析器与元数据字段）：

```python
# 简化实现：把“解析→切片→打元数据→入库”串成一条可重跑的命令
import hashlib, pathlib
from pymilvus import MilvusClient

client = MilvusClient(uri="http://localhost:19530")

def doc_id(path: pathlib.Path) -> str:
    # 用内容 hash 做 id：同一份文件重复导入不会产生重复向量
    return hashlib.md5(path.read_bytes()).hexdigest()

def ingest(folder: str, collection: str, parser, splitter, embedder):
    for p in pathlib.Path(folder).rglob("*"):
        if p.suffix.lower() not in {".pdf", ".docx", ".md", ".txt"}:
            continue
        did = doc_id(p)
        for page in parser.parse(str(p)):              # MinerU / python-docx / whisper
            for i, chunk in enumerate(splitter.split(page["text"])):
                vec = embedder.encode(chunk)           # 返回 dense 与 sparse
                client.insert(collection, [{
                    "id": f"{did}-{page['no']}-{i}",
                    "dense": vec["dense"], "sparse": vec["sparse"],
                    "text": chunk, "doc_id": did, "page": page["no"],
                    "source": p.name,                  # 前端展示“来自哪个文件”
                }])

ingest("data/manuals", "zhanggui_kb", MinerUParser(ocr=True), ParentChildSplitter(), BGE_M3())
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| 内容 hash 做主键 | 幂等导入 | 重跑流水线不产生重复数据 |
| `rglob` 递归扫描 | 批量处理 | 手册通常按型号分目录 |
| 页面级循环 | 保留页码 | 引用要精确到页，不能只到文件 |
| 统一 embedder 接口 | 换模型不改流程 | 稠密与稀疏一次编码，保证同源 |
| `source` 字段 | 前端溯源 | 用户点开能看原文件 |
| 五选一换 parser/splitter | 复用骨架 | 训练的是迁移能力，不是背配置 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>行业术语没做同义词</b>：用户说“心梗”、文档写“心肌梗死”，要加同义词词典或查询扩展。</li>
<li><b>时效数据不打日期</b>：票价、政策类内容必须带生效时间，回答提示“以最新公告为准”。</li>
<li><b>医疗数据不脱敏</b>：真实病历不能直接进库，先做去标识化。</li>
<li><b>换行业后不重做评测集</b>：沿用上个项目的 20 条问题，等于没测。</li>
</ul>
</div>

## 综合实战

**目标**：用 Docker Compose 起 Redis + Milvus + RAG 服务 + Nginx，问答结果进 Redis 缓存，Nginx 做入口与限流，代码走 feature 分支合并。

**第 1 步：编排依赖**。下面只保留核心服务，Milvus 的 etcd 与 MinIO 省略。

```yaml
# docker-compose.yml（简化实现：省略 etcd / minio，实际用 Milvus 官方 standalone compose）
services:
  redis:
    image: redis:7.2
    command: ["redis-server", "--requirepass", "Rag@2024", "--appendonly", "yes"]

  milvus:
    image: milvusdb/milvus:v2.4.4
    command: ["milvus", "run", "standalone"]
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
    ports: ["19530:19530"]
    depends_on: [etcd, minio]

  rag-api:
    build: ./app
    environment:
      REDIS_URL: redis://:Rag@2024@redis:6379/0     # 密码写在 URL 里
      MILVUS_URI: http://milvus:19530
    expose: ["8000"]                                # 不对外暴露，只给 Nginx 用
    depends_on: [redis, milvus]

  nginx:
    image: nginx:1.24
    ports: ["80:80"]
    volumes:
      - ./nginx/zhanggui.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on: [rag-api]
```

**第 2 步：接口层加缓存**。命中缓存直接返回，未命中才跑工作流。

```python
# app/main.py
import hashlib, os
import redis.asyncio as aioredis
from fastapi import FastAPI

app = FastAPI()
r = aioredis.from_url(os.environ["REDIS_URL"], decode_responses=True)

def cache_key(q: str) -> str:
    # 中文与特殊字符做 hash，避免污染 key 空间与超长 key
    return "rag:ans:" + hashlib.md5(q.strip().encode()).hexdigest()

@app.get("/api/ask")
async def ask(q: str):
    key = cache_key(q)
    cached = await r.get(key)
    if cached:
        return {"answer": cached, "cached": True}      # 命中缓存，省一次模型调用
    answer = await rag_graph.invoke({"question": q})    # 模块 5 的 LangGraph 工作流
    await r.setex(key, 600, answer["answer"])           # 10 分钟后自然失效
    return {"answer": answer["answer"], "cached": False}
```

**第 3 步：入口层加限流**。单 IP 每秒 5 次、突发 10 次，防止脚本刷爆模型额度。

```nginx
# nginx/zhanggui.conf
limit_req_zone $binary_remote_addr zone=ask:10m rate=5r/s;   # 按 IP 计数

server {
    listen 80;
    server_name kb.zhanggui.com;
    client_max_body_size 50m;

    location /api/ {
        limit_req zone=ask burst=10 nodelay;   # 超过直接 503，不排队
        proxy_pass http://rag-api:8000;        # 容器名直接当主机名
        proxy_set_header Host $host;
        proxy_read_timeout 300s;
        proxy_buffering off;                   # 保留流式能力
    }
}
```

**第 4 步：起服务并验证**。三条 curl 分别验证首次、缓存命中、限流。

```bash
docker compose up -d
docker compose logs -f rag-api                 # 等 Milvus 就绪再压测

curl "http://localhost/api/ask?q=空调不制冷"    # 第一次 cached=false
curl "http://localhost/api/ask?q=空调不制冷"    # 第二次 cached=true，耗时明显下降

for i in $(seq 1 20); do
  curl -s -o /dev/null -w "%{http_code}\n" "http://localhost/api/ask?q=t$i"
done                                            # 会出现 503，证明限流生效

git switch -c feature/redis-cache
git add docker-compose.yml app/main.py nginx/zhanggui.conf
git commit -m "feat: 问答加 Redis 缓存与 Nginx 限流"
git push -u origin feature/redis-cache          # 发起 MR，评审后合并
```

#### 综合实战逐段解析

| 步骤 | 关键动作 | 排错要点 |
|-|-|-|
| 编排 | `expose` 不映射端口 | 后端只让 Nginx 访问，避免绕过限流 |
| 缓存 | md5 收窄 key | 中文 key 在日志里乱码、长度不可控 |
| 缓存 | `setex 600` | 知识更新频繁就缩短，稳定就拉长 |
| 限流 | `burst=10 nodelay` | 不排队直接拒，用户立即收到 503 |
| 代理 | `http://rag-api:8000` | 同一网络用服务名，别写 127.0.0.1 |
| 验证 | 两次 curl 对比 | 第二次延迟应下降一个数量级 |
| 协作 | feature 分支 + MR | 不直接推 main，保留评审记录 |

<div class="callout tip"><span class="tag">老师建议</span>
<p>这个组合已经是最小生产形态。面试时不要只说“我做了 RAG”，要说清<b>缓存命中率是多少、限流阈值怎么定的、为什么后端不直接暴露端口</b>，这三句话能立刻区分“跑通过 demo”和“真上线过”。</p>
</div>

## 疑难点分级

| 知识点 | 难度 | 典型卡点 | 破解方式 |
|-|-|-|-|
| Git 冲突解决 | 中 | 冲突标记看不懂，整段删掉 | 先读两边意图，保留逻辑并手工合并 |
| merge 与 rebase | 中 | 公共分支 rebase 后历史错乱 | 公共分支只用 merge，rebase 只用于本地 |
| RDB 与 AOF | 高 | 宕机丢数据说不清原因 | everysec 最多丢 1 秒，RDB 丢一个快照周期 |
| Nginx location 优先级 | 高 | 配置了却不生效 | 精确 > ^~ > 正则 > 前缀，`nginx -T` 查生效配置 |
| proxy_pass 尾斜杠 | 高 | 后端 404，路径少一段 | 记住“带斜杠替换、不带斜杠拼接” |
| SELinux 导致 502 | 高 | 日志 Permission denied | `setsebool -P httpd_can_network_connect 1` |
| Nginx 与 Gateway 分工 | 高 | 两层都配路由，排查困难 | 入口归 Nginx，业务路由与鉴权归 Gateway |
| 文档切片策略 | 高 | 答案被切断、表格错乱 | 按标题切 + 重叠 + 表格独立成块 |
| 混合检索融合 | 高 | 两路分数直接相加 | 用 RRF，只看排名不看原始分 |
| 重排模型部署 | 高 | 显存不够、延迟高 | 小模型 + 批量推理 + GPU，只处理 top 40 |
| RAGAS 指标解读 | 高 | 分数低但不知道改哪 | 召回低查检索，忠实度低查提示词与上下文 |
| GraphRAG 适用场景 | 高 | 什么需求都想上图谱 | 只用于多跳关系与全局归纳 |
| Milvus 稀疏向量 | 高 | 稀疏维度与索引报错 | 输入是 token 权重字典，索引选 SPARSE_INVERTED_INDEX |
| PDF 扫描件解析 | 高 | 解析结果为空 | 开 OCR，先抽 3 页人工核对 |

## 阶段项目

### 项目一：掌柜智库（RAG 知识库）

**背景**：家电企业售后部门有 60 余份图文手册，客服靠关键词搜 PDF，平均响应 4 分钟，型号参数经常答错。

**功能清单**：

- 文档上传与异步解析（PDF/扫描件/Word）；父子切片 + 双路召回 + BGE-Rerank，回答附文件名与页码
- HyDE 查询改写；多轮会话追问带上文，表格与正文分别入库
- RAGAS 评测页，展示四项指标与历史对比

**技术选型**：Python 3.11 + FastAPI + LangGraph + Milvus 2.4 + BGE-M3 + BGE-Reranker-v2-m3 + MinerU + Redis + Vue3 + Nginx + Docker Compose。

**验收标准**：

1. 30 条真实客服问题评测，忠实度 ≥ 0.85，上下文召回 ≥ 0.8
2. 每个回答带来源文件与页码，点击可定位
3. 扫描件 PDF 解析成功率 100%，参数表内容可被正确问答
4. 单次问答 P95 ≤ 6 秒（含重排），缓存命中 ≤ 300ms
5. `docker compose up -d` 一条命令拉起全部依赖

**评分点**：检索链路完整性 30 分、解析与切片质量 25 分、评测报告与调优证据 25 分、工程化与部署 20 分。

### 项目实战一：多行业 RAG 知识库（五选一）

**背景**：好医、伴学、倾听、金融、美途任选其一，资料形态与掌柜智库明显不同，用来验证方法迁移能力。

**功能清单**：行业资料解析（音频方向需 ASR）、行业元数据设计、混合检索、按行业特点的专项优化、独立评测集与报告、可演示前端。

**技术选型**：沿用掌柜智库骨架，按方向替换解析器（Whisper / python-docx / PyMuPDF）、元数据字段与提示词；向量库可用 Milvus 或 Qdrant。

**验收标准**：

1. 至少 80 份文档或 10 小时音频入库，引用可溯源
2. 自建 30 条行业评测集，给出四项 RAGAS 指标
3. 能说清本行业**特有的三个坑**及对应解法
4. 服务通过 Nginx 访问，接口有鉴权与限流

**评分点**：行业理解 20 分、数据处理 25 分、检索优化 25 分、评测严谨性 20 分、演示表达 10 分。

## 常见面试题

### 问题1：完整讲一遍 RAG 的链路

**答案要点**：离线侧解析、清洗、切片、Embedding、入向量库并写元数据；在线侧查询改写、双路召回、融合去重、重排、组装上下文、生成并附引用。强调“检索质量决定上限，生成只决定能不能把话说顺”。

### 问题2：有了 RAG 为什么还会幻觉

**答案要点**：召回没命中却硬答；上下文里有相似但错误的条款；提示词没有约束“资料没有就说不知道”；长上下文中间信息被忽略。解法是提高召回、强制引用、加拒答策略、控制上下文长度。

### 问题3：chunk 大小怎么定

**答案要点**：先看文档结构，按标题或段落切，再设长度上限与重叠；问答型知识 300~600 字较稳，条款型要整条保留；用评测集对比 300/500/800 三档，看上下文召回与忠实度的变化，不靠感觉。

### 问题4：混合检索怎么做，两路分数怎么合并

**答案要点**：向量路负责语义，BM25 或稀疏向量负责精确词；合并不能直接比较原始分数，常用 RRF 按排名融合，或先归一化再加权。融合后统一去重，再交给重排。

### 问题5：RRF 为什么比加权求和稳

**答案要点**：不同检索器的分数量纲与分布不同，权重需要反复调；RRF 只用名次，天然跨模型可比，`k` 控制头部优势，工程上更省心。

### 问题6：重排模型和向量检索的本质区别

**答案要点**：向量检索是双塔，query 与文档分别编码后算相似度，快但粗；重排是交叉编码器，把 query 与文档拼在一起送进模型，精度高但只能处理几十条。所以顺序是“先粗召回再精排”。

### 问题7：HyDE 的原理和风险

**答案要点**：让模型先写一段假设答案，用更完整的文本去检索，弥补问题过短的问题。风险是假设答案本身有错会带偏检索；它只能用于检索，绝不能直接返回给用户。

### 问题8：什么时候该上 GraphRAG

**答案要点**：问题涉及多跳关系、实体关联、全局归纳，例如“哪些故障共同指向同一个上游供应商”。单点事实查询用普通 RAG 更便宜更快。GraphRAG 抽取成本高，数据更新要重建图谱。

### 问题9：RAGAS 四个指标分别在衡量什么

**答案要点**：忠实度看答案是否被上下文支撑，答案相关性看是否答到问题，上下文精确率看召回里有用片段的比例，上下文召回率看该找到的是否找到。前两个偏生成，后两个偏检索，调优要分开定位。

### 问题10：Redis 在 RAG 系统里能做什么

**答案要点**：缓存问答结果降低延迟与成本；存多轮会话状态；用 ZSet 做高频问题榜反哺知识库建设；用计数器做限流；用 List 做文档入库的轻量队列。注意设 TTL 与内存上限。

## 动手练习

<div class="callout task"><span class="tag">动手练习</span>
<ol>
<li>配置 Git 身份，新建仓库，提交 README，再把 <code>.env</code> 加进 <code>.gitignore</code> 并验证它不会被 add。</li>
<li>创建 <code>feature/hello</code> 分支，修改同一行制造冲突，手工解决并保留两边逻辑。</li>
<li>用 Docker 起带密码的 Redis，五种数据类型各写一条，再设 60 秒过期并观察 <code>TTL</code>。</li>
<li>写一个 Jedis 连接池 Demo，循环 1000 次读写，对比“每次 new Jedis”和“连接池”的耗时。</li>
<li>关掉再打开 Redis 的 <code>appendonly</code>，各写入 100 条后重启容器，对比数据丢失情况。</li>
<li>用 Nginx 托管静态页面，再配 <code>/api/</code> 反向代理到本地 FastAPI，验证前端能访问。</li>
<li>故意把 <code>proxy_pass</code> 改成带尾斜杠，观察后端收到的路径变化并记录差异。</li>
<li>在开启 SELinux 的机器上复现一次 502，用 <code>setsebool</code> 修复，保存 error.log 前后对比。</li>
<li>手写百行 RAG：读 5 个 Markdown，切片、Embedding、NumPy 算余弦相似度，回答 3 个问题。</li>
<li>实现 RRF 融合，用同一批问题对比“纯向量”和“向量 + BM25”的命中率。</li>
<li>做一组 HyDE 对照实验：同一批短问题，开与不开各跑一次，比较上下文召回。</li>
<li>把 BGE-Rerank 接进链路，记录重排前后的 P95 延迟与忠实度变化。</li>
<li>用 MinerU 解析一份带表格的扫描 PDF，检查表格完整性并调整解析参数。</li>
<li>给掌柜智库补 20 条真实客服问题，跑一次 RAGAS，写出三条改进建议。</li>
<li>用 Docker Compose 串起 Redis + RAG 服务 + Nginx，验证缓存命中与限流 503。</li>
</ol>
</div>

## 阶段小结

- RAG 本质是“开卷考试”，翻对页比换模型重要，调优顺序是检索 → 提示词 → 模型。
- 企业级检索 = 按结构切片 + 双路召回 + RRF 融合 + 交叉编码器重排 + 强制引用。
- 精确型号与编号靠稀疏/关键词，描述性提问靠稠密向量，缺一路就有一类问题答不准。
- GraphRAG 解决多跳与全局问题，成本高，不要滥用。
- 评测是优化的前提：固定评测集、先测基线、一次只改一个变量。
- Git 管协作、Redis 管缓存、Nginx 管入口，三者构成可交付的最小生产形态。
- 五选一项目证明你能迁移方法，而不是背下掌柜智库的配置。

下一阶段换技术栈：Java + SpringBoot。企业里 AI 能力往往由 Python 提供，而用户、权限、审计、计费跑在 Java 中台里。你会补上后端能力，并做一个带 RBAC/ACL 的智能体中台。

---

## RAG 部分的素材边界与练习（2026-11-24 核对）

### 可对照的真实代码

`D:\AI1015尚硅谷课程\举个栗子\举个栗子\day27\day27-代码\day27\demo7` 下有 3 个脚本，构成最小 RAG 入库链路：

| 文件 | 作用 | 关键 API |
|---|---|---|
| `lc_1.py` | 创建 Milvus 本地库与集合 `text_ms` | `MilvusClient.create_schema`、`create_collection` |
| `lc_2.py` | 读取 docx、切分、向量化、写入 | `UnstructuredWordDocumentLoader`、`RecursiveCharacterTextSplitter`、`HuggingFaceEmbeddings` |
| `lc_3.py` | 按 id 或标量条件查询 | `client.get`、`client.query` |

### 练习：读懂并跑通入库链路

1. 先阅读 `lc_1.py`，在自己的目录运行，确认生成 `demo.db`。
2. 阅读 `lc_2.py`，对照 `RecursiveCharacterTextSplitter` 的 `chunk_size=400`、`chunk_overlap=50`，说明两个参数的含义。
3. 阅读 `lc_3.py`，说明 `get` 与 `query` 的区别。

**验收标准**

- `lc_1.py` 运行后 `client.list_collections()` 输出包含 `text_ms`。
- 能指出 `lc_2.py` 中“切分 → 批量向量化 → 组装 row → insert”四步分别在哪些行。
- 能说出 `meta_data["source"]` 来自哪里。

### 待补：本机无法直接跑通的部分

- `lc_2.py` 依赖 `../asset/sample.docx`，本机该文件不存在；同时依赖本机 bge 模型目录，路径写死为 `D:/课件/.../bge-base-zh-v1.5`。因此该脚本只能读代码、不能直接运行。
- `lc_1.py` 中 `mex_length` 为原文件拼写，若运行需改为 `max_length`。
- Ragas、GraphRAG、HyDE、BGE-Rerank 在本机均 0 素材，暂不补写。

替代练习：完成 `lessons/langchain/langchain.md` 末尾的 RAG 练习（使用课件中的检索链代码），并在 `lessons/langchain` 的示例基础上回答“为什么要先切分再向量化”。
