# Agent Notes

## 模板库与生产模板约束

本项目采用“主分支只保留当前生产模板”的模式。其他模板必须放在项目外的模板库目录或独立仓库中，例如：

```bash
/Users/zhang/Documents/Codex_project/WebsiteTemplates
```

生产项目固定读取以下当前模板入口：

- `components/templates/ActiveTemplate.tsx`
- `styles/active-template.css`
- `data/current-template-content.json`
- `public/assets/current-template/`

后续 agent 必须遵守：

- 不要把多个模板组件、模板 CSS 或大量未启用模板素材直接塞进生产项目。
- 不要在后台“模板”页展示所有模板库模板；后台只管理当前生产模板的轮播、首屏内容、模块显示、排序和首页内容数量。
- 新模板必须通过 `npm run template:apply -- <templateKey>` 从模板库导入到固定入口。
- 前台模板可以替换，但后台 `/admin` 的登录、用户权限、媒体库、产品、文章、页面、导航、设置、询盘等 CMS 能力必须保留。
- 用户要求“本地复刻”时，先新建分支；不要默认 push GitHub 或部署 Cloudflare。
- 用户明确要求 push 或部署时，才执行对应操作；Cloudflare 部署仍必须遵守下方发布流程。

## Cloudflare 构建与部署流程

推荐每次发布前按下面顺序执行：

```bash
npm install
npm run typecheck
npm run build
```

部署 Cloudflare 前必须先同步到 GitHub：

```bash
git status --short
git add <本轮需要发布的文件>
git commit -m "<本轮发布说明>"
git push origin main
```

只有 `git push` 成功后，才继续执行 Cloudflare/OpenNext 构建与发布。如果 GitHub push 失败，先停止部署并修复同步问题，避免线上版本没有对应仓库记录。

确认本地构建通过后，再执行 Cloudflare/OpenNext 构建与发布：

```bash
npm run cf:build
npm run cf:deploy
```

`npm run cf:deploy` 实际会执行：

```bash
opennextjs-cloudflare build && opennextjs-cloudflare deploy
```

如果已经成功生成 `.open-next/worker.js`，但发布阶段因网络或授权临时失败，可以不重新构建，直接重试发布：

```bash
npx opennextjs-cloudflare deploy
```

当前 Wrangler 版本要求 Node.js `>=22.0.0`。如果本机默认 Node 版本较低，例如 `v20.x`，发布时会出现 `Wrangler requires at least Node.js v22.0.0`。在 Codex 工作区可临时使用 bundled Node 运行部署：

```bash
PATH="/Users/zhang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npm run cf:deploy
```

或在已经构建完成后只重试发布：

```bash
PATH="/Users/zhang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npx opennextjs-cloudflare deploy
```

Wrangler 需要有效的 Cloudflare 登录或 API Token。可用下面命令确认当前登录状态：

```bash
npx wrangler whoami
```

非交互环境可设置：

```bash
export CLOUDFLARE_API_TOKEN="your-token"
```

部署成功后，线上地址为：

- `https://exportforge-b2b-site-system.437991663.workers.dev`

可用下面命令快速确认线上服务响应：

```bash
curl -I https://exportforge-b2b-site-system.437991663.workers.dev/en/admin
```

## 本轮构建记录（2026-05-23）

本轮改动包含后台“文件上传”改为“媒体库”、媒体类型/时间筛选、文章编辑器可视化/代码模式，以及文章图片与正文渲染修复。构建发布按以下顺序执行：

```bash
npm install
npm run typecheck
npm run build
```

已确认：

- `npm install` 完成；本机默认 Node.js 为 `v20.18.3`，Wrangler/Miniflare 相关依赖提示需要 Node.js `>=22.0.0`，属于部署阶段的已知环境提示。
- `npm run typecheck` 通过。
- `npm run build` 通过，Next.js 生产构建成功。

Cloudflare 构建与部署继续使用 bundled Node 22：

```bash
PATH="/Users/zhang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npm run cf:build
PATH="/Users/zhang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npm run cf:deploy
```

