# LoftyVista 发饰工厂外贸官网

Project-027，采用 01「珍珠工坊」视觉方向。基于 Next.js 15、OpenNext 与原有 CMS，项目使用独立 Git 分支、Cloudflare Worker 和 KV。

## 开发

使用 Node.js 22+：`npm ci`，然后 `npm run dev -- --port 3057`。模板入口位于 `components/templates/ActiveTemplate.tsx`、`styles/active-template.css`、`data/current-template-content.json` 和 `public/assets/current-template/`。模板源存放在同一项目的 `../模板库/loftyvista-pearl-atelier`，更新时使用 `npm run template:apply -- loftyvista-pearl-atelier`。

## 页面与后台

网站包含首页、产品目录、产品详情、OEM/ODM、关于、工厂、质检和联系询盘。后台保留 `/admin` 登录、权限、媒体库、产品、文章、页面、导航、设置和询盘能力。中英文内容可用；其他语言需在后台另行补充。

## 发布

本项目分支为 `codex/loftyvista-027`。发布前运行 `npm run typecheck`、`npm run build`、`npm run cf:build`，确认 `.open-next` 不包含 `.codegraph`，核对 Wrangler dry-run 绑定后，先将本轮提交推送到 GitHub 分支，再部署 `loftyvista-027` Worker。KV 仅使用 `loftyvista-027-state`。

LoftyVista.com 尚未注册；当前地址使用 `https://loftyvista-027.437991663.workers.dev`。注册并完成 DNS 后再配置正式域名。登录密钥和密码哈希通过 Cloudflare secrets 配置，不写入 Git。
