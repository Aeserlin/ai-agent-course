> 作者：尚硅谷研究院
> 版本：V0.9.0

## 1. Shell概述

> 定义：Linux/UNIX 的**命令解释器**，连接用户与系统内核。

![](assets/lessons-shell/2026-07-09_212935.webp)

### 1.1 Linux提供的Shell解析器有

```bash
cat /etc/shells
```

输出：
```
# /etc/shells: valid login shells
/bin/sh
/bin/bash
/usr/bin/bash
/bin/rbash
/usr/bin/rbash
/usr/bin/sh
/bin/dash
/usr/bin/dash
```

### 1.2 Ubuntu默认的解析器是bash

```bash
echo $SHELL
```

输出：
```
/bin/bash
```

---

## 2. Shell脚本入门

### 2.1 脚本格式

脚本以 `#!/bin/bash` 开头（指定解析器）。

### 2.2 第一个Shell脚本：helloworld.sh

#### 2.2.1 需求

创建一个Shell脚本，输出helloworld

#### 2.2.2 案例实操

```bash
vim helloworld.sh
```

在helloworld.sh中输入如下内容：
```bash
#!/bin/bash
echo "Hello shell!"
```

保存退出。

### 2.3 脚本的常用执行方式

#### 2.3.1 第一种：bash或sh + 脚本路径（不用赋予+x权限）

**sh + 脚本的相对路径：**
```bash
sh ./helloworld.sh
```
输出：`helloworld`

**sh + 脚本的绝对路径：**

```bash
sh /home/atguigu/helloworld.sh
```
输出：`helloworld`

**bash + 脚本的相对路径：**
```bash
bash ./helloworld.sh
```
输出：`helloworld`

**bash + 脚本的绝对路径：**
```bash
bash /home/atguigu/helloworld.sh
```
输出：`helloworld`

#### 2.3.2 第二种：直接执行脚本（必须具有可执行权限+x）

**第一步：赋予脚本+x权限**
```bash
chmod +x helloworld.sh
```

**第二步：执行脚本**

相对路径：
```bash
./helloworld.sh
```
输出：`helloworld`

绝对路径：
```bash
/home/atguigu/helloworld.sh
```
输出：`helloworld`

> **注意：** 第一种执行方法，本质是bash解析器帮你执行脚本，所以脚本本身不需要执行权限。第二种执行方法，本质是脚本需要自己执行，所以需要执行权限。

---

## 3. 变量

### 3.1 系统预定义变量

#### 3.1.1 常用系统变量

`PATH`、`HOME`、`PWD`、`SHELL`、`USER` 等

#### 3.1.2 获取变量的值

语法：`$变量名`

> $和变量名之间不能有空格。

#### 3.1.3 案例实操

**查看系统变量的值：**

```bash
echo $PATH
```
输出：
```
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
```

```bash
echo $HOME
```
输出：
```
/home/atguigu
```

**显示当前Shell中所有变量：set**

```bash
set
```
输出（部分）：
```
BASH=/bin/bash
BASHOPTS=checkwinsize:cmdhist:complete_fullquote:expand_aliases:extglob:extquote:force_fignore:globasciiranges:histappend:interactive_comments:login_shell:progcomp:promptvars:sourcepath
BASH_ALIASES=()
......
```

### 3.2 自定义变量

#### 3.2.1 基本语法

- 定义变量：`变量名=变量值`，注意，**=号前后不能有空格**
- 撤销变量：`unset 变量名`
- 声明静态变量：`readonly 变量`，注意：不能重新赋值，不能unset

#### 3.2.2 变量定义规则

1. 变量名称可以由字母、数字和下划线组成，但是不能以数字开头，环境变量名建议大写
2. 等号两侧不能有空格
3. 在bash中，变量默认类型都是字符串类型，无法直接进行数值运算
4. 变量的值如果有空格，需要使用双引号或单引号括起来
5. 最右侧分号可有可无，一般都不写

#### 3.2.3 案例实操

**定义变量A：**
```bash
A=5
echo $A
```
输出：`5`

**给变量A重新赋值：**
```bash
A=atguigu
echo $A
```
输出：`atguigu`

**撤销变量A：**
```bash
unset A
echo $A
```
输出：（空）

