- 全称 Browser Object Model，即浏览器对象模型。
- JavaScript 由浏览器中内置的 JavaScript 脚本解释器程序来执行 JavaScript 脚本语言。
- 为便于对浏览器进行操作，JavaScript 封装了浏览器的各个对象，使开发者能方便地操作浏览器。
- **Window 对象**是 JavaScript 层级中的顶层对象，代表一个浏览器窗口或一个框架，会在 `<body>` 或 `<frameset>` 每次出现时被自动创建。

浏览器对象模型中，浏览器的各个部分都由一个对象描述，操作浏览器的属性可通过这些对象进行：

- `window`：代表一个新开的窗口
- `location`：代表地址栏对象
- `screen`：代表整个屏幕的对象

## 1. window 对象

### window 对象常用的方法

- `open()`：打开一个新的窗口
- `resizeTo()`：将窗口的大小更改为指定的宽度和高度值
- `moveTo()`：将窗口左上角的屏幕位置移动到指定的 x 和 y 位置
- `moveBy()`：相对于原来的窗口移动指定的 x、y 值
- `setInterval()`：每经过指定毫秒值后执行指定的代码
- `clearInterval()`：根据一个任务的 ID 取消定时任务
- `setTimeout()`：经过指定毫秒值后执行指定的代码一次

> 注意：使用 window 对象的任何属性与方法都可以省略 window 对象不写。

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title></title>
</head>
<body>
    <input type="button" value="open" onclick="Testopen()" />
    <input type="button" value="resizeTo" onclick="TestresizeTo()" />
    <input type="button" value="moveTo" onclick="TestmoveTo()" />
    <input type="button" value="moveBy" onclick="TestmoveBy()" />
    <input type="button" value="clearInterval" onclick="TestclearInterval()" />
</body>
<script>
    function Testopen(){
        window.open("xxx.html","_blank","location=no,toolbar=no");
    }

    function TestresizeTo(){
        window.resizeTo("400","400");
    }

    function TestmoveTo(){
        window.moveTo("500","200");
    }

    function TestmoveBy(){
        for(var i=0;i<100;i++){
            window.moveBy(50,0);//右移
            window.moveBy(0,50);//下移
            window.moveBy(-50,0);//左移
            window.moveBy(0,-50);//上移
        }
    }

    //var id = window.setInterval("Testopen()",3000);

    function TestclearInterval(){
        window.clearInterval(id);
    }

    //window.setTimeout("Testopen()",1000);

</script>
</html>
```

## 2. 常用的事件

### 鼠标点击相关

- `onclick`：在用户用鼠标左键单击对象时触发
- `ondblclick`：当用户双击对象时触发
- `onmousedown`：当用户用任何鼠标按钮单击对象时触发
- `onmouseup`：当用户在鼠标位于对象之上时释放鼠标按钮时触发

### 鼠标移动相关

- `onmouseout`：当用户将鼠标指针移出对象边界时触发
- `onmousemove`：当用户将鼠标划过对象时触发

### 焦点相关

- `onblur`：在对象失去输入焦点时触发
- `onfocus`：当对象获得焦点时触发

### 其他

- `onchange`：当对象或选中区的内容改变时触发
- `onload`：在浏览器完成对象的装载后立即触发
- `onsubmit`：当表单将要被提交时触发

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title></title>
</head>
<body <!--onload="showPage()"-->>


<input type="button" value="单击" onclick="Testonclick()" />


<input type="button" value="双击" ondblclick="Testondblclick()" />


<input type="button" value="按下鼠标" onmousedown="Testonmousedown()" />


<input type="button" value="释放鼠标" onmouseup="Testonmouseup()" />


<input type="button" value="显示时间" onmousemove="Testonmousemove()" onmouseout="Testonmouseout()" />
<span id="time"></span>


<hr>


用户名:<input type="text" id="username" name="username" onfocus="Testonfocus()" onblur="Testonblur()" />
<span id="user"></span>
密码:<input type="password" name="password"  />


<select onchange="Testonchange()">
<option>上海</option>
<option>北京</option>
<option>深圳</option>
</select>


<form action="ad.html" onsubmit="Testonsubmit()">
<input type="submit" />
</form>


</body>


<script>


function Testonsubmit(){
alert("表单将要被提交..")
}


function Testonchange(){
alert("城市变了..")
}


function Testonblur(){
var usernameNode = document.getElementById("username");
var username = usernameNode.value;
if(username.length<=6){
document.getElementById("user").innerHTML  = "用户名长度不足六位".fontcolor("red");
}
}


function Testonfocus(){
document.getElementById("user").innerHTML = "用户名长度必须大于六位".fontcolor("green");
}


function showPage(){
document.write("page");
}


function Testonclick(){
alert("单击");
}


function Testondblclick(){
alert("双击");
}


function Testonmousedown(){
alert("按下鼠标");
}


function Testonmouseup(){
alert("释放鼠标");
}


function Testonmousemove(){
	document.getElementById("time").innerHTML = new Date().toLocaleString();
}


function Testonmouseout(){
	document.getElementById("time").innerHTML = "";
}


</script>
</html>
```

