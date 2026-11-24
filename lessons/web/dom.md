### DOM

## 简介

- 全称 Document Object Model，即文档对象模型。
- DOM 描绘了一个层次化的树，允许开发人员添加、删除、修改页面的某一部分。
- 浏览器在解析 HTML 页面标记的时候，是将 HTML 页面中的每一个标记按照顺序在内存中组建一颗 DOM 树，组建好之后，按照树的结构将页面显示在浏览器的窗口中。

### 节点层次

HTML 网页可以看做是一个树状的结构，如下：

```plaintext
html
 |-- head
 |     |-- title
 |     |-- meta
 |     ...
 |-- body
 |     |-- div
 |     |-- form
 |     |     |-- input
 |     |     |-- textarea
 ...   ...   ...
```

这是一颗树，由多个节点（Node）组成，节点的类型有很多种。节点最多有一个父节点，可以有多个子节点。

DOM 定义了访问和操作 HTML 文档的标准方法。

- **document**：代表当前页面的整个文档树。
- 访问属性：
  - all  所有节点
  - images 所有图片节点
  - links 所有超链接节点

## 1. document 入门

document对象代表整个文档页面html

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title></title>
	</head>
	<body>
		<img src="" alt="这是图片" />
		<img src="" alt="这是图片" />
		<img src="" alt="这是图片" />
		
		<input type="button" value="设置图片" onclick="setImg()" />
		
		<a href="#">百度1</a>
		<a href="#">百度2</a>
		<a href="#">百度3</a>
		
		<input type="button" value="设置a标签" onclick="setA()" />
	</body>
	
	<script>
		/*
		DOM(Document Object Model) 文档对象模型
				
		一个html页面被浏览器加载的时候，浏览器就会对整个html页面上的所有标签都会创建一个对应的
		对象进行描述，我在浏览器上看到的信息只不过就是这些html对象的属性信息而已。我们只要能找到
		应的对象操作对象的属性，则可以改变浏览器当前显示的内容。  	
		*/
		
		//获取当前页面所有标签对象
		var allNodes = document.all;
		
		for(var i= 0;i<allNodes.length;i++){
			//document.write(allNodes[i]+"---");
			//nodeName：节点名称
			document.write(allNodes[i].nodeName+"---");
		}
		
		function setImg(){
			var allImgNodes = document.images;
			
			for(var i= 0;i<allImgNodes.length;i++){
				allImgNodes[i].src="img/2.jpg";
				allImgNodes[i].width = 200;
				allImgNodes[i].height = 200;
			}
		}
		
		function setA(){
			var aNodes = document.links;
			
			for(var i= 0;i<aNodes.length;i++){
				aNodes[i].href="http://www.baidu.com";
			}
		}
		
	</script>
</html>
```



## 2. 根据 html 标签的属性找节点

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title></title>
	</head>
	<body>
	
		用户名：<input type="text" id="username" />
		<input type="button" value="设置用户名" onclick="setUserName()" />
		<hr>
		
		<img src="" alt="这是图片1" />
		<img src="" alt="这是图片2" class="imgs" />
		<img src="" alt="这是图片3" class="imgs" />
		<input type="button" value="设置图片" onclick="setImgs()" />
		<hr>
		
		<div>div1</div>
		<div>div2</div>
		<div>div3</div>
		<input type="button" value="设置div" onclick="setDivs()" />
		<hr>
		
		<span name="span">span1</span>
		<span name="span">span2</span>
		<span name="span">span3</span>
		<input type="button" value="设置span" onclick="setSpans()" />
		<hr>
	
	</body>
	
	<script>
		/*
		通过html元素的标签属性找节点。
			document.getElementById("html元素的id属性值") 
			document.getElementsByTagName("标签名") 
			document.getElementsByName("html元素的name属性值")
			document.getElementsByClassName("html元素的class属性值")
		*/
	
		function setUserName(){
			//通过id属性获取标签对象
			var usernameNode = document.getElementById("username");
			usernameNode.value="jack";
		}
		
		function setImgs(){
			//通过class属性获取标签对象（返回的是一个数组）
			var imgNodes= document.getElementsByClassName("imgs");
			
			for(var i= 0;i<imgNodes.length;i++){
				imgNodes[i].src="img/2.jpg";
				imgNodes[i].width = 200;
				imgNodes[i].height = 200;
			}
		}
		
		function setDivs(){
			//通过标签名获取标签对象（返回的是一个数组）
			var divNodes= document.getElementsByTagName("div");
			
			for(var i= 0;i<divNodes.length;i++){
				divNodes[i].innerHTML = "div标签".fontcolor("red");
			}
		}
		
		function setSpans(){
			//通过name属性获取标签对象（返回的是一个数组）
			var spanNodes= document.getElementsByName("span");
			
			for(var i= 0;i<spanNodes.length;i++){
				spanNodes[i].innerHTML = "span标签".fontcolor("red");
			}
		}
		
		
	</script>
</html>
```



