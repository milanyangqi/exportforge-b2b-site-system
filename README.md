# Export B2B Independent Site System

多语言 B2B 外贸独立站系统骨架，支持产品展示、询盘、社交联系浮窗、角色权限、主题切换、AI 内容生成预留，以及托管/自部署。

## Quick Start

```bash
npm install
npm run dev
```

访问 `http://localhost:3000/en`。

## Admin

后台地址：

- `http://localhost:3000/zh/admin`
- `http://localhost:3000/en/admin`

默认开发账号：

- Email: `admin@example.com`
- Password: `change-me`

生产环境请在 `.env` 修改：

- `INITIAL_ADMIN_EMAIL`
- `INITIAL_ADMIN_PASSWORD`
- `AUTH_SECRET`

后台当前已具备真实登录、HTTP-only session、受保护 API、产品分类管理、文章发布、询盘管理、联系渠道配置、用户角色、主题切换、AI 内容设置。数据在本地开发时保存到 `.data/admin-state.json`，部署到 Cloudflare Workers/OpenNext 后自动使用 `EXPORTFORGE_KV` 持久化。

运营联动：

- 后台产品分类保存后，同步到首页、产品列表和产品详情页。
- 后台文章设置为 `已发布` 后进入文章列表。
- 后台文章同时勾选 `同步首页` 后进入首页文章区。
- 后台主题切换保存后，前台会读取当前主题颜色。
- 后台 AI 内容中心可生成文章草稿，人工审核后再发布。

## Self-host

```bash
cp .env.example .env
docker compose up --build
```

## Cloudflare Workers

本项目已配置 OpenNext Cloudflare 部署：

```bash
npm run cf:build
npm run cf:deploy
```

线上后台数据使用 `wrangler.jsonc` 中的 `EXPORTFORGE_KV` 绑定。生产环境请通过 Wrangler Secret 设置：

- `AUTH_SECRET`
- `INITIAL_ADMIN_PASSWORD`

后台入口仍为 `/zh/admin` 或 `/en/admin`。

## Included

- 多语言路由：`en`、`zh`、`th`、`vi`、`id`、`ms`、`fil`、`my`、`km`、`lo`、`ar`
- 阿拉伯语 RTL 布局支持
- 后台演示页：`/en/admin`
- 询盘 API：`POST /api/leads`
- 主题配置、RBAC 权限配置、AI 生成草稿配置均已类型化
- `config/`、`data/`、`lib/` 分层，方便二次开发与行业模板扩展
