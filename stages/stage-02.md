## 阶段导读

阶段 01 你写的程序只能在自己的电脑上、用 IDE 点一下才跑起来。真实项目不是这样：代码要跑在 Linux 服务器上，数据要存在 MySQL 里，服务要用 Docker 打包，接口要被前端调用，页面要能上线访问。这一阶段补齐的就是这套“工程基座”。

这个阶段解决的核心问题是**让代码离开你的电脑还能活**。具体包括五件事：在 Linux 上定位服务为什么起不来；写出能自动备份、自动统计的 Shell 脚本；用 SQL 把业务数据存进去、查出来；用 Docker 把环境和代码一起交付；用 FastAPI 把能力暴露成 HTTP 接口；用 Vue3 把接口变成用户能点的页面。这五件事缺一件，项目就只是“课程作业”，不是“可交付系统”。

学完你应该能做到：SSH 登录服务器后用命令排查端口占用、磁盘满、进程挂掉；写一个带参数、带日志、带错误退出的 Shell 脚本；设计三张关联表并写出带 JOIN、分组、开窗函数的统计 SQL；写 Dockerfile 与 docker-compose 一键启动数据库和后端；用 FastAPI + SQLAlchemy 完成带校验的 CRUD；用 Vue3 + Axios 完成列表、表单、搜索页面并对接接口。

最容易踩的坑有四个。第一，**在 Windows 上开发、在 Linux 上运行，路径与大小写不一致**，本地好好的，服务器上找不到文件。第二，**SQL 只会单表查询**，一到多表就写出笛卡尔积，数据量翻几十倍。第三，**Docker 容器里连不上 MySQL**，把 `127.0.0.1` 当成宿主机地址，实际上容器里的 localhost 是容器自己。第四，**前后端联调跨域**，浏览器报 CORS 却一直改后端业务代码。

<div class="callout plain"><span class="tag">大白话</span><p>这一阶段像装修房子的水电阶段：看不见，但后面所有家具都靠它。Linux 是地暖，MySQL 是水管，Docker 是整体卫浴，FastAPI 是插座面板，Vue 是墙上的开关。水电没做好，后面智能家居再高级也用不了。</p></div>

## 教学路径

<div class="callout path"><span class="tag">教学路径</span><ol class="path-steps"><li><b>第 1 步（2 天）：</b>Linux 环境准备与核心命令，能在服务器上完成目录、文件、权限、进程操作，产出：一份常用命令速查笔记。</li><li><b>第 2 步（3 天）：</b>Shell 脚本变量、流程控制、函数与定时任务，产出：自动备份与日志清理脚本。</li><li><b>第 3 步（2 天）：</b>grep / sed / awk 与正则，产出：一条命令统计访问日志 Top10 IP。</li><li><b>第 4 步（3 天）：</b>MySQL 安装与 SQL 基础、约束、建库建表，产出：一套带约束的业务表。</li><li><b>第 5 步（4 天）：</b>多表 JOIN、子查询、开窗函数与远程连接，产出：5 条业务统计 SQL。</li><li><b>第 6 步（3 天）：</b>Docker 镜像、容器、数据卷、网络与 Compose，产出：一键起 MySQL 的 compose 文件。</li><li><b>第 7 步（5 天）：</b>FastAPI + Pydantic + SQLAlchemy 完成 CRUD 与依赖注入，产出：可用的后端接口。</li><li><b>第 8 步（5 天）：</b>HTML / CSS / JS / ES6 模块化 / npm / Vue3 + Axios，产出：对接接口的列表与表单页。</li><li><b>第 9 步（4 天）：</b>前后端联调、Docker 部署、Nginx 托管前端，产出：完整可访问的小型项目。</li></ol></div>

## 学习前准备

### 前置知识

必须完成阶段 01，能用 Python 写出分层的小程序，理解函数、类、异常和虚拟环境。如果对“什么是进程”“什么是端口”完全没有概念，先补第 1 步再往下走。

### 环境与软件清单

| 软件 | 建议版本 | 用途 | 说明 |
|-|-|-|-|
| 云服务器或虚拟机 | Ubuntu 22.04 | 练习 Linux 与部署 | 最低 2 核 4G，能 SSH 登录 |
| WSL2（可选） | Windows 10/11 | 本机练 Linux | 不想买服务器就用它 |
| MySQL | 8.0 | 业务数据存储 | 本地装或用 Docker 起 |
| Docker Desktop | 最新版 | 容器化 | Windows 需开启 WSL2 后端 |
| Python | 3.11 / 3.12 | 后端开发 | 建独立虚拟环境 |
| Node.js | 20 LTS | 前端构建 | 用 nvm 管理版本 |
| VS Code | 最新版 | 全栈开发 | 装 Python、Vue 扩展 |
| Apifox / Postman | 最新版 | 接口调试 | 验证后端返回 |

<div class="callout tip"><span class="tag">老师建议</span><p>不要一上来就买高配服务器。2 核 4G 足够跑 MySQL + FastAPI + Nginx，把省下的钱用来买图床或模型额度更值。所有练习优先用 Docker 起依赖，卸载干净、重装方便，不污染本机。</p></div>

### 三道自测题

1. 一个服务启动后访问不了，你会按什么顺序排查？至少说出四个检查点。
2. 一张订单表和一张用户表，如何查出“每个用户的订单总金额”，并只显示总金额大于 1000 的用户？
3. 前端请求后端接口报 `blocked by CORS policy`，问题出在哪一层？有哪两种解决方式？

## 模块精讲

### 模块1：Linux 基础 & Shell

**解决什么问题**

线上问题永远发生在服务器上，而你只有一个黑窗口。这个模块让你在没有图形界面的情况下，能定位“服务为什么起不来、磁盘为什么满、端口被谁占了”，并能把重复操作写成脚本自动执行。

**核心概念**

- 目录结构：`/etc` 配置、`/var/log` 日志、`/opt` 自定义软件、`/home` 用户目录、`/tmp` 临时文件。
- 文件操作：`ls`、`cd`、`pwd`、`cp`、`mv`、`rm`、`mkdir -p`、`find`、`tar`。
- 权限：`rwx` 三组权限，`chmod 755`、`chown user:group`，`sudo` 提权。
- 进程与服务：`ps -ef`、`top`、`kill -9`、`systemctl status/start/restart`、`journalctl -u`。
- 网络与端口：`ss -lntp`、`curl`、`ping`、`telnet`，端口被占用是最高频的启动失败原因。
- Shell 脚本：shebang、变量、`$1` 参数、`if / case / for / while`、函数、`set -euo pipefail`。
- 文本处理三件套：`grep` 过滤、`sed` 替换、`awk` 按列统计。
- 定时任务：`crontab -e`，备份与清理脚本靠它自动跑。

**关键代码**

