## JavaScript 简介

### 1. JavaScript 历史

#### JavaScript 的诞生

- JavaScript 由 Netscape 公司在 1995 年发明。
- 早期主要目的是处理用户的输入验证操作。在其出现之前，客户端页面的验证需要提交到服务器端进行，在电话线调制解调器时代，这会导致用户体验不佳，例如注册表单提交后需等待 30 秒才得知用户名不符合规则。
- 1995 年，Netscape 在发行的 Netscape Navigator 2.0 中开发了一种名为 LiveScript 的脚本语言，原本计划在浏览器和服务器端（当时拟称 LiveWire）使用。后来因与 Sun 公司合作，在 Netscape Navigator 2.0 即将正式发布前，将其更名为 JavaScript，目的是借助 Java 这个当时在因特网上的热门词汇，此后 JavaScript 成为因特网的必备组件。

#### 三足鼎立局面

- 微软进军浏览器市场，发布了 IE 3.0 并搭载了 JavaScript 的克隆版 JScript（此命名是为避免与 Netscape 潜在的许可纠纷）。
- 当时存在 3 种不同的 JavaScript 版本：Netscape Navigator 3.0 中的 JavaScript、IE 中的 JScript 以及 CEnvi 中的 ScriptEase。由于没有统一标准，导致语法和特性不统一，语言标准化势在必行。

#### 标准化进程

- 1997 年，JavaScript 1.1 作为草案提交给欧洲计算机制造商协会（ECMA），第 39 技术委员会（TC39）负责标准化通用、跨平台、中立于厂商的脚本语言的语法和语义。
- 由 Netscape、Sun、微软、Borland 等公司的程序员组成的 TC39 制定出了 ECMA-262 标准，定义了名为 ECMAScript 的全新脚本语言。随后，国际标准化组织及国际电工委员会（ISO/IEC）也采纳 ECMAScript 作为标准。
- 从此，Web 浏览器开始以 ECMAScript 作为 JavaScript 实现的基础。

### 2. JavaScript 特点

- **安全性**：不允许直接访问本地硬盘，仅能进行信息的动态交互。
- **跨平台性**：只要是可以解释 JavaScript 的浏览器都能执行，与平台无关。

### 3. JavaScript 与 Java 不同

| 特点     | JavaScript       | Java                           |
| -------- | ---------------- | ------------------------------ |
| 所属公司 | Netscape 公司    | Sun 公司                       |
| 编程范式 | 基于对象         | 面向对象                       |
| 执行方式 | 只需解释即可执行 | 需要先编译成字节码文件，再执行 |
| 类型系统 | 弱类型           | 强类型                         |

> 强类型语言：当定义一个变量为某个类型，如果不经过代码显式转换（强制转化），它就永远是该类型，若当作其他类型使用会报错。
> 弱类型语言：可以将变量当作任意类型使用，语言的解析器会自动（隐式）转换。

### 4. JavaScript 内容

尽管 ECMAScript 是重要标准，但它并非 JavaScript 的唯一部分，一个完整的 JavaScript 实现由以下 3 个不同部分组成：ECMAScript、DOM、BOM。

目前学习 JavaScript 需要掌握：

- JavaScript 语法基础
- 使用 JS 操作网页（DOM）
- 使用 JS 操作浏览器（BOM）

### 5. 与 HTML 和 CSS 的不同

- html：负责页面的结构。
- css：负责页面的样式。
- javascript：负责与用户进行交互。



## JavaScript 基础

### 1. JavaScript 引入方式

如何编写 JavaScript 代码，有以下两种方式：

- 方式 1：在 `<script>` 标签体内编写。

  ```html
  <script type="text/javascript">
      js代码;
  </script>
  ```

- 方式 2：引入外部的 JavaScript 文件。

  ```html
  <script src="1.js" type="text/javascript">
      
  </script>
  ```

  注意：

  1. `<script>` 有开始标签与结束标签，不要在一个标签中提前结束。
  2. 如果 `<script>` 已用于引入 js 文件，那么该 `<script>` 标签体就不能再写 js 代码了。

#### JavaScript 常用的函数

- `alert("显示的内容..")`：弹出框。
- `document.write("数据")`：向页面输出数据。

#### 页面的注释

- html：`<!-- 注释的内容-->`
- css 的注释：`/* 注释的内容*/`
- javascript：`//注释的内容`（单行注释）、`/* 注释的内容*/`（多行注释）