用户后续要求“本地不构建”时，停止继续执行本地 `npm run build`、`npm run cf:build` 或会触发本地构建的 `npm run cf:deploy`。如果已经确认 `.open-next/worker.js` 是最新产物，才可以只重试发布：

```bash
PATH="/Users/zhang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npx opennextjs-cloudflare deploy
```

如果无法确认 `.open-next/worker.js` 是否包含本轮最新代码，不要部署可能过期的产物。

本轮 Cloudflare 发布已完成：

- 发布时间：2026-05-23
- 线上地址：`https://exportforge-b2b-site-system.437991663.workers.dev`
- Worker Version ID：`b7b1932b-d8e1-46c3-9370-dbe5e73cf7f3`
- 线上验证：`curl -I 'https://exportforge-b2b-site-system.437991663.workers.dev/zh/admin?tab=files'` 返回 `HTTP/2 307`，并重定向到 `/zh/admin/login`，符合后台未登录保护预期。

## 后台侧栏布局修复（2026-05-23）

修复用户反馈的后台页面大片空白、左侧菜单覆盖内容问题：

- 移除后台侧栏拖拽定位与 `localStorage` 位置恢复逻辑，避免旧位置让侧栏变成固定浮层。
- 移除 `.admin-sidebar.floating`、拖拽手柄相关样式。
- 后台 tab 切换现在会同步更新 `?tab=`，直接打开 `/zh/admin?tab=account` 时也会同步显示账号页。

发布信息：

- Worker Version ID：`92b03170-d190-450a-9d12-823d10a055ff`
- 线上验证：当前 `/zh/admin?tab=account` 中 `.admin-sidebar` 为 `position: sticky`，没有 `floating` class；工作区位于侧栏右侧，宽度约 `1242px`。

## 后台编辑与分类修复（2026-05-24）

继续修复用户在浏览器标注的问题：

- 写文章中从媒体库插入图片时，改为生成图片 Markdown：`![图片名](url)`；普通文件仍生成下载链接。
- 已存在的旧格式 `[下载文件：IMG_xxx.JPG](url)` 在文章渲染时会按图片显示，避免旧内容无法显示图片。
- 产品分类右侧列表整体下移，与左侧添加分类表单区域对齐。
- 发布框按钮统一为两列布局，保存草稿/发布等宽，移至回收站占整行。
- 首页导航设置中“显示 / 新窗口 / 删除”和上方字段同排排列。

发布信息：

- Worker Version ID：`5c4b4d31-7964-48c5-9526-616829c1c091`
- 线上验证：`curl -I 'https://exportforge-b2b-site-system.437991663.workers.dev/zh/admin?tab=products'` 返回 `HTTP/2 307` 并重定向到 `/zh/admin/login`，且响应预加载新 CSS：`322cfcd1af2c7f86.css`。

## 后台联系方式行布局修复（2026-05-24）

修复用户反馈的“社交媒体与联系浮窗”列表容器过高问题：

- 每个联系方式渠道压缩为单行布局：显示名称、类型、账号/号码、链接、颜色、启用、二维码、删除同排展示。
- 二维码区域改为紧凑控件：无二维码时显示小状态，有二维码时显示 40px 缩略图，并提供上传/移除操作。
- 产品分类页左右容器恢复顶边对齐。

发布信息：

- Worker Version ID：`73fceabd-5685-43f6-8397-c1aedd9e5933`
- 线上验证：`/zh/admin?tab=contacts` 预加载新 CSS：`0fb0c04f342463dd.css`；首个 `.contact-card` 宽约 `1177px`、高约 `87px`，子项位于同一行。

## 后台侧栏与文章图片可视化修复（2026-05-24）

继续修复用户在浏览器标注的问题：