**声明静态（只读）的变量B=2，不能修改和unset：**
```bash
readonly B=2
echo $B
```
输出：`2`

```bash
B=9
```
输出：`bash: B: 只读变量`

```bash
unset B
```
输出：`bash: unset: B: 无法取消设定：只读variable`

**变量默认都是字符串类型，无法直接进行数值运算：**
```bash
C=1+2
echo $C
```
输出：`1+2`

**变量的值有空格，需要用双引号或单引号括起来：**
```bash
D=I love banzhang
```
报错：找不到命令 "love"...

```bash
D="I like banzhang"
echo $D
```
输出：`I like banzhang`

**把变量提升为全局环境变量，可供其他Shell程序使用：**

语法：`export 变量名`

```bash
vim helloworld.sh
```

在helloworld.sh文件中增加 `echo $B`：
```bash
#!/bin/bash
echo "helloworld"
echo $B
```

```bash
B=3
./helloworld.sh
```
输出：
```
helloworld
```
（发现并没有打印输出变量B的值）

```bash
export B
./helloworld.sh
```
输出：
```
helloworld
3
```

> **注意：必须在同一个窗口中运行测试（必须得是在同一个进程中）**

### 3.3 特殊变量

#### 3.3.1 $n

**基本语法：**

`$n`（n为数字，`$0`代表该脚本名称，`$1-$9`代表第一到第九个参数，十以上的参数需要用大括号包含，如`${10}`）

**案例实操：**

```bash
vim parameter.sh
```

写入以下内容：
```bash
#!/bin/bash
echo '==========$n=========='
echo $0
echo $1
echo $2
```

```bash
bash ./parameter.sh cls xz
```
输出：
```
==========$n==========
./parameter.sh
cls
xz
```

#### 3.3.2 $#

**基本语法：**

`$#`（获取所有输入参数个数，常用于循环，判断参数的个数是否正确以及加强脚本的健壮性）

**案例实操：**

```bash
vim parameter.sh
```

```bash
#!/bin/bash
echo '==========$n=========='
echo $0
echo $1
echo $2
echo '==========$#=========='
echo $#
```

```bash
./parameter.sh cls xz
```
输出：
```
==========$n==========
./parameter.sh
cls
xz
==========$#==========
2
```

#### 3.3.3 $*、$@

**基本语法：**

- `$*`：代表命令行中所有的参数，`$*`把所有的参数看成一个整体
- `$@`：也代表命令行中所有的参数，不过`$@`把每个参数区分对待

**案例实操：**

```bash
vim parameter.sh
```

```bash
#!/bin/bash
echo '==========$n=========='
echo $0
echo $1
echo $2
echo '==========$#=========='
echo $#
echo '==========$*=========='
echo $*
echo '==========$@=========='
echo $@
```

```bash
./parameter.sh a b c d e f g
```
输出：
```
==========$n==========
./parameter.sh
a
b
==========$#==========
7
==========$*==========
a b c d e f g
==========$@==========
a b c d e f g
```

> **说明：** `$*`和`$@`的区别需要结合循环说明，下文详述。

#### 3.3.4 $?

**基本语法：**

`$?`（最后一次执行的命令的返回状态。如果这个变量的**值为0**，证明上一个命令正确执行；如果这个变量的值为**非0**，则证明上一个命令执行不正确了）

**案例实操：**

判断helloworld.sh脚本是否正确执行：
```bash
./helloworld.sh
```
输出：`hello world`

```bash
echo $?
```
输出：`0`

```bash
xxx  # 错误命令
echo $?
```
输出：`127`

---

## 4. 算术运算符

### 4.1 基本语法

```
"$((运算式))" 或 "$[运算式]"
```

### 4.2 案例实操

#### 计算（2+3）* 4的值

**$[] 方式：**

```bash
S=$[(2+3)*4]
echo $S
```
输出：`20`

**$(()) 方式：**

```bash
S=$(((4+3)*4))
echo $S
```
输出：`28`

---

## 5. 条件判断

### 5.1 基本语法

- 写法1：`test condition`
- 写法2：`[ condition ]`（注意condition前后要有空格）

> 注意：条件成立（数据非空）即为0（真），否则为1（假）
> - `test atguigu` 返回0，`test ` 返回1
> - `[ atguigu ]` 返回0，`[ ]` 返回1，`[ "" ]` 返回1