```html
<script src="js/demo.js" type="text/javascript">
</script>

<script type="text/javascript">
    //alert("弹框");
    //confirm("确认删除吗?");//点击确定返回true否则返回false
    //prompt("请输入你的名字");//点击确定返回输入的内容否则返回null
    //document.write("今天学习js")
</script>
```



### 2. 声明变量

```html
<script>
    /*
    javascript的变量声明：
        格式：
            var 变量名 = 数据;


        声明变量要注意的事项：
            1. 在javascript中声明变量是使用var关键字声明的，javascript中的变量可以存储任意的数据类型数据.
            2. javascript中变量数据类型是根据存储的值决定的，可以随时更改存储数据的类型。
            3. 定义了多个同名的变量时，后定义的同名变量会覆盖前面定义的同名变量。
            4. 声明变量的时候可以省略var关键字，但是不建议省略。


        javascript的数据类型：

            typeof 查看变量的数据类型。

            使用格式：

                    typeof 变量名

            javascript的数据类型：

                number 小数与整数

                string 字符串 注意：javascript中没有字符的概念，只有字符串，字符串可以写在单引号或双引号中。

                boolean 布尔数据类型，

                undefined  undefined代表该变量没有定义。

    */
    document.write("10数据类型是" + (typeof 10) + "<br/>");
    document.write("3.14数据类型是" + (typeof 3.14) + "<br/>");
    document.write("a数据类型是" + (typeof 'abc') + "<br/>");
    document.write("abc数据类型是" + (typeof "abc") + "<br/>");
    document.write("abc数据类型是" + (typeof true) + "<br/>");

    document.write("a变量数据类型是" + (typeof a) + "<br/>");
</script>
```



### 3. 字符串转化成数字

```html
<script type="text/javascript">
    /*
        字符串转数字
            parseInt()  可以把一个字符串转换成整数。
            parseFloat() 可以把一个字符串转换成小数。
    */
    var a = "12";
    a = 12.64;

    a = "123abc123"; 
    var b = parseInt(a);
    document.write("结果：" + b + "<br/>");/* parseInt方法如果接收的字符串含有非数字的字符，那么parseInt方法会从字符串的首个字符开始寻找，一直找到非数字字符为止，然后就使用前面的数字字符转换成数字， */


    var c = "3.14";
    c = parseFloat(c);
    document.write("结果：" + c + "<br/>");

    /*
            javascript提供一个IsNaN的方法让我们判断该字符串是否不是一个数字。

            is not a number  不是一个数字。

            不是一个数字返回true，是一个数字返回false.
    */

    document.write(isNaN(123) + "<br/>");

    document.write(isNaN("abc123"));
</script>
```

### 4. 运算符

```html
<script type="text/javascript">
    /* 用法与java大致相同 */

        逻辑运算符:

        //没有单与的。
        document.write((true&&true)+"<br/>");
        document.write((true&&false)+"<br/>");
        document.write((false&&true)+"<br/>");
        document.write((false&&false)+"<br/>");


        document.write((true||true)+"<br/>");
        document.write((true||false)+"<br/>");
        document.write((false||true)+"<br/>");
        document.write((false||false)+"<br/>");


    三目运算符

        布尔表达式?值1:值2;
    */

    var age = 10;

    document.write(age >= 18 ? "成年人" : "未成年人");
</script>
```



### 5. 流程控制语句

```html
<script type="text/javascript">
    /*
    控制流程语句

        if语句

        格式：
            if(判断条件){
                符合条件执行的代码
            }

        if语句的特殊之处：
            1. 在javascript中的if语句条件不单止可以写布尔表达式，还可以写任何的数据。

            number  非0为true, 0为false.
            string  内容不为空是true， 内容为空的时候是false。
            undefined：false
            NaN:    false
            Null:   false


        var workAge = 0;
        var str ="";
        var b;
        if(b){
            document.write("明天过来面试！！");
        }else{
            document.write("不要在投我们公司了，不要你！");
        }


    选择语句：
        switch语句

            switch(变量){
                case 值1: 
                    
                    break;
                case 值2：
                    
                    break;
                case 值3:
                    
                    break;
                    
                    .....
                    
                default：
                    
                    break;

            }

        特殊之处：
            1.  在javascript中switch后面可以跟其他类型
    */

    var option = "A";

    switch (option) {
        case "A":
            document.write("java");
            break;
        case "B":
            document.write("html");

        case "C":
            document.write("javascript");
            break;
        case "D":
            document.write("css");
            break;
    }
</script>
```