## 3. 根据属性找标签练习

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title></title>
		<script type="text/javascript">
			function checkAll() {
				//找到所有的的选项
				var items = document.getElementsByName("item");
				//找到全选按钮的对象
				var allNode = document.getElementsByName("all")[0];
				for (var i = 0; i < items.length; i++) {
					items[i].checked = allNode.checked;
				}
			}

			function getSum() {
				var items = document.getElementsByName("item");
				var sum = 0;
				for (var i = 0; i < items.length; i++) {
					if (items[i].checked) {
						sum += parseInt(items[i].value);
					}
				}

				var spanNode = document.getElementById("sumid");
				spanNode.innerHTML = ("&nbsp;&nbsp;&nbsp;&yen;" + sum).fontcolor("green");
			}
		</script>
	</head>

	<body>
		<div>商品列表</div>
		<input type="checkbox" name="item" value="3000" />笔记本
电脑3000元<br /><br/>
		<input type="checkbox" name="item" value="3000" />笔记本电脑3000元<br /><br/>
		<input type="checkbox" name="item" value="3000" />笔记本
电脑3000元<br /><br/>
		<input type="checkbox" name="item" value="3000" />笔记本电脑3000元<br /><br/>
		<input type="checkbox" name="item" value="3000" />笔记本电脑3000元<br /><br/>
		<input type="checkbox" name="item" value="3000" />笔记本电脑3000元<br /><br/>
		<input type="checkbox" name="all" onclick="checkAll()" />全/不选<br /><br/>
		<input type="button" value="总金额：" onclick="getSum()" />
		<span id="sumid"></span>
	</body>

</html>
```



## 4. 通过节点关系找标签

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title></title>
	</head>

	<body>
		<input type="text" id="userName" /><span></span>

	</body>

	<script type="text/javascript">
		/*
			通过关系(父子关系、兄弟关系)找标签。
				parentNode	获取当前元素的父节点。
				childNodes	获取当前元素的所有下一级子元素。
				firstChild	获取当前节点的第一个子节点。
				lastChild  	获取当前节点的最后一个子节点。
		------------------------------------------------------------	
				nextSibling		获取当前节点的下一个节点。（获取当前节点相邻的下一个平级节点）
				previousSibling	获取当前节点的上一个节点。（获取当前节点相邻的上一个平级节点）
				
		我们可以通过标签的类型进行判断筛选：
			
			文本节点的类型： 3
			注释的节点类型： 8
			标签节点的类型： 1
		*/

		var bodyNode = document.getElementsByTagName("body")[0];
		//查看父节点
		var parentNode = bodyNode.parentNode;
		document.write("父节点的名称：" + parentNode.nodeName);
		document.write("<br />");

		//找子节点:childNodes 获取所有的子节点，返回的是一个数组。 注意： 获取子节点的时候是包括了空文本或者是注释。
		var children = bodyNode.childNodes;
		//document.write(children.length);
		for (var i = 0; i < children.length; i++) {
			//if(children[i].nodeType==1){
			document.write("节点的名字：" + children[i].nodeName + " 对象的类型:" + children[i].nodeType + "---");
			//}
		}
		document.write("<br />");
		document.write("第一个子节点：" + bodyNode.firstChild.nodeName);
		document.write("最后一个子节点：" + bodyNode.lastChild.nodeName);
		document.write("<br />");

		//找兄弟节点
		var inputNode = document.getElementById("userName");
		document.write("下个兄弟节点：" + inputNode.nextSibling.nodeName);
		document.write("上一个兄弟节点：" + inputNode.previousSibling.nodeName);
	</script>
</html>
```



## 5. 创建节点，插入节点

每个节点都包含的信息的，这些属性是：

- **nodeType**：节点类型
- **nodeName**：节点名称
- **nodeValue**：节点值

| 元素类型 | 节点类型 | 说明                            |
| -------- | -------- | ------------------------------- |
| 元素     | 1        | 就是标签元素，例`<div>..</div>` |
| 文本     | 3        | 标签元素中的文本                |
| 注释     | 8        | 表示为注释                      |