### 5.2 常用判断条件

#### 5.2.1 两个整数之间比较

> `[ ]` 中不能直接使用=、>、<等，`(( ))` 主要用于执行算术运算与条件判断，其内部能运用常见的C语言风格算术和比较运算符。

| 运算符 | 含义 |
|--------|------|
| `-eq` | 等于（equal） |
| `-ne` | 不等于（not equal） |
| `-lt` | 小于（less than） |
| `-le` | 小于等于（less equal） |
| `-gt` | 大于（greater than） |
| `-ge` | 大于等于（greater equal） |

#### 5.2.2 按照文件权限进行判断

| 运算符 | 含义 |
|--------|------|
| `-r` | 有读的权限（read） |
| `-w` | 有写的权限（write） |
| `-x` | 有执行的权限（execute） |

#### 5.2.3 按照文件类型进行判断

| 运算符 | 含义 |
|--------|------|
| `-e` | 文件存在（existence） |
| `-f` | 文件存在并且是一个常规的文件（file） |
| `-d` | 文件存在并且是一个目录（directory） |

### 5.3 案例实操

#### 5.3.1 判断数据（文本或变量）是否为空文本

```bash
test
echo $?
```
输出：`1`

```bash
[ ]
echo $?
```
输出：`1`

```bash
test abc
echo $?
```
输出：`0`

```bash
[ abc ]
echo $?
```
输出：`0`

```bash
A=
B=abc
test $A
echo $?
```
输出：`1`

```bash
[ $A ]
echo $?
```
输出：`1`

```bash
test $B
echo $?
```
输出：`0`

```bash
[ $B ]
echo $?
```
输出：`0`

#### 5.3.2 23是否大于等于22

**test condition：**
```bash
test 23 -lt 22
echo $?
```
输出：`1`

**[ condition ]：**
```bash
[ 22 -lt 23 ]
echo $?
```
输出：`0`

#### 5.3.3 helloworld.sh是否具有写权限

**test condition：**
```bash
test -w helloworld.sh
echo $?
```
输出：`0`

```bash
chmod u-w helloworld.sh
echo $?
```
输出：`1`

**[ condition ]：**
```bash
[ -r helloworld.sh ]
echo $?
```
输出：`0`

#### 5.3.4 文件是否存在

**test condition：**
```bash
test -e helloworld.sh
echo $?
```
输出：`0`

**[ condition ]：**
```bash
[ -e helloworld2.sh ]
echo $?
```
输出：`1`

#### 5.3.5 多条件判断

`&&` 表示前一条命令执行成功时，才执行后一条命令；`||` 表示上一条命令执行失败后，才执行下一条命令。

**test condition：**

```bash
test atguigu && echo OK || echo notOK
```
输出：`OK`

```bash
test && echo OK || echo notOK
```
输出：`notOK`

**[ condition ]：**
```bash
[ atguigu ] && echo OK || echo notOK
```
输出：`OK`

```bash
[ ] && echo OK || echo notOK
```
输出：`notOK`

---

## 6. 流程控制

### 6.1 if判断

#### 6.1.1 基本语法

**单分支：**
```bash
if [ 条件判断式 ]; then
    程序
fi
```

或者：
```bash
if [ 条件判断式 ]
then
    程序
fi
```

**多分支：**

```bash
if [ 条件判断式 ]
then
    程序
elif [ 条件判断式 ]
then
    程序
else
    程序
fi
```

> 注意事项：
> ① `[ 条件判断式 ]` 中括号和条件判断式之间必须有空格
> ② if后要有空格

#### 6.1.2 案例实操

输入一个年龄数字，如果小于18，则输出"未成年"，如果小于60，则输出"成年人"，否则输出"老年人"，如果没有指定年龄，提示"请携带年龄"。

```bash
vim if.sh
```

写入以下内容：
```bash
#!/bin/bash
if [ $# -eq 0 ]
then
  echo '请携带年龄'
elif [ $1 -lt 18 ]
then
  echo '未成年人'
elif [ $1 -lt 60 ]
then
  echo '成年人'
else
  echo '老年人'
fi
```

```bash
chmod 777 if.sh
./if.sh 12
```
输出：`未成年人`