### 6. 循环语句

```html
<script type="text/javascript">
/*
        循环语句：

            while

                格式：
                    while(判断的条件){
                        循环体内容
                    }

            var count = 0 ; 
            while(count<5){
                document.write("hello world<br/>");
                count++;
            }

        需求： 计算1~100的总和。

            var num = 1;
            var result = 0;
            while(num<=100){
                result +=num;
                num++;
            }

            document.write("结果："+result);

        do-while循环语句

            do{
                循环语句；
            }while(判断条件);

        需求；计算1~100奇数的总和。

            var num = 1;
            var result = 0;
            do{
                if(num%2!=0){
                    result +=num;
                }
                num++;
            }while(num<=100);
            document.write("结果："+result);
        for循环语句:
            格式：
                for(初始化语句; 判断的条件 ; 循环后的语句){
                    循环体语句；
                }
        需求；计算1~100偶数的总和。
    */
    var result = 0;
    for (var i = 1; i <= 100; i++) {
        if (i % 2 == 0) {
            result += i;
        }
    }
    document.write("结果：" + result);
</script>
```

### 7. 函数的定义

javascript的函数要注意的细节：

* 在 javascript中函数定义形参时是不能使用var关键字声明变量 的。

* javascript中 的函数是没有 返回值类型 的，如果函数需要返回数据给调用者，直接返回即可，如果不需要返回则不返回。

* 在 javascript中是没有函数 重载的概念的，后定义的同名函数会直接覆盖前面定义同名函数。

```html
<script type="text/javascript">
    /*
    函数:
    函数的定义格式：
    public int add(int a,int b){}

function  add(a,b){
	return a+b;
} 
    function 函数名(形参列表){
            函数体 ;
        }

   


    需求：定义一个函数做两个参数的加法功能。
    */
    function add(a, b) {
        var sum = a + b;
        document.write("两个参数的总和：" + sum);
        //return sum;
    }

    //调用函数
    add(11, 21, 13, 14);
</script>
```

### 8. 函数的练习

```html
<script>
    function showDay() {
        //找到对应的标签对象。
        var inputObj = document.getElementById("month");
        //获取input标签数据
        var month = inputObj.value;
        /*
        if(month==1||month==3||month==5||month==7||month==8||month==10||month==12){
            alert("本月是31天");
        }else if(month==4||month==6||month==9||month==11){
            alert("本月是30天");
        }else if(month==2){
            alert("本月是28天");
        }else{
            alert("没有该月份");
        }
        */

        month = parseInt(month);
        switch (month) {
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                alert("本月是31天");
                break;
            case 4:
            case 6:
            case 9:
            case 11:
                alert("本月是30天");
                break;
            case 2:
                alert("本月是28天");
                break;
            default:
                alert("没有该月份");
                break;

        }

    }
</script>


    <body>
            月份:<input id="month" type="text" />
            <input type="button" value="查询" onclick="showDay()" />
    </body>
```

### 9. Date 对象

```html
<script type="text/javascript">
    /*
    日期对象（Date）
    */
    var date = new Date(); //获取到当前的系统时间
    document.write("年：" + date.getFullYear() + "<br/>");
    document.write("月：" + (date.getMonth() + 1) + "<br/>");
    document.write("日：" + date.getDate() + "<br/>");

    document.write("时：" + date.getHours() + "<br/>");
    document.write("分：" + date.getMinutes() + "<br/>");
    document.write("秒：" + date.getSeconds() + "<br/>");

    //xxxx年yy月dd日  hh:mm:ss

    //document.write("当前时间是："+date.toLocaleString());
    document.write("当前时间是：" + date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日 " +
    date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
</script>
```



### 10. 数组对象

