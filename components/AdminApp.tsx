"use client";

import { type CSSProperties, type KeyboardEvent, type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Bold,
  Code2,
  Coins,
  DatabaseBackup,
  Download,
  FileText,
  FolderTree,
  Gauge,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Inbox,
  Italic,
  Languages,
  LayoutPanelTop,
  Library,
  Link2,
  List,
  ListOrdered,
  Menu,
  Minus,
  Paperclip,
  Palette,
  Pilcrow,
  PlusCircle,
  Quote,
  RefreshCw,
  Save,
  Search,
  SendToBack,
  Sparkles,
  Share2,
  Strikethrough,
  Subscript,
  Superscript,
  Table2,
  Trash2,
  Underline,
  Upload,
  Users,
  X
} from "lucide-react";
import { locales } from "@/config/locales";
import { themes } from "@/config/themes";
import type { AdminState, AdminUser, Article, ContactChannel, ContactChannelType, HomeSectionKey, LeadStatus, LocaleCode, ProductCategory, RoleKey, SiteHeroSlide, SiteNavigationItem, SitePage, SiteTemplateSettings, ThemeKey, UploadedFile } from "@/types/site";

type Tab = "overview" | "products" | "pages" | "articles" | "files" | "leads" | "contacts" | "navigation" | "users" | "collect" | "templates" | "settings" | "languages" | "themes" | "account" | "ai";
type ArticleEditorView = "visual" | "code";
type PageMode = "list" | "editor";
type MediaTypeFilter = "all" | "image" | "document" | "spreadsheet" | "archive" | "other";
type MediaTimeFilter = "all" | "7d" | "30d" | "90d";
type SettingsSection = "general" | "writing" | "reading" | "media" | "permalinks" | "privacy" | "ai" | "translation" | "backup";
type AiContentTarget = "article" | "page";
type AiWriteMode = "new" | "replace" | "append";
type AiWorkbenchSection = "generate";
type TranslationScope = "all" | "article" | "page" | "products" | "templates" | "navigation";
type BackupSectionKey = keyof Pick<AdminState, "products" | "pages" | "articles" | "leads" | "contactChannels" | "uploadedFiles" | "users" | "navigation" | "siteSettings" | "templateSettings" | "aiSettings" | "aiCreditSettings" | "aiUsageRecords" | "activeTheme" | "enabledLocales">;
type TemplateEditorMode = "form" | "visual";
type VisualTextElement = "span" | "strong" | "p" | "h1" | "h3" | "li";
type VisualEditableTextOptions = {
  editorKey: string;
  value: string;
  element: VisualTextElement;
  className?: string;
  multiline?: boolean;
  allowEmpty?: boolean;
  onCommit: (value: string) => void;
};
type VisualEditableImageOptions = {
  editorKey: string;
  value: string;
  alt: string;
  className?: string;
  onCommit: (value: string) => void;
};
type ProductFormState = {
  zh: string;
  en: string;
  slug: string;
  parentId: string;
  summaryZh: string;
  summaryEn: string;
};
type ContactFormState = {
  type: ContactChannelType;
  zh: string;
  en: string;
  value: string;
  href: string;
  color: string;
};
type ProductTableRow = {
  product: ProductCategory;
  depth: number;
};
type NavigationTableRow = {
  item: SiteNavigationItem;
  depth: number;
  childCount: number;
};
type NewUserFormState = {
  name: string;
  email: string;
  role: RoleKey;
  password: string;
  aiCredits: number;
};
type AiContentFormState = {
  target: AiContentTarget;
  writeMode: AiWriteMode;
  targetArticleId: string;
  targetPageId: string;
  topic: string;
  category: string;
};
type AiContentDraft = {
  target: AiContentTarget;
  slug: string;
  title: Article["title"];
  excerpt: Article["excerpt"];
  body: NonNullable<Article["body"]>;
  category: string;
  createdAt: string;
};
type AiGeneratedImage = {
  id: string;
  name: string;
  url: string;
};
type CollectorFormState = {
  sourceUrl: string;
  sourceText: string;
  target: AiContentTarget;
  category: string;
};

const tabs: { key: Tab; label: string; icon: typeof Gauge }[] = [
  { key: "overview", label: "仪表盘", icon: Gauge },
  { key: "products", label: "分类", icon: FolderTree },
  { key: "pages", label: "页面", icon: FileText },
  { key: "articles", label: "文章", icon: FileText },
  { key: "files", label: "媒体库", icon: Library },
  { key: "leads", label: "询盘", icon: Inbox },
  { key: "contacts", label: "社媒及联系", icon: Share2 },
  { key: "navigation", label: "导航栏", icon: Menu },
  { key: "users", label: "用户权限", icon: Users },
  { key: "collect", label: "采集", icon: Search },
  { key: "languages", label: "语言", icon: Languages },
  { key: "templates", label: "模板", icon: LayoutPanelTop },
  { key: "themes", label: "主题", icon: Palette },
  { key: "ai", label: "AI内容", icon: Bot },
  { key: "settings", label: "设置", icon: LayoutPanelTop }
];
const tabKeys = new Set<Tab>([...tabs.map((item) => item.key), "account"]);
const adminPageAccessOptions: { key: Tab; label: string }[] = [
  { key: "overview", label: "仪表盘" },
  { key: "products", label: "分类" },
  { key: "pages", label: "页面" },
  { key: "articles", label: "文章" },
  { key: "files", label: "媒体库" },
  { key: "leads", label: "询盘" },
  { key: "contacts", label: "社媒及联系" },
  { key: "navigation", label: "导航栏" },
  { key: "users", label: "用户权限" },
  { key: "collect", label: "采集" },
  { key: "templates", label: "模板" },
  { key: "settings", label: "设置" },
  { key: "languages", label: "语言" },
  { key: "themes", label: "主题" },
  { key: "ai", label: "AI内容" }
];
const defaultAllowedTabsByRole: Record<RoleKey, Tab[]> = {
  "super-admin": adminPageAccessOptions.map((item) => item.key),
  admin: ["overview", "products", "pages", "articles", "files", "leads", "contacts", "navigation", "collect", "templates", "settings", "languages", "themes", "ai"],
  editor: ["overview", "products", "pages", "articles", "files", "collect", "ai"],
  sales: ["overview", "products", "leads", "contacts"],
  viewer: ["overview", "products", "articles", "files"]
};

const worldClockCities = [
  { city: "北京", zone: "Asia/Shanghai" },
  { city: "上海", zone: "Asia/Shanghai" },
  { city: "香港", zone: "Asia/Hong_Kong" },
  { city: "台北", zone: "Asia/Taipei" },
  { city: "东京", zone: "Asia/Tokyo" },
  { city: "首尔", zone: "Asia/Seoul" },
  { city: "新加坡", zone: "Asia/Singapore" },
  { city: "马尼拉", zone: "Asia/Manila" },
  { city: "吉隆坡", zone: "Asia/Kuala_Lumpur" },
  { city: "雅加达", zone: "Asia/Jakarta" },
  { city: "曼谷", zone: "Asia/Bangkok" },
  { city: "胡志明市", zone: "Asia/Ho_Chi_Minh" },
  { city: "河内", zone: "Asia/Ho_Chi_Minh" },
  { city: "金边", zone: "Asia/Phnom_Penh" },
  { city: "万象", zone: "Asia/Vientiane" },
  { city: "仰光", zone: "Asia/Yangon" },
  { city: "孟买", zone: "Asia/Kolkata" },
  { city: "新德里", zone: "Asia/Kolkata" },
  { city: "达卡", zone: "Asia/Dhaka" },
  { city: "卡拉奇", zone: "Asia/Karachi" },
  { city: "科伦坡", zone: "Asia/Colombo" },
  { city: "迪拜", zone: "Asia/Dubai" },
  { city: "阿布扎比", zone: "Asia/Dubai" },
  { city: "利雅得", zone: "Asia/Riyadh" },
  { city: "吉达", zone: "Asia/Riyadh" },
  { city: "多哈", zone: "Asia/Qatar" },
  { city: "科威特城", zone: "Asia/Kuwait" },
  { city: "马斯喀特", zone: "Asia/Muscat" },
  { city: "开罗", zone: "Africa/Cairo" },
  { city: "约翰内斯堡", zone: "Africa/Johannesburg" },
  { city: "开普敦", zone: "Africa/Johannesburg" },
  { city: "拉各斯", zone: "Africa/Lagos" },
  { city: "内罗毕", zone: "Africa/Nairobi" },
  { city: "卡萨布兰卡", zone: "Africa/Casablanca" },
  { city: "伊斯坦布尔", zone: "Europe/Istanbul" },
  { city: "伦敦", zone: "Europe/London" },
  { city: "巴黎", zone: "Europe/Paris" },
  { city: "鹿特丹", zone: "Europe/Amsterdam" },
  { city: "汉堡", zone: "Europe/Berlin" },
  { city: "法兰克福", zone: "Europe/Berlin" },
  { city: "米兰", zone: "Europe/Rome" },
  { city: "马德里", zone: "Europe/Madrid" },
  { city: "华沙", zone: "Europe/Warsaw" },
  { city: "莫斯科", zone: "Europe/Moscow" },
  { city: "纽约", zone: "America/New_York" },
  { city: "多伦多", zone: "America/Toronto" },
  { city: "芝加哥", zone: "America/Chicago" },
  { city: "休斯敦", zone: "America/Chicago" },
  { city: "洛杉矶", zone: "America/Los_Angeles" },
  { city: "温哥华", zone: "America/Vancouver" },
  { city: "迈阿密", zone: "America/New_York" },
  { city: "墨西哥城", zone: "America/Mexico_City" },
  { city: "波哥大", zone: "America/Bogota" },
  { city: "利马", zone: "America/Lima" },
  { city: "圣地亚哥", zone: "America/Santiago" },
  { city: "布宜诺斯艾利斯", zone: "America/Argentina/Buenos_Aires" },
  { city: "圣保罗", zone: "America/Sao_Paulo" },
  { city: "里约热内卢", zone: "America/Sao_Paulo" },
  { city: "悉尼", zone: "Australia/Sydney" },
  { city: "墨尔本", zone: "Australia/Melbourne" },
  { city: "珀斯", zone: "Australia/Perth" },
  { city: "奥克兰", zone: "Pacific/Auckland" }
];

const themeOptions: ThemeKey[] = ["industrial", "clean-export", "premium-brand", "equipment", "consumer-goods"];
const roleOptions: RoleKey[] = ["super-admin", "admin", "editor", "sales", "viewer"];
const leadStatuses: LeadStatus[] = ["new", "contacted", "quoted", "closed", "spam"];
const contactTypeOptions: ContactChannelType[] = [
  "phone",
  "whatsapp",
  "email",
  "wechat",
  "zalo",
  "line",
  "facebook",
  "instagram",
  "tiktok",
  "messenger",
  "linkedin",
  "skype",
  "rfq",
  "custom"
];
const contactTypePresets: Record<ContactChannelType, { en: string; zh: string; value: string; href: string; color: string }> = {
  phone: { en: "Phone", zh: "电话", value: "+86 188 0000 0000", href: "tel:+8618800000000", color: "#10b981" },
  whatsapp: { en: "WhatsApp", zh: "WhatsApp", value: "+86 188 0000 0000", href: "https://wa.me/8618800000000", color: "#25d366" },
  email: { en: "Email", zh: "邮箱", value: "sales@keyprotools.com", href: "mailto:sales@keyprotools.com", color: "#ff4f66" },
  wechat: { en: "WeChat", zh: "微信", value: "KeyproTools", href: "#wechat", color: "#23c80d" },
  zalo: { en: "Zalo", zh: "Zalo", value: "+84 900 000 000", href: "https://zalo.me/84900000000", color: "#0068ff" },
  line: { en: "Line", zh: "Line", value: "@keyprotools", href: "https://line.me/R/ti/p/@keyprotools", color: "#06c755" },
  facebook: { en: "Facebook", zh: "Facebook", value: "KeyproTools", href: "https://facebook.com/keyprotools", color: "#1877f2" },
  instagram: { en: "Instagram", zh: "Instagram", value: "@keyprotools", href: "https://instagram.com/keyprotools", color: "#e4405f" },
  tiktok: { en: "TikTok", zh: "TikTok", value: "@keyprotools", href: "https://www.tiktok.com/@keyprotools", color: "#111827" },
  messenger: { en: "Messenger", zh: "Messenger", value: "KeyproTools", href: "https://m.me/keyprotools", color: "#0084ff" },
  linkedin: { en: "LinkedIn", zh: "LinkedIn", value: "KeyproTools", href: "https://www.linkedin.com/company/keyprotools", color: "#0a66c2" },
  skype: { en: "Skype", zh: "Skype", value: "live:keyprotools", href: "skype:live:keyprotools?chat", color: "#00aff0" },
  rfq: { en: "RFQ", zh: "询盘", value: "Request quote", href: "#rfq", color: "#243b78" },
  custom: { en: "Custom", zh: "自定义", value: "", href: "", color: "#0b5f7d" }
};
const frontendManagerRoles = new Set<RoleKey>(["super-admin", "admin"]);
const systemNavigationOptions = [
  { label: "首页", href: "/" },
  { label: "产品列表", href: "/products" },
  { label: "文章列表", href: "/articles" },
  { label: "资料下载", href: "/files" },
  { label: "联系询盘", href: "/contact" },
  { label: "首页询盘区", href: "#rfq" }
];
const articleImportHeaders = [
  "slug",
  "category",
  "status",
  "featured_on_home",
  "title_zh",
  "title_en",
  "excerpt_zh",
  "excerpt_en",
  "body_zh",
  "body_en",
  "published_at"
] as const;
const truthyImportValues = new Set(["1", "true", "yes", "y", "是", "首页"]);
const falsyImportValues = new Set(["0", "false", "no", "n", "否"]);
const mediaTypeOptions: { value: MediaTypeFilter; label: string }[] = [
  { value: "all", label: "全部类型" },
  { value: "image", label: "图片" },
  { value: "document", label: "文档 / PDF" },
  { value: "spreadsheet", label: "表格" },
  { value: "archive", label: "压缩包" },
  { value: "other", label: "其他" }
];
const mediaTimeOptions: { value: MediaTimeFilter; label: string }[] = [
  { value: "all", label: "全部时间" },
  { value: "7d", label: "最近 7 天" },
  { value: "30d", label: "最近 30 天" },
  { value: "90d", label: "最近 90 天" }
];
const settingsSections: { key: SettingsSection; label: string; description: string }[] = [
  { key: "general", label: "常规", description: "站点标题、网址、语言和时区。" },
  { key: "writing", label: "撰写", description: "文章默认分类与发布方式。" },
  { key: "reading", label: "阅读", description: "首页内容、列表数量和搜索可见性。" },
  { key: "media", label: "媒体", description: "图片尺寸和媒体整理方式。" },
  { key: "permalinks", label: "固定链接", description: "产品、文章和资料的 URL 基础路径。" },
  { key: "privacy", label: "隐私", description: "隐私页面、Cookie 提示和数据说明。" },
  { key: "ai", label: "AI", description: "模型、API 和积分。" },
  { key: "translation", label: "翻译设置", description: "多语言自动翻译。" },
  { key: "backup", label: "备份导入", description: "按模块导入导出整站数据。" }
];
const backupSectionOptions: { key: BackupSectionKey; label: string; description: string }[] = [
  { key: "products", label: "产品分类", description: "产品目录、分类关系、规格和图片 URL。" },
  { key: "pages", label: "页面", description: "独立页面、状态、正文和发布时间。" },
  { key: "articles", label: "文章", description: "文章标题、摘要、正文、分类和封面。" },
  { key: "leads", label: "询盘", description: "客户询盘、状态和分配记录。" },
  { key: "contactChannels", label: "社媒及联系", description: "联系方式、浮窗渠道、二维码 URL。" },
  { key: "uploadedFiles", label: "媒体记录", description: "媒体库列表、文件名、URL 和说明。" },
  { key: "navigation", label: "导航栏", description: "前台菜单、子菜单、启用和排序。" },
  { key: "siteSettings", label: "常规设置", description: "站点标题、URL、语言、固定链接和隐私设置。" },
  { key: "templateSettings", label: "首页模板设置", description: "首屏、轮播、模块显示和首页数量。" },
  { key: "activeTheme", label: "主题", description: "当前前台主题。" },
  { key: "enabledLocales", label: "语言", description: "前台启用语言列表。" },
  { key: "users", label: "用户权限", description: "后台用户、角色、可访问页面和密码哈希。" },
  { key: "aiSettings", label: "AI 配置", description: "模型供应商、Base URL、API Key 和品牌语气。" },
  { key: "aiCreditSettings", label: "AI 积分设置", description: "积分扣减和价格规则。" },
  { key: "aiUsageRecords", label: "AI 消耗记录", description: "用户 AI 调用和积分消耗明细。" }
];
const sensitiveBackupSections = new Set<BackupSectionKey>(["users", "aiSettings", "aiCreditSettings", "aiUsageRecords"]);
const defaultBackupSections: BackupSectionKey[] = [
  "products",
  "pages",
  "articles",
  "contactChannels",
  "uploadedFiles",
  "navigation",
  "siteSettings",
  "templateSettings",
  "activeTheme",
  "enabledLocales"
];
const homeSectionOptions: { key: HomeSectionKey; label: string; description: string }[] = [
  { key: "products", label: "产品目录", description: "首页产品分类卡片模块。" },
  { key: "factory", label: "工厂能力", description: "几何、涂层、包装等能力说明。" },
  { key: "markets", label: "出口市场", description: "多语言与 RFQ 清单说明模块。" },
  { key: "articles", label: "技术文章", description: "首页文章卡片模块。" },
  { key: "rfq", label: "询盘表单", description: "首页底部报价表单模块。" }
];
const homeProductSlugs = [
  "carbide-end-mills",
  "drill-bits",
  "custom-tooling",
  "square-end-mills",
  "solid-carbide-drills",
  "coating-oem-packaging"
];
const aiTargetOptions: { key: AiContentTarget; label: string; description: string }[] = [
  { key: "article", label: "文章", description: "生成技术文章、采购指南和 SEO 内容。" },
  { key: "page", label: "页面", description: "生成关于我们、服务说明、资料页等独立页面。" }
];
const aiProviderOptions = [
  { value: "openai-compatible", label: "OpenAI-compatible / 通用兼容", baseUrl: "", models: ["gpt-4.1-mini", "qwen-plus", "deepseek-v4-flash", "glm-4.5", "kimi-k2.6"] },
  { value: "openai", label: "OpenAI", baseUrl: "https://api.openai.com/v1", models: ["gpt-4.1-mini", "gpt-4.1", "gpt-4.1-nano", "gpt-4o-mini", "gpt-4o"] },
  { value: "deepseek", label: "DeepSeek 深度求索", baseUrl: "https://api.deepseek.com", models: ["deepseek-v4-flash", "deepseek-v4-pro", "deepseek-chat", "deepseek-reasoner"] },
  { value: "qwen-cn", label: "阿里云百炼 Qwen（中国北京）", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", models: ["qwen3-max-2026-01-23", "qwen3-max", "qwen3.5-plus", "qwen-plus", "qwen-max", "qwen-turbo", "qwen-coder-plus", "qwen-vl-plus"] },
  { value: "qwen-intl", label: "阿里云百炼 Qwen（国际站）", baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1", models: ["qwen3-max-2026-01-23", "qwen3-max", "qwen3.5-plus", "qwen-plus", "qwen-max", "qwen-turbo", "qwen-coder-plus", "qwen-vl-plus"] },
  { value: "kimi", label: "Moonshot / Kimi", baseUrl: "https://api.moonshot.ai/v1", models: ["kimi-k2.6", "kimi-k2.5", "kimi-for-coding", "moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"] },
  { value: "zhipu", label: "智谱 / Z.ai GLM", baseUrl: "https://open.bigmodel.cn/api/paas/v4", models: ["glm-5.1", "glm-5", "glm-4.7", "glm-4.6", "glm-4.5", "glm-4.5-air", "glm-4.5-flash", "glm-4.5v", "glm-4.6v", "glm-4.6v-flash"] },
  { value: "baidu-qianfan", label: "百度千帆 / ERNIE", baseUrl: "https://api.baiduqianfan.ai/v1", models: ["ernie-5.0", "ernie-4.0-turbo-8k", "ernie-4.0-turbo-128k", "ernie-speed-128k", "ernie-lite-8k"] },
  { value: "tencent-hunyuan", label: "腾讯混元", baseUrl: "https://api.hunyuan.cloud.tencent.com/v1", models: ["hunyuan-pro", "hunyuan-standard", "hunyuan-lite", "hunyuan-2.0-instruct"] },
  { value: "volcengine-ark", label: "火山方舟 / 豆包", baseUrl: "https://ark.cn-beijing.volces.com/api/v3", models: ["doubao-seed-1-6-251015", "doubao-seed-1-6-250615", "doubao-seed-1-6-vision-250815", "doubao-seed-code"] },
  { value: "minimax", label: "MiniMax", baseUrl: "https://api.minimax.io/v1", models: ["MiniMax-M2.7", "MiniMax-M2.7-highspeed", "MiniMax-M2.5", "MiniMax-M1", "abab6.5s-chat"] },
  { value: "iflytek-spark", label: "讯飞星火", baseUrl: "https://spark-api-open.xf-yun.com/x2", models: ["spark-x", "spark-x1", "4.0Ultra", "generalv3.5", "lite"] },
  { value: "siliconflow", label: "硅基流动 SiliconFlow", baseUrl: "https://api.siliconflow.cn/v1", models: ["Pro/zai-org/GLM-4.7", "Pro/deepseek-ai/DeepSeek-V3.2", "deepseek-ai/DeepSeek-V3.2", "Qwen/Qwen3.5-122B-A10B", "Qwen/Qwen3-32B", "tencent/Hunyuan-A13B-Instruct"] },
  { value: "anthropic", label: "Anthropic Claude", baseUrl: "https://api.anthropic.com/v1", models: ["claude-sonnet-4-5", "claude-3-5-haiku-latest"] },
  { value: "custom", label: "自定义", baseUrl: "", models: [] }
];
const customAiModelValue = "__custom_ai_model__";
const aiWriteModeOptions: { key: AiWriteMode; label: string; description: string }[] = [
  { key: "new", label: "新建草稿", description: "创建新的文章或页面，保留现有内容。" },
  { key: "replace", label: "替换目标", description: "用生成内容覆盖所选文章或页面。" },
  { key: "append", label: "追加正文", description: "保留标题摘要，把生成正文追加到目标末尾。" }
];
const aiWorkbenchSections: { key: AiWorkbenchSection; label: string; description: string }[] = [
  { key: "generate", label: "生成", description: "生成文章或页面内容。" }
];
const translationScopeOptions: { key: TranslationScope; label: string; description: string }[] = [
  { key: "all", label: "全站内容", description: "文章、页面、产品、模板、导航和媒体说明。" },
  { key: "article", label: "文章", description: "补齐所有文章，或从文章编辑器补齐当前文章。" },
  { key: "page", label: "页面", description: "补齐所有页面，或从页面编辑器补齐当前页面。" },
  { key: "products", label: "产品分类", description: "产品名称、摘要和应用列表。" },
  { key: "templates", label: "前台模板", description: "首页模板、轮播替代文本和可视化文案。" },
  { key: "navigation", label: "导航栏", description: "前台导航菜单文案。" }
];
const siteFontOptions = [
  { label: "现代无衬线（默认）", value: "\"Manrope\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif" },
  { label: "工业清晰", value: "\"Archivo\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif" },
  { label: "系统字体", value: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif" },
  { label: "中文商务", value: "\"PingFang SC\", \"Microsoft YaHei\", \"Noto Sans CJK SC\", sans-serif" },
  { label: "经典衬线", value: "Georgia, \"Times New Roman\", \"Songti SC\", SimSun, serif" }
];
const hiddenAdminStatusMessages = new Set([
  "图片已插入正文，点击保存或发布后生效",
  "媒体链接已插入正文，点击保存或发布后生效",
  "图片已上传并插入正文，点击保存或发布后生效",
  "媒体已上传并插入正文，点击保存或发布后生效"
]);

const emptyProductForm: ProductFormState = {
  zh: "",
  en: "",
  slug: "",
  parentId: "",
  summaryZh: "",
  summaryEn: ""
};
const emptyNewUserForm: NewUserFormState = {
  name: "",
  email: "",
  role: "viewer",
  password: "",
  aiCredits: 0
};
const emptyAiContentForm: AiContentFormState = {
  target: "article",
  writeMode: "new",
  targetArticleId: "",
  targetPageId: "",
  topic: "",
  category: ""
};
const emptyCollectorForm: CollectorFormState = {
  sourceUrl: "",
  sourceText: "",
  target: "article",
  category: ""
};

function createContactForm(type: ContactChannelType = "custom"): ContactFormState {
  const preset = contactTypePresets[type];
  const shouldPrefill = type !== "custom";

  return {
    type,
    zh: shouldPrefill ? preset.zh : "",
    en: shouldPrefill ? preset.en : "",
    value: shouldPrefill ? preset.value : "",
    href: shouldPrefill ? preset.href : "",
    color: preset.color
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSlug(value: string, existingSlugs: string[], fallback: string) {
  const base = slugify(value) || `${fallback}-${Date.now()}`;
  const used = new Set(existingSlugs);
  let candidate = base;
  let suffix = 2;

  while (used.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => (word.length <= 2 ? word.toUpperCase() : `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`))
    .join(" ");
}

function joinHumanList(items: string[], fallback: string) {
  return items.length > 0 ? items.join(", ") : fallback;
}

function escapeCsvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value);
}

function buildCsv(rows: string[][]) {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function normalizeArticleCategory(value: string, fallback = "uncategorized") {
  return slugify(value) || fallback;
}

function parseFeaturedOnHome(value: string) {
  const normalized = value.trim().toLowerCase();
  if (falsyImportValues.has(normalized)) return false;
  if (truthyImportValues.has(normalized)) return true;
  return true;
}

function normalizeCsvHeader(value: string) {
  return value.trim().replace(/^\uFEFF/, "").toLowerCase();
}

function rowToRecord(headers: string[], row: string[]) {
  return headers.reduce<Record<string, string>>((record, header, index) => {
    record[header] = row[index]?.trim() ?? "";
    return record;
  }, {});
}

function normalizeArticleStatus(value: string): Article["status"] {
  return value.trim().toLowerCase() === "published" ? "published" : "draft";
}

function productToForm(product: ProductCategory): ProductFormState {
  return {
    zh: product.name.zh ?? "",
    en: product.name.en,
    slug: product.slug,
    parentId: product.parentId ?? "",
    summaryZh: product.summary.zh ?? "",
    summaryEn: product.summary.en
  };
}

function emptyProduct(): ProductCategory {
  const id = `product-${Date.now()}`;
  return {
    id,
    slug: id,
    name: { en: "New Product Category", zh: "新产品品类" },
    summary: { en: "Describe this product category for overseas buyers.", zh: "填写面向海外买家的产品介绍。" },
    applications: { en: ["OEM", "Wholesale"] },
    specs: ["MOQ ready", "Custom packaging"],
    themeFit: ["industrial"]
  };
}

function applyThemeToDocument(themeKey: ThemeKey) {
  if (typeof document === "undefined") return;
  const theme = themes[themeKey] ?? themes.industrial;
  const root = document.documentElement;

  root.dataset.theme = theme.key;
  root.style.setProperty("--ink", theme.colors.ink);
  root.style.setProperty("--muted", theme.colors.muted);
  root.style.setProperty("--bg", theme.colors.background);
  root.style.setProperty("--panel", theme.colors.panel);
  root.style.setProperty("--primary", theme.colors.primary);
  root.style.setProperty("--accent", theme.colors.accent);
  root.style.setProperty("--line", theme.colors.line);
  root.style.setProperty("--radius", theme.radius);
}

function applySiteFontToDocument(fontFamily: string) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--site-font", fontFamily || siteFontOptions[0].value);
}

function escapeEditableHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markdownToEditableHtml(body: string) {
  const blocks = body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  if (blocks.length === 0) return "";

  return blocks.map((block) => {
    const imageMatch = /^!\[([^\]]*)]\(([^)]+)\)$/.exec(block);
    const legacyImageMatch = /^\[下载文件：([^\]]+)]\(([^)]+)\)$/.exec(block);

    if (imageMatch) {
      return `<figure class="article-inline-image" contenteditable="false"><img src="${escapeEditableHtml(imageMatch[2])}" alt="${escapeEditableHtml(imageMatch[1] || "Article image")}"></figure>`;
    }

    if (legacyImageMatch && /\.(apng|avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(`${legacyImageMatch[1]} ${legacyImageMatch[2]}`)) {
      return `<figure class="article-inline-image" contenteditable="false"><img src="${escapeEditableHtml(legacyImageMatch[2])}" alt="${escapeEditableHtml(legacyImageMatch[1] || "Article image")}"></figure>`;
    }

    const safeBlock = escapeEditableHtml(block).replace(/\n/g, "<br>");
    if (block.startsWith("# ")) return `<h1>${escapeEditableHtml(block.slice(2))}</h1>`;
    if (block.startsWith("## ")) return `<h2>${escapeEditableHtml(block.slice(3))}</h2>`;
    if (block.startsWith("### ")) return `<h3>${escapeEditableHtml(block.slice(4))}</h3>`;
    if (block.startsWith("#### ")) return `<h4>${escapeEditableHtml(block.slice(5))}</h4>`;
    return `<p>${safeBlock}</p>`;
  }).join("");
}

function editableNodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof HTMLElement)) return "";

  if (node.tagName === "BR") return "\n";
  if (node.tagName === "IMG") return `![${node.getAttribute("alt") ?? ""}](${node.getAttribute("src") ?? ""})`;
  if (node.tagName === "FIGURE") {
    const image = node.querySelector("img");
    return image ? `![${image.getAttribute("alt") ?? ""}](${image.getAttribute("src") ?? ""})` : "";
  }

  const content = Array.from(node.childNodes).map(editableNodeToMarkdown).join("").trim();

  if (!content) return "";
  if (node.tagName === "STRONG" || node.tagName === "B") return `**${content}**`;
  if (node.tagName === "EM" || node.tagName === "I") return `*${content}*`;
  if (node.tagName === "S" || node.tagName === "STRIKE" || node.tagName === "DEL") return `~~${content}~~`;
  if (node.tagName === "U") return `<u>${content}</u>`;
  if (node.tagName === "SUP") return `<sup>${content}</sup>`;
  if (node.tagName === "SUB") return `<sub>${content}</sub>`;
  if (node.tagName === "A") return `[${content}](${node.getAttribute("href") ?? ""})`;
  if (node.tagName === "H1") return `# ${content}`;
  if (node.tagName === "H2") return `## ${content}`;
  if (node.tagName === "H3") return `### ${content}`;
  if (node.tagName === "H4") return `#### ${content}`;
  if (node.tagName === "BLOCKQUOTE") return content.split("\n").map((line) => `> ${line}`).join("\n");
  if (node.tagName === "LI") return `- ${content}`;

  return content;
}

function editableHtmlToMarkdown(root: HTMLElement) {
  return Array.from(root.childNodes)
    .map(editableNodeToMarkdown)
    .map((block) => block.trim())
    .filter(Boolean)
    .join("\n\n");
}

function emptyArticle(category = "uncategorized"): Article {
  const id = `article-${Date.now()}`;
  return {
    id,
    slug: id,
    title: { en: "New buying guide", zh: "新文章标题" },
    excerpt: { en: "Short summary shown on article cards and homepage.", zh: "这段摘要会显示在文章卡片和首页。" },
    body: { en: "Write the full article content here.", zh: "在这里填写文章正文。" },
    category,
    status: "draft",
    featuredOnHome: true
  };
}

function emptyPage(): SitePage {
  const id = `page-${Date.now()}`;
  return {
    id,
    slug: id,
    title: { en: "New page", zh: "新页面" },
    excerpt: { en: "Short page summary.", zh: "填写页面摘要。" },
    body: { en: "Write page content here.", zh: "在这里填写页面内容。" },
    status: "draft"
  };
}

function emptyNavigationItem(order: number, parentId?: string): SiteNavigationItem {
  const id = `nav-custom-${Date.now()}`;

  return {
    id,
    label: { en: "New Link", zh: "新导航" },
    href: "/",
    enabled: true,
    order,
    parentId
  };
}

function articleStatusLabel(article: Article) {
  if (article.status === "trash") return "回收站";
  if (article.status === "published") return "已发布";
  return "草稿";
}

function pageStatusLabel(page: SitePage) {
  if (page.status === "trash") return "回收站";
  if (page.status === "published") return "已发布";
  return "草稿";
}

function createSingleLanguageTranslation(value: string) {
  return { en: value, zh: value };
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getMediaType(file: UploadedFile): MediaTypeFilter {
  const mimeType = file.mimeType.toLowerCase();
  const name = file.name.toLowerCase();

  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || /\.(csv|xls|xlsx|ods)$/.test(name)) return "spreadsheet";
  if (mimeType.includes("pdf") || mimeType.includes("word") || mimeType.includes("document") || /\.(pdf|doc|docx|txt|md|rtf)$/.test(name)) return "document";
  if (mimeType.includes("zip") || mimeType.includes("compressed") || /\.(zip|rar|7z|gz|tar)$/.test(name)) return "archive";
  return "other";
}

function getMediaTypeLabel(file: UploadedFile) {
  return mediaTypeOptions.find((option) => option.value === getMediaType(file))?.label ?? "其他";
}

function buildArticleMediaMarkup(file: UploadedFile) {
  const label = sanitizeMarkdownLabel(file.name);
  if (getMediaType(file) === "image") {
    return `\n\n![${label}](${file.url})\n\n`;
  }

  return `\n\n[下载文件：${label}](${file.url})\n\n`;
}

function sanitizeMarkdownLabel(value: string) {
  return value.replace(/[[\]\n\r]/g, " ").trim() || "文件";
}

function compactOptionLabel(value: string, fallback: string) {
  const label = value.trim() || fallback;
  return label.length > 24 ? `${label.slice(0, 24)}...` : label;
}

function getProductId(product: ProductCategory) {
  return product.id ?? product.slug;
}

function productMatchesQuery(product: ProductCategory, query: string) {
  if (!query) return true;
  return [
    product.name.zh,
    product.name.en,
    product.slug,
    product.summary.zh,
    product.summary.en
  ].filter(Boolean).some((value) => value?.toLowerCase().includes(query));
}

function buildProductTableRows(products: ProductCategory[], rawQuery: string): ProductTableRow[] {
  const query = rawQuery.trim().toLowerCase();
  const productIds = new Set(products.map(getProductId));
  const childrenByParent = new Map<string, ProductCategory[]>();
  const roots: ProductCategory[] = [];
  const visited = new Set<string>();

  products.forEach((product) => {
    if (product.parentId && productIds.has(product.parentId)) {
      const siblings = childrenByParent.get(product.parentId) ?? [];
      siblings.push(product);
      childrenByParent.set(product.parentId, siblings);
      return;
    }

    roots.push(product);
  });

  function walk(product: ProductCategory, depth: number, forceVisible = false): ProductTableRow[] {
    const productId = getProductId(product);
    if (visited.has(productId)) return [];
    visited.add(productId);

    const selfVisible = forceVisible || productMatchesQuery(product, query);
    const childRows = (childrenByParent.get(productId) ?? []).flatMap((child) => walk(child, depth + 1, selfVisible));

    if (!selfVisible && childRows.length === 0) return [];
    return [{ product, depth }, ...childRows];
  }

  const rows = roots.flatMap((product) => walk(product, 0));
  const orphanRows = products.flatMap((product) => visited.has(getProductId(product)) ? [] : walk(product, 0));

  return [...rows, ...orphanRows];
}

function navigationWouldCreateCycle(items: SiteNavigationItem[], itemId: string, nextParentId?: string) {
  const parentById = new Map(items.map((item) => [item.id, item.parentId]));
  const visited = new Set([itemId]);
  let currentParentId = nextParentId;

  while (currentParentId) {
    if (visited.has(currentParentId)) return true;
    visited.add(currentParentId);
    currentParentId = parentById.get(currentParentId);
  }

  return false;
}

function buildNavigationTableRows(items: SiteNavigationItem[]): NavigationTableRow[] {
  const sortedItems = [...items].sort((a, b) => a.order - b.order);
  const itemIds = new Set(sortedItems.map((item) => item.id));
  const childrenByParent = new Map<string, SiteNavigationItem[]>();
  const roots: SiteNavigationItem[] = [];
  const visited = new Set<string>();

  sortedItems.forEach((item) => {
    if (item.parentId && itemIds.has(item.parentId)) {
      const siblings = childrenByParent.get(item.parentId) ?? [];
      siblings.push(item);
      childrenByParent.set(item.parentId, siblings);
      return;
    }

    roots.push(item);
  });

  function walk(item: SiteNavigationItem, depth: number): NavigationTableRow[] {
    if (visited.has(item.id)) return [];
    visited.add(item.id);
    const children = childrenByParent.get(item.id) ?? [];

    return [
      { item, depth, childCount: children.length },
      ...children.flatMap((child) => walk(child, depth + 1))
    ];
  }

  const rows = roots.flatMap((item) => walk(item, 0));
  const orphanRows = sortedItems.flatMap((item) => visited.has(item.id) ? [] : walk(item, 0));

  return [...rows, ...orphanRows];
}

function normalizeInitialTab(value?: string): Tab {
  return value && tabKeys.has(value as Tab) ? value as Tab : "overview";
}

function getAllowedTabsForUser(user?: AdminUser) {
  const roleDefaults = defaultAllowedTabsByRole[user?.role ?? "viewer"] ?? defaultAllowedTabsByRole.viewer;
  const allowedTabs = user?.allowedTabs?.filter((item): item is Tab => tabKeys.has(item as Tab) && item !== "account");
  if (!allowedTabs || allowedTabs.length === 0) return roleDefaults;

  if ((user?.role === "super-admin" || user?.role === "admin") && allowedTabs.includes("settings")) {
    const nextTabs = [...allowedTabs];
    const settingsIndex = nextTabs.indexOf("settings");

    (["navigation", "templates", "ai"] as Tab[]).forEach((requiredTab) => {
      if (nextTabs.includes(requiredTab)) return;
      nextTabs.splice(Math.max(0, settingsIndex), 0, requiredTab);
    });

    return nextTabs;
  }

  return allowedTabs;
}