- 侧边栏每个导航项增加图标。
- “折叠”按钮移到账户容器上方，并改为“收起菜单 / 展开菜单”。
- 左侧“联系方式”改为“社媒及联系”。
- 左侧“前台设置”和页面标题改为“导航栏设置”，保存按钮改为“保存导航设置”。
- 写文章“可视化”模式中，上方显示渲染后的正文内容，图片可直接显示；下方保留 Markdown 源内容编辑框。代码模式仍为纯源码编辑。
- 产品分类列表增加无顶级分类/父级循环兜底，避免分类内容被父级折叠逻辑全部隐藏；编辑分类时保留原有应用、规格、主题适配内容。

发布信息：

- Worker Version ID：`48a7022d-3839-452a-843a-2f0002fa467e`
- 线上验证：`curl -I 'https://exportforge-b2b-site-system.437991663.workers.dev/zh/admin?tab=articles'` 返回 `HTTP/2 307` 并重定向到 `/zh/admin/login`，且响应预加载新 CSS：`95c85c06e6bfe23f.css`。

## KeyproTools 五金工具内容改造（2026-05-24）

本轮按用户要求将站点品牌改为 `KeyproTools`，内容方向改为五金工具网站，主要产品是铣刀和钻头：

- 产品分类替换为硬质合金铣刀、平底铣刀、球头铣刀、铝用铣刀、钻头、整体硬质合金钻头、HSS 麻花钻、阶梯钻与中心钻、定制刀具与 OEM、涂层与私标包装。
- 前台导航改为“铣刀 / 钻头 / 定制刀具 / 技术文章 / 资料下载 / 联系我们”，产品导航直接指向对应产品分类页。
- 生成并保存刀具相关图片到当前生产模板素材目录 `public/assets/current-template/`，用于产品卡片、产品详情、文章封面和媒体库。
- `data/current-template-content.json` 作为当前生产模板内容 seed；`lib/server/admin-store.ts` 通过 `contentVersion=current-template-keyprotools-v1` 将旧后台状态迁移到本轮内容，同时保留用户、询盘和已有联系方式。

本轮验证记录：

- `npm install` 完成；默认 Node.js `v20.18.3` 下 Wrangler/Miniflare 仍提示需要 Node.js `>=22.0.0`，属于部署阶段已知提示。
- `npm run typecheck` 通过。
- 使用 bundled Node 22 执行 `npm run cf:build` 通过，并生成 `.open-next/worker.js`。
- 部署前按用户要求先同步到 GitHub：commit `8421814` 已 push 到 `origin/main`。
- Chrome 已登录 Cloudflare 后，执行 `wrangler login` 完成 OAuth 授权；`wrangler whoami` 显示账号 `437991663@qq.com`。
- 使用 bundled Node 22 执行 `npx opennextjs-cloudflare deploy` 直接发布已有 `.open-next/worker.js`，未重复本地构建。

发布信息：

- 发布时间：2026-05-24
- 线上地址：`https://exportforge-b2b-site-system.437991663.workers.dev`
- Worker Version ID：`1367d4f8-3ae2-4887-92ce-e40a1259c594`
- 线上验证：`/zh` 包含 `KeyproTools`、`硬质合金铣刀`、`钻头`；`/zh/products/carbide-end-mills` 和 `/zh/products/drill-bits` 返回 `HTTP/2 200`；`/zh/articles` 返回 `HTTP/2 200` 并显示五金工具文章；当前模板素材返回 `HTTP/2 200`；`/zh/admin?tab=products` 返回 `HTTP/2 307` 并重定向到 `/zh/admin/login`。

## KeyproTools 首页轮播、导航保存与卡片布局修复（2026-05-24）

继续修复用户在浏览器标注的问题：

- Header 改为普通页面流布局，滚动页面时会一起离开视口，不再固定悬停。
- 首页首屏增加 3 张无文字工业刀具海报轮播：`hero-tooling-range.jpg`、`hero-cnc-factory.jpg`、`hero-export-packing.jpg`。
- 调整首屏右侧工业视觉层级和尺寸，避免质检圆环、产品图和装饰刀具条互相重叠。
- 修复后台“设置 > 导航栏”删除默认导航后保存不生效的问题：`normalizeNavigation` 不再把用户删除的默认导航自动补回。
- 首页产品目录改为精选 6 个产品卡片，形成完整 3 列 2 行，并统一卡片高度。
- 首页技术文章从 4 篇增加到 6 篇，新增铣刀 RFQ 参数和钻头备货组合两篇文章。
- 后台状态读取时会补齐缺失的 seed 文章和媒体资源，但不会重置用户已有导航、询盘、用户和联系方式。

