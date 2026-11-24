## 1. 什么是 JSON
JSON：**JavaScript Object Notation**，JS 对象表示法。
是一种**轻量级、文本格式**，用来数据传输（前后端交互最常用）。

> ✅ JSON 不是 JS 对象！
> JSON 是**字符串**，是独立的数据格式，很多语言都能解析（Python/Java/Go等）。

## 2. JSON 语法规则（
1. 顶层只能是 **对象 `{}`** 或者 **数组 `[]`**
2. 键名（key）**必须使用双引号 `"`**，不能单引号、不能不加引号
3. 值支持的类型只有 6 种：
   - 字符串：`"hello"`（必须双引号）
   - 数字：`10`、`3.14`
   - 布尔：`true` / `false`（小写）
   - null：`null`（小写，不是 NULL、undefined）
   - 对象：`{...}`
   - 数组：`[...]`
4. ❌ JSON 不支持：
   - 函数 function
   - undefined
   - 注释 `//` 、`/* */`
   - 单引号字符串
   - 末尾多余逗号

✅ 合法 JSON 示例
```json
{
  "name": "张三",
  "age": 18,
  "isStudent": true,
  "hobby": ["打球", "看书"],
  "address": {
      "province" : "广东省",
    "city": "深圳",
      "zipCode" : "562312",
      ""
  },
  "remark": null
}
```

❌ 错误写法举例

```
{
  name: "张三",
  'age': 18,
  "say": function(){},
  "a": undefined,
  "list": [1,2,3,]
}
```

错误点说明：

1. `name: "张三"` → key没有双引号（非法）
2. `'age': 18` → key使用单引号（非法）
3. `"say": function(){}` → JSON不支持函数（非法）
4. `"a": undefined` → JSON不支持undefined（非法）
5. `"list": [1,2,3,]` → 数组末尾多余逗号（非法）

## 3. JSON 和 JS 对象的区别

| 对比项 | JSON                      | JS 对象                        |
| ------ | ------------------------- | ------------------------------ |
| 本质   | 字符串                    | 引用类型对象                   |
| key    | 必须双引号                | 单引号、双引号、不加引号都可以 |
| 值     | 不能函数、undefined、注释 | 可以函数、undefined、正则等    |
| 跨语言 | 所有语言通用              | 只有JS识别                     |

JS 对象字面量：

```
const obj = {
  name: "张三",
  age: 18
}
```

JSON字符串：

```
const jsonStr = '{"name":"张三","age":18}'
```

## 4. JS 中两个核心API

### JSON.stringify() 👉 JS对象 → JSON字符串（序列化）

```
const obj = { name:"张三", age:18 }
const str = JSON.stringify(obj)
console.log(str)
// 输出：{"name":"张三","age":18}
```

> 用途：传给后端、存 localStorage

### JSON.parse() 👉 JSON字符串 → JS对象（反序列化）

```
const str = '{"name":"张三","age":18}'
const obj = JSON.parse(str)
console.log(obj.name) // 张三
```

> 用途：拿到后端返回的字符串，转成对象方便取值

⚠️ 注意：`JSON.parse` 传入的字符串**必须严格符合JSON规范**，格式错直接抛异常。

## 5. 练习

```
<script>
// 1. JS对象
const user = {
  username: "lisi",
  password: "123456",
  sex: "男"
}
// 对象转JSON字符串
const json = JSON.stringify(user)
console.log('json字符串：', json)

// JSON字符串转回对象
const userObj = JSON.parse(json)
console.log('转回对象：', userObj)
console.log(userObj.username)
</script>
```

---

## 动手练习与验收标准

> 素材出处：`lessons/frontend/json.md` 第 2、4、5 节

### 练习 1：判断合法 JSON 与非法 JSON

把课件中的“合法 JSON 示例”和“错误写法举例”分别存为 `ok.json`、`bad.json`，在浏览器控制台用 `JSON.parse` 校验。

```json
{
  "name": "张三",
  "age": 18,
  "isStudent": true,
  "hobby": ["打球", "看书"],
  "address": {
      "province" : "广东省",
    "city": "深圳",
      "zipCode" : "562312"
  },
  "remark": null
}
```

```javascript
{
  name: "张三",
  'age': 18,
  "say": function(){},
  "a": undefined,
  "list": [1,2,3,]
}
```

**验收标准**

- `JSON.parse(okJsonString)` 返回对象，`obj.name` 为 `张三`，`obj.address.city` 为 `深圳`。
- 对 `bad.json` 的内容执行 `JSON.parse`，控制台抛出 `SyntaxError`，提示位置指向第一个非法 token。
- `JSON.parse('{"a": undefined}')` 抛异常，`JSON.parse('{"a": null}')` 正常返回 `{a: null}`。
- `JSON.parse('{"list":[1,2,3,]}')` 抛异常，去掉末尾逗号后解析成功。

### 练习 2：stringify 与 parse 往返

使用课件第 5 节练习代码，在 HTML 的 `<script>` 中执行。

```html
<script>
// 1. JS对象
const user = {
  username: "lisi",
  password: "123456",
  sex: "男"
}
// 对象转JSON字符串
const json = JSON.stringify(user)
console.log('json字符串：', json)

// JSON字符串转回对象
const userObj = JSON.parse(json)
console.log('转回对象：', userObj)
console.log(userObj.username)
</script>
```

**验收标准**

- 控制台第一条输出 `json字符串： {"username":"lisi","password":"123456","sex":"男"}`（键名全部带双引号）。
- 第二条输出 `转回对象： {username: 'lisi', password: '123456', sex: '男'}`。
- 第三条输出 `lisi`。
- 在控制台执行 `typeof json` 得到 `string`，执行 `typeof userObj` 得到 `object`。

### 练习 3：JSON.parse 的严格性与异常处理

基于课件“格式错直接抛异常”的结论，用 `try/catch` 分别验证三种非法输入。

```html
<script>
const cases = [
  '{name:"张三"}',        // key 没有双引号
  "{'age':18}",           // key 使用单引号
  '{"say":function(){}}'  // JSON 不支持函数
]

for (const text of cases) {
  try {
    JSON.parse(text)
    console.log('意外解析成功：', text)
  } catch (e) {
    console.log('解析失败：', e.name)
  }
}

// 合法输入
try {
  const obj = JSON.parse('{"name":"张三","age":18}')
  console.log('合法解析：', obj.name, obj.age)
} catch (e) {
  console.log('合法输入不应失败：', e)
}
</script>
```

**验收标准**

- 控制台连续输出三条 `解析失败： SyntaxError`，且没有任何一条 `意外解析成功`。
- 合法输入分支输出 `合法解析： 张三 18`。
- 把第一条改成 `'{"name":"张三"}'` 后重跑，该条不再进入 catch，输出解析成功的结果。
- 整个循环执行完毕，页面不出现未捕获异常（控制台无红色报错堆栈）。

