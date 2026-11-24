## 阶段导读

企业里的 AI 系统很少是纯 Python。真实架构通常是：Python 负责模型推理与 RAG，Java 负责用户、权限、租户、计费、审计与开放接口。面试时只会说“我会调大模型”，天花板是外包；能说清“权限怎么设计、事务怎么保证、服务怎么拆分”，才进得了中台团队。

这五周先把 Java 语言拿下，再学 Maven 组织工程、SpringBoot 写服务、SpringMVC 写接口、MyBatis-Plus 做数据访问，最后落地一个带 RBAC/ACL 的智能体中台。Java 的代码量比 Python 大，但换来的是强类型、成熟的权限生态和可维护的工程结构。

学完你能做到：独立搭一个 SpringBoot3 服务，写规范的 RESTful 接口与参数校验，用 MyBatis-Plus 完成复杂条件查询与分页，用 Spring Security 做多级权限，用 Flyway 管理表结构，并用 Docker 部署上线。

最容易踩的五个坑：

1. **Controller 里写业务**。接口层只负责收参数、调 Service、返回结果，否则事务、复用、测试全乱。
2. **只用 `@Autowired` 字段注入**。构造器注入才能声明 `final`、才能脱离 Spring 写单测。
3. **MyBatis 在循环里查库**。列表 20 条查 20 次，接口必然超时，要用关联查询或批量 in。
4. **事务加了却不生效**。同类内部调用、非 public 方法、异常被吞，都会让 `@Transactional` 失效；**权限只做前端隐藏按钮**则等于没有权限。
5. **直接返回实体类**。password、内部字段一起吐给前端，统一用 VO 转换。

<div class="callout plain"><span class="tag">大白话</span>
<p>SpringBoot 像<b>精装房拎包入住</b>：引入一个 starter，相当于告诉它“我要 Web + 数据库”，它就把常用组件按默认配置装好；你不满意的地方（端口、数据源、日志）再改装修方案。</p>
<p>这就是“约定优于配置”：<b>默认能跑，需要时再覆盖</b>。所以排查问题的第一步往往不是改代码，而是搞清楚“它默认帮我做了什么”。</p>
</div>

## 教学路径

<div class="callout path"><span class="tag">教学路径</span>
<ol class="path-steps">
<li><b>第 1 步（6 天）：</b>Java 核心语法、面向对象、接口与泛型、集合、异常、Stream。产出：能独立读懂并改写一段 Spring 业务代码。</li>
<li><b>第 2 步（3 天）：</b>Maven 坐标、依赖范围、传递依赖、聚合与继承、多模块构建。产出：四模块工程一条命令打全部包。</li>
<li><b>第 3 步（4 天）：</b>SpringBoot 基础、自动配置、场景启动器、自定义启动器、日志、Actuator、多环境。产出：可切换环境并暴露健康检查的服务。</li>
<li><b>第 4 步（4 天）：</b>SpringMVC 核心组件、RESTful、参数校验、全局异常、拦截器。产出：统一返回结构与错误码规范的接口。</li>
<li><b>第 5 步（4 天）：</b>三层架构、MyBatis 多表查询与动态 SQL、分页、逻辑删除、MyBatis-Plus Wrapper 与插件。产出：完整数据访问层。</li>
<li><b>第 6 步（8 天）：</b>项目二智能体中台：RBAC/ACL、FAQ、会话审计、Qdrant、OpenAI 兼容协议、Flyway。产出：可演示的权限化知识库平台。</li>
<li><b>第 7 步（3 天）：</b>微服务核心：Nacos、OpenFeign、Gateway、Sentinel 与流控降级。产出：一次跨服务调用的完整链路。</li>
<li><b>第 8 步（2 天）：</b>考试四与项目答辩，讲清每个技术选型。产出：能回答“为什么这么设计”。</li>
</ol>
</div>

## 学习前准备

**前置知识**：任意一门语言的编程基础（Python 即可）、HTTP 与 JSON、MySQL 基本增删改查。不需要提前学 Java 语法，但要有“编译型语言”的心理准备：类型、包名、分号都不能省。

| 软件 | 建议版本 | 用途 | 说明 |
|-|-|-|-|
| JDK | 17（LTS） | 运行环境 | SpringBoot 3 最低要求 17 |
| Maven | 3.9.x | 构建工具 | 配阿里云镜像，否则拉依赖极慢 |
| IntelliJ IDEA | 2023+ | 开发工具 | 社区版够用 |
| MySQL / PostgreSQL | 8.0 / 16 | 业务库 | 字符集 utf8mb4 |
| Redis | 7.2 | 缓存与会话 | 用 Docker 起 |
| Nacos | 2.3.x | 注册与配置中心 | 微服务阶段用 |
| Qdrant | 1.9 | 向量库 | Docker 一条命令 |

**三道自测题**：

1. `List<String> list = new ArrayList<>();` 里第二个尖括号为什么可以留空？答不出说明还不熟悉泛型，先看模块 1。
2. 一个 Maven 项目 `pom.xml` 里写了 `<parent>`，它给你带来了什么？答不出说明没理解继承，先看模块 2。
3. 接口返回 400 和 500 分别代表什么？参数校验失败应该返回哪个？答不出说明还没建立 HTTP 语义意识。