```bash
./if.sh 34
```
输出：`成年人`

```bash
./if.sh 66
```
输出：`老年人`

```bash
./if.sh
```
输出：`请携带年龄`

### 6.2 case语句

#### 6.2.1 基本语法

```bash
case $变量名 in
"值1")
    如果变量的值等于值1，则执行程序1
    ;;
值2)
    如果变量的值等于值2，则执行程序2
    ;;
...省略其他分支...
*)
    如果变量的值都不是以上的值，则执行此程序
    ;;
esac
```

> 注意事项：
> 1. case行尾必须为单词"in"，每一个模式匹配必须以右括号")"结束
> 2. 双分号";;"表示命令序列结束，相当于C中的break
> 3. 最后的"*)"表示默认模式，相当于C中的default 

#### 6.2.2 案例实操

输入一个数字，如果是1，则输出banzhang，如果是2，则输出cls，如果是其它，输出renyao。

```bash
vim case.sh
```

脚本中写入以下内容：
```bash
#!/bin/bash
case $1 in
"1")
    echo "banzhang"
;;
2)
    echo "cls"
;;
*)
    echo "renyao"
;;
esac
```

```bash
chmod 777 case.sh
./case.sh 1
```
输出：`banzhang`

```bash
./case.sh 2
```
输出：`cls`

```bash
./case.sh 3
```
输出：`renyao`

### 6.3 for循环

#### 6.3.1 基本语法1（C语言风格）

```bash
for ((初始值;循环控制条件;变量变化))
do
    程序
done
```

#### 6.3.2 案例实操：从1加到100

```bash
vim for1.sh
```

脚本中写入以下内容：
```bash
#!/bin/bash
sum=0
for((i=1;i<=100;i++))
do
        sum=$[$sum+$i]
done
echo $sum
```

```bash
chmod 777 for1.sh
./for1.sh
```
输出：`5050`

#### 6.3.3 基本语法2（in风格）

```bash
for 变量 in 值1 值2 值3...
do
    程序
done
```

#### 6.3.4 案例实操

```bash
vim for2.sh
```

写入以下内容：
```bash
#!/bin/bash
for i in cls mly wls
do
      echo "ban zhang love $i"
done
```

```bash
chmod 777 for2.sh
./for2.sh
```
输出：
```
ban zhang love cls
ban zhang love mly
ban zhang love wls
```

#### 6.3.5 比较$*和$@区别

`$*`和`$@`都表示传递给函数或脚本的所有参数，不被双引号包含时，都以`$1 $2 ...$n`的形式输出所有参数。

```bash
vim for3.sh
```

写入以下内容，打印出各个输入参数：
```bash
#!/bin/bash
echo '=============$*============='
for i in $*
do
       echo "ban zhang love $i"
done
echo '=============$@============='
for j in $@
do      
       echo "ban zhang love $j"
done
```

```bash
chmod 777 for3.sh
./for3.sh cls mly wls
```
输出：
```
=============$*=============
banzhang love cls
banzhang love mly
banzhang love wls
=============$@=============
banzhang love cls
banzhang love mly
banzhang love wls
```

当它们被双引号包含时，`$*`会将所有的参数作为一个整体，以`"$1 $2 ...$n"`的形式输出所有参数；`$@`会将各个参数分开，以`"$1" "$2"..."$n"`的形式输出所有参数。

```bash
vim for4.sh
```

写入以下内容：
```bash
#!/bin/bash
echo '=============$*============='
for i in "$*"
#$*中的所有参数看成是一个整体，所以这个for循环只会循环一次
do
    echo "ban zhang love $i"
done
echo '=============$@============='
for j in "$@"
#$@中的每个参数都看成是独立的，所以"$@"中有几个参数，就会循环几次
do
    echo "ban zhang love $j"
done
```

```bash
chmod 777 for4.sh
./for4.sh cls mly wls
```
输出：
```
=============$*=============
banzhang love cls mly wls
=============$@=============
banzhang love cls
banzhang love mly
banzhang love wls
```

### 6.4 while循环

#### 6.4.1 基本语法

```bash
while [ 条件判断式 ]
do
    程序
done
```

#### 6.4.2 案例实操：从1加到100

```bash
vim while.sh
```

