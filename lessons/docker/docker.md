## 尚硅谷大模型技术之Docker

（作者：尚硅谷研究院）

版本：V1.0

---

## 第 1 章 Docker初体验

### 1.1 为什么会出现Docker

在没有Docker之前，软件开发和上线会遇到一个经典难题：环境不一致。

- 开发在自己电脑上跑得好好的，一放到测试 / 生产环境就报错。
- 换一台服务器，就要重新装系统、装依赖、配配置，步骤繁琐又容易出错。
- 项目版本一多，环境差异、依赖冲突、兼容性问题，会让开发和运维非常痛苦

很多人想到，能不能从根本上解决问题，软件可以带环境安装？也就是说，安装的时候，把原始环境一模一样地复制过来。

Docker 正是为了解决这个痛点诞生的。

它提供了一套标准化的环境打包与运行方案：

把代码、依赖、配置、系统环境全部打包在一起，形成一个可移植的容器。

这样一来：

- 开发只管写代码，容器里是什么环境，上线就是什么环境。
- 运维不用再反复配置机器，直接运行容器即可。
- 彻底解决了 "在我电脑上能跑，上线就不行" 的协作痛点。

### 1.2 Docker简介

![docker logo](assets/lessons-docker/01-docker-logo.webp)

官网地址：https://www.docker.com/

- docker 是一个开源的应用容器引擎，基于Go语言开发。Docker 可以让开发者打包他们的应用以及依赖包到一个轻量级、可移植的容器中，然后发布到任何流行的 Linux 机器上，也可以实现虚拟化。容器是完全使用沙箱机制，相互之间不会有任何接口（类似 iPhone 的 app）,更重要的是容器性能开销极低。
- Docker的主要目标是"Build，Ship and Run Any App,Anywhere"，也就是通过对应用组件的封装、分发、部署、运行等生命周期的管理，使用户的APP（可以是一个WEB应用或数据库应用等等）及其运行环境能够做到"一次封装，到处运行"。
- 总之一句话：只需要一次配置好环境，换到别的机子上就可以一键部署好，大大简化了操作 。

### 1.3 Docker的优势

**可移植性**

Docker容器可以在任何支持Docker的环境中运行，包括本地开发环境、测试环境和生产环境，从而提高了应用程序的可移植性。

**可伸缩性**

Docker容器可以根据负载的变化进行快速扩展和收缩，从而更好地满足应用程序的需求。

**隔离性**

Docker容器提供了隔离的运行环境，从而使得不同容器中运行的应用程序互相隔离，避免了应用程序之间的干扰。

### 1.4 Docker和虚拟机的区别

![Docker和虚拟机对比](assets/lessons-docker/02-docker-vs-vm.webp)

**隔离性**：在于隔离性上面，由于vm对操作系统也进行了虚拟化，隔离的更加彻底。而Docker共享宿主机的操作系统，隔离性较差。

**运行效率**：由于vm的隔离操作，导致生成虚拟机的速率大大低于容器Docker生成的速度，因为Docker直接利用宿主机的系统内核。它们的启动速度是在数量级上的差距。

**资源利用率**：在资源利用率上虚拟机由于隔离更彻底，因此利用率也会相对较低。

经典名句：虚拟机已死，容器才是未来

### 1.5 Docker架构

Docker是一个客户端-服务器（C/S）架构程序。Docker客户端只需要向Docker服务器或者守护进程发出请求，服务器或者守护进程将完成所有工作并返回结果。Docker提供了一个命令行工具Docker以及一整套RESTful API。你可以在同一台宿主机上运行Docker守护进程和客户端，也可以从本地的Docker客户端连接到运行在另一台宿主机上的远程Docker守护进程。

![Docker架构图](assets/lessons-docker/03-docker-architecture.webp)

| 名称 | 说明 |
|------|------|
| Docker 镜像 (Images) | Docker 镜像是用于创建 Docker 容器的模板。镜像是基于联合文件系统的一种层式结构，由一系列指令一步一步构建出来。 |
| Docker 容器 (Container) | 容器是独立运行的一个或一组应用。镜像相当于类，容器相当于类的实例 |
| Docker 客户端 (Client) | Docker 客户端通过命令行或者其他工具使用 Docker API 与 Docker 的守护进程通信。 |
| Docker 主机 (Host) | 一个物理或者虚拟的机器用于执行 Docker 守护进程和容器。 |
| Docker守护进程 | 是Docker服务器端进程，负责支撑Docker 容器的运行以及镜像的管理。 |
| Docker 仓库 (Registry) | Docker 仓库用来保存镜像，可以理解为代码控制中的代码仓库。 Docker Hub提供了庞大的镜像集合供使用。用户也可以将自己本地的镜像推送到Docker仓库供其他人下载。 |

### 1.6 Docker核心概念

#### 1.6.1 镜像（Image）—类比「软件安装包」

**定义**：镜像就是一个只读的模板，包含了运行某个应用程序所需的全部环境（比如操作系统、软件依赖、配置文件等）。

**实操关联**：我们后续会下载「mysql:8.0.45」镜像（MySQL 8.0.45的"安装包"）、「python:3.9-slim」镜像（Python 3.12的"安装包"），这些镜像都是从官方仓库（Docker Hub）下载的，无需手动配置环境。

**关键特点**：只读（不能直接修改），可作为模板，创建多个容器。

#### 1.6.2 容器（Container）—类比「已安装好的软件」

**定义**：容器是镜像的运行实例，是一个可读写的独立环境，相当于"把安装包安装好后，能直接使用的软件"。

**实操关联**：我们执行「docker run」命令，就是基于「mysql:8.0.45」镜像，创建并启动一个MySQL容器（相当于"安装并启动MySQL服务"）；启动后，容器内的MySQL就能正常使用，且和本地其他环境互不干扰。

