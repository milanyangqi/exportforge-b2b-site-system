# Yuvacosmetics 官网

Project-024 第二轮 B「沉浸式大牌」实现。基于 Website 的 Next.js 15 / React 19 / OpenNext CMS，使用独立 Git 分支和 Cloudflare Worker，不覆盖旧站。

## 开发

Node.js >=22，`npm ci` 后复制 `.env.example` 为受保护且不提交的 `.env.local`，配置独立签名密钥与 scrypt 密码哈希。`npm run dev -- --port 3024`。

## 模板

当前入口：`components/templates/ActiveTemplate.tsx`、`styles/active-template.css`、`data/current-template-content.json`、`public/assets/current-template/`。模板库在本项目 `02_源代码/模板库/yuva-cinema`，使用 `npm run template:apply -- yuva-cinema` 导入。内页排版模块为 `components/YuvaPages.tsx`，不改变 CMS 数据接口。

## 发布

停止同目录开发服务器，依次执行 `npm run typecheck`、`npm run build`，提交并成功推送 `codex/yuvacosmetics-024` 后，运行 `npm run cf:build`。检查 `.open-next` 不包含 `.codegraph`，核对 Wrangler 独立绑定后发布。不要推送旧生产 main。

Worker：`yuvacosmetics-024`。持久化仅使用独立 `EXPORTFORGE_KV` 绑定；内容、询盘和媒体存储在 KV。后台 `/admin` 重定向至 `/zh/admin`。生产密钥 `AUTH_SECRET`、`INITIAL_ADMIN_PASSWORD_HASH` 通过 Cloudflare secrets 配置。没有共享旧站数据库、用户或密钥。

## 内容维护

英文、中文内容可用，其他语言保留系统的语言管理及英文回退能力，不代表已经人工翻译。文章和页面共用 `AdminMarkdownEditor`。未配置邮件服务或 AI 服务，相关功能需要管理员自行配置后才能调用。

素材均为 AI 生成概念示意。工厂图并非实景，产品图并非已确认规格。不得据此添加认证、产能、客户背书或真实联系方式。正式资料可通过媒体库和页面编辑替换。