## 模块精讲

### 模块1：后端技术（Java 核心语法与面向对象）

**解决什么问题**：看懂 Spring 生态的代码。框架里到处是接口、泛型、注解、Lambda，语言基础不牢，读源码和改业务都会卡住。

| 概念 | 一句话解释 | 在 Spring 项目里的影子 |
|-|-|-|
| 类与对象 | 类是模板，对象是实例 | `@Service` 标注的类由 Spring 创建对象 |
| 多态 | 同一接口不同实现 | 注入 `Answerer`，实际是 `RagAnswerer` |
| 接口 | 只定义能力不写实现 | Mapper 是接口，MyBatis 生成代理实现 |
| 泛型 | 编译期类型约束 | `ApiResult<T>`、`List<KbDoc>` |
| 集合与 Stream | 批量数据处理 | 查询结果过滤、分组、转 Map |
| 异常 | 出错中断并向上抛 | 业务异常交给全局异常处理器 |
| record | 不可变数据载体 | 请求体、返回体，少写样板代码 |

```java
// 1. 接口定义能力，实现类可替换 —— 这是 Spring 依赖注入的基础
public interface Answerer {
    String answer(String question);
}

// 2. record：不可变返回体，自动生成构造器、访问器与 equals
public record ApiResult<T>(int code, String msg, T data) {
    public static <T> ApiResult<T> ok(T data) {
        return new ApiResult<>(0, "ok", data);
    }
}

// 3. 实现类：final 字段 + Stream + 异常，都是业务里最常见的写法
public class RagAnswerer implements Answerer {
    private final List<String> contexts;

    public RagAnswerer(List<String> contexts) { this.contexts = contexts; }

    @Override
    public String answer(String question) {
        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException("问题不能为空");   // 快速失败
        }
        return contexts.stream()
                .filter(c -> c != null && !c.isBlank())          // 过滤脏数据
                .limit(3)                                        // 只取前 3 段
                .map(c -> "[" + c + "]")
                .reduce("", String::concat);                     // 拼成上下文
    }
}
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `interface Answerer` | 抽象能力 | 上层只依赖接口，换实现不改调用方 |
| `record ApiResult<T>` | 统一返回结构 | 不可变、自动生成 equals/hashCode，适合 DTO |
| `private final` | 封装 + 不可变 | 避免运行期被改，天然线程安全 |
| `stream().filter().limit()` | 集合处理 | 链式表达业务意图，比 for 循环易读 |
| `IllegalArgumentException` | 参数快速失败 | 由全局异常处理器统一转成 400 |
| 多态赋值 | 解耦 | `Answerer` 指向实现，是 Spring 注入的雏形 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>用 == 比较字符串</b>：比的是引用地址，必须用 <code>equals</code> 或 <code>Objects.equals</code>。</li>
<li><b>把可变对象当 Map 的 key</b>：hash 变化后永远查不到，key 要用不可变类型。</li>
<li><b>只捕获 Exception 不处理</b>：吞掉异常会让事务无法回滚，日志也查不到根因。</li>
<li><b>泛型用原始类型</b>：<code>List</code> 不写泛型，取出来全是 Object，编译期检查白做。</li>
</ul>
</div>

### 模块2：Maven

**解决什么问题**：一个项目几十个第三方包，手动下载 jar 会疯。Maven 负责依赖下载、版本冲突、编译打包、多模块组织。

| 概念 | 含义 | 实务要点 |
|-|-|-|
| 坐标 GAV | groupId + artifactId + version | 唯一定位一个构件 |
| 依赖范围 scope | compile / test / provided / runtime | 测试依赖不要污染运行时 |
| 传递依赖 | A 依赖 B，B 依赖 C | 会自动带入，也带来冲突 |
| 依赖调解 | 路径最短优先，同长先声明 | 冲突用 `exclusions` 或统一锁定版本 |
| 聚合 | 父工程一次构建全部子模块 | `<modules>` 列表 |
| 继承 | 子模块继承父配置与版本 | 版本统一在父 `dependencyManagement` |
| 生命周期 | clean → compile → test → package → install → deploy | 执行后面阶段会自动执行前面阶段 |

```xml
<!-- 父工程 pom.xml：只做版本管理，不写具体依赖 -->
<project>
  <groupId>com.zhanggui</groupId>
  <artifactId>agent-platform</artifactId>
  <version>1.0.0</version>
  <packaging>pom</packaging>

  <modules>
    <module>common</module>
    <module>security</module>
    <module>knowledge</module>
    <module>app</module>
  </modules>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.5</version>
  </parent>

  <properties>
    <java.version>17</java.version>
  </properties>