**关键特点**：可启动、停止、删除，多个容器相互独立；容器删除后，里面的数据默认会丢失（可通过"数据卷"保留，后续会讲）。

#### 1.6.3 仓库（Repository）—类比「手机应用商店」

**定义**：仓库是用于存放和下载镜像的平台，相当于"镜像的聚集地"，最常用的是官方仓库Docker Hub。

**实操关联**：我们执行「docker pull 镜像名」命令，就是从Docker Hub下载对应的镜像（比如「docker pull mysql:8.0.45」，就是下载MySQL 8.0.45的镜像）。

官方仓库地址：https://hub.docker.com/ （无需注册也能下载公开镜像，注册后可保存自定义镜像）。

#### 1.6.4 数据卷（Volume）—— 类比「电脑的D盘（专门存数据）」

**定义**：数据卷是Docker中用于持久化数据的工具，相当于"给容器挂一个独立的存储盘"，容器删除后，数据卷中的数据不会丢失。

**实操关联**：我们在Docker Compose配置中，会用「volumes: mysql-data:/var/lib/mysql」配置数据卷，用于保存MySQL的数据，这样即使删除MySQL容器，下次启动新容器，之前的数据库、表、数据依然存在，移植时数据也能保留。

### 1.7 核心工具

#### 1.7.1 Dockerfile —自定义镜像的"构建脚本"

**定义**：Dockerfile是一个纯文本文件（无后缀名），包含一系列简单的指令，用于告诉Docker"如何构建自定义镜像"。

**核心作用**：解决"环境配置繁琐、版本不一致"的问题。比如我们需要一个"包含Python 3.12+pymysql依赖+自定义脚本"的镜像，无需手动安装Python和依赖，只要编写Dockerfile，执行一条命令，Docker就会自动构建出符合需求的镜像。

**实操关联**：后续我们会编写Dockerfile，构建一个包含Python环境和连接脚本的镜像，用于和MySQL容器联动。

#### 1.7.2 Docker Compose —多容器的"一键管理工具"

**定义**：Docker Compose是一个用于管理多容器的工具，通过一个yaml格式的配置文件（固定命名为docker-compose.yml），定义多个关联容器的配置（比如镜像、端口、依赖关系），执行一条命令就能一键启动、停止所有容器。

**核心作用**：简化多容器部署。比如我们需要同时启动MySQL容器和Python容器，且Python容器要依赖MySQL容器（先启动MySQL，再启动Python），无需手动逐个启动，用Docker Compose一键搞定。

**实操关联**：后续我们会编写docker-compose.yml，配置MySQL（8.0.45）和Python两个容器，实现一键启动和联动。

---

## 第 2 章 Win11下Docker安装与卸载

Docker在Win11上运行需依赖WSL2（Windows子系统），必须先完成准备工作，否则Docker无法启动。

### 2.1 安装前准备

#### 2.1.1 开启虚拟化

可以通过任务管理器-性能，查看虚拟化是否开启

![虚拟化已启用](assets/lessons-docker/04-virtualization-enabled.webp)

一般电脑都已经开启，如果没有开启，重启电脑，开机时按主板快捷键（联想F2、戴尔F12、华硕F8）进入BIOS，找到"Virtualization Technology"（虚拟化技术），设置为"Enabled"（启用），保存并重启电脑。

#### 2.1.2 启用WSL和虚拟机平台功能

必须运行Windows10的 2004及更高版本（内部版本19041及以上）或Windows11

Win+R 输入winver，直接查看

**可视化方式**

在控制面板-程序-启用或关闭Windows功能中勾选适用于Linux的Windows子系统以及虚拟机平台(wsl2需要)

![Windows功能](assets/lessons-docker/05-windows-features.webp)

**命令方式**

![PowerShell管理员运行](assets/lessons-docker/06-powershell-admin.webp)

```powershell
# 适用于Linux的Windows子系统
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# 虚拟机平台
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

完成后需要重启电脑

#### 2.1.3 更新WSL内核

如果通过命令更新会非常慢。为了加快速度，直接从github里面下载最新版本。

https://github.com/microsoft/WSL/releases

![WSL下载](assets/lessons-docker/07-wsl-download.webp)

下载完成后，双击安装。

注意：如果是arm架构请选择对应的文件。

![WSL版本验证](assets/lessons-docker/08-wsl-version.webp)

### 2.2 Docker安装与验证

#### 2.2.1 下载Docker安装包

访问Docker官方下载页，下载"Docker Desktop for Windows"安装包。

官方下载地址：https://www.docker.com/products/docker-desktop/

#### 2.2.2 安装Docker

双击下载的安装包，点击"下一步"，默认安装即可，安装完成后Docker会自动启动，如果安装的过程中有阻止对host的修改，点击允许。

#### 2.2.3 验证安装

打开Win11终端（CMD或PowerShell），执行以下两条命令，若均能显示版本号，说明安装成功：

```bash
docker --version
docker compose version
```

![Docker版本验证](assets/lessons-docker/09-docker-version.webp)

### 2.3 Docker镜像源配置

默认Docker镜像源为国外官方仓库（Docker Hub），国内下载镜像（如mysql:8.0.45、python:3.12-slim）速度较慢，甚至超时失败，配置国内镜像源（阿里云）可大幅提升下载速度。

#### 2.3.1 打开Docker Desktop

确保Docker已启动，点击右上角"设置"（齿轮图标）。

![Docker设置](assets/lessons-docker/10-docker-settings.webp)

#### 2.3.2 找到镜像源配置项

在左侧菜单找到"Docker Engine"（Docker引擎），点击进入配置页面。

#### 2.3.3 添加国内镜像源

在配置文件中，找到"registry-mirrors"字段，添加阿里云镜像源（若没有该字段，手动新增），完整配置如下：

```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "features": {
    "buildkit": true
  },
  "registry-mirrors": [
    "https://docker.xuanyuan.me",
    "https://docker.1ms.run",
    "https://docker.m.daocloud.io"
  ]
}
```

![Docker Engine配置](assets/lessons-docker/11-docker-engine-config.webp)

#### 2.3.4 应用配置并重启

点击页面右下角"Apply & Restart"（应用并重启），等待Docker重启完成，镜像源配置生效。

### 2.4 Docker卸载

若Docker安装失败、版本不兼容，或无需使用Docker，可按以下步骤彻底卸载，避免残留文件影响后续操作：

#### 2.4.1 停止Docker服务

找到任务栏右下角的 Docker 鲸鱼图标（可能在隐藏图标里，点 ^ 展开） ，右键点击 → 选择 Quit Docker Desktop / 退出 Docker Desktop ，等待几秒，Docker 就完全停止了

![退出Docker](assets/lessons-docker/12-quit-docker.webp)

#### 2.4.2 卸载Docker应用

打开 "控制面板" → "程序应" → "卸载"，在搜索框输入"Docker Desktop"，点击右侧"三个点" → "卸载"，按提示完成卸载（过程约1-2分钟）。

#### 2.4.3 删除 WSL 2 相关的 Docker 发行版（关键）

以管理员身份打开 PowerShell，执行

```powershell
# 停止所有 WSL 实例
wsl --shutdown