写入以下内容：
```bash
#!/bin/bash
sum=0
i=1
while [ $i -le 100 ]
do
        sum=$[$sum+$i]
        i=$[$i+1]
done
echo $sum
```

```bash
chmod 777 while.sh
./while.sh
```
输出：`5050`

---

## 7. read命令

### 7.1 作用

读取终端输入到指定变量中

### 7.2 基本语法

```
read (选项) (参数)
```

#### 选项：

- `-p`：指定读取值时的提示符
- `-t`：指定读取值时等待的时间（秒），如果-t不加表示一直等待

#### 参数：

- 变量：指定读取值的变量名

### 7.3 案例实操

提示7秒内，读取控制台输入的名称。

```bash
vim read.sh
```

写入以下内容：
```bash
#!/bin/bash
read -t 7 -p "Enter your name in 7 seconds :"  NAME
echo $NAME
```

```bash
chmod 777 read.sh
./read.sh
```
输出：
```
Enter your name in 7 seconds : atguigu
atguigu
```

---

## 8. 函数

### 8.1 Shell命令与Shell函数的区别

- Shell命令是构成Shell脚本的基础单位，包括预定义的操作系统命令和外部工具
- Shell函数是用户自定义的代码块，用于封装复杂操作，提高代码的模块化和复用性
- 命令直接作用于Shell环境，而函数则是在Shell环境中定义并调用的，提供了更灵活的编程能力

### 8.2 自定义函数

#### 8.2.1 基本语法

```bash
[ function ] funname[()]
{
    Action;
    [return int;]
}
```

> 注意：function 和 () 只能省略其中一个

#### 8.2.2 经验技巧

1. 必须在调用函数地方之前，先声明函数，shell脚本是逐行运行，不会像其它语言一样先编译
2. 函数返回值，只能通过`$?`系统变量获得，可以显示加return返回，如果不加，将以最后一条命令运行结果，作为返回值。return后跟数值n（0-255）

#### 8.2.3 案例实操：计算两个输入参数的和

```bash
vim fun.sh
```

写入以下内容：
```bash
#!/bin/bash
sum()
{
    SUM=$[$1+$2]
    echo $SUM
}

read -p "请输入第一个数值: " n1
read -p "请输入第二个数值: " n2
sum $n1 $n2
```

```bash
chmod 777 fun.sh
./fun.sh
```
输出：
```
请输入第一个数值: 2
请输入第二个数值: 5
7
```

---

## 9. Shell工具

### 9.1 cut

cut的工作就是"剪"，具体的说就是在文件中负责剪切数据用的。cut命令从文件的每一行剪切字节、字符和字段并将这些字节、字符和字段输出。

#### 9.1.1 基本用法

```
cut [选项参数] filename
```

> 说明：默认分隔符是制表符

#### 9.1.2 选项参数说明

| 选项参数 | 功能 |
|----------|------|
| `-f` | 列号，提取第几列 |
| `-d` | 分隔符，按照指定分隔符分割列，默认是制表符"\t"（只能是一个字符） |

#### 9.1.3 案例实操

**数据准备：**

```bash
vim cut.txt
```

内容：
```
dong shen
guan zhen
wo wo1
lai lai1
le le1
```

**切割cut.txt第一列：**
```bash
cut -d " " -f 1 cut.txt
```
输出：
```
dong
guan
wo
lai
le
```

**切割cut.txt第二、三列：**
```bash
cut -d " " -f 2,3 cut.txt
```
输出：
```
shen
zhen
wo1
lai1
le1
```

**在cut.txt文件中切割出guan：**
```bash
cat cut.txt |grep guan |cut -d " " -f 1
```
输出：`guan`

**选取系统PATH变量值，第2个":"开始后的所有路径：**

```bash
echo $PATH
```
输出：
```
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
```

```bash
echo $PATH |cut -d ":" -f 3-
```
输出：
```
/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
```

**切割ifconfig后打印的IP地址：**

```bash
ifconfig ens33 |grep netmask |cut -d "i" -f 2 |cut -d " " -f 2
```
输出：`192.168.10.150`

> 注意：ifconfig命令需要单独下载一个包：net-tools

### 9.2 awk

一个强大的文本分析工具，把文件逐行的读入，以空格为默认分隔符将每行切片，切开的部分再进行分析处理。

