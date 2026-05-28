"use client";

import { Fragment, type CSSProperties, type DragEvent, type KeyboardEvent, type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PuckTemplateEditor } from "@/components/PuckTemplateEditor";
import {
  Bot,
  Bold,
  Code2,
  Coins,
  Copy,
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
  Mail,
  Maximize2,
  Menu,
  Minus,
  Minimize2,
  MoveDown,
  MoveUp,
  Paperclip,
  Palette,
  Pilcrow,
  PlusCircle,
  Quote,
  RefreshCw,
  Save,
  Search,
  SendToBack,
  ShieldCheck,
  Sparkles,
  Share2,
  Strikethrough,
  Subscript,
  Superscript,
  Table2,
  Trash2,
  Type,
  Underline,
  Upload,
  Users,
  Video,
  X
} from "lucide-react";
import { locales } from "@/config/locales";
import { themes } from "@/config/themes";
import { AdminMarkdownEditor, type AdminMarkdownEditorHandle } from "@/components/AdminMarkdownEditor";
import type { AdminRolePermissions, AdminState, AdminUser, Article, ContactChannel, ContactChannelType, HomeSectionKey, LeadStatus, LocaleCode, ProductCategory, RoleKey, SiteHeroSlide, SiteNavigationItem, SitePage, SiteTemplateCustomBlock, SiteTemplateCustomBlockType, SiteTemplateImageItem, SiteTemplateImageLayout, SiteTemplateSettings, ThemeKey, Translation, UploadedFile, WorldClockCity } from "@/types/site";

type Tab = "overview" | "products" | "pages" | "articles" | "files" | "leads" | "mail" | "contacts" | "navigation" | "users" | "collect" | "templates" | "settings" | "languages" | "themes" | "account" | "ai";
type ArticleEditorView = "visual" | "code";
type PageMode = "list" | "editor";
type MediaTypeFilter = "all" | "image" | "document" | "spreadsheet" | "archive" | "other";
type MediaTimeFilter = "all" | "7d" | "30d" | "90d";
type SettingsSection = "general" | "writing" | "reading" | "seo" | "media" | "permalinks" | "privacy" | "ai" | "translation" | "backup";
type AiContentTarget = "article" | "page";
type AiWriteMode = "new" | "replace" | "append";
type AiWorkbenchSection = "generate";
type AiContentPurpose = "buying-guide" | "product-application" | "service-intro" | "faq-content";
type AiContentSectionKey = "buyer-intent" | "product-fit" | "rfq-checklist" | "faq" | "cta";
type AiWizardStep = 1 | 2 | 3 | 4 | 5;
type TranslationScope = "all" | "article" | "page" | "products" | "templates" | "navigation";
type TranslationSourceChoice = "auto" | LocaleCode;
type TranslationTargetChoice = "all" | LocaleCode;
type ProductInlineEditField = "name" | "summary" | "slug" | "parentId";
type ProductInlineEditState = {
  field: ProductInlineEditField;
  productId: string;
  value: string;
};
type BackupSectionKey = keyof Pick<AdminState, "products" | "pages" | "articles" | "leads" | "contactChannels" | "uploadedFiles" | "users" | "rolePermissions" | "navigation" | "siteSettings" | "templateSettings" | "pageLayouts" | "aiSettings" | "aiCreditSettings" | "aiUsageRecords" | "activeTheme" | "enabledLocales">;
type TemplateEditorMode = "form" | "visual";
type VideoDialogTarget = "article" | "page";
type MailActionResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
  state?: AdminState;
};
type VisualBuilderDevice = "desktop" | "tablet" | "mobile";
type VisualBuilderSidebarTab = "components" | "properties";
type VisualBuilderModuleKind = "section" | "custom";
type VisualBuilderDragPayload = {
  source: "module" | "palette";
  moduleId?: string;
  blockType?: SiteTemplateCustomBlockType;
};
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
  seoTitleZh: string;
  seoTitleEn: string;
  seoDescriptionZh: string;
  seoDescriptionEn: string;
  seoOgImageUrl: string;
  seoCanonicalUrl: string;
  seoIndexable: boolean;
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
  purpose: AiContentPurpose;
  topic: string;
  selectedTitle: string;
  audience: string;
  category: string;
  sections: AiContentSectionKey[];
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
  { key: "mail", label: "邮件", icon: Mail },
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
  { key: "mail", label: "邮件" },
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
  admin: ["overview", "products", "pages", "articles", "files", "leads", "mail", "contacts", "navigation", "collect", "templates", "settings", "languages", "themes", "ai"],
  editor: ["overview", "products", "pages", "articles", "files", "collect", "ai"],
  sales: ["overview", "products", "leads", "mail", "contacts"],
  viewer: ["overview", "products", "articles", "files"]
};

const worldClockCities = [
  { id: "asia-shanghai", city: "北京", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-tokyo", city: "东京", country: "日本", zone: "Asia/Tokyo" },
  { id: "asia-seoul", city: "首尔", country: "韩国", zone: "Asia/Seoul" },
  { id: "asia-singapore", city: "新加坡", country: "新加坡", zone: "Asia/Singapore" },
  { id: "asia-manila", city: "马尼拉", country: "菲律宾", zone: "Asia/Manila" },
  { id: "asia-kuala-lumpur", city: "吉隆坡", country: "马来西亚", zone: "Asia/Kuala_Lumpur" },
  { id: "asia-jakarta", city: "雅加达", country: "印度尼西亚", zone: "Asia/Jakarta" },
  { id: "asia-bangkok", city: "曼谷", country: "泰国", zone: "Asia/Bangkok" },
  { id: "asia-ho-chi-minh", city: "胡志明市", country: "越南", zone: "Asia/Ho_Chi_Minh" },
  { id: "asia-hanoi", city: "河内", country: "越南", zone: "Asia/Ho_Chi_Minh" },
  { id: "asia-phnom-penh", city: "金边", country: "柬埔寨", zone: "Asia/Phnom_Penh" },
  { id: "asia-vientiane", city: "万象", country: "老挝", zone: "Asia/Vientiane" },
  { id: "asia-yangon", city: "仰光", country: "缅甸", zone: "Asia/Yangon" },
  { id: "asia-mumbai", city: "孟买", country: "印度", zone: "Asia/Kolkata" },
  { id: "asia-new-delhi", city: "新德里", country: "印度", zone: "Asia/Kolkata" },
  { id: "asia-dhaka", city: "达卡", country: "孟加拉国", zone: "Asia/Dhaka" },
  { id: "asia-karachi", city: "卡拉奇", country: "巴基斯坦", zone: "Asia/Karachi" },
  { id: "asia-colombo", city: "科伦坡", country: "斯里兰卡", zone: "Asia/Colombo" },
  { id: "asia-dubai", city: "迪拜", country: "阿联酋", zone: "Asia/Dubai" },
  { id: "asia-abu-dhabi", city: "阿布扎比", country: "阿联酋", zone: "Asia/Dubai" },
  { id: "asia-riyadh", city: "利雅得", country: "沙特阿拉伯", zone: "Asia/Riyadh" },
  { id: "asia-jeddah", city: "吉达", country: "沙特阿拉伯", zone: "Asia/Riyadh" },
  { id: "asia-doha", city: "多哈", country: "卡塔尔", zone: "Asia/Qatar" },
  { id: "asia-kuwait", city: "科威特城", country: "科威特", zone: "Asia/Kuwait" },
  { id: "asia-muscat", city: "马斯喀特", country: "阿曼", zone: "Asia/Muscat" },
  { id: "africa-cairo", city: "开罗", country: "埃及", zone: "Africa/Cairo" },
  { id: "africa-johannesburg", city: "约翰内斯堡", country: "南非", zone: "Africa/Johannesburg" },
  { id: "africa-cape-town", city: "开普敦", country: "南非", zone: "Africa/Johannesburg" },
  { id: "africa-lagos", city: "拉各斯", country: "尼日利亚", zone: "Africa/Lagos" },
  { id: "africa-nairobi", city: "内罗毕", country: "肯尼亚", zone: "Africa/Nairobi" },
  { id: "africa-casablanca", city: "卡萨布兰卡", country: "摩洛哥", zone: "Africa/Casablanca" },
  { id: "europe-istanbul", city: "伊斯坦布尔", country: "土耳其", zone: "Europe/Istanbul" },
  { id: "europe-london", city: "伦敦", country: "英国", zone: "Europe/London" },
  { id: "europe-paris", city: "巴黎", country: "法国", zone: "Europe/Paris" },
  { id: "europe-rotterdam", city: "鹿特丹", country: "荷兰", zone: "Europe/Amsterdam" },
  { id: "europe-hamburg", city: "汉堡", country: "德国", zone: "Europe/Berlin" },
  { id: "europe-frankfurt", city: "法兰克福", country: "德国", zone: "Europe/Berlin" },
  { id: "europe-milan", city: "米兰", country: "意大利", zone: "Europe/Rome" },
  { id: "europe-madrid", city: "马德里", country: "西班牙", zone: "Europe/Madrid" },
  { id: "europe-warsaw", city: "华沙", country: "波兰", zone: "Europe/Warsaw" },
  { id: "europe-moscow", city: "莫斯科", country: "俄罗斯", zone: "Europe/Moscow" },
  { id: "america-new-york", city: "纽约", country: "美国", zone: "America/New_York" },
  { id: "america-toronto", city: "多伦多", country: "加拿大", zone: "America/Toronto" },
  { id: "america-chicago", city: "芝加哥", country: "美国", zone: "America/Chicago" },
  { id: "america-houston", city: "休斯敦", country: "美国", zone: "America/Chicago" },
  { id: "america-los-angeles", city: "洛杉矶", country: "美国", zone: "America/Los_Angeles" },
  { id: "america-vancouver", city: "温哥华", country: "加拿大", zone: "America/Vancouver" },
  { id: "america-miami", city: "迈阿密", country: "美国", zone: "America/New_York" },
  { id: "america-mexico-city", city: "墨西哥城", country: "墨西哥", zone: "America/Mexico_City" },
  { id: "america-bogota", city: "波哥大", country: "哥伦比亚", zone: "America/Bogota" },
  { id: "america-lima", city: "利马", country: "秘鲁", zone: "America/Lima" },
  { id: "america-santiago", city: "圣地亚哥", country: "智利", zone: "America/Santiago" },
  { id: "america-buenos-aires", city: "布宜诺斯艾利斯", country: "阿根廷", zone: "America/Argentina/Buenos_Aires" },
  { id: "america-sao-paulo", city: "圣保罗", country: "巴西", zone: "America/Sao_Paulo" },
  { id: "america-rio", city: "里约热内卢", country: "巴西", zone: "America/Sao_Paulo" },
  { id: "australia-sydney", city: "悉尼", country: "澳大利亚", zone: "Australia/Sydney" },
  { id: "australia-melbourne", city: "墨尔本", country: "澳大利亚", zone: "Australia/Melbourne" },
  { id: "australia-perth", city: "珀斯", country: "澳大利亚", zone: "Australia/Perth" },
  { id: "pacific-auckland", city: "奥克兰", country: "新西兰", zone: "Pacific/Auckland" },
  { id: "australia-brisbane", city: "布里斯班", country: "澳大利亚", zone: "Australia/Brisbane" },
  { id: "pacific-wellington", city: "惠灵顿", country: "新西兰", zone: "Pacific/Auckland" },
  { id: "pacific-honolulu", city: "檀香山", country: "美国", zone: "Pacific/Honolulu" },
  { id: "america-anchorage", city: "安克雷奇", country: "美国", zone: "America/Anchorage" }
] satisfies WorldClockCity[];

const worldClockCityCatalog = [
  ...worldClockCities,
  { id: "asia-shenzhen", city: "深圳", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-shanghai-city", city: "上海", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-guangzhou", city: "广州", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-hangzhou", city: "杭州", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-ningbo", city: "宁波", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-yiwu", city: "义乌", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-qingdao", city: "青岛", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-xiamen", city: "厦门", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-suzhou", city: "苏州", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-tianjin", city: "天津", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-chengdu", city: "成都", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-chongqing", city: "重庆", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-wuhan", city: "武汉", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-nanjing", city: "南京", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-zhengzhou", city: "郑州", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-xian", city: "西安", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-foshan", city: "佛山", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-dongguan", city: "东莞", country: "中国", zone: "Asia/Shanghai" },
  { id: "asia-taipei", city: "台北", country: "中国台湾", zone: "Asia/Taipei" },
  { id: "asia-kaohsiung", city: "高雄", country: "中国台湾", zone: "Asia/Taipei" },
  { id: "asia-hong-kong", city: "香港", country: "中国香港", zone: "Asia/Hong_Kong" },
  { id: "asia-macau", city: "澳门", country: "中国澳门", zone: "Asia/Macau" },
  { id: "asia-osaka", city: "大阪", country: "日本", zone: "Asia/Tokyo" },
  { id: "asia-nagoya", city: "名古屋", country: "日本", zone: "Asia/Tokyo" },
  { id: "asia-busan", city: "釜山", country: "韩国", zone: "Asia/Seoul" },
  { id: "asia-incheon", city: "仁川", country: "韩国", zone: "Asia/Seoul" },
  { id: "asia-taichung", city: "台中", country: "中国台湾", zone: "Asia/Taipei" },
  { id: "asia-bengaluru", city: "班加罗尔", country: "印度", zone: "Asia/Kolkata" },
  { id: "asia-chennai", city: "金奈", country: "印度", zone: "Asia/Kolkata" },
  { id: "asia-hyderabad", city: "海得拉巴", country: "印度", zone: "Asia/Kolkata" },
  { id: "asia-ahmedabad", city: "艾哈迈达巴德", country: "印度", zone: "Asia/Kolkata" },
  { id: "asia-pune", city: "浦那", country: "印度", zone: "Asia/Kolkata" },
  { id: "asia-lahore", city: "拉合尔", country: "巴基斯坦", zone: "Asia/Karachi" },
  { id: "asia-islamabad", city: "伊斯兰堡", country: "巴基斯坦", zone: "Asia/Karachi" },
  { id: "asia-chittagong", city: "吉大港", country: "孟加拉国", zone: "Asia/Dhaka" },
  { id: "asia-kathmandu", city: "加德满都", country: "尼泊尔", zone: "Asia/Kathmandu" },
  { id: "asia-ulaanbaatar", city: "乌兰巴托", country: "蒙古", zone: "Asia/Ulaanbaatar" },
  { id: "asia-tashkent", city: "塔什干", country: "乌兹别克斯坦", zone: "Asia/Tashkent" },
  { id: "asia-almaty", city: "阿拉木图", country: "哈萨克斯坦", zone: "Asia/Almaty" },
  { id: "asia-astana", city: "阿斯塔纳", country: "哈萨克斯坦", zone: "Asia/Almaty" },
  { id: "asia-bishkek", city: "比什凯克", country: "吉尔吉斯斯坦", zone: "Asia/Bishkek" },
  { id: "asia-dushanbe", city: "杜尚别", country: "塔吉克斯坦", zone: "Asia/Dushanbe" },
  { id: "asia-ashgabat", city: "阿什哈巴德", country: "土库曼斯坦", zone: "Asia/Ashgabat" },
  { id: "asia-hong-kong-export", city: "九龙", country: "中国香港", zone: "Asia/Hong_Kong" },
  { id: "asia-surabaya", city: "泗水", country: "印度尼西亚", zone: "Asia/Jakarta" },
  { id: "asia-bandung", city: "万隆", country: "印度尼西亚", zone: "Asia/Jakarta" },
  { id: "asia-medan", city: "棉兰", country: "印度尼西亚", zone: "Asia/Jakarta" },
  { id: "asia-bali", city: "登巴萨", country: "印度尼西亚", zone: "Asia/Makassar" },
  { id: "asia-cebu", city: "宿务", country: "菲律宾", zone: "Asia/Manila" },
  { id: "asia-davao", city: "达沃", country: "菲律宾", zone: "Asia/Manila" },
  { id: "asia-chiang-mai", city: "清迈", country: "泰国", zone: "Asia/Bangkok" },
  { id: "asia-da-nang", city: "岘港", country: "越南", zone: "Asia/Ho_Chi_Minh" },
  { id: "asia-hai-phong", city: "海防", country: "越南", zone: "Asia/Ho_Chi_Minh" },
  { id: "asia-penang", city: "槟城", country: "马来西亚", zone: "Asia/Kuala_Lumpur" },
  { id: "asia-johor-bahru", city: "新山", country: "马来西亚", zone: "Asia/Kuala_Lumpur" },
  { id: "asia-kuantan", city: "关丹", country: "马来西亚", zone: "Asia/Kuala_Lumpur" },
  { id: "asia-brunei", city: "斯里巴加湾", country: "文莱", zone: "Asia/Brunei" },
  { id: "asia-dili", city: "帝力", country: "东帝汶", zone: "Asia/Dili" },
  { id: "asia-tehran", city: "德黑兰", country: "伊朗", zone: "Asia/Tehran" },
  { id: "asia-baghdad", city: "巴格达", country: "伊拉克", zone: "Asia/Baghdad" },
  { id: "asia-amman", city: "安曼", country: "约旦", zone: "Asia/Amman" },
  { id: "asia-beirut", city: "贝鲁特", country: "黎巴嫩", zone: "Asia/Beirut" },
  { id: "asia-jerusalem", city: "特拉维夫", country: "以色列", zone: "Asia/Jerusalem" },
  { id: "asia-manama", city: "麦纳麦", country: "巴林", zone: "Asia/Bahrain" },
  { id: "asia-dammam", city: "达曼", country: "沙特阿拉伯", zone: "Asia/Riyadh" },
  { id: "asia-medina", city: "麦地那", country: "沙特阿拉伯", zone: "Asia/Riyadh" },
  { id: "asia-sharjah", city: "沙迦", country: "阿联酋", zone: "Asia/Dubai" },
  { id: "asia-tbilisi", city: "第比利斯", country: "格鲁吉亚", zone: "Asia/Tbilisi" },
  { id: "asia-baku", city: "巴库", country: "阿塞拜疆", zone: "Asia/Baku" },
  { id: "asia-yerevan", city: "埃里温", country: "亚美尼亚", zone: "Asia/Yerevan" },
  { id: "europe-berlin", city: "柏林", country: "德国", zone: "Europe/Berlin" },
  { id: "europe-munich", city: "慕尼黑", country: "德国", zone: "Europe/Berlin" },
  { id: "europe-stuttgart", city: "斯图加特", country: "德国", zone: "Europe/Berlin" },
  { id: "europe-lyon", city: "里昂", country: "法国", zone: "Europe/Paris" },
  { id: "europe-marseille", city: "马赛", country: "法国", zone: "Europe/Paris" },
  { id: "europe-manchester", city: "曼彻斯特", country: "英国", zone: "Europe/London" },
  { id: "europe-birmingham", city: "伯明翰", country: "英国", zone: "Europe/London" },
  { id: "europe-glasgow", city: "格拉斯哥", country: "英国", zone: "Europe/London" },
  { id: "europe-rome", city: "罗马", country: "意大利", zone: "Europe/Rome" },
  { id: "europe-turin", city: "都灵", country: "意大利", zone: "Europe/Rome" },
  { id: "europe-bologna", city: "博洛尼亚", country: "意大利", zone: "Europe/Rome" },
  { id: "europe-barcelona", city: "巴塞罗那", country: "西班牙", zone: "Europe/Madrid" },
  { id: "europe-valencia", city: "瓦伦西亚", country: "西班牙", zone: "Europe/Madrid" },
  { id: "europe-zaragoza", city: "萨拉戈萨", country: "西班牙", zone: "Europe/Madrid" },
  { id: "europe-lisbon", city: "里斯本", country: "葡萄牙", zone: "Europe/Lisbon" },
  { id: "europe-porto", city: "波尔图", country: "葡萄牙", zone: "Europe/Lisbon" },
  { id: "europe-brussels", city: "布鲁塞尔", country: "比利时", zone: "Europe/Brussels" },
  { id: "europe-antwerp", city: "安特卫普", country: "比利时", zone: "Europe/Brussels" },
  { id: "europe-amsterdam", city: "阿姆斯特丹", country: "荷兰", zone: "Europe/Amsterdam" },
  { id: "europe-eindhoven", city: "埃因霍温", country: "荷兰", zone: "Europe/Amsterdam" },
  { id: "europe-zurich", city: "苏黎世", country: "瑞士", zone: "Europe/Zurich" },
  { id: "europe-geneva", city: "日内瓦", country: "瑞士", zone: "Europe/Zurich" },
  { id: "europe-vienna", city: "维也纳", country: "奥地利", zone: "Europe/Vienna" },
  { id: "europe-prague", city: "布拉格", country: "捷克", zone: "Europe/Prague" },
  { id: "europe-budapest", city: "布达佩斯", country: "匈牙利", zone: "Europe/Budapest" },
  { id: "europe-bucharest", city: "布加勒斯特", country: "罗马尼亚", zone: "Europe/Bucharest" },
  { id: "europe-sofia", city: "索非亚", country: "保加利亚", zone: "Europe/Sofia" },
  { id: "europe-athens", city: "雅典", country: "希腊", zone: "Europe/Athens" },
  { id: "europe-stockholm", city: "斯德哥尔摩", country: "瑞典", zone: "Europe/Stockholm" },
  { id: "europe-gothenburg", city: "哥德堡", country: "瑞典", zone: "Europe/Stockholm" },
  { id: "europe-oslo", city: "奥斯陆", country: "挪威", zone: "Europe/Oslo" },
  { id: "europe-copenhagen", city: "哥本哈根", country: "丹麦", zone: "Europe/Copenhagen" },
  { id: "europe-helsinki", city: "赫尔辛基", country: "芬兰", zone: "Europe/Helsinki" },
  { id: "europe-dublin", city: "都柏林", country: "爱尔兰", zone: "Europe/Dublin" },
  { id: "europe-kyiv", city: "基辅", country: "乌克兰", zone: "Europe/Kyiv" },
  { id: "europe-minsk", city: "明斯克", country: "白俄罗斯", zone: "Europe/Minsk" },
  { id: "europe-belgrade", city: "贝尔格莱德", country: "塞尔维亚", zone: "Europe/Belgrade" },
  { id: "europe-zagreb", city: "萨格勒布", country: "克罗地亚", zone: "Europe/Zagreb" },
  { id: "europe-ljubljana", city: "卢布尔雅那", country: "斯洛文尼亚", zone: "Europe/Ljubljana" },
  { id: "europe-bratislava", city: "布拉迪斯拉发", country: "斯洛伐克", zone: "Europe/Bratislava" },
  { id: "europe-vilnius", city: "维尔纽斯", country: "立陶宛", zone: "Europe/Vilnius" },
  { id: "europe-riga", city: "里加", country: "拉脱维亚", zone: "Europe/Riga" },
  { id: "europe-tallinn", city: "塔林", country: "爱沙尼亚", zone: "Europe/Tallinn" },
  { id: "europe-st-petersburg", city: "圣彼得堡", country: "俄罗斯", zone: "Europe/Moscow" },
  { id: "europe-yekaterinburg", city: "叶卡捷琳堡", country: "俄罗斯", zone: "Asia/Yekaterinburg" },
  { id: "asia-novosibirsk", city: "新西伯利亚", country: "俄罗斯", zone: "Asia/Novosibirsk" },
  { id: "america-washington", city: "华盛顿", country: "美国", zone: "America/New_York" },
  { id: "america-boston", city: "波士顿", country: "美国", zone: "America/New_York" },
  { id: "america-atlanta", city: "亚特兰大", country: "美国", zone: "America/New_York" },
  { id: "america-detroit", city: "底特律", country: "美国", zone: "America/Detroit" },
  { id: "america-dallas", city: "达拉斯", country: "美国", zone: "America/Chicago" },
  { id: "america-denver", city: "丹佛", country: "美国", zone: "America/Denver" },
  { id: "america-phoenix", city: "凤凰城", country: "美国", zone: "America/Phoenix" },
  { id: "america-seattle", city: "西雅图", country: "美国", zone: "America/Los_Angeles" },
  { id: "america-san-francisco", city: "旧金山", country: "美国", zone: "America/Los_Angeles" },
  { id: "america-san-jose", city: "圣何塞", country: "美国", zone: "America/Los_Angeles" },
  { id: "america-montreal", city: "蒙特利尔", country: "加拿大", zone: "America/Toronto" },
  { id: "america-ottawa", city: "渥太华", country: "加拿大", zone: "America/Toronto" },
  { id: "america-calgary", city: "卡尔加里", country: "加拿大", zone: "America/Edmonton" },
  { id: "america-edmonton", city: "埃德蒙顿", country: "加拿大", zone: "America/Edmonton" },
  { id: "america-winnipeg", city: "温尼伯", country: "加拿大", zone: "America/Winnipeg" },
  { id: "america-guadalajara", city: "瓜达拉哈拉", country: "墨西哥", zone: "America/Mexico_City" },
  { id: "america-monterrey", city: "蒙特雷", country: "墨西哥", zone: "America/Monterrey" },
  { id: "america-tijuana", city: "蒂华纳", country: "墨西哥", zone: "America/Tijuana" },
  { id: "america-panama", city: "巴拿马城", country: "巴拿马", zone: "America/Panama" },
  { id: "america-san-jose-cr", city: "圣何塞", country: "哥斯达黎加", zone: "America/Costa_Rica" },
  { id: "america-guatemala", city: "危地马拉城", country: "危地马拉", zone: "America/Guatemala" },
  { id: "america-santo-domingo", city: "圣多明各", country: "多米尼加", zone: "America/Santo_Domingo" },
  { id: "america-havana", city: "哈瓦那", country: "古巴", zone: "America/Havana" },
  { id: "america-kingston", city: "金斯敦", country: "牙买加", zone: "America/Jamaica" },
  { id: "america-medellin", city: "麦德林", country: "哥伦比亚", zone: "America/Bogota" },
  { id: "america-cali", city: "卡利", country: "哥伦比亚", zone: "America/Bogota" },
  { id: "america-quito", city: "基多", country: "厄瓜多尔", zone: "America/Guayaquil" },
  { id: "america-guayaquil", city: "瓜亚基尔", country: "厄瓜多尔", zone: "America/Guayaquil" },
  { id: "america-la-paz", city: "拉巴斯", country: "玻利维亚", zone: "America/La_Paz" },
  { id: "america-montevideo", city: "蒙得维的亚", country: "乌拉圭", zone: "America/Montevideo" },
  { id: "america-asuncion", city: "亚松森", country: "巴拉圭", zone: "America/Asuncion" },
  { id: "america-caracas", city: "加拉加斯", country: "委内瑞拉", zone: "America/Caracas" },
  { id: "america-cordoba", city: "科尔多瓦", country: "阿根廷", zone: "America/Argentina/Cordoba" },
  { id: "america-rosario", city: "罗萨里奥", country: "阿根廷", zone: "America/Argentina/Buenos_Aires" },
  { id: "america-brasilia", city: "巴西利亚", country: "巴西", zone: "America/Sao_Paulo" },
  { id: "america-curitiba", city: "库里蒂巴", country: "巴西", zone: "America/Sao_Paulo" },
  { id: "america-porto-alegre", city: "阿雷格里港", country: "巴西", zone: "America/Sao_Paulo" },
  { id: "america-recife", city: "累西腓", country: "巴西", zone: "America/Recife" },
  { id: "america-manaus", city: "马瑙斯", country: "巴西", zone: "America/Manaus" },
  { id: "america-valparaiso", city: "瓦尔帕莱索", country: "智利", zone: "America/Santiago" },
  { id: "america-arequipa", city: "阿雷基帕", country: "秘鲁", zone: "America/Lima" },
  { id: "africa-alexandria", city: "亚历山大", country: "埃及", zone: "Africa/Cairo" },
  { id: "africa-giza", city: "吉萨", country: "埃及", zone: "Africa/Cairo" },
  { id: "africa-durban", city: "德班", country: "南非", zone: "Africa/Johannesburg" },
  { id: "africa-pretoria", city: "比勒陀利亚", country: "南非", zone: "Africa/Johannesburg" },
  { id: "africa-accra", city: "阿克拉", country: "加纳", zone: "Africa/Accra" },
  { id: "africa-abidjan", city: "阿比让", country: "科特迪瓦", zone: "Africa/Abidjan" },
  { id: "africa-dakar", city: "达喀尔", country: "塞内加尔", zone: "Africa/Dakar" },
  { id: "africa-addis-ababa", city: "亚的斯亚贝巴", country: "埃塞俄比亚", zone: "Africa/Addis_Ababa" },
  { id: "africa-kampala", city: "坎帕拉", country: "乌干达", zone: "Africa/Kampala" },
  { id: "africa-dar-es-salaam", city: "达累斯萨拉姆", country: "坦桑尼亚", zone: "Africa/Dar_es_Salaam" },
  { id: "africa-luanda", city: "罗安达", country: "安哥拉", zone: "Africa/Luanda" },
  { id: "africa-maputo", city: "马普托", country: "莫桑比克", zone: "Africa/Maputo" },
  { id: "africa-tunis", city: "突尼斯", country: "突尼斯", zone: "Africa/Tunis" },
  { id: "africa-algiers", city: "阿尔及尔", country: "阿尔及利亚", zone: "Africa/Algiers" },
  { id: "africa-rabat", city: "拉巴特", country: "摩洛哥", zone: "Africa/Casablanca" },
  { id: "africa-marrakesh", city: "马拉喀什", country: "摩洛哥", zone: "Africa/Casablanca" },
  { id: "australia-adelaide", city: "阿德莱德", country: "澳大利亚", zone: "Australia/Adelaide" },
  { id: "australia-canberra", city: "堪培拉", country: "澳大利亚", zone: "Australia/Sydney" },
  { id: "australia-gold-coast", city: "黄金海岸", country: "澳大利亚", zone: "Australia/Brisbane" },
  { id: "australia-darwin", city: "达尔文", country: "澳大利亚", zone: "Australia/Darwin" },
  { id: "pacific-christchurch", city: "基督城", country: "新西兰", zone: "Pacific/Auckland" },
  { id: "pacific-suva", city: "苏瓦", country: "斐济", zone: "Pacific/Fiji" }
] satisfies WorldClockCity[];

function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    hourCycle: "h23"
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const zonedTime = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"), value("second"));

  return Math.round((zonedTime - date.getTime()) / 60000);
}

function formatUtcOffset(offsetMinutes: number) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;

  return minutes === 0 ? `UTC${sign}${hours}` : `UTC${sign}${hours}:${String(minutes).padStart(2, "0")}`;
}