# 查看已安装的 WSL 发行版（会看到 docker-desktop、docker-desktop-data）
wsl --list --verbose

# 删除 Docker 相关的 WSL 发行版（彻底清理镜像/容器数据）
wsl --unregister docker-desktop
wsl --unregister docker-desktop-data
```

#### 2.4.4 删除残留文件（可选，彻底清理）

- 删除用户目录下的Docker残留：打开文件资源管理器，进入 `C:\Users\你的用户名\.docker`，删除整个.docker文件夹；
- 删除`C:\Users\你的用户名\AppData\Local\Docker`，docker-secrets-engine（WSL 虚拟磁盘、日志）
- 删除`C:\Program Files\Docker`（安装目录残留）

#### 2.4.5 验证卸载

终端执行 `docker --version`，若提示"不是内部或外部命令"，说明卸载成功。

#### 2.4.6 卸载wsl

- 右键wsl.2.6.3.0.x64.msi卸载wsl
- 取消勾选 虚拟机平台
- 取消勾选 适用于Linux的Windows子系统

---

## 第 3 章 基础案例：Win11下Python连接MySQL

原来我们自己在windows上安装的MySQL，现在MySQL从Docker镜像下载。

基础案例适合初学者理解"镜像→容器→连接"的核心流程，手动操作、步骤简单，无需复杂工具，重点掌握"下载镜像→启动容器→本地连接"的逻辑。

### 3.1 下载并启动MySQL 8.0.45容器（Win11终端执行）

#### 3.1.1 从Docker Hub下载MySQL 8.0.45镜像（已配置国内镜像源，速度更快）

```bash
docker pull mysql:8.0.45
```

查看镜像

```bash
docker images
```

![MySQL镜像](assets/lessons-docker/13-mysql-image.webp)

#### 3.1.2 启动MySQL容器（密码123456，可自定义）

```bash
docker run -d --name mysql-db -p 9999:3306 -e MYSQL_ROOT_PASSWORD=123456 mysql:8.0.45
```

**命令说明**

| 参数 | 说明 |
|------|------|
| `docker run` | 创建并启动一个Docker |
| `-d` | 后台运行（detach），不占用当前终端 |
| `--name mysql-db` | 给容器命名为mysql-db，自定义名称，方便后续docker stop mysql-db等命令操作，不加会生成随机名 |
| `-p 9999:3306` | 端口映射：主机9999端口→容器内3306端口，左边是电脑本机端口，右边是容器内端口；本机端口可改（如-p9999:3306） |
| `-e MYSQL_ROOT_PASSWORD=123456` | 设置 MySQLroot用户的密码为123456MySQL镜像必须设置这个变量，否则容器启动失败；密码可自定义 |
| `mysql:8.0.45` | 要运行的镜像名：MySQL官方镜像，版本8.0.45 |

查看容器

```bash
docker ps
```

![MySQL容器运行](assets/lessons-docker/14-mysql-container.webp)

### 3.2 本地安装Python及依赖

#### 3.2.1 确保本地已经有python环境以及安装了pymysql依赖

#### 3.2.2 编写Python连接脚本

新建test_mysql.py文件，复制以下代码（将host改为localhost，密码与启动容器时一致）

```python
import pymysql

# 连接MySQL（参数与启动容器时一致）
conn = pymysql.connect(
    host='localhost',  # 本地地址，端口已映射
    port=9999,         # 映射后的端口
    user='root',       # MySQL默认用户名
    password='123456', # 启动容器时设置的密码
    database='mysql',  # MySQL默认数据库
    charset='utf8mb4', # 避免中文乱码
    cursorclass=pymysql.cursors.DictCursor  # 可选，让查询结果更易读
)

cursor = conn.cursor()
# 测试连接：查询MySQL版本
cursor.execute("SELECT VERSION()")
print(f"MySQL版本：{cursor.fetchone()['VERSION()']}")

