# 前端 · 中俄能源装备术语库系统（Vue 3）

技术栈：**Vue 3 + Vite + TypeScript + Element Plus + Pinia + Vue Router + Axios**。
后端为 Spring Boot（`../backend`），数据库 MySQL（`../sql`）。

## 目录

```
frontend/
├── index.html
├── vite.config.ts            # 端口 5173，/api 代理到 http://localhost:8080
└── src/
    ├── main.ts               # 挂载 Element Plus（中文）
    ├── App.vue / router/     # 路由（Hash 模式）+ 登录/管理员守卫
    ├── stores/user.ts        # Pinia 用户状态（token 存 localStorage）
    ├── api/                  # axios 封装 + 各模块接口
    ├── layouts/ components/  # 布局与头部/底部
    └── views/                # 12 个页面
        Home / Login / Terminology / DatabaseTerms / TermDetail / TermEdit
        Resources / DatabaseResources / Learn / Translate / Profile / Admin
```

## 运行

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173  （/api 自动代理到后端 8080）
npm run build      # 产物在 dist/
npm run type-check # vue-tsc 类型检查（可选）
```

前提：先启动后端（`cd ../backend && mvn spring-boot:run`）并初始化数据库
（`mysql -u root -p < ../sql/01_schema.sql` 等）。

演示账号：**admin / admin123**（管理员）、**student / student123**（学生）。

## 页面与接口

| 页面 | 路由 | 主要接口 |
| --- | --- | --- |
| 门户主页 | `/` | `/terms/stats` `/databases` `/announcements` |
| 登录注册 | `/login` | `/auth/login` `/auth/register` |
| 术语库 | `/terminology` | `/databases` `/databases/categories` |
| 分库术语 | `/terminology/:dbId` | `/databases/{id}` `/databases/{id}/terms` `/terms/pos-list` |
| 术语详情 | `/terminology/:dbId/term/:id` | `/terms/{id}` `/favorites` |
| 术语编辑 | `/terminology/:dbId/term/:id/edit` | `/terms/{id}` `/databases/{id}/terms` |
| 教学资源 | `/resources` | `/databases` `/resources/module-types` |
| 分库资源 | `/resources/:dbId` | `/resources?dbId=` |
| 学习中心 | `/learn/:mode` | `/learn/flashcards` `/learn/quiz` `/learn/compare` `/learn/records` |
| 翻译服务 | `/translate` | `/translate/text` `/translate/file` `/translate/history` `/translate/quick` |
| 个人中心 | `/profile` | `/learn/stats` `/learn/records` `/favorites` `/notes` `/users/me` |
| 后台管理 | `/admin` | `/admin/stats` `/admin/users` `/admin/activities` `/admin/term-growth` `/admin/audit-logs` |

## 说明

- 登录成功后 token 存 `localStorage.auth_token`，axios 拦截器自动加 `x-auth-token` 请求头。
- 开发环境通过 Vite 代理 `/api` → `http://localhost:8080`，无需处理跨域；
  生产环境可用 Nginx 反向代理或后端 `app.cors-origins` 白名单。
- 旧版 React 前端保留在 `../front/`（可删除，不影响本项目）。