本轮验证记录：

- 部署前已同步 GitHub：commit `a7d3507`（首页 3 张海报轮播）和 commit `c7575a6`（导航保存与首页卡片修复）均已 push 到 `origin/main`。
- `npm install` 完成；默认 Node.js `v20.18.3` 下 Wrangler/Miniflare 仍提示需要 Node.js `>=22.0.0`，属于部署阶段已知提示。
- `npm run typecheck` 通过。
- `npm run build` 通过。
- 使用 bundled Node 22 执行 `npm run cf:build` 通过。
- 使用 bundled Node 22 执行 `npm run cf:deploy` 通过。

发布信息：

- 发布时间：2026-05-24
- 线上地址：`https://exportforge-b2b-site-system.437991663.workers.dev`
- Worker Version ID：`f6733213-b403-4e68-93f4-b71d836346ad`
- 线上验证：`/en` 返回 `HTTP/2 200` 并预加载新 CSS：`6a93807c23a8a3da.css`；`/en/admin?tab=settings` 返回 `HTTP/2 307` 并重定向到 `/en/admin/login`；Playwright 线上验证产品卡数量为 `6`，高度均为 `578px`，文章卡数量为 `6`，高度均为 `476px`，Header `position` 为 `relative`。

## KeyproTools 首页轮播、导航保存与卡片布局修复（2026-05-24）

继续修复用户在浏览器标注的问题：

- Header 改为普通页面流布局，滚动页面时会一起离开视口，不再固定悬停。
- 首页首屏增加 3 张无文字工业刀具海报轮播：`hero-tooling-range.jpg`、`hero-cnc-factory.jpg`、`hero-export-packing.jpg`。
- 调整首屏右侧工业视觉层级和尺寸，避免质检圆环、产品图和装饰刀具条互相重叠。
- 修复后台“设置 > 导航栏”删除默认导航后保存不生效的问题：`normalizeNavigation` 不再把用户删除的默认导航自动补回。
- 首页产品目录改为精选 6 个产品卡片，形成完整 3 列 2 行，并统一卡片高度。
- 首页技术文章从 4 篇增加到 6 篇，新增铣刀 RFQ 参数和钻头备货组合两篇文章。
- 后台状态读取时会补齐缺失的 seed 文章和媒体资源，但不会重置用户已有导航、询盘、用户和联系方式。

本轮验证记录：

- 部署前已同步 GitHub：commit `a7d3507`（首页 3 张海报轮播）和 commit `c7575a6`（导航保存与首页卡片修复）均已 push 到 `origin/main`。
- `npm install` 完成；默认 Node.js `v20.18.3` 下 Wrangler/Miniflare 仍提示需要 Node.js `>=22.0.0`，属于部署阶段已知提示。
- `npm run typecheck` 通过。
- `npm run build` 通过。
- 使用 bundled Node 22 执行 `npm run cf:build` 通过。
- 使用 bundled Node 22 执行 `npm run cf:deploy` 通过。

发布信息：

- 发布时间：2026-05-24
- 线上地址：`https://exportforge-b2b-site-system.437991663.workers.dev`
- Worker Version ID：`f6733213-b403-4e68-93f4-b71d836346ad`
- 线上验证：`/en` 返回 `HTTP/2 200` 并预加载新 CSS：`6a93807c23a8a3da.css`；`/en/admin?tab=settings` 返回 `HTTP/2 307` 并重定向到 `/en/admin/login`；Playwright 线上验证产品卡数量为 `6`，高度均为 `578px`，文章卡数量为 `6`，高度均为 `476px`，Header `position` 为 `relative`。