```html
<script type="text/javascript">
        /*
        Array数组对象:
            创建数组的方式1：
                var 变量名 = new Array();  创建一个长度为0的数组。

            方式2：
                var 变量名= new Array(长度) 创建一个指定长度的数组对象。

            方式3：
                var 变量名 = new Array("元素1","元素2"...);  给数组指定元素创建数组的对象。

            方式4：
                var 变量名 = ["元素1","元素2"...];


        数组要注意的细节：
            1.  在javascript中数组的长度是可以发生变化的。

        */

        var arr = new Array(3); //创建了一个长度为3的数组对象。
        arr[100] = 10;
        document.write("arr长度：" + arr.length + "<br/>");

        var arr2 = new Array("狗娃", "狗剩", "铁蛋");
        arr2 = ["狗娃", "狗剩", "铁蛋", "张三"];
        document.write("arr2长度：" + arr2.length + "<br/>");
    </script>
```

### 11. 数组常用的方法

```html
<script type="text/javascript">
    var arr1 = ["狗娃", "狗剩", "铁蛋"];
    
    //pop ：移除数组中的最后一个元素并返回该元素。

    document.write("删除最后的一个元素并返回："+arr1.pop()+"<br/>");

    document.write("<br />");

    arr1.push("永康"); // 将新元素添加到一个数组中，并返回数组的新长度值。

    arr1.reverse(); //翻转数组的元素

    document.write("删除第一个元素并返回："+arr1.shift()+"<br/>"); //移除数组中第一个元素，并且返回。

</script>
```

### 12. Math对象

```html
<script type="text/javascript">
			/*
			Math对象常用的方法：
			 ceil 		向上取整
			 floor（）   向下取整
			 random()  随机数方法 //  产生的伪随机数介于 0 和 1 之间（含 0，不含 1），
			 round     四舍五入
			*/
			document.write("向上取整：" + Math.ceil(3.14) + "<br/>");
			document.write("向下取整：" + Math.floor(3.14) + "<br/>");
			document.write("随机数：" + Math.random() + "<br/>");
			document.write("四舍五入：" + Math.round(3.75) + "<br/>");
		</script>
```

### 13.String对象

```html
<script type="text/javascript">
		/*
			var str1 = new String("hello");
			var str2 = new String("hello");
			document.write("两个字符串的对象一样吗？"+(str1.toString()==str2.toString()));

		创建一个字符串的方式：
		方式1：
			new String("字符串的内容");
			
		方式2：
			var str = "字符串的内容";

		字符串常用的方法：
			anchor（）   生产    锚点 
			charAt()     返回指定索引位置处的字符。
			fontcolor()  把带有 COLOR 属性的一个 HTML <FONT> 标记放置在 String 对象中的文本两端
			
			indexOf()    返回 String 对象内第一次出现子字符串的字符位置
			italics()    把 HTML <I> 标记放置在 String 对象中的文本两端。 
			
			link()         把一个有 HREF 属性的 HTML 锚点放置在 String 对象中的文本两端。
			
			replace()      返回根据正则表达式进行文字替换后的字符串的复制
			
			split()        切割   
			
			Substr(a,b)       截取子串，第一个参数表示下标，第二个参数表示长度
			toUpperCase()  转大写
			toLowerCase    转小写
		*/
		document.write("第五章".anchor("five") + "<br/>"); //给该字符串添加一个a标签，并且添加name属性，属性值为five
		document.write("abc".charAt(1) + "<br/>");
	//chatCodeAt返回的是索引值对应的字符的码值。 
		document.write("第六章".fontcolor("red") + "<br/>"); //fontcolor() 给字符串添加font标签，然后设置color的属性值。
		document.write("abchellohehehello".indexOf("hello") + "<br/>"); //返回指定字符串第一次出现的索引值。
		document.write("第五章".italics() + "<br/>"); //给文本添加一个i标签，把文本内容设置成斜体。
		document.write("百度".link("http://www.baidu.com") + "<br/>"); // 给文本添加一个a标签，
		document.write("明天讲html".replace("html", "DOM编程") + "<br/>"); // 给文本添加一个a标签，
	  //第一个参数表示下标，第二个参数表示长度
		document.write("abcdefg".substr(1,3));
		//第一个参数表示开始下标，第二个参数表示结束下标（包前不包后）
		document.write("abcdefg".substring(1,3));

		var str = "我们-大家-好";
		var arr = str.split("-");
		for (var index = 0; index < arr.length; index++) {
			document.write(arr[index] + ",");
		}
		document.write("<br/>");
		document.write("abc".toUpperCase() + "<br/>"); //转大写
		document.write("ABC".toLowerCase() + "<br/>"); //转小写
	</script>
```