#### 9.2.1 基本用法

```
awk [选项参数] '/pattern1/{action1} /pattern2/{action2}...' filename
```

- pattern：表示awk在数据中查找的内容，就是匹配模式
- action：在找到匹配内容时所执行的一系列命令

#### 9.2.2 选项参数说明

| 选项参数 | 功能 |
|----------|------|
| `-F` | 指定输入文件的分隔符 |
| `-v` | 赋值一个用户定义变量 |

#### 9.2.3 案例实操

**数据准备：**

```bash
cp /etc/passwd ./
```

> passwd数据的含义：**用户名:密码(加密过后的):用户id:组id:注释:用户家目录:shell解析器**

**搜索passwd文件以root关键字开头的所有行，并输出该行的第7列：**
```bash
awk -F : '/^root/{print $7}' passwd
```
输出：`/bin/bash`

**搜索passwd文件以root关键字开头的所有行，并输出该行的第1列和第7列，中间以","号分割：**
```bash
awk -F : '/^root/{print $1","$7}' passwd
```
输出：`root,/bin/bash`

> 注意：只有匹配了pattern的行才会执行action。

**只显示/etc/passwd的第一列和第七列，以逗号分割，且在所有行前面添加列名user，shell，在最后一行添加"atguigu，/bin/zuishuai"：**

```bash
awk -F : 'BEGIN{print "user, shell"} {print $1","$7} END{print "atguigu,/bin/zuishuai"}' passwd
```
输出：
```
user, shell
daemon,/usr/sbin/nologin
bin,/usr/sbin/nologin
...
sunwukong,/bin/bash
atguigu,/bin/zuishuai
```

> 注意：BEGIN 在所有数据读取行之前执行；END 在所有数据执行之后执行。

**将passwd文件中的用户id增加数值1并输出：**
```bash
awk -v i=1 -F : '{print $3+i}' passwd
```
输出：
```
1
2
3
4
...
...
1003
```

#### 9.2.4 awk的内置变量

| 变量 | 说明 |
|------|------|
| FILENAME | 文件名 |
| NR | 行号 |
| NF | 切割后列的个数 |

#### 9.2.5 案例实操

**统计passwd文件名，每行的行号，每行的列数：**

```bash
awk -F : '{print "filename:" FILENAME ",linenum:" NR ",col:" NF}' passwd
```
输出：
```
filename:passwd,linenum:1,col:7
filename:passwd,linenum:2,col:7
filename:passwd,linenum:3,col:7
...
```

**查询ifconfig命令输出结果中的空行所在的行号：**

```bash
ifconfig |awk '/^$/{print NR}'
```
输出：
```
9
18
```

**切割IP：**

```bash
ifconfig ens33 |awk -F " " '/inet /{print $2}'
```
输出：`192.168.10.150`

---

## 10. 正则表达式

正则表达式使用单个字符串来描述、匹配一系列符合某个语法规则的字符串。在很多文本编辑器里，正则表达式通常被用来检索、替换那些符合某个模式的文本。在Linux中，grep，sed，awk等命令都支持通过正则表达式进行模式匹配。

### 10.1 常规匹配

一串不包含特殊字符的正则表达式匹配它自己，例如：

```bash
cat /etc/passwd | grep atguigu
```

会匹配所有包含atguigu的行。

### 10.2 常用特殊字符

#### 10.2.1 特殊字符：^

`^` 匹配一行的开头，例如：

```bash
cat /etc/passwd |grep ^a
```

会匹配出所有以a开头的行。

#### 10.2.2 特殊字符：$

`$` 匹配一行的结束，例如：

```bash
cat /etc/passwd |grep n$
```

会匹配出所有以n结尾的行。

> 思考：^$ 匹配什么？

#### 10.2.3 特殊字符：.

`.` 匹配一个任意的字符，例如：

```bash
cat /etc/passwd |grep r..t
```

会匹配包含rabt, rbbt, rxdt, root等的所有行。

#### 10.2.4 特殊字符：*

`*` 不单独使用，它和上一个字符连用，表示匹配上一个字符0次或多次，例如：

```bash
cat /etc/passwd |grep ro*t
```

会匹配rt, rot, root, rooot, roooot等所有行。