**nodeName**：nodeName 属性含有某个节点的名称。

- 元素节点的 nodeName 是标签名称
- 属性节点的 nodeName 是属性名称
- 文本节点的 nodeName 永远是 #text
- 文档节点的 nodeName 永远是 #document

**nodeValue**：

- 对于文本节点，nodeValue 属性是所包含的文本。
- 对于属性节点，nodeValue 属性是属性值。
- 对于注释节点，nodeValue 属性注释内容。
- nodeValue 属性对于文档节点和元素节点是不可用的。

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title></title>
		<script type="text/javascript">
			/*
			 创建节点、设置节点的属性。
			 
				document.createElement("标签名")		创建新元素节点
				elt.setAttribute("属性名", "属性值")	设置属性
				elt.appendChild(e)		添加元素到elt中最后的位置
			*/

			var num = 1;

			function add() {
				var inputNode = document.createElement("input"); //创建一个指定标签名字的节点。

				//setAttribute:设置节点的属性
				inputNode.setAttribute("type", "button");
				inputNode.setAttribute("value", "按钮" + num);
				num++;

				var bodyNode = document.getElementsByTagName("body")[0];
				bodyNode.appendChild(inputNode); //appendChild 添加子节点。
			}
		</script>
	</head>

	<body>
		<input type="button" onclick="add()" value="添加" />
	</body>

</html>
```



## 6. 添加附件

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title></title>

		<script type="text/javascript">
			/*
				插入目标元素的位置	 
				elt.insertBefore(newNode, childNode);			添加到elt中，childNode之前。
				注意： elt必须是childNode的直接父节点。
					
				删除指定的子节点	
				elt.removeChild(child)						
				注意： elt必须是child的直接父节点。
				
			*/
			
			//添加附件
			function addFile() {
				//获取表格节点对象
				var table = document.getElementsByTagName("table")[0];
				//创建tr标签节点对象
				var trnode = document.createElement("tr");
				trnode.innerHTML = "<td><input type='file'/></td><td><a href='#' onclick='del(this)'>删除附件</a></td>";
				/*	var	tdnode1=document.createElement("td");
					var	tdnode2=document.createElement("td");
					tdnode1.innerHTML="<input type='file'/>";
					tdnode2.innerHTML="<a href='#'>删除附件</a>";	
					trnode.appendChild(tdnode1);
					trnode.appendChild(tdnode2);*/
				//table.appendChild(trnode);
				
				//获取父节点对象
				var tbody = document.getElementsByTagName("tbody")[0];
				//获取要插入的子节点
				var lastrow = document.getElementById("lastrow");
				//添加数据
				tbody.insertBefore(trnode, lastrow);
			}

			//删除附件
			function del(delfile) {
				//获取父节点对象
				var tbody = document.getElementsByTagName("tbody")[0];
				//获取要删除的tr标签节点对象
				var del = delfile.parentNode.parentNode;
				//删除数据
				tbody.removeChild(del);
			}
		</script>
	</head>

	<body>
		<table>
			<tbody>
				<tr>
					<td><input type="file" /></td>
					<td><a href="#" onclick="del(this)">删除附件</a></td>
				</tr>

				<tr id="lastrow">
					<td colspan="2"><input onclick="addFile()" type="button" value="添加附件" /></td>
				</tr>
			</tbody>
		</table>
	</body>

</html>
```

## 7. 城市联动框

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title></title>
		<script type="text/javascript">
			function showCity() {
				//维护一个二维数组存储省份对应的城市
				var citys = [[],["洛阳", "郑州", "三门峡"],["青岛", "日照", "烟台"],["广州", "汕头"]];
				//获取省份对应的节点
				var provinceNodes = document.getElementById("province");
				//获取省份选中的选项
				var index = provinceNodes.selectedIndex;
				//获取对应的城市
				var datas = citys[index];
				//找到city节点
				var citynode = document.getElementById("city");
				//先清空city框所有option
				var citychild = citynode.childNodes;
				for (var i = 0; i < citychild.length;) {
					citynode.removeChild(citychild[i]);
				}
				//设置options的个数。
				//citynode.options.length = 1;
				//遍历对应的所有城市然后创建对应的option添加到city上。
				for (var i = 0; i < datas.length; i++) {
					var op = document.createElement("option");
					op.innerHTML = datas[i];
					citynode.appendChild(op);
				}
			}
		</script>
	</head>

	<body>
		省份<select id="province" onchange="showCity()">
    		<option>省份</option>
    		<option>河南</option>
            <option>山东</option>
            <option>广东</option>
    	</select> 城市
		<select id="city">
		<option>城市</option>
	</select>
	</body>

