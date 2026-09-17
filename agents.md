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
- 不要让某一个组件、CSS、JSON、配置或媒体文件持续膨胀到过大，避免影响网站打开速度；新增功能或素材时优先拆分模块、按需加载、压缩图片/视频，并移除未使用内容。
- 不要在后台“模板”页展示所有模板库模板；后台只管理当前生产模板的轮播、首屏内容、模块显示、排序和首页内容数量。
- 新模板必须通过 `npm run template:apply -- <templateKey>` 从模板库导入到固定入口。
- 前台模板可以替换，但后台 `/admin` 的登录、用户权限、媒体库、产品、文章、页面、导航、设置、询盘等 CMS 能力必须保留。
- 后台“文章”和“页面”的正文编辑必须使用同一套编辑器方案：优先复用同一个编辑器组件、同一套工具栏、可视化/代码模式、Markdown 规则、媒体库插入逻辑和前台渲染兼容逻辑；不要为文章和页面分别维护两套容易漂移的编辑器实现。
- 用户要求“本地复刻”时，先新建分支；不要默认 push GitHub 或部署 Cloudflare。
- 用户明确要求 push 或部署时，才执行对应操作；Cloudflare 部署仍必须遵守下方发布流程。

## CodeGraph 知识图谱约束

本项目允许在仓库中保留 CodeGraph 生成的项目知识图谱：

- 图谱固定放在项目根目录 `.codegraph/`，用于后续代码查找、影响分析和二次开发。
- `.codegraph/` 可以提交到 git，但不要移动到 `public/`，也不要在业务代码、模板、样式或配置中 import、读取或引用它。
- 本轮 CodeGraph 只做本地生成和本地提交；不要默认 push GitHub，不要默认部署 Cloudflare。
- 后续每次 Cloudflare/OpenNext 发布前，除了常规构建检查，还必须确认构建产物不包含 `.codegraph/`：

```bash
find .open-next -path '*codegraph*' -o -name '.codegraph'
```

如果上面命令输出为空，才可继续发布；如果有输出，必须先移除构建产物中的 CodeGraph 文件并重新验证。

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
git push origin codex/yuvacosmetics-024
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


## Project-024 独立生产约束

此仓库仅承载 Yuvacosmetics。生产分支 codex/yuvacosmetics-024；不得覆盖旧站 main。模板库位于本项目 02_源代码/模板库，Worker yuvacosmetics-024，KV YUVACOSMETICS_024。旧站发布地址不是本站验收地址。