> 思考：.* 匹配什么？

#### 10.2.5 特殊字符：[ ]

`[ ]` 表示匹配某个范围内的**一个字符**，例如：

- `[68]` —— 匹配6或者8
- `[0-9]` —— 匹配一个0-9的数字
- `[0-9]*` —— 匹配任意长度的数字字符串
- `[a-z]` —— 匹配一个a-z之间的字符
- `[a-z]*` —— 匹配任意长度的字母字符串
- `[a-ce-f]` —— 匹配a-c或者e-f之间的任意字符

```bash
cat /etc/passwd |grep r[uk].*t
```

会匹配ru..., rk...所有行。

#### 10.2.6 特殊字符：\

`\` 表示转义，并不会单独使用。由于所有特殊字符都有其特定匹配模式，当我们想匹配某一特殊字符本身时（例如，我想找出所有包含 '$' 的行），就会碰到困难。此时我们就要将转义字符和特殊字符连用，来表示特殊字符本身，例如：

```bash
cat /etc/passwd |grep a\\$b
```

就会匹配所有包含 `a$b` 的行。

---

## 动手练习与验收标准

> 素材出处：`举个栗子/Shell教学/课件-Shell/尚硅谷Shell教程-整理版.md`（第 5、6、9 章）

### 练习 1：for 循环从 1 加到 100

新建 `for1.sh`，写入课件 6.3.2 节脚本，赋予执行权限后运行。

```bash
#!/bin/bash
sum=0
for((i=1;i<=100;i++))
do
        sum=$[$sum+$i]
done
echo $sum
```

```bash
chmod 777 for1.sh
./for1.sh
```

**验收标准**

- `ls -l for1.sh` 的权限位中出现 `rwxrwxrwx`。
- 执行 `./for1.sh` 后终端只输出 `5050`，进程退出码为 0。
- 把循环上界改成 `i<=10` 后重跑，输出变为 `55`，可验证循环边界生效。

### 练习 2：in 风格循环与条件判断

先运行课件 6.3.4 节的 `for2.sh`，再用 `test`/`[ ]` 验证文件状态。

```bash
#!/bin/bash
for i in cls mly wls
do
      echo "ban zhang love $i"
done
```

```bash
chmod 777 for2.sh
./for2.sh

# 条件判断：helloworld.sh 是否具有写权限、是否存在
test -w helloworld.sh
echo $?
test -e helloworld.sh
echo $?
[ -e helloworld2.sh ]
echo $?
```

**验收标准**

- `./for2.sh` 依次输出 `ban zhang love cls`、`ban zhang love mly`、`ban zhang love wls` 三行。
- 若 `helloworld.sh` 存在且可写，`test -w` 后的 `echo $?` 输出 `0`；`chmod u-w helloworld.sh` 后再次执行输出 `1`。
- `test -e helloworld.sh` 后的 `echo $?` 输出 `0`，而 `[ -e helloworld2.sh ]` 后的 `echo $?` 输出 `1`。

### 练习 3：cut 与 awk 提取字段

使用课件 9.1、9.2 节命令：先用 `cut` 截取 `PATH`，再把 `/etc/passwd` 复制到当前目录用 `awk` 分析。

```bash
# 以冒号分隔，取 PATH 的第 3 段到结尾
echo $PATH | cut -d ":" -f 3-

# 复制系统账户文件到当前目录（课件示例使用 passwd 文件）
cp /etc/passwd ./passwd

# 取 root 用户的登录 shell
awk -F : '/^root/{print $7}' passwd

# 输出 root 的用户名和 shell，并加上表头/表尾
awk -F : 'BEGIN{print "user, shell"} {print $1","$7} END{print "atguigu,/bin/zuishuai"}' passwd
```

**验收标准**

- `echo $PATH | cut -d ":" -f 3-` 输出中不再包含 PATH 的前两段目录，且各段之间仍以 `:` 分隔。
- `awk -F : '/^root/{print $7}' passwd` 输出 root 用户的 shell（Ubuntu 通常为 `/bin/bash`）。
- 带 `BEGIN`/`END` 的 awk 命令首行为 `user, shell`，末行为 `atguigu,/bin/zuishuai`。
- 当前目录存在 `passwd` 文件，`ls -l passwd` 能看到该文件。


