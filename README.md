# GrillBeats 竹签批发站

本分支 `codex/grillbeats-wholesale` 基于原站 `main` 的 `a128011`，使用白绿产品目录模板，保留原有 CMS。英文为默认前台，支持中文。

## 独立部署

- Worker：`grillbeats-wholesale`
- KV：`grillbeats-wholesale-kv`，资源 ID 见 `wrangler.jsonc`
- 目标域名：`https://grillbeats.com`，`www` 使用永久重定向
- 后台：`/zh/admin`；初始管理员标识：`437991663@qq.com`（不是已开通邮箱的声明）
- 需要 Secrets：`AUTH_SECRET`、`INITIAL_ADMIN_PASSWORD`。不得提交到 Git。
- 本分支不得使用原站 KV、原站密钥或覆盖原 Worker，不合并 `main`。

## 本地开发

使用 Node.js 22 或更高版本，先 `npm install`。通过环境变量提供独立管理员密码和会话密钥，然后执行 `npm run dev`。本地数据保存在忽略提交的 `.data/` 中。

前台只展示竹签与包装需求咨询，不预设价格、MOQ、库存、认证或交期；图片是设计示意。未配置联系方式时隐藏联系浮窗。`/api/leads` 成功表示后台落库，不代表邮件已发送。

## 模板源包

项目模板库在生产代码目录之外，通过环境变量指定位置：

```bash
TEMPLATE_LIBRARY_DIR='../模板库' npm run template:apply -- grillbeats-wholesale
```

源包通过固定入口导入组件、样式、内容与图片。新增的 `GrillBeatsHero`、`SkewerSpecification`、`TemplateCustomBlock`、`TemplateImageCarousel` 是本分支配套组件。不要向当前生产目录放入其他未启用模板。

将当前分支的模板入口导出到独立模板库：

```bash
TEMPLATE_LIBRARY_DIR='../模板库' npm run template:export
```

## 验证与发布

```bash
npm install
npm run typecheck
NEXT_PUBLIC_SITE_URL=https://grillbeats.com NEXT_PUBLIC_SITE_INDEXABLE=true npm run build
```

先提交并推送当前分支，推送失败必须停止发布。本次用户明确要求新分支，覆盖旧流程中的 `git push origin main`：

```bash
git push -u origin codex/grillbeats-wholesale
NEXT_PUBLIC_SITE_URL=https://grillbeats.com NEXT_PUBLIC_SITE_INDEXABLE=true npm run cf:build
find .open-next -path '*codegraph*' -o -name '.codegraph'
npx opennextjs-cloudflare deploy
```

只有 CodeGraph 检查为空才发布。发布后在独立 Worker 地址验证页面、登录、询盘、媒体和设置，再迁移域名。DNS 迁移前必须导出完整原记录，保留邮件记录；关闭旧 DNSSEC 并确认旧 DS 清除后再换 NS，Cloudflare 激活后重新启用 DNSSEC。

## 依赖说明

Next.js 更新至 15.5.25；PostCSS 和 Tiptap 使用覆盖规则锁定兼容安全版本，避免旧 peer 锁文件阻止修复。Nodemailer 更新至 10 系列。发布前运行依赖审计；不要通过强制升级 Next.js 主版本来机械消除所有提示。