function formatBeijingDifference(offsetMinutes: number, beijingOffsetMinutes: number) {
  const diffMinutes = offsetMinutes - beijingOffsetMinutes;
  if (diffMinutes === 0) return "与北京同区";

  const direction = diffMinutes > 0 ? "早" : "晚";
  const absolute = Math.abs(diffMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  const hourText = hours > 0 ? `${hours}小时` : "";
  const minuteText = minutes > 0 ? `${minutes}分钟` : "";

  return `比北京${direction}${hourText}${minuteText}`;
}

function isValidTimeZone(zone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

const themeOptions: ThemeKey[] = ["industrial", "clean-export", "premium-brand", "equipment", "consumer-goods"];
const roleOptions: RoleKey[] = ["super-admin", "admin", "editor", "sales", "viewer"];
const roleLabels: Record<RoleKey, string> = {
  "super-admin": "超级管理员",
  admin: "管理员",
  editor: "编辑",
  sales: "销售",
  viewer: "访客"
};
const leadStatuses: LeadStatus[] = ["new", "contacted", "quoted", "closed", "spam"];
const leadStatusLabels: Record<LeadStatus, string> = {
  new: "新询盘",
  contacted: "已联系",
  quoted: "已报价",
  closed: "已成交",
  spam: "垃圾询盘"
};
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
  { key: "seo", label: "SEO", description: "多语种索引、元信息和完整度检查。" },
  { key: "media", label: "媒体", description: "图片尺寸和媒体整理方式。" },
  { key: "permalinks", label: "固定链接", description: "产品、文章和资料的 URL 基础路径。" },
  { key: "privacy", label: "隐私", description: "隐私页面、Cookie 提示和数据说明。" },
  { key: "ai", label: "AI", description: "模型、API 和积分。" },
  { key: "translation", label: "翻译设置", description: "多语言自动翻译。" },
  { key: "backup", label: "备份导入", description: "按模块导入导出整站数据。" }
];
const defaultSettingsSections = settingsSections.map((item) => item.key);
const defaultRolePermissions: Record<RoleKey, AdminRolePermissions> = {
  "super-admin": {
    allowedTabs: defaultAllowedTabsByRole["super-admin"],
    settingsSections: defaultSettingsSections,
    articleImportEnabled: true
  },
  admin: {
    allowedTabs: defaultAllowedTabsByRole.admin,
    settingsSections: defaultSettingsSections,
    articleImportEnabled: true
  },
  editor: {
    allowedTabs: defaultAllowedTabsByRole.editor,
    settingsSections: [],
    articleImportEnabled: false
  },
  sales: {
    allowedTabs: defaultAllowedTabsByRole.sales,
    settingsSections: [],
    articleImportEnabled: false
  },
  viewer: {
    allowedTabs: defaultAllowedTabsByRole.viewer,
    settingsSections: [],
    articleImportEnabled: false
  }
};
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
  { key: "pageLayouts", label: "Puck 页面布局", description: "前台页面的 Puck 可视化区块、排序和发布状态。" },
  { key: "activeTheme", label: "主题", description: "当前前台主题。" },
  { key: "enabledLocales", label: "语言", description: "前台启用语言列表。" },
  { key: "users", label: "用户权限", description: "后台用户、角色、可访问页面和密码哈希。" },
  { key: "rolePermissions", label: "用户组权限", description: "各用户组的后台页面、设置子页面和功能权限。" },
  { key: "aiSettings", label: "AI 配置", description: "模型供应商、Base URL、API Key 和品牌语气。" },
  { key: "aiCreditSettings", label: "AI 积分设置", description: "积分扣减和价格规则。" },
  { key: "aiUsageRecords", label: "AI 消耗记录", description: "用户 AI 调用和积分消耗明细。" }
];
const sensitiveBackupSections = new Set<BackupSectionKey>(["users", "rolePermissions", "aiSettings", "aiCreditSettings", "aiUsageRecords"]);
const defaultBackupSections: BackupSectionKey[] = [
  "products",
  "pages",
  "articles",
  "contactChannels",
  "uploadedFiles",
  "navigation",
  "siteSettings",
  "templateSettings",
  "pageLayouts",
  "activeTheme",
  "enabledLocales"
];
const homeSectionOptions: { key: HomeSectionKey; label: string; description: string }[] = [
  { key: "navigation", label: "导航栏", description: "前台顶部品牌、菜单和语言入口。" },
  { key: "hero", label: "首页首屏", description: "首页首屏海报、标题、按钮和指标。" },
  { key: "products", label: "产品目录", description: "首页产品分类卡片模块。" },
  { key: "factory", label: "工厂能力", description: "几何、涂层、包装等能力说明。" },
  { key: "markets", label: "出口市场", description: "多语言与 RFQ 清单说明模块。" },
  { key: "articles", label: "技术文章", description: "首页文章卡片模块。" },
  { key: "rfq", label: "询盘表单", description: "首页底部报价表单模块。" }
];
const imageLayoutOptions: { key: SiteTemplateImageLayout; label: string }[] = [
  { key: "single", label: "单张大图" },
  { key: "split", label: "双图并排" },
  { key: "grid", label: "三列网格" },
  { key: "mosaic", label: "拼贴展示" },
  { key: "carousel", label: "图片轮播" }
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
const aiPurposeOptions: { key: AiContentPurpose; label: string; description: string }[] = [
  { key: "buying-guide", label: "采购指南", description: "面向采购商解释选型、询盘参数和供应商判断。" },
  { key: "product-application", label: "产品应用", description: "围绕产品使用场景、材料匹配和加工问题生成。" },
  { key: "service-intro", label: "服务介绍", description: "适合页面内容，说明 OEM、私标、包装和交付流程。" },
  { key: "faq-content", label: "FAQ 内容", description: "用常见问题形式解释买家关心的价格、交期和资料。" }
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
const aiImageProviderOptions = [
  { value: "openai", label: "OpenAI 图片生成", baseUrl: "https://api.openai.com/v1", models: ["gpt-image-1", "dall-e-3", "dall-e-2"] },
  { value: "siliconflow-image", label: "SiliconFlow 图片生成", baseUrl: "https://api.siliconflow.cn/v1", models: ["Kwai-Kolors/Kolors", "black-forest-labs/FLUX.1-schnell", "black-forest-labs/FLUX.1-dev", "stabilityai/stable-diffusion-3.5-large", "Qwen/Qwen-Image"] },
  { value: "qwen-cn-image", label: "阿里云百炼 Qwen 图片（中国）", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", models: ["qwen-image", "qwen-image-plus", "wanx2.1-t2i-turbo", "wanx2.1-t2i-plus"] },
  { value: "qwen-intl-image", label: "阿里云百炼 Qwen 图片（国际）", baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1", models: ["qwen-image", "qwen-image-plus", "wanx2.1-t2i-turbo", "wanx2.1-t2i-plus"] },
  { value: "volcengine-ark-image", label: "火山方舟图片生成", baseUrl: "https://ark.cn-beijing.volces.com/api/v3", models: ["doubao-seedream-4-0", "doubao-seedream-3-0-t2i", "doubao-seedream-3-0-t2i-250415"] },
  { value: "openai-compatible", label: "OpenAI-compatible 图片接口", baseUrl: "", models: ["gpt-image-1", "dall-e-3", "flux-kontext-pro", "imagen-4", "stable-diffusion-3.5-large", "qwen-image"] },
  { value: "custom", label: "自定义图片供应商", baseUrl: "", models: [] }
];
const aiVoiceProviderOptions = [
  { value: "openai", label: "OpenAI 语音", baseUrl: "https://api.openai.com/v1", models: ["gpt-4o-mini-tts", "tts-1", "tts-1-hd"] },
  { value: "openai-compatible", label: "OpenAI-compatible 语音接口", baseUrl: "", models: ["gpt-4o-mini-tts", "tts-1"] },
  { value: "custom", label: "自定义语音供应商", baseUrl: "", models: [] }
];
const customAiModelValue = "__custom_ai_model__";
const aiWriteModeOptions: { key: AiWriteMode; label: string; description: string }[] = [
  { key: "new", label: "新建草稿", description: "创建新的文章或页面，保留现有内容。" },
  { key: "replace", label: "替换目标", description: "用生成内容覆盖所选文章或页面。" },
  { key: "append", label: "追加正文", description: "保留标题摘要，把生成正文追加到目标末尾。" }
];
const aiSectionOptions: { key: AiContentSectionKey; label: string; description: string }[] = [
  { key: "buyer-intent", label: "买家需求", description: "说明采购商搜索这个主题时真正想确认什么。" },
  { key: "product-fit", label: "产品匹配", description: "说明产品、材料、工况、服务能力如何匹配。" },
  { key: "rfq-checklist", label: "RFQ 清单", description: "列出询价时必须提供的规格、数量、包装等信息。" },
  { key: "faq", label: "FAQ", description: "用问答形式覆盖价格、交期、样品、定制等疑问。" },
  { key: "cta", label: "行动引导", description: "引导买家提交图纸、规格清单或询盘信息。" }
];
const aiWorkbenchSections: { key: AiWorkbenchSection; label: string; description: string }[] = [
  { key: "generate", label: "生成", description: "生成文章或页面内容。" }
];
const aiWizardStepOptions: { key: AiWizardStep; label: string }[] = [
  { key: 1, label: "内容类型" },
  { key: 2, label: "生成目的" },
  { key: 3, label: "主题标题" },
  { key: 4, label: "内容结构" },
  { key: 5, label: "生成写入" }
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
  summaryEn: "",
  seoTitleZh: "",
  seoTitleEn: "",
  seoDescriptionZh: "",
  seoDescriptionEn: "",
  seoOgImageUrl: "",
  seoCanonicalUrl: "",
  seoIndexable: true
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
  purpose: "buying-guide",
  topic: "",
  selectedTitle: "",
  audience: "",
  category: "",
  sections: ["buyer-intent", "product-fit", "rfq-checklist", "faq", "cta"]
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
    summaryEn: product.summary.en,
    seoTitleZh: product.seo?.title?.zh ?? "",
    seoTitleEn: product.seo?.title?.en ?? "",
    seoDescriptionZh: product.seo?.description?.zh ?? "",
    seoDescriptionEn: product.seo?.description?.en ?? "",
    seoOgImageUrl: product.seo?.ogImageUrl ?? "",
    seoCanonicalUrl: product.seo?.canonicalUrl ?? "",
    seoIndexable: product.seo?.indexable ?? true
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

function pickLocalizedText(value?: Partial<Record<LocaleCode, string>> | Translation<string>, preferredLocale?: LocaleCode) {
  if (!value) return "";

  if (preferredLocale) {
    const preferredRawValue = value[preferredLocale];
    if (preferredRawValue?.trim()) return preferredRawValue;
  }

  const zhValue = value.zh?.trim();
  if (zhValue) return value.zh ?? "";

  const enValue = value.en?.trim();
  if (enValue) return value.en ?? "";

  return preferredLocale ? value[preferredLocale] ?? value.zh ?? value.en ?? "" : value.zh ?? value.en ?? "";
}

function encodeMailtoValue(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

function videoMarkdownBlock(url: string, title = "Video") {
  return `@[video:${title || "Video"}](${url})`;
}

function parseVideoMarkdownBlock(block: string) {
  const explicitVideoMatch = /^@\[video(?::([^\]]+))?]\(([^)]+)\)$/i.exec(block.trim());
  const linkedVideoMatch = /^\[(?:视频|Video|影片|播放视频)(?::\s*)?([^\]]*)]\(([^)]+)\)$/i.exec(block.trim());
  const bareVideoUrlMatch = /^(https?:\/\/\S+)$/.exec(block.trim());
  const title = explicitVideoMatch?.[1] || linkedVideoMatch?.[1] || "Video";
  const url = explicitVideoMatch?.[2] || linkedVideoMatch?.[2] || bareVideoUrlMatch?.[1] || "";

  if (!url) return null;
  if (!/(youtu\.be|youtube\.com|vimeo\.com|bilibili\.com|tiktok\.com|facebook\.com|fb\.watch|instagram\.com|\.(mp4|webm|ogg|mov)(\?.*)?$)/i.test(url)) return null;

  return { title, url };
}

function markdownToEditableHtml(body: string) {
  const blocks = body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  if (blocks.length === 0) return "";

  return blocks.map((block) => {
    const imageMatch = /^!\[([^\]]*)]\(([^)]+)\)$/.exec(block);
    const legacyImageMatch = /^\[下载文件：([^\]]+)]\(([^)]+)\)$/.exec(block);
    const videoMatch = parseVideoMarkdownBlock(block);

    if (videoMatch) {
      return `<figure class="article-video-embed article-video-placeholder" contenteditable="false" data-video-url="${escapeEditableHtml(videoMatch.url)}" data-video-title="${escapeEditableHtml(videoMatch.title)}" title="双击替换视频链接"><div class="article-video-frame"><span>视频</span></div></figure><p class="article-after-video-caret"><br></p>`;
    }

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
    const videoUrl = node.getAttribute("data-video-url");
    if (videoUrl) return videoMarkdownBlock(videoUrl, node.getAttribute("data-video-title") ?? "Video");
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

function mergeSeoTranslation(en: string, zh: string) {
  const titleEn = en.trim();
  const titleZh = zh.trim();
  if (!titleEn && !titleZh) return undefined;
  return { en: titleEn || titleZh, zh: titleZh || titleEn };
}

function hasLocaleText(value: Partial<Record<LocaleCode, string>> | undefined, locale: LocaleCode) {
  return Boolean(value?.[locale]?.trim());
}

function hasLocaleList(value: Partial<Record<LocaleCode, string[]>> | undefined, locale: LocaleCode) {
  return Array.isArray(value?.[locale]) && (value?.[locale]?.length ?? 0) > 0;
}

function countSeoIssues(state: AdminState) {
  let missingMetadata = 0;
  let fallbackLocales = 0;
  let noindexItems = 0;
  let missingImages = 0;

  state.products.forEach((product) => {
    if (!product.seo?.title?.en || !product.seo?.description?.en) missingMetadata += 1;
    if (product.seo?.indexable === false) noindexItems += 1;
    if (!product.imageUrl && !product.seo?.ogImageUrl) missingImages += 1;
    state.enabledLocales.forEach((locale) => {
      if (!hasLocaleText(product.name, locale) || !hasLocaleText(product.summary, locale) || !hasLocaleList(product.applications, locale)) fallbackLocales += 1;
    });
  });

  state.articles.filter((article) => article.status === "published").forEach((article) => {
    if (!article.seo?.title?.en || !article.seo?.description?.en) missingMetadata += 1;
    if (article.seo?.indexable === false) noindexItems += 1;
    if (!article.coverImageUrl && !article.seo?.ogImageUrl) missingImages += 1;
    state.enabledLocales.forEach((locale) => {
      if (!hasLocaleText(article.title, locale) || !hasLocaleText(article.excerpt, locale) || (article.body && !hasLocaleText(article.body, locale))) fallbackLocales += 1;
    });
  });

  state.pages.filter((page) => page.status === "published").forEach((page) => {
    if (!page.seo?.title?.en || !page.seo?.description?.en) missingMetadata += 1;
    if (page.seo?.indexable === false) noindexItems += 1;
    state.enabledLocales.forEach((locale) => {
      if (!hasLocaleText(page.title, locale) || !hasLocaleText(page.excerpt, locale) || !hasLocaleText(page.body, locale)) fallbackLocales += 1;
    });
  });

  return { missingMetadata, fallbackLocales, noindexItems, missingImages };
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

const PRODUCT_SUMMARY_PREVIEW_LIMIT = 120;

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

function productParentWouldCreateCycle(products: ProductCategory[], productId: string, nextParentId?: string) {
  if (!nextParentId) return false;
  if (nextParentId === productId) return true;

  const parentById = new Map<string, string | undefined>(products.map((product) => [getProductId(product), product.parentId]));
  const visited = new Set([productId]);
  let currentParentId: string | undefined = nextParentId;

  while (currentParentId) {
    if (visited.has(currentParentId)) return true;
    visited.add(currentParentId);
    currentParentId = parentById.get(currentParentId);
  }

  return false;
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

function getRolePermissions(role: RoleKey, rolePermissions?: AdminState["rolePermissions"]) {
  const fallback = defaultRolePermissions[role] ?? defaultRolePermissions.viewer;
  const current = rolePermissions?.[role];
  const allowedTabs = current?.allowedTabs?.filter((item): item is Tab => tabKeys.has(item as Tab) && item !== "account") ?? fallback.allowedTabs;
  const settingsSectionSet = new Set<SettingsSection>(defaultSettingsSections);
  const settingsSectionsForRole = current?.settingsSections?.filter((item): item is SettingsSection => settingsSectionSet.has(item as SettingsSection)) ?? fallback.settingsSections ?? [];

  return {
    allowedTabs: allowedTabs.length > 0 ? allowedTabs : ["overview"],
    settingsSections: settingsSectionsForRole,
    articleImportEnabled: current?.articleImportEnabled ?? fallback.articleImportEnabled ?? false
  };
}

function getAllowedTabsForUser(user?: AdminUser, rolePermissions?: AdminState["rolePermissions"]) {
  const role = user?.role ?? "viewer";
  const roleConfig = getRolePermissions(role, rolePermissions);
  return roleConfig.allowedTabs;
}

function getAllowedSettingsSectionsForUser(user?: AdminUser, rolePermissions?: AdminState["rolePermissions"]) {
  const role = user?.role ?? "viewer";
  const roleConfig = getRolePermissions(role, rolePermissions);
  return roleConfig.settingsSections.length > 0 ? roleConfig.settingsSections : [];
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
  const [leadStatusFilter, setLeadStatusFilter] = useState<"all" | LeadStatus>("all");
  const [leadQuery, setLeadQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>([]);
  const [expandedProductDescriptionIds, setExpandedProductDescriptionIds] = useState<string[]>([]);
  const [quickEditingProductId, setQuickEditingProductId] = useState<string | null>(null);
  const [quickEditingProductName, setQuickEditingProductName] = useState("");
  const [inlineEditingProduct, setInlineEditingProduct] = useState<ProductInlineEditState | null>(null);
  const [productBulkAction, setProductBulkAction] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>("all");
  const [mediaTimeFilter, setMediaTimeFilter] = useState<MediaTimeFilter>("all");
  const [mediaQuery, setMediaQuery] = useState("");
  const [mediaPickerTarget, setMediaPickerTarget] = useState<VideoDialogTarget | null>(null);
  const [videoDialogTarget, setVideoDialogTarget] = useState<VideoDialogTarget | null>(null);
  const [videoDialogUrl, setVideoDialogUrl] = useState("");
  const [replacingArticleVideoUrl, setReplacingArticleVideoUrl] = useState<string | null>(null);
  const [mailDraftLeadId, setMailDraftLeadId] = useState<string | null>(null);
  const [mailTestTo, setMailTestTo] = useState("");
  const [mailActionStatus, setMailActionStatus] = useState("");
  const [mailActionRunning, setMailActionRunning] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormState>(() => createContactForm());
  const [newUserForm, setNewUserForm] = useState<NewUserFormState>(emptyNewUserForm);
  const [expandedRolePermissionId, setExpandedRolePermissionId] = useState<RoleKey | null>("admin");
  const [expandedUserPermissionsId, setExpandedUserPermissionsId] = useState<string | null>(null);
  const [resetUserPasswords, setResetUserPasswords] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [accountPassword, setAccountPassword] = useState({ current: "", next: "", confirm: "" });
  const [frontendSettingsDirty, setFrontendSettingsDirty] = useState(false);
  const [newHeroSlideUrl, setNewHeroSlideUrl] = useState("");
  const [customImageUrlDrafts, setCustomImageUrlDrafts] = useState<Record<string, string>>({});
  const [templateEditorMode, setTemplateEditorMode] = useState<TemplateEditorMode>("form");
  const [templateVisualFullscreen, setTemplateVisualFullscreen] = useState(false);
  const [visualEditingKey, setVisualEditingKey] = useState<string | null>(null);
  const [visualDraftValue, setVisualDraftValue] = useState("");
  const [visualBuilderDevice, setVisualBuilderDevice] = useState<VisualBuilderDevice>("desktop");
  const [visualBuilderSidebarTab, setVisualBuilderSidebarTab] = useState<VisualBuilderSidebarTab>("properties");
  const [selectedVisualModuleId, setSelectedVisualModuleId] = useState<string>("hero");
  const [visualDraggingModuleId, setVisualDraggingModuleId] = useState<string | null>(null);
  const [visualDropTarget, setVisualDropTarget] = useState<string | null>(null);
  const [aiContentForm, setAiContentForm] = useState<AiContentFormState>(emptyAiContentForm);
  const [aiWorkbenchSection, setAiWorkbenchSection] = useState<AiWorkbenchSection>("generate");
  const [aiWizardStep, setAiWizardStep] = useState<AiWizardStep>(1);
  const [aiDraftPreview, setAiDraftPreview] = useState<AiContentDraft | null>(null);
  const [aiTitleSuggestions, setAiTitleSuggestions] = useState<Article["title"][]>([]);
  const [aiGenerateStatus, setAiGenerateStatus] = useState("按步骤选择内容类型、目的、主题和结构后生成预览。");
  const [aiGeneratedImage, setAiGeneratedImage] = useState<AiGeneratedImage | null>(null);
  const [aiImageStatus, setAiImageStatus] = useState("");
  const [collectorForm, setCollectorForm] = useState<CollectorFormState>(emptyCollectorForm);
  const [collectorDraft, setCollectorDraft] = useState<AiContentDraft | null>(null);
  const [collectorStatus, setCollectorStatus] = useState("");
  const [aiTestStatus, setAiTestStatus] = useState("");
  const [translationScope, setTranslationScope] = useState<TranslationScope>("all");
  const [translationSourceLocale, setTranslationSourceLocale] = useState<TranslationSourceChoice>("auto");
  const [translationTargetLocale, setTranslationTargetLocale] = useState<TranslationTargetChoice>("en");
  const [translationOverwrite, setTranslationOverwrite] = useState(false);
  const [translationStatus, setTranslationStatus] = useState("");
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("general");
  const [backupSections, setBackupSections] = useState<BackupSectionKey[]>(defaultBackupSections);
  const [backupIncludeFiles, setBackupIncludeFiles] = useState(false);
  const [backupImportSections, setBackupImportSections] = useState<BackupSectionKey[]>(defaultBackupSections);
  const [backupImportFiles, setBackupImportFiles] = useState(false);
  const [backupStatus, setBackupStatus] = useState("选择要导出的数据模块，生成 JSON 后可用于恢复。");
  const [clockNow, setClockNow] = useState<Date | null>(null);
  const [worldClockForm, setWorldClockForm] = useState({ city: "", country: "", zone: "" });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const articleMarkdownEditorRef = useRef<AdminMarkdownEditorHandle | null>(null);
  const pageMarkdownEditorRef = useRef<AdminMarkdownEditorHandle | null>(null);
  const visualEditorRef = useRef<HTMLDivElement | null>(null);
  const visualEditorInputRef = useRef(false);
  const visualEditorArticleKeyRef = useRef("");
  const backupImportInputRef = useRef<HTMLInputElement | null>(null);
  const activeThemeKey = state?.activeTheme;
  const activeArticle = state?.articles.find((article) => (article.id ?? article.slug) === activeArticleId)
    ?? state?.articles.find((article) => article.status !== "trash")
    ?? state?.articles[0];
  const activeArticleIndex = state && activeArticle ? state.articles.findIndex((article) => (article.id ?? article.slug) === (activeArticle.id ?? activeArticle.slug)) : -1;
  const activeArticleKey = activeArticle ? activeArticle.id ?? activeArticle.slug : "";
  const activeArticleBody = pickLocalizedText(activeArticle?.body, locale);
  const activePage = state?.pages.find((page) => (page.id ?? page.slug) === activePageId)
    ?? state?.pages.find((page) => page.status !== "trash")
    ?? state?.pages[0];
  const activePageIndex = state && activePage ? state.pages.findIndex((page) => (page.id ?? page.slug) === (activePage.id ?? activePage.slug)) : -1;

  useEffect(() => {
    setTab(normalizeInitialTab(initialTab));
  }, [initialTab]);

  useEffect(() => {
    const isAiSurface = tab === "ai" || (tab === "settings" && settingsSection === "ai");
    if (!isAiSurface && aiTestStatus) setAiTestStatus("");
  }, [tab, settingsSection, aiTestStatus]);

  useEffect(() => {
    if (!state || tab !== "settings") return;
    const allowedSections = getAllowedSettingsSectionsForUser(getCurrentUser(), state.rolePermissions);
    if (allowedSections.length > 0 && !allowedSections.includes(settingsSection)) {
      setSettingsSection(allowedSections[0] as SettingsSection);
    }
  }, [state, tab, settingsSection]);

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
    const articleChanged = visualEditorArticleKeyRef.current !== activeArticleKey;
    visualEditorArticleKeyRef.current = activeArticleKey;
    if (visualEditorInputRef.current && !articleChanged && editor.innerHTML.trim()) {
      visualEditorInputRef.current = false;
      return;
    }
    visualEditorInputRef.current = false;
    const nextHtml = markdownToEditableHtml(activeArticleBody);
    if (editor.innerHTML !== nextHtml) editor.innerHTML = nextHtml;
  }, [activeArticleKey, activeArticleBody, articleEditorView]);

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

  const activeWorldClockCities = useMemo(() => {
    const configuredCities = state?.siteSettings.worldClockCities;
    const sourceCities = configuredCities && configuredCities.length > 0 ? configuredCities : worldClockCities;
    return sourceCities.filter((city) => city.city.trim() && city.country.trim() && isValidTimeZone(city.zone));
  }, [state?.siteSettings.worldClockCities]);

  const worldClocks = useMemo(() => {
    if (!clockNow) return activeWorldClockCities.map((item) => ({ ...item, time: "--:--", date: "--", offset: "--", beijingDiff: "--" }));

    const beijingOffset = getTimeZoneOffsetMinutes(clockNow, "Asia/Shanghai");

    return activeWorldClockCities.map((item) => {
      const offsetMinutes = getTimeZoneOffsetMinutes(clockNow, item.zone);

      return {
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
        }).format(clockNow),
        offset: formatUtcOffset(offsetMinutes),
        beijingDiff: formatBeijingDifference(offsetMinutes, beijingOffset)
      };
    });
  }, [activeWorldClockCities, clockNow]);

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

  async function discardTemplateVisualEdits() {
    setStatus("正在放弃未保存编辑...");
    const response = await fetch("/api/admin/state");
    if (!response.ok) {
      setStatus("放弃编辑失败：请检查登录状态");
      return;
    }
    const payload = (await response.json()) as AdminState;
    const sessionUser = payload.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? payload.users[0];
    setState(payload);
    setCurrentUserId(sessionUser?.id ?? null);
    setFrontendSettingsDirty(false);
    setSelectedVisualModuleId("hero");
    setVisualDropTarget(null);
    setVisualDraggingModuleId(null);
    setTemplateVisualFullscreen(false);
    setTemplateEditorMode("form");
    applyThemeToDocument(payload.activeTheme);
    applySiteFontToDocument(payload.siteSettings.fontFamily);
    setStatus("已放弃未保存编辑");
  }

  function openTemplateVisualEditor() {
    setTemplateEditorMode("visual");
    setTemplateVisualFullscreen(true);
    window.setTimeout(() => {
      document.querySelector(".template-visual-editor-shell")?.scrollIntoView({ block: "start", behavior: "smooth" });
    }, 40);
  }

  function openTemplateFormEditor() {
    setTemplateVisualFullscreen(false);
    setTemplateEditorMode("form");
    window.setTimeout(() => {
      document.querySelector(".template-builder-panel")?.scrollIntoView({ block: "start", behavior: "smooth" });
    }, 40);
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
    if (!user) return false;
    if (frontendManagerRoles.has(user.role)) return true;
    const permissions = getRolePermissions(user.role, sourceState?.rolePermissions);
    return permissions.allowedTabs.some((item) => ["navigation", "templates", "settings", "languages", "themes", "ai"].includes(item));
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

  function addWorldClockCity() {
    const selectedCity = worldClockCityCatalog.find((city) => city.id === worldClockForm.city);

    if (!worldClockForm.country || !selectedCity) {
      setStatus("请先选择国家/地区和城市");
      return;
    }
    if (activeWorldClockCities.some((city) => city.id === selectedCity.id || (city.country === selectedCity.country && city.city === selectedCity.city && city.zone === selectedCity.zone))) {
      setStatus(`${selectedCity.country} ${selectedCity.city} 已经在世界时钟中`);
      return;
    }

    const nextCity: WorldClockCity = {
      ...selectedCity,
      custom: true
    };
    updateSiteSettings({ worldClockCities: [...activeWorldClockCities, nextCity] });
    setWorldClockForm({ city: "", country: "", zone: "" });
    setStatus("城市已添加，点击保存发布后生效");
  }

  function removeWorldClockCity(cityId: string) {
    const nextCities = activeWorldClockCities.filter((city) => city.id !== cityId);
    updateSiteSettings({ worldClockCities: nextCities.length > 0 ? nextCities : worldClockCities });
    setStatus("城市已删除，点击保存发布后生效");
  }

  async function copyTextToClipboard(value: string, successMessage: string) {
    const text = value.trim();
    if (!text) {
      setStatus("没有可复制的内容");
      return;
    }

    const copyWithSelection = () => {
      let copiedByEvent = false;
      const handleCopy = (event: ClipboardEvent) => {
        event.clipboardData?.setData("text/plain", text);
        event.preventDefault();
        copiedByEvent = true;
      };

      document.addEventListener("copy", handleCopy);
      const eventCopied = document.execCommand("copy");
      document.removeEventListener("copy", handleCopy);
      if (eventCopied || copiedByEvent) return true;

      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.top = "-1000px";
      textarea.style.left = "-1000px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      try {
        return document.execCommand("copy");
      } catch {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    };

    if (copyWithSelection()) {
      setStatus(successMessage);
      return;
    }

    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(text);
      setStatus(successMessage);
    } catch {
      setStatus(successMessage);
    }
  }

  function formatLeadForCopy(lead: AdminState["leads"][number]) {
    return [
      `姓名：${lead.fullName || "未填写姓名"}`,
      `公司：${lead.company || "No company"}`,
      `产品：${lead.productType || "No product"}`,
      `数量：${lead.quantity || "No quantity"}`,
      `邮箱：${lead.email || "No email"}`,
      `WhatsApp / Phone：${lead.whatsapp || "No WhatsApp / Phone"}`,
      `目的地：${lead.destination || "No destination"}`,
      `材料：${lead.workpieceMaterial || "No material"}`,
      `状态：${lead.status}`,
      `时间：${new Date(lead.createdAt).toLocaleString()}`,
      lead.message ? `留言：${lead.message}` : ""
    ].filter(Boolean).join("\n");
  }

  function buildLeadReplyDraft(lead: AdminState["leads"][number]) {
    const subject = `Re: ${lead.productType || "RFQ"} inquiry`;
    const template = state?.siteSettings.mailReplyTemplate || "Hello {name},\n\nThank you for your RFQ about {productType}. We will follow up soon.\n\nBest regards,\n{siteTitle}";
    const body = template
      .replaceAll("{name}", lead.fullName || "there")
      .replaceAll("{company}", lead.company || "")
      .replaceAll("{productType}", lead.productType || "your tooling request")
      .replaceAll("{quantity}", lead.quantity || "")
      .replaceAll("{email}", lead.email || "")
      .replaceAll("{siteTitle}", state?.siteSettings.title || "KeyproTools");

    return { subject, body };
  }

  function buildLeadReplyMailto(lead: AdminState["leads"][number]) {
    const { subject, body } = buildLeadReplyDraft(lead);
    const cc = state?.siteSettings.mailFromEmail?.trim();
    const ccPart = cc ? `&cc=${encodeMailtoValue(cc)}` : "";

    return `mailto:${encodeURIComponent(lead.email)}?subject=${encodeMailtoValue(subject)}&body=${encodeMailtoValue(body)}${ccPart}`;
  }

  function openLeadMailDraft(lead: AdminState["leads"][number]) {
    setMailDraftLeadId(lead.id);
    switchAdminTab("mail");
    setStatus("已将询盘信息带入邮件草稿");
  }

  async function sendMailRequest(path: "/api/admin/mail/test" | "/api/admin/mail/send", body: Record<string, unknown>) {
    if (!state) return;
    setMailActionRunning(true);
    setMailActionStatus("正在保存邮件设置...");
    await save();
    setMailActionStatus("正在发送邮件...");

    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = await response.json().catch(() => ({ message: "邮件请求失败" })) as MailActionResponse;
      const message = payload.message || payload.error || "邮件请求完成";

      if (payload.state) setState(payload.state);
      setMailActionStatus(message);
      setStatus(message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "邮件请求失败";
      setMailActionStatus(message);
      setStatus(message);
    } finally {
      setMailActionRunning(false);
    }
  }

  function sendTestMail() {
    void sendMailRequest("/api/admin/mail/test", { to: mailTestTo.trim() });
  }

  function sendSelectedLeadMail() {
    if (!selectedMailLead || !selectedMailDraft) {
      setMailActionStatus("请先从询盘列表选择一条可回复的询盘。");
      return;
    }

    void sendMailRequest("/api/admin/mail/send", {
      leadId: selectedMailLead.id,
      to: selectedMailLead.email,
      subject: selectedMailDraft.subject,
      body: selectedMailDraft.body
    });
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

  function updateUserArticleImportPermission(userId: string, checked: boolean) {
    if (!state) return;
    setState({
      ...state,
      users: state.users.map((user) => (
        user.id === userId ? { ...user, articleImportEnabled: checked } : user
      ))
    });
  }

  function updateUserAllowedTab(userId: string, tabKey: Tab, checked: boolean) {
    if (!state) return;
    const targetUser = state.users.find((user) => user.id === userId);
    const current = new Set(getAllowedTabsForUser(targetUser, state.rolePermissions));
    if (checked) current.add(tabKey);
    else current.delete(tabKey);
    if (current.size === 0) current.add("overview");

    setState({
      ...state,
      users: state.users.map((user) => (
        user.id === userId ? { ...user, allowedTabs: Array.from(current) } : user
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

  function selectAiImageProvider(provider: string) {
    if (!state) return;
    const option = aiImageProviderOptions.find((item) => item.value === provider);
    const currentProviderOption = aiImageProviderOptions.find((item) => item.value === state.aiSettings.imageProvider);
    const shouldReplaceBaseUrl = !state.aiSettings.imageBaseUrl || state.aiSettings.imageBaseUrl === currentProviderOption?.baseUrl;

    updateAiSettings({
      imageProvider: provider,
      imageBaseUrl: shouldReplaceBaseUrl ? option?.baseUrl ?? "" : state.aiSettings.imageBaseUrl,
      imageModel: option?.models[0] ?? state.aiSettings.imageModel
    });
  }

  function selectAiVoiceProvider(provider: string) {
    if (!state) return;
    const option = aiVoiceProviderOptions.find((item) => item.value === provider);
    const currentProviderOption = aiVoiceProviderOptions.find((item) => item.value === state.aiSettings.voiceProvider);
    const shouldReplaceBaseUrl = !state.aiSettings.voiceBaseUrl || state.aiSettings.voiceBaseUrl === currentProviderOption?.baseUrl;

    updateAiSettings({
      voiceProvider: provider,
      voiceBaseUrl: shouldReplaceBaseUrl ? option?.baseUrl ?? "" : state.aiSettings.voiceBaseUrl,
      voiceModel: option?.models[0] ?? state.aiSettings.voiceModel
    });
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
    const nextTargetLocales = translationTargetLocale === "all" ? undefined : [translationTargetLocale];
    setTranslationStatus("正在请求 AI 翻译...");
    setStatus("正在自动翻译...");

    try {
      const response = await fetch("/api/admin/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          scope: nextScope,
          targetId,
          sourceLocale: translationSourceLocale,
          targetLocales: nextTargetLocales,
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

  function getNextTemplateModuleOrder(afterOrder?: number) {
    if (!state) return 60;
    if (typeof afterOrder === "number" && Number.isFinite(afterOrder)) return afterOrder + 5;
    const fixedOrders = homeSectionOptions.map((section) => state.templateSettings.sectionOrder[section.key]);
    const customOrders = state.templateSettings.customBlocks.map((block) => block.order);
    return Math.max(0, ...fixedOrders, ...customOrders) + 10;
  }

  function getTemplateModuleSortItems(sourceState = state, options?: { visibleOnly?: boolean }) {
    if (!sourceState) return [];
    return [
      ...homeSectionOptions
        .filter((section) => !options?.visibleOnly || sourceState.templateSettings.visibleSections[section.key])
        .map((section) => ({
          id: section.key,
          kind: "section" as const,
          order: sourceState.templateSettings.sectionOrder[section.key]
        })),
      ...sourceState.templateSettings.customBlocks
        .filter((block) => !options?.visibleOnly || block.enabled)
        .map((block) => ({
          id: block.id,
          kind: "custom" as const,
          order: block.order
        }))
    ].sort((a, b) => a.order - b.order);
  }

  function reorderTemplateModules(sourceModuleId: string, targetModuleId: string, placement: "before" | "after") {
    if (!state || !guardFrontendSettingsAccess() || sourceModuleId === targetModuleId) return;
    const modules = getTemplateModuleSortItems(state, { visibleOnly: true });
    const sourceIndex = modules.findIndex((module) => module.id === sourceModuleId);
    const targetIndex = modules.findIndex((module) => module.id === targetModuleId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextModules = modules.filter((module) => module.id !== sourceModuleId);
    const adjustedTargetIndex = nextModules.findIndex((module) => module.id === targetModuleId);
    if (adjustedTargetIndex < 0) return;
    const insertIndex = placement === "before" ? adjustedTargetIndex : adjustedTargetIndex + 1;
    nextModules.splice(insertIndex, 0, modules[sourceIndex]);

    const nextSectionOrder = { ...state.templateSettings.sectionOrder };
    const nextCustomBlocks = state.templateSettings.customBlocks.map((block) => ({ ...block }));
    nextModules.forEach((module, index) => {
      const nextOrder = (index + 1) * 10;
      if (module.kind === "section") {
        nextSectionOrder[module.id as HomeSectionKey] = nextOrder;
        return;
      }
      const customBlock = nextCustomBlocks.find((block) => block.id === module.id);
      if (customBlock) customBlock.order = nextOrder;
    });

    updateTemplateSettings({
      sectionOrder: nextSectionOrder,
      customBlocks: nextCustomBlocks
    });
    setSelectedVisualModuleId(sourceModuleId);
    setStatus("模块顺序已更新，点击保存模板生效");
  }

  function setTemplateModuleOrder(moduleId: string, order: number) {
    if (!state || !guardFrontendSettingsAccess()) return;
    const nextOrder = Number.isFinite(order) ? order : getNextTemplateModuleOrder();
    if (homeSectionOptions.some((section) => section.key === moduleId)) {
      updateTemplateSettings({
        sectionOrder: {
          ...state.templateSettings.sectionOrder,
          [moduleId]: nextOrder
        }
      });
      return;
    }

    updateTemplateSettings({
      customBlocks: state.templateSettings.customBlocks.map((block) => (
        block.id === moduleId ? { ...block, order: nextOrder } : block
      ))
    });
  }

  function updateCustomTemplateBlock(blockId: string, patch: Partial<SiteTemplateCustomBlock>) {
    if (!state || !guardFrontendSettingsAccess()) return;
    updateTemplateSettings({
      customBlocks: state.templateSettings.customBlocks.map((block) => (
        block.id === blockId ? { ...block, ...patch } : block
      ))
    });
  }

  function addCustomTemplateBlock(type: SiteTemplateCustomBlockType, afterOrder?: number) {
    if (!state || !guardFrontendSettingsAccess()) return;
    const labels: Record<SiteTemplateCustomBlockType, string> = {
      text: "自定义文字模块",
      image: "自定义图片模块",
      video: "自定义视频模块",
      cta: "行动按钮模块"
    };
    const bodyLabels: Record<SiteTemplateCustomBlockType, string> = {
      text: "双击这里编辑正文内容。",
      image: "双击标题、说明或图片区域进行编辑。",
      video: "粘贴 YouTube、Vimeo、Bilibili 或 MP4 视频链接。",
      cta: "引导访客提交询盘或查看产品目录。"
    };
    const fallbackMediaUrl = type === "image" ? (heroImageFiles[0]?.url ?? "/assets/current-template/hero-tooling-range.jpg") : "";
    const fallbackImageItem: SiteTemplateImageItem | undefined = type === "image" ? {
      id: `custom-image-${Date.now()}`,
      url: fallbackMediaUrl,
      alt: { en: labels[type], zh: labels[type] },
      caption: { en: "", zh: "" },
      enabled: true,
      order: 10
    } : undefined;
    const nextBlock: SiteTemplateCustomBlock = {
      id: `custom-block-${Date.now()}`,
      type,
      eyebrow: {
        en: type === "image" ? "Image" : type === "video" ? "Video" : type === "cta" ? "Action" : "Custom section",
        zh: type === "image" ? "图片" : type === "video" ? "视频" : type === "cta" ? "行动" : "自定义模块"
      },
      title: { en: labels[type], zh: labels[type] },
      body: { en: bodyLabels[type], zh: bodyLabels[type] },
      mediaUrl: fallbackMediaUrl,
      imageItems: fallbackImageItem ? [fallbackImageItem] : undefined,
      imageLayout: "single",
      imageCarouselAutoplay: true,
      imageCarouselIntervalSeconds: 5,
      buttonLabel: { en: type === "cta" ? "Send inquiry" : "Learn more", zh: type === "cta" ? "发送询盘" : "了解更多" },
      linkUrl: type === "cta" ? "#rfq" : "",
      openInNewTab: false,
      align: type === "cta" ? "center" : "left",
      layout: type === "image" || type === "video" ? "media-left" : "stacked",
      theme: type === "cta" ? "dark" : "light",
      spacing: "normal",
      enabled: true,
      order: getNextTemplateModuleOrder(afterOrder)
    };

	    updateTemplateSettings({
	      customBlocks: [...state.templateSettings.customBlocks, nextBlock]
	    });
	    setSelectedVisualModuleId(nextBlock.id);
	    setVisualBuilderSidebarTab("properties");
	    setStatus("已添加自定义模块，编辑后点击保存模板生效");
	  }

  function getCustomBlockImages(block: SiteTemplateCustomBlock) {
    const items = (block.imageItems ?? [])
      .filter((item) => item.enabled && item.url.trim())
      .sort((a, b) => a.order - b.order);

    if (items.length > 0) return items;
    if (!block.mediaUrl) return [];

    return [{
      id: `${block.id}-fallback-image`,
      url: block.mediaUrl,
      alt: block.title,
      caption: { en: "", zh: "" },
      enabled: true,
      order: 10
    }];
  }

  function createCustomBlockImageItem(block: SiteTemplateCustomBlock, imageUrl: string, label?: string): SiteTemplateImageItem {
    const currentItems = block.imageItems ?? [];
    const title = label || block.title.zh || block.title.en || "Custom image";

    return {
      id: `custom-image-${Date.now()}`,
      url: imageUrl.trim(),
      alt: { en: title, zh: title },
      caption: { en: "", zh: "" },
      enabled: true,
      order: Math.max(0, ...currentItems.map((item) => item.order)) + 10
    };
  }

  function updateCustomBlockImages(block: SiteTemplateCustomBlock, imageItems: SiteTemplateImageItem[]) {
    const sortedItems = [...imageItems].sort((a, b) => a.order - b.order);
    updateCustomTemplateBlock(block.id, {
      imageItems: sortedItems,
      mediaUrl: sortedItems.find((item) => item.enabled)?.url ?? sortedItems[0]?.url ?? ""
    });
  }

  function addCustomImageFromUrl(block: SiteTemplateCustomBlock) {
    const imageUrl = customImageUrlDrafts[block.id]?.trim() ?? "";
    if (!imageUrl) {
      setStatus("请先填写图片 URL");
      return;
    }

    updateCustomBlockImages(block, [...(block.imageItems ?? getCustomBlockImages(block)), createCustomBlockImageItem(block, imageUrl)]);
    setCustomImageUrlDrafts((current) => ({ ...current, [block.id]: "" }));
    setStatus("图片已加入模块，点击保存模板后生效");
  }

  function addCustomImageFromMedia(block: SiteTemplateCustomBlock, file: UploadedFile) {
    updateCustomBlockImages(block, [...(block.imageItems ?? getCustomBlockImages(block)), createCustomBlockImageItem(block, file.url, file.description?.zh ?? file.name)]);
    setStatus("媒体库图片已加入模块，点击保存模板后生效");
  }

  function updateCustomImageItem(block: SiteTemplateCustomBlock, imageId: string, patch: Partial<SiteTemplateImageItem>) {
    updateCustomBlockImages(block, (block.imageItems ?? getCustomBlockImages(block)).map((item) => (
      item.id === imageId ? { ...item, ...patch } : item
    )));
  }

  function removeCustomImageItem(block: SiteTemplateCustomBlock, imageId: string) {
    updateCustomBlockImages(block, (block.imageItems ?? getCustomBlockImages(block)).filter((item) => item.id !== imageId));
  }

  function uploadCustomBlockImage(block: SiteTemplateCustomBlock, file: File | null) {
    if (!state || !file) return;
    if (!guardFrontendSettingsAccess()) return;
    if (!file.type.startsWith("image/")) {
      setStatus("请选择图片文件");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setStatus("图片模块上传中...");
    fetch("/api/admin/upload", { method: "POST", body: formData })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({ error: "图片上传失败" }));
          throw new Error(payload.error || "图片上传失败");
        }
        return response.json() as Promise<{ file: UploadedFile; state: AdminState }>;
      })
      .then(({ file: uploadedFile, state: savedState }) => {
        const currentBlock = state.templateSettings.customBlocks.find((item) => item.id === block.id) ?? block;
        const nextImageItems = [...(currentBlock.imageItems ?? getCustomBlockImages(currentBlock)), createCustomBlockImageItem(currentBlock, uploadedFile.url, uploadedFile.name)];
        setState({
          ...savedState,
          templateSettings: {
            ...state.templateSettings,
            customBlocks: state.templateSettings.customBlocks.map((item) => (
              item.id === block.id
                ? {
                  ...item,
                  imageItems: nextImageItems,
                  mediaUrl: nextImageItems.find((image) => image.enabled)?.url ?? nextImageItems[0]?.url ?? ""
                }
                : item
            ))
          }
        });
        setFrontendSettingsDirty(true);
        setStatus("图片已上传并加入模块，点击保存模板后生效");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "图片上传失败"));
  }

  function readVisualDragPayload(event: DragEvent<HTMLElement>): VisualBuilderDragPayload | null {
    const rawValue = event.dataTransfer.getData("application/json") || event.dataTransfer.getData("text/plain");
    if (!rawValue) return null;
    try {
      return JSON.parse(rawValue) as VisualBuilderDragPayload;
    } catch {
      return null;
    }
  }

  function startVisualModuleDrag(event: DragEvent<HTMLElement>, moduleId: string) {
    setVisualDraggingModuleId(moduleId);
    event.dataTransfer.effectAllowed = "move";
    const payload = JSON.stringify({ source: "module", moduleId } satisfies VisualBuilderDragPayload);
    event.dataTransfer.setData("application/json", payload);
    event.dataTransfer.setData("text/plain", payload);
  }

  function startVisualPaletteDrag(event: DragEvent<HTMLElement>, blockType: SiteTemplateCustomBlockType) {
    event.dataTransfer.effectAllowed = "copy";
    const payload = JSON.stringify({ source: "palette", blockType } satisfies VisualBuilderDragPayload);
    event.dataTransfer.setData("application/json", payload);
    event.dataTransfer.setData("text/plain", payload);
  }

  function dropVisualModule(event: DragEvent<HTMLElement>, afterOrder: number) {
    event.preventDefault();
    event.stopPropagation();
    const payload = readVisualDragPayload(event);
    setVisualDropTarget(null);
    setVisualDraggingModuleId(null);
    if (!payload) return;
    if (payload.source === "palette" && payload.blockType) {
      addCustomTemplateBlock(payload.blockType, afterOrder);
      return;
    }
    if (payload.source === "module" && payload.moduleId) {
      const targetModule = getTemplateModuleSortItems().find((module) => module.order === afterOrder);
      if (targetModule) reorderTemplateModules(payload.moduleId, targetModule.id, "after");
    }
  }

  function dropVisualModuleOnTarget(event: DragEvent<HTMLElement>, targetModuleId: string, placement: "before" | "after" = "after") {
    event.preventDefault();
    event.stopPropagation();
    const payload = readVisualDragPayload(event);
    setVisualDropTarget(null);
    setVisualDraggingModuleId(null);
    if (!payload) return;
    if (payload.source === "palette" && payload.blockType) {
      const targetModule = getTemplateModuleSortItems().find((module) => module.id === targetModuleId);
      addCustomTemplateBlock(payload.blockType, targetModule?.order);
      return;
    }
    if (payload.source === "module" && payload.moduleId) {
      reorderTemplateModules(payload.moduleId, targetModuleId, placement);
    }
  }

  function removeCustomTemplateBlock(blockId: string) {
    if (!state || !guardFrontendSettingsAccess()) return;
    updateTemplateSettings({
      customBlocks: state.templateSettings.customBlocks.filter((block) => block.id !== blockId)
    });
    setSelectedVisualModuleId("hero");
    setStatus("已删除自定义模块，点击保存模板生效");
  }

  function clearCustomTemplateBlocks() {
    if (!state || !guardFrontendSettingsAccess()) return;
    updateTemplateSettings({ customBlocks: [] });
    setSelectedVisualModuleId("hero");
    setStatus("已清空自定义模块，点击保存模板生效");
  }

  function moveTemplateModule(moduleId: HomeSectionKey | string, direction: "up" | "down") {
    if (!state || !guardFrontendSettingsAccess()) return;
    const modules = getTemplateModuleSortItems(state, { visibleOnly: true });
    const currentIndex = modules.findIndex((module) => module.id === moduleId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentModule = modules[currentIndex];
    const targetModule = modules[targetIndex];

    if (!currentModule || !targetModule) return;
    const nextModules = modules.filter((module) => module.id !== moduleId);
    nextModules.splice(targetIndex, 0, currentModule);

    const nextSectionOrder = { ...state.templateSettings.sectionOrder };
    const nextCustomBlocks = state.templateSettings.customBlocks.map((block) => ({ ...block }));
    const setOrder = (module: typeof currentModule, order: number) => {
      if (module.kind === "section") {
        nextSectionOrder[module.id as HomeSectionKey] = order;
        return;
      }
      const customBlock = nextCustomBlocks.find((block) => block.id === module.id);
      if (customBlock) customBlock.order = order;
    };

    nextModules.forEach((module, index) => setOrder(module, (index + 1) * 10));
    updateTemplateSettings({
      sectionOrder: nextSectionOrder,
      customBlocks: nextCustomBlocks
    });
    setSelectedVisualModuleId(String(moduleId));
    setStatus("模块顺序已更新，点击保存编辑生效");
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
      themeFit: existingProduct?.themeFit ?? [state.activeTheme],
      seo: {
        ...(existingProduct?.seo ?? {}),
        title: mergeSeoTranslation(productForm.seoTitleEn, productForm.seoTitleZh),
        description: mergeSeoTranslation(productForm.seoDescriptionEn, productForm.seoDescriptionZh),
        ogImageUrl: productForm.seoOgImageUrl.trim() || undefined,
        canonicalUrl: productForm.seoCanonicalUrl.trim() || undefined,
        indexable: productForm.seoIndexable
      }
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

  function startProductQuickEdit(product: ProductCategory) {
    setQuickEditingProductId(product.id ?? product.slug);
    setQuickEditingProductName(product.name.zh || product.name.en || "");
    setInlineEditingProduct(null);
  }

  function cancelProductQuickEdit() {
    setQuickEditingProductId(null);
    setQuickEditingProductName("");
  }

  function saveProductQuickEdit(productId: string) {
    if (!state) return;
    const nextName = quickEditingProductName.trim();
    if (!nextName) {
      setStatus("分类名称不能为空");
      return;
    }

    const nextState = {
      ...state,
      products: state.products.map((product) => {
        if ((product.id ?? product.slug) !== productId) return product;
        return {
          ...product,
          name: {
            ...product.name,
            zh: nextName,
            en: product.name.en || nextName
          }
        };
      })
    };

    setState(nextState);
    cancelProductQuickEdit();
    setStatus("分类名称已更新");
    void save(nextState);
  }

  function getProductInlineEditValue(product: ProductCategory, field: ProductInlineEditField) {
    if (field === "name") return product.name.zh || product.name.en || "";
    if (field === "summary") return product.summary.zh || product.summary.en || "";
    if (field === "parentId") return product.parentId ?? "";
    return product.slug;
  }

  function startProductInlineEdit(product: ProductCategory, field: ProductInlineEditField) {
    const productId = product.id ?? product.slug;
    setQuickEditingProductId(null);
    setQuickEditingProductName("");
    setInlineEditingProduct({
      field,
      productId,
      value: getProductInlineEditValue(product, field)
    });
  }

  function cancelProductInlineEdit() {
    setInlineEditingProduct(null);
  }

  function saveProductInlineEdit() {
    if (!state || !inlineEditingProduct) return;
    const { field, productId } = inlineEditingProduct;
    const rawValue = inlineEditingProduct.value.trim();

    if ((field === "name" || field === "slug") && !rawValue) {
      setStatus(field === "name" ? "分类名称不能为空" : "分类别名不能为空");
      return;
    }

    const nextParentId = field === "parentId" ? rawValue || undefined : undefined;
    if (field === "parentId" && productParentWouldCreateCycle(state.products, productId, nextParentId)) {
      setStatus("父级分类不能指向自身或子分类");
      return;
    }

    const nextState = {
      ...state,
      products: state.products.map((product) => {
        if ((product.id ?? product.slug) !== productId) return product;
        if (field === "name") {
          return {
            ...product,
            name: {
              ...product.name,
              zh: rawValue,
              en: product.name.en || rawValue
            }
          };
        }
        if (field === "summary") {
          return {
            ...product,
            summary: {
              ...product.summary,
              zh: rawValue,
              en: product.summary.en || rawValue
            }
          };
        }
        if (field === "slug") {
          return {
            ...product,
            slug: slugify(rawValue) || product.slug
          };
        }
        return {
          ...product,
          parentId: nextParentId
        };
      })
    };

    setState(nextState);
    setInlineEditingProduct(null);
    setStatus("分类内容已更新");
    void save(nextState);
  }

  function handleProductInlineEditKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelProductInlineEdit();
      return;
    }

    if (event.key !== "Enter") return;
    if (event.currentTarget.tagName === "TEXTAREA" && !event.metaKey && !event.ctrlKey) return;
    event.preventDefault();
    saveProductInlineEdit();
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

  function updateRolePermission(role: RoleKey, patch: Partial<AdminRolePermissions>) {
    if (!state) return;
    const current = getRolePermissions(role, state.rolePermissions);
    const nextRolePermissions = {
      ...(state.rolePermissions ?? {}),
      [role]: {
        ...current,
        ...patch
      }
    };

    setState({
      ...state,
      rolePermissions: nextRolePermissions
    });
  }

  function updateRoleAllowedTab(role: RoleKey, tabKey: Tab, checked: boolean) {
    const current = new Set(getRolePermissions(role, state?.rolePermissions).allowedTabs);
    if (checked) current.add(tabKey);
    else current.delete(tabKey);
    if (current.size === 0) current.add("overview");
    const existingSettingsSections = getRolePermissions(role, state?.rolePermissions).settingsSections;
    const settingsSectionsForRole = tabKey === "settings"
      ? checked
        ? existingSettingsSections.length > 0 ? existingSettingsSections : ["general"]
        : []
      : existingSettingsSections;

    updateRolePermission(role, {
      allowedTabs: Array.from(current),
      settingsSections: settingsSectionsForRole
    });
  }

  function updateRoleSettingsSection(role: RoleKey, section: SettingsSection, checked: boolean) {
    const currentRolePermissions = getRolePermissions(role, state?.rolePermissions);
    const current = new Set(currentRolePermissions.settingsSections);
    if (checked) current.add(section);
    else current.delete(section);
    const allowedTabs = new Set(currentRolePermissions.allowedTabs);
    if (current.size > 0) allowedTabs.add("settings");
    else allowedTabs.delete("settings");
    updateRolePermission(role, {
      settingsSections: Array.from(current),
      allowedTabs: allowedTabs.size > 0 ? Array.from(allowedTabs) : ["overview"]
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

  function uploadContactIcon(index: number, file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("请选择图标图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setStatus("图标读取失败");
        return;
      }
      updateContact(index, { iconUrl: reader.result });
      setStatus("图标已添加，点击“保存联系方式”后生效");
    };
    reader.onerror = () => setStatus("图标读取失败");
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

  function mergeUploadedFilesFromSavedState(savedState: AdminState, articleCoverFallback?: { articleId: string; imageUrl: string }) {
    setState((currentState) => {
      if (!currentState) return savedState;

      return {
        ...currentState,
        uploadedFiles: savedState.uploadedFiles,
        articles: articleCoverFallback
          ? currentState.articles.map((article) => (
            (article.id ?? article.slug) === articleCoverFallback.articleId
              ? { ...article, coverImageUrl: article.coverImageUrl || articleCoverFallback.imageUrl }
              : article
          ))
          : currentState.articles
      };
    });
  }

  function fallbackAppendMarkdownToBody(target: VideoDialogTarget, markdown: string) {
    if (target === "page") {
      if (!activePage) return;
      const currentBody = pickLocalizedText(activePage.body, locale);
      updatePageBody(`${currentBody.trimEnd()}${currentBody.trim() ? "\n\n" : ""}${markdown.trim()}\n\n`);
      return;
    }

    if (!activeArticle) return;
    const currentBody = activeArticleBody;
    updateArticleBody(`${currentBody.trimEnd()}${currentBody.trim() ? "\n\n" : ""}${markdown.trim()}\n\n`);
  }

  function insertMarkdownIntoActiveEditor(target: VideoDialogTarget, markdown: string) {
    const editor = target === "page" ? pageMarkdownEditorRef.current : articleMarkdownEditorRef.current;

    if (!editor) {
      fallbackAppendMarkdownToBody(target, markdown);
      return;
    }

    editor.focus(() => editor.insertMarkdown(markdown), { defaultSelection: "rootEnd" });
  }

  function openVideoDialog(target: VideoDialogTarget, currentUrl = "") {
    setVideoDialogTarget(target);
    setVideoDialogUrl(currentUrl);
    setReplacingArticleVideoUrl(target === "article" && currentUrl ? currentUrl : null);
  }

  function closeVideoDialog() {
    setVideoDialogTarget(null);
    setVideoDialogUrl("");
    setReplacingArticleVideoUrl(null);
  }

  function buildVideoEmbedFromUrl(rawUrl: string) {
    const url = rawUrl.trim();
    if (!url) {
      setStatus("请先粘贴视频链接");
      return null;
    }

    if (!parseVideoMarkdownBlock(videoMarkdownBlock(url, "Video"))) {
      setStatus("请填写支持的视频链接：YouTube、Vimeo、Bilibili、TikTok、Facebook、Instagram 或 mp4/webm 文件");
      return null;
    }

    return videoMarkdownBlock(url, "Video");
  }

  function insertVideoFromDialog() {
    const block = buildVideoEmbedFromUrl(videoDialogUrl);
    if (!block || !videoDialogTarget) return;

    if (videoDialogTarget === "article" && replacingArticleVideoUrl) {
      const nextBody = activeArticleBody.split(/\n{2,}/).map((bodyBlock) => {
        const video = parseVideoMarkdownBlock(bodyBlock);
        return video?.url === replacingArticleVideoUrl ? block : bodyBlock;
      }).join("\n\n");
      updateArticleBody(nextBody);
      setStatus("视频链接已替换，保存或发布后前台会显示新视频");
    } else {
      insertMarkdownIntoActiveEditor(videoDialogTarget, `\n\n${block}\n\n`);
      setStatus(videoDialogTarget === "page" ? "视频链接已插入页面正文，保存或发布后前台会显示视频" : "视频链接已插入文章正文，保存或发布后前台会显示视频");
    }

    closeVideoDialog();
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

  function publishActiveArticle() {
    if (!state || !activeArticle || activeArticleIndex < 0) return;
    const nextState = {
      ...state,
      articles: state.articles.map((article, current) => (
        current === activeArticleIndex
          ? { ...article, status: "published" as const, featuredOnHome: true, publishedAt: new Date().toISOString(), deletedAt: undefined }
          : article
      ))
    };

    setState(nextState);
    setArticleMode("list");
    setArticleStatusFilter("all");
    setStatus("文章已发布，正在保存...");
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

  function selectedAiTitleValue(title = aiContentForm.selectedTitle) {
    return title.trim();
  }

  function toggleAiContentSection(section: AiContentSectionKey) {
    setAiContentForm((current) => {
      const nextSections = current.sections.includes(section)
        ? current.sections.filter((item) => item !== section)
        : [...current.sections, section];

      return {
        ...current,
        sections: nextSections.length > 0 ? nextSections : [section]
      };
    });
    setAiDraftPreview(null);
  }

  async function requestAiGeneration(action: "titleSuggestions" | "draft") {
    if (!state) return null;
    if (!aiContentForm.topic.trim()) {
      setAiGenerateStatus("请先填写内容主题。");
      return null;
    }

    setAiGenerateStatus(action === "titleSuggestions" ? "正在生成标题候选..." : "正在调用 AI 生成内容预览...");
    setStatus(action === "titleSuggestions" ? "正在生成标题候选..." : "正在生成 AI 内容...");

    try {
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          target: aiContentForm.target,
          purpose: aiContentForm.purpose,
          topic: aiContentForm.topic,
          selectedTitle: selectedAiTitleValue(),
          category: aiContentForm.category || state.siteSettings.defaultArticleCategory || state.products[0]?.slug || "",
          audience: aiContentForm.audience || state.aiSettings.targetMarkets.join(", "),
          languages: ["zh", "en"],
          sections: aiContentForm.sections,
          writeMode: aiContentForm.writeMode
        })
      });
      const payload = await response.json().catch(() => ({ error: "AI 生成失败" })) as {
        titles?: Article["title"][];
        draft?: AiContentDraft;
        state?: AdminState;
        error?: string;
      };

      if (!response.ok) throw new Error(payload.error || "AI 生成失败");
      if (payload.state) setState(payload.state);
      return payload;
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI 生成失败";
      setAiGenerateStatus(message);
      setStatus(message);
      return null;
    }
  }

  function goToAiWizardStep(step: AiWizardStep) {
    setAiWizardStep(step);
  }

  function nextAiWizardStep() {
    setAiWizardStep((current) => Math.min(5, current + 1) as AiWizardStep);
  }

  function previousAiWizardStep() {
    setAiWizardStep((current) => Math.max(1, current - 1) as AiWizardStep);
  }

  async function generateAiTitleSuggestions() {
    const payload = await requestAiGeneration("titleSuggestions");
    if (!payload?.titles) return;

    setAiTitleSuggestions(payload.titles);
    setAiGenerateStatus("标题候选已生成，可选择一个标题，也可以继续手动编辑。");
    setStatus("标题候选已生成");
  }

  async function generateAiContentPreview() {
    const payload = await requestAiGeneration("draft");
    if (!payload?.draft) return;

    setAiDraftPreview(payload.draft);
    setAiGeneratedImage(null);
    setAiImageStatus("");
    setAiGenerateStatus("AI 内容预览已生成，确认后再写入文章或页面。");
    setStatus("AI 内容预览已生成");
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
    const draft = draftOverride ?? (aiDraftPreview?.target === aiContentForm.target ? aiDraftPreview : null);
    if (!draft) {
      setAiGenerateStatus("请先生成预览，确认内容后再写入。");
      return;
    }
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
      purpose: "buying-guide",
      topic: collectorDraft.title.zh || collectorDraft.title.en,
      selectedTitle: collectorDraft.title.zh || collectorDraft.title.en,
      audience: "",
      category: collectorDraft.category,
      sections: emptyAiContentForm.sections
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
  const worldClockCountryOptions = Array.from(new Set(worldClockCityCatalog.map((city) => city.country)))
    .sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));
  const worldClockCityOptions = worldClockCityCatalog
    .filter((city) => city.country === worldClockForm.country && isValidTimeZone(city.zone))
    .sort((left, right) => left.city.localeCompare(right.city, "zh-Hans-CN"));
  const selectedWorldClockCity = worldClockCityOptions.find((city) => city.id === worldClockForm.city);
  const selectedWorldClockCityExists = Boolean(selectedWorldClockCity && activeWorldClockCities.some((city) => (
    city.id === selectedWorldClockCity.id
      || (city.country === selectedWorldClockCity.country && city.city === selectedWorldClockCity.city && city.zone === selectedWorldClockCity.zone)
  )));
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

  function handleVisualEditorDoubleClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const videoBlock = target.closest<HTMLElement>(".article-video-placeholder");
    const videoUrl = videoBlock?.dataset.videoUrl;
    if (!videoUrl) return;
    openVideoDialog("article", videoUrl);
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
    const currentBody = activeArticleBody;
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
    const currentBody = activeArticleBody;
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

  function appendArticleBlock(block: string) {
    if (!activeArticle) return;
    const currentBody = activeArticleBody;
    const nextBody = `${currentBody.trimEnd()}${currentBody.trim() ? "\n\n" : ""}${block.trim()}\n\n`;

    updateArticleBody(nextBody);
    window.requestAnimationFrame(() => {
      document.getElementById("article-body-editor")?.focus();
    });
  }

  function clearArticleBody() {
    if (!activeArticle) return;
    articleMarkdownEditorRef.current?.setMarkdown("");
    updateArticleBody("");
    setStatus("正文已清空，点击保存或发布后生效");
    window.requestAnimationFrame(() => {
      articleMarkdownEditorRef.current?.focus();
    });
  }

  function clearPageBody() {
    if (!activePage) return;
    pageMarkdownEditorRef.current?.setMarkdown("");
    updatePageBody("");
    setStatus("页面正文已清空，点击保存或发布后生效");
    window.requestAnimationFrame(() => {
      pageMarkdownEditorRef.current?.focus();
    });
  }

  function renderMarkdownEditorToolbarActions(target: VideoDialogTarget) {
    const isPage = target === "page";
    const insertSnippet = (label: string, markdown: string) => {
      insertMarkdownIntoActiveEditor(target, markdown);
      setStatus(`${label}已插入，点击保存或发布后生效`);
    };

    return (
      <div className="admin-editor-quickbar" aria-label={isPage ? "页面编辑器快捷工具" : "文章编辑器快捷工具"}>
        <button title="插入二级标题" aria-label="插入二级标题" type="button" onClick={() => insertSnippet("二级标题", "\n\n## 小标题\n\n")}><Heading2 size={16} />H2</button>
        <button title="插入三级标题" aria-label="插入三级标题" type="button" onClick={() => insertSnippet("三级标题", "\n\n### 小标题\n\n")}><Heading3 size={16} />H3</button>
        <button title="插入引用" aria-label="插入引用" type="button" onClick={() => insertSnippet("引用", "\n\n> 在这里填写引用内容。\n\n")}><Quote size={16} />引用</button>
        <button title="插入无序清单" aria-label="插入无序清单" type="button" onClick={() => insertSnippet("无序清单", "\n\n- 清单项目\n- 清单项目\n\n")}><List size={16} />清单</button>
        <button title="插入有序清单" aria-label="插入有序清单" type="button" onClick={() => insertSnippet("有序清单", "\n\n1. 第一步\n2. 第二步\n\n")}><ListOrdered size={16} />编号</button>
        <button title="插入表格" aria-label="插入表格" type="button" onClick={() => insertSnippet("表格", "\n\n| 项目 | 说明 |\n| --- | --- |\n| 示例 | 在这里填写内容 |\n\n")}><Table2 size={16} />表格</button>
        <button title="插入分隔线" aria-label="插入分隔线" type="button" onClick={() => insertSnippet("分隔线", "\n\n---\n\n")}><Minus size={16} />分割</button>
        <button title="插入代码块" aria-label="插入代码块" type="button" onClick={() => insertSnippet("代码块", "\n\n```text\n在这里填写代码\n```\n\n")}><Code2 size={16} />代码</button>
        <button title="插入视频链接" aria-label="插入视频链接" type="button" onClick={() => openVideoDialog(target)}><Video size={16} />视频</button>
        <label aria-label="上传并插入媒体" className="article-image-inline-upload" title="上传并插入媒体">
          <Paperclip size={16} />
          媒体
          <input
            type="file"
            onChange={(event) => {
              uploadSiteFile(event.currentTarget.files?.[0] ?? null, target);
              event.currentTarget.value = "";
            }}
          />
        </label>
        <button disabled={(state?.uploadedFiles.length ?? 0) === 0} title="从媒体库插入" type="button" onClick={() => setMediaPickerTarget(target)}><Library size={16} />媒体库</button>
        <button title="清空正文" type="button" onClick={isPage ? clearPageBody : clearArticleBody}><Trash2 size={16} />清空</button>
      </div>
    );
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
    const currentBody = activeArticleBody;
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

  function uploadMarkdownEditorImage(target: VideoDialogTarget, file: File) {
    if (!file.type.startsWith("image/")) {
      const message = "请选择图片文件";
      setStatus(message);
      return Promise.reject(new Error(message));
    }

    const targetArticleId = target === "article" && activeArticle ? activeArticle.id ?? activeArticle.slug : "";
    const shouldSetArticleCover = Boolean(targetArticleId && !activeArticle?.coverImageUrl);
    const formData = new FormData();

    formData.append("file", file);
    setStatus("图片上传中...");

    return fetch("/api/admin/upload", { method: "POST", body: formData })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({ error: "图片上传失败" }));
          throw new Error(payload.error || "图片上传失败");
        }
        return response.json() as Promise<{ file: UploadedFile; state: AdminState }>;
      })
      .then(({ file: uploadedFile, state: savedState }) => {
        mergeUploadedFilesFromSavedState(
          savedState,
          shouldSetArticleCover ? { articleId: targetArticleId, imageUrl: uploadedFile.url } : undefined
        );
        setStatus(target === "article" ? "图片已上传并插入文章正文，点击保存或发布后生效" : "图片已上传并插入页面正文，点击保存或发布后生效");
        return uploadedFile.url;
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "图片上传失败";
        setStatus(message);
        throw error;
      });
  }

  function uploadArticleImage(file: File | null) {
    if (!file || !activeArticle) return;
    if (!file.type.startsWith("image/")) {
      setStatus("请选择文章图片文件");
      return;
    }
    const targetId = activeArticle.id ?? activeArticle.slug;
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
        mergeUploadedFilesFromSavedState(savedState, { articleId: targetId, imageUrl: uploadedFile.url });
        setStatus("特色图片已上传，点击保存或发布后生效");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "图片上传失败"));
  }

  function appendFileToActiveArticle(file: UploadedFile, sourceState = state) {
    if (!activeArticle || !sourceState) return sourceState;
    const targetId = activeArticle.id ?? activeArticle.slug;
    const editor = document.getElementById("article-body-editor") as HTMLTextAreaElement | null;
    const currentBody = activeArticleBody;
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

  function uploadSiteFile(file: File | null, insertTarget?: VideoDialogTarget) {
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
        mergeUploadedFilesFromSavedState(savedState);
        if (insertTarget) {
          insertMarkdownIntoActiveEditor(insertTarget, buildArticleMediaMarkup(uploadedFile));
        }
        setStatus(insertTarget ? "媒体已上传并插入正文，点击保存或发布后生效" : "媒体已上传并保存");
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

  function insertExistingFileIntoContent(file: UploadedFile) {
    if (!mediaPickerTarget) return;

    insertMarkdownIntoActiveEditor(mediaPickerTarget, buildArticleMediaMarkup(file));
    setMediaPickerTarget(null);
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
  const selectedAiImageProvider = aiImageProviderOptions.find((option) => option.value === state.aiSettings.imageProvider) ?? aiImageProviderOptions[0];
  const aiImageModelOptions = selectedAiImageProvider.models;
  const aiImageModelSelectValue = aiImageModelOptions.includes(state.aiSettings.imageModel) ? state.aiSettings.imageModel : customAiModelValue;
  const aiImageModelIsCustom = aiImageModelSelectValue === customAiModelValue;
  const selectedAiVoiceProvider = aiVoiceProviderOptions.find((option) => option.value === state.aiSettings.voiceProvider) ?? aiVoiceProviderOptions[0];
  const aiVoiceModelOptions = selectedAiVoiceProvider.models;
  const aiVoiceModelSelectValue = aiVoiceModelOptions.includes(state.aiSettings.voiceModel) ? state.aiSettings.voiceModel : customAiModelValue;
  const aiVoiceModelIsCustom = aiVoiceModelSelectValue === customAiModelValue;
  const aiTestStatusTone = !aiTestStatus ? "" : aiTestStatus.includes("通过") ? "success" : aiTestStatus.includes("正在测试") ? "pending" : "error";
  const accountInitial = (currentUserName || email).slice(0, 1).toUpperCase();
  const canResetUserPasswords = currentUser?.role === "super-admin";
  const selectableBackupSectionCount = backupSectionOptions.filter((option) => canResetUserPasswords || !sensitiveBackupSections.has(option.key)).length;
  const allowedTabsForCurrentUser = new Set(getAllowedTabsForUser(currentUser, state.rolePermissions));
  const allowedSettingsSectionKeys = getAllowedSettingsSectionsForUser(currentUser, state.rolePermissions);
  const visibleSettingsSections = settingsSections.filter((item) => allowedSettingsSectionKeys.includes(item.key));
  const canViewCurrentSettingsSection = allowedSettingsSectionKeys.includes(settingsSection);
  const seoIssues = countSeoIssues(state);
  const publicIndexingEnabled = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";
  const visibleSidebarTabs = tabs.filter((item) => allowedTabsForCurrentUser.has(item.key));
  const canManageFrontendSettings = canManageFrontendState();
  const canImportArticles = getRolePermissions(currentUser?.role ?? "viewer", state.rolePermissions).articleImportEnabled;
  const selectedMailLead = state.leads.find((lead) => lead.id === mailDraftLeadId) ?? null;
  const selectedMailDraft = selectedMailLead ? buildLeadReplyDraft(selectedMailLead) : null;
  const mailProvider = state.siteSettings.mailProvider || "mailto";
  const smtpPasswordConfigured = Boolean(state.siteSettings.mailSmtpPasswordConfigured);
  const mailApiKeyConfigured = Boolean(state.siteSettings.mailApiKeyConfigured);
  const canRunAutoTranslation = Boolean(currentUser && (
    frontendManagerRoles.has(currentUser.role)
    || allowedTabsForCurrentUser.has("ai")
    || allowedSettingsSectionKeys.includes("translation")
  ));
  const translationRunning = translationStatus.startsWith("正在");
  const translationLocaleOptions = state.enabledLocales.length > 0
    ? locales.filter((localeOption) => state.enabledLocales.includes(localeOption.code) || localeOption.code === "zh" || localeOption.code === "en")
    : locales.filter((localeOption) => localeOption.code === "zh" || localeOption.code === "en");
  const filteredLeads = state.leads.filter((lead) => {
    const statusMatches = leadStatusFilter === "all" || lead.status === leadStatusFilter;
    const query = leadQuery.trim().toLowerCase();
    const queryMatches = !query || [
      lead.fullName,
      lead.company,
      lead.productType,
      lead.quantity,
      lead.email,
      lead.whatsapp,
      lead.destination,
      lead.workpieceMaterial,
      lead.message,
      leadStatusLabels[lead.status]
    ].filter(Boolean).some((value) => value?.toLowerCase().includes(query));

    return statusMatches && queryMatches;
  });
  const leadStatusCounts = leadStatuses.reduce((counts, statusOption) => ({
    ...counts,
    [statusOption]: state.leads.filter((lead) => lead.status === statusOption).length
  }), {} as Record<LeadStatus, number>);
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
  const visualBuilderModules = [
    ...homeSectionOptions.map((section) => ({
      id: section.key,
      kind: "section" as VisualBuilderModuleKind,
      label: section.label,
      typeLabel: "首页模块",
      enabled: templateSettings.visibleSections[section.key],
      order: templateSettings.sectionOrder[section.key]
    })),
    ...templateSettings.customBlocks.map((block) => ({
      id: block.id,
      kind: "custom" as VisualBuilderModuleKind,
      label: block.title.zh || block.title.en,
      typeLabel: block.type === "image" ? "图片模块" : block.type === "video" ? "视频模块" : block.type === "cta" ? "按钮模块" : "文字模块",
      enabled: block.enabled,
      order: block.order
    }))
  ].sort((a, b) => a.order - b.order);
  const selectedCustomBlock = templateSettings.customBlocks.find((block) => block.id === selectedVisualModuleId) ?? null;
  const selectedCoreSection = homeSectionOptions.find((section) => section.key === selectedVisualModuleId) ?? null;
  const selectedVisualModuleLabel = selectedCoreSection?.label
    ?? (selectedCustomBlock?.type === "image" ? "图片模块"
      : selectedCustomBlock?.type === "video" ? "视频模块"
        : selectedCustomBlock?.type === "cta" ? "按钮模块"
          : selectedCustomBlock ? "文字模块" : "未选择模块");

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
        <div className="visual-inline-editor" key={options.editorKey} onDoubleClick={(event) => event.stopPropagation()}>
          {inputControl}
          <div className="visual-inline-actions">
            <button type="button" onClick={() => commitVisualInlineEdit(options.onCommit, options.allowEmpty)}>确定</button>
            <button type="button" onClick={cancelVisualInlineEdit}>取消</button>
          </div>
        </div>
      );
    }

    if (options.element === "h1") return <h1 className={targetClassName} key={options.editorKey} title="双击编辑" onDoubleClick={openEditor}>{textValue}</h1>;
    if (options.element === "h3") return <h3 className={targetClassName} key={options.editorKey} title="双击编辑" onDoubleClick={openEditor}>{textValue}</h3>;
    if (options.element === "p") return <p className={targetClassName} key={options.editorKey} title="双击编辑" onDoubleClick={openEditor}>{textValue}</p>;
    if (options.element === "strong") return <strong className={targetClassName} key={options.editorKey} title="双击编辑" onDoubleClick={openEditor}>{textValue}</strong>;
    if (options.element === "li") return <li className={targetClassName} key={options.editorKey} title="双击编辑" onDoubleClick={openEditor}>{textValue}</li>;
    return <span className={targetClassName} key={options.editorKey} title="双击编辑" onDoubleClick={openEditor}>{textValue}</span>;
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

  function renderVisualCustomImageSet(block: SiteTemplateCustomBlock) {
    const images = getCustomBlockImages(block);
    const layout = block.imageLayout ?? "single";
    const visibleImages = layout === "single" ? images.slice(0, 1) : images;

    return (
      <div
        className={`visual-custom-image-set layout-${layout}`}
        title="在右侧属性面板管理图片排列"
        onDoubleClick={(event) => {
          event.stopPropagation();
          setSelectedVisualModuleId(block.id);
          setVisualBuilderSidebarTab("properties");
        }}
      >
        {visibleImages.length > 0 ? visibleImages.map((item, index) => (
          <figure className="visual-custom-image-frame" key={item.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.alt?.zh || item.alt?.en || block.title.zh || block.title.en} />
            {item.caption?.zh || item.caption?.en ? <figcaption>{item.caption.zh || item.caption.en}</figcaption> : null}
            {layout === "carousel" && index === 0 ? <span className="visual-image-badge"><ImageIcon size={14} />轮播</span> : null}
          </figure>
        )) : (
          <div className="visual-custom-image-empty"><ImageIcon size={24} />从属性面板添加图片</div>
        )}
        {layout === "carousel" && visibleImages.length > 1 ? (
          <div className="visual-custom-carousel-dots">
            {visibleImages.map((item, index) => <span className={index === 0 ? "active" : ""} key={item.id} />)}
          </div>
        ) : null}
      </div>
    );
  }

  function renderVisualVideoTarget(block: SiteTemplateCustomBlock) {
    const videoUrl = block.mediaUrl ?? "";
    const videoFiles = (state?.uploadedFiles ?? [])
      .filter((file) => file.mimeType.toLowerCase().startsWith("video/") || /\.(mp4|webm|ogg|mov)$/i.test(file.name))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const editing = visualEditingKey === `custom-video-${block.id}`;

    return (
      <div className="visual-video-target" onDoubleClick={(event) => startVisualInlineEdit(`custom-video-${block.id}`, videoUrl, event)}>
        {videoUrl ? (
          /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl) ? (
            <video src={videoUrl} controls preload="metadata" />
          ) : (
            <iframe src={videoUrl} title={block.title.zh || block.title.en} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
          )
        ) : (
          <div className="visual-video-placeholder"><Video size={24} />双击添加视频链接</div>
        )}
        <span className="visual-image-badge"><Video size={14} />视频</span>
        {editing ? (
          <div className="visual-image-editor" onDoubleClick={(event) => event.stopPropagation()}>
            <input
              autoFocus
              placeholder="粘贴视频 URL，如 MP4、YouTube、Vimeo、Bilibili"
              value={visualDraftValue}
              onChange={(event) => setVisualDraftValue(event.target.value)}
              onKeyDown={(event) => handleVisualInlineKeyDown(event, (value) => updateCustomTemplateBlock(block.id, { mediaUrl: value }), true)}
            />
            {videoFiles.length > 0 ? (
              <select value="" onChange={(event) => {
                const selectedFile = videoFiles.find((file) => file.id === event.target.value);
                if (!selectedFile) return;
                updateCustomTemplateBlock(block.id, { mediaUrl: selectedFile.url });
                cancelVisualInlineEdit();
              }}>
                <option value="">从媒体库选择视频</option>
                {videoFiles.map((file) => <option key={file.id} value={file.id}>{file.name}</option>)}
              </select>
            ) : null}
            <div className="visual-inline-actions">
              <button type="button" onClick={() => commitVisualInlineEdit((value) => updateCustomTemplateBlock(block.id, { mediaUrl: value }), true)}>确定</button>
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

  function renderVisualSelectedPanel() {
    if (selectedVisualModuleId === "hero") {
      return (
        <div className="visual-properties-panel">
          <div>
            <strong>首屏属性</strong>
            <span>编辑首页首屏标题、说明、按钮和背景显示。</span>
          </div>
          <label>主标题
            <textarea value={templateSettings.heroTitle.zh || templateSettings.heroTitle.en} onChange={(event) => updateTemplateText("heroTitle", "zh", event.target.value)} />
          </label>
          <label>说明
            <textarea value={templateSettings.heroBody.zh || templateSettings.heroBody.en} onChange={(event) => updateTemplateText("heroBody", "zh", event.target.value)} />
          </label>
          <label className="checkline">
            <input disabled={!canManageFrontendSettings} type="checkbox" checked={templateSettings.heroCarouselEnabled} onChange={(event) => updateTemplateSettings({ heroCarouselEnabled: event.target.checked })} />
            轮播背景
          </label>
          <label className="checkline">
            <input disabled={!canManageFrontendSettings} type="checkbox" checked={templateSettings.showHeroMetrics} onChange={(event) => updateTemplateSettings({ showHeroMetrics: event.target.checked })} />
            首屏指标
          </label>
        </div>
      );
    }

    if (selectedCoreSection) {
      return (
        <div className="visual-properties-panel">
          <div>
            <strong>{selectedCoreSection.label}</strong>
            <span>这是系统首页模块，可控制显示状态和排序。</span>
          </div>
          <label className="checkline">
            <input disabled={!canManageFrontendSettings} type="checkbox" checked={templateSettings.visibleSections[selectedCoreSection.key]} onChange={(event) => updateTemplateSectionVisibility(selectedCoreSection.key, event.target.checked)} />
            显示此模块
          </label>
          <label>排序
            <input disabled={!canManageFrontendSettings} type="number" value={templateSettings.sectionOrder[selectedCoreSection.key]} onChange={(event) => updateTemplateSectionOrder(selectedCoreSection.key, Number(event.target.value))} />
          </label>
        </div>
      );
    }

    if (selectedCustomBlock) {
      return (
        <div className="visual-properties-panel">
          <div>
            <strong>{selectedCustomBlock.type === "image" ? "图片模块" : selectedCustomBlock.type === "video" ? "视频模块" : selectedCustomBlock.type === "cta" ? "按钮模块" : "文字模块"}</strong>
            <span>编辑当前选中模块的内容、布局、背景和链接。</span>
          </div>
          <label>眉标
            <input value={selectedCustomBlock.eyebrow?.zh || selectedCustomBlock.eyebrow?.en || ""} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { eyebrow: { ...(selectedCustomBlock.eyebrow ?? { en: "", zh: "" }), zh: event.target.value, en: selectedCustomBlock.eyebrow?.en || event.target.value } })} />
          </label>
          <label>标题
            <input value={selectedCustomBlock.title.zh || selectedCustomBlock.title.en} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { title: { ...selectedCustomBlock.title, zh: event.target.value, en: selectedCustomBlock.title.en || event.target.value } })} />
          </label>
          <label>正文
            <textarea value={selectedCustomBlock.body.zh || selectedCustomBlock.body.en} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { body: { ...selectedCustomBlock.body, zh: event.target.value, en: selectedCustomBlock.body.en || event.target.value } })} />
          </label>
          {selectedCustomBlock.type === "image" || selectedCustomBlock.type === "video" ? (
            <label>{selectedCustomBlock.type === "image" ? "图片 URL" : "视频 URL"}
              <input value={selectedCustomBlock.mediaUrl ?? ""} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { mediaUrl: event.target.value })} />
            </label>
          ) : null}
          {selectedCustomBlock.type === "image" ? (
            <div className="visual-image-settings">
              <label>图片排列
                <select value={selectedCustomBlock.imageLayout ?? "single"} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { imageLayout: event.target.value as SiteTemplateImageLayout })}>
                  {imageLayoutOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                </select>
              </label>
              <div className="visual-image-settings-row">
                <label className="checkline">
                  <input disabled={!canManageFrontendSettings || selectedCustomBlock.imageLayout !== "carousel"} type="checkbox" checked={selectedCustomBlock.imageCarouselAutoplay ?? true} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { imageCarouselAutoplay: event.target.checked })} />
                  自动轮播
                </label>
                <label>间隔秒数
                  <input disabled={!canManageFrontendSettings || selectedCustomBlock.imageLayout !== "carousel"} min={3} max={15} type="number" value={selectedCustomBlock.imageCarouselIntervalSeconds ?? 5} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { imageCarouselIntervalSeconds: Number(event.target.value) || 5 })} />
                </label>
              </div>
              <div className="visual-image-add-row">
                <input
                  disabled={!canManageFrontendSettings}
                  placeholder="/assets/current-template/example.jpg 或 https://..."
                  value={customImageUrlDrafts[selectedCustomBlock.id] ?? ""}
                  onChange={(event) => setCustomImageUrlDrafts((current) => ({ ...current, [selectedCustomBlock.id]: event.target.value }))}
                />
                <button disabled={!canManageFrontendSettings} type="button" onClick={() => addCustomImageFromUrl(selectedCustomBlock)}>添加 URL</button>
              </div>
              <div className="visual-image-add-row">
                <select disabled={!canManageFrontendSettings || heroImageFiles.length === 0} value="" onChange={(event) => {
                  const selectedFile = heroImageFiles.find((file) => file.id === event.target.value);
                  if (selectedFile) addCustomImageFromMedia(selectedCustomBlock, selectedFile);
                }}>
                  <option value="">{heroImageFiles.length > 0 ? "从媒体库选择图片" : "媒体库暂无图片"}</option>
                  {heroImageFiles.map((file) => <option key={file.id} value={file.id}>{file.name}</option>)}
                </select>
                <label className={canManageFrontendSettings ? "visual-image-upload" : "visual-image-upload disabled"}>
                  上传图片
                  <input
                    accept="image/*"
                    disabled={!canManageFrontendSettings}
                    type="file"
                    onChange={(event) => {
                      uploadCustomBlockImage(selectedCustomBlock, event.currentTarget.files?.[0] ?? null);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="visual-image-item-list">
                {(selectedCustomBlock.imageItems ?? getCustomBlockImages(selectedCustomBlock)).map((item) => (
                  <article className={item.enabled ? "visual-image-item" : "visual-image-item disabled"} key={item.id}>
                    <div className="visual-image-item-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt={item.alt?.zh || item.alt?.en || selectedCustomBlock.title.zh || selectedCustomBlock.title.en} />
                    </div>
                    <div className="visual-image-item-fields">
                      <input disabled={!canManageFrontendSettings} value={item.url} onChange={(event) => updateCustomImageItem(selectedCustomBlock, item.id, { url: event.target.value })} />
                      <input disabled={!canManageFrontendSettings} placeholder="图片说明" value={item.caption?.zh || item.caption?.en || ""} onChange={(event) => updateCustomImageItem(selectedCustomBlock, item.id, { caption: { ...(item.caption ?? { en: "", zh: "" }), zh: event.target.value, en: item.caption?.en || event.target.value } })} />
                    </div>
                    <div className="visual-image-item-actions">
                      <label className="checkline"><input disabled={!canManageFrontendSettings} type="checkbox" checked={item.enabled} onChange={(event) => updateCustomImageItem(selectedCustomBlock, item.id, { enabled: event.target.checked })} />显示</label>
                      <button disabled={!canManageFrontendSettings} type="button" onClick={() => removeCustomImageItem(selectedCustomBlock, item.id)}>删除</button>
                    </div>
                  </article>
                ))}
                {(selectedCustomBlock.imageItems ?? getCustomBlockImages(selectedCustomBlock)).length === 0 ? <span className="visual-muted">还没有添加图片。</span> : null}
              </div>
            </div>
          ) : null}
          {selectedCustomBlock.type === "cta" ? (
            <>
              <label>按钮文字
                <input value={selectedCustomBlock.buttonLabel?.zh || selectedCustomBlock.buttonLabel?.en || "发送询盘"} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { buttonLabel: { ...(selectedCustomBlock.buttonLabel ?? { en: "", zh: "" }), zh: event.target.value, en: selectedCustomBlock.buttonLabel?.en || event.target.value } })} />
              </label>
              <label>按钮链接
                <input value={selectedCustomBlock.linkUrl || "#rfq"} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { linkUrl: event.target.value })} />
              </label>
              <label className="checkline">
                <input disabled={!canManageFrontendSettings} type="checkbox" checked={selectedCustomBlock.openInNewTab ?? false} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { openInNewTab: event.target.checked })} />
                新窗口打开
              </label>
            </>
          ) : null}
          <label>布局
            <select value={selectedCustomBlock.layout ?? (selectedCustomBlock.type === "image" || selectedCustomBlock.type === "video" ? "media-left" : "stacked")} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { layout: event.target.value as SiteTemplateCustomBlock["layout"] })}>
              <option value="stacked">上下排列</option>
              <option value="media-left">媒体在左</option>
              <option value="media-right">媒体在右</option>
            </select>
          </label>
          <label>对齐
            <select value={selectedCustomBlock.align ?? "left"} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { align: event.target.value as SiteTemplateCustomBlock["align"] })}>
              <option value="left">左对齐</option>
              <option value="center">居中</option>
            </select>
          </label>
          <label>背景
            <select value={selectedCustomBlock.theme ?? (selectedCustomBlock.type === "cta" ? "dark" : "light")} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { theme: event.target.value as SiteTemplateCustomBlock["theme"] })}>
              <option value="light">白色</option>
              <option value="tint">浅色强调</option>
              <option value="dark">深色强调</option>
            </select>
          </label>
          <label>间距
            <select value={selectedCustomBlock.spacing ?? "normal"} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { spacing: event.target.value as SiteTemplateCustomBlock["spacing"] })}>
              <option value="compact">紧凑</option>
              <option value="normal">标准</option>
              <option value="large">宽松</option>
            </select>
          </label>
          <label className="checkline">
            <input disabled={!canManageFrontendSettings} type="checkbox" checked={selectedCustomBlock.enabled} onChange={(event) => updateCustomTemplateBlock(selectedCustomBlock.id, { enabled: event.target.checked })} />
            显示此模块
          </label>
          <button className="danger" disabled={!canManageFrontendSettings} type="button" onClick={() => removeCustomTemplateBlock(selectedCustomBlock.id)}>删除模块</button>
        </div>
      );
    }

    return (
      <div className="visual-properties-panel empty">
        <strong>选择模块</strong>
        <span>点击画布或左侧模块列表后，在这里编辑属性。</span>
      </div>
    );
  }

	  const visualCoreSectionNodes = orderedTemplateSections
	    .filter((section) => templateSettings.visibleSections[section.key])
	    .map((section) => {
	      if (section.key === "navigation") {
	        const visualNavigationItems = sortedNavigation.filter((item) => item.enabled && !item.parentId);
	        return (
	          <section
	            className={`visual-front-navigation${selectedVisualModuleId === "navigation" ? " selected" : ""}`}
	            key={section.key}
	            onClick={() => {
	              setSelectedVisualModuleId("navigation");
	              setVisualBuilderSidebarTab("properties");
	            }}
	          >
	            <div className="visual-front-navigation-inner">
	              <div className="visual-front-brand">
	                <span className="visual-front-brand-mark"><ShieldCheck size={20} /></span>
	                {renderVisualTextTarget({
	                  editorKey: "site-title-navigation",
	                  value: state.siteSettings.title || "KeyproTools",
	                  element: "strong",
	                  onCommit: (value) => updateSiteSettings({ title: value })
	                })}
	              </div>
	              <div className="visual-front-nav-links">
	                {visualNavigationItems.map((item) => (
	                  <Fragment key={item.id}>
	                    {renderVisualTextTarget({
	                      editorKey: `navigation-label-${item.id}`,
	                      value: item.label[locale] || item.label.en,
	                      element: "span",
	                      className: "visual-front-nav-link",
	                      onCommit: (value) => updateNavigationItem(item.id, {
	                        label: {
	                          ...item.label,
	                          [locale]: value,
	                          en: locale === "en" ? value : item.label.en || value
	                        }
	                      })
	                    })}
	                  </Fragment>
	                ))}
	                {visualNavigationItems.length === 0 ? <span className="visual-muted">暂无启用导航项</span> : null}
	              </div>
	              <div className="visual-front-header-actions">
	                <span className="visual-front-language-select">
	                  {locales.find((item) => item.code === locale)?.flag ?? "🌐"} {locales.find((item) => item.code === locale)?.nativeName ?? locale}
	                </span>
	                {renderVisualTextTarget({
	                  editorKey: "navigation-primary-cta",
	                  value: templateSettings.primaryCtaLabel[locale] || templateSettings.primaryCtaLabel.en,
	                  element: "span",
	                  className: "visual-front-nav-cta",
	                  onCommit: (value) => updateTemplateText("primaryCtaLabel", locale === "zh" ? "zh" : "en", value)
	                })}
	              </div>
	            </div>
	          </section>
	        );
	      }

	      if (section.key === "hero") {
	        return (
	          <section
	            className={`visual-front-hero ${templateSettings.homeTemplate}${selectedVisualModuleId === "hero" ? " selected" : ""}`}
	            key={section.key}
	            style={visualHeroImageStyle}
	            onClick={() => {
	              setSelectedVisualModuleId("hero");
	              setVisualBuilderSidebarTab("properties");
	            }}
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
	        );
	      }

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
  const visualCustomSectionNodes = templateSettings.customBlocks
    .filter((block) => block.enabled)
    .map((block) => ({
      key: block.id,
      order: block.order,
      node: (
        <section className={`visual-front-section custom-module ${block.type} theme-${block.theme ?? (block.type === "cta" ? "dark" : "light")} align-${block.align ?? "left"} layout-${block.layout ?? (block.type === "image" || block.type === "video" ? "media-left" : "stacked")} spacing-${block.spacing ?? "normal"}`} key={block.id}>
          <div className="visual-custom-module-bar">
            <span>{block.type === "image" ? "图片模块" : block.type === "video" ? "视频模块" : block.type === "cta" ? "按钮模块" : "文字模块"}</span>
            <div>
              <button disabled={!canManageFrontendSettings} type="button" onClick={() => moveTemplateModule(block.id, "up")} title="上移"><MoveUp size={14} /></button>
              <button disabled={!canManageFrontendSettings} type="button" onClick={() => moveTemplateModule(block.id, "down")} title="下移"><MoveDown size={14} /></button>
              <button disabled={!canManageFrontendSettings} type="button" onClick={() => updateCustomTemplateBlock(block.id, { enabled: false })}>隐藏</button>
              <button className="danger" disabled={!canManageFrontendSettings} type="button" onClick={() => removeCustomTemplateBlock(block.id)}>删除</button>
            </div>
          </div>
          <div className="visual-custom-module-body">
            {block.type === "image" ? renderVisualCustomImageSet(block) : null}
            {block.type === "video" ? renderVisualVideoTarget(block) : null}
            <div className="visual-custom-copy">
              {renderVisualTextTarget({
                editorKey: `custom-eyebrow-${block.id}`,
                value: block.eyebrow?.zh || block.eyebrow?.en || (block.type === "image" ? "图片" : block.type === "video" ? "视频" : block.type === "cta" ? "行动" : "自定义模块"),
                element: "span",
                className: "eyebrow",
                onCommit: (value) => updateCustomTemplateBlock(block.id, { eyebrow: { ...(block.eyebrow ?? { en: "", zh: "" }), zh: value, en: block.eyebrow?.en || value } })
              })}
              {renderVisualTextTarget({
                editorKey: `custom-title-${block.id}`,
                value: block.title.zh || block.title.en,
                element: "h3",
                multiline: true,
                onCommit: (value) => updateCustomTemplateBlock(block.id, { title: { ...block.title, zh: value, en: block.title.en || value } })
              })}
              {renderVisualTextTarget({
                editorKey: `custom-body-${block.id}`,
                value: block.body.zh || block.body.en,
                element: "p",
                multiline: true,
                allowEmpty: true,
                onCommit: (value) => updateCustomTemplateBlock(block.id, { body: { ...block.body, zh: value, en: block.body.en || value } })
              })}
              {block.type === "cta" ? (
                <span className="visual-rfq-button" title="在左侧属性面板编辑链接">
                  {block.buttonLabel?.zh || block.buttonLabel?.en || block.title.zh || block.title.en}
                </span>
              ) : null}
            </div>
          </div>
        </section>
      )
    }));
  const orderedVisualSectionItems = [...visualCoreSectionNodes.map((node) => {
    const key = node.key as HomeSectionKey;
    return { key, order: templateSettings.sectionOrder[key], node };
  }), ...visualCustomSectionNodes]
    .sort((a, b) => a.order - b.order);
  const renderVisualAddModuleBar = (afterOrder: number, label: string, uniqueKey: string) => (
    <div
      className={visualDropTarget === `after-${afterOrder}` ? "visual-add-inline active" : "visual-add-inline"}
      key={`visual-add-${uniqueKey}`}
      onDragEnter={() => setVisualDropTarget(`after-${afterOrder}`)}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = visualDraggingModuleId ? "move" : "copy";
        setVisualDropTarget(`after-${afterOrder}`);
      }}
      onDragLeave={() => setVisualDropTarget(null)}
      onDrop={(event) => dropVisualModule(event, afterOrder)}
    >
      <span><PlusCircle size={15} />{label}</span>
      <button disabled={!canManageFrontendSettings} type="button" onClick={() => addCustomTemplateBlock("text", afterOrder)}><Type size={14} />文字</button>
      <button disabled={!canManageFrontendSettings} type="button" onClick={() => addCustomTemplateBlock("image", afterOrder)}><ImageIcon size={14} />图片</button>
      <button disabled={!canManageFrontendSettings} type="button" onClick={() => addCustomTemplateBlock("video", afterOrder)}><Video size={14} />视频</button>
      <button disabled={!canManageFrontendSettings} type="button" onClick={() => addCustomTemplateBlock("cta", afterOrder)}><SendToBack size={14} />按钮</button>
    </div>
  );
  const renderVisualLayerLabel = (moduleId: string) => {
    const coreSection = homeSectionOptions.find((section) => section.key === moduleId);
    if (coreSection) return coreSection.label;
    const customBlock = templateSettings.customBlocks.find((block) => block.id === moduleId);
    if (!customBlock) return moduleId;
    return customBlock.title.zh || customBlock.title.en || (customBlock.type === "image" ? "图片模块" : customBlock.type === "video" ? "视频模块" : customBlock.type === "cta" ? "按钮模块" : "文字模块");
  };
  const renderVisualLayerType = (moduleId: string) => {
    const coreSection = homeSectionOptions.find((section) => section.key === moduleId);
    if (coreSection) return "系统模块";
    const customBlock = templateSettings.customBlocks.find((block) => block.id === moduleId);
    if (!customBlock) return "模块";
    return customBlock.type === "image" ? "图片" : customBlock.type === "video" ? "视频" : customBlock.type === "cta" ? "按钮" : "文字";
  };
	  const visualSectionNodes = orderedVisualSectionItems.map((item, index) => (
	    <Fragment key={`module-group-${String(item.key)}`}>
		    <div
	      className={[
	        "visual-canvas-module",
		        selectedVisualModuleId === item.key ? "selected" : "",
		        visualDropTarget === `module-${item.key}` ? "drop-target" : ""
		      ].filter(Boolean).join(" ")}
		      draggable={canManageFrontendSettings}
		      key={`canvas-${item.key}`}
			      onClick={() => {
			        setSelectedVisualModuleId(String(item.key));
			        setVisualBuilderSidebarTab("properties");
			      }}
		      onDragEnter={() => setVisualDropTarget(`module-${item.key}`)}
	      onDragOver={(event) => {
	        event.preventDefault();
		        event.dataTransfer.dropEffect = visualDraggingModuleId ? "move" : "copy";
		        setVisualDropTarget(`module-${item.key}`);
		      }}
		      onDragStart={(event) => startVisualModuleDrag(event, String(item.key))}
			      onDrop={(event) => {
			        const rect = event.currentTarget.getBoundingClientRect();
			        const placement = event.clientY < rect.top + rect.height / 2 ? "before" : "after";
			        dropVisualModuleOnTarget(event, String(item.key), placement);
			      }}
		      onDragEnd={() => {
		        setVisualDraggingModuleId(null);
		        setVisualDropTarget(null);
		      }}
		    >
		      <div className="visual-canvas-toolbar">
		        <span
		          className="visual-canvas-handle"
		          draggable={canManageFrontendSettings}
		          onDragStart={(event) => startVisualModuleDrag(event, String(item.key))}
			        >
			          <MoveUp size={13} />拖拽模块
			        </span>
			        <button
			          disabled={!canManageFrontendSettings}
			          type="button"
			          onClick={(event) => {
			            event.stopPropagation();
			            moveTemplateModule(String(item.key), "up");
			          }}
			          title="上移"
			        >
			          <MoveUp size={13} />上移
			        </button>
			        <button
			          disabled={!canManageFrontendSettings}
			          type="button"
			          onClick={(event) => {
			            event.stopPropagation();
			            moveTemplateModule(String(item.key), "down");
			          }}
			          title="下移"
			        >
			          <MoveDown size={13} />下移
			        </button>
			        {homeSectionOptions.some((section) => section.key === item.key) ? (
		          <button
		            className="danger"
		            disabled={!canManageFrontendSettings}
		            type="button"
		            onClick={(event) => {
		              event.stopPropagation();
		              updateTemplateSectionVisibility(item.key as HomeSectionKey, false);
		              setStatus("已隐藏首页模块，点击保存编辑生效");
		            }}
		          >
		            <Trash2 size={13} />删除
		          </button>
		        ) : (
		          <button
		            className="danger"
		            disabled={!canManageFrontendSettings}
		            type="button"
		            onClick={(event) => {
		              event.stopPropagation();
		              removeCustomTemplateBlock(String(item.key));
		            }}
		          >
		            <Trash2 size={13} />删除
		          </button>
		        )}
		      </div>
		      {item.node}
		    </div>
      {renderVisualAddModuleBar(item.order, index === orderedVisualSectionItems.length - 1 ? "在页面底部添加模块" : "在这里添加模块", `${String(item.key)}-${index}-${item.order}`)}
    </Fragment>
  ));
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
  const mediaPickerDialog = mediaPickerTarget ? (
    <div className="media-picker-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setMediaPickerTarget(null);
    }}>
      <section className="media-picker-modal" role="dialog" aria-modal="true" aria-label="选择媒体文件">
        <div className="media-picker-head">
          <div>
            <h2>选择媒体文件</h2>
            <span>{mediaPickerTarget === "page" ? "从媒体库选择文件插入当前页面正文。" : "从媒体库选择文件插入当前文章正文。"}</span>
          </div>
          <button type="button" aria-label="关闭媒体库" onClick={() => setMediaPickerTarget(null)}>
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
              <button type="button" className="media-picker-item" key={file.id} onClick={() => insertExistingFileIntoContent(file)}>
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
  ) : null;
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
                  <div>
                    <h2>世界主要城市时间</h2>
                    <span>先选择国家/地区，再选择城市；系统会自动带出对应 IANA 时区。</span>
                  </div>
                </div>
                <div className="world-clock-manager">
                  <label>
                    国家/地区
                    <select
                      disabled={!canManageFrontendSettings}
                      value={worldClockForm.country}
                      onChange={(event) => setWorldClockForm({ country: event.target.value, city: "", zone: "" })}
                    >
                      <option value="">选择国家/地区</option>
                      {worldClockCountryOptions.map((country) => <option key={country} value={country}>{country}</option>)}
                    </select>
                  </label>
                  <label>
                    城市
                    <select
                      disabled={!canManageFrontendSettings || !worldClockForm.country}
                      value={worldClockForm.city}
                      onChange={(event) => {
                        const nextCity = worldClockCityCatalog.find((city) => city.id === event.target.value);
                        setWorldClockForm({
                          country: nextCity?.country ?? worldClockForm.country,
                          city: nextCity?.id ?? "",
                          zone: nextCity?.zone ?? ""
                        });
                      }}
                    >
                      <option value="">{worldClockForm.country ? "选择城市" : "请先选择国家/地区"}</option>
                      {worldClockCityOptions.map((city) => <option key={city.id} value={city.id}>{city.city}</option>)}
                    </select>
                  </label>
                  <label>
                    时区
                    <input
                      readOnly
                      disabled={!canManageFrontendSettings || !selectedWorldClockCity}
                      value={selectedWorldClockCity?.zone ?? ""}
                      placeholder="选择城市后自动显示"
                    />
                  </label>
                  <button disabled={!canManageFrontendSettings || !selectedWorldClockCity} type="button" onClick={addWorldClockCity}>
                    <PlusCircle size={15} />添加城市
                  </button>
                  {selectedWorldClockCityExists ? (
                    <span className="world-clock-form-note">{selectedWorldClockCity?.country} {selectedWorldClockCity?.city} 已经在下方世界时钟中。</span>
                  ) : null}
                </div>
                <div className="world-clock-grid">
                  {worldClocks.map((clock) => (
                    <article className="world-clock-card" key={clock.id}>
                      <button
                        aria-label={`删除${clock.city}`}
                        className="world-clock-delete"
                        disabled={!canManageFrontendSettings}
                        title={`删除${clock.city}`}
                        type="button"
                        onClick={() => removeWorldClockCity(clock.id)}
                      >
                        <X size={12} />
                      </button>
                      <span>{clock.city}</span>
                      <small>{clock.country} · {clock.offset}</small>
                      <strong>{clock.time}</strong>
                      <small>{clock.date} · {clock.beijingDiff}</small>
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
                  <label>SEO 标题
                    <input value={productForm.seoTitleZh} onChange={(event) => setProductForm({ ...productForm, seoTitleZh: event.target.value })} />
                    <small>留空时自动使用分类名称；正式上线前建议按语种补齐。</small>
                  </label>
                  <label>SEO 描述
                    <textarea value={productForm.seoDescriptionZh} onChange={(event) => setProductForm({ ...productForm, seoDescriptionZh: event.target.value })} />
                    <small>建议 80-160 字，说明规格、应用、采购价值和 RFQ 信息。</small>
                  </label>
                  <label>OG 图片 URL
                    <input value={productForm.seoOgImageUrl} onChange={(event) => setProductForm({ ...productForm, seoOgImageUrl: event.target.value })} />
                    <small>社媒分享图；留空时使用产品图片。</small>
                  </label>
                  <label>Canonical URL
                    <input value={productForm.seoCanonicalUrl} onChange={(event) => setProductForm({ ...productForm, seoCanonicalUrl: event.target.value })} />
                    <small>通常留空，由系统自动生成当前语种 URL。</small>
                  </label>
                  <label className="checkline"><input type="checkbox" checked={productForm.seoIndexable} onChange={(event) => setProductForm({ ...productForm, seoIndexable: event.target.checked })} />允许进入 sitemap / 被索引</label>
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
                      const treeExpanded = productSearchActive || expandedProductSet.has(productId);
                      const productSummary = product.summary.zh || product.summary.en || "";
                      const hasLongSummary = productSummary.length > PRODUCT_SUMMARY_PREVIEW_LIMIT;
                      const summaryExpanded = expandedProductDescriptionIds.includes(productId);
                      const quickEditing = quickEditingProductId === productId;
                      const inlineNameEditing = inlineEditingProduct?.productId === productId && inlineEditingProduct.field === "name";
                      const inlineSummaryEditing = inlineEditingProduct?.productId === productId && inlineEditingProduct.field === "summary";
                      const inlineSlugEditing = inlineEditingProduct?.productId === productId && inlineEditingProduct.field === "slug";
                      const inlineParentEditing = inlineEditingProduct?.productId === productId && inlineEditingProduct.field === "parentId";

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
                            <div className="taxonomy-title-stack">
                              {quickEditing || inlineNameEditing ? (
                                <div className="taxonomy-quick-edit">
                                  <input
                                    aria-label={`${product.name.zh || product.name.en} 编辑名称`}
                                    autoFocus
                                    value={inlineNameEditing ? inlineEditingProduct.value : quickEditingProductName}
                                    onChange={(event) => inlineNameEditing
                                      ? setInlineEditingProduct({ field: "name", productId, value: event.target.value })
                                      : setQuickEditingProductName(event.target.value)}
                                    onKeyDown={(event) => {
                                      if (inlineNameEditing) {
                                        handleProductInlineEditKeyDown(event);
                                        return;
                                      }
                                      if (event.key === "Enter") saveProductQuickEdit(productId);
                                      if (event.key === "Escape") cancelProductQuickEdit();
                                    }}
                                  />
                                  <div className="taxonomy-quick-edit-actions">
                                    <button type="button" onClick={() => inlineNameEditing ? saveProductInlineEdit() : saveProductQuickEdit(productId)}>保存</button>
                                    <button type="button" onClick={inlineNameEditing ? cancelProductInlineEdit : cancelProductQuickEdit}>取消</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <button className="taxonomy-edit-trigger" type="button" onClick={() => editProduct(product)} onDoubleClick={() => startProductInlineEdit(product, "name")}>
                                    <span className="taxonomy-name">{product.name.zh || product.name.en}</span>
                                  </button>
                                  <div className="taxonomy-row-actions" aria-label={`${product.name.zh || product.name.en} 分类操作`}>
                                    {childCount > 0 ? (
                                      <button
                                        aria-expanded={treeExpanded}
                                        className="taxonomy-tree-toggle"
                                        disabled={productSearchActive}
                                        type="button"
                                        onClick={() => toggleProductExpanded(productId)}
                                        aria-label={`${treeExpanded ? "收起" : "展开"} ${product.name.zh || product.name.en} 的子分类`}
                                      >
                                        {treeExpanded ? "收起" : "展开"}
                                      </button>
                                    ) : null}
                                    <button type="button" onClick={() => editProduct(product)}>编辑</button>
                                    <button type="button" onClick={() => startProductInlineEdit(product, "name")}>快速编辑</button>
                                    <Link href={`/${locale}/products/${product.slug}`} target="_blank" rel="noreferrer">查看</Link>
                                  </div>
                                </>
                              )}
                            </div>
                            {childCount > 0 ? <span className="taxonomy-child-count">子目录 {childCount}</span> : null}
                          </div>
                          <div className="taxonomy-description-cell">
                            {inlineSummaryEditing ? (
                              <div className="taxonomy-quick-edit taxonomy-quick-edit-wide">
                                <textarea
                                  aria-label={`${product.name.zh || product.name.en} 编辑描述`}
                                  autoFocus
                                  value={inlineEditingProduct.value}
                                  onChange={(event) => setInlineEditingProduct({ field: "summary", productId, value: event.target.value })}
                                  onKeyDown={handleProductInlineEditKeyDown}
                                />
                                <div className="taxonomy-quick-edit-actions">
                                  <button type="button" onClick={saveProductInlineEdit}>保存</button>
                                  <button type="button" onClick={cancelProductInlineEdit}>取消</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span
                                  className={hasLongSummary ? "taxonomy-description-preview is-clamped is-editable" : "taxonomy-description-preview is-editable"}
                                  onDoubleClick={() => startProductInlineEdit(product, "summary")}
                                  title="双击编辑描述"
                                >
                                  {productSummary || "-"}
                                </span>
                                {hasLongSummary ? (
                                  <button
                                    aria-expanded={summaryExpanded}
                                    className="taxonomy-description-toggle"
                                    type="button"
                                    onClick={() => setExpandedProductDescriptionIds((current) => current.includes(productId)
                                      ? current.filter((item) => item !== productId)
                                      : [...current, productId])}
                                  >
                                    {summaryExpanded ? "收起完整描述" : "展开完整描述"}
                                  </button>
                                ) : null}
                              </>
                            )}
                          </div>
                          <span className="taxonomy-inline-cell" onDoubleClick={() => startProductInlineEdit(product, "slug")} title="双击编辑别名">
                            {inlineSlugEditing ? (
                              <span className="taxonomy-quick-edit">
                                <input
                                  aria-label={`${product.name.zh || product.name.en} 编辑别名`}
                                  autoFocus
                                  value={inlineEditingProduct.value}
                                  onChange={(event) => setInlineEditingProduct({ field: "slug", productId, value: event.target.value })}
                                  onKeyDown={handleProductInlineEditKeyDown}
                                />
                                <span className="taxonomy-quick-edit-actions">
                                  <button type="button" onClick={saveProductInlineEdit}>保存</button>
                                  <button type="button" onClick={cancelProductInlineEdit}>取消</button>
                                </span>
                              </span>
                            ) : product.slug}
                          </span>
                          <span className="taxonomy-inline-cell" onDoubleClick={() => startProductInlineEdit(product, "parentId")} title="双击编辑父级">
                            {inlineParentEditing ? (
                              <span className="taxonomy-quick-edit">
                                <select
                                  aria-label={`${product.name.zh || product.name.en} 编辑父级`}
                                  autoFocus
                                  value={inlineEditingProduct.value}
                                  onChange={(event) => setInlineEditingProduct({ field: "parentId", productId, value: event.target.value })}
                                  onKeyDown={handleProductInlineEditKeyDown}
                                >
                                  <option value="">无</option>
                                  {state.products
                                    .filter((item) => (item.id ?? item.slug) !== productId)
                                    .map((item) => (
                                      <option key={item.id ?? item.slug} value={item.id ?? item.slug}>{item.name.zh || item.name.en}</option>
                                    ))}
                                </select>
                                <span className="taxonomy-quick-edit-actions">
                                  <button type="button" onClick={saveProductInlineEdit}>保存</button>
                                  <button type="button" onClick={cancelProductInlineEdit}>取消</button>
                                </span>
                              </span>
                            ) : parent ? parent.name.zh || parent.name.en : "-"}
                          </span>
                          <span>0</span>
                          {hasLongSummary && summaryExpanded ? (
                            <div className="taxonomy-description-expanded">
                              {productSummary}
                            </div>
                          ) : null}
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
                      <div className="admin-markdown-field">
                        <span className="admin-markdown-label">页面正文</span>
                        <AdminMarkdownEditor
                          editorId={`page-${activePage.id ?? activePage.slug}-${locale}`}
                          onChange={updatePageBody}
                          onImageUpload={(file) => uploadMarkdownEditorImage("page", file)}
                          placeholder="在这里填写页面内容。"
                          ref={pageMarkdownEditorRef}
                          toolbarActions={renderMarkdownEditorToolbarActions("page")}
                          value={pickLocalizedText(activePage.body, locale)}
                        />
                      </div>
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
                              <div className="translation-quick-controls">
                                <label>源语言
                                  <select value={translationSourceLocale} onChange={(event) => setTranslationSourceLocale(event.target.value as TranslationSourceChoice)}>
                                    <option value="auto">自动识别</option>
                                    {translationLocaleOptions.map((localeOption) => <option key={localeOption.code} value={localeOption.code}>{localeOption.flag} {localeOption.nativeName}</option>)}
                                  </select>
                                </label>
                                <label>目标语言
                                  <select value={translationTargetLocale} onChange={(event) => setTranslationTargetLocale(event.target.value as TranslationTargetChoice)}>
                                    <option value="all">全部启用语言</option>
                                    {translationLocaleOptions.map((localeOption) => <option key={localeOption.code} value={localeOption.code}>{localeOption.flag} {localeOption.nativeName}</option>)}
                                  </select>
                                </label>
                              </div>
                              <button className="full" type="button" disabled={!canRunAutoTranslation || translationRunning} onClick={() => runAutoTranslation("page", activePage.id ?? activePage.slug)}>自动翻译当前页面</button>
                              <button className="danger full" type="button" onClick={moveActivePageToTrash}>移至回收站</button>
                            </>
                          )}
                        </div>
                      </section>

                      <section className="wp-side-box">
                        <h2>SEO</h2>
                        <label>SEO 标题
                          <input
                            value={activePage.seo?.title?.zh ?? ""}
                            onChange={(event) => updateActivePage({
                              seo: {
                                ...(activePage.seo ?? {}),
                                title: { en: activePage.seo?.title?.en || event.target.value, zh: event.target.value }
                              }
                            })}
                          />
                        </label>
                        <label>SEO 描述
                          <textarea
                            value={activePage.seo?.description?.zh ?? ""}
                            onChange={(event) => updateActivePage({
                              seo: {
                                ...(activePage.seo ?? {}),
                                description: { en: activePage.seo?.description?.en || event.target.value, zh: event.target.value }
                              }
                            })}
                          />
                        </label>
                        <label>OG 图片 URL
                          <input value={activePage.seo?.ogImageUrl ?? ""} onChange={(event) => updateActivePage({ seo: { ...(activePage.seo ?? {}), ogImageUrl: event.target.value } })} />
                        </label>
                        <label>Canonical URL
                          <input value={activePage.seo?.canonicalUrl ?? ""} onChange={(event) => updateActivePage({ seo: { ...(activePage.seo ?? {}), canonicalUrl: event.target.value } })} />
                        </label>
                        <label className="checkline">
                          <input type="checkbox" checked={activePage.seo?.indexable !== false} onChange={(event) => updateActivePage({ seo: { ...(activePage.seo ?? {}), indexable: event.target.checked } })} />
                          允许进入 sitemap / 被索引
                        </label>
                        <span>留空时系统会用页面标题和摘要自动生成。</span>
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

              {videoDialogTarget === "page" ? (
                <div className="media-picker-overlay" role="presentation" onMouseDown={(event) => {
                  if (event.target === event.currentTarget) closeVideoDialog();
                }}>
                  <section className="video-link-dialog" role="dialog" aria-modal="true" aria-label="插入视频链接">
                    <div className="media-picker-head">
                      <div>
                        <h2>插入视频</h2>
                        <span>粘贴视频网站或 mp4/webm 视频文件链接。</span>
                      </div>
                      <button type="button" aria-label="关闭视频弹窗" onClick={closeVideoDialog}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className="video-link-dialog-body">
                      <label>视频链接
                        <input
                          autoFocus
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={videoDialogUrl}
                          onChange={(event) => setVideoDialogUrl(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") insertVideoFromDialog();
                            if (event.key === "Escape") closeVideoDialog();
                          }}
                        />
                      </label>
                    </div>
                    <div className="video-link-dialog-actions">
                      <button type="button" onClick={closeVideoDialog}>取消</button>
                      <button className="primary" type="button" onClick={insertVideoFromDialog}><Video size={16} />插入视频</button>
                    </div>
                  </section>
                </div>
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
                  {canImportArticles ? (
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
                  ) : null}

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
                      <div className="admin-markdown-field">
                        <span className="admin-markdown-label">文章正文</span>
                        <AdminMarkdownEditor
                          editorId={`article-${activeArticle.id ?? activeArticle.slug}-${locale}`}
                          onChange={updateArticleBody}
                          onImageUpload={(file) => uploadMarkdownEditorImage("article", file)}
                          placeholder="在这里填写文章正文。"
                          ref={articleMarkdownEditorRef}
                          toolbarActions={renderMarkdownEditorToolbarActions("article")}
                          value={activeArticleBody}
                        />
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
                              <button className="primary" type="button" onClick={publishActiveArticle}>发布</button>
                              <div className="translation-quick-controls">
                                <label>源语言
                                  <select value={translationSourceLocale} onChange={(event) => setTranslationSourceLocale(event.target.value as TranslationSourceChoice)}>
                                    <option value="auto">自动识别</option>
                                    {translationLocaleOptions.map((localeOption) => <option key={localeOption.code} value={localeOption.code}>{localeOption.flag} {localeOption.nativeName}</option>)}
                                  </select>
                                </label>
                                <label>目标语言
                                  <select value={translationTargetLocale} onChange={(event) => setTranslationTargetLocale(event.target.value as TranslationTargetChoice)}>
                                    <option value="all">全部启用语言</option>
                                    {translationLocaleOptions.map((localeOption) => <option key={localeOption.code} value={localeOption.code}>{localeOption.flag} {localeOption.nativeName}</option>)}
                                  </select>
                                </label>
                              </div>
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
                            <button className="article-media-open-button" type="button" onClick={() => setMediaPickerTarget("article")}>
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
                        <h2>SEO</h2>
                        <label>SEO 标题
                          <input
                            value={activeArticle.seo?.title?.zh ?? ""}
                            onChange={(event) => updateActiveArticle({
                              seo: {
                                ...(activeArticle.seo ?? {}),
                                title: { en: activeArticle.seo?.title?.en || event.target.value, zh: event.target.value }
                              }
                            })}
                          />
                        </label>
                        <label>SEO 描述
                          <textarea
                            value={activeArticle.seo?.description?.zh ?? ""}
                            onChange={(event) => updateActiveArticle({
                              seo: {
                                ...(activeArticle.seo ?? {}),
                                description: { en: activeArticle.seo?.description?.en || event.target.value, zh: event.target.value }
                              }
                            })}
                          />
                        </label>
                        <label>OG 图片 URL
                          <input value={activeArticle.seo?.ogImageUrl ?? ""} onChange={(event) => updateActiveArticle({ seo: { ...(activeArticle.seo ?? {}), ogImageUrl: event.target.value } })} />
                        </label>
                        <label>Canonical URL
                          <input value={activeArticle.seo?.canonicalUrl ?? ""} onChange={(event) => updateActiveArticle({ seo: { ...(activeArticle.seo ?? {}), canonicalUrl: event.target.value } })} />
                        </label>
                        <label className="checkline">
                          <input type="checkbox" checked={activeArticle.seo?.indexable !== false} onChange={(event) => updateActiveArticle({ seo: { ...(activeArticle.seo ?? {}), indexable: event.target.checked } })} />
                          允许进入 sitemap / 被索引
                        </label>
                        <span>留空时系统会用文章标题、摘要和特色图自动生成。</span>
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

              {videoDialogTarget === "article" ? (
                <div className="media-picker-overlay" role="presentation" onMouseDown={(event) => {
                  if (event.target === event.currentTarget) closeVideoDialog();
                }}>
                  <section className="video-link-dialog" role="dialog" aria-modal="true" aria-label="插入视频链接">
                    <div className="media-picker-head">
                      <div>
                        <h2>插入视频</h2>
                        <span>粘贴视频网站或 mp4/webm 视频文件链接。</span>
                      </div>
                      <button type="button" aria-label="关闭视频弹窗" onClick={closeVideoDialog}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className="video-link-dialog-body">
                      <label>视频链接
                        <input
                          autoFocus
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={videoDialogUrl}
                          onChange={(event) => setVideoDialogUrl(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") insertVideoFromDialog();
                            if (event.key === "Escape") closeVideoDialog();
                          }}
                        />
                      </label>
                    </div>
                    <div className="video-link-dialog-actions">
                      <button type="button" onClick={closeVideoDialog}>取消</button>
                      <button className="primary" type="button" onClick={insertVideoFromDialog}><Video size={16} />插入视频</button>
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
              <section className="lead-workbench">
                <div className="lead-command-bar">
                  <div>
                    <h1>询盘工作台</h1>
                    <span>集中处理 RFQ、联系方式、目的地和跟进状态。</span>
                  </div>
                  <div className="lead-total-card">
                    <small>当前视图</small>
                    <strong>{filteredLeads.length}</strong>
                    <span>总计 {state.leads.length} 条</span>
                  </div>
                </div>

                <div className="lead-status-summary" aria-label="询盘状态概览">
                  <button className={leadStatusFilter === "all" ? "lead-stat-card is-active" : "lead-stat-card"} type="button" onClick={() => setLeadStatusFilter("all")}>
                    <small>全部</small>
                    <strong>{state.leads.length}</strong>
                    <span>All RFQs</span>
                  </button>
                  {leadStatuses.map((statusOption) => (
                    <button
                      className={leadStatusFilter === statusOption ? `lead-stat-card is-active lead-stat-${statusOption}` : `lead-stat-card lead-stat-${statusOption}`}
                      key={statusOption}
                      type="button"
                      onClick={() => setLeadStatusFilter(statusOption)}
                    >
                      <small>{leadStatusLabels[statusOption]}</small>
                      <strong>{leadStatusCounts[statusOption]}</strong>
                      <span>{statusOption}</span>
                    </button>
                  ))}
                </div>

                <div className="lead-filter-toolbar">
                  <label>
                    <span>状态</span>
                    <select value={leadStatusFilter} onChange={(event) => setLeadStatusFilter(event.target.value as "all" | LeadStatus)}>
                      <option value="all">全部状态</option>
                      {leadStatuses.map((statusOption) => <option key={statusOption} value={statusOption}>{leadStatusLabels[statusOption]}</option>)}
                    </select>
                  </label>
                  <label className="lead-search-field">
                    <span>搜索</span>
                    <input placeholder="姓名、邮箱、产品、地区、材料" value={leadQuery} onChange={(event) => setLeadQuery(event.target.value)} />
                  </label>
                  <span className="lead-filter-count">{filteredLeads.length} / {state.leads.length} 条询盘</span>
                </div>
              </section>

              <div className="admin-table lead-list">
                {state.leads.length === 0 ? <p>暂无询盘。前台提交 RFQ 后会自动进入这里。</p> : null}
                {filteredLeads.map((lead) => (
                  <article className="admin-row lead-row" key={lead.id}>
                    <div className="lead-card-head">
                      <div>
                        <small>客户</small>
                        <strong>{lead.fullName || "未填写姓名"}</strong>
                        <span>{lead.company || "No company"}</span>
                      </div>
                      <span className={`lead-status-pill lead-status-${lead.status}`}>{leadStatusLabels[lead.status]}</span>
                    </div>
                    <div className="lead-cell lead-cell-product" title="双击复制产品" onDoubleClick={() => copyTextToClipboard(lead.productType || "", "产品已复制")}>
                      <small>产品</small>
                      <strong>{lead.productType || "No product"}</strong>
                    </div>
                    <div className="lead-cell" title="双击复制数量" onDoubleClick={() => copyTextToClipboard(lead.quantity || "", "数量已复制")}>
                      <small>数量</small>
                      <span>{lead.quantity || "No quantity"}</span>
                    </div>
                    <div className="lead-cell" title="双击复制邮箱" onDoubleClick={() => copyTextToClipboard(lead.email || "", "邮箱已复制")}>
                      <small>邮箱</small>
                      <span>{lead.email || "No email"}</span>
                    </div>
                    <div className="lead-cell" title="双击复制联系方式" onDoubleClick={() => copyTextToClipboard(lead.whatsapp || "No WhatsApp / Phone", "联系方式已复制")}>
                      <small>联系方式</small>
                      <span>{lead.whatsapp || "No WhatsApp / Phone"}</span>
                    </div>
                    <div className="lead-cell" title="双击复制目的地" onDoubleClick={() => copyTextToClipboard(lead.destination || "No destination", "目的地已复制")}>
                      <small>目的地</small>
                      <span>{lead.destination || "No destination"}</span>
                    </div>
                    <div className="lead-cell" title="双击复制材料" onDoubleClick={() => copyTextToClipboard(lead.workpieceMaterial || "No material", "材料已复制")}>
                      <small>材料</small>
                      <span>{lead.workpieceMaterial || "No material"}</span>
                    </div>
                    <div className="lead-cell" title="双击复制姓名" onDoubleClick={() => copyTextToClipboard(lead.fullName || "未填写姓名", "姓名已复制")}>
                      <small>姓名</small>
                      <span>{lead.fullName || "未填写姓名"}</span>
                    </div>
                    <div className="lead-cell" title="双击复制公司" onDoubleClick={() => copyTextToClipboard(lead.company || "No company", "公司已复制")}>
                      <small>公司</small>
                      <span>{lead.company || "No company"}</span>
                    </div>
                    <div className="lead-actions">
                      <span className="lead-date"><small>提交时间</small>{new Date(lead.createdAt).toLocaleString()}</span>
                      <select
                        aria-label="更新询盘状态"
                        value={lead.status}
                        onChange={(event) =>
                          setState({
                            ...state,
                            leads: state.leads.map((item) => item.id === lead.id ? { ...item, status: event.target.value as LeadStatus } : item)
                          })
                        }
                      >
                        {leadStatuses.map((statusOption) => <option key={statusOption} value={statusOption}>{leadStatusLabels[statusOption]}</option>)}
                      </select>
                      <button type="button" onClick={() => copyTextToClipboard(formatLeadForCopy(lead), "整条询盘已复制")}><Copy size={14} />复制</button>
                      {lead.email ? <button type="button" onClick={() => openLeadMailDraft(lead)}><Mail size={14} />发邮件</button> : null}
                    </div>
                    {lead.message ? <p className="lead-message">{lead.message}</p> : null}
                  </article>
                ))}
                {state.leads.length > 0 && filteredLeads.length === 0 ? <div className="wp-empty-row">没有匹配的询盘。</div> : null}
              </div>
            </>
          ) : null}

          {tab === "mail" ? (
            <>
              <h1>邮件设置</h1>
              {selectedMailLead && selectedMailDraft ? (
                <section className="settings-panel mail-draft-panel">
                  <div className="settings-panel-head with-action">
                    <div>
                      <h2>询盘邮件草稿</h2>
                      <span>已从询盘带入收件人、主题和正文，可真实发送或用本机邮件客户端兜底打开。</span>
                    </div>
                    <div className="mail-action-group">
                      <button className="mail-draft-send" disabled={mailActionRunning} type="button" onClick={sendSelectedLeadMail}><Mail size={15} />发送邮件</button>
                      <a className="mail-draft-send secondary" href={buildLeadReplyMailto(selectedMailLead)}><Mail size={15} />打开邮件客户端</a>
                    </div>
                  </div>
                  <div className="mail-draft-grid">
                    <label>收件人<input readOnly value={selectedMailLead.email} /></label>
                    <label>主题<input readOnly value={selectedMailDraft.subject} /></label>
                    <label className="wide">正文<textarea readOnly rows={9} value={`${selectedMailDraft.body}\n\n---\n${formatLeadForCopy(selectedMailLead)}`} /></label>
                  </div>
                </section>
              ) : null}
              <section className="settings-panel mail-settings-panel">
                <div className="settings-panel-head with-action">
                  <div><h2>绑定邮箱</h2><span>用于询盘列表里的“发邮件”入口；支持本机邮件客户端、SMTP 授权码和第三方邮件 API。</span></div>
                  {settingsSaveAction}
                </div>
                {mailActionStatus ? <div className="mail-status-note">{mailActionStatus}</div> : null}
                <div className="wp-settings-form mail-settings-form">
                  <label>发件人邮箱
                    <input
                      disabled={!canManageFrontendSettings}
                      type="email"
                      value={state.siteSettings.mailFromEmail || state.siteSettings.adminEmail}
                      onChange={(event) => updateSiteSettings({ mailFromEmail: event.target.value })}
                    />
                  </label>
                  <label>发件人名称
                    <input
                      disabled={!canManageFrontendSettings}
                      value={state.siteSettings.mailFromName || state.siteSettings.title}
                      onChange={(event) => updateSiteSettings({ mailFromName: event.target.value })}
                    />
                  </label>
                  <label>回复邮箱
                    <input
                      disabled={!canManageFrontendSettings}
                      type="email"
                      value={state.siteSettings.mailReplyToEmail || state.siteSettings.mailFromEmail || state.siteSettings.adminEmail}
                      onChange={(event) => updateSiteSettings({ mailReplyToEmail: event.target.value })}
                    />
                  </label>
                  <label>发送方式
                    <select
                      disabled={!canManageFrontendSettings}
                      value={mailProvider}
                      onChange={(event) => updateSiteSettings({ mailProvider: event.target.value as AdminState["siteSettings"]["mailProvider"] })}
                    >
                      <option value="mailto">本机邮件客户端</option>
                      <option value="smtp">SMTP 邮箱授权码</option>
                      <option value="http">第三方邮件 API / Cloudflare 兼容</option>
                    </select>
                  </label>
                  {mailProvider === "smtp" ? (
                    <div className="mail-provider-card wide">
                      <div className="mail-provider-card-head">
                        <strong>SMTP 邮箱授权码</strong>
                        <span>适合 QQ、163、Gmail、Outlook 和企业邮箱；保存后可立即发送测试邮件。</span>
                      </div>
                      <label>SMTP 服务器
                        <input disabled={!canManageFrontendSettings} placeholder="smtp.qq.com / smtp.gmail.com" value={state.siteSettings.mailSmtpHost || ""} onChange={(event) => updateSiteSettings({ mailSmtpHost: event.target.value })} />
                      </label>
                      <label>SMTP 端口
                        <input disabled={!canManageFrontendSettings} min={1} type="number" value={state.siteSettings.mailSmtpPort || 465} onChange={(event) => updateSiteSettings({ mailSmtpPort: Number(event.target.value) || 465 })} />
                      </label>
                      <label>SMTP 账号
                        <input disabled={!canManageFrontendSettings} value={state.siteSettings.mailSmtpUser || ""} onChange={(event) => updateSiteSettings({ mailSmtpUser: event.target.value })} />
                      </label>
                      <label>授权码 / 密码
                        <input
                          disabled={!canManageFrontendSettings}
                          placeholder={smtpPasswordConfigured ? "已配置，留空则不修改" : "请输入邮箱授权码或 SMTP 密码"}
                          type="password"
                          value={state.siteSettings.mailSmtpPassword || ""}
                          onChange={(event) => updateSiteSettings({ mailSmtpPassword: event.target.value })}
                        />
                      </label>
                      <label className="checkline"><input disabled={!canManageFrontendSettings} type="checkbox" checked={state.siteSettings.mailSmtpSecure !== false} onChange={(event) => updateSiteSettings({ mailSmtpSecure: event.target.checked })} />使用 SSL/TLS 安全连接</label>
                      <div className="mail-provider-help">QQ/163/企业邮箱通常填写授权码；Gmail/Outlook 建议使用应用专用密码。Cloudflare 线上不建议走 SMTP，请使用第三方邮件 API。</div>
                    </div>
                  ) : null}
                  {mailProvider === "http" ? (
                    <div className="mail-provider-card wide">
                      <div className="mail-provider-card-head">
                        <strong>第三方邮件 API</strong>
                        <span>适合 Cloudflare Worker 线上发信；保存后可立即发送测试邮件。</span>
                      </div>
                      <label>API 服务
                        <select disabled={!canManageFrontendSettings} value={state.siteSettings.mailApiProvider || "resend"} onChange={(event) => updateSiteSettings({ mailApiProvider: event.target.value })}>
                          <option value="resend">Resend</option>
                          <option value="generic">通用 Bearer API</option>
                        </select>
                      </label>
                      <label>API 地址
                        <input disabled={!canManageFrontendSettings} placeholder="https://api.resend.com/emails" value={state.siteSettings.mailApiBaseUrl || ""} onChange={(event) => updateSiteSettings({ mailApiBaseUrl: event.target.value })} />
                      </label>
                      <label>API Key
                        <input
                          disabled={!canManageFrontendSettings}
                          placeholder={mailApiKeyConfigured ? "已配置，留空则不修改" : "请输入第三方邮件 API Key"}
                          type="password"
                          value={state.siteSettings.mailApiKey || ""}
                          onChange={(event) => updateSiteSettings({ mailApiKey: event.target.value })}
                        />
                      </label>
                      <div className="mail-provider-help">第三方 API 使用 HTTPS 请求发信，适合 Cloudflare Worker 线上环境；Resend 会按官方 JSON 格式发送。</div>
                    </div>
                  ) : null}
                  {mailProvider === "mailto" ? <div className="mail-provider-help">本机邮件客户端不会由网站后端发送邮件，只会打开系统默认邮箱草稿；这是最安全的兜底方式。</div> : null}
                  <div className="mail-test-card wide">
                    <div>
                      <strong>测试发送</strong>
                      <span>{mailProvider === "mailto" ? "本机邮件客户端不会真实发信；SMTP 或第三方 API 可用这里测试。" : "会先保存当前邮件设置，再发送一封测试邮件。"}</span>
                    </div>
                    <label>测试收件人
                      <input disabled={!canManageFrontendSettings || mailProvider === "mailto"} placeholder={state.siteSettings.adminEmail} type="email" value={mailTestTo} onChange={(event) => setMailTestTo(event.target.value)} />
                    </label>
                    <div className="mail-test-actions">
                      <button disabled={!canManageFrontendSettings || mailActionRunning || mailProvider === "mailto"} type="button" onClick={sendTestMail}><Mail size={15} />保存并发送测试邮件</button>
                    </div>
                  </div>
                  <label className="wide">询盘回复模板
                    <textarea
                      disabled={!canManageFrontendSettings}
                      rows={9}
                      value={state.siteSettings.mailReplyTemplate || ""}
                      onChange={(event) => updateSiteSettings({ mailReplyTemplate: event.target.value })}
                    />
                  </label>
                </div>
              </section>
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
                    <div className="contact-icon-manager">
                      {channel.iconUrl ? (
                        <Image className="contact-icon-thumb" src={channel.iconUrl} alt={`${channel.label.zh ?? channel.label.en} 图标`} width={34} height={34} unoptimized />
                      ) : (
                        <span className="contact-icon-empty">默认</span>
                      )}
                      <label className="contact-icon-upload">
                        图标
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            uploadContactIcon(index, event.currentTarget.files?.[0] ?? null);
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                      {channel.iconUrl ? (
                        <button className="contact-icon-remove" type="button" onClick={() => updateContact(index, { iconUrl: undefined })}>移除</button>
                      ) : null}
                    </div>
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
                      {roleOptions.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
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
                        aria-label={`${user.name} 用户组`}
                        value={user.role}
                        onChange={(event) => {
                          const nextRole = event.target.value as RoleKey;
                          setState({
                            ...state,
                            users: state.users.map((item) => item.id === user.id ? { ...item, role: nextRole } : item)
                          });
                        }}
                      >
                        {roleOptions.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
                      </select>
                      <label className="checkline"><input type="checkbox" checked={user.active} onChange={(event) => setState({ ...state, users: state.users.map((item) => item.id === user.id ? { ...item, active: event.target.checked } : item) })} />启用</label>
                    </div>
                    {canResetUserPasswords ? (
                      <div className="user-password-reset">
                        <label>AI 积分
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={user.aiCredits ?? 0}
                            onChange={(event) => updateUserAiCredits(user.id, Number(event.target.value))}
                          />
                        </label>
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
                  </article>
                ))}
              </div>
              <section className="user-group-permission-panel">
                <div className="settings-panel-head with-action">
                  <div>
                    <h2>用户组权限</h2>
                    <span>用户只需要选择所属用户组；后台页面、设置子页面和功能权限在这里按用户组统一配置。</span>
                  </div>
                </div>
                <div className="user-role-grid">
                  {roleOptions.map((role) => {
                    const permissions = getRolePermissions(role, state.rolePermissions);
                    const expanded = expandedRolePermissionId === role;

                    return (
                      <article className="user-role-card" key={role}>
                        <button type="button" className="user-role-card-head" onClick={() => setExpandedRolePermissionId(expanded ? null : role)}>
                          <span>
                            <strong>{roleLabels[role]}</strong>
                            <small>{permissions.allowedTabs.length} 个后台页面 · {permissions.settingsSections.length} 个设置子页面</small>
                          </span>
                          <span>{expanded ? "收起" : "编辑权限"}</span>
                        </button>
                        {expanded ? (
                      <div className="user-permission-editor">
                        <div>
                          <strong>后台页面</strong>
                          <span>勾选后该用户组成员的左侧菜单只显示对应页面；账号设置始终可访问。</span>
                        </div>
                        <div className="user-permission-grid">
                          {adminPageAccessOptions.map((item) => (
                            <label className="checkline" key={item.key}>
                              <input
                                type="checkbox"
                                checked={permissions.allowedTabs.includes(item.key)}
                                onChange={(event) => updateRoleAllowedTab(role, item.key, event.target.checked)}
                              />
                              {item.label}
                            </label>
                          ))}
                        </div>
                        <div className="user-settings-permissions">
                          <div>
                            <strong>设置子页面</strong>
                            <span>用于单独控制“设置”页面里面的常规、撰写、媒体、AI、备份等子页面。</span>
                          </div>
                          <div className="user-permission-grid compact">
                            {settingsSections.map((item) => (
                            <label className="checkline" key={item.key}>
                              <input
                                type="checkbox"
                                checked={permissions.settingsSections.includes(item.key)}
                                onChange={(event) => updateRoleSettingsSection(role, item.key, event.target.checked)}
                              />
                              {item.label}
                            </label>
                          ))}
                          </div>
                        </div>
                        <div className="user-feature-permissions">
                          <div>
                            <strong>功能权限</strong>
                            <span>控制不会单独出现在侧栏里的功能。</span>
                          </div>
                          <label className="checkline">
                            <input
                              type="checkbox"
                              checked={permissions.articleImportEnabled}
                              onChange={(event) => updateRolePermission(role, { articleImportEnabled: event.target.checked })}
                            />
                            允许批量导入文章
                          </label>
                        </div>
                      </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>
            </>
          ) : null}

          {tab === "navigation" ? (
            <>
              {!canManageFrontendSettings ? <p className="settings-lock-note">当前账号没有前台设置权限。请在用户组权限中开放对应权限后修改导航栏。</p> : null}
              {navigationSettingsPanel}
            </>
          ) : null}

          {tab === "templates" ? (
            <>
              {!canManageFrontendSettings ? <p className="settings-lock-note">当前账号没有前台模板权限。请在用户组权限中开放对应权限后修改模板。</p> : null}
              <PuckTemplateEditor
                canManage={canManageFrontendSettings}
                locale={locale}
                onStateChange={(nextState) => {
                  setState(nextState);
                  setFrontendSettingsDirty(false);
                }}
                onStatus={setStatus}
                state={state}
              />
            </>
          ) : null}

          {tab === "settings" ? (
            <>
              {!canManageFrontendSettings ? <p className="settings-lock-note">当前账号没有前台设置权限。请在用户组权限中开放对应权限后修改设置。</p> : null}

              <div className="wp-settings-screen">
                <aside className="wp-settings-menu" aria-label="设置分组">
                  {visibleSettingsSections.map((item) => (
                    <button className={settingsSection === item.key ? "active" : ""} key={item.key} type="button" onClick={() => setSettingsSection(item.key)}>
                      <strong>{item.label}</strong>
                      <span>{item.description}</span>
                    </button>
                  ))}
                </aside>

                <section className="settings-panel wp-settings-panel">
                  {visibleSettingsSections.length === 0 ? <div className="empty-state">当前用户组没有可访问的设置子页面。</div> : null}

                  {canViewCurrentSettingsSection && settingsSection === "general" ? (
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
                            {roleOptions.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
                          </select>
                        </label>
                      </div>
                    </>
                  ) : null}

                  {canViewCurrentSettingsSection && settingsSection === "writing" ? (
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

                  {canViewCurrentSettingsSection && settingsSection === "reading" ? (
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

                  {canViewCurrentSettingsSection && settingsSection === "seo" ? (
                    <>
                      <div className="settings-panel-head with-action">
                        <div><h2>SEO 设置与完整度</h2><span>开发阶段先生成站内 SEO 信号，不提交任何站长平台。</span></div>
                        {settingsSaveAction}
                      </div>
                      <div className="wp-settings-form">
                        <label>站点地址（Canonical 根域名）
                          <input disabled={!canManageFrontendSettings} value={state.siteSettings.siteUrl} onChange={(event) => updateSiteSettings({ siteUrl: event.target.value })} />
                        </label>
                        <label className="checkline"><input disabled={!canManageFrontendSettings} type="checkbox" checked={state.siteSettings.searchEngineVisible} onChange={(event) => updateSiteSettings({ searchEngineVisible: event.target.checked })} />后台允许搜索引擎索引本站</label>
                        <div className="settings-field">
                          <span>当前索引模式</span>
                          <strong>{publicIndexingEnabled && state.siteSettings.searchEngineVisible ? "正式可索引" : "开发保护：noindex / robots 禁止抓取"}</strong>
                          <small>正式上线前再设置环境变量 NEXT_PUBLIC_SITE_INDEXABLE=true；后台开关和环境变量必须同时开启才允许索引。</small>
                        </div>
                        <div className="settings-field">
                          <span>系统入口</span>
                          <strong>/robots.txt · /sitemap.xml</strong>
                          <small>后台、登录页和 API 不进入 sitemap，并始终 noindex。</small>
                        </div>
                      </div>
                      <div className="admin-stat-grid">
                        <div><strong>{seoIssues.missingMetadata}</strong><span>缺少 SEO 标题/描述</span></div>
                        <div><strong>{seoIssues.fallbackLocales}</strong><span>多语种内容 fallback</span></div>
                        <div><strong>{seoIssues.missingImages}</strong><span>缺少分享图片</span></div>
                        <div><strong>{seoIssues.noindexItems}</strong><span>手动关闭索引</span></div>
                      </div>
                      <section className="file-upload-panel">
                        <strong>上线前检查</strong>
                        <span>补齐各语种标题、描述、正文和图片后，再切换正式域名与索引开关。未补齐当前语种内容的页面不会进入 sitemap，前台 metadata 会自动 noindex。</span>
                      </section>
                    </>
                  ) : null}

                  {canViewCurrentSettingsSection && settingsSection === "media" ? (
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

                  {canViewCurrentSettingsSection && settingsSection === "permalinks" ? (
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

                  {canViewCurrentSettingsSection && settingsSection === "privacy" ? (
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

                  {canViewCurrentSettingsSection && settingsSection === "ai" ? (
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
                          <div className="wide ai-capability-head">
                            <h3>文字生成与翻译模型</h3>
                            <span>用于文章、页面、标题候选、采集改写和自动翻译。DeepSeek、Qwen、Kimi 等文本模型放这里。</span>
                          </div>
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
                          <div className="wide ai-capability-head">
                            <h3>图片生成模型</h3>
                            <span>用于“根据文章生成配图”。DeepSeek 等纯文本模型不支持图片生成，请选择 OpenAI 或兼容 /images/generations 的供应商。</span>
                          </div>
                          <label>图片供应商
                            <select value={state.aiSettings.imageProvider} onChange={(event) => selectAiImageProvider(event.target.value)}>
                              {aiImageProviderOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                          </label>
                          <label>图片模型
                            <select value={aiImageModelSelectValue} onChange={(event) => {
                              const nextModel = event.target.value;
                              updateAiSettings({ imageModel: nextModel === customAiModelValue ? "" : nextModel });
                            }}>
                              {aiImageModelOptions.map((model) => <option key={model} value={model}>{model}</option>)}
                              <option value={customAiModelValue}>自定义模型...</option>
                            </select>
                          </label>
                          {aiImageModelIsCustom ? (
                            <label className="wide">自定义图片模型
                              <input
                                placeholder="例如 gpt-image-1、dall-e-3 或兼容供应商模型 ID"
                                value={state.aiSettings.imageModel}
                                onChange={(event) => updateAiSettings({ imageModel: event.target.value })}
                              />
                            </label>
                          ) : null}
                          <label className="wide">图片 Base URL
                            <input
                              placeholder={selectedAiImageProvider.baseUrl || "https://your-image-provider.example.com/v1"}
                              value={state.aiSettings.imageBaseUrl}
                              onChange={(event) => updateAiSettings({ imageBaseUrl: event.target.value })}
                            />
                            <small>接口最终会请求 /images/generations；如果 Base URL 已包含该路径也可以直接填写完整地址。</small>
                          </label>
                          <label className="wide">图片 API Key
                            <input
                              placeholder={state.aiSettings.imageApiKeyConfigured ? "已保存图片密钥；留空保存时继续沿用" : "可留空复用文字 API Key"}
                              type="password"
                              value={state.aiSettings.imageApiKey ?? ""}
                              onChange={(event) => updateAiSettings({ imageApiKey: event.target.value })}
                            />
                            <small>如果图片供应商和文字供应商使用同一个 Key，可留空复用文字 API Key。</small>
                          </label>
                          <div className="wide ai-capability-head">
                            <h3>语音生成模型</h3>
                            <span>预留给后续 TTS/语音内容功能。当前不会影响文章和图片生成。</span>
                          </div>
                          <label>语音供应商
                            <select value={state.aiSettings.voiceProvider} onChange={(event) => selectAiVoiceProvider(event.target.value)}>
                              {aiVoiceProviderOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                          </label>
                          <label>语音模型
                            <select value={aiVoiceModelSelectValue} onChange={(event) => {
                              const nextModel = event.target.value;
                              updateAiSettings({ voiceModel: nextModel === customAiModelValue ? "" : nextModel });
                            }}>
                              {aiVoiceModelOptions.map((model) => <option key={model} value={model}>{model}</option>)}
                              <option value={customAiModelValue}>自定义模型...</option>
                            </select>
                          </label>
                          {aiVoiceModelIsCustom ? (
                            <label className="wide">自定义语音模型
                              <input
                                placeholder="输入 TTS 模型 ID"
                                value={state.aiSettings.voiceModel}
                                onChange={(event) => updateAiSettings({ voiceModel: event.target.value })}
                              />
                            </label>
                          ) : null}
                          <label className="wide">语音 Base URL
                            <input
                              placeholder={selectedAiVoiceProvider.baseUrl || "https://your-voice-provider.example.com/v1"}
                              value={state.aiSettings.voiceBaseUrl}
                              onChange={(event) => updateAiSettings({ voiceBaseUrl: event.target.value })}
                            />
                          </label>
                          <label className="wide">语音 API Key
                            <input
                              placeholder={state.aiSettings.voiceApiKeyConfigured ? "已保存语音密钥；留空保存时继续沿用" : "可留空复用文字 API Key"}
                              type="password"
                              value={state.aiSettings.voiceApiKey ?? ""}
                              onChange={(event) => updateAiSettings({ voiceApiKey: event.target.value })}
                            />
                            <small>语音功能上线后会优先使用这里的配置。</small>
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

                  {canViewCurrentSettingsSection && settingsSection === "translation" ? (
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
                      {!canRunAutoTranslation ? <p className="settings-lock-note">当前账号没有自动翻译权限。请在用户组权限中开放对应权限后执行。</p> : null}
                      <div className="ai-translate-grid">
                        <label>翻译范围
                          <select value={translationScope} onChange={(event) => setTranslationScope(event.target.value as TranslationScope)}>
                            {translationScopeOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                          </select>
                          <small>{translationScopeOptions.find((option) => option.key === translationScope)?.description}</small>
                        </label>
                        <label>源语言
                          <select value={translationSourceLocale} onChange={(event) => setTranslationSourceLocale(event.target.value as TranslationSourceChoice)}>
                            <option value="auto">自动识别</option>
                            {translationLocaleOptions.map((localeOption) => <option key={localeOption.code} value={localeOption.code}>{localeOption.flag} {localeOption.nativeName}</option>)}
                          </select>
                          <small>自动识别会优先使用当前字段里已有内容，不强制要求中文。</small>
                        </label>
                        <label>目标语言
                          <select value={translationTargetLocale} onChange={(event) => setTranslationTargetLocale(event.target.value as TranslationTargetChoice)}>
                            <option value="all">全部启用语言</option>
                            {translationLocaleOptions.map((localeOption) => <option key={localeOption.code} value={localeOption.code}>{localeOption.flag} {localeOption.nativeName}</option>)}
                          </select>
                          <small>建议先选择单个目标语言，避免一次请求内容过多导致超时。</small>
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

                  {canViewCurrentSettingsSection && settingsSection === "backup" ? (
                    <section className="settings-panel site-backup-panel">
                      <div className="settings-panel-head">
                        <div>
                          <h2>整站数据备份</h2>
                          <span>导出或导入后台数据，按模块选择内容，避免备份文件过大。</span>
                        </div>
                      </div>
                      {!canManageFrontendSettings ? <p className="settings-lock-note">当前账号没有备份权限。请在用户组权限中开放对应权限后操作。</p> : null}
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
              {!canManageFrontendSettings ? <p className="settings-lock-note">当前账号没有前台设置权限。请在用户组权限中开放对应权限后修改语言。</p> : null}
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
                    <div><span>当前角色</span><strong>{roleLabels[currentUser?.role ?? "admin"]}</strong></div>
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
                      <h2>进阶式 AI 内容生成</h2>
                      <span>按步骤选择内容类型、目的、主题标题和正文结构，生成预览后再写入后台。</span>
                    </div>
                  </div>

                  <div className="ai-wizard-progress" aria-label="AI 生成步骤">
                    {aiWizardStepOptions.map((step) => (
                      <button
                        className={aiWizardStep === step.key ? "active" : aiWizardStep > step.key ? "done" : ""}
                        key={step.key}
                        type="button"
                        onClick={() => goToAiWizardStep(step.key)}
                      >
                        <span>{step.key}</span>
                        <strong>{step.label}</strong>
                      </button>
                    ))}
                  </div>

                  <section className="ai-wizard-page">
                    <div className="ai-wizard-step-head">
                      <span>{aiWizardStep}</span>
                      <strong>{aiWizardStepOptions.find((step) => step.key === aiWizardStep)?.label}</strong>
                    </div>

                    {aiWizardStep === 1 ? (
                      <div className="ai-guided-form">
                        <label>我要生成
                          <select
                            value={aiContentForm.target}
                            onChange={(event) => {
                              setAiContentForm((current) => ({ ...current, target: event.target.value as AiContentTarget }));
                              setAiDraftPreview(null);
                              setAiGeneratedImage(null);
                              setAiImageStatus("");
                            }}
                          >
                            {aiTargetOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                          </select>
                          <small>{aiTargetOptions.find((option) => option.key === aiContentForm.target)?.description}</small>
                        </label>
                      </div>
                    ) : null}

                    {aiWizardStep === 2 ? (
                      <div className="ai-guided-form">
                        <label>内容目的
                          <select
                            value={aiContentForm.purpose}
                            onChange={(event) => {
                              setAiContentForm({ ...aiContentForm, purpose: event.target.value as AiContentPurpose });
                              setAiDraftPreview(null);
                            }}
                          >
                            {aiPurposeOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                          </select>
                          <small>{aiPurposeOptions.find((option) => option.key === aiContentForm.purpose)?.description}</small>
                        </label>
                      </div>
                    ) : null}

                    {aiWizardStep === 3 ? (
                      <>
                        <div className="ai-guided-form">
                          <label>内容主题
                            <input
                              placeholder={aiContentForm.target === "article" ? "例如：carbide end mills for stainless steel" : "例如：custom tooling service"}
                              value={aiContentForm.topic}
                              onChange={(event) => {
                                setAiContentForm({ ...aiContentForm, topic: event.target.value });
                                setAiDraftPreview(null);
                              }}
                            />
                          </label>
                          <label>目标买家 / 市场
                            <input
                              placeholder={state.aiSettings.targetMarkets.join(", ") || "Global buyers"}
                              value={aiContentForm.audience}
                              onChange={(event) => setAiContentForm({ ...aiContentForm, audience: event.target.value })}
                            />
                          </label>
                          <label>标题
                            <input
                              placeholder="可手动填写标题，也可以先输入主题后点击 AI 生成标题"
                              value={aiContentForm.selectedTitle}
                              onChange={(event) => {
                                setAiContentForm({ ...aiContentForm, selectedTitle: event.target.value });
                                setAiDraftPreview(null);
                              }}
                            />
                          </label>
                        </div>
                        <div className="ai-title-actions">
                          <button type="button" onClick={() => void generateAiTitleSuggestions()}>
                            <Sparkles size={16} />
                            AI 生成标题
                          </button>
                          <span>{aiGenerateStatus}</span>
                        </div>
                        {aiTitleSuggestions.length > 0 ? (
                          <label className="ai-title-select">选择 AI 标题
                            <select
                              value={selectedAiTitleValue()}
                              onChange={(event) => {
                                setAiContentForm({ ...aiContentForm, selectedTitle: event.target.value });
                                setAiDraftPreview(null);
                              }}
                            >
                              <option value="">不使用候选，手动填写</option>
                              {aiTitleSuggestions.map((title, index) => {
                                const titleText = title.zh || title.en;
                                return <option key={`${titleText}-${index}`} value={titleText}>{titleText}</option>;
                              })}
                            </select>
                          </label>
                        ) : null}
                      </>
                    ) : null}

                    {aiWizardStep === 4 ? (
                      <div className="ai-guided-checklist">
                        {aiSectionOptions.map((option) => (
                          <label className={aiContentForm.sections.includes(option.key) ? "active" : ""} key={option.key}>
                            <input type="checkbox" checked={aiContentForm.sections.includes(option.key)} onChange={() => toggleAiContentSection(option.key)} />
                            <span>
                              <strong>{option.label}</strong>
                              <small>{option.description}</small>
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : null}

                    {aiWizardStep === 5 ? (
                      <>
                        <div className="ai-guided-form ai-write-target-form">
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
                            <small>{aiWriteModeOptions.find((option) => option.key === aiContentForm.writeMode)?.description}</small>
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
                        <div className="ai-action-row">
                          <button type="button" onClick={() => void generateAiContentPreview()}>
                            <Sparkles size={16} />
                            生成预览
                          </button>
                          <button type="button" disabled={!aiDraftPreview || !aiCanApply} onClick={() => applyAiContentDraft()}>
                            <PlusCircle size={16} />
                            写入当前预览
                          </button>
                          <button type="button" onClick={() => void generateAiContentPreview()}>
                            <RefreshCw size={16} />
                            重新生成预览
                          </button>
                          <button type="button" disabled={!aiDraftPreview || aiDraftPreview.target !== "article" || aiImageStatus.startsWith("正在")} onClick={generateAiArticleImage}>
                            <ImageIcon size={16} />
                            根据文章生成配图
                          </button>
                        </div>
                      </>
                    ) : null}
                  </section>

                  <div className="ai-wizard-nav">
                    <button type="button" disabled={aiWizardStep === 1} onClick={previousAiWizardStep}>上一步</button>
                    <button type="button" disabled={aiWizardStep === 5} onClick={nextAiWizardStep}>下一步</button>
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
          {mediaPickerDialog}
        </section>
      </div>
    </main>
  );
}