# 关闭连接
cursor.close()
conn.close()
print("基础版：Python连接MySQL（8.0.45）成功！")
```

#### 3.2.3 运行脚本

执行`python test_mysql.py`，能看到MySQL版本和"连接成功"提示，即完成基础版连接。

![Python连接成功](assets/lessons-docker/15-python-connect.webp)

---

## 第 4 章 进阶案例：Win11下Python连接MySQL

进阶版是实际开发中最常用的方式，核心用到「Dockerfile」和「Docker Compose」两个工具，实现"一键启动多容器、环境可复用"，本节将两个工具融入实操，边用边理解。

### 4.1 核心工具说明

- **Dockerfile**：纯文本构建脚本，用于构建自定义镜像（比如包含Python环境+依赖+脚本的镜像），避免手动配置环境；
- **Docker Compose**：多容器管理工具，通过yaml配置文件，一键启动、停止多个关联容器（比如MySQL和Python容器），简化部署。

### 4.2 实操步骤

#### 4.2.1 新建项目目录

在Win11桌面新建一个文件夹，命名为docker-python-mysql（名称可自定义，后续命令对应即可）。

#### 4.2.2 编写Dockerfile（构建Python自定义镜像）

进入docker-python-mysql目录，新建一个文本文件，删除后缀名（确保文件名为"Dockerfile"，无.txt），复制以下代码

```dockerfile
# 1. 指定基础镜像：Python 3.12（稳定版，兼容性好）
FROM python:3.12

# 2. 设置容器内的工作目录，用于存放脚本和依赖
WORKDIR /app

# 3. 复制本地项目目录下的所有文件（test_mysql.py、Dockerfile等），到容器的/app目录
COPY . /app

# 4. 安装Python依赖（pymysql），使用清华源加速下载，避免超时（初学者无需修改）
RUN pip install pymysql cryptography

# 5. 容器启动时，自动执行的命令：运行Python连接脚本
CMD ["python", "test_mysql1.py"]
```

> 💡 关键理解：通过以上指令，Docker会自动构建一个包含Python 3.12、pymysql依赖的镜像，无需我们手动安装Python环境。

#### 4.2.3 编写docker-compose.yml（配置多容器）

在docker-python-mysql目录下，新建一个文本文件，命名为docker-compose.yml（后缀为yml，不能错），复制以下代码

```yaml
# 核心功能：一键启动MySQL容器+Python应用容器，实现容器间通信、数据持久化

services:
  # 容器1：MySQL服务容器（命名为mysql-db，容器间可通过该名称访问）
  mysql-db:
    # 基础镜像：指定MySQL 8.0.45版本（稳定性高，适配Python连接）
    image: mysql:8.0.45
    # 重启策略：容器意外关闭/服务器重启时，自动重启（保证服务可用性）
    restart: always
    # 环境变量：配置MySQL核心参数（无需手动进入容器修改）
    environment:
      MYSQL_ROOT_PASSWORD: "123456"  # root用户密码（自定义，Python连接需一致）
      MYSQL_DATABASE: "test_db"      # 自动创建初始数据库（无需手动建库）
      # 字符编码配置：适配MySQL 8.0+，避免中文乱码/连接报错
      MYSQL_INITDB_ARGS: "--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci"
    # 端口映射：本地9999端口 → 容器内3306端口（避免与本地MySQL端口冲突）
    ports:
      - "9999:3306"
    # 数据卷挂载：Windows本地D盘mysql-data目录 → 容器内MySQL数据目录（持久化数据）
    volumes:
      - D:/mysql-data:/var/lib/mysql
    # 加入自定义网络：与Python容器互通（容器间通信的基础）
    networks:
      - app-network
    # 健康检查：判断MySQL服务是否真正就绪（而非仅容器启动），解决连接拒绝问题
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-p123456"]  # 检测MySQL是否可ping通
      interval: 3s          # 每3秒检查一次
      timeout: 3s           # 单次检查超时时间3秒
      retries: 10           # 最多重试10次（覆盖MySQL启动初始化时间）
      start_period: 5s      # 容器启动后，延迟5秒再开始检查（避免过早检测）

  # 容器2：Python应用容器（命名为python-app，业务代码运行载体）
  python-app:
    # 构建规则：基于当前目录下的Dockerfile，构建自定义Python镜像
    build: .
    # 依赖条件：等待mysql-db容器的健康检查通过后，再启动本容器（核心修复：解决MySQL未就绪问题）
    depends_on:
      mysql-db:
        condition: service_healthy  # 仅当MySQL服务就绪时，才启动Python容器
    # 环境变量：传递MySQL连接信息（Python代码可通过os.getenv获取，无需硬编码）
    environment:
      MYSQL_HOST: "mysql-db"    # 容器间通信地址：直接填MySQL容器名（无需IP）
      MYSQL_PORT: "3306"        # MySQL容器内端口（非本地9999）
      MYSQL_USER: "root"        # 与MySQL容器的用户名一致
      MYSQL_PASSWORD: "123456"  # 与MySQL容器的密码一致（修改需同步）
      MYSQL_DB: "test_db"       # 与MySQL容器自动创建的数据库名一致
    # 加入自定义网络：与MySQL容器在同一网络，才能通信
    networks:
      - app-network

# 自定义网络：桥接模式（Docker默认），保证两个容器相互可见、可访问
networks:
  app-network:
    driver: bridge
```

> 💡 关键提醒：MySQL密码为123456，可自定义修改，但需同步修改Python容器的MYSQL_PASSWORD，否则连接失败。

![数据卷路径说明](assets/lessons-docker/16-volume-path.webp)

#### 4.2.4 编写Python连接脚本（test_mysql1.py）

在docker-python-mysql目录下，新建一个Python文件，命名为test_mysql1.py，复制以下代码（脚本会从环境变量获取MySQL连接信息，无需硬编码）

```python
import pymysql
import os
import sys
import time