```bash
# 1. 登录服务器并确认环境
ssh root@192.168.1.10                 # 生产环境不要直接用 root，练习可以
uname -a                              # 内核与架构
cat /etc/os-release                   # 发行版版本
df -h                                 # 磁盘使用率，满了服务必挂
free -h                               # 内存，OOM 会杀进程

# 2. 目录与文件
mkdir -p /opt/myapp/logs              # -p 自动创建父目录，已存在不报错
cp -r /opt/myapp /opt/backup/         # -r 递归复制目录
tar -czf backup-$(date +%F).tar.gz /opt/myapp   # 打包压缩，文件名带日期
find /opt/myapp -name "*.log" -mtime +7 -delete # 删除 7 天前的日志

# 3. 权限：文件 644，目录 755，脚本要可执行
chmod 755 deploy.sh                   # 所有者读写执行，其他人读执行
chown -R app:app /opt/myapp           # 递归改属主，容器挂载时经常要改

# 4. 进程与端口：服务起不来先看这两条
ps -ef | grep uvicorn                 # 进程在不在
ss -lntp | grep 8000                  # 端口被谁监听，没有输出说明没起来
kill -9 12345                         # 强制结束进程，先确认 PID

# 5. 日志：先看最后 100 行，再实时跟踪
tail -n 100 /var/log/myapp/error.log
tail -f /var/log/myapp/app.log
journalctl -u myapp -n 100 --no-pager # systemd 管理的服务日志
```

```bash
#!/usr/bin/env bash
# backup.sh：备份指定目录，保留最近 7 天
set -euo pipefail                     # 出错即退出、未定义变量报错、管道错误不吞

SRC_DIR="${1:-/opt/myapp}"            # 第一个参数，缺省为 /opt/myapp
BACKUP_DIR="${2:-/opt/backup}"
STAMP="$(date +%Y%m%d-%H%M%S)"
KEEP_DAYS=7

log() {                               # 自定义函数，统一日志格式
  echo "[$(date '+%F %T')] $*"
}

if [[ ! -d "$SRC_DIR" ]]; then        # [[ ]] 比 [ ] 更安全，支持模式匹配
  log "源目录不存在：$SRC_DIR"
  exit 1                              # 非零退出码，crontab 能感知失败
fi

mkdir -p "$BACKUP_DIR"
TARGET="$BACKUP_DIR/app-$STAMP.tar.gz"
tar -czf "$TARGET" -C "$(dirname "$SRC_DIR")" "$(basename "$SRC_DIR")"
log "备份完成：$TARGET ($(du -h "$TARGET" | cut -f1))"

# 清理过期备份：先找再删，避免误删
find "$BACKUP_DIR" -name "app-*.tar.gz" -mtime +"$KEEP_DAYS" -delete
log "已清理 $KEEP_DAYS 天前的备份"
```

```bash
#!/usr/bin/env bash
# 流程控制演示：循环、条件、分支
for port in 3306 8000 80; do            # for 遍历列表
  if ss -lntp | grep -q ":$port "; then
    echo "端口 $port 正常监听"
  else
    echo "端口 $port 未监听" >&2
  fi
done

count=0
while read -r line; do                  # while 逐行读取
  count=$((count + 1))
done < /var/log/nginx/access.log
echo "日志行数：$count"

case "${1:-start}" in                   # case 按参数分发动作
  start) echo "启动服务" ;;
  stop)  echo "停止服务" ;;
  *)     echo "用法：$0 {start|stop}"; exit 2 ;;
esac
```

```bash
#!/usr/bin/env bash
# log_report.sh：统计 Nginx 访问日志的 Top10 IP 与状态码分布
set -euo pipefail
LOG_FILE="${1:-/var/log/nginx/access.log}"

# awk 按空格切分，$1 是客户端 IP；sort 排序，uniq -c 计数，sort -nr 倒序
echo "=== Top10 IP ==="
awk '{print $1}' "$LOG_FILE" | sort | uniq -c | sort -nr | head -10

echo "=== 状态码分布 ==="
awk '{print $9}' "$LOG_FILE" | sort | uniq -c | sort -nr

echo "=== 5xx 请求样例 ==="
grep -E ' 5[0-9]{2} ' "$LOG_FILE" | tail -5

# sed 实战：把日志中的手机号中间四位打码
sed -E 's/(1[3-9][0-9])[0-9]{4}([0-9]{4})/\1****\2/g' "$LOG_FILE" > masked.log
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `df -h` / `free -h` | 容量与内存检查 | 磁盘满、内存耗尽是最常见的“服务莫名挂掉”原因 |
| `ss -lntp` | 查看监听端口 | 启动失败先确认端口是否被占或根本没监听 |
| `tail -f` | 实时跟踪日志 | 复现问题时能立刻看到新日志 |
| `set -euo pipefail` | 严格模式 | 任何一步失败立即退出，避免带病继续执行 |
| `${1:-默认值}` | 参数默认值 | 脚本既能无参运行，也能指定目录 |
| `[[ -d "$SRC_DIR" ]]` | 条件判断 | 比 `[ ]` 更安全，避免变量为空时语法错误 |
| `tar -C 目录` | 指定工作目录 | 备份包里不带绝对路径前缀，恢复时更安全 |
| `awk '{print $1}'` | 按列取字段 | 日志分析的核心手段，比 cut 更灵活 |
| `uniq -c` | 相邻去重计数 | 必须先用 `sort`，否则相同内容不相邻会重复统计 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>用 <code>rm -rf $DIR/</code> 而变量为空，命令变成 <code>rm -rf /</code>。脚本开头加 <code>set -u</code> 并给变量默认值。</li><li>Windows 编辑的脚本带到 Linux，换行是 CRLF，报 <code>bad interpreter</code>。用 <code>dos2unix</code> 或编辑器改成 LF。</li><li>脚本没有执行权限，直接 <code>./backup.sh</code> 报 Permission denied，需要 <code>chmod +x</code>。</li><li>crontab 里用了相对路径，执行时工作目录不是脚本目录，全部失败。crontab 中一律写绝对路径。</li><li>改完配置忘记 <code>systemctl daemon-reload</code>，服务仍按旧配置运行。</li><li>直接 <code>kill -9</code> 数据库进程，可能造成数据损坏，应先 <code>kill</code> 优雅退出。</li></ul></div>

### 模块2：MySQL

**解决什么问题**

JSON 文件能存客户信息，但存不了十万条订单，也做不了“按月统计销售额”。MySQL 解决三件事：数据持久化、并发安全、按条件高效检索。后端所有业务最终都要落到表上，接口只是表操作的外壳。

**核心概念**

- 库与表：`CREATE DATABASE`、`USE`、`CREATE TABLE`，字符集统一 `utf8mb4`。
- 数据类型：`INT`、`BIGINT`、`DECIMAL(10,2)`、`VARCHAR(n)`、`DATETIME`、`TEXT`、`JSON`。金额必须用 `DECIMAL`，不能用 `FLOAT`。
- 约束：主键 `PRIMARY KEY`、自增 `AUTO_INCREMENT`、非空 `NOT NULL`、唯一 `UNIQUE`、默认 `DEFAULT`、外键 `FOREIGN KEY`、检查 `CHECK`。
- 增删改查：`INSERT`、`UPDATE`、`DELETE`、`SELECT`，以及 `WHERE / ORDER BY / LIMIT / GROUP BY / HAVING`。
- 多表：`INNER JOIN`、`LEFT JOIN`、自连接；一对多与多对多的表设计。
- 子查询与开窗函数：`ROW_NUMBER()`、`RANK()`、`SUM() OVER()`，用于分组排名与累计统计。
- 索引：B+ 树，加速 `WHERE / JOIN / ORDER BY`，但会拖慢写入。
- 远程连接：`bind-address`、用户授权 `'user'@'%'`、防火墙放行 3306。

**关键代码**

```bash
# 用 Docker 起一个 MySQL 8，避免本机安装一堆依赖
docker run -d --name mysql8 \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=shop \
  -v mysql-data:/var/lib/mysql \
  mysql:8.0

