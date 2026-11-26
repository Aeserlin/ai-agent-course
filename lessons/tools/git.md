# Git 版本控制

> 素材出处：`D:\pyhton\资料\Git.md`（1122 行，含大量截图；本篇命令与输出均逐字取自讲义“基本语法”和命令表）

## 1. 为什么需要版本控制

版本控制是对软件开发过程中各种文件变更进行管理、保存和追踪的技术。讲义对比了两类工具：

| 类型 | 代表 | 特点 |
|---|---|---|
| 集中式 | SVN | 版本库集中在一台服务器，离线能力弱，服务器故障影响大 |
| 分布式 | Git | 每个开发者本地都有完整版本库，可离线提交，服务器只作交换中心 |

Git 的三个代码托管中心：GitHub、Gitee（码云）、GitLab。

## 2. Git 工作机制

```
工作区 --add--> 暂存区 --commit--> 本地库 --push--> 远程库
   ↑                                  |
   └──────── checkout / reset ────────┘
```

讲义对三个区域的原文定义：

- `.git文件夹所在的目录，称为工作区，我们编写代码的目录`
- `.git文件夹下index文件，我们就称为暂存区(Stage)，用于临时保存修改文件`
- `.git文件夹，我们就称为本地版本库，简称本地库(Repository)`

三种状态：

- 红色：工作区新增/修改，尚未添加到暂存区；
- 绿色：已加入暂存区但未提交本地库；
- `nothing to commit, working tree clean`：全部已提交。

## 3. 安装与初始配置

安装完成后验证：

```bash
git --version
```

设置用户签名（必须，否则无法提交）：

```bash
git config --global user.name Layne
git config --global user.email 18431034318@163.com
git config --list          # 查看全局配置
cat ~/.gitconfig           # Linux 下查看配置文件
```

> 这里的邮箱只用于标识提交者，不要求与托管平台注册邮箱一致。

## 4. 本地库基本操作

```bash
git init                   # 初始化本地库，生成 .git 目录
git status                 # 查看本地库状态
git add 文件名              # 添加到暂存区
git commit -m "日志信息" 文件名   # 提交到本地库（首次提交建议不带文件名）
```

首次 `git init` 后 `git status` 会提示当前分支（如 `master`）与“无提交”。执行 `git add` 后文件变绿；`git commit` 后状态变为 clean。

修改文件后的标准循环：

```bash
git status                 # 看到 modified（红色）
git add 文件名              # 变绿
git commit -m "第二次提交" 文件名
```

## 5. 版本穿梭

```bash
git reflog                 # 查看版本信息（简），含被 reset 掉的提交
git reflog -n 数量
git log                    # 查看版本详细信息
git reset --hard 版本号     # 版本穿梭
```

讲义原文：`Git切换版本，底层其实是移动的HEAD指针。`

因此 `reset --hard` 会同时移动当前分支指针、HEAD、暂存区和工作区；被“丢掉”的提交仍可通过 `reflog` 找回。

## 6. 分支与合并

```bash
git branch -v              # 查看分支
git branch 分支名           # 创建分支
git checkout 分支名         # 切换分支
git merge 分支名            # 把指定分支合并到当前分支
```

讲义原文：`master、hot-fix其实都是指向具体版本记录的指针。当前所在的分支，其实是由HEAD决定的。` `切换分支的本质就是移动HEAD指针。`

### 冲突解决

冲突表现：合并后 `git status` 显示 `MERGING`。

原因（讲义原文）：`合并分支时，两个分支在同一个文件的同一个位置有两套完全不同的修改。Git无法替我们决定使用哪一个。必须人为决定新代码内容。`

解决步骤：

1. 打开冲突文件，删除特殊符号：

```
<<<<<<< HEAD
当前分支的代码
=======
合并过来的代码
>>>>>>> hot-fix
```

2. 保留正确内容，保存；
3. `git add 文件名` 重新加入暂存区；
4. `git commit -m "解决冲突"`，**此时不能带文件名**；
5. 状态中的 `MERGING` 消失即完成。

PyCharm 图形化等价操作：`Accept Yours` / `Accept Theirs` / `Merge`。

## 7. 远程仓库

以 Gitee 为例：

```bash
git remote -v                          # 查看远程地址别名
git remote add 别名 远程地址            # 起别名（业界惯用 origin）
git push 别名 分支                     # 推送本地分支到远程
git clone 远程地址                     # 克隆远程仓库到本地
git pull 远程库地址别名 远程分支名      # 拉取并合并到当前分支
```

SSH 免密：

```bash
ssh-keygen -t ed25519 -C "18431034318@163.com"
cat ~/.ssh/id_ed25519.pub              # 复制公钥到 Gitee/GitHub
ssh -T git@gitee.com                   # 验证
```

## 8. PyCharm 集成（讲义第 6、7 章）

- 定位 Git 程序：Settings → Version Control → Git，选择 `git.exe`；
- 初始化本地库：VCS → Enable Version Control Integration；
- `.gitignore`：忽略 `/.idea`、`/.env` 等不应入库的文件；
- 提交：右键 → Git → Add → Commit；
- 分支：右下角分支菜单创建/切换/合并；
- 冲突：图形化三栏合并；
- Gitee：安装 Gitee 插件，用 Token 或密码登录后可 push/pull/clone。

## 9. 讲义未覆盖的内容

以下内容讲义全篇 0 次出现，教材不臆造，需要时查阅官方文档：

- `rebase`（变基）与交互式 rebase；
- `tag`（标签）及推送标签；
- `git fetch` 与 `git pull` 的区别；
- `git stash`、`git cherry-pick`、`git switch/restore`；
- 远程分支跟踪（upstream）、`git push -u`；
- `git diff`、`git log` 的常用参数；
- 讲义用“别名”表述远程仓库名，未建立 `origin` 术语，可自行把别名取为 `origin`。

## 10. 练习与验收标准

### 练习 1：完成一次完整的本地版本穿梭

新建仓库，提交三次，然后用 `reset --hard` 回到第一次提交，再用 `reflog` 回到第三次。

**验收标准**

- `git log --oneline` 能看到三次提交；
- 回到第一次提交后，工作区文件内容确实是第一版；
- `git reflog` 能查到被“丢弃”的第二、三次提交哈希；
- 用 `reset --hard <哈希>` 能恢复到第三版，`git status` 为 clean。

### 练习 2：制造并解决一次分支冲突

在 `master` 与 `hot-fix` 分支修改同一文件的同一行，合并制造冲突并解决。

**验收标准**

- 合并后 `git status` 显示 `MERGING`，冲突文件含 `<<<<<<<` / `=======` / `>>>>>>>` 标记；
- 手动保留期望内容后 `git add`，`git commit` 不带文件名可成功提交；
- 提交后 `MERGING` 消失，`git log --graph --oneline` 能看到合并记录；
- 冲突标记在最终文件中不存在。

### 练习 3：推送到远程并验证 SSH

在 Gitee/GitHub 建一个空仓库，用 SSH 方式推送本地仓库，再在另一个目录 clone 验证。

**验收标准**

- `ssh -T git@gitee.com` 返回认证成功；
- `git remote -v` 显示别名与远程地址；
- `git push 别名 分支` 成功，网页端能看到提交；
- clone 到新目录后文件完整，`git log` 与源仓库一致。
