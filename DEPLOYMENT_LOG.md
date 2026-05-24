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

## 2026-05-23 Navigation Select Width Fix

Status: deployed

Changes:
- 缩短首页导航栏“选择链接”的下拉选项显示文案。
- 限制导航设置卡片内的输入框和下拉框宽度，避免控件撑出后台内容区域。

Target:
- https://exportforge-b2b-site-system.437991663.workers.dev

Verification:
- Included in deployment `2f85843d-e810-492d-9af9-a545df7207aa`.

## 2026-05-23 Admin Dashboard World Clock

Status: deployed

Changes:
- 后台侧边栏“总览”改为“仪表盘”。
- 仪表盘新增世界主要城市时间，并按浏览器时间每秒刷新。

Target:
- https://exportforge-b2b-site-system.437991663.workers.dev

Verification:
- `npm run build`
- `npm run typecheck`
- `PATH=/usr/local/bin:$PATH npm run cf:deploy`
- Live checks: `/zh` 200, `/zh/admin/login` 200.

Cloudflare:
- Version ID: `2f85843d-e810-492d-9af9-a545df7207aa`

## 2026-05-23 Article Editor Height

Status: deployed

Changes:
- 放大文章发布页的正文编辑窗口高度。
- 给正文 textarea 增加行数兜底，避免样式加载顺序导致编辑框回落到较小高度。

Target:
- https://exportforge-b2b-site-system.437991663.workers.dev

Verification:
- `npm run build`
- `npm run typecheck`
- `PATH=/usr/local/bin:$PATH npm run cf:deploy`
- Live checks: `/zh` 200, `/zh/admin/login` 200.

Cloudflare:
- Version ID: `03bf9d26-b85b-41d0-b738-6668b065cace`

## 2026-05-23 Admin Layout And Editor Controls

Status: deployed with KeyproTools release

Changes:
- 文章编辑器工具栏新增 H1/H4、删除线、下划线、上下标、代码、代码块、表格、待办、提示块、清空正文等编辑功能。
- 首页导航栏区域新增就近的“保存导航”按钮，并显示已保存/待保存状态。
- 联系方式页面改为更宽松的 12 栏布局，拉开显示名称、类型、账号、链接等字段间距。
- 后台页面宽度放宽到自适应大屏浏览器。
- 前台语言选择器删除选择器前的额外国旗，在下拉选项中保留国旗。
- 后台侧边栏增加折叠/展开开关。
- README 增加 typecheck 需要先生成 `.next/types` 的说明。

Target:
- https://exportforge-b2b-site-system.437991663.workers.dev

Verification:
- Included in deployment `1367d4f8-3ae2-4887-92ce-e40a1259c594`.

Cloudflare:
- Version ID: `1367d4f8-3ae2-4887-92ce-e40a1259c594`

## 2026-05-24 KeyproTools Cutting Tools Rebrand

Status: deployed

Changes:
- 站点品牌改为 `KeyproTools`。
- 默认内容替换为五金工具方向，主要产品为硬质合金铣刀、钻头、定制刀具和涂层/私标包装。
- 前台导航改为“铣刀 / 钻头 / 定制刀具 / 技术文章 / 资料下载 / 联系我们”，产品导航直达分类页。
- 新增 `data/keypro-content.json` 作为 KeyproTools 内容 seed，并通过 `contentVersion=keyprotools-tools-v1` 迁移旧后台状态。
- 生成并发布 4 张刀具图片到 `public/assets/tools/`，用于产品卡片、产品详情、文章封面和媒体库。

Target:
- https://exportforge-b2b-site-system.437991663.workers.dev

GitHub:
- Commit: `8421814`
- Branch: `main`

Verification:
- `npm install`
- `npm run typecheck`
- `PATH="/Users/zhang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npm run cf:build`
- `PATH="/Users/zhang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npx wrangler whoami`
- `PATH="/Users/zhang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npx opennextjs-cloudflare deploy`
- Live checks: `/zh` includes `KeyproTools`, `/zh/products/carbide-end-mills` 200, `/zh/products/drill-bits` 200, `/zh/articles` 200, `/assets/tools/carbide-end-mills.png` 200, `/zh/admin?tab=products` 307 to `/zh/admin/login`.

Cloudflare:
- Version ID: `1367d4f8-3ae2-4887-92ce-e40a1259c594`