# 进入容器执行 SQL
docker exec -it mysql8 mysql -uroot -proot123 shop
```

```sql
-- 1. 建库建表：字符集与引擎统一，金额用 DECIMAL
CREATE DATABASE IF NOT EXISTS shop
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE shop;

CREATE TABLE users (
  id        BIGINT PRIMARY KEY AUTO_INCREMENT,       -- 主键自增
  name      VARCHAR(50)  NOT NULL,
  phone     VARCHAR(20)  NOT NULL UNIQUE,            -- 唯一约束，手机号不可重复
  level     TINYINT      NOT NULL DEFAULT 1,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT        NOT NULL,
  amount     DECIMAL(10,2) NOT NULL CHECK (amount >= 0),  -- 金额禁止负数
  status     VARCHAR(20)   NOT NULL DEFAULT 'paid',
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_created (user_id, created_at),           -- 联合索引，覆盖常用查询
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 2. 增删改查
INSERT INTO users (name, phone, level) VALUES
  ('张三', '13800000001', 2),
  ('李四', '13800000002', 1),
  ('王五', '13800000003', 3);

INSERT INTO orders (user_id, amount, status, created_at) VALUES
  (1, 199.00, 'paid',   '2026-09-01 10:00:00'),
  (1, 320.50, 'paid',   '2026-10-03 11:20:00'),
  (2, 88.00,  'refund', '2026-10-05 09:10:00'),
  (3, 1200.00,'paid',   '2026-11-01 20:00:00');

UPDATE orders SET status = 'refund' WHERE id = 2;
DELETE FROM orders WHERE status = 'refund' AND amount < 100;
```

```sql
-- 3. 多表查询：每个用户的订单数与总金额
SELECT u.id, u.name,
       COUNT(o.id)              AS order_cnt,
       COALESCE(SUM(o.amount),0) AS total_amount
FROM users u
LEFT JOIN orders o                       -- 左连接：没下单的用户也要显示
       ON o.user_id = u.id AND o.status = 'paid'
GROUP BY u.id, u.name
HAVING total_amount > 0                  -- HAVING 过滤聚合后的结果
ORDER BY total_amount DESC;

-- 4. 开窗函数：每个用户按时间倒序取最近一单
SELECT user_id, amount, created_at
FROM (
  SELECT user_id, amount, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
  FROM orders
) t
WHERE rn = 1;                            -- 窗口函数不能直接写在 WHERE 里

-- 5. 累计统计：按天统计销售额与累计销售额
SELECT DATE(created_at) AS d,
       SUM(amount)                                    AS day_amount,
       SUM(SUM(amount)) OVER (ORDER BY DATE(created_at)) AS running_total
FROM orders
WHERE status = 'paid'
GROUP BY DATE(created_at)
ORDER BY d;
```

```bash
# 6. 远程连接配置：让本机 Navicat / 后端服务能连上
# 修改 MySQL 配置，把监听地址从 127.0.0.1 改成 0.0.0.0
docker exec -it mysql8 bash -c "echo 'bind-address=0.0.0.0' >> /etc/mysql/conf.d/mysql.cnf"
docker restart mysql8

# 创建可远程登录的用户，% 表示任意来源 IP
docker exec -it mysql8 mysql -uroot -proot123 -e "
CREATE USER 'app'@'%' IDENTIFIED BY 'App@123456';
GRANT SELECT, INSERT, UPDATE, DELETE ON shop.* TO 'app'@'%';
FLUSH PRIVILEGES;"
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `utf8mb4` | 完整 UTF-8 | 支持 emoji，普通 `utf8` 在 MySQL 里是残缺的 |
| `DECIMAL(10,2)` | 精确金额 | `FLOAT` 会有精度误差，金额计算必须精确 |
| `UNIQUE` + `NOT NULL` | 业务唯一性 | 手机号重复是脏数据的第一来源，交给数据库兜底 |
| `INDEX (user_id, created_at)` | 联合索引 | 同时覆盖“按用户查”和“按时间排序” |
| `LEFT JOIN ... AND` | 连接条件放 ON | 放 WHERE 会把左表无匹配的行过滤掉，退化成内连接 |
| `HAVING` | 聚合后过滤 | `WHERE` 在分组前执行，不能用于聚合函数结果 |
| `ROW_NUMBER() OVER` | 分组排名 | 取每组 TopN 的标准写法，比自连接简单 |
| `COALESCE` | 空值兜底 | 用户没有订单时 `SUM` 为 NULL，展示成 0 更友好 |
| `'app'@'%'` | 远程用户 | `'app'@'localhost'` 只允许本机登录 |

<div class="callout tip"><span class="tag">老师建议</span><p>写 SQL 先想“表之间是什么关系”，再决定 JOIN。一对多用左连接保主表，多对多必须有一张中间表。凡是出现“结果行数比预期多”，九成是漏了连接条件或一对多直接聚合。</p></div>

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li><code>LEFT JOIN</code> 后在 <code>WHERE</code> 里过滤右表字段，左连接直接失效。</li><li><code>GROUP BY</code> 的字段与 <code>SELECT</code> 的非聚合字段不一致，开启 <code>ONLY_FULL_GROUP_BY</code> 后直接报错。</li><li>在索引列上做函数运算，如 <code>WHERE DATE(created_at) = '2026-11-01'</code>，索引失效。</li><li>用 <code>SELECT *</code> 做接口查询，字段一变前端就崩，且浪费 IO。</li><li>忘记 <code>COMMIT</code> 或自动提交被关闭，代码里看不到数据。</li><li>远程连不上只改代码，没检查 <code>bind-address</code>、用户 host、云服务器安全组三处。</li><li>用 <code>DELETE</code> 做逻辑删除，数据无法恢复，业务上应加 <code>deleted</code> 标记。</li></ul></div>

### 模块3：Docker

**解决什么问题**

“在我电脑上能跑”是交付阶段最大的笑话：Python 版本不同、MySQL 没装、环境变量忘了配。Docker 把“操作系统 + 依赖 + 代码 + 配置”打成一个镜像，在任何装了 Docker 的机器上都能用同一条命令跑起来。

**核心概念**

- 镜像（Image）：只读模板，分层存储；`Dockerfile` 是构建镜像的说明书。
- 容器（Container）：镜像的运行实例，可启停删，隔离进程与文件系统。
- 仓库（Registry）：存放镜像，如 Docker Hub、阿里云 ACR。
- 数据卷（Volume）：容器删了数据还在，数据库必须挂卷。
- 端口映射：`-p 宿主机端口:容器端口`，容器内部端口不对外。
- 网络：同一自定义网络内可用服务名互相访问，这是 Compose 的基础。
- Compose：用一个 YAML 描述多个服务，一条命令全部启动。

**关键代码**

```bash
# 1. 安装后验证
docker version
docker info

# 2. 镜像管理
docker pull mysql:8.0                 # 拉取镜像
docker images                         # 查看本地镜像
docker rmi mysql:8.0                  # 删除镜像，需先删依赖它的容器

# 3. 容器管理
docker run -d --name mysql8 -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -v mysql-data:/var/lib/mysql \
  mysql:8.0                           # -d 后台运行，-e 环境变量，-v 挂卷
docker ps                             # 运行中的容器
docker ps -a                          # 包括已退出的，排查启动失败必看
docker logs -f mysql8                 # 看容器日志
docker exec -it mysql8 bash           # 进入容器
docker stop mysql8 && docker rm mysql8
```

```text
# Dockerfile：把 FastAPI 服务打成镜像
FROM python:3.12-slim                 # 基础镜像，slim 体积更小

WORKDIR /app                          # 后续命令的工作目录
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1                # 日志实时输出，不被缓冲

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt   # 先装依赖，利用镜像层缓存

COPY . .                              # 再拷代码，代码变动不会导致重装依赖

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml：一条命令起 MySQL + 后端
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: shop
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql     # 数据持久化
    healthcheck:                      # 健康检查，后端等它就绪再启动
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      retries: 10

  api:
    build: .                          # 用当前目录 Dockerfile 构建
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: mysql+pymysql://root:root123@db:3306/shop
    depends_on:
      db:
        condition: service_healthy    # 等数据库健康后再启动
    restart: unless-stopped

volumes:
  mysql-data:
```

```bash
# 启动、查看、进入、清理
docker compose up -d --build
docker compose ps
docker compose logs -f api
docker compose down                   # 停止并删除容器，数据卷默认保留
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `-p 3306:3306` | 端口映射 | 左边是宿主机，右边是容器，写反了就连不上 |
| `-v mysql-data:/var/lib/mysql` | 数据卷 | 不挂卷，容器一删数据库全没 |
| `docker ps -a` | 查看所有容器 | 启动失败退出后 `docker ps` 看不到，必须加 `-a` |
| `COPY requirements.txt` 先于 `COPY . .` | 利用缓存 | 只改代码时不用重新装依赖，构建快很多 |
| `--host 0.0.0.0` | 监听所有网卡 | 只监听 127.0.0.1 时容器外访问不到 |
| `depends_on.condition` | 启动顺序 | 普通 `depends_on` 只保证顺序，不保证数据库真的可用 |
| `@db:3306` | 服务名寻址 | Compose 网络内用服务名代替 IP，容器重建 IP 变了也不受影响 |

<div class="callout plain"><span class="tag">大白话</span><p>镜像像“安装光盘”，容器像“装好并开机的电脑”，数据卷像“外接硬盘”。光盘可以装很多台电脑，电脑可以随时砸掉重装，外接硬盘里的资料不会丢。</p></div>

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>容器里用 <code>127.0.0.1</code> 连 MySQL，实际连的是容器自己。Compose 里要用服务名。</li><li>不挂数据卷，执行 <code>docker compose down</code> 后数据库数据全没。</li><li>每次改代码都全量重建镜像，构建几分钟。应优化 Dockerfile 层顺序或用挂载开发。</li><li>镜像越做越大，把 <code>.venv</code>、<code>node_modules</code>、<code>.git</code> 全拷进去，必须写 <code>.dockerignore</code>。</li><li>容器时区是 UTC，业务时间差 8 小时，需设置 <code>TZ=Asia/Shanghai</code>。</li><li>用 <code>latest</code> 标签，某天上游更新导致构建结果变了，生产必须锁版本。</li></ul></div>

### 模块4：FastAPI

**解决什么问题**

前端、Agent、第三方系统都不能直接调用你的 Python 函数，它们只认 HTTP 接口。FastAPI 负责把函数变成“有 URL、有参数校验、有标准返回、有文档”的接口，并配合 SQLAlchemy 把数据落到 MySQL。这是后面所有 AI 服务对外提供能力的统一方式。

**核心概念**

- ASGI 与 Uvicorn：FastAPI 是 ASGI 应用，Uvicorn 是跑它的服务器，支持异步与热重载。
- 路由：`@app.get / post / put / delete`，路径参数、查询参数、请求体。
- Pydantic：请求与响应的数据模型，自动做类型转换与校验，校验失败返回 422。
- 依赖注入：`Depends` 管理数据库会话、当前用户、公共参数，路由函数只管业务。
- SQLAlchemy 2.0：`DeclarativeBase` + `Mapped` 定义模型，`Session` 执行查询。
- 分层：`router`（接口）→ `service`（业务）→ `repository / ORM`（数据），不要把所有逻辑写进路由。
- 部署：`uvicorn app.main:app --host 0.0.0.0 --port 8000`，生产前面挂 Nginx。

**关键代码**

```python
# app/db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = "mysql+pymysql://app:App%40123456@127.0.0.1:3306/shop?charset=utf8mb4"
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=5)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db                       # 交给路由使用
    finally:
        db.close()                     # 请求结束必定关闭，防止连接池耗尽