## 3. location 对象

Location 对象由 JavaScript runtime engine 自动创建，包含有关当前 URL 的信息。

### location 中的重要方法

- `href` 属性：设置或获取整个 URL 为字符串
- `reload()`：重新装入当前页面

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title></title>
</head>
<body>


<input type="button" value="新浪网" onclick="writeSina()" />


<input type="button" value="刷新" onclick="refresh()" />
</body>


<script>


document.writeln(location.href+"<br>");
document.writeln(location.host+"<br>");
document.writeln(location.hostname+"<br>");
document.writeln(location.port+"<br>");
document.writeln(location.protocol+"<br>");


function writeSina(){
location.href = "http://www.sina.com.cn";
}


function refresh(){
location.reload();
}


</script>
</html>
```



## 4. screen 对象

Screen 对象由 JavaScript runtime engine 自动创建，包含有关客户机显示屏幕的信息。

### Screen (屏幕) 对象的属性

- `availHeight`：获取系统屏幕的工作区域高度，排除 Windows 任务栏
- `availWidth`：获取系统屏幕的工作区域宽度，排除 Windows 任务栏
- `height`：获取屏幕的垂直分辨率
- `width`：获取屏幕的水平分辨率

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title></title>
</head>
<body>
</body>


<script type="text/javascript">


document.write("获取系统屏幕的工作区域高度：" + screen.availHeight + "<br/>");
document.write("获取系统屏幕的工作区域宽度：" + screen.availWidth + "<br/>");
document.write("获取屏幕的垂直分辨率：" + screen.height + "<br/>");
document.write("获取屏幕的水平分辨率：" + screen.width + "<br/>");


</script>
</html>
```

## 5. 随机点餐

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title></title>
	</head>

	<body onload="eat()">
		<center>
			<span id="food"></span>
			<hr />
			
			<input type="button" style="font-size: 50px;" value="暂停" onclick="stop()"/>
			
			<input type="button" style="font-size: 50px;" value="继续" onclick="star()"/>
			
		</center>
	</body>
	
	<script type="text/javascript">
			function eat() {
				var arr = ["盖浇饭", "油泼面", "米皮","兰州拉面"];
				//随机获取下标
				var index = Math.floor(Math.random() * arr.length);
				//获取数组中具体的数据
				var code = arr[index];
				
				var spanNode = document.getElementById("food");
				spanNode.innerHTML = code;
				//操作css样式
				spanNode.style.fontSize = "124px";
				spanNode.style.color = "red";
				spanNode.style.backgroundColor = "yellow";
			}
			
			var id = setInterval("eat()",100);
			
			function stop(){
				clearInterval(id);
			}
			
			function star(){
				location.reload();
			}
			
		</script>