</project>
```

```bash
mvn clean package -DskipTests             # 全量打包
mvn -pl knowledge -am package             # 只打 knowledge 及其依赖模块
mvn dependency:tree -Dverbose > tree.txt  # 冲突分析，看 omitted for conflict
mvn install -DskipTests                   # 装到本地仓库供其他项目引用
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `packaging=pom` | 父工程不产出 jar | 它只负责管理与聚合 |
| `<parent>` | 继承 SpringBoot 版本 | 不用逐个指定 Spring 组件版本 |
| `<modules>` | 聚合构建 | 一条命令按依赖顺序构建全部模块 |
| `dependencyManagement` | 集中锁版本 | 子模块不写 version，避免版本漂移 |
| `-pl ... -am` | 增量构建 | 改一个模块不必全量打包 |
| `dependency:tree` | 依赖诊断 | 冲突、重复、漏洞都从这里查 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>子模块循环依赖</b>：A 依赖 B、B 又依赖 A，Maven 直接报错；抽公共 module 打破环。</li>
<li><b>到处写 version</b>：升级时改几十处，统一放 <code>dependencyManagement</code>。</li>
<li><b>把 test 依赖写成 compile</b>：JUnit、Mockito 被打进生产包。</li>
<li><b>仓库没配镜像</b>：拉依赖几分钟起步，settings.xml 加阿里云 mirror。</li>
<li><b>pom 改了没刷新</b>：IDE 报错但能编译，点 Maven 的 Reload 即可。</li>
</ul>
</div>

### 模块3：SpringBoot AI 服务后端开发

**解决什么问题**：把模型能力包装成稳定、可鉴权、可观测的 HTTP 服务，供前端、App、其他系统调用。

```text
浏览器/前端 → Nginx → SpringBoot(Controller → Service → Mapper) → MySQL / Redis / 向量库
                                    ↓
                              全局异常处理器 → 统一 JSON 返回
```

静态资源（`resources/static`、`templates`）由 SpringBoot 直接返回，接口资源（`/api/**`）走 Controller。生产环境通常把静态资源交给 Nginx，Java 只提供接口。

**Spring 与 SpringBoot**：Spring 提供 IoC（对象由容器创建）与 AOP（切面增强）；SpringBoot 加了自动配置、起步依赖、内嵌容器。`@SpringBootApplication` 等于 `@SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan`。

**自动配置原理（面试高频）**：启动时读取依赖 jar 里的 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`，按 `@ConditionalOnClass`、`@ConditionalOnMissingBean`、`@ConditionalOnProperty` 决定装配哪些 Bean；你定义了同类型 Bean，它就退让。**场景启动器**如 `starter-web` 把一组依赖打包；**自定义启动器**则是 autoconfigure 模块（放配置类与 imports 文件）+ starter 模块（只做依赖聚合）。

```xml
<!-- pom.xml：按需引入 starter，不要贪多 -->
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>   <!-- 参数校验 -->
  </dependency>
  <dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
    <version>3.5.7</version>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>     <!-- 健康检查 -->
  </dependency>
</dependencies>
```

```yaml
# application.yml：公共配置 + 多环境
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}     # 部署时用环境变量覆盖
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/agent?useUnicode=true&characterEncoding=utf8
    username: ${DB_USER:root}
    password: ${DB_PASSWORD:root}             # 密码走环境变量，禁止写死提交

server:
  port: 8080                                  # 优雅停机见 server.shutdown=graceful

management.endpoints.web.exposure.include: health,info   # 只暴露必要端点
logging.file.name: logs/agent-platform.log              # 生产用 logback-spring.xml 做滚动
logging.level.com.zhanggui: debug
```

```java
// 启动类：部署时打 jar 后 java -jar 即可，无需外置 Tomcat
@SpringBootApplication
public class AgentApplication {
    public static void main(String[] args) { SpringApplication.run(AgentApplication.class, args); }
}

// 接口层：只做参数接收、校验、调用、返回
@RestController
@RequestMapping("/api/docs")
@Validated
public class KbDocController {

    private final KbDocService docService;

    public KbDocController(KbDocService docService) {   // 构造器注入，字段可 final
        this.docService = docService;
    }

    @GetMapping("/{id}")
    public ApiResult<KbDocVO> detail(@PathVariable Long id) {
        return ApiResult.ok(docService.getDetail(id));
    }

    @PostMapping
    public ApiResult<Long> create(@RequestBody @Valid KbDocCreateReq req) {
        return ApiResult.ok(docService.create(req));
    }

    // record + 校验注解，非法入参直接 400
    public record KbDocCreateReq(
            @NotBlank(message = "标题不能为空") String title,
            @NotNull(message = "租户不能为空") Long tenantId,
            @Size(max = 100_000, message = "正文过长") String content) {}
}

// 统一异常出口，避免把堆栈返回给前端
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResult<Void> handleValid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage).findFirst().orElse("参数错误");
        return new ApiResult<>(400, msg, null);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResult<Void> handleOther(Exception e, HttpServletRequest req) {
        log.error("未捕获异常 uri={}", req.getRequestURI(), e);   // 日志留全栈
        return new ApiResult<>(500, "服务异常，请稍后重试", null);
    }
}

// 拦截器：轻量校验放这里，复杂鉴权交给 Spring Security
@Component
public class AuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse resp, Object handler) {
        if (req.getRequestURI().startsWith("/api/auth/")) return true;   // 登录放行
        String token = req.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new BusinessException(401, "未登录");    // 交给全局异常处理
        }
        return true;
    }
}
```

**MyBatis 与 MyBatis-Plus 的分工**：MyBatis 管“SQL 我自己写”（多表关联、复杂统计）；MyBatis-Plus 管“单表增删改查不用写”。Mapper 继承 `BaseMapper<T>` 获得通用方法，复杂 SQL 仍写在 XML 里。

```java
// 实体：@TableLogic 让查询自动加 deleted=0，删除改为 update
@Data
@TableName("kb_doc")
public class KbDoc {
    @TableId(type = IdType.AUTO) private Long id;
    private Long tenantId; private String title;
    @TableLogic private Integer deleted;
}

