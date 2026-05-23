# ExportForge Deployment Log

## Working Rule

- 每次完成较大的功能或后台界面修改后，需要执行生产构建并重新部署到 Cloudflare Workers。
- 部署前至少运行 TypeScript 检查；如涉及界面或路由，运行 Cloudflare 构建检查。
- 每次部署后在本文件记录主要变更、验证命令和线上地址。

## 2026-05-23 Frontend Admin Refinement

Status: deployed

Changes:
- 前台设置页调整为先显示首页导航栏，再显示前台可显示语言。
- 首页导航链接支持选择系统页面、产品分类、文章，仍保留手动输入链接。
- 前台导航和前台语言设置限制为 `super-admin` / `admin`，并在 API 层阻止非管理员写入。
- 账号入口改为点击后直接进入账号设置。
- 总览去掉后台用户数量，上传文件统计改为文件数量。
- 文章编辑器增加 H3、链接、编号列表、分隔线，并修复插入图片/文件默认追加到末尾的问题。

Target:
- https://exportforge-b2b-site-system.437991663.workers.dev

Verification:
- `npm run typecheck`
- `npm run lint`
- `PATH=/usr/local/bin:$PATH npm run cf:build`
- `PATH=/usr/local/bin:$PATH npm run cf:deploy`
- Live checks: `/zh` 200, `/zh/admin/login` 200, admin login API OK, admin state API OK.

Cloudflare:
- Version ID: `ac4e8041-ad34-49bb-8169-f032e5a946d7`