</html>
```

---

## 动手练习与验收标准

> 素材出处：`举个栗子/02-JavaScript/BOM/BOM.md`（第 2 节“常用的事件”、第 3 节“location 对象”、第 5 节“随机点餐”）

### 练习 1：常用事件绑定

新建 `event.html`，代码取自 `BOM.md` 第 2 节。

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title></title>
</head>
<body>

<input type="button" value="单击" onclick="Testonclick()" />
<input type="button" value="双击" ondblclick="Testondblclick()" />
<input type="button" value="按下鼠标" onmousedown="Testonmousedown()" />
<input type="button" value="释放鼠标" onmouseup="Testonmouseup()" />
<input type="button" value="显示时间" onmousemove="Testonmousemove()" onmouseout="Testonmouseout()" />
<span id="time"></span>

<hr>

用户名:<input type="text" id="username" name="username" onfocus="Testonfocus()" onblur="Testonblur()" />
<span id="user"></span>
密码:<input type="password" name="password"  />

<select onchange="Testonchange()">
<option>上海</option>
<option>北京</option>
<option>深圳</option>
</select>

<form action="ad.html" onsubmit="Testonsubmit()">
<input type="submit" />
</form>

</body>

<script>
function Testonsubmit(){
alert("表单将要被提交..")
}

function Testonchange(){
alert("城市变了..")
}

function Testonblur(){
var usernameNode = document.getElementById("username");
var username = usernameNode.value;
if(username.length<=6){
document.getElementById("user").innerHTML  = "用户名长度不足六位".fontcolor("red");
}
}

function Testonfocus(){
document.getElementById("user").innerHTML = "用户名长度必须大于六位".fontcolor("green");
}

function Testonclick(){
alert("单击");
}

function Testondblclick(){
alert("双击");
}

function Testonmousedown(){
alert("按下鼠标");
}

function Testonmouseup(){
alert("释放鼠标");
}

function Testonmousemove(){
	document.getElementById("time").innerHTML = new Date().toLocaleString();
}

function Testonmouseout(){
	document.getElementById("time").innerHTML = "";
}
</script>
</html>
```

**验收标准**

- 单击“单击”按钮弹出 `单击`；双击“双击”按钮弹出 `双击`；按下/释放“按下鼠标”“释放鼠标”按钮分别弹出对应提示。
- 鼠标移到“显示时间”按钮上，右侧 span 显示当前日期时间；移出后 span 内容清空。
- 用户名输入框获得焦点时，右侧出现绿色提示 `用户名长度必须大于六位`；输入 6 位以内并失焦时，提示变为红色 `用户名长度不足六位`。
- 切换下拉框选项弹出 `城市变了..`；点击表单提交按钮弹出 `表单将要被提交..`（随后会跳转到 `ad.html`，本机无该文件时显示 404 属正常）。

### 练习 2：location 对象读取与跳转

新建 `location.html`，代码取自 `BOM.md` 第 3 节。

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title></title>
</head>
<body>

<input type="button" value="新浪网" onclick="writeSina()" />
<input type="button" value="刷新" onclick="refresh()" />
</body>

<script>
document.writeln(location.href+"<br>");
document.writeln(location.host+"<br>");
document.writeln(location.hostname+"<br>");
document.writeln(location.port+"<br>");
document.writeln(location.protocol+"<br>");

function writeSina(){
location.href = "http://www.sina.com.cn";
}

function refresh(){
location.reload();
}
</script>
</html>
```

**验收标准**

- 页面自上而下输出 5 行：完整 URL、主机（含端口）、主机名、端口、协议。
- 以 `file:///` 方式打开时，`location.protocol` 输出 `file:`；用本地 HTTP 服务打开时输出 `http:`。
- 点击“刷新”按钮，页面重新加载（可在控制台看到页面重新执行脚本）。
- 点击“新浪网”按钮，浏览器地址栏跳转到 `http://www.sina.com.cn`（需联网）。

### 练习 3：setInterval + 随机点餐

新建 `order.html`，代码取自 `BOM.md` 第 5 节。

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title></title>
	</head>

	<body onload="eat()">
		<center>
			<span id="food"></span>
			<hr />
			
			<input type="button" style="font-size: 50px;" value="暂停" onclick="stop()"/>
			
			<input type="button" style="font-size: 50px;" value="继续" onclick="star()"/>
			
		</center>
	</body>
	
	<script type="text/javascript">
			function eat() {
				var arr = ["盖浇饭", "油泼面", "米皮","兰州拉面"];
				var index = Math.floor(Math.random() * arr.length);
				var code = arr[index];
				
				var spanNode = document.getElementById("food");
				spanNode.innerHTML = code;
				spanNode.style.fontSize = "124px";
				spanNode.style.color = "red";
				spanNode.style.backgroundColor = "yellow";
			}
			
			var id = setInterval("eat()",100);
			
			function stop(){
				clearInterval(id);
			}
			
			function star(){
				location.reload();
			}
			
		</script>

</html>
```

**验收标准**

- 页面打开后，`food` 区域的菜名每 100ms 变化一次，只在 `盖浇饭`、`油泼面`、`米皮`、`兰州拉面` 四个值中切换。
- 菜名样式为红色、黄色背景、字号明显放大（124px）。
- 点击“暂停”后菜名停止变化；点击“继续”后页面刷新并重新开始滚动。
- 连续观察 10 秒，未出现空白菜名或 JS 报错。