```

```python
# app/models.py
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    amount: Mapped[float] = mapped_column(Numeric(10, 2))
    status: Mapped[str] = mapped_column(String(20), default="paid")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
```

```python
# app/schemas.py
from datetime import datetime
from pydantic import BaseModel, Field

class OrderIn(BaseModel):
    user_id: int = Field(gt=0)
    amount: float = Field(gt=0, le=1_000_000)
    status: str = Field(default="paid", pattern="^(paid|refund|cancel)$")

class OrderOut(OrderIn):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}   # 允许从 ORM 对象直接转换
```

```python
# app/main.py
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import Base, engine, get_db
from .models import Order
from .schemas import OrderIn, OrderOut

Base.metadata.create_all(engine)               # 练习用；生产用 Alembic 迁移
app = FastAPI(title="Shop API", version="1.0")

app.add_middleware(                        # 前后端分离必须配 CORS
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # 开发期前端地址，生产写真实域名
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/orders", response_model=OrderOut, status_code=201)
def create_order(payload: OrderIn, db: Session = Depends(get_db)):
    order = Order(**payload.model_dump())
    db.add(order)
    db.commit()
    db.refresh(order)                      # 拿回自增 id 与数据库生成的时间
    return order

@app.get("/orders", response_model=list[OrderOut])
def list_orders(
    status: str | None = Query(default=None, pattern="^(paid|refund|cancel)$"),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    stmt = select(Order).order_by(Order.id.desc()).limit(limit)
    if status:
        stmt = stmt.where(Order.status == status)
    return db.scalars(stmt).all()

@app.get("/orders/{oid}", response_model=OrderOut)
def get_order(oid: int, db: Session = Depends(get_db)):
    order = db.get(Order, oid)
    if order is None:
        raise HTTPException(status_code=404, detail="订单不存在")
    return order

@app.delete("/orders/{oid}", status_code=204)
def delete_order(oid: int, db: Session = Depends(get_db)):
    order = db.get(Order, oid)
    if order is None:
        raise HTTPException(status_code=404, detail="订单不存在")
    db.delete(order)
    db.commit()
```

```bash
# 安装与启动
pip install "fastapi[standard]" sqlalchemy pymysql
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# 打开 http://127.0.0.1:8000/docs 直接调试接口（Swagger 自动生成）
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `pool_pre_ping=True` | 连接前探活 | 防止 MySQL 空闲断开后，第一次请求报连接已失效 |
| `yield` + `finally` | 会话生命周期 | 每个请求独立会话，异常也能关闭 |
| `response_model` | 出参约束 | 防止把内部字段（如密码）返回给前端 |
| `Field(pattern=...)` | 枚举校验 | 状态值非法时框架自动返回 422，不用手写 if |
| `Query(ge=1, le=100)` | 参数范围 | 防止前端传 `limit=999999` 拖垮数据库 |
| `CORSMiddleware` | 跨域放行 | 前后端不同端口时浏览器才允许请求 |
| `db.refresh` | 刷新对象 | `commit` 后拿到自增主键与默认时间 |
| `204` + 无返回体 | 删除语义 | REST 规范中删除成功不返回内容 |

<div class="callout tip"><span class="tag">老师建议</span><p>接口写完先用 <code>/docs</code> 自测，再用 Apifox 存成集合。不要等前端写完才发现接口字段不对，联调成本远高于自测成本。错误码提前约定：参数错 422、不存在 404、冲突 409、服务端 500。</p></div>

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li>路由函数写成 <code>async def</code> 却用同步数据库驱动，整个服务被阻塞。要么全同步，要么全异步。</li><li>忘记 <code>db.commit()</code>，接口返回成功但数据库没数据。</li><li>把 ORM 对象直接返回，字段过多或触发懒加载报错，必须用 <code>response_model</code>。</li><li>数据库密码里有 <code>@</code> 等特殊字符，URL 里没转义（应写成 <code>%40</code>），连接串解析失败。</li><li>开发环境 CORS 写 <code>allow_origins=["*"]</code> 又带 cookie，浏览器仍拒绝，需写具体来源。</li><li>生产用 <code>--reload</code>，文件一改服务重启，必须去掉。</li></ul></div>

### 模块5：前端工程化

**解决什么问题**

后端接口只有 JSON，用户看不懂。前端负责把数据变成可操作的界面。这一模块从 HTML/CSS/JS 原生基础讲到 Vue3 工程化，目标是能独立完成“列表 + 搜索 + 新增表单 + 删除确认”这类真实页面，并能与 FastAPI 对接。

**核心概念**

- HTML：语义化标签、表单、`data-*` 属性；CSS：盒模型、Flex 布局、选择器优先级。
- JavaScript：变量、函数、数组方法、DOM 操作、事件监听、`fetch`。
- ES6+：`let / const`、箭头函数、解构、模板字符串、`import / export` 模块化。
- Node 与 npm：前端也需要运行时来装依赖、跑构建；`nvm` 管理 Node 版本。
- 异步：回调 → Promise → `async / await`，`fetch` 与 Axios 都是 Promise 风格的 AJAX 请求。
- Vue3：`createApp`、单文件组件 `.vue`、`ref / reactive`、`computed`、`v-model`、`v-for`、`v-if`。
- 工程化：Vite 创建项目、开发代理解决跨域、`npm run build` 产出静态文件交给 Nginx。

**关键代码**

```html
<!-- 原生基础：一个最小的待办列表，理解 DOM 与事件 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>待办清单</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 480px; margin: 40px auto; }
    .done { text-decoration: line-through; color: #94a3b8; }  /* 完成态样式 */
    li { display: flex; justify-content: space-between; padding: 8px 0; }
  </style>
</head>
<body>
  <h1>待办清单</h1>
  <form id="form">
    <input id="input" placeholder="输入待办后回车" required />
    <button>添加</button>
  </form>
  <ul id="list"></ul>

  <script type="module">
    const form = document.querySelector("#form");
    const input = document.querySelector("#input");
    const list = document.querySelector("#list");

    form.addEventListener("submit", (e) => {
      e.preventDefault();                       // 阻止表单默认刷新页面
      const text = input.value.trim();
      if (!text) return;
      const li = document.createElement("li");
      li.innerHTML = `<span>${text}</span><button>删除</button>`;
      li.querySelector("button").addEventListener("click", () => li.remove());
      li.querySelector("span").addEventListener("click", () => {
        li.classList.toggle("done");            // 点击切换完成状态
      });
      list.appendChild(li);
      input.value = "";
    });
  </script>
</body>
</html>
```

```js
// src/api/orders.js：把接口调用集中管理，组件里不写 URL
import axios from "axios";

const http = axios.create({
  baseURL: "/api",                 // 开发时由 Vite 代理到后端，避免跨域
  timeout: 10000,
});

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.detail || err.message || "请求失败";
    return Promise.reject(new Error(msg));   // 统一错误信息，页面只负责展示
  }
);

export const listOrders = (params) => http.get("/orders", { params });
export const createOrder = (data) => http.post("/orders", data);
export const removeOrder = (id) => http.delete(`/orders/${id}`);
```

```html
<!-- src/views/OrderList.vue：列表 + 搜索 + 新增 + 删除 -->
<script setup>
import { onMounted, ref } from "vue";
import { createOrder, listOrders, removeOrder } from "../api/orders";

const orders = ref([]);
const status = ref("");
const form = ref({ user_id: 1, amount: 0, status: "paid" });
const error = ref("");

async function load() {
  try {
    orders.value = await listOrders({ status: status.value || undefined });
  } catch (e) {
    error.value = e.message;
  }
}

async function submit() {
  try {
    await createOrder({ ...form.value, amount: Number(form.value.amount) });
    await load();
    form.value.amount = 0;
  } catch (e) {
    error.value = e.message;
  }
}

async function remove(id) {
  if (!confirm("确认删除该订单？")) return;
  await removeOrder(id);
  await load();
}

onMounted(load);            // 组件挂载后拉一次数据
</script>

<template>
  <section>
    <h2>订单列表</h2>
    <p v-if="error" class="error">{{ error }}</p>

    <select v-model="status" @change="load">
      <option value="">全部</option>
      <option value="paid">已支付</option>
      <option value="refund">退款</option>
    </select>

    <form @submit.prevent="submit">
      <input v-model.number="form.amount" type="number" min="0.01" step="0.01" required />
      <button>新增订单</button>
    </form>

    <ul>
      <li v-for="o in orders" :key="o.id">
        <span>#{{ o.id }} ￥{{ o.amount }} {{ o.status }}</span>
        <button @click="remove(o.id)">删除</button>
      </li>
      <li v-if="orders.length === 0">暂无数据</li>
    </ul>
  </section>
</template>
```

```js
// vite.config.js：开发代理，把 /api 转发到 FastAPI
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),   // 去掉前缀再转发
      },
    },
  },
});
```

```bash
# Node 版本管理与项目初始化
nvm install 20 && nvm use 20
npm create vite@latest shop-web -- --template vue
cd shop-web
npm install
npm install axios
npm run dev          # 开发服务器，默认 5173
npm run build        # 产出 dist/，交给 Nginx 托管
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `type="module"` | 启用 ES 模块 | 才能使用 `import / export` |
| `e.preventDefault()` | 阻止表单刷新 | 默认提交会整页跳转，状态全丢 |
| `axios.create` | 统一实例 | baseURL、超时、拦截器只配一次 |
| 响应拦截器 | 统一错误处理 | 页面不用每个请求都写 try/catch 之外的判断 |
| `ref` | 响应式数据 | 修改 `.value` 触发视图更新 |
| `v-model.number` | 双向绑定 + 转数字 | 输入框默认是字符串，金额必须转 number |
| `@submit.prevent` | 阻止默认提交 | Vue 写法等价于 `preventDefault` |
| Vite proxy | 开发期跨域 | 浏览器请求同源 `/api`，由 Node 代理转发 |
| `npm run build` | 生产构建 | 产出压缩后的静态文件，交给 Nginx |

<div class="callout plain"><span class="tag">大白话</span><p>前端工程化像连锁餐厅的中央厨房：<code>npm</code> 是采购，<code>Vite</code> 是加工流水线，<code>Vue</code> 是标准化菜谱，<code>dist</code> 是打包好的成品。你不需要每次从种菜开始，但要知道每个环节放在哪。</p></div>

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span><ul><li><code>ref</code> 定义的变量在 JS 里忘了写 <code>.value</code>，数据改了视图不动。</li><li><code>v-for</code> 没写 <code>:key</code>，列表更新错乱且性能差。</li><li>直接请求后端 <code>http://127.0.0.1:8000</code>，开发期跨域；应走代理或后端配 CORS。</li><li>把 <code>node_modules</code> 提交到 Git，仓库巨大，必须写 <code>.gitignore</code>。</li><li>Node 版本与依赖不匹配，安装报错。团队统一用 <code>.nvmrc</code> 锁版本。</li><li>生产环境仍用开发代理，打包后代理失效，必须由 Nginx 配置反向代理。</li><li>接口返回的金额是字符串（Decimal 序列化），前端直接相加变成拼接，需显式转数字。</li></ul></div>

## 综合实战

目标：在 Linux 服务器上用一套 Compose 启动 MySQL、FastAPI、Nginx 三个服务，浏览器访问页面能完成订单的查询与新增。这是本阶段所有知识的汇合点：Linux 上操作、MySQL 存数据、Docker 打包、FastAPI 提供接口、Vue 构建产物由 Nginx 托管。

**第 1 步：准备目录结构**

```text
shop/
├── docker-compose.yml
├── .env                        # 数据库密码等敏感配置，不进 Git
├── api/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── db.py
│       ├── models.py
│       ├── schemas.py
│       └── main.py
└── web/
    ├── nginx.conf
    └── dist/                   # npm run build 的产物
```

**第 2 步：编写后端镜像与依赖**

```text
# api/Dockerfile
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 TZ=Asia/Shanghai
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```text
# api/requirements.txt
fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlalchemy==2.0.36
pymysql==1.1.1
cryptography==44.0.0
```

**第 3 步：配置 Nginx，同时托管前端与反向代理接口**

```text
# web/nginx.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;    # 单页应用刷新不 404
    }

    location /api/ {
        proxy_pass http://api:8000/;          # 末尾斜杠会去掉 /api 前缀
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 60s;               # 模型类接口耗时较长时调大
    }
}
```

**第 4 步：编写编排文件**

```yaml
services:
  db:
    image: mysql:8.0
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_0900_ai_ci
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: shop
      TZ: Asia/Shanghai
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 5s
      retries: 12

  api:
    build: ./api
    environment:
      DATABASE_URL: mysql+pymysql://root:${MYSQL_ROOT_PASSWORD}@db:3306/shop?charset=utf8mb4
    depends_on:
      db:
        condition: service_healthy
    expose:
      - "8000"                 # 只对内部网络暴露，不映射到宿主机
    restart: unless-stopped

  web:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
    volumes:
      - ./web/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./web/dist:/usr/share/nginx/html:ro
    depends_on:
      - api
    restart: unless-stopped

volumes:
  mysql-data:
```

**第 5 步：构建前端、启动、验证**

```bash
# 前端在本地或服务器构建，产物放进 web/dist
cd web && npm ci && npm run build

# 启动全部服务
cd ..
docker compose up -d --build
docker compose ps                       # 三个服务都应为 running / healthy

# 分层验证：数据库 -> 接口 -> 页面
docker compose exec db mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SHOW TABLES;" shop
curl -s http://127.0.0.1/api/orders | head
curl -s -X POST http://127.0.0.1/api/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"amount":99.9,"status":"paid"}'
```

### 逐段配置解析

| 配置 | 作用 | 关键点 |
|-|-|-|
| `command: --character-set-server=utf8mb4` | 数据库字符集 | 建库前就定好，避免后期改表 |
| `DATABASE_URL` 中的 `@db:3306` | 容器间寻址 | Compose 网络内用服务名，不用 127.0.0.1 |
| `depends_on: condition: service_healthy` | 启动依赖 | 保证数据库真正可连后再启动后端 |
| `expose: 8000` | 仅内网暴露 | 后端不直接对公网开放，统一走 Nginx |
| `try_files ... /index.html` | 前端路由回退 | 刷新子路由不会 404 |
| `proxy_pass http://api:8000/` | 反向代理 | 末尾斜杠决定是否去掉 `/api` 前缀 |
| `./web/dist:/usr/share/nginx/html:ro` | 静态托管 | 只读挂载，容器内不能改文件 |
| 分层验证顺序 | 排障方法 | 先确认数据库，再确认接口，最后看页面 |

<div class="callout tip"><span class="tag">老师建议</span><p>上线排障永远按“从下往上”的顺序：容器是否健康 → 数据库能否连 → 接口能否返回 → 页面能否请求到。不要一上来就改前端代码，90% 的问题在下面三层。</p></div>

## 疑难点分级

| 知识点 | 难度 | 典型卡点 | 破解方式 |
|-|-|-|-|
| Linux 路径与大小写 | 低 | Windows 能跑，Linux 找不到文件 | 统一小写命名，用绝对路径 |
| 权限与属主 | 中 | 容器挂载目录写入失败 | `chown -R` 调整属主，目录 755 文件 644 |
| 端口占用 | 中 | 服务启动报 Address already in use | `ss -lntp` 找 PID，确认后再 kill |
| Shell 变量为空 | 中 | 脚本误删目录 | `set -u` + 默认值 + 删除前打印路径 |
| crontab 不执行 | 中 | 手动能跑，定时不跑 | 写绝对路径，输出重定向到日志 |
| awk 字段理解 | 中 | 取错列、统计不对 | 先 `head -1` 看清分隔符与列含义 |
| LEFT JOIN 退化 | 高 | 左表数据莫名消失 | 右表过滤条件放 ON，不放在 WHERE |
| 一对多聚合重复 | 高 | 总金额被放大数倍 | 先按主表聚合或子查询去重 |
| 窗口函数位置 | 高 | WHERE 里用排名报错 | 窗口函数放子查询，外层再过滤 |
| 索引失效 | 高 | 建了索引仍全表扫描 | 别在索引列上用函数，看 EXPLAIN |
| 远程连不上 MySQL | 中 | 本机工具一直超时 | 查 bind-address、用户 host、安全组 |
| 容器连宿主机 | 高 | 容器内 127.0.0.1 连不上 | 用服务名或 host.docker.internal |
| 数据卷丢失 | 中 | 重建容器后数据没了 | 数据库必须挂 named volume |
| CORS 跨域 | 中 | 浏览器报 blocked by CORS | 后端写具体来源，或开发用代理 |
| FastAPI 同步阻塞 | 高 | 并发一高就卡死 | 异步路由配异步驱动，或全同步部署多 worker |
| SQLAlchemy 连接池耗尽 | 高 | 请求多了报 timeout | 会话 finally 关闭，合理设置 pool_size |
| Vue 响应式丢失 | 中 | 改了数据页面不变 | `ref` 用 `.value`，整体替换对象而非改属性 |
| 前端路由刷新 404 | 中 | 部署后刷新子页面报错 | Nginx 配 `try_files` 回退 index.html |

## 阶段项目

### 项目：FastAPI 小型项目（订单管理后端 + 管理页面）

**背景**

模拟一个最小可用的电商订单管理后台：运营人员能查看订单、按状态筛选、新增订单、删除订单。它覆盖本阶段全部模块，是考试二的前半部分，也是阶段 03 智能体调用业务接口的底座。

**功能清单**

- 订单列表：分页、按状态筛选、按创建时间倒序。
- 订单详情：按 id 查询，不存在返回 404。
- 新增订单：金额、用户、状态校验，非法返回 422。
- 删除订单：二次确认，删除成功返回 204。
- 用户列表：至少提供只读接口，供前端下拉选择。
- 统一错误响应：`{"detail": "..."}`，前端能直接展示。
- 页面：列表、筛选、新增表单、删除确认。
- 部署：Docker Compose 一键启动，Nginx 托管前端并代理接口。

**技术选型**

后端 `FastAPI + Pydantic v2 + SQLAlchemy 2.0 + MySQL 8`；前端 `Vue3 + Vite + Axios`；部署 `Docker + Docker Compose + Nginx`；接口调试用 Swagger `/docs` 与 Apifox。

**验收标准**

- `docker compose up -d` 后，浏览器访问服务器 IP 能看到页面并完成全部操作。
- 数据库重启后数据仍在（验证数据卷）。
- 非法参数、重复数据、查询不存在都有明确提示，页面不白屏。
- 接口文档可访问，字段与前端实际使用一致。
- 代码分层清晰，路由函数内不出现原生 SQL 拼接。
- 至少 3 条 SQL 统计能直接从数据库查出结果。

**评分点**

| 维度 | 分值 | 说明 |
|-|-|-|
| 接口完整与正确性 | 30 | CRUD、筛选、分页、状态码规范 |
| 数据建模与 SQL | 20 | 表结构合理、约束完整、查询正确 |
| 前端交互 | 20 | 列表、表单、错误提示、加载状态 |
| 容器化部署 | 20 | Compose 一键起、数据卷、Nginx 代理 |
| 代码质量 | 10 | 分层、命名、异常处理、注释 |

## 常见面试题

### 问题1：Linux 上服务启动失败，你怎么排查？

**答案要点**

- 先看进程与端口：`ps -ef | grep 服务名`、`ss -lntp | 端口`。
- 再看日志：`journalctl -u 服务名` 或应用日志 `tail -n 200`。
- 检查配置与权限：配置文件路径、属主、目录写权限。
- 检查资源：`df -h` 磁盘、`free -h` 内存、`ulimit` 文件句柄。
- 最后检查网络与依赖：数据库能否连、防火墙与安全组是否放行。

### 问题2：`source script.sh` 和 `./script.sh` 有什么区别？

**答案要点**

- `./script.sh` 启动子 Shell 执行，脚本里的变量与 `cd` 不影响当前终端。
- `source` 在当前 Shell 执行，变量、函数、环境变量会保留。
- 加载环境配置（如虚拟环境）用 `source`，执行任务脚本用 `./`。

### 问题3：`WHERE` 和 `HAVING` 的区别？

**答案要点**

- `WHERE` 在分组前过滤行，不能使用聚合函数。
- `HAVING` 在分组后过滤组，可以使用 `COUNT / SUM` 等聚合结果。
- 能放 `WHERE` 的条件不要放 `HAVING`，前者更早减少数据量。

### 问题4：为什么金额字段用 `DECIMAL` 而不是 `FLOAT`？

**答案要点**

- `FLOAT / DOUBLE` 是二进制浮点，存在精度误差，0.1 + 0.2 不等于 0.3。
- `DECIMAL(m,2)` 按十进制精确存储，适合金额、税率。
- Python 侧对应 `Decimal`，避免中途转成 float 丢失精度。

### 问题5：什么情况下索引会失效？

**答案要点**

- 在索引列上使用函数或表达式，如 `DATE(created_at)`。
- 隐式类型转换，如字符串列用数字查询。
- 模糊查询以 `%` 开头，如 `LIKE '%abc'`。
- 联合索引不满足最左前缀。
- 使用 `OR` 且部分条件无索引。
- 数据量小或选择性差时，优化器可能主动放弃索引。

### 问题6：Docker 镜像和容器的区别？

**答案要点**

- 镜像是只读模板，分层存储；容器是镜像的运行实例，最上层可写。
- 一个镜像可以启动多个容器；容器删除后镜像仍在。
- 容器内改动不会自动写回镜像，需要 `commit` 或重建。

### 问题7：容器里为什么连不上宿主机的 MySQL？

**答案要点**

- 容器有独立网络命名空间，`127.0.0.1` 指容器自身。
- Compose 内用服务名（如 `db`）访问同网络的其他容器。
- 访问宿主机用 `host.docker.internal`（Docker Desktop）或宿主机内网 IP。
- 还要确认 MySQL 监听 `0.0.0.0` 且用户允许远程登录。

### 问题8：FastAPI 的依赖注入解决了什么问题？

**答案要点**

- 把数据库会话、当前用户、公共参数从路由函数中抽离。
- 统一管理资源生命周期（`yield` + `finally` 关闭）。
- 便于测试时替换依赖（`app.dependency_overrides`）。
- 支持依赖嵌套，形成清晰的调用链。

### 问题9：Pydantic 模型和 SQLAlchemy 模型为什么要分开？

**答案要点**

- ORM 模型描述数据库表，关注存储与关系。
- Pydantic 模型描述接口入参与出参，关注校验与序列化。
- 分开可避免把数据库字段（如密码哈希）直接暴露给前端。
- 入参和出参也常分开，出参多 id、创建时间等字段。

### 问题10：前后端分离后跨域是怎么产生的？怎么解决？

**答案要点**

- 浏览器同源策略：协议、域名、端口任一不同即跨域。
- 方案一：后端配置 CORS，明确允许的来源、方法、头。
- 方案二：开发期用 Vite 代理，生产用 Nginx 反向代理，让请求同源。
- 带 Cookie 时不能使用 `*`，必须指定具体来源并允许凭证。

### 问题11：`docker compose down` 和 `down -v` 的区别？

**答案要点**

- `down` 停止并删除容器与网络，默认保留命名数据卷。
- `down -v` 连同数据卷一起删除，数据不可恢复。
- 生产环境慎用 `-v`，除非确认数据已备份。

### 问题12：如何保证接口在高并发下不拖垮数据库？

**答案要点**

- 控制连接池大小，会话及时关闭，避免连接泄漏。
- 列表接口必须分页，禁止无上限查询。
- 高频只读数据加缓存（Redis），减少数据库压力。
- 慢查询加索引并用 `EXPLAIN` 验证。
- 写操作控制事务范围，避免长事务锁表。

## 动手练习

<div class="callout task"><span class="tag">动手练习</span><ol><li>在 Linux 上创建 <code>/opt/practice</code>，把权限改成 750，并解释每一组权限的含义。</li><li>用一条命令找出占用 8000 端口的进程并结束它，要求先确认再 kill。</li><li>写一个 Shell 脚本，接收目录参数，统计该目录下每种扩展名的文件数量。</li><li>用 grep / awk 统计访问日志中访问量最高的 5 个 URL。</li><li>写一个 crontab，每天凌晨 2 点执行备份脚本，并把输出写入日志文件。</li><li>建三张表：用户、商品、订单，写出建表 SQL 并加上合适的主键、外键与索引。</li><li>写 SQL 查询“累计消费超过 500 元的用户”，按金额倒序，并解释为什么用 HAVING。</li><li>用窗口函数查询每个用户金额最高的一笔订单，并说明为什么不能直接 WHERE 排名。</li><li>用 Docker 起一个 MySQL，挂载数据卷，删除容器后重新启动验证数据仍在。</li><li>为 FastAPI 项目写 Dockerfile，构建镜像并运行，确认容器外能访问 <code>/docs</code>。</li><li>写一个 docker-compose.yml，同时启动 MySQL 与后端，后端能连上数据库。</li><li>给订单接口加分页参数，返回 <code>total / page / size / items</code> 四个字段。</li><li>用 Vue3 完成订单列表页，支持状态筛选、新增、删除，并处理请求失败提示。</li><li>配置 Vite 代理，让前端通过 <code>/api</code> 访问后端，浏览器不再报跨域。</li><li>用 Nginx 托管前端构建产物，并配置 <code>/api</code> 反向代理到后端，验证刷新子页面不 404。</li></ol></div>

## 阶段小结

- Linux 排障固定顺序：资源 → 进程 → 端口 → 日志 → 配置，按这个顺序能解决大部分“起不来”。
- Shell 脚本三件套：`set -euo pipefail`、参数默认值、统一日志，缺一个就容易出事故。
- MySQL 的核心不是背语法，而是表关系、约束和索引；金额用 `DECIMAL`，统计想清楚 JOIN 与分组。
- 开窗函数解决“组内排名与累计”，不能直接写在 `WHERE` 里。
- Docker 的三个关键点：镜像分层、数据卷、服务名寻址；数据库不挂卷等于没有数据库。
- FastAPI 的三条主线：Pydantic 校验、Depends 管资源、response_model 控输出。
- 前端工程化的价值是“可维护”：接口集中管理、组件只关心展示、构建产物交给 Nginx。
- 部署排障从下往上：容器 → 数据库 → 接口 → 页面，别一上来就怀疑前端。

下一阶段进入整门课的核心：智能体架构。你会用这一阶段搭好的 FastAPI 把“模型能力”包装成工具接口，用 MySQL 存会话与记忆，用 Docker 部署 Agent 服务。




---

## 补充练习：Vue 综合实战（2026-11-24）

> 素材：`D:\AI1015尚硅谷课程\code\vue-demo`（Vite 6 + Vue 3.5 工程，源码只有 `src/App.vue`、`src/components/HelloWorld.vue`、`src/main.js`）

### 练习 1：把现有 Vue 工程跑起来

在 `D:\AI1015尚硅谷课程\code\vue-demo` 下执行：

```bash
npm install
npm run dev
```

**验收标准**

- 终端输出本地访问地址（Vite 默认 `http://localhost:5173/`），浏览器能打开页面。
- 页面显示“前端工程化第一天”“作者：我自己”和 `HelloWorld` 组件。
- 修改 `src/App.vue` 中 `title` 的值，保存后页面自动热更新，无需手动刷新。

### 练习 2：对比普通变量与 ref 的响应式

打开 `src/App.vue`，依次点击页面上的两个按钮。

**验收标准**

- 点击“点我改普通变量”，浏览器控制台里 `normalCount` 在增加，但页面上的“普通变量”数字不变。
- 点击“点我改 ref 变量”，页面上的数字立即增加。
- 能解释 `ref` 需要通过 `.value` 读写，模板中会自动解包。

### 练习 3：改造子组件

打开 `src/components/HelloWorld.vue`，完成两处修改：

1. 把按钮文案 `count is {{ count }}` 改成“当前计数：{{ count }}”；
2. 把 `defineProps` 中的 `msg` 类型保持为 `String`，并在 `App.vue` 里把传入值改成“Vue 综合实战”。

**验收标准**

- 页面上的组件标题变为“Vue 综合实战”。
- 按钮文案变为“当前计数：0”，点击后数字递增。
- `npm run build` 能成功产出 `dist/`，无编译报错。

### 待补：FastAPI 小型项目

本机 `FastAPI_SQLAlchemy课件\day19` 只有 17 个视频和 `FastAPI_SQLAlchemy学习笔记.md`，没有完整项目代码；唯一相关视频是 `day19-17-前后端结合.mp4`。因此“FastAPI 小型项目”暂标为 **待补：本机无完整项目代码**，可先完成 `lessons/fastapi/fastapi.md` 末尾的分模块练习。