// Mapper：继承 BaseMapper 即拥有 selectById / insert / updateById
public interface KbDocMapper extends BaseMapper<KbDoc> {
    List<DocStatVO> selectDocStats(@Param("tenantId") Long tenantId);
}

// 插件：分页必须注册，否则 Page 参数被忽略
@Configuration
public class MybatisPlusConfig {
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor i = new MybatisPlusInterceptor();
        i.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        i.addInnerInterceptor(new BlockAttackInnerInterceptor());  // 拦截全表 update/delete
        return i;
    }
}
```

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `spring.profiles.active` | 多环境切换 | 部署时用环境变量覆盖，不改代码 |
| `@Valid` + record | 入参校验 | 校验失败抛异常，由统一出口转 400 |
| `@RestControllerAdvice` | 全局异常 | 一处处理所有接口错误，返回结构一致 |
| `@TableLogic` | 逻辑删除 | 数据可追溯，但唯一索引要注意冲突 |
| `PaginationInnerInterceptor` | 分页 | 不注册插件，`Page` 参数会被忽略 |
| `BlockAttackInnerInterceptor` | 防全表更新 | 漏写 where 的 update 直接抛异常 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>Controller 里写业务与事务</b>：事务放 Service 的 public 方法，接口层只管协议转换。</li>
<li><b>@Transactional 同类调用</b>：this 调用不走代理，事务失效；拆到另一个 Bean。</li>
<li><b>异常被 catch 后不抛</b>：默认只对 RuntimeException 回滚，吞异常等于不回滚。</li>
<li><b>Actuator 全量暴露</b>：<code>include: "*"</code> 会暴露 env、heapdump，只开 health。</li>
<li><b>直接返回实体类 / MyBatis 循环查库</b>：前者泄漏敏感字段，后者 20 条查 20 次，用 VO + 批量 in。</li>
</ul>
</div>

### 模块4：项目二：智能体中台

**解决什么问题**：多个团队各自接大模型，Key 分散、成本失控、数据越权、出问题查不到记录。中台统一收口：一套账号体系、一套知识库、一套审计，对外暴露 OpenAI 兼容协议。

```text
管理端(Vue3) → SpringBoot3 中台(鉴权/租户/知识库/会话/审计)
                     ├── MySQL/PostgreSQL：用户、角色、文档元数据、会话日志
                     ├── Redis：登录态、限流、热点缓存
                     ├── Qdrant：向量检索
                     └── OpenAI 兼容模型服务（可换厂商）
```

| 模型 | 授权对象 | 例子 | 适合控制 |
|-|-|-|-|
| RBAC | 角色 | “知识库管理员”可上传文档 | 功能入口、菜单、操作按钮 |
| ACL | 具体资源 | 文档 A 只允许张三、法务部查看 | 单篇文档、知识库可见范围 |

企业知识库通常两者叠加：RBAC 控制“能不能进管理页”，ACL 控制“能看哪些文档”。**权限校验必须发生在服务端**，前端隐藏按钮只是体验优化。

```java
// 无状态 JWT + 角色校验
@Configuration
@EnableWebSecurity
@EnableMethodSecurity                     // 开启 @PreAuthorize
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtFilter) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)                  // 前后端分离靠 token
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/actuator/health").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")   // 功能级 RBAC
                .anyRequest().authenticated())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }  // 永不存明文
}