export function AdminApp({ email, initialTab, locale }: { email: string; initialTab?: string; locale: LocaleCode }) {
  const [tab, setTab] = useState<Tab>(normalizeInitialTab(initialTab));
  const [state, setState] = useState<AdminState | null>(null);
  const [status, setStatus] = useState("加载后台数据...");
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [articleMode, setArticleMode] = useState<"list" | "editor">("list");
  const [articleEditorView, setArticleEditorView] = useState<ArticleEditorView>("visual");
  const [articleQuery, setArticleQuery] = useState("");
  const [articleStatusFilter, setArticleStatusFilter] = useState<"all" | "published" | "draft" | "trash">("all");
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<string>("all");
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  const [articleBulkAction, setArticleBulkAction] = useState("");
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [pageMode, setPageMode] = useState<PageMode>("list");
  const [pageQuery, setPageQuery] = useState("");
  const [pageStatusFilter, setPageStatusFilter] = useState<"all" | "published" | "draft" | "trash">("all");
  const [productQuery, setProductQuery] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>([]);
  const [productBulkAction, setProductBulkAction] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>("all");
  const [mediaTimeFilter, setMediaTimeFilter] = useState<MediaTimeFilter>("all");
  const [mediaQuery, setMediaQuery] = useState("");
  const [articleMediaPickerOpen, setArticleMediaPickerOpen] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormState>(() => createContactForm());
  const [newUserForm, setNewUserForm] = useState<NewUserFormState>(emptyNewUserForm);
  const [expandedUserPermissionsId, setExpandedUserPermissionsId] = useState<string | null>(null);
  const [resetUserPasswords, setResetUserPasswords] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [accountPassword, setAccountPassword] = useState({ current: "", next: "", confirm: "" });
  const [frontendSettingsDirty, setFrontendSettingsDirty] = useState(false);
  const [newHeroSlideUrl, setNewHeroSlideUrl] = useState("");
  const [templateEditorMode, setTemplateEditorMode] = useState<TemplateEditorMode>("form");
  const [visualEditingKey, setVisualEditingKey] = useState<string | null>(null);
  const [visualDraftValue, setVisualDraftValue] = useState("");
  const [aiContentForm, setAiContentForm] = useState<AiContentFormState>(emptyAiContentForm);
  const [aiWorkbenchSection, setAiWorkbenchSection] = useState<AiWorkbenchSection>("generate");
  const [aiDraftPreview, setAiDraftPreview] = useState<AiContentDraft | null>(null);
  const [aiGeneratedImage, setAiGeneratedImage] = useState<AiGeneratedImage | null>(null);
  const [aiImageStatus, setAiImageStatus] = useState("");
  const [collectorForm, setCollectorForm] = useState<CollectorFormState>(emptyCollectorForm);
  const [collectorDraft, setCollectorDraft] = useState<AiContentDraft | null>(null);
  const [collectorStatus, setCollectorStatus] = useState("");
  const [aiTestStatus, setAiTestStatus] = useState("");
  const [translationScope, setTranslationScope] = useState<TranslationScope>("all");
  const [translationSourceLocale, setTranslationSourceLocale] = useState<LocaleCode>("zh");
  const [translationOverwrite, setTranslationOverwrite] = useState(false);
  const [translationStatus, setTranslationStatus] = useState("");
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("general");
  const [backupSections, setBackupSections] = useState<BackupSectionKey[]>(defaultBackupSections);
  const [backupIncludeFiles, setBackupIncludeFiles] = useState(false);
  const [backupImportSections, setBackupImportSections] = useState<BackupSectionKey[]>(defaultBackupSections);
  const [backupImportFiles, setBackupImportFiles] = useState(false);
  const [backupStatus, setBackupStatus] = useState("选择要导出的数据模块，生成 JSON 后可用于恢复。");
  const [clockNow, setClockNow] = useState<Date | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const visualEditorRef = useRef<HTMLDivElement | null>(null);
  const visualEditorInputRef = useRef(false);
  const backupImportInputRef = useRef<HTMLInputElement | null>(null);
  const activeThemeKey = state?.activeTheme;
  const activeArticle = state?.articles.find((article) => (article.id ?? article.slug) === activeArticleId)
    ?? state?.articles.find((article) => article.status !== "trash")
    ?? state?.articles[0];
  const activeArticleIndex = state && activeArticle ? state.articles.findIndex((article) => (article.id ?? article.slug) === (activeArticle.id ?? activeArticle.slug)) : -1;
  const activeArticleBody = activeArticle?.body?.zh ?? activeArticle?.body?.en ?? "";
  const activePage = state?.pages.find((page) => (page.id ?? page.slug) === activePageId)
    ?? state?.pages.find((page) => page.status !== "trash")
    ?? state?.pages[0];
  const activePageIndex = state && activePage ? state.pages.findIndex((page) => (page.id ?? page.slug) === (activePage.id ?? activePage.slug)) : -1;

  useEffect(() => {
    setTab(normalizeInitialTab(initialTab));
  }, [initialTab]);

  useEffect(() => {
    if (tab !== "ai" && aiTestStatus) setAiTestStatus("");
  }, [tab, aiTestStatus]);

  useEffect(() => {
    if (!aiTestStatus || aiTestStatus.includes("正在测试")) return;

    const timer = window.setTimeout(() => {
      setAiTestStatus("");
    }, 6500);

    return () => window.clearTimeout(timer);
  }, [aiTestStatus]);

  useEffect(() => {
    fetch("/api/admin/state")
      .then((response) => {
        if (!response.ok) throw new Error("Unauthorized");
        return response.json();
      })
      .then((payload: AdminState) => {
        const sessionUser = payload.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? payload.users[0];
        setState(payload);
        setCurrentUserId(sessionUser?.id ?? null);
        applyThemeToDocument(payload.activeTheme);
        applySiteFontToDocument(payload.siteSettings.fontFamily);
        setStatus("已连接本地后台数据");
      })
      .catch(() => setStatus("后台会话失效，请重新登录"));
  }, [email]);

  useEffect(() => {
    if (activeThemeKey) applyThemeToDocument(activeThemeKey);
  }, [activeThemeKey]);

  useEffect(() => {
    setClockNow(new Date());
    const timer = window.setInterval(() => setClockNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const editor = visualEditorRef.current;
    if (!editor || articleEditorView !== "visual") return;
    if (visualEditorInputRef.current) {
      visualEditorInputRef.current = false;
      return;
    }
    const nextHtml = markdownToEditableHtml(activeArticleBody);
    if (editor.innerHTML !== nextHtml) editor.innerHTML = nextHtml;
  }, [activeArticle?.id, activeArticle?.slug, activeArticleBody, articleEditorView]);

  const stats = useMemo(() => {
    if (!state) return null;
    return [
      ["产品品类", state.products.length],
      ["已发布页面", state.pages.filter((page) => page.status === "published").length],
      ["已发布文章", state.articles.filter((article) => article.status === "published").length],
      ["媒体资源", state.uploadedFiles.length],
      ["询盘", state.leads.length],
      ["联系渠道", state.contactChannels.filter((item) => item.enabled).length]
    ];
  }, [state]);

  const worldClocks = useMemo(() => {
    if (!clockNow) return worldClockCities.map((item) => ({ ...item, time: "--:--", date: "--" }));
    return worldClockCities.map((item) => ({
      ...item,
      time: new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: item.zone
      }).format(clockNow),
      date: new Intl.DateTimeFormat("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
        timeZone: item.zone
      }).format(clockNow)
    }));
  }, [clockNow]);

  async function save(nextState = state) {
    if (!nextState) return;
    setStatus("保存中...");
    const response = await fetch("/api/admin/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextState)
    });
    if (!response.ok) {
      setStatus(response.status === 403 ? "保存失败：当前账号没有权限修改这些设置" : "保存失败：请检查登录状态");
      return;
    }
    const payload = (await response.json()) as AdminState;
    setState(payload);
    setFrontendSettingsDirty(false);
    setStatus("已保存");
  }

  function toggleBackupSection(section: BackupSectionKey, target: "export" | "import") {
    const selected = target === "export" ? backupSections : backupImportSections;
    const setSelected = target === "export" ? setBackupSections : setBackupImportSections;
    setSelected(selected.includes(section) ? selected.filter((item) => item !== section) : [...selected, section]);
  }

  function selectAllBackupSections(target: "export" | "import") {
    const canSelectSensitiveSections = getCurrentUser()?.role === "super-admin";
    const allSections = backupSectionOptions
      .map((item) => item.key)
      .filter((section) => canSelectSensitiveSections || !sensitiveBackupSections.has(section));
    if (target === "export") {
      setBackupSections(backupSections.length === allSections.length ? [] : allSections);
    } else {
      setBackupImportSections(backupImportSections.length === allSections.length ? [] : allSections);
    }
  }

  async function exportSiteBackup() {
    if (!state) return;
    if (!backupSections.length) {
      setBackupStatus("请至少选择一个要导出的数据模块。");
      return;
    }
    setBackupStatus("正在生成备份文件...");
    const response = await fetch("/api/admin/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "export",
        sections: backupSections,
        includeFiles: backupIncludeFiles
      })
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setBackupStatus(payload.error ?? "备份导出失败，请检查登录状态。");
      return;
    }
    const payload = await response.json();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const link = document.createElement("a");
    link.href = url;
    link.download = `exportforge-site-backup-${timestamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupStatus(`已导出 ${backupSections.length} 个模块${backupIncludeFiles ? "，包含媒体文件内容" : ""}。`);
  }

  async function importSiteBackup(file: File | null) {
    if (!file) return;
    if (!backupImportSections.length) {
      setBackupStatus("请至少选择一个要导入的数据模块。");
      return;
    }
    setBackupStatus("正在读取备份文件...");
    try {
      const backup = JSON.parse(await file.text());
      setBackupStatus("正在导入选中的数据模块...");
      const response = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          sections: backupImportSections,
          includeFiles: backupImportFiles,
          backup
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setBackupStatus(payload.error ?? "导入失败，请检查备份文件格式。");
        return;
      }
      if (payload.state) {
        setState(payload.state);
        applyThemeToDocument(payload.state.activeTheme);
        applySiteFontToDocument(payload.state.siteSettings.fontFamily);
      }
      setFrontendSettingsDirty(false);
      setBackupStatus(`已导入 ${payload.importedSections?.length ?? backupImportSections.length} 个模块${payload.importedFileCount ? `，恢复 ${payload.importedFileCount} 个媒体文件` : ""}。`);
      setStatus("整站数据导入完成");
    } catch {
      setBackupStatus("导入失败：备份文件不是有效的 JSON。");
    } finally {
      if (backupImportInputRef.current) backupImportInputRef.current.value = "";
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/zh/admin/login";
  }

  function getCurrentUser(sourceState: AdminState | null = state) {
    if (!sourceState) return undefined;
    return sourceState.users.find((user) => user.id === currentUserId)
      ?? sourceState.users.find((user) => user.email.toLowerCase() === email.toLowerCase())
      ?? sourceState.users[0];
  }

  function canManageFrontendState(sourceState: AdminState | null = state) {
    const user = getCurrentUser(sourceState);
    return Boolean(user && frontendManagerRoles.has(user.role));
  }

  function guardFrontendSettingsAccess() {
    if (canManageFrontendState()) return true;
    setStatus("只有管理员可以修改前台设置");
    return false;
  }

  function updateSiteSettings(patch: Partial<AdminState["siteSettings"]>) {
    if (!state || !guardFrontendSettingsAccess()) return;
    if (patch.fontFamily !== undefined) applySiteFontToDocument(patch.fontFamily);
    setState({
      ...state,
      siteSettings: {
        ...state.siteSettings,
        ...patch
      }
    });
    setFrontendSettingsDirty(true);
  }

  function updateAiSettings(patch: Partial<AdminState["aiSettings"]>) {
    if (!state) return;
    setState({
      ...state,
      aiSettings: {
        ...state.aiSettings,
        ...patch
      }
    });
  }

  function updateAiCreditSettings(patch: Partial<AdminState["aiCreditSettings"]>) {
    if (!state || getCurrentUser()?.role !== "super-admin") {
      setStatus("只有最高管理员可以设置 AI 积分");
      return;
    }
    setState({
      ...state,
      aiCreditSettings: {
        ...state.aiCreditSettings,
        ...patch
      }
    });
  }

  function updateUserAiCredits(userId: string, value: number) {
    if (!state || getCurrentUser()?.role !== "super-admin") {
      setStatus("只有最高管理员可以设置用户积分");
      return;
    }
    setState({
      ...state,
      users: state.users.map((user) => (
        user.id === userId ? { ...user, aiCredits: Number.isFinite(value) ? Math.max(0, value) : 0 } : user
      ))
    });
  }

  function selectAiProvider(provider: string) {
    if (!state) return;
    const option = aiProviderOptions.find((item) => item.value === provider);
    const currentProviderOption = aiProviderOptions.find((item) => item.value === state.aiSettings.provider);
    const shouldReplaceBaseUrl = !state.aiSettings.baseUrl || state.aiSettings.baseUrl === currentProviderOption?.baseUrl;

    updateAiSettings({
      provider,
      baseUrl: shouldReplaceBaseUrl ? option?.baseUrl ?? "" : state.aiSettings.baseUrl,
      model: option?.models[0] ?? state.aiSettings.model
    });
    setAiTestStatus("");
  }

  function testAiConnection() {
    if (!state) return;
    setAiTestStatus("正在测试 API 连接...");

    fetch("/api/admin/ai/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.aiSettings)
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({ error: "API 测试失败" })) as { ok?: boolean; message?: string; error?: string; detail?: string };
        if (!response.ok || !payload.ok) {
          throw new Error([payload.error, payload.detail].filter(Boolean).join("：") || "API 测试失败");
        }
        return payload;
      })
      .then((payload) => {
        setAiTestStatus(payload.message || "API 连接测试通过。");
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "API 测试失败";
        setAiTestStatus(message);
      });
  }

  async function runAutoTranslation(scopeOverride?: TranslationScope, targetId?: string) {
    if (!state) return;
    const user = getCurrentUser();

    if (!user || !frontendManagerRoles.has(user.role)) {
      const message = "只有 Super Admin 或 Admin 可以执行自动翻译";
      setTranslationStatus(message);
      setStatus(message);
      return;
    }

    const nextScope = scopeOverride ?? translationScope;
    setTranslationStatus("正在请求 AI 补齐其他语言...");
    setStatus("正在自动翻译其他语言...");

    try {
      const response = await fetch("/api/admin/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          scope: nextScope,
          targetId,
          sourceLocale: translationSourceLocale,
          overwrite: translationOverwrite
        })
      });
      const payload = await response.json().catch(() => ({ error: "自动翻译失败" })) as {
        ok?: boolean;
        state?: AdminState;
        translatedCount?: number;
        skippedCount?: number;
        pointsUsed?: number;
        message?: string;
        error?: string;
      };

      if (!response.ok || !payload.state) {
        throw new Error(payload.error || "自动翻译失败");
      }

      setState(payload.state);
      setFrontendSettingsDirty(false);
      const pointsText = payload.pointsUsed ? `，消耗 ${payload.pointsUsed} 积分` : "";
      const message = payload.message ? `${payload.message}${pointsText}` : `已补齐 ${payload.translatedCount ?? 0} 个翻译字段${pointsText}。`;
      const skippedText = payload.skippedCount ? `保留 ${payload.skippedCount} 个已有翻译。` : "";
      setTranslationStatus([message, skippedText].filter(Boolean).join(" "));
      setStatus("自动翻译已保存");
    } catch (error) {
      const message = error instanceof Error ? error.message : "自动翻译失败";
      setTranslationStatus(message);
      setStatus(message);
    }
  }

  function updateTemplateSettings(patch: Partial<SiteTemplateSettings>) {
    if (!state || !guardFrontendSettingsAccess()) return;
    setState({
      ...state,
      templateSettings: {
        ...state.templateSettings,
        ...patch
      }
    });
    setFrontendSettingsDirty(true);
  }

  function updateTemplateText(field: "heroKicker" | "heroTitle" | "heroBody" | "primaryCtaLabel" | "secondaryCtaLabel", localeCode: "zh" | "en", value: string) {
    if (!state || !guardFrontendSettingsAccess()) return;
    updateTemplateSettings({
      [field]: {
        ...state.templateSettings[field],
        [localeCode]: value
      }
    } as Pick<SiteTemplateSettings, typeof field>);
  }

  function commitTemplateEditableText(field: "heroKicker" | "heroTitle" | "heroBody" | "primaryCtaLabel" | "secondaryCtaLabel", element: HTMLElement | null) {
    if (!element) return;
    const value = element.innerText.replace(/\s+\n/g, "\n").trim();
    updateTemplateText(field, "zh", value);
  }

  function updateTemplateTextBlock(blockKey: string, localeCode: "zh" | "en", value: string) {
    if (!state || !guardFrontendSettingsAccess()) return;
    const currentBlock = state.templateSettings.textBlocks[blockKey] ?? { en: value };

    updateTemplateSettings({
      textBlocks: {
        ...state.templateSettings.textBlocks,
        [blockKey]: {
          ...currentBlock,
          [localeCode]: value,
          en: currentBlock.en || value
        }
      }
    });
  }

  function markVisualContentDirty(message = "可视化内容已修改，点击保存模板后生效") {
    setFrontendSettingsDirty(true);
    setStatus(message);
  }

  function startVisualInlineEdit(editorKey: string, currentValue: string, event?: MouseEvent<HTMLElement>) {
    event?.stopPropagation();
    if (!guardFrontendSettingsAccess()) return;
    setVisualEditingKey(editorKey);
    setVisualDraftValue(currentValue);
  }

  function cancelVisualInlineEdit() {
    setVisualEditingKey(null);
    setVisualDraftValue("");
  }

  function commitVisualInlineEdit(onCommit: (value: string) => void, allowEmpty = false) {
    const nextValue = visualDraftValue.trim();

    if (!allowEmpty && !nextValue) {
      setStatus("编辑内容不能为空");
      return;
    }

    onCommit(nextValue);
    cancelVisualInlineEdit();
  }

  function handleVisualInlineKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, onCommit: (value: string) => void, allowEmpty = false) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelVisualInlineEdit();
      return;
    }

    if (event.key === "Enter" && (event.currentTarget.tagName !== "TEXTAREA" || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      commitVisualInlineEdit(onCommit, allowEmpty);
    }
  }

  function updateVisualProduct(productId: string, updater: (product: ProductCategory) => ProductCategory) {
    if (!state || !guardFrontendSettingsAccess()) return;

    setState({
      ...state,
      products: state.products.map((product) => getProductId(product) === productId ? updater(product) : product)
    });
    markVisualContentDirty();
  }

  function updateVisualArticle(articleId: string, updater: (article: Article) => Article) {
    if (!state || !guardFrontendSettingsAccess()) return;

    setState({
      ...state,
      articles: state.articles.map((article) => (article.id ?? article.slug) === articleId ? updater(article) : article)
    });
    markVisualContentDirty();
  }

  function updateTemplateSectionVisibility(section: HomeSectionKey, visible: boolean) {
    if (!state || !guardFrontendSettingsAccess()) return;
    updateTemplateSettings({
      visibleSections: {
        ...state.templateSettings.visibleSections,
        [section]: visible
      }
    });
  }

  function updateTemplateSectionOrder(section: HomeSectionKey, order: number) {
    if (!state || !guardFrontendSettingsAccess()) return;
    updateTemplateSettings({
      sectionOrder: {
        ...state.templateSettings.sectionOrder,
        [section]: Number.isFinite(order) ? Math.trunc(order) : state.templateSettings.sectionOrder[section]
      }
    });
  }

  function createHeroSlide(imageUrl: string, label = "Homepage hero slide"): SiteHeroSlide {
    const trimmedUrl = imageUrl.trim();
    const currentOrders = state?.templateSettings.heroSlides.map((slide) => slide.order) ?? [];

    return {
      id: `hero-slide-${Date.now()}`,
      imageUrl: trimmedUrl,
      alt: { en: label, zh: label },
      enabled: true,
      order: Math.max(0, ...currentOrders) + 10
    };
  }

  function updateHeroSlide(slideId: string, patch: Partial<SiteHeroSlide>) {
    if (!state || !guardFrontendSettingsAccess()) return;
    updateTemplateSettings({
      heroSlides: state.templateSettings.heroSlides.map((slide) => (
        slide.id === slideId ? { ...slide, ...patch } : slide
      ))
    });
  }

  function addHeroSlideFromUrl() {
    if (!state || !guardFrontendSettingsAccess()) return;
    const imageUrl = newHeroSlideUrl.trim();
    if (!imageUrl) {
      setStatus("请先填写轮播图片 URL");
      return;
    }

    updateTemplateSettings({
      heroSlides: [...state.templateSettings.heroSlides, createHeroSlide(imageUrl, "Custom homepage hero slide")]
    });
    setNewHeroSlideUrl("");
  }

  function addHeroSlideFromMedia(file: UploadedFile) {
    if (!state || !guardFrontendSettingsAccess()) return;
    updateTemplateSettings({
      heroSlides: [...state.templateSettings.heroSlides, createHeroSlide(file.url, file.description?.zh ?? file.name)]
    });
  }

  function removeHeroSlide(slideId: string) {
    if (!state || !guardFrontendSettingsAccess()) return;
    updateTemplateSettings({
      heroSlides: state.templateSettings.heroSlides.filter((slide) => slide.id !== slideId)
    });
  }

  function switchAdminTab(nextTab: Tab) {
    setTab(nextTab);
    window.history.replaceState(null, "", `/${locale}/admin?tab=${nextTab}`);
  }

  function resetProductForm() {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  }

  function submitProductForm() {
    if (!state) return;
    const nameZh = productForm.zh.trim();
    const nameEn = productForm.en.trim() || nameZh || "New Category";
    const slug = slugify(productForm.slug || nameEn || nameZh) || `category-${Date.now()}`;
    const id = editingProductId ?? `product-${slug}-${Date.now()}`;
    const existingProduct = editingProductId
      ? state.products.find((product) => (product.id ?? product.slug) === editingProductId)
      : undefined;
    const nextProduct: ProductCategory = {
      id,
      slug,
      name: { en: nameEn, zh: nameZh || nameEn },
      summary: {
        en: productForm.summaryEn.trim() || productForm.summaryZh.trim() || existingProduct?.summary.en || "Describe this category for overseas buyers.",
        zh: productForm.summaryZh.trim() || productForm.summaryEn.trim() || existingProduct?.summary.zh || "填写分类描述。"
      },
      parentId: productForm.parentId || undefined,
      applications: existingProduct?.applications ?? { en: ["Export catalog"], zh: ["外贸目录"] },
      specs: existingProduct?.specs ?? [],
      themeFit: existingProduct?.themeFit ?? [state.activeTheme]
    };
    const exists = Boolean(editingProductId);
    const products = exists
      ? state.products.map((product) => ((product.id ?? product.slug) === editingProductId ? { ...product, ...nextProduct } : product))
      : [nextProduct, ...state.products];
    const nextState = { ...state, products };

    setState(nextState);
    resetProductForm();
    void save(nextState);
  }

  function editProduct(product: ProductCategory) {
    setEditingProductId(product.id ?? product.slug);
    setProductForm(productToForm(product));
  }

  function switchTheme(theme: ThemeKey) {
    if (!state) return;
    const nextState = { ...state, activeTheme: theme };

    applyThemeToDocument(theme);
    setState(nextState);
    setStatus(`已切换到 ${themes[theme].name}，正在保存...`);
    void save(nextState);
  }

  function updateContact(index: number, patch: Partial<ContactChannel>) {
    if (!state) return;
    const contactChannels = state.contactChannels.map((channel, current) => (current === index ? { ...channel, ...patch } : channel));
    setState({ ...state, contactChannels });
  }

  function selectContactFormType(type: ContactChannelType) {
    const preset = contactTypePresets[type];

    setContactForm((current) => ({
      ...current,
      type,
      zh: current.zh || (type === "custom" ? "" : preset.zh),
      en: current.en || (type === "custom" ? "" : preset.en),
      value: current.value || preset.value,
      href: current.href || preset.href,
      color: preset.color
    }));
  }

  function addContactChannel() {
    if (!state) return;
    const preset = contactTypePresets[contactForm.type];
    const labelZh = contactForm.zh.trim() || preset.zh;
    const labelEn = contactForm.en.trim() || labelZh || preset.en;
    const href = contactForm.href.trim() || preset.href;
    const value = contactForm.value.trim() || preset.value || href;

    if (!href) {
      setStatus("请填写联系方式链接");
      return;
    }

    const nextChannel: ContactChannel = {
      id: `contact-${slugify(labelEn || labelZh || contactForm.type)}-${Date.now()}`,
      type: contactForm.type,
      label: { en: labelEn, zh: labelZh || labelEn },
      value,
      href,
      color: contactForm.color || preset.color,
      enabled: true
    };
    const nextState = { ...state, contactChannels: [...state.contactChannels, nextChannel] };

    setState(nextState);
    setContactForm(createContactForm());
    void save(nextState);
  }

  function createAdminUser() {
    if (!state) return;
    const name = newUserForm.name.trim();
    const nextEmail = newUserForm.email.trim().toLowerCase();
    const password = newUserForm.password;

    if (!name || !nextEmail || !password) {
      setStatus("请填写新用户姓名、邮箱和初始密码");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setStatus("请输入有效的新用户邮箱");
      return;
    }
    if (password.length < 8) {
      setStatus("初始密码至少需要 8 位");
      return;
    }
    if (state.users.some((user) => user.email.toLowerCase() === nextEmail)) {
      setStatus("这个邮箱已经存在");
      return;
    }

    setStatus("正在新增用户...");
    fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: nextEmail,
        role: newUserForm.role,
        allowedTabs: defaultAllowedTabsByRole[newUserForm.role],
        aiCredits: newUserForm.aiCredits,
        password
      })
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({ error: "新增用户失败" })) as { state?: AdminState; error?: string };
        if (!response.ok || !payload.state) throw new Error(payload.error || "新增用户失败");
        return payload.state;
      })
      .then((savedState) => {
        setState(savedState);
        setNewUserForm(emptyNewUserForm);
        setStatus("新用户已创建");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "新增用户失败"));
  }

  function updateUserAllowedTab(userId: string, tabKey: Tab, checked: boolean) {
    if (!state) return;
    setState({
      ...state,
      users: state.users.map((user) => {
        if (user.id !== userId) return user;
        const current = new Set(getAllowedTabsForUser(user));
        if (checked) current.add(tabKey);
        else current.delete(tabKey);
        if (current.size === 0) current.add("overview");
        return { ...user, allowedTabs: Array.from(current) };
      })
    });
  }

  function resetAdminUserPassword(userId: string) {
    const password = resetUserPasswords[userId] ?? "";
    if (password.length < 8) {
      setStatus("重置密码至少需要 8 位");
      return;
    }

    setStatus("正在重置用户密码...");
    fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password })
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({ error: "重置密码失败" })) as { state?: AdminState; error?: string };
        if (!response.ok || !payload.state) throw new Error(payload.error || "重置密码失败");
        return payload.state;
      })
      .then((savedState) => {
        setState(savedState);
        setResetUserPasswords((current) => ({ ...current, [userId]: "" }));
        setStatus("用户密码已重置");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "重置密码失败"));
  }

  function removeContactChannel(channelId: string) {
    if (!state) return;
    const nextState = {
      ...state,
      contactChannels: state.contactChannels.filter((channel) => channel.id !== channelId)
    };

    setState(nextState);
    void save(nextState);
  }

  function updateNavigationItem(itemId: string, patch: Partial<SiteNavigationItem>) {
    if (!state || !guardFrontendSettingsAccess()) return;
    const nextPatch = { ...patch };

    if ("parentId" in nextPatch) {
      nextPatch.parentId = nextPatch.parentId && nextPatch.parentId !== itemId && !navigationWouldCreateCycle(state.navigation, itemId, nextPatch.parentId)
        ? nextPatch.parentId
        : undefined;
    }

    setState({
      ...state,
      navigation: state.navigation.map((item) => (item.id === itemId ? { ...item, ...nextPatch } : item))
    });
    setFrontendSettingsDirty(true);
  }

  function addNavigationItem(parentId?: string) {
    if (!state || !guardFrontendSettingsAccess()) return;
    const nextOrder = Math.max(0, ...state.navigation.map((item) => item.order)) + 10;
    setState({
      ...state,
      navigation: [...state.navigation, emptyNavigationItem(nextOrder, parentId)]
    });
    setFrontendSettingsDirty(true);
  }

  function removeNavigationItem(itemId: string) {
    if (!state || !guardFrontendSettingsAccess()) return;
    const removedItem = state.navigation.find((item) => item.id === itemId);
    setState({
      ...state,
      navigation: state.navigation
        .filter((item) => item.id !== itemId)
        .map((item) => (item.parentId === itemId ? { ...item, parentId: removedItem?.parentId } : item))
    });
    setFrontendSettingsDirty(true);
  }

  function toggleEnabledLocale(localeCode: LocaleCode, checked: boolean) {
    if (!state || !guardFrontendSettingsAccess()) return;
    const nextLocales = checked
      ? Array.from(new Set([...state.enabledLocales, localeCode]))
      : state.enabledLocales.filter((item) => item !== localeCode);

    if (nextLocales.length === 0) {
      setStatus("至少保留一个前台语言");
      return;
    }

    setState({ ...state, enabledLocales: nextLocales });
    setFrontendSettingsDirty(true);
  }

  function updateEnabledLocaleOrder(localeCode: LocaleCode, order: number) {
    if (!state || !guardFrontendSettingsAccess()) return;
    const currentIndex = state.enabledLocales.indexOf(localeCode);
    const nextIndex = Math.max(0, Math.min(state.enabledLocales.length - 1, Math.trunc(order) - 1));

    if (currentIndex < 0 || !Number.isFinite(order) || nextIndex === currentIndex) return;

    const nextLocales = [...state.enabledLocales];
    const [localeToMove] = nextLocales.splice(currentIndex, 1);
    nextLocales.splice(nextIndex, 0, localeToMove);
    setState({ ...state, enabledLocales: nextLocales });
    setFrontendSettingsDirty(true);
  }

  function uploadContactQr(index: number, file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("请选择二维码图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setStatus("二维码读取失败");
        return;
      }
      updateContact(index, { qrCodeUrl: reader.result });
      setStatus("二维码已添加，点击“保存联系方式”后生效");
    };
    reader.onerror = () => setStatus("二维码读取失败");
    reader.readAsDataURL(file);
  }

  function updateCurrentUser(patch: Partial<AdminUser>) {
    if (!state) return;
    const targetUser = state.users.find((user) => user.id === currentUserId) ?? state.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? state.users[0];
    if (!targetUser) return;

    setState({
      ...state,
      users: state.users.map((user) => (user.id === targetUser.id ? { ...user, ...patch } : user))
    });
  }

  function uploadAccountAvatar(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("请选择头像图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setStatus("头像读取失败");
        return;
      }
      updateCurrentUser({ avatarUrl: reader.result });
      setStatus("头像已更新，点击保存后生效");
    };
    reader.onerror = () => setStatus("头像读取失败");
    reader.readAsDataURL(file);
  }

  async function saveAccountSettings() {
    if (!state) return;
    const targetUser = state.users.find((user) => user.id === currentUserId) ?? state.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? state.users[0];
    if (!targetUser) return;

    if ((accountPassword.next || accountPassword.confirm) && accountPassword.next !== accountPassword.confirm) {
      setStatus("两次输入的新密码不一致");
      return;
    }

    setStatus("保存账号设置中...");
    const response = await fetch("/api/admin/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          name: targetUser.name,
          email: targetUser.email,
          jobTitle: targetUser.jobTitle,
          phone: targetUser.phone,
          avatarUrl: targetUser.avatarUrl
        },
        currentPassword: accountPassword.current,
        newPassword: accountPassword.next,
        confirmPassword: accountPassword.confirm
      })
    });
    const payload = await response.json() as { state?: AdminState; user?: AdminUser; error?: string };

    if (!response.ok || !payload.state) {
      setStatus(payload.error ?? "账号设置保存失败");
      return;
    }

    setState(payload.state);
    setCurrentUserId(payload.user?.id ?? targetUser.id);
    setAccountPassword({ current: "", next: "", confirm: "" });
    setStatus("账号设置已保存");
  }

  function updateActivePage(patch: Partial<SitePage>) {
    if (!state) return;
    const targetId = activePageId ?? state.pages[0]?.id ?? state.pages[0]?.slug;
    if (!targetId) return;
    setState({
      ...state,
      pages: state.pages.map((page) => ((page.id ?? page.slug) === targetId ? { ...page, ...patch } : page))
    });
  }

  function updatePageTitle(value: string) {
    updateActivePage({ title: createSingleLanguageTranslation(value) });
  }

  function updatePageExcerpt(value: string) {
    updateActivePage({ excerpt: createSingleLanguageTranslation(value) });
  }

  function updatePageBody(value: string) {
    updateActivePage({ body: createSingleLanguageTranslation(value) });
  }

  function commitPage(index: number, patch: Partial<SitePage>) {
    if (!state) return;
    const nextState = {
      ...state,
      pages: state.pages.map((page, current) => (current === index ? { ...page, ...patch } : page))
    };
    setState(nextState);
    void save(nextState);
  }

  function moveActivePageToTrash() {
    if (!state || !activePage) return;
    const targetId = activePage.id ?? activePage.slug;
    const nextState = {
      ...state,
      pages: state.pages.map((page) => (
        (page.id ?? page.slug) === targetId
          ? { ...page, status: "trash" as const, deletedAt: new Date().toISOString() }
          : page
      ))
    };

    setState(nextState);
    setActivePageId(null);
    setPageMode("list");
    setPageStatusFilter("trash");
    void save(nextState);
  }

  function restoreActivePage() {
    if (!state || !activePage) return;
    const targetId = activePage.id ?? activePage.slug;
    const nextState = {
      ...state,
      pages: state.pages.map((page) => (
        (page.id ?? page.slug) === targetId
          ? { ...page, status: "draft" as const, deletedAt: undefined }
          : page
      ))
    };

    setState(nextState);
    setPageStatusFilter("draft");
    void save(nextState);
  }

  function deleteActivePagePermanently() {
    if (!state || !activePage) return;
    const targetId = activePage.id ?? activePage.slug;
    const nextState = {
      ...state,
      pages: state.pages.filter((page) => (page.id ?? page.slug) !== targetId)
    };

    setState(nextState);
    setActivePageId(null);
    setPageMode("list");
    setPageStatusFilter("trash");
    void save(nextState);
  }

  function movePageToTrashFromList(pageId: string) {
    if (!state) return;
    const nextState = {
      ...state,
      pages: state.pages.map((page) => (
        (page.id ?? page.slug) === pageId
          ? { ...page, status: "trash" as const, deletedAt: new Date().toISOString() }
          : page
      ))
    };

    setState(nextState);
    if (activePageId === pageId) setActivePageId(null);
    void save(nextState);
  }

  function deletePagePermanentlyFromList(pageId: string) {
    if (!state) return;
    const nextState = {
      ...state,
      pages: state.pages.filter((page) => (page.id ?? page.slug) !== pageId)
    };

    setState(nextState);
    if (activePageId === pageId) setActivePageId(null);
    void save(nextState);
  }

  function deletePageFromList(page: SitePage) {
    const pageId = page.id ?? page.slug;
    if (page.status === "trash") {
      deletePagePermanentlyFromList(pageId);
      return;
    }

    movePageToTrashFromList(pageId);
  }

  function startNewArticle() {
    if (!state) return;
    const article = {
      ...emptyArticle(state.siteSettings.defaultArticleCategory || state.products[0]?.slug || "uncategorized"),
      status: state.siteSettings.defaultArticleStatus
    };
    setState({ ...state, articles: [article, ...state.articles] });
    setActiveArticleId(article.id ?? article.slug);
    setArticleMode("editor");
  }

  function updateArticle(index: number, patch: Partial<Article>) {
    if (!state) return;
    const articles = state.articles.map((article, current) => (current === index ? { ...article, ...patch } : article));
    setState({ ...state, articles });
  }

  function updateActiveArticle(patch: Partial<Article>) {
    if (!state) return;
    const targetId = activeArticleId ?? state.articles[0]?.id ?? state.articles[0]?.slug;
    if (!targetId) return;
    setState({
      ...state,
      articles: state.articles.map((article) => ((article.id ?? article.slug) === targetId ? { ...article, ...patch } : article))
    });
  }

  function commitArticle(index: number, patch: Partial<Article>) {
    if (!state) return;
    const nextState = {
      ...state,
      articles: state.articles.map((article, current) => (current === index ? { ...article, ...patch } : article))
    };
    setState(nextState);
    void save(nextState);
  }

  function moveActiveArticleToTrash() {
    if (!state || !activeArticle) return;
    const targetId = activeArticle.id ?? activeArticle.slug;
    const nextState = {
      ...state,
      articles: state.articles.map((article) => (
        (article.id ?? article.slug) === targetId
          ? { ...article, status: "trash" as const, featuredOnHome: false, deletedAt: new Date().toISOString() }
          : article
      ))
    };

    setState(nextState);
    setActiveArticleId(null);
    setArticleMode("list");
    setArticleStatusFilter("trash");
    void save(nextState);
  }

  function restoreActiveArticle() {
    if (!state || !activeArticle) return;
    const targetId = activeArticle.id ?? activeArticle.slug;
    const nextState = {
      ...state,
      articles: state.articles.map((article) => (
        (article.id ?? article.slug) === targetId
          ? { ...article, status: "draft" as const, deletedAt: undefined }
          : article
      ))
    };

    setState(nextState);
    setArticleStatusFilter("draft");
    void save(nextState);
  }

  function deleteActiveArticlePermanently() {
    if (!state || !activeArticle) return;
    const targetId = activeArticle.id ?? activeArticle.slug;
    const nextState = {
      ...state,
      articles: state.articles.filter((article) => (article.id ?? article.slug) !== targetId)
    };

    setState(nextState);
    setActiveArticleId(null);
    setArticleMode("list");
    setArticleStatusFilter("trash");
    void save(nextState);
  }

  function moveArticleToTrashFromList(articleId: string) {
    if (!state) return;
    const nextState = {
      ...state,
      articles: state.articles.map((article) => (
        (article.id ?? article.slug) === articleId
          ? { ...article, status: "trash" as const, featuredOnHome: false, deletedAt: new Date().toISOString() }
          : article
      ))
    };

    setState(nextState);
    setSelectedArticleIds((current) => current.filter((id) => id !== articleId));
    if (activeArticleId === articleId) setActiveArticleId(null);
    void save(nextState);
  }

  function deleteArticlePermanentlyFromList(articleId: string) {
    if (!state) return;
    const nextState = {
      ...state,
      articles: state.articles.filter((article) => (article.id ?? article.slug) !== articleId)
    };

    setState(nextState);
    setSelectedArticleIds((current) => current.filter((id) => id !== articleId));
    if (activeArticleId === articleId) setActiveArticleId(null);
    void save(nextState);
  }

  function deleteArticleFromList(article: Article) {
    const articleId = article.id ?? article.slug;
    if (article.status === "trash") {
      deleteArticlePermanentlyFromList(articleId);
      return;
    }

    moveArticleToTrashFromList(articleId);
  }

  function downloadArticleImportTemplate() {
    const rows = [
      [...articleImportHeaders],
      [
        "sample-buying-guide",
        "buying-guide",
        "published",
        "1",
        "批量导入示例文章",
        "Sample imported article",
        "用于文章卡片和首页的中文摘要。",
        "Short English excerpt for article cards and homepage.",
        "这里填写中文正文。可以包含换行、逗号和引号。",
        "Write the full English article content here.",
        new Date().toISOString()
      ]
    ];
    const blob = new Blob([`\uFEFF${buildCsv(rows)}`], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "article-import-template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  function importArticlesFromCsv(file: File | null) {
    if (!state || !file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setStatus("文章导入失败：无法读取文件");
        return;
      }

      const rows = parseCsv(reader.result);
      if (rows.length < 2) {
        setStatus("文章导入失败：模板中没有文章数据");
        return;
      }

      const headers = rows[0].map(normalizeCsvHeader);
      const importedAt = Date.now();
      const existingSlugs = new Set(state.articles.map((article) => article.slug));
      const uniqueSlug = (value: string, index: number) => {
        const base = slugify(value) || `imported-article-${importedAt}-${index + 1}`;
        let candidate = base;
        let suffix = 2;

        while (existingSlugs.has(candidate)) {
          candidate = `${base}-${suffix}`;
          suffix += 1;
        }

        existingSlugs.add(candidate);
        return candidate;
      };
      const importedArticles = rows
        .slice(1)
        .filter((row) => row.some((value) => value.trim()))
        .map((row, index) => {
          const record = rowToRecord(headers, row);
          const titleZh = record.title_zh || record.title_en || "批量导入文章";
          const titleEn = record.title_en || record.title_zh || "Imported article";
          const excerptZh = record.excerpt_zh || record.excerpt_en || "填写文章摘要。";
          const excerptEn = record.excerpt_en || record.excerpt_zh || "Article summary.";
          const statusValue = normalizeArticleStatus(record.status || "draft");
          const publishedAt = statusValue === "published"
            ? record.published_at || new Date(importedAt + index).toISOString()
            : record.published_at || undefined;

          return {
            id: `article-import-${importedAt}-${index}`,
            slug: uniqueSlug(record.slug || titleEn || titleZh, index),
            title: { en: titleEn, zh: titleZh },
            excerpt: { en: excerptEn, zh: excerptZh },
            body: {
              en: record.body_en || record.body_zh || "",
              zh: record.body_zh || record.body_en || ""
            },
            category: normalizeArticleCategory(record.category || "", state.siteSettings.defaultArticleCategory || state.products[0]?.slug || "uncategorized"),
            status: statusValue,
            featuredOnHome: parseFeaturedOnHome(record.featured_on_home || ""),
            publishedAt
          } satisfies Article;
        });

      if (importedArticles.length === 0) {
        setStatus("文章导入失败：没有可导入的文章");
        return;
      }

      const nextState = { ...state, articles: [...importedArticles, ...state.articles] };
      setState(nextState);
      setArticleMode("list");
      setStatus(`已导入 ${importedArticles.length} 篇文章，正在保存...`);
      void save(nextState);
    };
    reader.onerror = () => setStatus("文章导入失败：无法读取文件");
    reader.readAsText(file);
  }

  function buildAiContentDraft(target = aiContentForm.target): AiContentDraft {
    const markets = joinHumanList(state?.aiSettings.targetMarkets ?? [], "Global buyers");
    const keywords = state?.aiSettings.requiredKeywords ?? [];
    const keyword = keywords[0] ?? (target === "article" ? "carbide end mills" : "cutting tools");
    const topic = aiContentForm.topic.trim() || (target === "article" ? `${keyword} buying guide` : `${keyword} supplier page`);
    const titleRoot = titleCase(topic);
    const category = aiContentForm.category || state?.siteSettings.defaultArticleCategory || state?.products[0]?.slug || "uncategorized";
    const created = new Date();
    const slug = uniqueSlug(
      topic,
      target === "article" ? state?.articles.map((article) => article.slug) ?? [] : state?.pages.map((page) => page.slug) ?? [],
      target === "article" ? "ai-article" : "ai-page"
    );
    const keywordText = joinHumanList(keywords, keyword);
    const brandVoice = state?.aiSettings.brandVoice || "Clear, technical, buyer-focused B2B export copy.";
    const articleBodyEn = [
      `## Buyer intent`,
      `${markets} buyers comparing ${topic} usually need a fast answer on product fit, quality control, packaging, and repeat-order stability. The copy should stay aligned with this brand voice: ${brandVoice}`,
      `## Product fit`,
      `Explain where ${keyword} performs best, which materials or machining conditions matter, and what details should be confirmed before quotation.`,
      `## RFQ checklist`,
      `| Item | Why it matters |`,
      `| --- | --- |`,
      `| Tool size and geometry | Confirms diameter, flute length, shank, corner radius, and operation fit |`,
      `| Workpiece material | Helps match coating, flute count, coolant condition, and cutting data |`,
      `| Quantity and packing | Aligns MOQ, lead time, private label, and export carton planning |`,
      `## Trust signals`,
      `Mention inspection, sample confirmation, packaging consistency, and responsive engineering support. Include these keywords naturally: ${keywordText}.`
    ].join("\n\n");
    const articleBodyZh = [
      `## 买家需求`,
      `${markets} 买家在比较 ${topic} 时，通常希望快速确认产品匹配、质量控制、包装方式和长期复购稳定性。内容语气保持：${brandVoice}`,
      `## 产品匹配`,
      `说明 ${keyword} 适合的加工场景、材料条件、涂层选择，以及报价前需要确认的核心参数。`,
      `## 询盘清单`,
      `| 项目 | 为什么重要 |`,
      `| --- | --- |`,
      `| 刀具尺寸与几何 | 确认直径、刃长、柄径、圆角和加工方式 |`,
      `| 工件材料 | 便于匹配涂层、刃数、冷却方式和切削条件 |`,
      `| 数量与包装 | 影响 MOQ、交期、私标和出口箱规规划 |`,
      `## 信任背书`,
      `加入质检、样品确认、包装一致性和工程响应能力。关键词自然覆盖：${keywordText}。`
    ].join("\n\n");
    const pageBodyEn = [
      `## What this page should communicate`,
      `Use this page to explain how KeyproTools supports ${topic} for ${markets}. Keep the copy practical, technical, and buyer-focused.`,
      `## Capabilities`,
      `- Product matching for ${keyword}.`,
      `- OEM marking, packaging, and export documentation.`,
      `- Quality inspection and sample confirmation before repeat orders.`,
      `## Buying process`,
      `1. Send sizes, materials, coating preference, packing, and target quantity.`,
      `2. Confirm available standards or custom grinding requirements.`,
      `3. Review quotation, samples, lead time, and carton plan.`,
      `## Call to action`,
      `Ask buyers to share drawings, size lists, target market, and expected monthly demand for a clearer quotation. Required keyword focus: ${keywordText}.`
    ].join("\n\n");
    const pageBodyZh = [
      `## 页面传达重点`,
      `这个页面用于说明 KeyproTools 如何面向 ${markets} 支持 ${topic}，文案保持技术清晰、采购友好和行动明确。`,
      `## 服务能力`,
      `- 围绕 ${keyword} 做产品匹配和规格建议。`,
      `- 支持 OEM 标识、私标包装和出口资料。`,
      `- 支持样品确认、质量检测和复购订单稳定交付。`,
      `## 采购流程`,
      `1. 提供尺寸、材料、涂层偏好、包装和目标数量。`,
      `2. 确认标准品供应或定制磨削要求。`,
      `3. 核对报价、样品、交期和箱规方案。`,
      `## 行动引导`,
      `引导买家提交图纸、规格清单、目标市场和月度需求，以便获得更清晰的报价。关键词重点：${keywordText}。`
    ].join("\n\n");

    return {
      target,
      slug,
      title: {
        en: target === "article" ? `${titleRoot} for Overseas Buyers` : titleRoot,
        zh: target === "article" ? `${topic} 采购指南` : topic
      },
      excerpt: {
        en: target === "article"
          ? `AI draft covering product fit, RFQ details, quality checks, and supplier trust signals for ${markets}.`
          : `AI page draft explaining KeyproTools capabilities, buying process, and RFQ details for ${markets}.`,
        zh: target === "article"
          ? `AI 草稿，覆盖产品匹配、询盘信息、质量检查和供应商信任背书。`
          : `AI 页面草稿，说明 KeyproTools 的服务能力、采购流程和询盘信息。`
      },
      body: target === "article" ? { en: articleBodyEn, zh: articleBodyZh } : { en: pageBodyEn, zh: pageBodyZh },
      category,
      createdAt: created.toISOString()
    };
  }

  function generateAiContentPreview() {
    if (!state) return;
    const draft = buildAiContentDraft();

    setAiDraftPreview(draft);
    setAiGeneratedImage(null);
    setAiImageStatus("");
    setStatus("AI 内容已生成，可选择写入文章或页面");
  }

  async function generateAiArticleImage() {
    if (!state || !aiDraftPreview) return;
    if (aiDraftPreview.target !== "article") {
      setAiImageStatus("配图生成功能仅用于文章内容。");
      return;
    }

    setAiImageStatus("正在根据文章内容生成配图...");
    setStatus("正在生成文章配图...");

    try {
      const response = await fetch("/api/admin/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: aiDraftPreview.title.zh || aiDraftPreview.title.en,
          excerpt: aiDraftPreview.excerpt.zh || aiDraftPreview.excerpt.en,
          body: aiDraftPreview.body.zh || aiDraftPreview.body.en
        })
      });
      const payload = await response.json().catch(() => ({ error: "图片生成失败" })) as {
        file?: UploadedFile;
        state?: AdminState;
        message?: string;
        error?: string;
      };

      if (!response.ok || !payload.file || !payload.state) {
        throw new Error(payload.error || "图片生成失败");
      }

      setState(payload.state);
      setAiGeneratedImage({
        id: payload.file.id,
        name: payload.file.name,
        url: payload.file.url
      });
      setAiImageStatus(payload.message || "文章配图已生成。");
      setStatus("文章配图已生成并保存到媒体库");
    } catch (error) {
      const message = error instanceof Error ? error.message : "图片生成失败";
      setAiImageStatus(message);
      setStatus(message);
    }
  }

  function applyAiContentDraft(draftOverride?: AiContentDraft) {
    if (!state) return;
    const draft = draftOverride ?? (aiDraftPreview?.target === aiContentForm.target ? aiDraftPreview : buildAiContentDraft());
    const created = Date.now();
    let nextState = state;
    let nextTargetId = "";

    if (draft.target === "article") {
      const targetId = aiContentForm.targetArticleId || activeArticle?.id || activeArticle?.slug || "";

      if (aiContentForm.writeMode !== "new" && !targetId) {
        setStatus("请选择要填充的文章，或改为新建草稿");
        return;
      }

      if (aiContentForm.writeMode === "new") {
        const article: Article = {
          id: `ai-article-${created}`,
          slug: uniqueSlug(draft.slug, state.articles.map((articleItem) => articleItem.slug), "ai-article"),
          title: draft.title,
          excerpt: draft.excerpt,
          body: draft.body,
          category: draft.category,
          status: "draft",
          coverImageUrl: aiGeneratedImage?.url,
          featuredOnHome: true
        };

        nextTargetId = article.id ?? article.slug;
        nextState = { ...state, articles: [article, ...state.articles] };
      } else {
        nextTargetId = targetId;
        nextState = {
          ...state,
          articles: state.articles.map((article) => {
            if ((article.id ?? article.slug) !== targetId) return article;
            if (aiContentForm.writeMode === "append") {
              const currentBody = article.body ?? { en: "", zh: "" };
              return {
                ...article,
                coverImageUrl: aiGeneratedImage?.url ?? article.coverImageUrl,
                body: {
                  en: [currentBody.en, draft.body.en].filter(Boolean).join("\n\n"),
                  zh: [currentBody.zh ?? currentBody.en, draft.body.zh].filter(Boolean).join("\n\n")
                }
              };
            }

            return {
              ...article,
              slug: article.slug || draft.slug,
              title: draft.title,
              excerpt: draft.excerpt,
              body: draft.body,
              category: draft.category,
              coverImageUrl: aiGeneratedImage?.url ?? article.coverImageUrl,
              status: article.status === "trash" ? "draft" : article.status
            };
          })
        };
      }

      setState(nextState);
      setActiveArticleId(nextTargetId);
      setArticleMode("editor");
      switchAdminTab("articles");
      setStatus("AI 内容已填充到文章，正在保存...");
      void save(nextState);
      return;
    }

    const targetId = aiContentForm.targetPageId || activePage?.id || activePage?.slug || "";

    if (aiContentForm.writeMode !== "new" && !targetId) {
      setStatus("请选择要填充的页面，或改为新建草稿");
      return;
    }

    if (aiContentForm.writeMode === "new") {
      const page: SitePage = {
        id: `ai-page-${created}`,
        slug: uniqueSlug(draft.slug, state.pages.map((pageItem) => pageItem.slug), "ai-page"),
        title: draft.title,
        excerpt: draft.excerpt,
        body: draft.body,
        status: "draft"
      };

      nextTargetId = page.id ?? page.slug;
      nextState = { ...state, pages: [page, ...state.pages] };
    } else {
      nextTargetId = targetId;
      nextState = {
        ...state,
        pages: state.pages.map((page) => {
          if ((page.id ?? page.slug) !== targetId) return page;
          if (aiContentForm.writeMode === "append") {
            return {
              ...page,
              body: {
                en: [page.body.en, draft.body.en].filter(Boolean).join("\n\n"),
                zh: [page.body.zh ?? page.body.en, draft.body.zh].filter(Boolean).join("\n\n")
              }
            };
          }

          return {
            ...page,
            slug: page.slug || draft.slug,
            title: draft.title,
            excerpt: draft.excerpt,
            body: draft.body,
            status: page.status === "trash" ? "draft" : page.status
          };
        })
      };
    }

    setState(nextState);
    setActivePageId(nextTargetId);
    setPageMode("editor");
    switchAdminTab("pages");
    setStatus("AI 内容已填充到页面，正在保存...");
    void save(nextState);
  }

  function generateAndApplyAiContent() {
    if (!state) return;
    const draft = buildAiContentDraft();

    setAiDraftPreview(draft);
    applyAiContentDraft(draft);
  }

  async function runCollector() {
    if (!state) return;
    if (!collectorForm.sourceUrl.trim() && !collectorForm.sourceText.trim()) {
      setCollectorStatus("请填写网页链接，或粘贴要采集的内容。");
      return;
    }

    setCollectorStatus("正在采集并二次创作...");
    setStatus("正在采集内容...");

    try {
      const response = await fetch("/api/admin/ai/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrl: collectorForm.sourceUrl,
          sourceText: collectorForm.sourceText,
          target: collectorForm.target,
          category: collectorForm.category || state.siteSettings.defaultArticleCategory || state.products[0]?.slug || ""
        })
      });
      const payload = await response.json().catch(() => ({ error: "采集失败" })) as {
        draft?: AiContentDraft;
        error?: string;
      };

      if (!response.ok || !payload.draft) {
        throw new Error(payload.error || "采集失败");
      }

      setCollectorDraft(payload.draft);
      setCollectorStatus("已完成采集和二次创作，可导入文章或页面。");
      setStatus("采集内容已生成");
    } catch (error) {
      const message = error instanceof Error ? error.message : "采集失败";
      setCollectorStatus(message);
      setStatus(message);
    }
  }

  function importCollectorDraft() {
    if (!collectorDraft) {
      setCollectorStatus("请先采集生成内容。");
      return;
    }

    setAiContentForm({
      target: collectorDraft.target,
      writeMode: "new",
      targetArticleId: "",
      targetPageId: "",
      topic: collectorDraft.title.zh || collectorDraft.title.en,
      category: collectorDraft.category
    });
    setAiDraftPreview(collectorDraft);
    setAiGeneratedImage(null);
    setAiImageStatus("");
    setAiWorkbenchSection("generate");
    switchAdminTab("ai");
    setStatus("采集内容已导入 AI 生成页，可继续填充。");
  }

  if (!state) {
    return (
      <main className="real-admin">
        <div className="admin-topbar"><strong>KeyproTools Admin</strong><span>{status}</span></div>
      </main>
    );
  }

  const productRows = buildProductTableRows(state.products, productQuery);
  const expandedProductSet = new Set(expandedProductIds);
  const productSearchActive = productQuery.trim().length > 0;
  const productIds = new Set(state.products.map((product) => product.id ?? product.slug));
  const productById = new Map(state.products.map((product) => [product.id ?? product.slug, product]));
  const productChildCounts = state.products.reduce((counts, product) => {
    if (product.parentId && productIds.has(product.parentId)) {
      counts.set(product.parentId, (counts.get(product.parentId) ?? 0) + 1);
    }
    return counts;
  }, new Map<string, number>());
  const productVisibleRows = productRows.filter(({ product, depth }) => {
    if (productSearchActive) return true;
    if (depth === 0) return true;
    let parentId = product.parentId;

    while (parentId && productById.has(parentId)) {
      if (!expandedProductSet.has(parentId)) return false;
      parentId = productById.get(parentId)?.parentId;
    }

    return true;
  });
  const visibleProductIds = productVisibleRows.map(({ product }) => product.id ?? product.slug);
  const allVisibleProductsSelected = visibleProductIds.length > 0 && visibleProductIds.every((id) => selectedProductIds.includes(id));

  function toggleVisibleProducts(checked: boolean) {
    setSelectedProductIds((current) => {
      if (checked) return Array.from(new Set([...current, ...visibleProductIds]));
      return current.filter((id) => !visibleProductIds.includes(id));
    });
  }

  function toggleProductSelection(productId: string, checked: boolean) {
    setSelectedProductIds((current) => {
      if (checked) return Array.from(new Set([...current, productId]));
      return current.filter((id) => id !== productId);
    });
  }

  function toggleProductExpanded(productId: string) {
    setExpandedProductIds((current) => {
      if (current.includes(productId)) return current.filter((id) => id !== productId);
      return [...current, productId];
    });
  }

  function applyProductBulkAction() {
    if (!state || productBulkAction !== "delete" || selectedProductIds.length === 0) return;
    const selected = new Set(selectedProductIds);
    const nextState = {
      ...state,
      products: state.products.filter((product) => !selected.has(product.id ?? product.slug))
    };

    setState(nextState);
    setSelectedProductIds([]);
    setProductBulkAction("");
    void save(nextState);
  }
  const articleCounts = {
    all: state.articles.filter((article) => article.status !== "trash").length,
    published: state.articles.filter((article) => article.status === "published").length,
    draft: state.articles.filter((article) => article.status !== "published" && article.status !== "trash").length,
    trash: state.articles.filter((article) => article.status === "trash").length
  };
  const pageCounts = {
    all: state.pages.filter((page) => page.status !== "trash").length,
    published: state.pages.filter((page) => page.status === "published").length,
    draft: state.pages.filter((page) => page.status !== "published" && page.status !== "trash").length,
    trash: state.pages.filter((page) => page.status === "trash").length
  };
  const filteredPages = state.pages.filter((page) => {
    const pageStatus = page.status ?? "draft";
    const statusMatches = pageStatusFilter === "all"
      ? pageStatus !== "trash"
      : pageStatus === pageStatusFilter;
    const query = pageQuery.trim().toLowerCase();
    const queryMatches = !query || [
      page.title.zh,
      page.title.en,
      page.slug,
      page.excerpt.zh,
      page.excerpt.en
    ].filter(Boolean).some((value) => value?.toLowerCase().includes(query));

    return statusMatches && queryMatches;
  });
  const filteredArticles = state.articles.filter((article) => {
    const articleStatus = article.status ?? "published";
    const statusMatches = articleStatusFilter === "all"
      ? articleStatus !== "trash"
      : articleStatus === articleStatusFilter;
    const categoryMatches = articleCategoryFilter === "all" || article.category === articleCategoryFilter;
    const query = articleQuery.trim().toLowerCase();
    const queryMatches = !query || [
      article.title.zh,
      article.title.en,
      article.slug,
      article.excerpt.zh,
      article.excerpt.en
    ].filter(Boolean).some((value) => value?.toLowerCase().includes(query));

    return statusMatches && categoryMatches && queryMatches;
  });
  const visibleArticleIds = filteredArticles.map((article) => article.id ?? article.slug);
  const allVisibleArticlesSelected = visibleArticleIds.length > 0 && visibleArticleIds.every((id) => selectedArticleIds.includes(id));
  const sortedNavigation = [...state.navigation].sort((a, b) => a.order - b.order);
  const navigationRows = buildNavigationTableRows(sortedNavigation);
  const navigationDepthById = new Map(navigationRows.map((row) => [row.item.id, row.depth]));
  const filteredMediaFiles = state.uploadedFiles.filter((file) => {
    const typeMatches = mediaTypeFilter === "all" || getMediaType(file) === mediaTypeFilter;
    const query = mediaQuery.trim().toLowerCase();
    const queryMatches = !query || [file.name, file.mimeType, file.description?.zh, file.description?.en]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(query));

    if (!typeMatches || !queryMatches) return false;
    if (mediaTimeFilter === "all") return true;

    const days = Number(mediaTimeFilter.replace("d", ""));
    const createdAt = new Date(file.createdAt).getTime();
    return Number.isFinite(createdAt) && Date.now() - createdAt <= days * 24 * 60 * 60 * 1000;
  });

  function updateArticleTitle(value: string) {
    updateActiveArticle({ title: createSingleLanguageTranslation(value) });
  }

  function updateArticleExcerpt(value: string) {
    updateActiveArticle({ excerpt: createSingleLanguageTranslation(value) });
  }

  function updateArticleBody(value: string) {
    updateActiveArticle({ body: createSingleLanguageTranslation(value) });
  }

  function syncVisualEditorBody() {
    const editor = visualEditorRef.current;
    if (!editor) return;
    visualEditorInputRef.current = true;
    updateArticleBody(editableHtmlToMarkdown(editor));
  }

  function insertTextIntoArticleBody(insertText: string, cursorStartOffset = insertText.length, cursorEndOffset = cursorStartOffset) {
    if (!activeArticle) return;
    if (articleEditorView === "visual" && visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand("insertText", false, insertText);
      syncVisualEditorBody();
      return;
    }
    const editor = document.getElementById("article-body-editor") as HTMLTextAreaElement | null;
    const currentBody = activeArticle.body?.zh ?? activeArticle.body?.en ?? "";
    const start = editor?.selectionStart ?? currentBody.length;
    const end = editor?.selectionEnd ?? currentBody.length;
    const nextBody = `${currentBody.slice(0, start)}${insertText}${currentBody.slice(end)}`;

    updateArticleBody(nextBody);
    window.requestAnimationFrame(() => {
      editor?.focus();
      if (editor instanceof HTMLTextAreaElement) editor.setSelectionRange(start + cursorStartOffset, start + cursorEndOffset);
    });
  }

  function insertArticleMarkup(before: string, after = "", fallback = "文字") {
    if (!activeArticle) return;
    if (articleEditorView === "visual" && visualEditorRef.current) {
      const formatMap: Record<string, string> = {
        "# ": "H1",
        "## ": "H2",
        "### ": "H3",
        "#### ": "H4",
        "> ": "BLOCKQUOTE"
      };
      const inlineCommandMap: Record<string, string> = {
        "**|**": "bold",
        "*|*": "italic",
        "~~|~~": "strikeThrough",
        "<u>|</u>": "underline",
        "<sup>|</sup>": "superscript",
        "<sub>|</sub>": "subscript",
        "`|`": "insertText"
      };
      const commandKey = `${before}|${after}`;

      visualEditorRef.current.focus();
      if (formatMap[before] && !after) {
        document.execCommand("formatBlock", false, formatMap[before]);
      } else if (inlineCommandMap[commandKey] && inlineCommandMap[commandKey] !== "insertText") {
        document.execCommand(inlineCommandMap[commandKey], false);
      } else {
        document.execCommand("insertText", false, `${before}${fallback}${after}`);
      }
      syncVisualEditorBody();
      return;
    }
    const editor = document.getElementById("article-body-editor") as HTMLTextAreaElement | null;
    const currentBody = activeArticle.body?.zh ?? activeArticle.body?.en ?? "";
    const start = editor?.selectionStart ?? currentBody.length;
    const end = editor?.selectionEnd ?? currentBody.length;
    const selected = currentBody.slice(start, end) || fallback;
    const nextBody = `${currentBody.slice(0, start)}${before}${selected}${after}${currentBody.slice(end)}`;

    updateArticleBody(nextBody);
    window.requestAnimationFrame(() => {
      editor?.focus();
      if (editor instanceof HTMLTextAreaElement) editor.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function insertArticleParagraphTemplate() {
    insertTextIntoArticleBody("\n\n## 小标题\n\n在这里填写段落内容，说明产品优势、应用场景或采购建议。\n\n- 要点一\n- 要点二\n\n");
  }

  function insertArticleTableTemplate() {
    insertTextIntoArticleBody("\n\n| 项目 | 说明 | 备注 |\n| --- | --- | --- |\n| 参数 | 填写内容 | 填写内容 |\n| 应用 | 填写内容 | 填写内容 |\n\n");
  }

  function insertArticleChecklistTemplate() {
    insertTextIntoArticleBody("\n\n- [ ] 待确认事项\n- [ ] 需要补充的内容\n- [ ] 发布前检查\n\n");
  }

  function insertArticleCalloutTemplate() {
    insertTextIntoArticleBody("\n\n> 提示：在这里填写采购建议、注意事项或重点提醒。\n\n");
  }

  function clearArticleBody() {
    if (!activeArticle) return;
    if (visualEditorRef.current) visualEditorRef.current.innerHTML = "";
    updateArticleBody("");
    setStatus("正文已清空，点击保存或发布后生效");
    window.requestAnimationFrame(() => {
      document.getElementById("article-body-editor")?.focus();
    });
  }

  function clearArticleFormatting() {
    if (!activeArticle) return;
    if (articleEditorView === "visual" && visualEditorRef.current) {
      const plainText = visualEditorRef.current.innerText.trim();
      visualEditorRef.current.textContent = plainText;
      updateArticleBody(plainText);
      setStatus("已清理正文格式，点击保存或发布后生效");
      return;
    }
    const currentBody = activeArticle.body?.zh ?? activeArticle.body?.en ?? "";
    const cleanedBody = currentBody
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/^#{2,3}\s+/gm, "")
      .replace(/^>\s+/gm, "")
      .replace(/^[-*]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "");

    updateArticleBody(cleanedBody);
    setStatus("已清理正文格式，点击保存或发布后生效");
  }

  function uploadArticleImage(file: File | null, insertIntoBody = false) {
    if (!file || !activeArticle) return;
    if (!file.type.startsWith("image/")) {
      setStatus("请选择文章图片文件");
      return;
    }
    const targetId = activeArticle.id ?? activeArticle.slug;
    const editor = document.getElementById("article-body-editor") as HTMLTextAreaElement | null;
    const currentBody = activeArticle.body?.zh ?? activeArticle.body?.en ?? "";
    const start = editor?.selectionStart ?? currentBody.length;
    const end = editor?.selectionEnd ?? currentBody.length;
    const formData = new FormData();

    formData.append("file", file);
    setStatus("图片上传中...");
    fetch("/api/admin/upload", { method: "POST", body: formData })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({ error: "图片上传失败" }));
          throw new Error(payload.error || "图片上传失败");
        }
        return response.json() as Promise<{ file: UploadedFile; state: AdminState }>;
      })
      .then(({ file: uploadedFile, state: savedState }) => {
        const imageMarkdown = `\n\n![${sanitizeMarkdownLabel(uploadedFile.name || activeArticle.title.zh || activeArticle.title.en || "文章图片")}](${uploadedFile.url})\n\n`;
        const nextState = {
          ...savedState,
          articles: savedState.articles.map((article) => {
            if ((article.id ?? article.slug) !== targetId) return article;
            const nextArticle: Article = {
              ...article,
              coverImageUrl: article.coverImageUrl || uploadedFile.url
            };

            if (insertIntoBody) {
              nextArticle.body = createSingleLanguageTranslation(`${currentBody.slice(0, start)}${imageMarkdown}${currentBody.slice(end)}`);
            }

            return nextArticle;
          })
        };

        setState(nextState);
        if (insertIntoBody) {
          window.requestAnimationFrame(() => {
            const cursor = start + imageMarkdown.length;
            editor?.focus();
            if (editor instanceof HTMLTextAreaElement) editor.setSelectionRange(cursor, cursor);
          });
        }
        setStatus(insertIntoBody ? "图片已上传并插入正文，点击保存或发布后生效" : "特色图片已上传，点击保存或发布后生效");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "图片上传失败"));
  }

  function appendFileToActiveArticle(file: UploadedFile, sourceState = state) {
    if (!activeArticle || !sourceState) return sourceState;
    const targetId = activeArticle.id ?? activeArticle.slug;
    const editor = document.getElementById("article-body-editor") as HTMLTextAreaElement | null;
    const currentBody = activeArticle.body?.zh ?? activeArticle.body?.en ?? "";
    const mediaMarkup = buildArticleMediaMarkup(file);
    const start = editor?.selectionStart ?? currentBody.length;
    const end = editor?.selectionEnd ?? currentBody.length;
    const nextBody = `${currentBody.slice(0, start)}${mediaMarkup}${currentBody.slice(end)}`;

    window.requestAnimationFrame(() => {
      const cursor = start + mediaMarkup.length;
      editor?.focus();
      if (editor instanceof HTMLTextAreaElement) editor.setSelectionRange(cursor, cursor);
    });

    return {
      ...sourceState,
      articles: sourceState.articles.map((article) => (
        (article.id ?? article.slug) === targetId
          ? { ...article, body: createSingleLanguageTranslation(nextBody) }
          : article
      ))
    };
  }

  function uploadSiteFile(file: File | null, insertIntoArticle = false) {
    if (!state || !file) return;
    const formData = new FormData();

    formData.append("file", file);
    setStatus("媒体上传中...");
    fetch("/api/admin/upload", { method: "POST", body: formData })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({ error: "媒体上传失败" }));
          throw new Error(payload.error || "媒体上传失败");
        }
        return response.json() as Promise<{ file: UploadedFile; state: AdminState }>;
      })
      .then(({ file: uploadedFile, state: savedState }) => {
        if (insertIntoArticle && activeArticle) {
          const nextState = appendFileToActiveArticle(uploadedFile, savedState);
          setState(nextState ?? savedState);
        } else {
          setState(savedState);
        }
        setStatus(insertIntoArticle ? "媒体已上传并插入正文，点击保存或发布后生效" : "媒体已上传并保存");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "媒体上传失败"));
  }

  function uploadSiteIcon(file: File | null) {
    if (!state || !file) return;
    if (!guardFrontendSettingsAccess()) return;

    const iconExtensionPattern = /\.(ico|png|jpe?g|gif|webp|svg)$/i;
    if (!file.type.startsWith("image/") && !iconExtensionPattern.test(file.name)) {
      setStatus("请选择图片或 ICO 图标文件");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setStatus("站点图标上传中...");
    fetch("/api/admin/upload", { method: "POST", body: formData })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({ error: "站点图标上传失败" }));
          throw new Error(payload.error || "站点图标上传失败");
        }
        return response.json() as Promise<{ file: UploadedFile; state: AdminState }>;
      })
      .then(({ file: uploadedFile, state: savedState }) => {
        setState({
          ...savedState,
          siteSettings: {
            ...savedState.siteSettings,
            siteIconUrl: uploadedFile.url
          }
        });
        setFrontendSettingsDirty(true);
        setStatus("站点图标已上传，点击保存设置后生效");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "站点图标上传失败"));
  }

  function uploadHeroSlideImage(file: File | null) {
    if (!state || !file) return;
    if (!guardFrontendSettingsAccess()) return;
    if (!file.type.startsWith("image/")) {
      setStatus("请选择轮播图片文件");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setStatus("轮播图片上传中...");
    fetch("/api/admin/upload", { method: "POST", body: formData })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({ error: "轮播图片上传失败" }));
          throw new Error(payload.error || "轮播图片上传失败");
        }
        return response.json() as Promise<{ file: UploadedFile; state: AdminState }>;
      })
      .then(({ file: uploadedFile, state: savedState }) => {
        setState({
          ...savedState,
          templateSettings: {
            ...state.templateSettings,
            heroSlides: [...state.templateSettings.heroSlides, createHeroSlide(uploadedFile.url, uploadedFile.name)]
          }
        });
        setFrontendSettingsDirty(true);
        setStatus("轮播图片已上传并加入模板，点击保存模板后生效");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "轮播图片上传失败"));
  }

  function insertExistingFileIntoArticle(file: UploadedFile) {
    const nextState = appendFileToActiveArticle(file);
    if (!nextState) return;

    setState(nextState);
    setArticleMediaPickerOpen(false);
    setStatus(getMediaType(file) === "image" ? "图片已插入正文，点击保存或发布后生效" : "媒体链接已插入正文，点击保存或发布后生效");
  }

  function removeUploadedFile(fileId: string) {
    if (!state) return;
    setStatus("正在删除媒体...");
    fetch(`/api/admin/upload?id=${encodeURIComponent(fileId)}`, { method: "DELETE" })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({ error: "媒体删除失败" }));
          throw new Error(payload.error || "媒体删除失败");
        }
        return response.json() as Promise<{ state: AdminState }>;
      })
      .then(({ state: savedState }) => {
        setState(savedState);
        setStatus("媒体已删除");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "媒体删除失败"));
  }

  function toggleVisibleArticles(checked: boolean) {
    setSelectedArticleIds((current) => {
      if (checked) return Array.from(new Set([...current, ...visibleArticleIds]));
      return current.filter((id) => !visibleArticleIds.includes(id));
    });
  }

  function toggleArticleSelection(articleId: string, checked: boolean) {
    setSelectedArticleIds((current) => {
      if (checked) return Array.from(new Set([...current, articleId]));
      return current.filter((id) => id !== articleId);
    });
  }

  function applyArticleBulkAction() {
    if (!state || !articleBulkAction || selectedArticleIds.length === 0) return;
    const selected = new Set(selectedArticleIds);
    const now = new Date().toISOString();
    const nextArticles = articleBulkAction === "delete"
      ? state.articles.filter((article) => !selected.has(article.id ?? article.slug))
      : state.articles.map((article) => {
        if (!selected.has(article.id ?? article.slug)) return article;
        if (articleBulkAction === "restore") return { ...article, status: "draft" as const, deletedAt: undefined };
        return { ...article, status: "trash" as const, featuredOnHome: false, deletedAt: now };
      });
    const nextState = { ...state, articles: nextArticles };

    setState(nextState);
    setSelectedArticleIds([]);
    setArticleBulkAction("");
    void save(nextState);
  }
  const currentUser = state.users.find((user) => user.id === currentUserId) ?? state.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? state.users[0];
  const currentUserName = currentUser?.name || "Admin";
  const currentEmail = currentUser?.email || email;
  const templateSettings = state.templateSettings;
  const selectedAiProvider = aiProviderOptions.find((option) => option.value === state.aiSettings.provider) ?? aiProviderOptions[0];
  const aiModelOptions = selectedAiProvider.models;
  const aiModelSelectValue = aiModelOptions.includes(state.aiSettings.model) ? state.aiSettings.model : customAiModelValue;
  const aiModelIsCustom = aiModelSelectValue === customAiModelValue;
  const aiTestStatusTone = !aiTestStatus ? "" : aiTestStatus.includes("通过") ? "success" : aiTestStatus.includes("正在测试") ? "pending" : "error";
  const accountInitial = (currentUserName || email).slice(0, 1).toUpperCase();
  const canResetUserPasswords = currentUser?.role === "super-admin";
  const selectableBackupSectionCount = backupSectionOptions.filter((option) => canResetUserPasswords || !sensitiveBackupSections.has(option.key)).length;
  const allowedTabsForCurrentUser = new Set(getAllowedTabsForUser(currentUser));
  const visibleSidebarTabs = tabs.filter((item) => allowedTabsForCurrentUser.has(item.key));
  const canManageFrontendSettings = canManageFrontendState();
  const canRunAutoTranslation = Boolean(currentUser && frontendManagerRoles.has(currentUser.role));
  const translationRunning = translationStatus.startsWith("正在");
  const visibleAiUsageRecords = canResetUserPasswords
    ? state.aiUsageRecords
    : state.aiUsageRecords.filter((record) => record.userEmail.toLowerCase() === currentEmail.toLowerCase());
  const shouldShowAdminStatus = Boolean(status && status !== "已连接本地后台数据" && !hiddenAdminStatusMessages.has(status));
  const navigationProductOptions = [...state.products].sort((a, b) => (a.name.zh || a.name.en).localeCompare(b.name.zh || b.name.en));
  const navigationArticleOptions = state.articles
    .filter((article) => article.status !== "trash")
    .sort((a, b) => (a.title.zh || a.title.en).localeCompare(b.title.zh || b.title.en));
  const navigationPageOptions = state.pages
    .filter((page) => page.status !== "trash")
    .sort((a, b) => (a.title.zh || a.title.en).localeCompare(b.title.zh || b.title.en));
  const aiArticleTargets = state.articles
    .filter((article) => article.status !== "trash")
    .sort((a, b) => (a.title.zh || a.title.en).localeCompare(b.title.zh || b.title.en));
  const aiPageTargets = state.pages
    .filter((page) => page.status !== "trash")
    .sort((a, b) => (a.title.zh || a.title.en).localeCompare(b.title.zh || b.title.en));
  const aiSelectedTargetId = aiContentForm.target === "article" ? aiContentForm.targetArticleId : aiContentForm.targetPageId;
  const aiCanApply = aiContentForm.writeMode === "new" || Boolean(aiSelectedTargetId);
  const articleProductCategoryOptions = [...state.products]
    .sort((a, b) => (a.name.zh || a.name.en).localeCompare(b.name.zh || b.name.en))
    .map((product) => ({
      label: product.name.zh || product.name.en,
      value: product.slug
    }));
  const articleProductCategoryValues = new Set(articleProductCategoryOptions.map((item) => item.value));
  const articleProductCategoryLabelByValue = new Map(articleProductCategoryOptions.map((item) => [item.value, item.label]));
  const activeArticleCategoryIsProduct = activeArticle ? articleProductCategoryValues.has(activeArticle.category) : false;
  const orderedTemplateSections = [...homeSectionOptions].sort((a, b) => templateSettings.sectionOrder[a.key] - templateSettings.sectionOrder[b.key]);
  const orderedHeroSlides = [...templateSettings.heroSlides].sort((a, b) => a.order - b.order);
  const activeVisualSlide = orderedHeroSlides.find((slide) => slide.enabled) ?? orderedHeroSlides[0];
  const heroImageFiles = state.uploadedFiles
    .filter((file) => getMediaType(file) === "image")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const preferredVisualProducts = homeProductSlugs
    .map((slug) => state.products.find((product) => product.slug === slug))
    .filter((product): product is ProductCategory => Boolean(product));
  const preferredVisualProductSlugs = new Set(preferredVisualProducts.map((product) => product.slug));
  const visualProducts = [...preferredVisualProducts, ...state.products.filter((product) => !preferredVisualProductSlugs.has(product.slug))]
    .slice(0, templateSettings.homeProductCount);
  const visualArticles = state.articles
    .filter((article) => article.status === "published" && article.featuredOnHome)
    .slice(0, templateSettings.homeArticleCount);
  const visualHeroImage = activeVisualSlide?.imageUrl || "/assets/current-template/hero-tooling-range.jpg";
  const visualHeroImageStyle = { "--visual-hero-image": `url(${visualHeroImage})` } as CSSProperties;
  const visualText = (blockKey: string, fallback: string) => templateSettings.textBlocks[blockKey]?.zh || templateSettings.textBlocks[blockKey]?.en || fallback;
  const visualFactoryCards = [1, 2, 3].map((index) => ({
    titleKey: `factoryCard${index}Title`,
    bodyKey: `factoryCard${index}Body`
  }));
  const visualMetrics = [1, 2, 3].map((index) => ({
    valueKey: `heroMetric${index}Value`,
    labelKey: `heroMetric${index}Label`
  }));
  const visualChecklistKeys = ["marketsChecklist1", "marketsChecklist2", "marketsChecklist3"];

  function renderVisualTextTarget(options: VisualEditableTextOptions) {
    const targetClassName = ["visual-edit-target", options.className].filter(Boolean).join(" ");
    const textValue = options.value || (options.allowEmpty ? "" : "双击输入内容");
    const openEditor = (event: MouseEvent<HTMLElement>) => startVisualInlineEdit(options.editorKey, options.value, event);

    if (visualEditingKey === options.editorKey) {
      const inputControl = options.multiline ? (
        <textarea
          autoFocus
          value={visualDraftValue}
          onChange={(event) => setVisualDraftValue(event.target.value)}
          onKeyDown={(event) => handleVisualInlineKeyDown(event, options.onCommit, options.allowEmpty)}
        />
      ) : (
        <input
          autoFocus
          value={visualDraftValue}
          onChange={(event) => setVisualDraftValue(event.target.value)}
          onKeyDown={(event) => handleVisualInlineKeyDown(event, options.onCommit, options.allowEmpty)}
        />
      );

      return (
        <div className="visual-inline-editor" onDoubleClick={(event) => event.stopPropagation()}>
          {inputControl}
          <div className="visual-inline-actions">
            <button type="button" onClick={() => commitVisualInlineEdit(options.onCommit, options.allowEmpty)}>确定</button>
            <button type="button" onClick={cancelVisualInlineEdit}>取消</button>
          </div>
        </div>
      );
    }

    if (options.element === "h1") return <h1 className={targetClassName} title="双击编辑" onDoubleClick={openEditor}>{textValue}</h1>;
    if (options.element === "h3") return <h3 className={targetClassName} title="双击编辑" onDoubleClick={openEditor}>{textValue}</h3>;
    if (options.element === "p") return <p className={targetClassName} title="双击编辑" onDoubleClick={openEditor}>{textValue}</p>;
    if (options.element === "strong") return <strong className={targetClassName} title="双击编辑" onDoubleClick={openEditor}>{textValue}</strong>;
    if (options.element === "li") return <li className={targetClassName} title="双击编辑" onDoubleClick={openEditor}>{textValue}</li>;
    return <span className={targetClassName} title="双击编辑" onDoubleClick={openEditor}>{textValue}</span>;
  }

  function renderVisualImageTarget(options: VisualEditableImageOptions) {
    const imageValue = options.value || "/assets/current-template/hero-tooling-range.jpg";

    return (
      <div
        className={["visual-image-target", options.className, visualEditingKey === options.editorKey ? "editing" : ""].filter(Boolean).join(" ")}
        title="双击修改图片"
        onDoubleClick={(event) => startVisualInlineEdit(options.editorKey, options.value, event)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageValue} alt={options.alt} />
        <span className="visual-image-badge"><ImageIcon size={14} />图片</span>
        {visualEditingKey === options.editorKey ? (
          <div className="visual-image-editor" onDoubleClick={(event) => event.stopPropagation()}>
            <input
              autoFocus
              placeholder="粘贴图片 URL"
              value={visualDraftValue}
              onChange={(event) => setVisualDraftValue(event.target.value)}
              onKeyDown={(event) => handleVisualInlineKeyDown(event, options.onCommit, true)}
            />
            {heroImageFiles.length > 0 ? (
              <select value="" onChange={(event) => {
                const selectedFile = heroImageFiles.find((file) => file.id === event.target.value);
                if (!selectedFile) return;
                options.onCommit(selectedFile.url);
                cancelVisualInlineEdit();
              }}>
                <option value="">从媒体库选择</option>
                {heroImageFiles.map((file) => <option key={file.id} value={file.id}>{file.name}</option>)}
              </select>
            ) : null}
            <div className="visual-inline-actions">
              <button type="button" onClick={() => commitVisualInlineEdit(options.onCommit, true)}>确定</button>
              <button type="button" onClick={cancelVisualInlineEdit}>取消</button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  function renderVisualHeroBackgroundEditor() {
    if (visualEditingKey !== "hero-background") {
      return <span className="visual-hero-image-badge" onDoubleClick={(event) => startVisualInlineEdit("hero-background", visualHeroImage, event)}><ImageIcon size={14} />背景图</span>;
    }

    return (
      <div className="visual-hero-image-editor" onDoubleClick={(event) => event.stopPropagation()}>
        <input
          autoFocus
          placeholder="粘贴首屏背景图 URL"
          value={visualDraftValue}
          onChange={(event) => setVisualDraftValue(event.target.value)}
          onKeyDown={(event) => handleVisualInlineKeyDown(event, (value) => {
            if (activeVisualSlide) updateHeroSlide(activeVisualSlide.id, { imageUrl: value });
          }, true)}
        />
        {heroImageFiles.length > 0 ? (
          <select value="" onChange={(event) => {
            const selectedFile = heroImageFiles.find((file) => file.id === event.target.value);
            if (!selectedFile || !activeVisualSlide) return;
            updateHeroSlide(activeVisualSlide.id, { imageUrl: selectedFile.url });
            cancelVisualInlineEdit();
          }}>
            <option value="">从媒体库选择</option>
            {heroImageFiles.map((file) => <option key={file.id} value={file.id}>{file.name}</option>)}
          </select>
        ) : null}
        <div className="visual-inline-actions">
          <button type="button" onClick={() => commitVisualInlineEdit((value) => {
            if (activeVisualSlide) updateHeroSlide(activeVisualSlide.id, { imageUrl: value });
          }, true)}>确定</button>
          <button type="button" onClick={cancelVisualInlineEdit}>取消</button>
        </div>
      </div>
    );
  }

  const visualSectionNodes = orderedTemplateSections
    .filter((section) => templateSettings.visibleSections[section.key])
    .map((section) => {
      if (section.key === "products") {
        return (
          <section className="visual-front-section" key={section.key}>
            <div className="visual-section-head">
              <div>
                {renderVisualTextTarget({
                  editorKey: "text-productsEyebrow",
                  value: visualText("productsEyebrow", "PRODUCT CATALOG"),
                  element: "span",
                  className: "eyebrow",
                  onCommit: (value) => updateTemplateTextBlock("productsEyebrow", "zh", value)
                })}
                {renderVisualTextTarget({
                  editorKey: "text-productsTitle",
                  value: visualText("productsTitle", "硬质合金刀具目录"),
                  element: "h3",
                  onCommit: (value) => updateTemplateTextBlock("productsTitle", "zh", value)
                })}
              </div>
              {renderVisualTextTarget({
                editorKey: "text-productsBody",
                value: visualText("productsBody", "覆盖经销商备货、工厂加工与定制刀具需求。"),
                element: "p",
                className: "visual-section-summary",
                multiline: true,
                onCommit: (value) => updateTemplateTextBlock("productsBody", "zh", value)
              })}
            </div>
            <div className="visual-front-grid products">
              {visualProducts.length > 0 ? visualProducts.map((product) => {
                const productId = getProductId(product);
                return (
                  <article className="visual-front-card product" key={productId}>
                    {renderVisualImageTarget({
                      editorKey: `product-image-${productId}`,
                      value: product.imageUrl ?? "",
                      alt: product.name.zh || product.name.en,
                      className: "visual-card-media",
                      onCommit: (value) => updateVisualProduct(productId, (currentProduct) => ({ ...currentProduct, imageUrl: value || undefined }))
                    })}
                    {renderVisualTextTarget({
                      editorKey: `product-title-${productId}`,
                      value: product.name.zh || product.name.en,
                      element: "strong",
                      onCommit: (value) => updateVisualProduct(productId, (currentProduct) => ({ ...currentProduct, name: { ...currentProduct.name, zh: value } }))
                    })}
                    {renderVisualTextTarget({
                      editorKey: `product-summary-${productId}`,
                      value: product.summary.zh || product.summary.en,
                      element: "p",
                      multiline: true,
                      onCommit: (value) => updateVisualProduct(productId, (currentProduct) => ({ ...currentProduct, summary: { ...currentProduct.summary, zh: value } }))
                    })}
                  </article>
                );
              }) : <p className="visual-muted">暂无可展示产品分类。</p>}
            </div>
          </section>
        );
      }

      if (section.key === "factory") {
        return (
          <section className="visual-front-section factory" key={section.key}>
            <div className="visual-section-head">
              <div>
                {renderVisualTextTarget({
                  editorKey: "text-factoryEyebrow",
                  value: visualText("factoryEyebrow", "工厂能力"),
                  element: "span",
                  className: "eyebrow",
                  onCommit: (value) => updateTemplateTextBlock("factoryEyebrow", "zh", value)
                })}
                {renderVisualTextTarget({
                  editorKey: "text-factoryTitle",
                  value: visualText("factoryTitle", "从几何、涂层到包装的供应能力"),
                  element: "h3",
                  multiline: true,
                  onCommit: (value) => updateTemplateTextBlock("factoryTitle", "zh", value)
                })}
              </div>
            </div>
            <div className="visual-front-grid factory">
              {visualFactoryCards.map((item) => (
                <article className="visual-front-card compact" key={item.titleKey}>
                  {renderVisualTextTarget({
                    editorKey: `text-${item.titleKey}`,
                    value: visualText(item.titleKey, "工厂能力"),
                    element: "strong",
                    onCommit: (value) => updateTemplateTextBlock(item.titleKey, "zh", value)
                  })}
                  {renderVisualTextTarget({
                    editorKey: `text-${item.bodyKey}`,
                    value: visualText(item.bodyKey, "适合经销商长期备货、样品确认与批量订单。"),
                    element: "p",
                    multiline: true,
                    onCommit: (value) => updateTemplateTextBlock(item.bodyKey, "zh", value)
                  })}
                </article>
              ))}
            </div>
          </section>
        );
      }

      if (section.key === "markets") {
        return (
          <section className="visual-front-section markets" key={section.key}>
            <div className="visual-section-head">
              <div>
                {renderVisualTextTarget({
                  editorKey: "text-marketsEyebrow",
                  value: visualText("marketsEyebrow", "出口市场"),
                  element: "span",
                  className: "eyebrow",
                  onCommit: (value) => updateTemplateTextBlock("marketsEyebrow", "zh", value)
                })}
                {renderVisualTextTarget({
                  editorKey: "text-marketsTitle",
                  value: visualText("marketsTitle", "多语言市场与 RFQ 清单"),
                  element: "h3",
                  multiline: true,
                  onCommit: (value) => updateTemplateTextBlock("marketsTitle", "zh", value)
                })}
              </div>
              {renderVisualTextTarget({
                editorKey: "text-marketsBody",
                value: visualText("marketsBody", "支持多语言产品页、快速 RFQ 信息和出口文件，适合铣刀、钻头与 OEM 组合采购。"),
                element: "p",
                className: "visual-section-summary",
                multiline: true,
                onCommit: (value) => updateTemplateTextBlock("marketsBody", "zh", value)
              })}
            </div>
            <div className="visual-market-strip">
              {state.enabledLocales.map((localeCode) => {
                const item = locales.find((entry) => entry.code === localeCode);
                return <span key={localeCode}>{item ? `${item.flag} ${item.nativeName}` : localeCode}</span>;
              })}
            </div>
          </section>
        );
      }

      if (section.key === "articles") {
        return (
          <section className="visual-front-section" key={section.key}>
            <div className="visual-section-head">
              <div>
                {renderVisualTextTarget({
                  editorKey: "text-articlesEyebrow",
                  value: visualText("articlesEyebrow", "技术文章"),
                  element: "span",
                  className: "eyebrow",
                  onCommit: (value) => updateTemplateTextBlock("articlesEyebrow", "zh", value)
                })}
                {renderVisualTextTarget({
                  editorKey: "text-articlesTitle",
                  value: visualText("articlesTitle", "技术文章"),
                  element: "h3",
                  multiline: true,
                  onCommit: (value) => updateTemplateTextBlock("articlesTitle", "zh", value)
                })}
              </div>
            </div>
            <div className="visual-front-grid articles">
              {visualArticles.length > 0 ? visualArticles.map((article) => {
                const articleId = article.id ?? article.slug;
                return (
                  <article className="visual-front-card article" key={articleId}>
                    {renderVisualImageTarget({
                      editorKey: `article-image-${articleId}`,
                      value: article.coverImageUrl ?? "",
                      alt: article.title.zh || article.title.en,
                      className: "visual-card-media",
                      onCommit: (value) => updateVisualArticle(articleId, (currentArticle) => ({ ...currentArticle, coverImageUrl: value || undefined }))
                    })}
                    {renderVisualTextTarget({
                      editorKey: `article-category-${articleId}`,
                      value: article.category,
                      element: "span",
                      className: "visual-article-category",
                      onCommit: (value) => updateVisualArticle(articleId, (currentArticle) => ({ ...currentArticle, category: value }))
                    })}
                    {renderVisualTextTarget({
                      editorKey: `article-title-${articleId}`,
                      value: article.title.zh || article.title.en,
                      element: "strong",
                      multiline: true,
                      onCommit: (value) => updateVisualArticle(articleId, (currentArticle) => ({ ...currentArticle, title: { ...currentArticle.title, zh: value } }))
                    })}
                    {renderVisualTextTarget({
                      editorKey: `article-excerpt-${articleId}`,
                      value: article.excerpt.zh || article.excerpt.en,
                      element: "p",
                      multiline: true,
                      onCommit: (value) => updateVisualArticle(articleId, (currentArticle) => ({ ...currentArticle, excerpt: { ...currentArticle.excerpt, zh: value } }))
                    })}
                  </article>
                );
              }) : <p className="visual-muted">暂无首页技术文章。</p>}
            </div>
          </section>
        );
      }

      return (
        <section className="visual-front-section rfq" key={section.key}>
          <div className="visual-rfq-panel">
            <div>
              {renderVisualTextTarget({
                editorKey: "text-rfqEyebrow",
                value: visualText("rfqEyebrow", "询盘表单"),
                element: "span",
                className: "eyebrow",
                onCommit: (value) => updateTemplateTextBlock("rfqEyebrow", "zh", value)
              })}
              {renderVisualTextTarget({
                editorKey: "text-rfqTitle",
                value: visualText("rfqTitle", "把刀具清单发给 KeyproTools"),
                element: "h3",
                multiline: true,
                onCommit: (value) => updateTemplateTextBlock("rfqTitle", "zh", value)
              })}
              {renderVisualTextTarget({
                editorKey: "text-rfqBody",
                value: visualText("rfqBody", "规格、数量、涂层、包装和交期信息会在前台询盘表单中收集。"),
                element: "p",
                multiline: true,
                onCommit: (value) => updateTemplateTextBlock("rfqBody", "zh", value)
              })}
            </div>
            {renderVisualTextTarget({
              editorKey: "text-primaryCtaLabel-rfq",
              value: templateSettings.primaryCtaLabel.zh || templateSettings.primaryCtaLabel.en,
              element: "span",
              className: "visual-rfq-button",
              onCommit: (value) => updateTemplateText("primaryCtaLabel", "zh", value)
            })}
          </div>
        </section>
      );
    });
  const templateVisualEditorPanel = (
    <section className="template-visual-editor-shell">
      <div className="visual-editor-topbar">
        <div>
          <span className="eyebrow">Advanced editor</span>
          <h2>前台所见即所得编辑</h2>
        </div>
        <div className="visual-editor-actions">
          <button type="button" onClick={() => setTemplateEditorMode("form")}>
            <LayoutPanelTop size={16} />表单编辑
          </button>
          <button
            disabled={!canManageFrontendSettings || !frontendSettingsDirty}
            type="button"
            onClick={() => {
              if (guardFrontendSettingsAccess()) void save();
            }}
          >
            <Save size={16} />{frontendSettingsDirty ? "保存模板" : "已保存"}
          </button>
          <Link href={`/${locale}`} target="_blank" rel="noopener noreferrer">打开前台</Link>
        </div>
      </div>

      <div className="visual-editor-stage">
        <aside className="visual-editor-sidebar" aria-label="首页模块控制">
          <strong>页面模块</strong>
          <div className="visual-module-list">
            {orderedTemplateSections.map((section) => (
              <button
                className={templateSettings.visibleSections[section.key] ? "enabled" : ""}
                disabled={!canManageFrontendSettings}
                key={section.key}
                type="button"
                onClick={() => updateTemplateSectionVisibility(section.key, !templateSettings.visibleSections[section.key])}
              >
                <span>{section.label}</span>
                <small>{templateSettings.visibleSections[section.key] ? "显示" : "隐藏"}</small>
              </button>
            ))}
          </div>
          <div className="visual-editor-counter">
            <span>首页产品</span>
            <button disabled={!canManageFrontendSettings || templateSettings.homeProductCount <= 1} type="button" onClick={() => updateTemplateSettings({ homeProductCount: Math.max(1, templateSettings.homeProductCount - 1) })}>-</button>
            <strong>{templateSettings.homeProductCount}</strong>
            <button disabled={!canManageFrontendSettings || templateSettings.homeProductCount >= 12} type="button" onClick={() => updateTemplateSettings({ homeProductCount: Math.min(12, templateSettings.homeProductCount + 1) })}>+</button>
          </div>
          <div className="visual-editor-counter">
            <span>首页文章</span>
            <button disabled={!canManageFrontendSettings || templateSettings.homeArticleCount <= 0} type="button" onClick={() => updateTemplateSettings({ homeArticleCount: Math.max(0, templateSettings.homeArticleCount - 1) })}>-</button>
            <strong>{templateSettings.homeArticleCount}</strong>
            <button disabled={!canManageFrontendSettings || templateSettings.homeArticleCount >= 12} type="button" onClick={() => updateTemplateSettings({ homeArticleCount: Math.min(12, templateSettings.homeArticleCount + 1) })}>+</button>
          </div>
          <label className="checkline">
            <input disabled={!canManageFrontendSettings} type="checkbox" checked={templateSettings.heroCarouselEnabled} onChange={(event) => updateTemplateSettings({ heroCarouselEnabled: event.target.checked })} />
            轮播背景
          </label>
          <label className="checkline">
            <input disabled={!canManageFrontendSettings} type="checkbox" checked={templateSettings.showHeroMetrics} onChange={(event) => updateTemplateSettings({ showHeroMetrics: event.target.checked })} />
            首屏指标
          </label>
        </aside>

        <div className="visual-front-page" aria-label="首页可视化编辑预览">
          <section
            className={`visual-front-hero ${templateSettings.homeTemplate}`}
            style={visualHeroImageStyle}
            onDoubleClick={(event) => startVisualInlineEdit("hero-background", visualHeroImage, event)}
          >
            {renderVisualHeroBackgroundEditor()}
            {renderVisualTextTarget({
              editorKey: "hero-kicker",
              value: templateSettings.heroKicker.zh || templateSettings.heroKicker.en,
              element: "span",
              className: "visual-eyebrow",
              onCommit: (value) => updateTemplateText("heroKicker", "zh", value)
            })}
            {renderVisualTextTarget({
              editorKey: "hero-title",
              value: templateSettings.heroTitle.zh || templateSettings.heroTitle.en,
              element: "h1",
              multiline: true,
              onCommit: (value) => updateTemplateText("heroTitle", "zh", value)
            })}
            {renderVisualTextTarget({
              editorKey: "hero-body",
              value: templateSettings.heroBody.zh || templateSettings.heroBody.en,
              element: "p",
              className: "visual-hero-copy",
              multiline: true,
              onCommit: (value) => updateTemplateText("heroBody", "zh", value)
            })}
            <div className="visual-hero-actions">
              {renderVisualTextTarget({
                editorKey: "hero-primary-cta",
                value: templateSettings.primaryCtaLabel.zh || templateSettings.primaryCtaLabel.en,
                element: "span",
                className: "visual-cta primary",
                onCommit: (value) => updateTemplateText("primaryCtaLabel", "zh", value)
              })}
              {renderVisualTextTarget({
                editorKey: "hero-secondary-cta",
                value: templateSettings.secondaryCtaLabel.zh || templateSettings.secondaryCtaLabel.en,
                element: "span",
                className: "visual-cta secondary",
                onCommit: (value) => updateTemplateText("secondaryCtaLabel", "zh", value)
              })}
            </div>
            {templateSettings.showHeroMetrics ? (
              <div className="visual-metrics">
                {visualMetrics.map((item) => (
                  <div className="visual-metric-card" key={item.valueKey}>
                    {renderVisualTextTarget({
                      editorKey: `text-${item.valueKey}`,
                      value: visualText(item.valueKey, "指标"),
                      element: "strong",
                      onCommit: (value) => updateTemplateTextBlock(item.valueKey, "zh", value)
                    })}
                    {renderVisualTextTarget({
                      editorKey: `text-${item.labelKey}`,
                      value: visualText(item.labelKey, "说明"),
                      element: "span",
                      onCommit: (value) => updateTemplateTextBlock(item.labelKey, "zh", value)
                    })}
                  </div>
                ))}
              </div>
            ) : null}
          </section>
          {visualSectionNodes}
        </div>
      </div>
    </section>
  );
  const settingsSaveAction = (
    <div className="settings-actions">
      <button type="button" disabled={!canManageFrontendSettings} onClick={() => {
        if (guardFrontendSettingsAccess()) void save();
      }}>
        保存设置
      </button>
    </div>
  );
  const orderedLocaleOptions = [
    ...state.enabledLocales
      .map((localeCode) => locales.find((item) => item.code === localeCode))
      .filter((item): item is typeof locales[number] => Boolean(item)),
    ...locales.filter((item) => !state.enabledLocales.includes(item.code as LocaleCode))
  ];
  const sidebarClassName = "admin-sidebar";
  const languageSettingsPanel = (
    <section className="settings-panel">
      <div className="settings-panel-head with-action">
        <div>
          <h2>前台可显示语言</h2>
          <span>勾选后会出现在前台语言选择器中，URL 路由和 RTL 方向仍自动兼容。</span>
        </div>
        <div className="settings-actions">
          <button type="button" disabled={!canManageFrontendSettings || !frontendSettingsDirty} onClick={() => {
            if (guardFrontendSettingsAccess()) void save();
          }}>
            {frontendSettingsDirty ? "保存语言" : "已保存"}
          </button>
        </div>
      </div>
      <div className="language-toggle-grid">
        {orderedLocaleOptions.map((item) => {
          const localeCode = item.code as LocaleCode;
          const enabledIndex = state.enabledLocales.indexOf(localeCode);
          const isEnabled = enabledIndex >= 0;

          return (
            <div className={isEnabled ? "language-toggle enabled" : "language-toggle"} key={item.code}>
              <label>
                <input
                  disabled={!canManageFrontendSettings}
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(event) => toggleEnabledLocale(localeCode, event.target.checked)}
                />
                <span>
                  <strong><span className="language-toggle-flag">{item.flag}</span>{item.nativeName}</strong>
                  <small>{item.label} · {item.region}</small>
                </span>
              </label>
              <label className="language-order-field">
                <span>排序</span>
                <input
                  aria-label={`${item.nativeName} 排序序号`}
                  disabled={!canManageFrontendSettings || !isEnabled}
                  max={state.enabledLocales.length}
                  min={1}
                  type="number"
                  value={isEnabled ? enabledIndex + 1 : ""}
                  onChange={(event) => updateEnabledLocaleOrder(localeCode, Number(event.target.value))}
                />
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
  const navigationSettingsPanel = (
    <section className="settings-panel navigation-panel">
      <div className="settings-panel-head with-action">
        <div>
          <h2>首页导航栏</h2>
          <span>设置前台 Header 的一级导航、下拉子导航、链接、排序和启用状态。</span>
        </div>
        <div className="settings-actions">
          <button type="button" disabled={!canManageFrontendSettings || !frontendSettingsDirty} onClick={() => {
            if (guardFrontendSettingsAccess()) void save();
          }}>
            {frontendSettingsDirty ? "保存导航" : "已保存"}
          </button>
          <button type="button" disabled={!canManageFrontendSettings} onClick={() => addNavigationItem()}>新增一级导航</button>
        </div>
      </div>
      <div className="navigation-settings-list">
        {navigationRows.map(({ item, depth, childCount }) => {
          const parentOptions = sortedNavigation.filter((parent) => (
            parent.id !== item.id && !navigationWouldCreateCycle(sortedNavigation, item.id, parent.id)
          ));

          return (
            <article
              className={depth > 0 ? "admin-edit-card compact nav-settings-card child" : "admin-edit-card compact nav-settings-card"}
              key={item.id}
              style={{ "--nav-depth": depth } as CSSProperties}
            >
              <div className="nav-hierarchy-cell">
                <span className="nav-level-badge">{depth === 0 ? "一级导航" : `${depth + 1}级导航`}</span>
                <label>导航名称
                  <input disabled={!canManageFrontendSettings} value={item.label.zh || item.label.en} onChange={(event) => updateNavigationItem(item.id, { label: { ...item.label, en: event.target.value, zh: event.target.value } })} />
                </label>
                {childCount > 0 ? <small>包含 {childCount} 个下级导航</small> : <small>可添加为下拉菜单项</small>}
              </div>
              <label>父级导航
                <select disabled={!canManageFrontendSettings} value={item.parentId ?? ""} onChange={(event) => updateNavigationItem(item.id, { parentId: event.target.value || undefined })}>
                  <option value="">作为一级导航</option>
                  {parentOptions.map((parent) => {
                    const parentDepth = navigationDepthById.get(parent.id) ?? 0;
                    return (
                      <option key={parent.id} value={parent.id}>
                        {`${parentDepth + 1}级 · ${parent.label.zh || parent.label.en}`}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label>选择链接
                <select disabled={!canManageFrontendSettings} value="" onChange={(event) => {
                  if (event.target.value) updateNavigationItem(item.id, { href: event.target.value });
                }}>
                  <option value="">手动输入或选择</option>
                  <optgroup label="系统页面">{systemNavigationOptions.map((option) => <option key={option.href} value={option.href}>{option.label}</option>)}</optgroup>
                  {navigationPageOptions.length > 0 ? <optgroup label="页面">{navigationPageOptions.map((page) => <option key={page.id ?? page.slug} value={`/pages/${page.slug}`}>{compactOptionLabel(page.title.zh || page.title.en, "页面")}</option>)}</optgroup> : null}
                  {navigationProductOptions.length > 0 ? <optgroup label="产品分类">{navigationProductOptions.map((product) => <option key={product.id ?? product.slug} value={`/products/${product.slug}`}>{compactOptionLabel(product.name.zh || product.name.en, "产品分类")}</option>)}</optgroup> : null}
                  {navigationArticleOptions.length > 0 ? <optgroup label="文章">{navigationArticleOptions.map((article) => <option key={article.id ?? article.slug} value={`/articles/${article.slug}`}>{compactOptionLabel(article.title.zh || article.title.en, "文章")}</option>)}</optgroup> : null}
                </select>
              </label>
              <label className="nav-link-field">链接<input disabled={!canManageFrontendSettings} value={item.href} onChange={(event) => updateNavigationItem(item.id, { href: event.target.value })} /></label>
              <label>排序<input disabled={!canManageFrontendSettings} type="number" value={item.order} onChange={(event) => updateNavigationItem(item.id, { order: Number(event.target.value) || 0 })} /></label>
              <label className="checkline"><input disabled={!canManageFrontendSettings} type="checkbox" checked={item.enabled} onChange={(event) => updateNavigationItem(item.id, { enabled: event.target.checked })} />显示</label>
              <label className="checkline"><input disabled={!canManageFrontendSettings} type="checkbox" checked={Boolean(item.openInNewTab)} onChange={(event) => updateNavigationItem(item.id, { openInNewTab: event.target.checked })} />新窗口</label>
              <button className="nav-child-button" disabled={!canManageFrontendSettings} type="button" onClick={() => addNavigationItem(item.id)}>新增下级</button>
              <button className="contact-delete-button" disabled={!canManageFrontendSettings} type="button" onClick={() => removeNavigationItem(item.id)}>删除</button>
            </article>
          );
        })}
      </div>
    </section>
  );

  return (
    <main className="real-admin">
      <div className={sidebarCollapsed ? "admin-layout sidebar-collapsed" : "admin-layout"}>
        <aside className={sidebarClassName}>
          {visibleSidebarTabs.map((item) => {
            const Icon = item.icon;
            return (
              <button className={tab === item.key ? "active" : ""} key={item.key} onClick={() => switchAdminTab(item.key)} title={item.label} type="button">
                <span className="admin-sidebar-icon"><Icon size={17} /></span>
                <span className="admin-sidebar-label">{item.label}</span>
              </button>
            );
          })}
          <div className="admin-sidebar-footer">
            <button
              className="admin-sidebar-toggle"
              type="button"
              onClick={() => setSidebarCollapsed((current) => !current)}
              aria-expanded={!sidebarCollapsed}
            >
              <span className="admin-sidebar-icon"><Menu size={17} /></span>
              <span className="admin-sidebar-label">{sidebarCollapsed ? "展开菜单" : "收起菜单"}</span>
            </button>
            <Link className={tab === "account" ? "admin-account-trigger active" : "admin-account-trigger"} href={`/${locale}/admin?tab=account`} onClick={() => setTab("account")}>
              <span className="admin-avatar">
                {currentUser?.avatarUrl ? <Image src={currentUser.avatarUrl} alt={currentUserName} width={36} height={36} unoptimized /> : accountInitial}
              </span>
              <span>
                <strong>账号</strong>
                <small>{currentUserName}</small>
              </span>
            </Link>
          </div>
        </aside>

        <section className="admin-workspace">
          {shouldShowAdminStatus ? (
            <div className="admin-workspace-toolbar">
              <span>{status}</span>
            </div>
          ) : null}
          {tab === "overview" ? (
            <>
              <div className="admin-stat-grid">
                {stats?.map(([label, value]) => (
                  <div key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <section className="world-clock-panel" aria-label="世界主要城市时间">
                <div className="admin-section-title">
                  <h2>世界主要城市时间</h2>
                </div>
                <div className="world-clock-grid">
                  {worldClocks.map((clock) => (
                    <article className="world-clock-card" key={`${clock.city}-${clock.zone}`}>
                      <span>{clock.city}</span>
                      <strong>{clock.time}</strong>
                      <small>{clock.date}</small>
                    </article>
                  ))}
                </div>
              </section>
            </>
          ) : null}

          {tab === "products" ? (
            <>
              <div className="wp-taxonomy-screen">
                <aside className="wp-taxonomy-form">
                  <h2>{editingProductId ? "编辑分类" : "添加分类"}</h2>
                  <label>名称
                    <input
                      value={productForm.zh}
                      onChange={(event) => setProductForm({
                        ...productForm,
                        zh: event.target.value,
                        slug: productForm.slug || slugify(event.target.value)
                      })}
                    />
                    <small>名称是它在网站上的显示方式。</small>
                  </label>
                  <label>别名
                    <input value={productForm.slug} onChange={(event) => setProductForm({ ...productForm, slug: slugify(event.target.value) })} />
                    <small>用于 URL，例如 carbide-end-mills。</small>
                  </label>
                  <label>父级分类
                    <select value={productForm.parentId} onChange={(event) => setProductForm({ ...productForm, parentId: event.target.value })}>
                      <option value="">无</option>
                      {state.products
                        .filter((product) => (product.id ?? product.slug) !== editingProductId)
                        .map((product) => (
                          <option key={product.id ?? product.slug} value={product.id ?? product.slug}>{product.name.zh || product.name.en}</option>
                        ))}
                    </select>
                    <small>可用于目录分层，例如“刀具”下面再放“铣刀”。</small>
                  </label>
                  <label>描述
                    <textarea value={productForm.summaryZh} onChange={(event) => setProductForm({ ...productForm, summaryZh: event.target.value })} />
                    <small>部分主题会在分类卡片或产品页显示描述。</small>
                  </label>
                  <div className="wp-taxonomy-actions">
                    <button type="button" onClick={submitProductForm}>{editingProductId ? "更新分类" : "添加新分类"}</button>
                    {editingProductId ? <button type="button" onClick={resetProductForm}>取消编辑</button> : null}
                  </div>
                </aside>

                <section className="wp-taxonomy-list">
                  <div className="wp-list-toolbar taxonomy">
                    <select value={productBulkAction} onChange={(event) => setProductBulkAction(event.target.value)}>
                      <option value="">批量操作</option>
                      <option value="delete">删除</option>
                    </select>
                    <button type="button" onClick={applyProductBulkAction}>应用</button>
                    <input placeholder="搜索分类" value={productQuery} onChange={(event) => setProductQuery(event.target.value)} />
                  </div>
                  <div className="wp-article-table taxonomy-table" role="table" aria-label="产品分类列表">
                    <div className="wp-taxonomy-row header" role="row">
                      <span>
                        <input
                          type="checkbox"
                          aria-label="选择全部分类"
                          checked={allVisibleProductsSelected}
                          onChange={(event) => toggleVisibleProducts(event.target.checked)}
                        />
                      </span>
                      <strong>名称</strong>
                      <strong>描述</strong>
                      <strong>别名</strong>
                      <strong>父级</strong>
                      <strong>总数</strong>
                    </div>
                    {productVisibleRows.map(({ product, depth }) => {
                      const productId = product.id ?? product.slug;
                      const parent = state.products.find((item) => (item.id ?? item.slug) === product.parentId);
                      const childCount = productChildCounts.get(productId) ?? 0;
                      const expanded = productSearchActive || expandedProductSet.has(productId);

                      return (
                        <div className={childCount > 0 ? "wp-taxonomy-row has-children" : "wp-taxonomy-row"} role="row" key={productId} style={{ "--category-depth": depth } as CSSProperties}>
                          <span>
                            <input
                              type="checkbox"
                              aria-label={`选择 ${product.name.zh || product.name.en}`}
                              checked={selectedProductIds.includes(productId)}
                              onChange={(event) => toggleProductSelection(productId, event.target.checked)}
                            />
                          </span>
                          <div className="taxonomy-name-cell">
                            {childCount > 0 ? (
                              <button
                                aria-expanded={expanded}
                                className="taxonomy-tree-toggle"
                                disabled={productSearchActive}
                                type="button"
                                onClick={() => toggleProductExpanded(productId)}
                              >
                                {expanded ? "收起" : "展开"}
                              </button>
                            ) : null}
                            <button className="taxonomy-edit-trigger" type="button" onClick={() => editProduct(product)}>
                              <span className="taxonomy-name">{product.name.zh || product.name.en}</span>
                              <small>编辑</small>
                            </button>
                            {childCount > 0 ? <span className="taxonomy-child-count">子目录 {childCount}</span> : null}
                          </div>
                          <span>{product.summary.zh || product.summary.en || "-"}</span>
                          <span>{product.slug}</span>
                          <span>{parent ? parent.name.zh || parent.name.en : "-"}</span>
                          <span>0</span>
                          <div className="wp-row-actions">
                            <button type="button" onClick={() => editProduct(product)}>编辑</button>
                            <button
                              type="button"
                              onClick={() => {
                                const nextState = { ...state, products: state.products.filter((item) => (item.id ?? item.slug) !== productId) };
                                setState(nextState);
                                void save(nextState);
                              }}
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {productVisibleRows.length === 0 ? <div className="wp-empty-row">没有找到分类。</div> : null}
                  </div>
                </section>
              </div>
            </>
          ) : null}

          {tab === "pages" ? (
            <>
              <div className="wp-screen-tabs">
                <button className={pageMode === "list" ? "active" : ""} type="button" onClick={() => setPageMode("list")}>所有页面</button>
                <button className={pageMode === "editor" ? "active" : ""} type="button" onClick={() => setPageMode("editor")}>编辑页面</button>
                <button
                  className="wp-screen-action"
                  type="button"
                  onClick={() => {
                    const page = emptyPage();
                    setState({ ...state, pages: [page, ...state.pages] });
                    setActivePageId(page.id ?? page.slug);
                    setPageMode("editor");
                  }}
                >
                  新增页面
                </button>
              </div>

              {pageMode === "list" ? (
                <div className="wp-list-screen">
                  <section className="file-upload-panel">
                    <strong>独立页面</strong>
                    <span>用于创建关于我们、隐私政策、服务说明等非文章内容；发布后可在左侧“导航栏”选择并添加到前台导航。</span>
                  </section>

                  <div className="wp-counts">
                    <button type="button" onClick={() => setPageStatusFilter("all")}>全部 ({pageCounts.all})</button>
                    <button type="button" onClick={() => setPageStatusFilter("published")}>已发布 ({pageCounts.published})</button>
                    <button type="button" onClick={() => setPageStatusFilter("draft")}>草稿 ({pageCounts.draft})</button>
                    <button type="button" onClick={() => setPageStatusFilter("trash")}>回收站 ({pageCounts.trash})</button>
                  </div>

                  <div className="wp-list-toolbar">
                    <select value={pageStatusFilter} onChange={(event) => setPageStatusFilter(event.target.value as "all" | "published" | "draft" | "trash")}>
                      <option value="all">全部状态</option>
                      <option value="published">已发布</option>
                      <option value="draft">草稿</option>
                      <option value="trash">回收站</option>
                    </select>
                    <input placeholder="搜索页面" value={pageQuery} onChange={(event) => setPageQuery(event.target.value)} />
                  </div>

                  <div className="wp-article-table wp-page-table" role="table" aria-label="页面列表">
                    <div className="wp-article-row wp-page-row header" role="row">
                      <strong>标题</strong>
                      <strong>Slug</strong>
                      <strong>状态</strong>
                      <strong>日期</strong>
                      <strong>操作</strong>
                    </div>
                    {filteredPages.map((page) => {
                      const pageId = page.id ?? page.slug;

                      return (
                        <div className="wp-article-row wp-page-row" role="row" key={pageId}>
                          <Link
                            className="wp-article-title-link"
                            href={`/${locale}/pages/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {page.title.zh || page.title.en || "未命名页面"}
                            <small>查看 · /pages/{page.slug}</small>
                          </Link>
                          <span>{page.slug}</span>
                          <span>{pageStatusLabel(page)}</span>
                          <span>{page.status === "trash" ? (page.deletedAt ? new Date(page.deletedAt).toLocaleString() : "已移至回收站") : (page.publishedAt ? new Date(page.publishedAt).toLocaleString() : "尚未发布")}</span>
                          <div className="wp-article-actions">
                            <button
                              className="wp-article-edit-button"
                              type="button"
                              onClick={() => {
                                setActivePageId(pageId);
                                setPageMode("editor");
                              }}
                            >
                              编辑
                            </button>
                            <button
                              className="wp-article-delete-button"
                              type="button"
                              onClick={() => deletePageFromList(page)}
                            >
                              {page.status === "trash" ? "永久删除" : "删除"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {filteredPages.length === 0 ? <div className="wp-empty-row">没有找到页面。</div> : null}
                  </div>
                </div>
              ) : null}

              {pageMode === "editor" ? (
                activePage && activePageIndex >= 0 ? (
                  <div className="wp-editor-screen">
                    <article className="wp-editor">
                      <input
                        className="wp-title-input"
                        placeholder="添加页面标题"
                        value={activePage.title.zh ?? activePage.title.en ?? ""}
                        onChange={(event) => updatePageTitle(event.target.value)}
                      />
                      <label>页面摘要<textarea className="wp-excerpt" value={activePage.excerpt.zh ?? activePage.excerpt.en ?? ""} onChange={(event) => updatePageExcerpt(event.target.value)} /></label>
                      <label>页面正文
                        <textarea
                          className="wp-body page-body-editor"
                          rows={24}
                          value={activePage.body.zh ?? activePage.body.en ?? ""}
                          onChange={(event) => updatePageBody(event.target.value)}
                        />
                      </label>
                    </article>

                    <aside className="wp-editor-side">
                      <section className="wp-side-box">
                        <h2>发布</h2>
                        <span>状态：{pageStatusLabel(activePage)}</span>
                        <span>日期：{activePage.status === "trash" ? (activePage.deletedAt ? new Date(activePage.deletedAt).toLocaleString() : "已移至回收站") : (activePage.publishedAt ? new Date(activePage.publishedAt).toLocaleString() : "立即发布")}</span>
                        <div className="wp-publish-box">
                          {activePage.status === "trash" ? (
                            <>
                              <button className="primary" type="button" onClick={restoreActivePage}>恢复页面</button>
                              <button className="danger" type="button" onClick={deleteActivePagePermanently}>永久删除</button>
                            </>
                          ) : (
                            <>
                              <button type="button" onClick={() => save()}>保存草稿</button>
                              <button className="primary" type="button" onClick={() => commitPage(activePageIndex, { status: "published", publishedAt: new Date().toISOString(), deletedAt: undefined })}>发布</button>
                              <button className="full" type="button" disabled={!canRunAutoTranslation || translationRunning} onClick={() => runAutoTranslation("page", activePage.id ?? activePage.slug)}>自动翻译当前页面</button>
                              <button className="danger full" type="button" onClick={moveActivePageToTrash}>移至回收站</button>
                            </>
                          )}
                        </div>
                      </section>

                      <section className="wp-side-box">
                        <h2>固定链接</h2>
                        <label>Slug<input value={activePage.slug} onChange={(event) => updateActivePage({ slug: slugify(event.target.value) })} /></label>
                        <span>发布地址：/{locale}/pages/{activePage.slug || "page-slug"}</span>
                      </section>
                    </aside>
                  </div>
                ) : (
                  <div className="wp-editor empty">还没有页面，点击“新增页面”开始。</div>
                )
              ) : null}
            </>
          ) : null}

          {tab === "articles" ? (
            <>
              <div className="wp-screen-tabs">
                <button className={articleMode === "list" ? "active" : ""} type="button" onClick={() => setArticleMode("list")}>所有文章</button>
                <button className={articleMode === "editor" ? "active" : ""} type="button" onClick={() => {
                  if (articleMode === "editor") return;
                  startNewArticle();
                }}>写文章</button>
              </div>

              {articleMode === "list" ? (
                <div className="wp-list-screen">
                  <div className="article-import-panel">
                    <div>
                      <strong>批量导入文章</strong>
                      <span>下载 CSV 模板后填写标题、分类、状态和正文，导入后会自动保存到前台文章数据。</span>
                    </div>
                    <div className="article-import-actions">
                      <button type="button" onClick={downloadArticleImportTemplate}>
                        下载导入模板
                      </button>
                      <label className="article-import-upload">
                        导入 CSV
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          onChange={(event) => {
                            importArticlesFromCsv(event.currentTarget.files?.[0] ?? null);
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="wp-counts">
                    <button type="button" onClick={() => setArticleStatusFilter("all")}>全部 ({articleCounts.all})</button>
                    <button type="button" onClick={() => setArticleStatusFilter("published")}>已发布 ({articleCounts.published})</button>
                    <button type="button" onClick={() => setArticleStatusFilter("draft")}>草稿 ({articleCounts.draft})</button>
                    <button type="button" onClick={() => setArticleStatusFilter("trash")}>回收站 ({articleCounts.trash})</button>
                  </div>

                  <div className="wp-list-toolbar article-bulk-toolbar">
                    <select value={articleBulkAction} onChange={(event) => setArticleBulkAction(event.target.value)}>
                      <option value="">批量操作</option>
                      <option value="trash">移至回收站</option>
                      <option value="restore">恢复</option>
                      <option value="delete">永久删除</option>
                    </select>
                    <button type="button" disabled={!articleBulkAction || selectedArticleIds.length === 0} onClick={applyArticleBulkAction}>
                      应用
                    </button>
                    <span>{selectedArticleIds.length > 0 ? `已选择 ${selectedArticleIds.length} 篇文章` : "选择文章后可批量处理"}</span>
                  </div>

                  <div className="wp-list-toolbar">
                    <select value={articleStatusFilter} onChange={(event) => setArticleStatusFilter(event.target.value as "all" | "published" | "draft" | "trash")}>
                      <option value="all">全部状态</option>
                      <option value="published">已发布</option>
                      <option value="draft">草稿</option>
                      <option value="trash">回收站</option>
                    </select>
                    <select value={articleCategoryFilter} onChange={(event) => setArticleCategoryFilter(event.target.value)}>
                      <option value="all">所有分类</option>
                      {articleProductCategoryOptions.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                    </select>
                    <input placeholder="搜索文章" value={articleQuery} onChange={(event) => setArticleQuery(event.target.value)} />
                  </div>

                  <div className="wp-article-table" role="table" aria-label="文章列表">
                    <div className="wp-article-row header" role="row">
                      <span>
                        <input
                          aria-label="选择全部文章"
                          checked={allVisibleArticlesSelected}
                          disabled={visibleArticleIds.length === 0}
                          onChange={(event) => toggleVisibleArticles(event.target.checked)}
                          type="checkbox"
                        />
                      </span>
                      <strong>标题</strong>
                      <strong>作者</strong>
                      <strong>分类目录</strong>
                      <strong>状态</strong>
                      <strong>日期</strong>
                      <strong>操作</strong>
                    </div>
                    {filteredArticles.map((article) => {
                      const articleId = article.id ?? article.slug;

                      return (
                        <div className="wp-article-row" role="row" key={articleId}>
                          <span>
                            <input
                              aria-label={`选择 ${article.title.zh || article.title.en}`}
                              checked={selectedArticleIds.includes(articleId)}
                              onChange={(event) => toggleArticleSelection(articleId, event.target.checked)}
                              type="checkbox"
                            />
                          </span>
                          <Link
                            className="wp-article-title-link"
                            href={`/${locale}/articles/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {article.title.zh || article.title.en || "未命名文章"}
                            <small>查看 · {article.slug}</small>
                          </Link>
                          <span>{currentEmail}</span>
                          <span>{articleProductCategoryLabelByValue.get(article.category) ?? article.category}</span>
                          <span>{articleStatusLabel(article)}{article.featuredOnHome && article.status !== "trash" ? " · 首页" : ""}</span>
                          <span>{article.status === "trash" ? (article.deletedAt ? new Date(article.deletedAt).toLocaleString() : "已移至回收站") : (article.publishedAt ? new Date(article.publishedAt).toLocaleString() : "尚未发布")}</span>
                          <div className="wp-article-actions">
                            <button
                              className="wp-article-edit-button"
                              type="button"
                              onClick={() => {
                                setActiveArticleId(articleId);
                                setArticleMode("editor");
                              }}
                            >
                              编辑
                            </button>
                            <button
                              className="wp-article-delete-button"
                              type="button"
                              onClick={() => deleteArticleFromList(article)}
                            >
                              {article.status === "trash" ? "永久删除" : "删除"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {filteredArticles.length === 0 ? <div className="wp-empty-row">没有找到文章。</div> : null}
                  </div>
                </div>
              ) : null}

              {articleMode === "editor" ? (
                activeArticle && activeArticleIndex >= 0 ? (
                  <div className="wp-editor-screen">
                    <article className="wp-editor">
                      <input
                        className="wp-title-input"
                        placeholder="添加标题"
                        value={activeArticle.title.zh ?? activeArticle.title.en ?? ""}
                        onChange={(event) => updateArticleTitle(event.target.value)}
                      />
                      <label>摘要<textarea className="wp-excerpt" value={activeArticle.excerpt.zh ?? activeArticle.excerpt.en ?? ""} onChange={(event) => updateArticleExcerpt(event.target.value)} /></label>
                      <div className="article-editor-shell">
                        <div className="article-editor-viewbar" aria-label="编辑器模式">
                          <button
                            className={articleEditorView === "visual" ? "active" : ""}
                            type="button"
                            onClick={() => setArticleEditorView("visual")}
                          >
                            可视化
                          </button>
                          <button
                            className={articleEditorView === "code" ? "active" : ""}
                            type="button"
                            onClick={() => setArticleEditorView("code")}
                          >
                            代码
                          </button>
                        </div>
                        <div className="article-editor-toolbar" aria-label="文章编辑器工具栏">
                          <select
                            aria-label="段落格式"
                            className="article-format-select"
                            defaultValue=""
                            onChange={(event) => {
                              const value = event.currentTarget.value;
                              if (value === "p") insertArticleParagraphTemplate();
                              if (value === "h1") insertArticleMarkup("# ", "", "主标题");
                              if (value === "h2") insertArticleMarkup("## ", "", "小标题");
                              if (value === "h3") insertArticleMarkup("### ", "", "小标题");
                              if (value === "h4") insertArticleMarkup("#### ", "", "段落标题");
                              event.currentTarget.value = "";
                            }}
                          >
                            <option value="">段落</option>
                            <option value="p">段落模板</option>
                            <option value="h1">标题 H1</option>
                            <option value="h2">标题 H2</option>
                            <option value="h3">标题 H3</option>
                            <option value="h4">标题 H4</option>
                          </select>
                          <button title="标题 H1" type="button" onClick={() => insertArticleMarkup("# ", "", "主标题")}><Heading1 size={16} /></button>
                          <button title="标题 H2" type="button" onClick={() => insertArticleMarkup("## ", "", "小标题")}><Heading2 size={16} /></button>
                          <button title="标题 H3" type="button" onClick={() => insertArticleMarkup("### ", "", "小标题")}><Heading3 size={16} /></button>
                          <span className="article-toolbar-separator" />
                          <button title="加粗" type="button" onClick={() => insertArticleMarkup("**", "**", "加粗文字")}><Bold size={16} /></button>
                          <button title="斜体" type="button" onClick={() => insertArticleMarkup("*", "*", "斜体文字")}><Italic size={16} /></button>
                          <button title="删除线" type="button" onClick={() => insertArticleMarkup("~~", "~~", "删除线文字")}><Strikethrough size={16} /></button>
                          <button title="下划线" type="button" onClick={() => insertArticleMarkup("<u>", "</u>", "下划线文字")}><Underline size={16} /></button>
                          <button title="上标" type="button" onClick={() => insertArticleMarkup("<sup>", "</sup>", "上标")}><Superscript size={16} /></button>
                          <button title="下标" type="button" onClick={() => insertArticleMarkup("<sub>", "</sub>", "下标")}><Subscript size={16} /></button>
                          <span className="article-toolbar-separator" />
                          <button title="项目列表" type="button" onClick={() => insertArticleMarkup("- ", "", "列表项")}><List size={16} /></button>
                          <button title="编号列表" type="button" onClick={() => insertArticleMarkup("1. ", "", "编号项")}><ListOrdered size={16} /></button>
                          <button title="引用" type="button" onClick={() => insertArticleMarkup("> ", "", "引用内容")}><Quote size={16} /></button>
                          <button title="链接" type="button" onClick={() => insertArticleMarkup("[", "](https://example.com)", "链接文字")}><Link2 size={16} /></button>
                          <button title="分隔线" type="button" onClick={() => insertTextIntoArticleBody("\n\n---\n\n")}><Minus size={16} /></button>
                          <button title="表格" type="button" onClick={insertArticleTableTemplate}><Table2 size={16} /></button>
                          <button title="提示块" type="button" onClick={insertArticleCalloutTemplate}><Pilcrow size={16} /></button>
                          <button title="行内代码" type="button" onClick={() => insertArticleMarkup("`", "`", "代码")}><Code2 size={16} /></button>
                          <button title="代码块" type="button" onClick={() => insertArticleMarkup("\n\n```text\n", "\n```\n\n", "代码块")}><Code2 size={16} /></button>
                          <label className="article-image-inline-upload" title="插入图片">
                            <ImageIcon size={16} />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) => {
                                uploadArticleImage(event.currentTarget.files?.[0] ?? null, true);
                                event.currentTarget.value = "";
                              }}
                            />
                          </label>
                          <label className="article-image-inline-upload" title="插入媒体">
                            <Paperclip size={16} />
                            <input
                              type="file"
                              onChange={(event) => {
                                uploadSiteFile(event.currentTarget.files?.[0] ?? null, true);
                                event.currentTarget.value = "";
                              }}
                            />
                          </label>
                          <button title="待办列表" type="button" onClick={insertArticleChecklistTemplate}>待办</button>
                          <button title="清除格式" type="button" onClick={clearArticleFormatting}>清除</button>
                          <button title="清空正文" type="button" onClick={clearArticleBody}><Trash2 size={16} /></button>
                        </div>
                        {articleEditorView === "visual" ? (
                          <div
                            aria-label="正文可视化编辑"
                            className="article-visual-editor detail-body article-editor-rendered-body"
                            contentEditable
                            id="article-body-editor"
                            ref={visualEditorRef}
                            role="textbox"
                            suppressContentEditableWarning
                            onInput={syncVisualEditorBody}
                          />
                        ) : (
                          <label>Markdown / HTML 代码
                            <textarea
                              id="article-body-editor"
                              className="wp-body code-mode"
                              rows={28}
                              value={activeArticle.body?.zh ?? activeArticle.body?.en ?? ""}
                              onChange={(event) => updateArticleBody(event.target.value)}
                            />
                          </label>
                        )}
                      </div>
                    </article>

                    <aside className="wp-editor-side">
                      <section className="wp-side-box">
                        <h2>发布</h2>
                        {activeArticle.status !== "trash" ? (
                          <label className="checkline"><input type="checkbox" checked={Boolean(activeArticle.featuredOnHome)} onChange={(event) => updateActiveArticle({ featuredOnHome: event.target.checked })} />同步到首页</label>
                        ) : null}
                        <span>状态：{articleStatusLabel(activeArticle)}</span>
                        <span>日期：{activeArticle.status === "trash" ? (activeArticle.deletedAt ? new Date(activeArticle.deletedAt).toLocaleString() : "已移至回收站") : (activeArticle.publishedAt ? new Date(activeArticle.publishedAt).toLocaleString() : "立即发布")}</span>
                        <div className="wp-publish-box">
                          {activeArticle.status === "trash" ? (
                            <>
                              <button className="primary" type="button" onClick={restoreActiveArticle}>恢复文章</button>
                              <button className="danger" type="button" onClick={deleteActiveArticlePermanently}>永久删除</button>
                            </>
                          ) : (
                            <>
                              <button type="button" onClick={() => save()}>保存草稿</button>
                              <button className="primary" type="button" onClick={() => commitArticle(activeArticleIndex, { status: "published", featuredOnHome: true, publishedAt: new Date().toISOString(), deletedAt: undefined })}>发布</button>
                              <button className="full" type="button" disabled={!canRunAutoTranslation || translationRunning} onClick={() => runAutoTranslation("article", activeArticle.id ?? activeArticle.slug)}>自动翻译当前文章</button>
                              <button className="danger full" type="button" onClick={moveActiveArticleToTrash}>移至回收站</button>
                            </>
                          )}
                        </div>
                      </section>

                      <section className="wp-side-box">
                        <h2>文章图片</h2>
                        <label className="article-cover-upload">
                          上传特色图片
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                              uploadArticleImage(event.currentTarget.files?.[0] ?? null);
                              event.currentTarget.value = "";
                            }}
                          />
                        </label>
                        {activeArticle.coverImageUrl ? (
                          <div className="article-cover-preview">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={activeArticle.coverImageUrl} alt={activeArticle.title.zh || activeArticle.title.en || "文章图片"} />
                            <button type="button" onClick={() => updateActiveArticle({ coverImageUrl: undefined })}>移除图片</button>
                          </div>
                        ) : (
                          <span>未上传图片。可作为文章封面，也可在正文工具栏插入图片。</span>
                        )}
                      </section>

                      <section className="wp-side-box">
                        <h2>媒体库</h2>
                        {state.uploadedFiles.length > 0 ? (
                          <>
                            <button className="article-media-open-button" type="button" onClick={() => setArticleMediaPickerOpen(true)}>
                              <Library size={16} />
                              打开媒体库
                            </button>
                            <span>{state.uploadedFiles.length} 个媒体文件可选，图片会插入正文，其他文件会插入下载链接。</span>
                          </>
                        ) : (
                          <span>暂无媒体。可在正文工具栏上传并插入。</span>
                        )}
                      </section>

                      <section className="wp-side-box">
                        <h2>分类目录</h2>
                        <label>分类
                          <select value={activeArticleCategoryIsProduct ? activeArticle.category : ""} onChange={(event) => updateActiveArticle({ category: event.target.value })}>
                            <option value="" disabled>{articleProductCategoryOptions.length > 0 ? "选择产品分类" : "请先添加产品分类"}</option>
                            {articleProductCategoryOptions.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                          </select>
                        </label>
                      </section>

                      <section className="wp-side-box">
                        <h2>固定链接</h2>
                        <label>Slug<input value={activeArticle.slug} onChange={(event) => updateActiveArticle({ slug: event.target.value })} /></label>
                      </section>
                    </aside>
                  </div>
                ) : (
                  <div className="wp-editor empty">还没有文章，点击“写文章”开始。</div>
                )
              ) : null}

              {articleMediaPickerOpen ? (
                <div className="media-picker-overlay" role="presentation" onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setArticleMediaPickerOpen(false);
                }}>
                  <section className="media-picker-modal" role="dialog" aria-modal="true" aria-label="选择媒体文件">
                    <div className="media-picker-head">
                      <div>
                        <h2>选择媒体文件</h2>
                        <span>从媒体库选择文件插入当前文章正文。</span>
                      </div>
                      <button type="button" aria-label="关闭媒体库" onClick={() => setArticleMediaPickerOpen(false)}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className="media-picker-toolbar">
                      <select value={mediaTypeFilter} onChange={(event) => setMediaTypeFilter(event.target.value as MediaTypeFilter)}>
                        {mediaTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                      <select value={mediaTimeFilter} onChange={(event) => setMediaTimeFilter(event.target.value as MediaTimeFilter)}>
                        {mediaTimeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                      <input placeholder="搜索文件名或类型" value={mediaQuery} onChange={(event) => setMediaQuery(event.target.value)} />
                      <span>{filteredMediaFiles.length} / {state.uploadedFiles.length}</span>
                    </div>
                    <div className="media-picker-grid">
                      {filteredMediaFiles.map((file) => {
                        const isImage = getMediaType(file) === "image";

                        return (
                          <button type="button" className="media-picker-item" key={file.id} onClick={() => insertExistingFileIntoArticle(file)}>
                            <span className="media-picker-thumb">
                              {isImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={file.url} alt={file.name} />
                              ) : (
                                <Paperclip size={24} />
                              )}
                            </span>
                            <strong>{file.name}</strong>
                            <small>{getMediaTypeLabel(file)} · {formatFileSize(file.size)}</small>
                          </button>
                        );
                      })}
                      {filteredMediaFiles.length === 0 ? <div className="media-picker-empty">没有找到匹配的媒体文件。</div> : null}
                    </div>
                  </section>
                </div>
              ) : null}
            </>
          ) : null}

          {tab === "files" ? (
            <>
              <section className="file-upload-panel media-upload-panel">
                <div>
                  <strong>站点媒体与资料库</strong>
                  <span>集中管理图片、PDF、Word、Excel、压缩包等媒体资源。上传后会进入前台“资料下载”页面，也可以在文章编辑器中插入链接或图片。</span>
                </div>
                <label className="admin-upload-button">
                  上传媒体
                  <input
                    type="file"
                    onChange={(event) => {
                      uploadSiteFile(event.currentTarget.files?.[0] ?? null);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </section>
              <div className="media-library-toolbar">
                <select value={mediaTypeFilter} onChange={(event) => setMediaTypeFilter(event.target.value as MediaTypeFilter)}>
                  {mediaTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <select value={mediaTimeFilter} onChange={(event) => setMediaTimeFilter(event.target.value as MediaTimeFilter)}>
                  {mediaTimeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <input placeholder="搜索媒体名称或类型" value={mediaQuery} onChange={(event) => setMediaQuery(event.target.value)} />
                <span>{filteredMediaFiles.length} / {state.uploadedFiles.length} 个资源</span>
              </div>
              <div className="file-library-grid">
                {filteredMediaFiles.map((file) => (
                  <article className="file-library-card" key={file.id}>
                    <div className="file-library-thumb">
                      {getMediaType(file) === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={file.url} alt={file.name} />
                      ) : (
                        <span>{getMediaTypeLabel(file).slice(0, 2)}</span>
                      )}
                    </div>
                    <div>
                      <strong>{file.name}</strong>
                      <span>{getMediaTypeLabel(file)} · {file.mimeType || "application/octet-stream"} · {formatFileSize(file.size)}</span>
                      <small>{new Date(file.createdAt).toLocaleString()}</small>
                    </div>
                    <div className="file-card-actions">
                      <a href={file.url} download={file.name}>下载</a>
                      <button type="button" onClick={() => removeUploadedFile(file.id)}>删除</button>
                    </div>
                  </article>
                ))}
                {state.uploadedFiles.length === 0 ? <div className="wp-empty-row">还没有上传媒体。</div> : null}
                {state.uploadedFiles.length > 0 && filteredMediaFiles.length === 0 ? <div className="wp-empty-row">没有匹配的媒体资源。</div> : null}
              </div>
            </>
          ) : null}

          {tab === "leads" ? (
            <>
              <h1>询盘管理</h1>
              <div className="admin-table">
                {state.leads.length === 0 ? <p>暂无询盘。前台提交 RFQ 后会自动进入这里。</p> : null}
                {state.leads.map((lead) => (
                  <div className="admin-row lead-row" key={lead.id}>
                    <div>
                      <strong>{lead.fullName || "未填写姓名"}</strong>
                      <span>{lead.company || "No company"}</span>
                    </div>
                    <div>
                      <strong>{lead.productType}</strong>
                      <span>{lead.quantity}</span>
                    </div>
                    <div>
                      <span>{lead.email}</span>
                      <span>{lead.whatsapp || "No WhatsApp / Phone"}</span>
                    </div>
                    <div>
                      <span>{lead.destination || "No destination"}</span>
                      <span>{lead.workpieceMaterial || "No material"}</span>
                    </div>
                    <span>{new Date(lead.createdAt).toLocaleString()}</span>
                    <select
                      value={lead.status}
                      onChange={(event) =>
                        setState({
                          ...state,
                          leads: state.leads.map((item) => item.id === lead.id ? { ...item, status: event.target.value as LeadStatus } : item)
                        })
                      }
                    >
                      {leadStatuses.map((statusOption) => <option key={statusOption}>{statusOption}</option>)}
                    </select>
                    {lead.message ? <p>{lead.message}</p> : null}
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {tab === "contacts" ? (
            <>
              <div className="settings-lock-note contact-settings-note">
                <span>启用的联系方式会同步显示在前台联系页、页脚社媒图标中；带二维码的渠道仍会显示在右下角联系浮窗。</span>
                <button type="button" onClick={() => save()}>
                  保存联系方式
                </button>
              </div>
              <div className="admin-form-list contact-channel-list">
                {state.contactChannels.map((channel, index) => (
                  <article className="admin-edit-card compact contact-card" key={channel.id}>
                    <label>显示名称<input value={channel.label.zh ?? channel.label.en} onChange={(event) => updateContact(index, { label: { ...channel.label, en: event.target.value, zh: event.target.value } })} /></label>
                    <label>类型
                      <select value={channel.type} onChange={(event) => updateContact(index, { type: event.target.value as ContactChannelType })}>
                        {contactTypeOptions.map((type) => (
                          <option key={type} value={type}>{contactTypePresets[type].zh}</option>
                        ))}
                      </select>
                    </label>
                    <label>账号/号码<input value={channel.value ?? ""} onChange={(event) => updateContact(index, { value: event.target.value })} /></label>
                    <label>链接<input value={channel.href ?? ""} onChange={(event) => updateContact(index, { href: event.target.value })} /></label>
                    <label>颜色<input type="color" value={channel.color || contactTypePresets[channel.type].color} onChange={(event) => updateContact(index, { color: event.target.value })} /></label>
                    <label className="checkline"><input type="checkbox" checked={channel.enabled} onChange={(event) => updateContact(index, { enabled: event.target.checked })} />启用</label>
                    <div className="contact-qr-manager">
                      {channel.qrCodeUrl ? (
                        <Image className="contact-qr-thumb" src={channel.qrCodeUrl} alt={`${channel.label.zh ?? channel.label.en} 二维码`} width={34} height={34} unoptimized />
                      ) : (
                        <span className="contact-qr-empty">无</span>
                      )}
                      <label className="contact-qr-upload">
                        二维码
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            uploadContactQr(index, event.currentTarget.files?.[0] ?? null);
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                      {channel.qrCodeUrl ? (
                        <button className="contact-qr-remove" type="button" onClick={() => updateContact(index, { qrCodeUrl: undefined })}>移除</button>
                      ) : null}
                    </div>
                    <button className="contact-delete-button" type="button" onClick={() => removeContactChannel(channel.id)}>删除</button>
                  </article>
                ))}
              </div>
              <section className="contact-create-panel">
                <div>
                  <strong>新增联系方式</strong>
                  <span>可新增 Zalo、Line、Facebook、Instagram、TikTok，或选择自定义渠道。</span>
                </div>
                <div className="contact-create-form">
                  <label>类型
                    <select value={contactForm.type} onChange={(event) => selectContactFormType(event.target.value as ContactChannelType)}>
                      {contactTypeOptions.map((type) => (
                        <option key={type} value={type}>{contactTypePresets[type].zh}</option>
                      ))}
                    </select>
                  </label>
                  <label>显示名称
                    <input value={contactForm.zh || contactForm.en} onChange={(event) => setContactForm({ ...contactForm, en: event.target.value, zh: event.target.value })} />
                  </label>
                  <label>账号/号码
                    <input value={contactForm.value} onChange={(event) => setContactForm({ ...contactForm, value: event.target.value })} />
                  </label>
                  <label>链接
                    <input value={contactForm.href} onChange={(event) => setContactForm({ ...contactForm, href: event.target.value })} />
                  </label>
                  <label>颜色
                    <input type="color" value={contactForm.color} onChange={(event) => setContactForm({ ...contactForm, color: event.target.value })} />
                  </label>
                  <button type="button" onClick={addContactChannel}>新增联系方式</button>
                </div>
              </section>
            </>
          ) : null}

          {tab === "users" ? (
            <>
              <div className="admin-section-title">
                <h1>多用户与权限</h1>
                <button type="button" onClick={() => void save()}>
                  保存权限设置
                </button>
              </div>
              <section className="contact-create-panel user-create-panel">
                <div>
                  <strong>新增用户</strong>
                  <span>创建后台登录账号，并分配初始角色权限。初始密码至少 8 位。</span>
                </div>
                <div className="user-create-form">
                  <label>姓名
                    <input value={newUserForm.name} onChange={(event) => setNewUserForm({ ...newUserForm, name: event.target.value })} />
                  </label>
                  <label>邮箱
                    <input type="email" value={newUserForm.email} onChange={(event) => setNewUserForm({ ...newUserForm, email: event.target.value })} />
                  </label>
                  <label>角色权限
                    <select value={newUserForm.role} onChange={(event) => setNewUserForm({ ...newUserForm, role: event.target.value as RoleKey })}>
                      {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </label>
                  <label>初始密码
                    <input type="password" value={newUserForm.password} onChange={(event) => setNewUserForm({ ...newUserForm, password: event.target.value })} />
                  </label>
                  {canResetUserPasswords ? (
                    <label>初始积分
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={newUserForm.aiCredits}
                        onChange={(event) => setNewUserForm({ ...newUserForm, aiCredits: Math.max(0, Number(event.target.value) || 0) })}
                      />
                    </label>
                  ) : null}
                  <button type="button" onClick={createAdminUser}>新增用户</button>
                </div>
              </section>
              <div className="admin-table">
                {state.users.map((user) => (
                  <article className="admin-user-card" key={user.id}>
                    <div className="admin-row">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <span className="user-credit-badge">{formatNumber(user.aiCredits ?? 0)} 积分</span>
                      <select
                        value={user.role}
                        onChange={(event) => {
                          const nextRole = event.target.value as RoleKey;
                          setState({
                            ...state,
                            users: state.users.map((item) => item.id === user.id ? { ...item, role: nextRole, allowedTabs: defaultAllowedTabsByRole[nextRole] } : item)
                          });
                        }}
                      >
                        {roleOptions.map((role) => <option key={role}>{role}</option>)}
                      </select>
                      <label className="checkline"><input type="checkbox" checked={user.active} onChange={(event) => setState({ ...state, users: state.users.map((item) => item.id === user.id ? { ...item, active: event.target.checked } : item) })} />启用</label>
                      <button type="button" onClick={() => setExpandedUserPermissionsId(expandedUserPermissionsId === user.id ? null : user.id)}>
                        编辑权限
                      </button>
                    </div>
                    {expandedUserPermissionsId === user.id ? (
                      <div className="user-permission-editor">
                        <div>
                          <strong>可访问页面</strong>
                          <span>勾选后该用户侧栏只显示对应后台页面；账号设置始终可访问。</span>
                        </div>
                        <div className="user-credit-editor">
                          <div>
                            <strong>AI 积分</strong>
                            <span>AI 自动翻译会按 Token 消耗积分。只有最高管理员可以调整余额。</span>
                          </div>
                          <label>当前余额
                            <input
                              disabled={!canResetUserPasswords}
                              type="number"
                              min="0"
                              step="1"
                              value={user.aiCredits ?? 0}
                              onChange={(event) => updateUserAiCredits(user.id, Number(event.target.value))}
                            />
                          </label>
                        </div>
                        <div className="user-permission-grid">
                          {adminPageAccessOptions.map((item) => (
                            <label className="checkline" key={item.key}>
                              <input
                                type="checkbox"
                                checked={getAllowedTabsForUser(user).includes(item.key)}
                                onChange={(event) => updateUserAllowedTab(user.id, item.key, event.target.checked)}
                              />
                              {item.label}
                            </label>
                          ))}
                        </div>
                        {canResetUserPasswords ? (
                          <div className="user-password-reset">
                            <label>重置密码
                              <input
                                type="password"
                                placeholder="输入至少 8 位新密码"
                                value={resetUserPasswords[user.id] ?? ""}
                                onChange={(event) => setResetUserPasswords((current) => ({ ...current, [user.id]: event.target.value }))}
                              />
                            </label>
                            <button type="button" onClick={() => resetAdminUserPassword(user.id)}>重置密码</button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          ) : null}

          {tab === "navigation" ? (
            <>
              {!canManageFrontendSettings ? <p className="settings-lock-note">当前账号没有前台设置权限。请使用 Super Admin 或 Admin 账号修改导航栏。</p> : null}
              {navigationSettingsPanel}
            </>
          ) : null}

          {tab === "templates" ? (
            <>
              {!canManageFrontendSettings ? <p className="settings-lock-note">当前账号没有前台模板权限。请使用 Super Admin 或 Admin 账号修改模板。</p> : null}

              <section className="settings-panel template-builder-panel">
                <div className="settings-panel-head with-action">
                  <div>
                    <h2>前台模板</h2>
                    <span>控制当前模板的首屏文案、轮播图片、模块显示、排序和首页内容数量。</span>
                  </div>
                  <div className="settings-actions template-mode-actions">
                    <div className="template-mode-toggle" aria-label="模板编辑模式">
                      <button
                        className={templateEditorMode === "form" ? "template-mode-button active" : "template-mode-button"}
                        type="button"
                        onClick={() => setTemplateEditorMode("form")}
                      >
                        <LayoutPanelTop size={15} />表单编辑
                      </button>
                      <button
                        className={templateEditorMode === "visual" ? "template-mode-button active" : "template-mode-button"}
                        type="button"
                        onClick={() => setTemplateEditorMode("visual")}
                      >
                        <Sparkles size={15} />高级编辑
                      </button>
                    </div>
                    <button className="template-save-button" type="button" disabled={!canManageFrontendSettings || !frontendSettingsDirty} onClick={() => {
                      if (guardFrontendSettingsAccess()) void save();
                    }}>
                      <Save size={15} />{frontendSettingsDirty ? "保存模板" : "已保存"}
                    </button>
                  </div>
                </div>
              </section>

              {templateEditorMode === "visual" ? templateVisualEditorPanel : (
                <>
              <section className="settings-panel template-builder-panel hero-carousel-admin-panel">
                <div className="settings-panel-head">
                  <div>
                    <h2>首页轮播图片</h2>
                    <span>控制首屏背景海报、是否自动轮播、切换速度、图片排序和替换。</span>
                  </div>
                </div>
                <div className="hero-carousel-controls">
                  <label className="checkline"><input disabled={!canManageFrontendSettings} type="checkbox" checked={templateSettings.heroCarouselEnabled} onChange={(event) => updateTemplateSettings({ heroCarouselEnabled: event.target.checked })} />启用首屏轮播背景</label>
                  <label className="checkline"><input disabled={!canManageFrontendSettings || !templateSettings.heroCarouselEnabled} type="checkbox" checked={templateSettings.heroCarouselAutoplay} onChange={(event) => updateTemplateSettings({ heroCarouselAutoplay: event.target.checked })} />自动播放</label>
                  <label>切换间隔（秒）
                    <input disabled={!canManageFrontendSettings || !templateSettings.heroCarouselEnabled} min={3} max={15} type="number" value={templateSettings.heroCarouselIntervalSeconds} onChange={(event) => updateTemplateSettings({ heroCarouselIntervalSeconds: Number(event.target.value) || 7 })} />
                  </label>
                </div>
                <div className="hero-slide-add-row">
                  <label>添加图片 URL
                    <input disabled={!canManageFrontendSettings} placeholder="/assets/current-template/hero-new.jpg 或 https://..." value={newHeroSlideUrl} onChange={(event) => setNewHeroSlideUrl(event.target.value)} />
                  </label>
                  <button disabled={!canManageFrontendSettings} type="button" onClick={addHeroSlideFromUrl}>添加 URL</button>
                  <label>从媒体库选择
                    <select disabled={!canManageFrontendSettings || heroImageFiles.length === 0} value="" onChange={(event) => {
                      const selectedFile = heroImageFiles.find((file) => file.id === event.target.value);
                      if (selectedFile) addHeroSlideFromMedia(selectedFile);
                    }}>
                      <option value="">{heroImageFiles.length > 0 ? "选择图片" : "媒体库暂无图片"}</option>
                      {heroImageFiles.map((file) => <option key={file.id} value={file.id}>{file.name}</option>)}
                    </select>
                  </label>
                  <label className={canManageFrontendSettings ? "hero-slide-upload" : "hero-slide-upload disabled"}>
                    上传图片
                    <input
                      accept="image/*"
                      disabled={!canManageFrontendSettings}
                      type="file"
                      onChange={(event) => {
                        uploadHeroSlideImage(event.currentTarget.files?.[0] ?? null);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
                <div className="hero-slide-list">
                  {orderedHeroSlides.map((slide) => (
                    <article className="hero-slide-card" key={slide.id}>
                      <div className="hero-slide-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={slide.imageUrl} alt={slide.alt.zh ?? slide.alt.en} />
                      </div>
                      <div className="hero-slide-fields">
                        <label>中文描述
                          <input disabled={!canManageFrontendSettings} value={slide.alt.zh ?? slide.alt.en} onChange={(event) => updateHeroSlide(slide.id, { alt: { ...slide.alt, zh: event.target.value } })} />
                        </label>
                        <label>英文描述
                          <input disabled={!canManageFrontendSettings} value={slide.alt.en} onChange={(event) => updateHeroSlide(slide.id, { alt: { ...slide.alt, en: event.target.value } })} />
                        </label>
                        <label className="wide">图片 URL
                          <input disabled={!canManageFrontendSettings} value={slide.imageUrl} onChange={(event) => updateHeroSlide(slide.id, { imageUrl: event.target.value })} />
                        </label>
                      </div>
                      <div className="hero-slide-actions">
                        <label className="checkline"><input disabled={!canManageFrontendSettings} type="checkbox" checked={slide.enabled} onChange={(event) => updateHeroSlide(slide.id, { enabled: event.target.checked })} />启用</label>
                        <label>排序
                          <input disabled={!canManageFrontendSettings} type="number" value={slide.order} onChange={(event) => updateHeroSlide(slide.id, { order: Number(event.target.value) || 0 })} />
                        </label>
                        <button className="contact-delete-button" disabled={!canManageFrontendSettings || orderedHeroSlides.length <= 1} type="button" onClick={() => removeHeroSlide(slide.id)}>删除</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="settings-panel template-builder-panel">
                <div className="template-builder-grid">
                  <div className="template-copy-form">
                    <div className="settings-panel-head">
                      <div>
                        <h2>首屏内容</h2>
                        <span>这些文案会直接替换前台首页首屏。</span>
                      </div>
                    </div>
                    <label>眉标（中文）
                      <input disabled={!canManageFrontendSettings} value={templateSettings.heroKicker.zh ?? templateSettings.heroKicker.en} onChange={(event) => updateTemplateText("heroKicker", "zh", event.target.value)} />
                    </label>
                    <label>眉标（英文）
                      <input disabled={!canManageFrontendSettings} value={templateSettings.heroKicker.en} onChange={(event) => updateTemplateText("heroKicker", "en", event.target.value)} />
                    </label>
                    <label className="wide">主标题（中文）
                      <textarea disabled={!canManageFrontendSettings} value={templateSettings.heroTitle.zh ?? templateSettings.heroTitle.en} onChange={(event) => updateTemplateText("heroTitle", "zh", event.target.value)} />
                    </label>
                    <label className="wide">主标题（英文）
                      <textarea disabled={!canManageFrontendSettings} value={templateSettings.heroTitle.en} onChange={(event) => updateTemplateText("heroTitle", "en", event.target.value)} />
                    </label>
                    <label className="wide">说明文案（中文）
                      <textarea disabled={!canManageFrontendSettings} value={templateSettings.heroBody.zh ?? templateSettings.heroBody.en} onChange={(event) => updateTemplateText("heroBody", "zh", event.target.value)} />
                    </label>
                    <label className="wide">说明文案（英文）
                      <textarea disabled={!canManageFrontendSettings} value={templateSettings.heroBody.en} onChange={(event) => updateTemplateText("heroBody", "en", event.target.value)} />
                    </label>
                    <label>主按钮（中文）
                      <input disabled={!canManageFrontendSettings} value={templateSettings.primaryCtaLabel.zh ?? templateSettings.primaryCtaLabel.en} onChange={(event) => updateTemplateText("primaryCtaLabel", "zh", event.target.value)} />
                    </label>
                    <label>主按钮（英文）
                      <input disabled={!canManageFrontendSettings} value={templateSettings.primaryCtaLabel.en} onChange={(event) => updateTemplateText("primaryCtaLabel", "en", event.target.value)} />
                    </label>
                    <label>次按钮（中文）
                      <input disabled={!canManageFrontendSettings} value={templateSettings.secondaryCtaLabel.zh ?? templateSettings.secondaryCtaLabel.en} onChange={(event) => updateTemplateText("secondaryCtaLabel", "zh", event.target.value)} />
                    </label>
                    <label>次按钮（英文）
                      <input disabled={!canManageFrontendSettings} value={templateSettings.secondaryCtaLabel.en} onChange={(event) => updateTemplateText("secondaryCtaLabel", "en", event.target.value)} />
                    </label>
                    <label className="checkline"><input disabled={!canManageFrontendSettings} type="checkbox" checked={templateSettings.showHeroVisual} onChange={(event) => updateTemplateSettings({ showHeroVisual: event.target.checked })} />显示右侧工业视觉</label>
                    <label className="checkline"><input disabled={!canManageFrontendSettings} type="checkbox" checked={templateSettings.showHeroMetrics} onChange={(event) => updateTemplateSettings({ showHeroMetrics: event.target.checked })} />显示首屏指标</label>
                    <label>首页产品数量
                      <input disabled={!canManageFrontendSettings} min={1} max={12} type="number" value={templateSettings.homeProductCount} onChange={(event) => updateTemplateSettings({ homeProductCount: Number(event.target.value) || 1 })} />
                    </label>
                    <label>首页文章数量
                      <input disabled={!canManageFrontendSettings} min={0} max={12} type="number" value={templateSettings.homeArticleCount} onChange={(event) => updateTemplateSettings({ homeArticleCount: Number(event.target.value) || 0 })} />
                    </label>
                  </div>

                  <aside className={`template-preview-panel ${templateSettings.homeTemplate}`}>
                    <span className="eyebrow">{templateSettings.heroKicker.zh ?? templateSettings.heroKicker.en}</span>
                    <h3>{templateSettings.heroTitle.zh ?? templateSettings.heroTitle.en}</h3>
                    <p>{templateSettings.heroBody.zh ?? templateSettings.heroBody.en}</p>
                    <div className="template-preview-actions">
                      <span>{templateSettings.primaryCtaLabel.zh ?? templateSettings.primaryCtaLabel.en}</span>
                      <span>{templateSettings.secondaryCtaLabel.zh ?? templateSettings.secondaryCtaLabel.en}</span>
                    </div>
                    <div className="template-preview-grid">
                      {orderedTemplateSections.map((section) => (
                        <span className={templateSettings.visibleSections[section.key] ? "enabled" : ""} key={section.key}>
                          {section.label}
                        </span>
                      ))}
                    </div>
                  </aside>
                </div>
              </section>

              <section className="settings-panel template-builder-panel">
                <div className="settings-panel-head">
                  <div>
                    <h2>首页模块</h2>
                    <span>模块排序数字越小越靠前；关闭后前台不渲染该模块。</span>
                  </div>
                </div>
                <div className="template-section-list">
                  {orderedTemplateSections.map((section) => (
                    <article className="template-section-row" key={section.key}>
                      <label className="checkline">
                        <input disabled={!canManageFrontendSettings} type="checkbox" checked={templateSettings.visibleSections[section.key]} onChange={(event) => updateTemplateSectionVisibility(section.key, event.target.checked)} />
                        <span>
                          <strong>{section.label}</strong>
                          <small>{section.description}</small>
                        </span>
                      </label>
                      <label>排序
                        <input disabled={!canManageFrontendSettings} type="number" value={templateSettings.sectionOrder[section.key]} onChange={(event) => updateTemplateSectionOrder(section.key, Number(event.target.value))} />
                      </label>
                    </article>
                  ))}
                </div>
              </section>
                </>
              )}
            </>
          ) : null}

          {tab === "settings" ? (
            <>
              {!canManageFrontendSettings ? <p className="settings-lock-note">当前账号没有前台设置权限。请使用 Super Admin 或 Admin 账号修改设置。</p> : null}

              <div className="wp-settings-screen">
                <aside className="wp-settings-menu" aria-label="设置分组">
                  {settingsSections.map((item) => (
                    <button className={settingsSection === item.key ? "active" : ""} key={item.key} type="button" onClick={() => setSettingsSection(item.key)}>
                      <strong>{item.label}</strong>
                      <span>{item.description}</span>
                    </button>
                  ))}
                </aside>

                <section className="settings-panel wp-settings-panel">
                  {settingsSection === "general" ? (
                    <>
                      <div className="settings-panel-head with-action">
                        <div><h2>常规选项</h2><span>对应 WordPress 常规设置：标题、网址、管理员邮箱、语言和时区。</span></div>
                        {settingsSaveAction}
                      </div>
                      <div className="wp-settings-form">
                        <label>站点标题<input disabled={!canManageFrontendSettings} value={state.siteSettings.title} onChange={(event) => updateSiteSettings({ title: event.target.value })} /></label>
                        <label>副标题<input disabled={!canManageFrontendSettings} value={state.siteSettings.tagline} onChange={(event) => updateSiteSettings({ tagline: event.target.value })} /></label>
                        <label>整站字体
                          <select
                            disabled={!canManageFrontendSettings}
                            value={state.siteSettings.fontFamily || siteFontOptions[0].value}
                            onChange={(event) => updateSiteSettings({ fontFamily: event.target.value })}
                          >
                            {siteFontOptions.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}
                          </select>
                        </label>
                        <div className="settings-field site-icon-setting">
                          <span>站点图标 URL</span>
                          <div className="site-icon-field">
                            <input
                              disabled={!canManageFrontendSettings}
                              placeholder="粘贴图片 URL，或使用右侧上传"
                              value={state.siteSettings.siteIconUrl}
                              onChange={(event) => updateSiteSettings({ siteIconUrl: event.target.value })}
                            />
                            <label className={canManageFrontendSettings ? "site-icon-upload" : "site-icon-upload disabled"}>
                              上传
                              <input
                                accept="image/*,.ico"
                                disabled={!canManageFrontendSettings}
                                type="file"
                                onChange={(event) => {
                                  uploadSiteIcon(event.currentTarget.files?.[0] ?? null);
                                  event.currentTarget.value = "";
                                }}
                              />
                            </label>
                            <button
                              className="site-icon-clear"
                              disabled={!canManageFrontendSettings || !state.siteSettings.siteIconUrl}
                              type="button"
                              onClick={() => updateSiteSettings({ siteIconUrl: "" })}
                            >
                              清空
                            </button>
                          </div>
                          <span className="site-icon-helper">
                            {state.siteSettings.siteIconUrl ? (
                              <>
                                <Image src={state.siteSettings.siteIconUrl} alt="站点图标预览" width={28} height={28} unoptimized />
                                <span>已设置图标，可继续手动修改 URL 或上传替换。</span>
                              </>
                            ) : (
                              <span>支持手动填写图片 URL，也支持上传 PNG、JPG、SVG、WebP 或 ICO。</span>
                            )}
                          </span>
                        </div>
                        <label>站点地址（URL）<input disabled={!canManageFrontendSettings} value={state.siteSettings.siteUrl} onChange={(event) => updateSiteSettings({ siteUrl: event.target.value })} /></label>
                        <label>管理员邮箱地址<input disabled={!canManageFrontendSettings} type="email" value={state.siteSettings.adminEmail} onChange={(event) => updateSiteSettings({ adminEmail: event.target.value })} /></label>
                        <label>站点语言
                          <select disabled={!canManageFrontendSettings} value={state.siteSettings.siteLanguage} onChange={(event) => updateSiteSettings({ siteLanguage: event.target.value as LocaleCode })}>
                            {locales.map((item) => <option key={item.code} value={item.code}>{item.nativeName}</option>)}
                          </select>
                        </label>
                        <label>时区<input disabled={!canManageFrontendSettings} value={state.siteSettings.timezone} onChange={(event) => updateSiteSettings({ timezone: event.target.value })} /></label>
                        <label className="checkline"><input disabled={!canManageFrontendSettings} type="checkbox" checked={state.siteSettings.allowRegistration} onChange={(event) => updateSiteSettings({ allowRegistration: event.target.checked })} />任何人都可以注册</label>
                        <label>新用户默认角色
                          <select disabled={!canManageFrontendSettings} value={state.siteSettings.defaultUserRole} onChange={(event) => updateSiteSettings({ defaultUserRole: event.target.value as RoleKey })}>
                            {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                          </select>
                        </label>
                      </div>
                    </>
                  ) : null}

                  {settingsSection === "writing" ? (
                    <>
                      <div className="settings-panel-head with-action">
                        <div><h2>撰写设置</h2><span>设置新文章的默认产品分类和默认保存状态。</span></div>
                        {settingsSaveAction}
                      </div>
                      <div className="wp-settings-form">
                        <label>默认文章分类
                          <select disabled={!canManageFrontendSettings} value={state.siteSettings.defaultArticleCategory} onChange={(event) => updateSiteSettings({ defaultArticleCategory: event.target.value })}>
                            {articleProductCategoryOptions.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                          </select>
                        </label>
                        <label>默认文章状态
                          <select disabled={!canManageFrontendSettings} value={state.siteSettings.defaultArticleStatus} onChange={(event) => updateSiteSettings({ defaultArticleStatus: event.target.value as "draft" | "published" })}>
                            <option value="draft">草稿</option>
                            <option value="published">发布</option>
                          </select>
                        </label>
                      </div>
                    </>
                  ) : null}

                  {settingsSection === "reading" ? (
                    <>
                      <div className="settings-panel-head with-action">
                        <div><h2>阅读设置</h2><span>控制首页文章展示、列表数量和搜索引擎可见性。</span></div>
                        {settingsSaveAction}
                      </div>
                      <div className="wp-settings-form">
                        <label>每页显示数量<input disabled={!canManageFrontendSettings} min={1} type="number" value={state.siteSettings.postsPerPage} onChange={(event) => updateSiteSettings({ postsPerPage: Number(event.target.value) || 1 })} /></label>
                        <label className="checkline"><input disabled={!canManageFrontendSettings} type="checkbox" checked={state.siteSettings.showFeaturedArticles} onChange={(event) => updateSiteSettings({ showFeaturedArticles: event.target.checked })} />首页显示精选文章</label>
                        <label className="checkline"><input disabled={!canManageFrontendSettings} type="checkbox" checked={state.siteSettings.searchEngineVisible} onChange={(event) => updateSiteSettings({ searchEngineVisible: event.target.checked })} />允许搜索引擎索引本站</label>
                      </div>
                    </>
                  ) : null}

                  {settingsSection === "media" ? (
                    <>
                      <div className="settings-panel-head with-action">
                        <div><h2>媒体设置</h2><span>管理上传图片尺寸和文件整理方式。</span></div>
                        {settingsSaveAction}
                      </div>
                      <div className="wp-settings-form media-size-form">
                        <label>缩略图宽度<input disabled={!canManageFrontendSettings} min={0} type="number" value={state.siteSettings.thumbnailWidth} onChange={(event) => updateSiteSettings({ thumbnailWidth: Number(event.target.value) || 0 })} /></label>
                        <label>缩略图高度<input disabled={!canManageFrontendSettings} min={0} type="number" value={state.siteSettings.thumbnailHeight} onChange={(event) => updateSiteSettings({ thumbnailHeight: Number(event.target.value) || 0 })} /></label>
                        <label>中等尺寸宽度<input disabled={!canManageFrontendSettings} min={0} type="number" value={state.siteSettings.mediumWidth} onChange={(event) => updateSiteSettings({ mediumWidth: Number(event.target.value) || 0 })} /></label>
                        <label>中等尺寸高度<input disabled={!canManageFrontendSettings} min={0} type="number" value={state.siteSettings.mediumHeight} onChange={(event) => updateSiteSettings({ mediumHeight: Number(event.target.value) || 0 })} /></label>
                        <label>大尺寸宽度<input disabled={!canManageFrontendSettings} min={0} type="number" value={state.siteSettings.largeWidth} onChange={(event) => updateSiteSettings({ largeWidth: Number(event.target.value) || 0 })} /></label>
                        <label>大尺寸高度<input disabled={!canManageFrontendSettings} min={0} type="number" value={state.siteSettings.largeHeight} onChange={(event) => updateSiteSettings({ largeHeight: Number(event.target.value) || 0 })} /></label>
                        <label className="checkline"><input disabled={!canManageFrontendSettings} type="checkbox" checked={state.siteSettings.uploadsOrganizedByMonth} onChange={(event) => updateSiteSettings({ uploadsOrganizedByMonth: event.target.checked })} />按年月组织上传文件</label>
                      </div>
                    </>
                  ) : null}

                  {settingsSection === "permalinks" ? (
                    <>
                      <div className="settings-panel-head with-action">
                        <div><h2>固定链接设置</h2><span>设置前台产品、文章和资料下载路径的基础别名。</span></div>
                        {settingsSaveAction}
                      </div>
                      <div className="wp-settings-form">
                        <label>产品 URL 基础<input disabled={!canManageFrontendSettings} value={state.siteSettings.productUrlBase} onChange={(event) => updateSiteSettings({ productUrlBase: slugify(event.target.value) })} /></label>
                        <label>文章 URL 基础<input disabled={!canManageFrontendSettings} value={state.siteSettings.articleUrlBase} onChange={(event) => updateSiteSettings({ articleUrlBase: slugify(event.target.value) })} /></label>
                        <label>资料 URL 基础<input disabled={!canManageFrontendSettings} value={state.siteSettings.fileUrlBase} onChange={(event) => updateSiteSettings({ fileUrlBase: slugify(event.target.value) })} /></label>
                      </div>
                    </>
                  ) : null}

                  {settingsSection === "privacy" ? (
                    <>
                      <div className="settings-panel-head with-action">
                        <div><h2>隐私设置</h2><span>设置隐私页面、Cookie 提示和询盘数据使用说明。</span></div>
                        {settingsSaveAction}
                      </div>
                      <div className="wp-settings-form">
                        <label>隐私页面 URL<input disabled={!canManageFrontendSettings} value={state.siteSettings.privacyPageUrl} onChange={(event) => updateSiteSettings({ privacyPageUrl: event.target.value })} /></label>
                        <label className="checkline"><input disabled={!canManageFrontendSettings} type="checkbox" checked={state.siteSettings.cookieNoticeEnabled} onChange={(event) => updateSiteSettings({ cookieNoticeEnabled: event.target.checked })} />启用 Cookie 提示</label>
                        <label className="wide">隐私说明<textarea disabled={!canManageFrontendSettings} value={state.siteSettings.privacySummary} onChange={(event) => updateSiteSettings({ privacySummary: event.target.value })} /></label>
                      </div>
                    </>
                  ) : null}

                  {settingsSection === "ai" ? (
                    <div className="ai-settings-in-settings">
                      <section className="settings-panel ai-settings-panel">
                        <div className="settings-panel-head with-action">
                          <div>
                            <h2>AI 内容设置</h2>
                            <span>这里定义生成时使用的模型、品牌语气、目标市场和关键词。</span>
                          </div>
                          <button type="button" onClick={() => save()}>
                            <Save size={16} />
                            保存 AI 设置
                          </button>
                        </div>
                        <div className="admin-edit-card ai-settings-card">
                          <label>模型供应商
                            <select value={state.aiSettings.provider} onChange={(event) => selectAiProvider(event.target.value)}>
                              {aiProviderOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                          </label>
                          <label>模型
                            <select value={aiModelSelectValue} onChange={(event) => {
                              const nextModel = event.target.value;
                              updateAiSettings({ model: nextModel === customAiModelValue ? "" : nextModel });
                              setAiTestStatus("");
                            }}>
                              {aiModelOptions.map((model) => <option key={model} value={model}>{model}</option>)}
                              <option value={customAiModelValue}>自定义模型...</option>
                            </select>
                          </label>
                          {aiModelIsCustom ? (
                            <label className="wide">自定义模型
                              <input
                                placeholder="输入供应商控制台里的模型 ID"
                                value={state.aiSettings.model}
                                onChange={(event) => {
                                  updateAiSettings({ model: event.target.value });
                                  setAiTestStatus("");
                                }}
                              />
                            </label>
                          ) : null}
                          <label className="wide">Base URL
                            <input
                              placeholder={selectedAiProvider.baseUrl || "https://your-provider.example.com/v1"}
                              value={state.aiSettings.baseUrl}
                              onChange={(event) => updateAiSettings({ baseUrl: event.target.value })}
                            />
                            <small>{state.aiSettings.provider === "openai-compatible" || state.aiSettings.provider === "custom" ? "OpenAI-compatible / 自定义供应商必须填写 Base URL。" : "留空时使用该供应商默认接口地址。"}</small>
                          </label>
                          <label className="wide">API Key
                            <input
                              placeholder={state.aiSettings.apiKeyConfigured ? "已保存密钥；留空保存时会继续沿用" : "sk-..."}
                              type="password"
                              value={state.aiSettings.apiKey ?? ""}
                              onChange={(event) => updateAiSettings({ apiKey: event.target.value })}
                            />
                            <small>{state.aiSettings.apiKeyConfigured ? "后台已有密钥。输入新密钥并保存可替换。" : "API Key 会保存到后台状态，列表读取时不会明文返回。"}</small>
                          </label>
                          <label className="wide">品牌语气<textarea value={state.aiSettings.brandVoice} onChange={(event) => updateAiSettings({ brandVoice: event.target.value })} /></label>
                          <label className="wide">目标市场<input value={state.aiSettings.targetMarkets.join(", ")} onChange={(event) => updateAiSettings({ targetMarkets: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></label>
                          <label className="wide">必须包含关键词<input value={state.aiSettings.requiredKeywords.join(", ")} onChange={(event) => updateAiSettings({ requiredKeywords: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></label>
                          <label className="checkline"><input type="checkbox" checked={state.aiSettings.enabled} onChange={(event) => updateAiSettings({ enabled: event.target.checked })} />启用 AI 草稿入口</label>
                          <div className="ai-api-actions">
                            <button type="button" onClick={testAiConnection}>测试 API</button>
                            <span className={aiTestStatusTone}>{aiTestStatus || "填写 API Key 后可测试供应商和模型是否可用。"}</span>
                          </div>
                        </div>
                      </section>

                      <section className="settings-panel ai-credit-panel">
                        <div className="settings-panel-head with-action">
                          <div>
                            <h2>AI 积分与消耗</h2>
                            <span>积分对应用户调用 AI 时消耗的 Token，最高管理员可设置余额和计价。</span>
                          </div>
                          <button type="button" disabled={!canResetUserPasswords} onClick={() => save()}>
                            <Coins size={16} />
                            保存积分设置
                          </button>
                        </div>
                        {!canResetUserPasswords ? <p className="settings-lock-note">当前账号只能查看自己的余额和消耗记录，设置积分需使用最高管理员账号。</p> : null}
                        <div className="ai-credit-summary">
                          <div><span>我的余额</span><strong>{formatNumber(currentUser?.aiCredits ?? 0)} 积分</strong></div>
                          <div><span>每 1000 Token</span><strong>{formatNumber(state.aiCreditSettings.pointsPerThousandTokens)} 积分</strong></div>
                          <div><span>积分价格</span><strong>¥{formatNumber(state.aiCreditSettings.pointPriceCny)} / 积分</strong></div>
                        </div>
                        <div className="ai-credit-settings">
                          <label className="checkline"><input disabled={!canResetUserPasswords} type="checkbox" checked={state.aiCreditSettings.enabled} onChange={(event) => updateAiCreditSettings({ enabled: event.target.checked })} />启用积分扣减</label>
                          <label>每 1000 Token 消耗积分<input disabled={!canResetUserPasswords} type="number" min="0" step="0.01" value={state.aiCreditSettings.pointsPerThousandTokens} onChange={(event) => updateAiCreditSettings({ pointsPerThousandTokens: Math.max(0, Number(event.target.value) || 0) })} /></label>
                          <label>每积分价格（人民币）<input disabled={!canResetUserPasswords} type="number" min="0" step="0.001" value={state.aiCreditSettings.pointPriceCny} onChange={(event) => updateAiCreditSettings({ pointPriceCny: Math.max(0, Number(event.target.value) || 0) })} /></label>
                        </div>
                      </section>

                    </div>
                  ) : null}

                  {settingsSection === "translation" ? (
                    <section className="settings-panel ai-translate-panel">
                      <div className="settings-panel-head with-action">
                        <div>
                          <h2>翻译设置</h2>
                          <span>发布新内容后，一键补齐已启用语言里缺失的翻译字段。</span>
                        </div>
                        <button type="button" disabled={!canRunAutoTranslation || translationRunning} onClick={() => runAutoTranslation()}>
                          <Languages size={16} />
                          自动补齐翻译
                        </button>
                      </div>
                      {!canRunAutoTranslation ? <p className="settings-lock-note">当前账号没有自动翻译权限。请使用 Super Admin 或 Admin 账号执行。</p> : null}
                      <div className="ai-translate-grid">
                        <label>翻译范围
                          <select value={translationScope} onChange={(event) => setTranslationScope(event.target.value as TranslationScope)}>
                            {translationScopeOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                          </select>
                          <small>{translationScopeOptions.find((option) => option.key === translationScope)?.description}</small>
                        </label>
                        <label>源语言
                          <select value={translationSourceLocale} onChange={(event) => setTranslationSourceLocale(event.target.value as LocaleCode)}>
                            {locales
                              .filter((localeOption) => state.enabledLocales.includes(localeOption.code) || localeOption.code === "zh" || localeOption.code === "en")
                              .map((localeOption) => <option key={localeOption.code} value={localeOption.code}>{localeOption.flag} {localeOption.nativeName}</option>)}
                          </select>
                          <small>默认从中文内容翻译；如果中文为空，会自动回退到英文或已有语言。</small>
                        </label>
                        <label className="checkline ai-translate-overwrite">
                          <input type="checkbox" checked={translationOverwrite} onChange={(event) => setTranslationOverwrite(event.target.checked)} />
                          覆盖已有翻译
                        </label>
                        <div className="ai-translate-status">
                          <span>{translationStatus || "默认只补空白字段，不会覆盖已经人工编辑过的翻译。"}</span>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  {settingsSection === "backup" ? (
                    <section className="settings-panel site-backup-panel">
                      <div className="settings-panel-head">
                        <div>
                          <h2>整站数据备份</h2>
                          <span>导出或导入后台数据，按模块选择内容，避免备份文件过大。</span>
                        </div>
                      </div>
                      {!canManageFrontendSettings ? <p className="settings-lock-note">当前账号没有备份权限。请使用 Super Admin 或 Admin 账号操作。</p> : null}
                      <div className="site-backup-grid">
                        <article className="admin-edit-card site-backup-card">
                          <div className="site-backup-card-head">
                            <div>
                              <strong>导出数据</strong>
                              <span>生成可下载的 JSON 备份文件。</span>
                            </div>
                            <button type="button" disabled={!canManageFrontendSettings} onClick={exportSiteBackup}>
                              <Download size={16} />
                              导出备份
                            </button>
                          </div>
                          <div className="site-backup-toolbar">
                            <button type="button" disabled={!canManageFrontendSettings} onClick={() => selectAllBackupSections("export")}>
                              {backupSections.length === selectableBackupSectionCount ? "取消全选" : "全选模块"}
                            </button>
                            <label className="checkline">
                              <input disabled={!canManageFrontendSettings || !backupSections.includes("uploadedFiles")} type="checkbox" checked={backupIncludeFiles} onChange={(event) => setBackupIncludeFiles(event.target.checked)} />
                              包含媒体文件内容
                            </label>
                          </div>
                          <div className="site-backup-options">
                            {backupSectionOptions.map((option) => (
                              <label className="site-backup-option" key={option.key}>
                                <input disabled={!canManageFrontendSettings || (!canResetUserPasswords && sensitiveBackupSections.has(option.key))} type="checkbox" checked={backupSections.includes(option.key)} onChange={() => toggleBackupSection(option.key, "export")} />
                                <span>
                                  <strong>{option.label}</strong>
                                  <small>{option.description}</small>
                                </span>
                              </label>
                            ))}
                          </div>
                        </article>

                        <article className="admin-edit-card site-backup-card">
                          <div className="site-backup-card-head">
                            <div>
                              <strong>导入数据</strong>
                              <span>只覆盖勾选模块，未选中的现有数据会保留。</span>
                            </div>
                            <button type="button" disabled={!canManageFrontendSettings} onClick={() => backupImportInputRef.current?.click()}>
                              <Upload size={16} />
                              选择备份导入
                            </button>
                            <input
                              ref={backupImportInputRef}
                              accept="application/json,.json"
                              hidden
                              type="file"
                              onChange={(event) => importSiteBackup(event.currentTarget.files?.[0] ?? null)}
                            />
                          </div>
                          <div className="site-backup-toolbar">
                            <button type="button" disabled={!canManageFrontendSettings} onClick={() => selectAllBackupSections("import")}>
                              {backupImportSections.length === selectableBackupSectionCount ? "取消全选" : "全选模块"}
                            </button>
                            <label className="checkline">
                              <input disabled={!canManageFrontendSettings || !backupImportSections.includes("uploadedFiles")} type="checkbox" checked={backupImportFiles} onChange={(event) => setBackupImportFiles(event.target.checked)} />
                              恢复媒体文件内容
                            </label>
                          </div>
                          <div className="site-backup-options">
                            {backupSectionOptions.map((option) => (
                              <label className="site-backup-option" key={option.key}>
                                <input disabled={!canManageFrontendSettings || (!canResetUserPasswords && sensitiveBackupSections.has(option.key))} type="checkbox" checked={backupImportSections.includes(option.key)} onChange={() => toggleBackupSection(option.key, "import")} />
                                <span>
                                  <strong>{option.label}</strong>
                                  <small>{option.description}</small>
                                </span>
                              </label>
                            ))}
                          </div>
                        </article>
                      </div>
                      <div className="site-backup-status">
                        <DatabaseBackup size={18} />
                        <span>{backupStatus}</span>
                      </div>
                      <p className="settings-lock-note">用户权限和 AI 配置可能包含密码哈希或 API Key；只把备份文件交给可信人员保存。</p>
                    </section>
                  ) : null}

                </section>
              </div>

            </>
          ) : null}

          {tab === "collect" ? (
            <>
              <div className="admin-section-title">
                <h1>内容采集</h1>
              </div>
              <section className="settings-panel collector-panel">
                <div className="settings-panel-head">
                  <div>
                    <h2>采集并二次创作</h2>
                    <span>输入网页链接，或粘贴其他内容，调用 AI 改写后导入文章或页面。</span>
                  </div>
                </div>
                <div className="collector-form">
                  <label className="wide">网页链接
                    <input
                      placeholder="https://example.com/article"
                      value={collectorForm.sourceUrl}
                      onChange={(event) => setCollectorForm({ ...collectorForm, sourceUrl: event.target.value })}
                    />
                  </label>
                  <label>导入类型
                    <select value={collectorForm.target} onChange={(event) => setCollectorForm({ ...collectorForm, target: event.target.value as AiContentTarget })}>
                      <option value="article">文章</option>
                      <option value="page">页面</option>
                    </select>
                  </label>
                  <label>文章分类
                    <select disabled={collectorForm.target !== "article"} value={collectorForm.category || state.siteSettings.defaultArticleCategory || state.products[0]?.slug || ""} onChange={(event) => setCollectorForm({ ...collectorForm, category: event.target.value })}>
                      {articleProductCategoryOptions.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                    </select>
                  </label>
                  <label className="wide">其他内容
                    <textarea
                      placeholder="也可以直接粘贴竞品页面、产品资料、旧文章、客户素材或大纲。"
                      value={collectorForm.sourceText}
                      onChange={(event) => setCollectorForm({ ...collectorForm, sourceText: event.target.value })}
                    />
                  </label>
                </div>
                <div className="ai-action-row">
                  <button type="button" onClick={runCollector}>
                    <Search size={16} />
                    开始采集
                  </button>
                  <button type="button" disabled={!collectorDraft} onClick={importCollectorDraft}>
                    <SendToBack size={16} />
                    导入到文章/页面
                  </button>
                </div>
                {collectorStatus ? <p className="ai-image-status">{collectorStatus}</p> : null}
              </section>

              <section className="settings-panel collector-preview-panel">
                <div className="settings-panel-head">
                  <div>
                    <h2>采集结果预览</h2>
                    <span>{collectorDraft ? `将导入${collectorDraft.target === "article" ? "文章" : "页面"}：${collectorDraft.title.zh || collectorDraft.title.en}` : "采集完成后可在这里查看二次创作结果。"}</span>
                  </div>
                </div>
                {collectorDraft ? (
                  <article className="ai-draft-preview">
                    <div className="ai-draft-meta">
                      <span>{collectorDraft.target === "article" ? "文章草稿" : "页面草稿"}</span>
                      <span>/{collectorDraft.target === "article" ? "articles" : "pages"}/{collectorDraft.slug}</span>
                    </div>
                    <h3>{collectorDraft.title.zh || collectorDraft.title.en}</h3>
                    <p>{collectorDraft.excerpt.zh || collectorDraft.excerpt.en}</p>
                    <pre>{collectorDraft.body.zh || collectorDraft.body.en}</pre>
                  </article>
                ) : (
                  <div className="ai-empty-preview">
                    <Search size={24} />
                    <strong>还没有采集内容</strong>
                    <span>填写链接或粘贴内容后点击“开始采集”。</span>
                  </div>
                )}
              </section>
            </>
          ) : null}

          {tab === "languages" ? (
            <>
              {!canManageFrontendSettings ? <p className="settings-lock-note">当前账号没有前台设置权限。请使用 Super Admin 或 Admin 账号修改语言。</p> : null}
              {languageSettingsPanel}
            </>
          ) : null}

          {tab === "themes" ? (
            <>
              <p>点击主题后会立即预览并保存，前台刷新后同样生效。</p>
              <div className="theme-picker theme-picker-detailed">
                {themeOptions.map((theme) => (
                  <button
                    className={state.activeTheme === theme ? "active" : ""}
                    key={theme}
                    onClick={() => switchTheme(theme)}
                    type="button"
                    style={{
                      "--theme-primary": themes[theme].colors.primary,
                      "--theme-accent": themes[theme].colors.accent,
                      "--theme-bg": themes[theme].colors.background
                    } as React.CSSProperties}
                  >
                    <span className="theme-swatch" />
                    <strong>{themes[theme].name}</strong>
                    <small>{themes[theme].description}</small>
                  </button>
                ))}
              </div>
              <div className="theme-live-preview">
                <div>
                  <span className="eyebrow">Theme preview</span>
                  <h2>{themes[state.activeTheme].name}</h2>
                  <p>{themes[state.activeTheme].description}</p>
                </div>
                <div className="theme-preview-card">
                  <strong>RFQ Button</strong>
                  <span>Header, cards, buttons, forms and front page sections follow this theme.</span>
                  <button type="button">Primary action</button>
                </div>
              </div>
            </>
          ) : null}

          {tab === "account" ? (
            <>
              <h1>账号设置</h1>
              <div className="account-settings-grid">
                <section className="account-profile-card">
                  <div className="account-avatar-large">
                    {currentUser?.avatarUrl ? <Image src={currentUser.avatarUrl} alt={currentUserName} width={96} height={96} unoptimized /> : accountInitial}
                  </div>
                  <label>显示名称
                    <input value={currentUser?.name ?? ""} onChange={(event) => updateCurrentUser({ name: event.target.value })} />
                  </label>
                  <label>登录邮箱
                    <input type="email" value={currentUser?.email ?? ""} onChange={(event) => updateCurrentUser({ email: event.target.value })} />
                    <small>修改邮箱后，下次登录请使用新邮箱。</small>
                  </label>
                  <label>职位/备注
                    <input value={currentUser?.jobTitle ?? ""} onChange={(event) => updateCurrentUser({ jobTitle: event.target.value })} />
                  </label>
                  <label>联系电话
                    <input value={currentUser?.phone ?? ""} onChange={(event) => updateCurrentUser({ phone: event.target.value })} />
                  </label>
                  <label className="account-avatar-upload">
                    上传头像
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        uploadAccountAvatar(event.currentTarget.files?.[0] ?? null);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  {currentUser?.avatarUrl ? <button type="button" onClick={() => updateCurrentUser({ avatarUrl: undefined })}>移除头像</button> : null}
                </section>

                <section className="account-security-card">
                  <h2>账号与密码</h2>
                  <div className="account-info-list">
                    <div><span>后台名称</span><strong>KeyproTools Admin</strong></div>
                    <div><span>登录邮箱</span><strong>{currentEmail}</strong></div>
                    <div><span>当前角色</span><strong>{currentUser?.role ?? "admin"}</strong></div>
                    <div><span>账号状态</span><strong>{currentUser?.active ? "启用" : "停用"}</strong></div>
                    <div><span>后台状态</span><strong>{status}</strong></div>
                    <div><span>更新时间</span><strong>{new Date(state.updatedAt).toLocaleString()}</strong></div>
                  </div>
                  <div className="account-password-form">
                    <label>当前密码
                      <input
                        type="password"
                        value={accountPassword.current}
                        onChange={(event) => setAccountPassword({ ...accountPassword, current: event.target.value })}
                      />
                      <small>修改邮箱或密码时必须填写当前密码。</small>
                    </label>
                    <label>新密码
                      <input
                        type="password"
                        value={accountPassword.next}
                        onChange={(event) => setAccountPassword({ ...accountPassword, next: event.target.value })}
                      />
                    </label>
                    <label>确认新密码
                      <input
                        type="password"
                        value={accountPassword.confirm}
                        onChange={(event) => setAccountPassword({ ...accountPassword, confirm: event.target.value })}
                      />
                      <small>不修改密码时留空。</small>
                    </label>
                  </div>
                  <div className="account-actions">
                    <button type="button" onClick={saveAccountSettings}>保存账号设置</button>
                    <button type="button" onClick={logout}>退出登录</button>
                  </div>
                </section>

                <section className="account-ai-credit-card">
                  <div className="settings-panel-head">
                    <div>
                      <h2>AI 积分与消耗</h2>
                      <span>这里显示当前账号的 AI 积分余额、Token 计价和最近消耗记录。</span>
                    </div>
                  </div>
                  <div className="ai-credit-summary account-ai-credit-summary">
                    <div>
                      <span>当前余额</span>
                      <strong>{formatNumber(currentUser?.aiCredits ?? 0)} 积分</strong>
                    </div>
                    <div>
                      <span>每 1000 Token</span>
                      <strong>{formatNumber(state.aiCreditSettings.pointsPerThousandTokens)} 积分</strong>
                    </div>
                    <div>
                      <span>积分价格</span>
                      <strong>¥{formatNumber(state.aiCreditSettings.pointPriceCny)} / 积分</strong>
                    </div>
                  </div>
                  <div className="ai-usage-table compact" role="table" aria-label="当前账号 AI 消耗表">
                    <div className="ai-usage-row header" role="row">
                      <span>时间</span>
                      <span>操作</span>
                      <span>模型</span>
                      <span>Token</span>
                      <span>消耗</span>
                      <span>余额</span>
                    </div>
                    {visibleAiUsageRecords.slice(0, 10).map((record) => (
                      <div className="ai-usage-row" role="row" key={record.id}>
                        <span>{new Date(record.createdAt).toLocaleString("zh-CN", { hour12: false })}</span>
                        <span>{record.action}</span>
                        <span>{record.provider} / {record.model}</span>
                        <span>{formatNumber(record.totalTokens)}</span>
                        <strong>{formatNumber(record.pointsUsed)}</strong>
                        <span>{formatNumber(record.balanceAfter)}</span>
                      </div>
                    ))}
                    {visibleAiUsageRecords.length === 0 ? <p className="empty-state">当前账号暂无 AI 消耗记录。</p> : null}
                  </div>
                </section>
              </div>
            </>
          ) : null}

          {tab === "ai" ? (
            <>
              <div className="ai-workbench">
                <div className="ai-workbench-switcher" role="tablist" aria-label="AI 内容分区">
                  {aiWorkbenchSections.map((section) => (
                    <button
                      aria-selected={aiWorkbenchSection === section.key}
                      className={aiWorkbenchSection === section.key ? "active" : ""}
                      key={section.key}
                      role="tab"
                      type="button"
                      onClick={() => setAiWorkbenchSection(section.key)}
                    >
                      <strong>{section.label}</strong>
                      <span>{section.description}</span>
                    </button>
                  ))}
                </div>

                {aiWorkbenchSection === "generate" ? (
                  <>
                <section className="settings-panel ai-compose-panel">
                  <div className="settings-panel-head">
                    <div>
                      <h2>生成并填充</h2>
                      <span>先选择要生成的内容类型和写入方式，再把 AI 内容写入文章或页面编辑器。</span>
                    </div>
                  </div>

                  <div className="ai-target-grid">
                    {aiTargetOptions.map((option) => (
                      <button
                        className={aiContentForm.target === option.key ? "active" : ""}
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setAiContentForm((current) => ({ ...current, target: option.key }));
                          setAiDraftPreview(null);
                          setAiGeneratedImage(null);
                          setAiImageStatus("");
                        }}
                      >
                        <strong>{option.label}</strong>
                        <span>{option.description}</span>
                      </button>
                    ))}
                  </div>

                  <div className="ai-compose-grid">
                    <label>内容主题
                      <input
                        placeholder={aiContentForm.target === "article" ? "例如：carbide end mills for stainless steel" : "例如：custom tooling service"}
                        value={aiContentForm.topic}
                        onChange={(event) => setAiContentForm({ ...aiContentForm, topic: event.target.value })}
                      />
                    </label>
                    {aiContentForm.target === "article" ? (
                      <label>文章分类
                        <select value={aiContentForm.category || state.siteSettings.defaultArticleCategory || state.products[0]?.slug || ""} onChange={(event) => setAiContentForm({ ...aiContentForm, category: event.target.value })}>
                          {articleProductCategoryOptions.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                        </select>
                      </label>
                    ) : (
                      <label>页面类型
                        <input value="独立页面草稿" readOnly />
                      </label>
                    )}
                    <label>写入方式
                      <select value={aiContentForm.writeMode} onChange={(event) => setAiContentForm({ ...aiContentForm, writeMode: event.target.value as AiWriteMode })}>
                        {aiWriteModeOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                      </select>
                    </label>
                    <label>写入目标
                      <select
                        disabled={aiContentForm.writeMode === "new"}
                        value={aiContentForm.target === "article" ? aiContentForm.targetArticleId : aiContentForm.targetPageId}
                        onChange={(event) => {
                          if (aiContentForm.target === "article") {
                            setAiContentForm({ ...aiContentForm, targetArticleId: event.target.value });
                            return;
                          }
                          setAiContentForm({ ...aiContentForm, targetPageId: event.target.value });
                        }}
                      >
                        <option value="">{aiContentForm.writeMode === "new" ? "新建时不需要选择目标" : "选择要填充的内容"}</option>
                        {(aiContentForm.target === "article" ? aiArticleTargets : aiPageTargets).map((item) => (
                          <option key={item.id ?? item.slug} value={item.id ?? item.slug}>{item.title.zh || item.title.en || item.slug}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="ai-write-mode-list">
                    {aiWriteModeOptions.map((option) => (
                      <button
                        className={aiContentForm.writeMode === option.key ? "active" : ""}
                        key={option.key}
                        type="button"
                        onClick={() => setAiContentForm({ ...aiContentForm, writeMode: option.key })}
                      >
                        <strong>{option.label}</strong>
                        <span>{option.description}</span>
                      </button>
                    ))}
                  </div>

                  <div className="ai-action-row">
                    <button type="button" onClick={generateAiContentPreview}>
                      <Sparkles size={16} />
                      生成预览
                    </button>
                    <button type="button" disabled={!aiCanApply} onClick={generateAndApplyAiContent}>
                      <SendToBack size={16} />
                      生成并填充
                    </button>
                    <button type="button" disabled={!aiDraftPreview || !aiCanApply} onClick={() => applyAiContentDraft()}>
                      <PlusCircle size={16} />
                      填充当前预览
                    </button>
                    <button type="button" onClick={() => setAiDraftPreview(buildAiContentDraft())}>
                      <RefreshCw size={16} />
                      重写预览
                    </button>
                    <button type="button" disabled={!aiDraftPreview || aiDraftPreview.target !== "article" || aiImageStatus.startsWith("正在")} onClick={generateAiArticleImage}>
                      <ImageIcon size={16} />
                      根据文章生成配图
                    </button>
                  </div>
                  {aiImageStatus ? <p className="ai-image-status">{aiImageStatus}</p> : null}
                </section>

                <section className="settings-panel ai-preview-panel">
                  <div className="settings-panel-head">
                    <div>
                      <h2>生成内容预览</h2>
                      <span>{aiDraftPreview ? `将写入${aiDraftPreview.target === "article" ? "文章" : "页面"}：${aiDraftPreview.title.zh || aiDraftPreview.title.en}` : "生成后可在这里检查标题、摘要和正文。"}</span>
                    </div>
                  </div>
                  {aiDraftPreview ? (
                    <article className="ai-draft-preview">
                      <div className="ai-draft-meta">
                        <span>{aiDraftPreview.target === "article" ? "文章草稿" : "页面草稿"}</span>
                        <span>{aiWriteModeOptions.find((option) => option.key === aiContentForm.writeMode)?.label}</span>
                        <span>/{aiDraftPreview.target === "article" ? "articles" : "pages"}/{aiDraftPreview.slug}</span>
                      </div>
                      {aiGeneratedImage ? (
                        <figure className="ai-generated-image-preview">
                          <Image src={aiGeneratedImage.url} alt={aiGeneratedImage.name} width={360} height={360} unoptimized />
                          <figcaption>{aiGeneratedImage.name} 已保存到媒体库，填充文章时会作为封面图。</figcaption>
                        </figure>
                      ) : null}
                      <h3>{aiDraftPreview.title.zh || aiDraftPreview.title.en}</h3>
                      <p>{aiDraftPreview.excerpt.zh || aiDraftPreview.excerpt.en}</p>
                      <pre>{aiDraftPreview.body.zh || aiDraftPreview.body.en}</pre>
                    </article>
                  ) : (
                    <div className="ai-empty-preview">
                      <Bot size={24} />
                      <strong>还没有生成内容</strong>
                      <span>填写主题后点击“生成预览”，再填充到新文章、现有文章、新页面或现有页面。</span>
                    </div>
                  )}
                </section>
                  </>
                ) : null}
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