# 新增：MySQL连接重试函数，解决服务未就绪问题
def get_mysql_conn():
    max_retries = 10  # 最多重试10次
    retry_delay = 2   # 每次重试间隔2秒
    for i in range(max_retries):
        try:
            conn = pymysql.connect(
                host=os.getenv('MYSQL_HOST', 'localhost'),
                port=int(os.getenv('MYSQL_PORT', 3306)),
                user=os.getenv('MYSQL_USER', 'root'),
                password=os.getenv('MYSQL_PASSWORD', '123456'),
                database=os.getenv('MYSQL_DB', 'test_db'),
                charset='utf8mb4',
                connect_timeout=3
            )
            print(f"✅ 第{i+1}次尝试：MySQL连接成功！")
            return conn
        except pymysql.err.OperationalError as e:
            print(f"❌ 第{i+1}次尝试：MySQL连接失败 - {e}")
            if i < max_retries - 1:
                print(f"⏳ 等待{retry_delay}秒后重试...")
                time.sleep(retry_delay)
            else:
                raise Exception("❌ 重试10次后仍无法连接MySQL，请检查容器配置！") from e

# 主逻辑
if __name__ == "__main__":
    conn = None
    cursor = None
    try:
        # 获取带重试的数据库连接
        conn = get_mysql_conn()
        cursor = conn.cursor()

        # 原测试逻辑不变
        cursor.execute("SELECT DATABASE()")
        db_name = cursor.fetchone()[0]
        print(f"当前连接的数据库：{db_name}")

        cursor.execute("CREATE TABLE IF NOT EXISTS test_table (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50))")
        cursor.execute("INSERT INTO test_table (name) VALUES ('Docker Compose测试')")
        conn.commit()

        cursor.execute("SELECT * FROM test_table")
        data = cursor.fetchall()
        print("test_table中的测试数据：", data)

        # 输出Python版本
        python_version = sys.version
        print(f"\n当前运行的Python版本：{python_version}")
        print("🎉 Docker Compose环境下，Python连接MySQL（8.0.45）成功！")

    except Exception as e:
        print(f"\n❌ 程序执行失败：{e}")
        if conn:
            conn.rollback()  # 出错回滚事务
    finally:
        # 确保资源关闭
        if cursor:
            cursor.close()
        if conn:
            conn.close()
```

#### 4.2.5 实例验证

打开Win11终端，进入docker-python-mysql目录，执行以下命令（可直接复制，按需求选择）

```bash
# 1. 停止基础案例中启动的mysql-db容器，否则端口冲突
docker ps          # 查看正在运行的容器
docker stop mysql-db     # 停止运行中的容器
docker ps -a       # 查看正在运行的容器  包括已经停止的
docker rm mysql-db       # 删除已停止的容器

# 2. 一键启动所有容器（后台运行，首次执行会自动构建Python镜像、下载MySQL镜像）
docker compose up -d

# 2. 查看所有容器的运行状态
docker compose ps

# 3. 查看Python容器的运行日志（验证Python是否成功连接MySQL）
docker compose logs python-app
```

如果启动失败，可以尝试其他命令。

```bash
# 1. 停止并删除所有容器（数据保留，下次启动可恢复）
docker compose down

# 2. 停止并删除所有容器+数据卷（数据清空，慎用）
docker compose down -v

# 3. 重新构建Python镜像，并启动所有容器（修改Dockerfile后需执行）
docker compose up -d --build

# 4. 彻底清理旧资源（关键：避免缓存干扰） 删除所有镜像
docker-compose down --rmi all && docker system prune -af
```

---

## 第 5 章 Ubuntu下Docker的安装与卸载

### 5.1 Docker安装

为避免Ubuntu安装Docker时，依赖包下载缓慢，先替换Docker软件源为国内阿里云源，再执行安装步骤，终端逐行执行以下命令：

```bash
# 1. 卸载可能存在的旧版本Docker（若有）
sudo apt remove -y docker docker-engine docker.io containerd runc
```

2. 后续参考docker官网

https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository

```bash
# 3. 验证安装（查看版本，无报错即成功）
docker --version
docker compose version

# 4. 免sudo运行
sudo usermod -aG docker $USER
```

注意：执行完此步后，请关闭当前终端并重新连接，配置才会生效

### 5.2 Docker镜像源配置

安装完成后，配置国内镜像源，提升Ubuntu下Docker镜像下载速度，终端逐行执行以下命令：

#### 5.2.1 创建/修改镜像源配置文件

```bash
sudo vim /etc/docker/daemon.json
```

#### 5.2.2 添加镜像源配置：在打开的文件中，粘贴以下内容

```json
{
"registry-mirrors": [
    "https://docker.xuanyuan.me",
    "https://docker.1ms.run",
    "https://docker.m.daocloud.io"
  ]
}
```

#### 5.2.3 保存并退出

#### 5.2.4 重启Docker服务，使配置生效

```bash
sudo systemctl daemon-reload  # 重新加载配置
sudo systemctl restart docker  # 重启Docker服务
```

#### 5.2.5 验证配置

执行以下命令，若能看到配置的镜像源地址，说明配置成功：

```bash
docker info
```

查看输出结果中"Registry Mirrors"字段，显示配置的国内镜像源即可。

### 5.3 Docker卸载

若Ubuntu下Docker安装失败、版本不兼容，或无需使用，按以下步骤彻底卸载

```bash
# 1. 停止Docker服务
sudo systemctl stop docker

# 2. 卸载Docker相关软件包
sudo apt remove -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 3. 删除Docker数据和配置文件（彻底清理，可选）
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd

# 4. 验证卸载：执行以下命令，无版本输出即成功
docker --version
```

---

## 第 6 章 环境移植到Ubuntu

移植核心目标：将Win11下的"MySQL（8.0.45）+ Python"完整环境，移植到Ubuntu系统，无需重新配置，数据保留，两种移植方式

- 在线下载式（简单，适合网络良好场景）
- 离线同步式（无网络也能用，环境 100% 一致）

### 6.1 前置准备（两种方式都需执行）

#### 6.1.1 在 Win11 终端进入docker-python-mysql目录，执行

```bash
# 停止并删除容器（数据卷保留，仅停止服务）
docker compose down
```

#### 6.1.2 确认 Win11 的核心文件 / 目录

确保 Win11 的docker-python-mysql目录包含以下文件（后续需上传到 Ubuntu）：

- docker-compose.yml（容器配置文件）
- test_mysql1.py（Python 连接脚本，可选，镜像已包含）
- Dockerfile（可选，离线同步式无需）

### 6.2 方式1：在线下载式（简单，推荐网络良好场景）

#### 6.2.1 上传文件

将 Win11 下的docker-python-mysql目录（包含docker-compose.yml等核心文件）上传到Ubuntu 的/home/你的用户名/docker-python-mysql目录下。

#### 6.2.2 Ubuntu 终端操作（一键启动）

```bash
# 1. 进入项目目录
cd /home/你的用户名/docker-python-mysql

# 2. 修改docker-compose.yml的MySQL数据卷路径（适配Ubuntu）
# 编辑配置文件（新手推荐用nano，按Ctrl+O保存，Ctrl+X退出）
vim docker-compose.yml
# 找到mysql-db的volumes行，修改为：
# volumes:
#   - /home/你的用户名/mysql-data:/var/lib/mysql

# 3. 一键启动所有容器（自动下载MySQL镜像、构建Python镜像）
docker compose up -d

# 4. 验证移植成功
docker compose logs python-app
# 看到"连接成功"和测试数据，说明移植完成
```

### 6.3 方式2：离线同步式（无网络可用，环境 100% 一致）

#### 6.3.1 查看 Win11 本地镜像（确认需要打包的镜像）

```bash
# 列出本地镜像，记录关键信息
docker images
```

输出示例（重点关注REPOSITORY和TAG列）：

```
REPOSITORY                          TAG          IMAGE ID
mysql                               8.0.45      xxxxxxxx  # MySQL官方镜像
docker-python-mysql-python-app      latest      yyyyyyyy  # 自定义Python镜像
```

#### 6.3.2 打包 MySQL 8.0.45 镜像（离线文件）

```powershell
# 进入Win11的项目目录
cd C:\Users\你的用户名\Desktop\docker-python-mysql

# 打包MySQL镜像为tar文件（存到项目目录下）
docker save mysql:8.0.45 -o ./mysql-8.0.45.tar
```

#### 6.3.3 打包自定义 Python 镜像（关键）

```powershell
# 替换【Python镜像名】为实际名称（如docker-python-mysql-python-app）
docker save 【Python镜像名】:latest -o ./python-app.tar
```

#### 6.3.4 准备同步文件清单（需上传到 Ubuntu）

- 镜像包：mysql-8.0.45.tar、python-app.tar
- 配置文件：docker-compose.yml

#### 6.3.5 上传所有文件到 Ubuntu

将Win11的docker-python-mysql目录（含镜像包 + 配置）上传到Ubuntu的/home/你的用户名/docker-python-mysql

#### 6.3.6 Ubuntu 离线导入镜像

```bash
# 1. 进入项目目录
cd /home/你的用户名/docker-python-mysql

# 2. 导入MySQL镜像（离线，无需联网）
docker load -i ./mysql-8.0.45.tar

# 3. 导入Python自定义镜像（离线）
docker load -i ./python-app.tar

# 4. 验证镜像导入成功（能看到两个镜像）
docker images
```

![Ubuntu镜像列表](assets/lessons-docker/17-ubuntu-images.webp)

#### 6.3.7 修改 Ubuntu 的 docker-compose.yml

```yaml
services:
  mysql-db:
    image: mysql:8.0.45  # 保持Win11的版本
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: "123456"
      MYSQL_DATABASE: "test_db"
      MYSQL_INITDB_ARGS: "--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci"
    ports:
      - "9999:3306"
    volumes:
      - /home/你的用户名/mysql-data:/var/lib/mysql  # 改为Ubuntu的Data路径
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-p123456"]
      interval: 3s
      timeout: 3s
      retries: 10
      start_period: 5s

  python-app:
    # 关键修改：替换build: . 为导入的镜像名
    image: docker-python-mysql-python-app:latest
    depends_on:
      mysql-db:
        condition: service_healthy
    environment:
      MYSQL_HOST: "mysql-db"
      MYSQL_PORT: "3306"
      MYSQL_USER: "root"
      MYSQL_PASSWORD: "123456"
      MYSQL_DB: "test_db"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

#### 6.3.8 验证

```bash
# 启动所有容器（全程离线，无需下载/构建）
docker compose up -d

# 验证运行结果
docker compose ps  # 查看容器状态
docker compose logs python-app  # 查看Python连接日志
```

![Ubuntu移植验证](assets/lessons-docker/18-ubuntu-port-verify.webp)

---

## 第 7 章 常见问题排查

实操过程中，初学者容易遇到以下问题，对应解决方法直接复制执行即可，无需复杂操作。

### 7.1 Win11启动Docker失败，提示"WSL2未配置"？

**解决**：重新执行"Win11下Docker安装"的"安装前准备"步骤，确保虚拟化开启、WSL2功能和内核已安装，重启电脑后再启动Docker。