</html>
```



## 8. 正则验证 From 表单

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<script type="text/javascript">

	//检查用户名
	function checkName(){
		var inputNode = document.getElementById("userName");
		var spanNode = document.getElementById("userId");
		//获取输入框的内容
		var content  = inputNode.value;
		//用户名的规则： 六位的英文与数字组成。数字不能开头
		var reg = /^[a-z][a-z0-9]{5}$/i;	
		if(reg.test(content)){
			//符合规则
			spanNode.innerHTML = "正确".fontcolor("green");
			
			return true;
		}else{
			//不符合规则
			spanNode.innerHTML = "错误".fontcolor("red");
			
			return false;
		}	
	}


	//检查邮箱
	function checkEmail(){
		var email = document.getElementById("email").value;
		var spanNode = document.getElementById("emailspan");
		
		//编写邮箱的正则       13456@qq.com  13456@qq.net  13456@qq.com.cn
		var reg = /^[a-z0-9]\w+@[a-z0-9]+(\.[a-z]{2,3}){1,2}$/i; 
		if(reg.test(email)){
			//符合规则
			spanNode.innerHTML = "正确".fontcolor("green");
			return true;
		}else{
			//不符合规则
			spanNode.innerHTML = "错误".fontcolor("red");
			
			return false;
		}	
	}
	
	function checkAll(){
		var userName = checkName();	
		var email = checkEmail();
		if(userName&&email){
			return true;
		}else{
		
			return false;
		}
	}
	
/*
 表单提交的时候是会触发onsubmit事件的，如果onsubmit事件的方法返回是true，那么该表单允许提交，如果返回的是false，该表单不允许提交。

*/
</script>

<meta http-equiv="Content-Type" content="text/html; 
charset=utf-8" />
<title>正则表达式</title>
</head>
<body>								
<form action="success.html" method="get" onsubmit="return checkAll()" > <!--如果表单提交时候触发的方法返回是false,那么该表单
不允许提交，如果返回的是true允许提交 -->
			<table border="1px" width="50%" align="center" 
cellspacing="0px" cellpadding="3px">
				<tr>
					<td width="25%">姓名:</td>
					<td>
						<input type="text" name="userName" id="userName" onblur="checkName()"/>
                        <span id="userId"></span>
					</td>
				</tr>
				<tr>
					<td >密码:</td><td>
						<input type="password"  name="pwd" id="pwd" onblur="checkPass()"/>
                        <span id="passId"></span>
					</td>
				</tr>
				<tr>
					<td>确认密码:</td><td>
				<input type="password" name="ensurepwd" id="ensurepwd" onblur="ensurepass()" />		                <span id="ensure"></span>
					</td>
				</tr>
				<tr>
					<td>邮箱</td><td>
						<input type="text" name="email" id="email" 
onblur="checkEmail()"/>
                		<span id="emailspan"></span>
				        <br/>
					</td>
				</tr>
				<tr>
					<td>性别</td><td>
						<input type="radio" checked="ture" name="gender" id="male" value="male"/>
					男
						<input type="radio" name="gender" value="female"/>
					女</td>
				</tr>
				<tr>
					<td>爱好:</td><td>
						<input type="checkbox"  name="like" />
					eat
						<input type="checkbox" name="like" />
					sleep
						<input type="checkbox" name="like"/>
					play  <br/>
                    <span id="hobbySpan"></span>
                    </td>
				</tr>
				<tr>
					<td>城市</td><td>
					<select name="city" id="city">
						<option value=""> 请选择</option>
						<option value="bj"> 北京 </option>
						<option value="gz"> 广州 </option>
						<option value="sh"> 上海 </option>
					</select>
                    <br/>
                    </td>
				</tr>
				<tr>
					<td>自我介绍</td><td>					<textarea cols="15" rows="5"  name="myInfo" id="myInfo"></textarea></td>
				</tr>
				<tr align="center">
					<td colspan="2"><!--提交按钮-->
					<input type="submit"/>
					</td>
				</tr>
			</table>
		</form>
</body>

</html>
```

### Success.html

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>无标题文档</title>
</head>

<body>
	<h1><font color="#FF0000">恭喜你 ,提交数据成功</font></h1>
</body>

