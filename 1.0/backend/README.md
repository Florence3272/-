# 后端服务 · 中俄能源装备术语库系统（Spring Boot）

技术栈：**Spring Boot 2.7 + MyBatis-Plus + MySQL 8 + JWT**，配合 **Vue 3** 前端。
数据库结构见 [`../sql/01_schema.sql`](../sql/01_schema.sql)（17 张表）。

> 环境：JDK 8（本机 `C:\Program Files (x86)\Java\jdk1.8.0_131`）+ Maven。
> 用 IDEA 打开时，把 JDK 设为 1.8、Maven 用自带即可。

## 目录

```
backend/
├── pom.xml
├── src/main/resources/application.yml     # 端口 8080，context-path=/api
└── src/main/java/com/cnru/termbank/
    ├── TermBankApplication.java
    ├── common/     Result / PageResult / ApiException / GlobalExceptionHandler
    ├── config/     WebConfig(CORS/静态/密码器) · MybatisPlusConfig · DataInitializer
    ├── security/   JwtUtil · AuthInterceptor · UserContext
    ├── entity/     17 个实体（@TableName 对应 sql/ 表）
    ├── mapper/     MyBatis-Plus BaseMapper + 少量自定义 SQL
    ├── dto/        Requests（各接口请求体）
    ├── service/    AccessService(分库权限) · TranslateService · FileExtractService · AuditService
    └── controller/ 11 个 REST 控制器
```

## 快速开始

```bash
# 1) 建库建表 + 演示数据（用仓库根的 sql/）
mysql -u root -p < ../sql/01_schema.sql
mysql -u root -p < ../sql/02_seed.sql

# 2) 改数据库账号
#    edit src/main/resources/application.yml  ->  spring.datasource.username/password

# 3) 运行
mvn spring-boot:run
# 或打包后运行： mvn clean package -DskipTests && java -jar target/energy-term-bank.jar
```

启动后接口地址：`http://localhost:8080/api`（context-path=`/api`）。
首次启动若 `users` 表为空，会自动创建 **admin/admin123**、**student/student123**。

验证：`GET http://localhost:8080/api/health`

## 配置（application.yml）

| 配置 | 说明 |
| --- | --- |
| `server.port` / `server.servlet.context-path` | 8080 / `/api` |
| `spring.datasource.*` | MySQL 连接（库名 `energy_term_db`） |
| `app.jwt.secret` / `expire-days` | JWT 密钥 / 有效期（**上线务必更换**） |
| `app.upload-dir` | 文件翻译上传目录（默认 `uploads`） |
| `app.cors-origins` | 允许的前端地址（Vue dev 默认 `http://localhost:5173`） |

## 鉴权

- 登录/注册返回 `{ token, userId }`；前端在请求头带 `x-auth-token: <token>`（也兼容 `Authorization: Bearer`）。
- `AuthInterceptor` 解析令牌 → 写入 `UserContext`（ThreadLocal）。
- 控制器用 `UserContext.require()` 取当前用户、`UserContext.requireAdmin()` 校验管理员；
  分库级权限（admin/editor/viewer）由 `AccessService.assertAccess()` 校验。

## 统一响应

```jsonc
{ "success": true, "message": "ok", "data": ... }      // 成功
{ "success": false, "message": "无权操作该分库" }        // 失败
```

## 接口一览（前缀 `/api`）

| 模块 | 接口 |
| --- | --- |
| 认证 | `POST /auth/register` `POST /auth/login` `GET /auth/me` `POST /auth/logout` |
| 用户 | `GET/PUT /users/me` `PUT /users/me/password` `GET /users/me/databases` |
| 分库 | `GET /databases` `GET /databases/categories` `POST /databases` `GET/PUT/DELETE /databases/{id}` `POST /databases/{id}/archive|restore` `GET/POST /databases/{id}/terms` `GET /databases/{id}/resources` `GET/POST /databases/{id}/members` `DELETE /databases/{id}/members/{userId}` |
| 术语 | `GET /terms/search` `GET /terms/pos-list` `GET /terms/stats` `GET /terms/export` `POST /terms/import` `GET/PUT/DELETE /terms/{id}` `POST /terms/{id}/restore` `GET /terms/{id}/versions` `POST /terms/{id}/media` `DELETE /terms/media/{id}` `GET/POST /terms/{id}/relations` `DELETE /terms/relations/{id}` |
| 资源 | `GET /resources` `GET /resources/module-types` `GET /resources/{id}` `POST/PUT/DELETE /resources(/{id})` |
| 学习 | `GET /learn/flashcards` `GET /learn/quiz` `POST/GET /learn/records` `GET /learn/stats` `GET /learn/compare` `GET /learn/scenario` `GET /learn/paths` `GET /learn/paths/{id}` |
| 收藏 | `GET /favorites` `POST /favorites` `DELETE /favorites/{id}` `DELETE /favorites/target` `GET /favorites/check` |
| 笔记 | `GET/POST /notes` `PUT/DELETE /notes/{id}` |
| 翻译 | `POST /translate/text` `POST /translate/file`(multipart) `GET /translate/tasks/{id}` `GET /translate/history` `DELETE /translate/history/{id}` `GET /translate/quick` |
| 后台 | `GET /admin/stats` `GET /admin/users` `PUT /admin/users/{id}/role|status` `GET /admin/activities` `GET /admin/term-growth` `GET /admin/audit-logs` |
| 公告 | `GET /announcements` `POST/PUT/DELETE /announcements(/{id})` |

## 说明

- **文件翻译**：支持 txt/md/csv/json/docx/xlsx（Apache POI 解析），结果另存为 txt 并返回下载地址。
- **翻译引擎**：`TranslateService` 术语库标准译法优先、内置词典兜底，可替换为大模型 API。
- **数据表**：与 `sql/` 完全一致（列名 camelCase），因此 `front/`（React 旧版）与 `frontend/`（Vue 新版）都能共用同一数据库。