// 资源级 ACL：subject 可以是用户 id，也可以是部门 id
@Service
public class KbDocAclService {
    private final KbDocAclMapper aclMapper;
    public KbDocAclService(KbDocAclMapper m) { this.aclMapper = m; }
    public boolean canRead(Long docId, Long userId, Long deptId) {
        return aclMapper.countByDocAndSubject(docId, userId, deptId) > 0;
    }
}
```

**Flyway 管理表结构**：建表、改表都写成 `V1__init.sql`、`V2__add_acl.sql` 放进 `resources/db/migration`，启动时自动执行并记录到 `flyway_schema_history`。禁止手改生产库，否则下一个人无法复现环境。

```sql
-- V1__init.sql（节选，完整表见综合实战）
CREATE TABLE sys_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(64) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,          -- BCrypt 密文
  dept_id BIGINT, deleted TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sys_role (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, code VARCHAR(32) NOT NULL UNIQUE,  -- ADMIN / KB_EDITOR / USER
  name VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sys_user_role (   -- 用户-角色关联表（多对多）
  user_id BIGINT NOT NULL, role_id BIGINT NOT NULL, PRIMARY KEY (user_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**模型与向量库接入**：模型侧只要兼容 OpenAI 的 `/v1/chat/completions` 协议，中台就能一处适配、多处切换（本地 vLLM、云厂商、私有化模型）。向量库选 Qdrant，collection 按租户隔离，检索时必须带 `tenant_id` 过滤，否则串数据。

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `STATELESS` | 无状态鉴权 | 中台多实例，不能依赖本地 session |
| `hasRole("ADMIN")` | 功能级权限 | 粗粒度入口，配合方法级注解更细 |
| `@EnableMethodSecurity` | 方法级鉴权 | `@PreAuthorize` 可做资源级判断 |
| ACL 先算可见集合 | 数据级权限 | 先过滤再检索，避免“查到但无权看” |
| `BCryptPasswordEncoder` | 密码哈希 | 加盐慢哈希，防彩虹表 |
| Flyway 版本脚本 | 表结构可追溯 | 环境可重建，上线有据可查 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>只在前端隐藏菜单</b>：接口裸奔，改个请求就能越权，服务端必须校验。</li>
<li><b>租户字段漏加</b>：查询忘带 tenant_id，A 公司看到 B 公司数据，这是最严重的事故。</li>
<li><b>检索后再过滤权限</b>：top 10 全是无权文档，用户得到空结果；应先限定候选集。</li>
<li><b>手改生产表结构 / 审计只记成功</b>：前者让 Flyway 校验失败，后者导致越权无法追溯。</li>
</ul>
</div>

### 模块5：微服务核心

**解决什么问题**：单体中台越来越大，团队并行开发互相阻塞，某个模块流量高只能整体扩容。微服务按业务拆开，各自部署、独立扩容，但带来注册发现、远程调用、网关、流控等新问题。

| 演进阶段 | 形态 | 问题 |
|-|-|-|
| 单体 | 一个 jar | 耦合高、发布慢、无法按模块扩容 |
| 垂直拆分 | 按业务拆几个应用 | 重复代码多、调用靠硬编码地址 |
| 服务化 | 注册中心 + RPC | 需要治理：超时、重试、熔断 |
| 微服务 | 容器 + 网关 + 配置中心 | 运维复杂，要有可观测性 |

| 组件 | 职责 | 一句话 |
|-|-|-|
| Nacos | 注册 + 配置中心 | 服务上线自动登记，配置热更新 |
| OpenFeign | 声明式 HTTP 调用 | 写接口 + 注解就能调远程服务 |
| Gateway | 统一入口 | 路由、鉴权、限流、跨域 |
| Sentinel | 流控与熔断 | 按 QPS 限流、慢调用降级 |

```yaml
# rag-service 的 application.yml：注册到 Nacos
spring:
  application:
    name: rag-service
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
      config:
        server-addr: 127.0.0.1:8848
        file-extension: yaml
```

```java
// 声明式调用：像调本地方法一样调远程
@FeignClient(name = "rag-service", fallbackFactory = RagFallbackFactory.class)
public interface RagClient {
    @PostMapping("/internal/retrieve")
    List<ChunkVO> retrieve(@RequestBody RetrieveReq req);

    record RetrieveReq(String question, Long tenantId, int topK) {}
}

// 降级：远程服务挂了也要给用户可解释的结果
@Component
class RagFallbackFactory implements FallbackFactory<RagClient> {
    @Override
    public RagClient create(Throwable cause) {
        return req -> List.of();           // 返回空上下文，由上层提示“暂时无法检索”
    }
}

// Sentinel 保护模型调用
@RestController
public class AgentController {

    @SentinelResource(value = "agentAsk",
            blockHandler = "onBlocked",     // 被限流走这里
            fallback = "onError")           // 业务异常走这里
    @PostMapping("/api/ask")
    public ApiResult<String> ask(@RequestBody AskReq req) {
        return ApiResult.ok(agentService.ask(req.question()));
    }

    public ApiResult<String> onBlocked(AskReq req, BlockException e) {
        return new ApiResult<>(429, "当前咨询人数较多，请稍后再试", null);
    }

    public ApiResult<String> onError(AskReq req, Throwable t) {
        return new ApiResult<>(503, "服务暂时不可用", null);
    }
}
```

**QPS 分析与优化**：先压测拿到单实例 QPS，再算实例数 = 峰值 QPS / 单实例 QPS × 1.5 余量。模型调用是瓶颈时，优化顺序是：缓存（相同问题直接返回）→ 限流（保护后端）→ 异步化（SSE/队列）→ 扩容。Sentinel 规则要按接口设，不要全局限一个阈值。

#### 代码解析

| 片段 | 作用 | 为什么这样写 |
|-|-|-|
| `spring.application.name` | 服务名 | Nacos 注册与 Feign 调用都用它 |
| `@FeignClient` | 远程调用 | 接口 + 注解，省掉手写 HTTP 客户端 |
| `fallbackFactory` | 降级 | 能拿到异常原因，返回差异化提示 |
| `@SentinelResource` | 资源埋点 | blockHandler 处理限流，fallback 处理异常 |
| 按接口设阈值 | 精细流控 | 检索接口和登录接口承受能力完全不同 |

#### 常见坑

<div class="callout warn"><span class="tag">易错点</span>
<ul>
<li><b>一开始就拆十个服务</b>：分布式事务、链路追踪、联调成本会把进度拖垮，先模块化再服务化。</li>
<li><b>Feign 不配超时</b>：默认超时很长，下游卡住会拖死调用方线程池；重试只用于幂等查询。</li>
<li><b>Sentinel 降级返回 null</b>：前端拿到 null 直接报错，要返回统一结构。</li>
<li><b>网关与 Nginx 都做鉴权</b>：两套逻辑不一致，鉴权只放一层。</li>
</ul>
</div>

## 综合实战

**目标**：实现“知识库文档分页查询 + 问答”完整链路，覆盖建表、动态 SQL、多表统计、Service 事务、Redis 缓存、参数校验与统一异常。

**第 1 步：建表**。逻辑删除字段 `deleted`、租户字段 `tenant_id` 是每张业务表的基础。

```sql
-- V2__kb.sql
CREATE TABLE kb_doc (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, tenant_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL, content MEDIUMTEXT,
  status TINYINT DEFAULT 1 COMMENT '1待解析 2已入库 3失败',
  deleted TINYINT DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_tenant_created (tenant_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE kb_chunk (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, doc_id BIGINT NOT NULL,
  page_no INT, content TEXT NOT NULL, deleted TINYINT DEFAULT 0,
  KEY idx_doc (doc_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE chat_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, tenant_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL, question VARCHAR(500) NOT NULL, answer TEXT,
  doc_ids VARCHAR(500) COMMENT '命中文档 id，逗号分隔',
  cost_ms INT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_tenant_time (tenant_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**第 2 步：多表统计 + 动态 SQL**。复杂查询写在 XML，不硬塞 Wrapper。

```xml
<!-- KbDocMapper.xml -->
<select id="selectPageWithChunkCount" resultType="com.zhanggui.kb.vo.KbDocVO">
    SELECT d.id, d.title, d.status, d.created_at,
           COUNT(c.id) AS chunkCount          <!-- 多表聚合 -->
    FROM kb_doc d
    LEFT JOIN kb_chunk c ON c.doc_id = d.id AND c.deleted = 0
    WHERE d.deleted = 0 AND d.tenant_id = #{tenantId}
    <if test="keyword != null and keyword != ''">
        AND d.title LIKE CONCAT('%', #{keyword}, '%')   <!-- 动态 SQL -->
    </if>
    <if test="status != null">
        AND d.status = #{status}
    </if>
    GROUP BY d.id, d.title, d.status, d.created_at
    ORDER BY d.created_at DESC
    LIMIT #{offset}, #{size}
</select>

<select id="countByCondition" resultType="long">
    SELECT COUNT(*) FROM kb_doc
    WHERE deleted = 0 AND tenant_id = #{tenantId}
    <if test="keyword != null and keyword != ''">
        AND title LIKE CONCAT('%', #{keyword}, '%')
    </if>
</select>
```

**第 3 步：Service**。事务只包数据库写操作，模型调用不要放进事务，否则长事务锁表。

```java
@Service
public class KbDocService {

    private final KbDocMapper docMapper;
    private final ChatLogMapper chatLogMapper;
    private final RagClient ragClient;
    private final StringRedisTemplate redis;

    public KbDocService(KbDocMapper docMapper, ChatLogMapper chatLogMapper,
                        RagClient ragClient, StringRedisTemplate redis) {
        this.docMapper = docMapper; this.chatLogMapper = chatLogMapper;
        this.ragClient = ragClient; this.redis = redis;
    }

    public PageResult<KbDocVO> page(Long tenantId, String keyword, Integer status, int page, int size) {
        int offset = (page - 1) * size;
        List<KbDocVO> list = docMapper.selectPageWithChunkCount(tenantId, keyword, status, offset, size);
        long total = docMapper.countByCondition(tenantId, keyword);   // 总数单独查
        return new PageResult<>(list, total, page, size);
    }

    /** 问答：缓存 → 检索 → 生成 → 记审计 */
    public String ask(Long tenantId, Long userId, String question) {
        String key = "chat:ans:" + tenantId + ":" + DigestUtils.md5DigestAsHex(question.getBytes());
        String cached = redis.opsForValue().get(key);
        if (cached != null) return cached;

        long start = System.currentTimeMillis();
        List<ChunkVO> chunks = ragClient.retrieve(
                new RagClient.RetrieveReq(question, tenantId, 5));   // 远程检索
        String answer = agentService.generate(question, chunks);      // 调模型生成

        redis.opsForValue().set(key, answer, Duration.ofMinutes(10)); // 缓存 10 分钟
        saveLog(tenantId, userId, question, answer, chunks, (int) (System.currentTimeMillis() - start));
        return answer;
    }

    @Transactional(rollbackFor = Exception.class)   // 写库单独事务
    protected void saveLog(Long tenantId, Long userId, String q, String a,
                           List<ChunkVO> chunks, int cost) {
        ChatLog log = new ChatLog();
        log.setTenantId(tenantId); log.setUserId(userId);
        log.setQuestion(q); log.setAnswer(a); log.setCostMs(cost);
        log.setDocIds(chunks.stream().map(c -> c.docId().toString()).collect(Collectors.joining(",")));
        chatLogMapper.insert(log);
    }
}
```

**第 4 步：Controller**。租户与用户 id 由网关注入，绝不信任前端传值。

```java
@RestController
@RequestMapping("/api/kb/docs")
@Validated
public class KbDocController {

    private final KbDocService service;

    public KbDocController(KbDocService service) { this.service = service; }

    @GetMapping
    public ApiResult<PageResult<KbDocVO>> page(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "10") @Max(100) int size,
            @RequestParam(required = false) String keyword,
            @RequestHeader("X-Tenant-Id") Long tenantId) {
        return ApiResult.ok(service.page(tenantId, keyword, null, page, size));
    }

    @PostMapping("/ask")
    public ApiResult<String> ask(@RequestBody @Valid AskReq req,
                                 @RequestHeader("X-User-Id") Long userId,
                                 @RequestHeader("X-Tenant-Id") Long tenantId) {
        return ApiResult.ok(service.ask(tenantId, userId, req.question()));
    }

    public record AskReq(@NotBlank(message = "问题不能为空")
                         @Size(max = 500, message = "问题过长") String question) {}
}
```

**第 5 步：验证**。`/actuator/health` 返回 UP 即通；分页与参数校验用浏览器或 curl 各调一次。

#### 综合实战逐段解析

| 步骤 | 关键动作 | 为什么这样做 |
|-|-|-|
| 建表 | `tenant_id` + `deleted` | 多租户隔离与逻辑删除是业务表地基 |
| SQL | LEFT JOIN 聚合 + 独立 count | 一条 SQL 拿列表与切片数；总数不能用 limit 后的结果算 |
| Service | 事务只包 `saveLog`，缓存 key 带租户 | 长事务锁表；缓存不带租户会串答案 |
| Controller | `@Min/@Max` + 网关注入租户 | 防大分页拖库，前端传值不可信 |

<div class="callout tip"><span class="tag">老师建议</span>
<p>面试讲这个项目时，重点说三件事：<b>权限在哪一层校验、事务边界怎么划、慢查询怎么优化</b>。把这三条讲清楚，比罗列十个框架名字更有说服力。</p>
</div>

## 疑难点分级

| 知识点 | 难度 | 典型卡点 | 破解方式 |
|-|-|-|-|
| Java 泛型与集合 | 中 | 取出来要强转、编译警告 | 声明时写全泛型，返回 List 而非数组 |
| Maven 依赖冲突 | 高 | 启动报 NoSuchMethodError | `dependency:tree` 找重复版本并统一 |
| 聚合与继承 | 中 | 子模块找不到父配置 | 父工程 packaging=pom，子模块写 parent |
| 自动配置原理 | 高 | 面试问“怎么生效的”答不出 | 记 imports 文件 + 条件注解 |
| 自定义 starter | 高 | 写了不生效 | autoconfigure + starter 两模块，检查 imports |
| 参数校验 | 中 | 注解不生效 | 类上加 `@Validated`，参数加 `@Valid` |
| 全局异常处理 | 中 | 校验异常没被捕获 | 单独处理 MethodArgumentNotValidException |
| 拦截器与过滤器 | 高 | 分不清执行顺序 | Filter 在 Servlet 层，Interceptor 在 MVC 层 |
| 事务失效 | 高 | 加了注解却没回滚 | 查同类调用、非 public、异常被吞、引擎 |
| 多表查询 | 高 | 结果重复、count 不对 | LEFT JOIN + GROUP BY，单独写 count |
| 分页插件 | 中 | 返回全部数据 | 注册 PaginationInnerInterceptor |
| 逻辑删除 | 中 | 唯一索引冲突 | 删除时改唯一字段或加时间戳后缀 |
| RBAC 与 ACL | 高 | 两套权限混着写 | 功能用 RBAC，数据用 ACL，服务端统一校验 |
| 越权漏洞 | 高 | 改 id 就能看别人数据 | 每个查询强制带 tenant_id 与归属校验 |
| Sentinel 规则 | 高 | 限流不生效 | 资源名匹配、规则持久化、集群流控 |

## 阶段项目

### 项目二：智能体中台

**背景**：公司内 6 个团队各自接大模型，Key 分散、无法统计成本，知识库文档谁都能看，出问题查不到调用记录。需要一套统一中台。

**功能清单**：

- 租户与用户管理，RBAC 角色 + ACL 文档级授权
- 知识库：上传、解析、切片、入库，支持 FAQ 与长文档
- 对话：兼容 OpenAI 协议的模型接入，支持流式输出
- 会话审计留痕；Qdrant 按租户隔离；Flyway 管表结构；Docker Compose 一键部署

**技术选型**：JDK 17 + SpringBoot 3.2 + Spring Security + MyBatis-Plus + Flyway + MySQL 8 / PostgreSQL 16 + Redis 7 + Qdrant + Vue3 + Docker。

**验收标准**：

1. 普通用户访问他人文档返回 403，且在审计表留下记录；管理员可配置角色菜单权限，改完即时生效
2. 问答接口 P95 ≤ 5 秒，相同问题 10 分钟内命中缓存
3. 所有接口统一返回结构与错误码，参数非法返回 400
4. 全新机器 `docker compose up -d` + Flyway 自动迁移即可运行

**评分点**：权限模型设计 30 分、数据隔离与安全 25 分、工程质量 20 分、部署与文档 15 分、答辩表达 10 分。

## 常见面试题

### 问题1：SpringBoot 自动配置是怎么生效的

**答案要点**：`@SpringBootApplication` 含 `@EnableAutoConfiguration`，启动时通过 `AutoConfiguration.imports` 加载候选配置类，再由 `@ConditionalOnClass`、`@ConditionalOnMissingBean`、`@ConditionalOnProperty` 筛选，满足条件才注册 Bean；用户自定义同类型 Bean 时默认配置退让。

### 问题2：场景启动器和自定义启动器有什么区别

**答案要点**：场景启动器是官方把某类功能的依赖打包，如 `starter-web` 一次引入 MVC、Tomcat、Jackson。自定义启动器自己写：autoconfigure 模块放配置类与 imports 文件，starter 模块只做依赖聚合，别人引入后自动装配。

### 问题3：@Transactional 什么情况下会失效

**答案要点**：同类内部 this 调用不走代理；方法不是 public；异常被 catch 未抛出；抛检查异常且未配 `rollbackFor`；数据库引擎不支持；多数据源未指定事务管理器。

### 问题4：MyBatis 的 #{} 和 ${} 有什么区别

**答案要点**：`#{}` 预编译占位符，防 SQL 注入；`${}` 字符串拼接，只用于表名、排序字段等无法参数化的场景，且必须白名单校验，不能直接接前端值。

### 问题5：逻辑删除有什么坑

**答案要点**：查询自动加 `deleted=0`，但唯一索引仍生效，删除后同名字段无法再插入；统计与关联查询要手动带条件；物理清理需定时任务；`@TableLogic` 对自定义 SQL 不生效，XML 要自己写条件。

### 问题6：分页插件为什么必须注册

**答案要点**：MyBatis-Plus 通过 `PaginationInnerInterceptor` 改写 SQL 加 `LIMIT` 并执行 count；不注册时 `Page` 参数被忽略，返回全量数据，数据量大时直接 OOM。

### 问题7：RBAC 和 ACL 怎么配合

**答案要点**：RBAC 管功能权限（菜单、按钮、接口角色），ACL 管数据权限（某篇文档、某个知识库对谁可见）。顺序是先角色入口、再资源归属，校验必须落在服务端，并把权限条件下推到 SQL 或向量检索过滤条件。

### 问题8：微服务拆分的依据是什么

**答案要点**：按业务能力与数据边界拆，不按技术分层拆；团队规模、发布频率、扩容需求不同才拆。拆之前先模块化，拆之后要解决注册发现、配置、网关、流控、链路追踪与分布式事务，成本很高。

### 问题9：Sentinel 的限流和降级有什么区别

**答案要点**：限流是主动拒绝超额流量（QPS/线程数），保护自身；降级是依赖不稳定时快速返回兜底结果，保护调用方。限流返回 429，降级返回可解释的兜底数据，二者常配合使用。

### 问题10：接口 QPS 上不去，你怎么排查

**答案要点**：先压测定位瓶颈在 CPU、数据库、下游模型还是连接池；看慢 SQL 与索引、连接池配置、线程池大小；模型调用慢就加缓存、异步化、流式返回；最后才考虑水平扩容，并配合限流保护。

## 动手练习

<div class="callout task"><span class="tag">动手练习</span>
<ol>
<li>用 Java 写一个 <code>Answerer</code> 接口和两个实现，体会多态替换与 record 返回体。</li>
<li>建一个父工程 + 三个子模块，用一条命令完成全量打包。</li>
<li>故意引入两个版本的同一依赖，用 <code>dependency:tree</code> 找出冲突并排除。</li>
<li>写一个自定义 starter，让引入它的项目自动打印启动横幅。</li>
<li>用 <code>@Valid</code> + 全局异常实现“标题必填、长度不超过 200”，用 curl 验证 400。</li>
<li>写一个拦截器统计每个接口耗时，超过 1 秒打 warn 日志。</li>
<li>给一张表加逻辑删除，验证删除后查询不到、但数据库记录还在。</li>
<li>设计 RBAC 五张表并插入测试数据，实现管理员可删、编辑可改、普通用户只读。</li>
<li>写一个 ACL 校验，验证用户 A 无法通过改 URL 读取用户 B 的文档。</li>
<li>用 Flyway 建两张表并插入初始数据，重启服务验证不会重复执行。</li>
<li>用 Nacos + Feign 实现两个服务互调，并配置超时与降级。</li>
<li>给问答接口加 Sentinel 流控，用压测工具验证超过阈值返回 429。</li>
</ol>
</div>

## 阶段小结

- 企业 AI 系统常见形态是“Java 中台 + Python 推理”，两边通过 HTTP / OpenAI 兼容协议解耦。
- Java 基础决定你能不能读懂框架；接口、泛型、集合、异常是最高频的四块。
- Maven 解决依赖与工程组织，父工程管版本、子模块管实现，避免版本漂移。
- SpringBoot 的核心是自动配置 + 起步依赖 + 内嵌容器，排查先想“它默认做了什么”。
- SpringMVC 的边界要守住：Controller 只做协议转换，业务与事务放 Service。
- MyBatis 写复杂 SQL，MyBatis-Plus 管单表 CRUD，分页插件与逻辑删除是必配。
- 权限必须服务端校验：功能用 RBAC，数据用 ACL，租户条件下推到查询。
- 微服务先模块化再拆分，Nacos/Feign/Gateway/Sentinel 各司其职，限流降级要返回可解释的结果。

下一阶段进入大模型高阶：任务型对话机器人、NL2SQL 归因平台，以及 LoRA/QLoRA 微调与部署。你会把这一阶段的工程能力，接到真正以模型为核心的业务系统上。