</html>
```

---

## 动手练习与验收标准

> 素材出处：`举个栗子/02-JavaScript/DOM/DOM.md`（第 4 节“通过节点关系找标签”、第 5 节“创建节点，插入节点”、第 7 节省市联动）

### 练习 1：通过节点关系查找标签

新建 `relation.html`，代码取自 `DOM.md` 第 4 节。

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title></title>
	</head>

	<body>
		<input type="text" id="userName" /><span></span>

	</body>

	<script type="text/javascript">
		var bodyNode = document.getElementsByTagName("body")[0];
		//查看父节点
		var parentNode = bodyNode.parentNode;
		document.write("父节点的名称：" + parentNode.nodeName);
		document.write("<br />");

		//找子节点:childNodes 获取所有的子节点，返回的是一个数组。
		var children = bodyNode.childNodes;
		for (var i = 0; i < children.length; i++) {
			document.write("节点的名字：" + children[i].nodeName + " 对象的类型:" + children[i].nodeType + "---");
		}
		document.write("<br />");
		document.write("第一个子节点：" + bodyNode.firstChild.nodeName);
		document.write("最后一个子节点：" + bodyNode.lastChild.nodeName);
		document.write("<br />");

		//找兄弟节点
		var inputNode = document.getElementById("userName");
		document.write("下个兄弟节点：" + inputNode.nextSibling.nodeName);
		document.write("上一个兄弟节点：" + inputNode.previousSibling.nodeName);
	</script>
</html>
```

**验收标准**

- 页面第一行输出 `父节点的名称：HTML`。
- 子节点遍历结果中出现 `#text`（类型 3）以及 `INPUT`、`SPAN`（类型 1），说明文本节点也被计入 `childNodes`。
- 输出 `第一个子节点：#text` 与 `最后一个子节点：#text`。
- 输出 `下个兄弟节点：#text` 和 `上一个兄弟节点：#text`，说明 input 两侧存在空白文本节点。

### 练习 2：创建节点并追加到页面

新建 `create.html`，代码取自 `DOM.md` 第 5 节。

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title></title>
		<script type="text/javascript">
			var num = 1;

			function add() {
				var inputNode = document.createElement("input");
				inputNode.setAttribute("type", "button");
				inputNode.setAttribute("value", "按钮" + num);
				num++;

				var bodyNode = document.getElementsByTagName("body")[0];
				bodyNode.appendChild(inputNode);
			}
		</script>
	</head>

	<body>
		<input type="button" onclick="add()" value="添加" />
	</body>

</html>
```

**验收标准**

- 初次打开页面，只有一个“添加”按钮。
- 第一次点击“添加”后，按钮右侧新增一个显示 `按钮1` 的按钮；第二次点击新增 `按钮2`，编号递增。
- 连续点击 3 次后，页面上共有 4 个按钮（1 个“添加” + 3 个动态按钮），后加入的按钮位于 DOM 末尾。
- 右键检查元素，可见新增节点为 `<input type="button" value="按钮1">`。

### 练习 3：省市联动下拉框

新建 `city.html`，代码取自 `DOM.md` 第 7 节。

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title></title>
		<script type="text/javascript">
			function showCity() {
				//维护一个二维数组存储省份对应的城市
				var citys = [[],["洛阳", "郑州", "三门峡"],["青岛", "日照", "烟台"],["广州", "汕头"]];
				var provinceNodes = document.getElementById("province");
				var index = provinceNodes.selectedIndex;
				var datas = citys[index];
				var citynode = document.getElementById("city");
				//先清空city框所有option
				var citychild = citynode.childNodes;
				for (var i = 0; i < citychild.length;) {
					citynode.removeChild(citychild[i]);
				}
				//遍历对应的所有城市然后创建对应的option添加到city上。
				for (var i = 0; i < datas.length; i++) {
					var op = document.createElement("option");
					op.innerHTML = datas[i];
					citynode.appendChild(op);
				}
			}
		</script>
	</head>

	<body>
		省份<select id="province" onchange="showCity()">
    		<option>省份</option>
    		<option>河南</option>
            <option>山东</option>
            <option>广东</option>
    	</select> 城市
		<select id="city">
		<option>城市</option>
	</select>
	</body>

</html>
```

**验收标准**

- 初始状态城市下拉框只有“城市”一个选项。
- 省份选择“河南”后，城市下拉框变为 `洛阳`、`郑州`、`三门峡` 三项。
- 再从“河南”切换到“广东”后，城市框只剩 `广州`、`汕头` 两项，不会残留河南的城市。
- 切换到“山东”后城市为 `青岛`、`日照`、`烟台`，页面上无 JS 报错。