### 7.2 Python连接MySQL失败，提示"Connection refused"（连接被拒绝）？

**解决**：

- 检查MySQL容器是否启动，执行`docker compose ps` 或`docker ps`，确保容器状态为"Up"；

### 7.3 Docker Compose启动失败，提示"yaml格式错误"？

**解决**：检查docker-compose.yml的缩进（必须用空格，不能用Tab），确保冒号后加空格，所有引号都是英文引号，配置项对齐规范。

### 7.4 Ubuntu下执行docker命令，提示"权限不足"（Permission denied）？

**解决**：执行以下命令，给当前用户赋予Docker权限，注销Ubuntu后重新登录即可：

```bash
sudo usermod -aG docker $USER
```

---

## 第 8 章 附录：Docker常用命令

### 8.1 镜像管理（核心高频）

| 命令 | 作用 | 示例 |
|------|------|------|
| `docker pull <镜像名:版本>` | 拉取镜像（版本不写默认 latest） | `docker pull mysql:8.0.26` |
| `docker images` | 查看本地所有镜像 | `docker images`（精简）<br>`docker images -a`（含中间层） |
| `docker rmi <镜像ID/镜像名>` | 删除单个镜像 | `docker rmi mysql:8.0.26` |
| `docker rmi -f $(docker images -q)` | 强制删除所有本地镜像（慎用） | - |
| `docker search <关键词>` | 搜索 Docker Hub 镜像 | `docker search mysql` |
| `docker build -t <自定义镜像名:版本> .` | 基于 Dockerfile 构建镜像 | `docker build -t my-app:1.0 .` |
| `docker save -o <保存文件名.tar> <镜像名>` | 导出镜像为压缩包（离线传输） | `docker save -o mysql8.tar mysql:8.0.26` |
| `docker load -i <压缩包.tar>` | 导入本地镜像压缩包 | `docker load -i mysql8.tar` |

### 8.2 容器管理（核心高频）

| 命令 | 作用 | 示例 |
|------|------|------|
| `docker run [参数] <镜像名>` | 创建并启动容器（最核心） | `docker run -d --name mysql-db -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 mysql:8.0.26` |
| `docker ps` | 查看正在运行的容器 | `docker ps`（精简）<br>`docker ps -a`（含已停止的） |
| `docker start <容器名/容器ID>` | 启动已停止的容器 | `docker start mysql-db` |
| `docker stop <容器名/容器ID>` | 停止运行中的容器（优雅停止） | `docker stop mysql-db` |
| `docker restart <容器名/容器ID>` | 重启容器 | `docker restart mysql-db` |
| `docker rm <容器名/容器ID>` | 删除已停止的容器 | `docker rm mysql-db` |
| `docker rm -f <容器名/容器ID>` | 强制删除运行中的容器 | `docker rm -f mysql-db` |
| `docker rm -f $(docker ps -aq)` | 强制删除所有容器（慎用） | - |
| `docker exec -it <容器名> <命令>` | 进入容器交互终端（最常用） | `docker exec -it mysql-db bash`（进容器）<br>`docker exec -it mysql-db mysql -uroot -p`（直接进 MySQL） |
| `docker logs <容器名>` | 查看容器日志 | `docker logs mysql-db`（实时）<br>`docker logs -f mysql-db`（实时跟踪） |
| `docker inspect <容器名/镜像名>` | 查看容器 / 镜像详细信息（排障用） | `docker inspect mysql-db` |

### 8.3 docker compose常用命令

| 分类 | 命令 | 作用 | 教程适配示例 |
|------|------|------|--------------|
| 核心启动 | `docker compose up -d` | 后台启动项目：自动下载 / 构建镜像、创建容器、启动服务，处理依赖 | `docker compose up -d`（启动 MySQL+Python） |
| 核心启动 | `docker compose up -d mysql-db` | 后台仅启动指定服务（如 MySQL） | `docker compose up -d mysql-db`（仅启动 MySQL） |
| 核心启动 | `docker compose up python-app` | 前台启动指定服务（如 Python），实时输出日志 | `docker compose up python-app`（前台运行 Python 脚本） |
| 停止管理 | `docker compose stop` | 停止所有运行中的服务（保留容器） | `docker compose stop`（停止 MySQL+Python） |
| 停止管理 | `docker compose stop mysql-db` | 仅停止指定服务（如 MySQL） | `docker compose stop mysql-db`（仅停止 MySQL） |
| 停止管理 | `docker compose down` | 停止并删除容器 + 自定义网络，保留镜像和数据卷 | `docker compose down`（停止项目，保留数据） |
| 状态查看 | `docker compose ps` | 查看运行中的容器状态 | `docker compose ps`（检查 MySQL 是否运行） |
| 状态查看 | `docker compose ps -a` | 查看所有容器状态（含已退出的 Python 容器） | `docker compose ps -a`（查看 Python 容器状态） |
| 日志调试 | `docker compose logs python-app` | 查看 Python 服务的全部日志 | `docker compose logs python-app`（查看 Python 连接结果） |
| 日志调试 | `docker compose logs -f python-app` | 实时跟踪 Python 服务的日志 | `docker compose logs -f python-app`（实时看 Python 执行过程） |
| 镜像构建 | `docker compose build python-app` | 仅构建 Python 服务的镜像（不启动） | `docker compose build python-app`（构建 Python 镜像） |
| 镜像构建 | `docker compose up -d --build` | 强制重建所有镜像并启动项目 | `docker compose up -d --build`（重建所有镜像并启动） |
| 镜像构建 | `docker compose up -d --build python-app` | 仅重建 Python 镜像并启动 | `docker compose up -d --build python-app`（重建 Python 并启动） |
| 脚本执行 | `docker compose run --rm python-app` | 临时运行 Python 脚本，执行后自动删除容器 | `docker compose run --rm python-app`（重新执行 Python 脚本） |
| 容器调试 | `docker compose exec mysql-db mysql -uroot -p123456` | 进入 MySQL 容器，打开 MySQL 控制台 | `docker compose exec mysql-db mysql -uroot -p123456` |
| 清理重置 | `docker compose down -v` | 停止并删除容器 + 网络 + 数据卷（清空 MySQL 数据，慎用） | `docker compose down -v`（清空 MySQL 数据） |
| 清理重置 | `docker compose down --rmi all` | 停止并删除容器，删除项目关联的所有镜像 | `docker compose down --rmi all`（删除 MySQL+Python 镜像） |
| 清理重置 | `docker compose down --rmi all && docker system prune -af` | 彻底清理容器、镜像、全局未使用资源 | `docker compose down --rmi all && docker system prune -af`（完全重置） |