### 14. js 中！=，==，!==，=== 的用法和区别（面试题）

```html
<script type="text/javascript">    
    var num = 1;
    var str = '1';
    var test = 1;
    
    document.write(test == num); //true　相同类型　相同值
     document.write(num == str);  //true 　把str转换为数字，检查其是否相等。
     document.write(num != str);  //false  == 的 非运算
    
    
    
    
    document.write(test === num);//true　相同类型　相同值
    document.write(test !== num);//false test与num类型相同，其值也相同,　非运算肯定是false
    document.write(num === str); //false  类型不同，直接返回false
    document.write(num !== str); //true   num 与 str类型不同 意味着其两者不等　非运算自然是true
    
    //== 和 != 比较若类型不同，先偿试转换类型，再作值比较，最后返回值比较结果 。
    //而=== 和 !== 只有在相同类型下,才会比较其值，类型不同，直接返回false
</script>
```

---

## 动手练习与验收标准

> 素材出处：`举个栗子/AI1015JS/demo1/index.html`、`举个栗子/AI1015JS/js/my_1.js`、`举个栗子/AI1015JS/demo2/index1.html`、`举个栗子/AI1015JS/demo3/index1.html`

### 练习 1：外部 JS 文件引入

新建 `demo1/index.html` 与 `js/my_1.js`，内容分别取自课件中的同名文件。

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title></title>
		<script src="../js/my_1.js" type="text/javascript">
			
		</script>
	</head>
	<body>
	</body>
</html>
```

```javascript
alert("欢迎使用JavaScript!");
```

**验收标准**

- 双击打开 `demo1/index.html`，页面加载时立即弹出内容为 `欢迎使用JavaScript!` 的提示框。
- 点击提示框“确定”后页面正常显示，地址栏不发生变化。
- 把 `<script src>` 一行注释掉后刷新，提示框不再出现，可反证脚本来自外部文件。

### 练习 2：逻辑运算符与三元表达式

新建 `demo2/index1.html`，内容取自课件同名文件，运行后按提示输入年龄。

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title></title>
		<script type="text/javascript">
			document.write((true && true) + "<br/>");
			document.write((true && false) + "<br/>");
			document.write((false && true) + "<br/>");
			document.write((false && false) + "<br/>");


			document.write((true || true) + "<br/>");
			document.write((true || false) + "<br/>");
			document.write((false || true) + "<br/>");
			document.write((false || false) + "<br/>");
			
			var age = prompt("请输入你的年龄");
			document.write(age >= 18 ? '成年人' : '未成年');
			
		</script>
	</head>
	<body>
	</body>
</html>
```

**验收标准**

- 页面依次输出 8 行布尔值：`true`、`false`、`false`、`false`、`true`、`true`、`true`、`false`。
- 加载时弹出输入框，标题为 `请输入你的年龄`。
- 输入 `18` 后页面最后一行显示 `成年人`；输入 `17` 后显示 `未成年`。

### 练习 3：数组长度、增删与反转

新建 `demo3/index1.html`，内容取自课件同名文件。

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title></title>
		<script type="text/javascript">
			var a1 = new Array(3);
			a1[200] = 100;
			document.write(a1.length + "<br/>");
			
			var a2 = ['a' , 'b' , 'c' , 'd'];
			document.write(a2[0] + "<br/>");
			document.write(a2[1] + "<br/>");
			document.write(a2[2] + "<br/>");
			document.write(a2[3] + "<br/>");
			
			a2[4] = 'abc';
			document.write(a2[4] + "<br/>");
			document.write(a2.length + "<br/>");
			
			document.write(a2.pop() + "<br/>");
			
			document.write(a2.push("hello world") + "<br/>");
			
			document.write(a2 + "<br/>");
			
			a2.reverse();
			
			document.write(a2 + "<br/>");
			
			document.write(a2.shift()); 
			
		</script>
	</head>
	<body>
	</body>
</html>
```

**验收标准**

- 第一行输出 `201`，说明给索引 200 赋值后数组长度被拉长。
- 随后依次输出 `a`、`b`、`c`、`d`、`abc`、`5`、`abc`、`5`。
- `push` 后输出 `a,b,c,d,hello world`；`reverse` 后输出 `hello world,d,c,b,a`。
- 最后一行只输出 `hello world`（`shift()` 的返回值），页面无 JS 报错（可打开控制台确认）。