---

## 动手练习与验收标准

> 素材出处：`举个栗子/Docker教学/Docker课件/尚硅谷大模型技术之Docker1.0-本地图片版.md`（第 3、4 章）

### 练习 1：用 MySQL 镜像启动容器并验证端口映射

先确认镜像存在，再启动名为 `mysql-db` 的容器，主机端口用 `9999`。

```bash
docker images
docker run -d --name mysql-db -p 9999:3306 -e MYSQL_ROOT_PASSWORD=123456 mysql:8.0.45
docker ps
```

**验收标准**

- `docker images` 输出中存在 `mysql` 仓库、标签为 `8.0.45` 的镜像。
- `docker run` 命令退出码为 0，并输出一长串容器 ID。
- `docker ps` 中能看到 `mysql-db` 容器，状态为 `Up`，PORTS 列显示 `0.0.0.0:9999->3306/tcp`。
- 再执行一次同名 `docker run` 会失败并提示容器名已被占用，说明 `--name` 生效。

### 练习 2：本地 Python 通过映射端口连接容器内 MySQL

新建 `test_mysql.py`，代码取自课件第 3.2.2 节（端口必须是上一步映射的 `9999`）。

```python
import pymysql

# 连接MySQL（参数与启动容器时一致）
conn = pymysql.connect(
    host='localhost',  # 本地地址，端口已映射
    port=9999,         # 映射后的端口
    user='root',       # MySQL默认用户名
    password='123456', # 启动容器时设置的密码
    database='mysql',  # MySQL默认数据库
    charset='utf8mb4', # 避免中文乱码
    cursorclass=pymysql.cursors.DictCursor  # 可选，让查询结果更易读
)

cursor = conn.cursor()
# 测试连接：查询MySQL版本
cursor.execute("SELECT VERSION()")
print(f"MySQL版本：{cursor.fetchone()['VERSION()']}")

# 关闭连接
cursor.close()
conn.close()
print("基础版：Python连接MySQL（8.0.45）成功！")
```

运行：先 `pip install pymysql`，再执行 `python test_mysql.py`。

**验收标准**

- 终端打印 `MySQL版本：8.0.45`（以实际镜像小版本为准）。
- 终端最后一行打印 `基础版：Python连接MySQL（8.0.45）成功！`，进程退出码为 0。
- 把 `port` 改成未映射的 `3306` 后重跑，会抛出连接拒绝异常，可反证端口映射生效。

### 练习 3：Dockerfile + docker-compose 一键启动 MySQL 与 Python

在 `docker-python-mysql` 目录下新建无后缀的 `Dockerfile` 与 `docker-compose.yml`，内容取自课件 4.2.2、4.2.3 节；同目录还需按课件 4.2.4 节创建 `test_mysql1.py`（从环境变量读取连接信息）。

```dockerfile
# 1. 指定基础镜像：Python 3.12（稳定版，兼容性好）
FROM python:3.12

# 2. 设置容器内的工作目录，用于存放脚本和依赖
WORKDIR /app

# 3. 复制本地项目目录下的所有文件到容器的/app目录
COPY . /app

# 4. 安装Python依赖（pymysql），使用清华源加速下载，避免超时
RUN pip install pymysql cryptography

# 5. 容器启动时，自动执行的命令：运行Python连接脚本
CMD ["python", "test_mysql1.py"]
```

```yaml
services:
  mysql-db:
    image: mysql:8.0.45
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: "123456"
      MYSQL_DATABASE: "test_db"
      MYSQL_INITDB_ARGS: "--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci"
    ports:
      - "9999:3306"
    volumes:
      - D:/mysql-data:/var/lib/mysql
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-p123456"]
      interval: 3s
      timeout: 3s
      retries: 10
      start_period: 5s

  python-app:
    build: .
    depends_on:
      mysql-db:
        condition: service_healthy
    environment:
      MYSQL_HOST: "mysql-db"
      MYSQL_PORT: "3306"
      MYSQL_USER: "root"
      MYSQL_PASSWORD: "123456"
      MYSQL_DB: "test_db"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

启动与排查：

```bash
docker compose up -d
docker compose ps
docker compose logs python-app
```

**验收标准**

- `docker compose up -d` 退出码为 0，且 `docker compose ps` 中 `mysql-db` 状态为 `Up (healthy)`。
- `docker compose logs python-app` 能打印 MySQL 版本和连接成功提示，随后 Python 容器正常退出（退出码 0）。
- 本机 `D:/mysql-data` 目录被创建，说明数据卷挂载生效。
- 修改 `MYSQL_PASSWORD` 而不同步修改 `python-app` 的环境变量后重建，日志出现连接失败，可验证两个容器通过环境变量联动。
