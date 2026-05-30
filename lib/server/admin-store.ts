import { articles, contactChannels, defaultEnabledLocales, defaultNavigation, productCategories, siteSettings, uploadedFiles } from "@/data/site";
import { isLocale } from "@/config/locales";
import { encryptMailSecret } from "@/lib/server/mail-secrets";
import { normalizePageLayouts } from "@/lib/puck-layouts";
import type { AdminRolePermissions, AdminState, HomeSectionKey, HomeTemplateKey, LocaleCode, RoleKey, SiteHeroSlide, SiteNavigationItem, SiteSettings, SiteTemplateCustomBlock, SiteTemplateImageItem, SiteTemplateSettings, Translation } from "@/types/site";

type KvNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
};

export type StoredUploadFile = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  base64: string;
  createdAt: string;
};

type CloudflareContext = {
  env?: {
    EXPORTFORGE_KV?: KvNamespace;
  };
};

const stateKey = "admin-state";
const uploadKeyPrefix = "upload:";
const currentTemplateContentVersion = "current-template-xiyida-v1";
const adminTabKeys = new Set(["overview", "products", "pages", "articles", "files", "leads", "mail", "contacts", "navigation", "users", "collect", "templates", "settings", "languages", "themes", "ai"]);
const settingsSectionKeys = new Set(["general", "writing", "reading", "seo", "media", "permalinks", "privacy", "ai", "translation", "backup"]);
const defaultRolePermissions: Record<RoleKey, AdminRolePermissions> = {
  "super-admin": {
    allowedTabs: Array.from(adminTabKeys),
    settingsSections: Array.from(settingsSectionKeys),
    articleImportEnabled: true
  },
  admin: {
    allowedTabs: ["overview", "products", "pages", "articles", "files", "leads", "mail", "contacts", "navigation", "collect", "templates", "settings", "languages", "themes", "ai"],
    settingsSections: Array.from(settingsSectionKeys),
    articleImportEnabled: true
  },
  editor: {
    allowedTabs: ["overview", "products", "pages", "articles", "files", "collect", "ai"],
    settingsSections: [],
    articleImportEnabled: false
  },
  sales: {
    allowedTabs: ["overview", "products", "leads", "contacts"],
    settingsSections: [],
    articleImportEnabled: false
  },
  viewer: {
    allowedTabs: ["overview", "products", "articles", "files"],
    settingsSections: [],
    articleImportEnabled: false
  }
};
const legacyTemplateAssetPath = "/assets/tools/";
const currentTemplateAssetPath = "/assets/current-template/";
const homeTemplateKeys = new Set<HomeTemplateKey>(["industrial-showcase", "catalog-focus", "rfq-focus"]);
const homeSectionKeys: HomeSectionKey[] = ["navigation", "hero", "products", "factory", "markets", "articles", "rfq"];
const defaultHeroSlides: SiteHeroSlide[] = [
  {
    id: "hero-tin-packaging",
    imageUrl: "/assets/current-template/hero-tin-packaging.jpg",
    alt: { en: "Custom tin box packaging hero poster", zh: "定制铁盒包装首页海报" },
    enabled: true,
    order: 10
  },
  {
    id: "hero-factory-qc",
    imageUrl: "/assets/current-template/factory-qc.jpg",
    alt: { en: "Tin box production and quality inspection hero poster", zh: "铁盒生产与质量检查首页海报" },
    enabled: true,
    order: 20
  },
  {
    id: "hero-tin-category-range",
    imageUrl: "/assets/current-template/tin-category-range.jpg",
    alt: { en: "Food gift cosmetic tea coffee and candle tin packaging hero poster", zh: "食品礼品化妆品茶叶咖啡与蜡烛铁盒首页海报" },
    enabled: true,
    order: 30
  }
];

const defaultSiteSettings: SiteSettings = {
  title: siteSettings.brand,
  tagline: "Custom tin box packaging, printing, inspection, and export-ready packing.",
  contentVersion: currentTemplateContentVersion,
  siteIconUrl: "",
  fontFamily: "\"Manrope\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://exportforge-b2b-site-system.437991663.workers.dev",
  adminEmail: process.env.INITIAL_ADMIN_EMAIL ?? "admin@example.com",
  mailFromEmail: "",
  mailFromName: "",
  mailReplyToEmail: "",
  mailProvider: "mailto",
  mailSmtpHost: "",
  mailSmtpPort: 465,
  mailSmtpSecure: true,
  mailSmtpEncryption: "ssl",
  mailSmtpAccountName: "",
  mailSmtpUseDifferentAccountName: false,
  mailSmtpUser: "",
  mailSmtpPassword: "",
  mailSmtpPasswordConfigured: false,
  mailReplyToDifferent: false,
  mailImapEnabled: true,
  mailImapHost: "",
  mailImapPort: 993,
  mailImapEncryption: "ssl",
  mailImapCollectExternalReplies: false,
  mailApiProvider: "resend",
  mailApiBaseUrl: "https://api.resend.com/emails",
  mailApiKey: "",
  mailApiKeyConfigured: false,
  mailReplyTemplate: "Hello {name},\n\nThank you for your RFQ about {productType}. We have received your inquiry and will follow up with structure, artwork, packing, and lead time details soon.\n\nBest regards,\n{siteTitle}",
  allowRegistration: false,
  defaultUserRole: "viewer",
  siteLanguage: "zh",
  timezone: "Asia/Shanghai",
  dateFormat: "Y-m-d",
  timeFormat: "H:i",
  defaultArticleCategory: productCategories[0]?.slug ?? "uncategorized",
  defaultArticleStatus: "draft",
  postsPerPage: 10,
  showFeaturedArticles: true,
  searchEngineVisible: true,
  thumbnailWidth: 300,
  thumbnailHeight: 300,
  mediumWidth: 768,
  mediumHeight: 0,
  largeWidth: 1280,
  largeHeight: 0,
  uploadsOrganizedByMonth: true,
  productUrlBase: "products",
  articleUrlBase: "articles",
  fileUrlBase: "files",
  privacyPageUrl: "/privacy",
  cookieNoticeEnabled: false,
  privacySummary: "We use submitted RFQ details only for packaging project review, sales follow-up, and service improvement."
};

const defaultTemplateTextBlocks: Record<string, Translation> = {
  productsEyebrow: { en: "Tin packaging applications", zh: "铁盒包装应用" },
  productsTitle: { en: "Custom metal tins for food, gifts, cosmetics, tea, coffee, and candles.", zh: "面向食品、礼品、化妆品、茶叶咖啡和蜡烛的定制铁盒。" },
  productsBody: {
    en: "Browse application-focused packaging categories for importers, brand owners, distributors, and promotional packaging programs.",
    zh: "按应用场景浏览铁盒包装类别，适合进口商、品牌方、经销商和促销包装项目。"
  },
  factoryEyebrow: { en: "Factory capability", zh: "工厂能力" },
  factoryTitle: { en: "Tinplate forming, printing, inspection, and export packing are aligned before shipment.", zh: "从马口铁成型、印刷、质检到出口包装的完整供应能力。" },
  factoryCard1Title: { en: "Mold and forming", zh: "模具与成型" },
  factoryCard1Body: { en: "Round, rectangular, square, hinged, window, embossed, and shaped tin box structures.", zh: "支持圆形、方形、长方形、铰链、开窗、压凸和异形铁盒结构。" },
  factoryCard2Title: { en: "Printing and finish", zh: "印刷与表面处理" },
  factoryCard2Body: { en: "Offset printing, matte or glossy varnish, embossing, debossing, and brand color matching.", zh: "支持胶印、哑光、亮光、压凸、压凹和品牌色匹配。" },
  factoryCard3Title: { en: "Export packing", zh: "私标包装交付" },
  factoryCard3Body: { en: "Protective sleeves, inner cartons, master cartons, pallet plans, and buyer-ready documentation.", zh: "提供保护袋、内盒、外箱、托盘方案和买家所需出口文件。" },
  marketsEyebrow: { en: "Global supply", zh: "出口市场" },
  marketsTitle: { en: "Buyer-ready communication for brands sourcing custom tin packaging.", zh: "面向定制铁盒买家的多语言沟通与 RFQ 清单。" },
  marketsBody: {
    en: "Xiyida Packaging supports multilingual product pages, quick RFQ details, and export documentation for buyers comparing food tins, gift tins, cosmetic tins, and custom metal boxes.",
    zh: "Xiyida Packaging 支持多语言产品页、快速 RFQ 信息和出口文件，方便买家比较食品铁盒、礼品铁盒、化妆品铁盒和定制金属盒。"
  },
  marketsChecklistTitle: { en: "RFQ checklist", zh: "RFQ 清单" },
  marketsChecklist1: { en: "Tin shape, size, lid style, insert needs, and intended product use.", zh: "铁盒形状、尺寸、盖型、内托需求和用途。" },
  marketsChecklist2: { en: "Artwork status, printing colors, finish, embossing, and sample expectations.", zh: "设计稿状态、印刷色数、表面处理、压凸压凹和样品预期。" },
  marketsChecklist3: { en: "Quantity target, packing method, destination, and delivery schedule.", zh: "数量目标、包装方式、目的地和交付计划。" },
  marketsNote: { en: siteSettings.aiDraftPolicy, zh: siteSettings.aiDraftPolicy },
  articlesEyebrow: { en: "Packaging knowledge", zh: "包装知识" },
  articlesTitle: { en: "Buyer guides for tin structures, printing finishes, samples, and export packing.", zh: "关于铁盒结构、印刷工艺、样品和出口包装的买家指南。" },
  rfqEyebrow: { en: "Send RFQ", zh: "询盘表单" },
  rfqTitle: { en: "Share your tin box project and export requirements.", zh: "把铁盒包装项目需求发给 Xiyida Packaging。" },
  rfqBody: {
    en: "Send tin style, size, artwork status, quantity target, destination, and packing needs. The sales team will review the details and respond with a clear project proposal.",
    zh: "请提供铁盒款式、尺寸、设计稿状态、数量目标、目的地和包装需求，销售团队会根据项目细节回复。"
  },
  rfqGuidanceTitle: { en: "For a faster reply, include:", zh: "为了更快回复，请包含：" },
  rfqGuidance1: { en: "Tin shape, dimensions, lid structure, and insert requirements.", zh: "铁盒形状、尺寸、盖型结构和内托需求。" },
  rfqGuidance2: { en: "Artwork files, printing method, finish, embossing, and color expectations.", zh: "设计稿、印刷方式、表面效果、压凸压凹和颜色要求。" },
  rfqGuidance3: { en: "Quantity target, inner packing, master carton, destination, and delivery timeline.", zh: "数量目标、内包装、外箱、目的地和交付时间。" },
  rfqNote: {
    en: "Xiyida Packaging reviews each inquiry by application, structure, artwork, and packing needs so the response matches the intended retail or promotional use.",
    zh: "Xiyida Packaging 会按应用、结构、设计稿和包装需求审核每个询盘，让回复更匹配零售或促销用途。"
  },
  heroMetric1Value: { en: "6 application lines", zh: "6 类应用" },
  heroMetric1Label: { en: "Food, gifts, cosmetics, tea, coffee, and candles", zh: "覆盖食品、礼品、化妆品、茶叶咖啡和蜡烛" },
  heroMetric2Value: { en: "Custom print", zh: "定制印刷" },
  heroMetric2Label: { en: "Shape, color, finish, embossing, and inserts", zh: "盒型、颜色、表面效果、压凸和内托" },
  heroMetric3Value: { en: "Export ready", zh: "出口交付" },
  heroMetric3Label: { en: "Inspection, cartons, documents, and shipment support", zh: "质检、外箱、文件和出货支持" }
};

function normalizeCurrentTemplateAssetUrl(value?: string) {
  return (value ?? "").replaceAll(legacyTemplateAssetPath, currentTemplateAssetPath);
}

function normalizeCurrentTemplateAssetTranslation(value?: Partial<Translation>) {
  return {
    en: normalizeCurrentTemplateAssetUrl(value?.en),
    zh: normalizeCurrentTemplateAssetUrl(value?.zh)
  };
}

const defaultTemplateSettings: SiteTemplateSettings = {
  homeTemplate: "industrial-showcase",
  heroKicker: { en: "Custom tin box packaging for global buyers", zh: "面向全球买家的定制铁盒包装" },
  heroTitle: { en: "Custom tin box packaging for food, gifts, beauty, and lifestyle brands.", zh: "面向食品、礼品、美妆和生活方式品牌的定制铁盒包装。" },
  heroBody: {
    en: "Xiyida Packaging manufactures custom tin boxes with structure review, printing, finishing, inspection, and export packing support for international sourcing teams.",
    zh: "Xiyida Packaging 为国际采购团队提供定制铁盒制造，覆盖结构评审、印刷、表面处理、质检和出口包装支持。"
  },
  primaryCtaLabel: { en: "Send RFQ", zh: "发送询盘" },
  secondaryCtaLabel: { en: "View Applications", zh: "查看应用分类" },
  heroCarouselEnabled: true,
  heroCarouselAutoplay: true,
  heroCarouselIntervalSeconds: 7,
  heroSlides: defaultHeroSlides,
  showHeroVisual: false,
  showHeroMetrics: true,
  footerTagline: {
    en: "Custom tin box packaging, printing, inspection, and export-ready packing for global buyers.",
    zh: "面向全球买家的定制铁盒包装、印刷、质检和出口交付。"
  },
  footerCopyright: {
    en: "Copyright © {year} {brand}. All rights reserved.",
    zh: "Copyright © {year} {brand}. All rights reserved."
  },
  footerCredit: {
    en: "Built for custom tin packaging and B2B export orders.",
    zh: "为定制铁盒包装和 B2B 出口订单打造。"
  },
  homeProductCount: 6,
  homeArticleCount: 6,
  visibleSections: {
    navigation: true,
    hero: true,
    products: true,
    factory: true,
    markets: true,
    articles: true,
    rfq: true
  },
  sectionOrder: {
    navigation: 10,
    hero: 20,
    products: 30,
    factory: 40,
    markets: 50,
    articles: 60,
    rfq: 70
  },
  textBlocks: defaultTemplateTextBlocks,
  customBlocks: []
};

function sanitizeStoredFileId(id: string) {
  return id.replace(/[^a-zA-Z0-9._-]/g, "");
}

export function buildStoredFileUrl(id: string) {
  return `/api/files/${encodeURIComponent(id)}`;
}

export function createDefaultAdminState(): AdminState {
  const now = new Date().toISOString();
  const state: AdminState = {
    products: productCategories,
    pages: [],
    articles,
    leads: [],
    contactChannels,
    uploadedFiles,
    activeTheme: "equipment",
    enabledLocales: defaultEnabledLocales,
    navigation: defaultNavigation,
    siteSettings: defaultSiteSettings,
    templateSettings: defaultTemplateSettings,
    pageLayouts: [],
    users: [
      {
        id: "u-super-admin",
        name: "System Admin",
        email: process.env.INITIAL_ADMIN_EMAIL ?? "admin@example.com",
        role: "super-admin",
        active: true,
        aiCredits: 100000,
        articleImportEnabled: true,
        jobTitle: "Owner"
      },
      {
        id: "u-sales",
        name: "Sales Manager",
        email: "sales@example.com",
        role: "sales",
        active: true,
        aiCredits: 20000,
        articleImportEnabled: false,
        jobTitle: "Sales"
      }
    ],
    rolePermissions: defaultRolePermissions,
    aiSettings: {
      provider: process.env.AI_PROVIDER ?? "openai-compatible",
      model: process.env.AI_MODEL ?? "gpt-4.1-mini",
      baseUrl: process.env.AI_BASE_URL ?? "",
      apiKey: process.env.AI_API_KEY ?? "",
      imageProvider: process.env.AI_IMAGE_PROVIDER ?? "openai",
      imageModel: process.env.AI_IMAGE_MODEL ?? "gpt-image-1",
      imageBaseUrl: process.env.AI_IMAGE_BASE_URL ?? "https://api.openai.com/v1",
      imageApiKey: process.env.AI_IMAGE_API_KEY ?? "",
      voiceProvider: process.env.AI_VOICE_PROVIDER ?? "openai",
      voiceModel: process.env.AI_VOICE_MODEL ?? "gpt-4o-mini-tts",
      voiceBaseUrl: process.env.AI_VOICE_BASE_URL ?? "https://api.openai.com/v1",
      voiceApiKey: process.env.AI_VOICE_API_KEY ?? "",
      defaultLocale: "en",
      brandVoice: "Clear, practical, buyer-focused packaging copy for Xiyida Packaging.",
      targetMarkets: ["Europe", "North America", "Southeast Asia", "MENA"],
      requiredKeywords: ["custom tin packaging", "tin box manufacturer", "metal tin boxes", "quality inspection"],
      blockedWords: [],
      enabled: Boolean(process.env.AI_API_KEY)
    },
    aiCreditSettings: {
      enabled: true,
      pointsPerThousandTokens: 1,
      pointPriceCny: 0.01
    },
    aiUsageRecords: [],
    updatedAt: now
  };

  return {
    ...state,
    pageLayouts: normalizePageLayouts([], state)
  };
}

function normalizeSiteSettings(settings?: Partial<SiteSettings>): SiteSettings {
  const next = { ...defaultSiteSettings, ...(settings ?? {}) };
  const validLocale = isLocale(next.siteLanguage) ? next.siteLanguage : defaultSiteSettings.siteLanguage;
  const validMailProvider = next.mailProvider === "smtp" || next.mailProvider === "http" ? next.mailProvider : "mailto";
  const smtpPort = Number(next.mailSmtpPort ?? defaultSiteSettings.mailSmtpPort);
  const imapPort = Number(next.mailImapPort ?? defaultSiteSettings.mailImapPort);
  const validSmtpEncryption = next.mailSmtpEncryption === "tls" || next.mailSmtpEncryption === "none" || next.mailSmtpSecure === false
    ? (next.mailSmtpEncryption === "tls" ? "tls" : next.mailSmtpEncryption === "none" || next.mailSmtpSecure === false ? "none" : "ssl")
    : "ssl";
  const validImapEncryption = next.mailImapEncryption === "tls" || next.mailImapEncryption === "none" ? next.mailImapEncryption : "ssl";

  return {
    ...next,
    siteLanguage: validLocale,
    mailProvider: validMailProvider,
    mailReplyToEmail: next.mailReplyToEmail || next.mailFromEmail || next.adminEmail,
    mailSmtpPort: Number.isFinite(smtpPort) && smtpPort > 0 ? Math.trunc(smtpPort) : defaultSiteSettings.mailSmtpPort,
    mailSmtpEncryption: validSmtpEncryption,
    mailSmtpSecure: validSmtpEncryption === "ssl",
    mailSmtpPasswordConfigured: Boolean(next.mailSmtpPassword),
    mailImapPort: Number.isFinite(imapPort) && imapPort > 0 ? Math.trunc(imapPort) : defaultSiteSettings.mailImapPort,
    mailImapEncryption: validImapEncryption,
    mailApiKeyConfigured: Boolean(next.mailApiKey),
    postsPerPage: Number.isFinite(next.postsPerPage) && next.postsPerPage > 0 ? Math.trunc(next.postsPerPage) : defaultSiteSettings.postsPerPage,
    thumbnailWidth: Number.isFinite(next.thumbnailWidth) ? Math.max(0, Math.trunc(next.thumbnailWidth)) : defaultSiteSettings.thumbnailWidth,
    thumbnailHeight: Number.isFinite(next.thumbnailHeight) ? Math.max(0, Math.trunc(next.thumbnailHeight)) : defaultSiteSettings.thumbnailHeight,
    mediumWidth: Number.isFinite(next.mediumWidth) ? Math.max(0, Math.trunc(next.mediumWidth)) : defaultSiteSettings.mediumWidth,
    mediumHeight: Number.isFinite(next.mediumHeight) ? Math.max(0, Math.trunc(next.mediumHeight)) : defaultSiteSettings.mediumHeight,
    largeWidth: Number.isFinite(next.largeWidth) ? Math.max(0, Math.trunc(next.largeWidth)) : defaultSiteSettings.largeWidth,
    largeHeight: Number.isFinite(next.largeHeight) ? Math.max(0, Math.trunc(next.largeHeight)) : defaultSiteSettings.largeHeight
  };
}

export function sanitizeSiteSettingsSecrets(settings: SiteSettings): SiteSettings {
  return {
    ...settings,
    mailSmtpPassword: "",
    mailSmtpPasswordConfigured: Boolean(settings.mailSmtpPassword),
    mailApiKey: "",
    mailApiKeyConfigured: Boolean(settings.mailApiKey)
  };
}

function preserveMailSecrets(nextSettings: SiteSettings, existingSettings: SiteSettings): SiteSettings {
  const smtpPassword = nextSettings.mailSmtpPassword?.trim();
  const apiKey = nextSettings.mailApiKey?.trim();
  const nextSmtpPassword = smtpPassword === "__CLEAR_MAIL_SECRET__"
    ? ""
    : smtpPassword
      ? encryptMailSecret(smtpPassword)
      : existingSettings.mailSmtpPassword || "";
  const nextApiKey = apiKey ? encryptMailSecret(apiKey) : existingSettings.mailApiKey || "";

  return {
    ...nextSettings,
    mailSmtpPassword: nextSmtpPassword,
    mailSmtpPasswordConfigured: Boolean(nextSmtpPassword),
    mailApiKey: nextApiKey,
    mailApiKeyConfigured: Boolean(nextApiKey)
  };
}

function normalizeAiSettings(settings?: Partial<AdminState["aiSettings"]>): AdminState["aiSettings"] {
  const fallback = createDefaultAdminState().aiSettings;

  return {
    ...fallback,
    ...(settings ?? {}),
    provider: settings?.provider?.trim() || fallback.provider,
    model: settings?.model?.trim() || fallback.model,
    baseUrl: settings?.baseUrl?.trim() ?? fallback.baseUrl,
    apiKey: settings?.apiKey?.trim() || fallback.apiKey,
    imageProvider: settings?.imageProvider?.trim() || fallback.imageProvider,
    imageModel: settings?.imageModel?.trim() || fallback.imageModel,
    imageBaseUrl: settings?.imageBaseUrl?.trim() ?? fallback.imageBaseUrl,
    imageApiKey: settings?.imageApiKey?.trim() || fallback.imageApiKey,
    voiceProvider: settings?.voiceProvider?.trim() || fallback.voiceProvider,
    voiceModel: settings?.voiceModel?.trim() || fallback.voiceModel,
    voiceBaseUrl: settings?.voiceBaseUrl?.trim() ?? fallback.voiceBaseUrl,
    voiceApiKey: settings?.voiceApiKey?.trim() || fallback.voiceApiKey,
    targetMarkets: Array.isArray(settings?.targetMarkets) ? settings.targetMarkets.filter(Boolean) : fallback.targetMarkets,
    requiredKeywords: Array.isArray(settings?.requiredKeywords) ? settings.requiredKeywords.filter(Boolean) : fallback.requiredKeywords,
    blockedWords: Array.isArray(settings?.blockedWords) ? settings.blockedWords.filter(Boolean) : fallback.blockedWords,
    enabled: settings?.enabled ?? Boolean(settings?.apiKey || fallback.apiKey)
  };
}

function normalizeAiCreditSettings(settings?: Partial<AdminState["aiCreditSettings"]>): AdminState["aiCreditSettings"] {
  const fallback = createDefaultAdminState().aiCreditSettings;
  const pointsPerThousandTokens = Number(settings?.pointsPerThousandTokens);
  const pointPriceCny = Number(settings?.pointPriceCny);

  return {
    enabled: settings?.enabled ?? fallback.enabled,
    pointsPerThousandTokens: Number.isFinite(pointsPerThousandTokens) && pointsPerThousandTokens >= 0 ? pointsPerThousandTokens : fallback.pointsPerThousandTokens,
    pointPriceCny: Number.isFinite(pointPriceCny) && pointPriceCny >= 0 ? pointPriceCny : fallback.pointPriceCny
  };
}

function normalizeAdminUsers(users?: AdminState["users"]): AdminState["users"] {
  const fallbackUsers = createDefaultAdminState().users;

  return (users && users.length > 0 ? users : fallbackUsers).map((user) => ({
    ...user,
    aiCredits: Number.isFinite(Number(user.aiCredits))
      ? Math.max(0, Number(user.aiCredits))
      : user.role === "super-admin" ? 100000 : 0,
    articleImportEnabled: typeof user.articleImportEnabled === "boolean"
      ? user.articleImportEnabled
      : user.role === "super-admin" || user.role === "admin"
  }));
}

function normalizeRolePermissions(rolePermissions?: AdminState["rolePermissions"]): AdminState["rolePermissions"] {
  return (Object.keys(defaultRolePermissions) as RoleKey[]).reduce<Partial<Record<RoleKey, AdminRolePermissions>>>((permissions, role) => {
    const fallback = defaultRolePermissions[role];
    const current = rolePermissions?.[role];
    const legacySalesDefaultTabs = ["overview", "products", "leads", "mail", "contacts"];
    const allowedTabs = Array.isArray(current?.allowedTabs)
      ? current.allowedTabs.filter((item) => adminTabKeys.has(item))
      : fallback.allowedTabs;
    const normalizedAllowedTabs = role === "sales" && JSON.stringify(allowedTabs) === JSON.stringify(legacySalesDefaultTabs)
      ? fallback.allowedTabs
      : allowedTabs;
    const settingsSections = Array.isArray(current?.settingsSections)
      ? current.settingsSections.filter((item) => settingsSectionKeys.has(item))
      : fallback.settingsSections ?? [];

    permissions[role] = {
      allowedTabs: normalizedAllowedTabs.length > 0 ? normalizedAllowedTabs : ["overview"],
      settingsSections,
      articleImportEnabled: typeof current?.articleImportEnabled === "boolean"
        ? current.articleImportEnabled
        : fallback.articleImportEnabled ?? false
    };
    return permissions;
  }, {});
}

function normalizeTranslation(value: Partial<Translation> | undefined, fallback: Translation): Translation {
  const en = typeof value?.en === "string" && value.en.trim() ? value.en : fallback.en;

  return {
    ...fallback,
    ...(value ?? {}),
    en
  };
}

function normalizeTemplateTextBlocks(settings?: Partial<Record<string, Partial<Translation>>>): Record<string, Translation> {
  const keys = new Set([...Object.keys(defaultTemplateTextBlocks), ...Object.keys(settings ?? {})]);

  return Array.from(keys).reduce<Record<string, Translation>>((blocks, key) => {
    const fallback = defaultTemplateTextBlocks[key] ?? { en: settings?.[key]?.en ?? "" };
    blocks[key] = normalizeTranslation(settings?.[key], fallback);
    return blocks;
  }, {});
}

function normalizeHomeSectionOrder(settings?: Partial<SiteTemplateSettings>["sectionOrder"]) {
  const remainingSections = homeSectionKeys
    .filter((key) => key !== "navigation" && key !== "hero")
    .map((key) => ({
      key,
      order: Number.isFinite(settings?.[key]) ? Math.trunc(settings?.[key] as number) : defaultTemplateSettings.sectionOrder[key]
    }))
    .sort((a, b) => a.order - b.order || homeSectionKeys.indexOf(a.key) - homeSectionKeys.indexOf(b.key));

  const sectionOrder: Record<HomeSectionKey, number> = {
    navigation: 10,
    hero: 20,
    products: 30,
    factory: 40,
    markets: 50,
    articles: 60,
    rfq: 70
  };

  remainingSections.forEach((section, index) => {
    sectionOrder[section.key] = (index + 3) * 10;
  });

  return sectionOrder;
}

function normalizeCustomBlockImageItems(block: Partial<SiteTemplateCustomBlock>, index: number): SiteTemplateImageItem[] {
  const rawItems = Array.isArray(block.imageItems) ? block.imageItems : [];
  const normalizedItems = rawItems
    .map((item, itemIndex): SiteTemplateImageItem | null => {
      const url = normalizeCurrentTemplateAssetUrl(item.url);
      if (!url.trim()) return null;

      return {
        id: item.id || `custom-image-${index}-${itemIndex}`,
        url,
        alt: normalizeTranslation(item.alt, block.title ?? { en: "Custom image", zh: "自定义图片" }),
        caption: normalizeTranslation(item.caption, { en: "", zh: "" }),
        enabled: item.enabled ?? true,
        order: Number.isFinite(item.order) ? Math.trunc(item.order) : (itemIndex + 1) * 10
      };
    })
    .filter((item): item is SiteTemplateImageItem => Boolean(item))
    .sort((a, b) => a.order - b.order);

  const fallbackUrl = normalizeCurrentTemplateAssetUrl(block.mediaUrl);
  if (normalizedItems.length === 0 && fallbackUrl.trim()) {
    normalizedItems.push({
      id: `custom-image-${index}-primary`,
      url: fallbackUrl,
      alt: normalizeTranslation(block.title, { en: "Custom image", zh: "自定义图片" }),
      caption: normalizeTranslation(undefined, { en: "", zh: "" }),
      enabled: true,
      order: 10
    });
  }

  return normalizedItems;
}

function normalizeTemplateSettings(settings?: Partial<SiteTemplateSettings>): SiteTemplateSettings {
  const visibleSections = homeSectionKeys.reduce<Record<HomeSectionKey, boolean>>((sections, key) => {
    sections[key] = settings?.visibleSections?.[key] ?? defaultTemplateSettings.visibleSections[key];
    return sections;
  }, {} as Record<HomeSectionKey, boolean>);
  const sectionOrder = normalizeHomeSectionOrder(settings?.sectionOrder);
  const productCount = settings?.homeProductCount;
  const articleCount = settings?.homeArticleCount;
  const intervalSeconds = settings?.heroCarouselIntervalSeconds;
  const heroSlides = Array.isArray(settings?.heroSlides) ? settings.heroSlides : defaultHeroSlides;
  const normalizedSlides = heroSlides
    .map((slide, index) => ({
      id: slide.id || `hero-slide-${index}`,
      imageUrl: normalizeCurrentTemplateAssetUrl(slide.imageUrl),
      alt: normalizeTranslation(slide.alt, defaultHeroSlides[index]?.alt ?? { en: "Homepage hero slide", zh: "首页轮播图片" }),
      enabled: slide.enabled ?? true,
      order: Number.isFinite(slide.order) ? Math.trunc(slide.order) : (index + 1) * 10
    }))
    .filter((slide) => slide.imageUrl.trim())
    .sort((a, b) => a.order - b.order);
  const rawCustomBlocks = Array.isArray(settings?.customBlocks) ? settings.customBlocks : [];
  const customBlocks = rawCustomBlocks
    .map((block, index): SiteTemplateCustomBlock | null => {
      const type = block.type === "image" || block.type === "video" || block.type === "text" || block.type === "cta" ? block.type : null;
      if (!type) return null;
      const fallbackTitle = type === "image" ? "Image module" : type === "video" ? "Video module" : type === "cta" ? "CTA module" : "Text module";
      const rawOrder = block.order;
      const imageItems = type === "image" ? normalizeCustomBlockImageItems(block, index) : undefined;
      const rawImageInterval = block.imageCarouselIntervalSeconds;

      return {
        id: block.id || `custom-block-${index}`,
        type,
        eyebrow: normalizeTranslation(block.eyebrow, {
          en: type === "video" ? "Video" : type === "image" ? "Image" : type === "cta" ? "Action" : "Custom section",
          zh: type === "video" ? "视频" : type === "image" ? "图片" : type === "cta" ? "行动" : "自定义模块"
        }),
        title: normalizeTranslation(block.title, { en: fallbackTitle, zh: fallbackTitle }),
        body: normalizeTranslation(block.body, { en: "", zh: "" }),
        mediaUrl: normalizeCurrentTemplateAssetUrl(block.mediaUrl || imageItems?.find((item) => item.enabled)?.url),
        imageItems,
        imageLayout: block.imageLayout === "split" || block.imageLayout === "grid" || block.imageLayout === "mosaic" || block.imageLayout === "carousel" || block.imageLayout === "single" ? block.imageLayout : "single",
        imageCarouselAutoplay: block.imageCarouselAutoplay ?? true,
        imageCarouselIntervalSeconds: Number.isFinite(rawImageInterval)
          ? Math.max(3, Math.min(15, Math.trunc(rawImageInterval as number)))
          : 5,
        buttonLabel: normalizeTranslation(block.buttonLabel, { en: "Learn more", zh: "了解更多" }),
        linkUrl: block.linkUrl || "",
        openInNewTab: block.openInNewTab ?? false,
        align: block.align === "center" ? "center" : "left",
        layout: block.layout === "media-left" || block.layout === "media-right" || block.layout === "stacked" ? block.layout : (type === "image" || type === "video" ? "media-left" : "stacked"),
        theme: block.theme === "tint" || block.theme === "dark" || block.theme === "light" ? block.theme : (type === "cta" ? "dark" : "light"),
        spacing: block.spacing === "compact" || block.spacing === "large" || block.spacing === "normal" ? block.spacing : "normal",
        enabled: block.enabled ?? true,
        order: Number.isFinite(rawOrder) ? Math.trunc(rawOrder as number) : 60 + index * 10
      };
    })
    .filter((block): block is SiteTemplateCustomBlock => Boolean(block))
    .sort((a, b) => a.order - b.order);

  return {
    homeTemplate: settings?.homeTemplate && homeTemplateKeys.has(settings.homeTemplate) ? settings.homeTemplate : defaultTemplateSettings.homeTemplate,
    heroKicker: normalizeTranslation(settings?.heroKicker, defaultTemplateSettings.heroKicker),
    heroTitle: normalizeTranslation(settings?.heroTitle, defaultTemplateSettings.heroTitle),
    heroBody: normalizeTranslation(settings?.heroBody, defaultTemplateSettings.heroBody),
    primaryCtaLabel: normalizeTranslation(settings?.primaryCtaLabel, defaultTemplateSettings.primaryCtaLabel),
    secondaryCtaLabel: normalizeTranslation(settings?.secondaryCtaLabel, defaultTemplateSettings.secondaryCtaLabel),
    heroCarouselEnabled: settings?.heroCarouselEnabled ?? defaultTemplateSettings.heroCarouselEnabled,
    heroCarouselAutoplay: settings?.heroCarouselAutoplay ?? defaultTemplateSettings.heroCarouselAutoplay,
    heroCarouselIntervalSeconds: Number.isFinite(intervalSeconds)
      ? Math.max(3, Math.min(15, Math.trunc(intervalSeconds as number)))
      : defaultTemplateSettings.heroCarouselIntervalSeconds,
    heroSlides: normalizedSlides.length > 0 ? normalizedSlides : defaultHeroSlides,
    showHeroVisual: settings?.showHeroVisual ?? defaultTemplateSettings.showHeroVisual,
    showHeroMetrics: settings?.showHeroMetrics ?? defaultTemplateSettings.showHeroMetrics,
    footerTagline: normalizeTranslation(settings?.footerTagline, defaultTemplateSettings.footerTagline),
    footerCopyright: normalizeTranslation(settings?.footerCopyright, defaultTemplateSettings.footerCopyright),
    footerCredit: normalizeTranslation(settings?.footerCredit, defaultTemplateSettings.footerCredit),
    homeProductCount: Number.isFinite(productCount) ? Math.max(1, Math.min(12, Math.trunc(productCount as number))) : defaultTemplateSettings.homeProductCount,
    homeArticleCount: Number.isFinite(articleCount) ? Math.max(0, Math.min(12, Math.trunc(articleCount as number))) : defaultTemplateSettings.homeArticleCount,
    visibleSections,
    sectionOrder,
    textBlocks: normalizeTemplateTextBlocks(settings?.textBlocks),
    customBlocks
  };
}

function mergeContactChannels(existingChannels = contactChannels) {
  const existingIds = new Set(existingChannels.map((channel) => channel.id));
  const missingDefaultChannels = contactChannels.filter((channel) => !existingIds.has(channel.id));

  return [...existingChannels, ...missingDefaultChannels];
}

function normalizeActiveTemplateContactChannels(existingChannels = contactChannels) {
  const legacyKeyproEmail = `sales@${"keypro"}${"tools"}.com`;
  const legacyKeyproBrand = `Keypro${"Tools"}`;
  const legacyKeyproHandle = "keypro" + "tools";

  return mergeContactChannels(existingChannels).map((channel) => {
    if (channel.id === "email" && (channel.value === "sales@example.com" || channel.value === legacyKeyproEmail || channel.href === "mailto:sales@example.com" || channel.href === `mailto:${legacyKeyproEmail}`)) {
      return { ...channel, value: "sales@xiyidapackaging.com", href: "mailto:sales@xiyidapackaging.com" };
    }

    if (channel.id === "wechat" && (channel.value === "ExportFactory" || channel.value === legacyKeyproBrand)) {
      return { ...channel, value: "XiyidaPackaging" };
    }

    if (channel.value === "ExportForge") {
      return { ...channel, value: "XiyidaPackaging", href: channel.href.replace(/exportforge/gi, "xiyidapackaging") };
    }

    if (channel.value.toLowerCase().includes("exportforge") || channel.href.toLowerCase().includes("exportforge") || channel.value.toLowerCase().includes(legacyKeyproHandle) || channel.href.toLowerCase().includes(legacyKeyproHandle)) {
      return {
        ...channel,
        value: channel.value.replace(/exportforge/gi, "XiyidaPackaging").replace(new RegExp(legacyKeyproHandle, "gi"), "XiyidaPackaging"),
        href: channel.href.replace(/exportforge/gi, "xiyidapackaging").replace(new RegExp(legacyKeyproHandle, "gi"), "xiyidapackaging")
      };
    }

    return channel;
  });
}

function normalizeEnabledLocales(locales?: LocaleCode[]) {
  const nextLocales = (locales ?? defaultEnabledLocales).filter((locale) => isLocale(locale));
  const uniqueLocales = Array.from(new Set(nextLocales));

  return uniqueLocales.length > 0 ? uniqueLocales : defaultEnabledLocales;
}

function normalizeNavigation(existingNavigation?: SiteNavigationItem[]) {
  const incomingNavigation = Array.isArray(existingNavigation) ? existingNavigation : defaultNavigation;
  const normalizedNavigation = incomingNavigation.map((item, index) => ({
    id: item.id || `nav-custom-${index}`,
    label: item.label?.en ? item.label : { en: item.href || "Navigation", zh: item.href || "导航" },
    href: item.href || "/",
    enabled: item.enabled ?? true,
    order: Number.isFinite(item.order) ? item.order : (index + 1) * 10,
    parentId: item.parentId,
    openInNewTab: item.openInNewTab ?? false
  }));
  const ids = new Set(normalizedNavigation.map((item) => item.id));
  const parentById = new Map(normalizedNavigation.map((item) => [item.id, item.parentId]));

  function createsCycle(itemId: string, parentId?: string) {
    const visited = new Set([itemId]);
    let currentParentId = parentId;

    while (currentParentId) {
      if (visited.has(currentParentId)) return true;
      visited.add(currentParentId);
      currentParentId = parentById.get(currentParentId);
    }

    return false;
  }

  return normalizedNavigation
    .map((item) => ({
      ...item,
      parentId: item.parentId && ids.has(item.parentId) && !createsCycle(item.id, item.parentId)
        ? item.parentId
        : undefined
    }))
    .sort((a, b) => a.order - b.order);
}

function shouldRefreshActiveTemplateContent(parsed: AdminState) {
  return parsed.siteSettings?.contentVersion !== currentTemplateContentVersion;
}

function mergeActiveTemplateMedia(existingFiles = uploadedFiles) {
  const seedIds = new Set(uploadedFiles.map((file) => file.id));
  const retainedFiles = existingFiles.filter((file) => !seedIds.has(file.id) && !file.url?.startsWith(currentTemplateAssetPath));

  return [...uploadedFiles, ...retainedFiles];
}

function mergeSeedArticles(existingArticles = articles) {
  const existingSlugs = new Set(existingArticles.map((article) => article.slug));
  const missingSeedArticles = articles.filter((article) => !existingSlugs.has(article.slug));

  return [...existingArticles, ...missingSeedArticles];
}

function normalizePages(pages: AdminState["pages"] = [], updatedAt?: string) {
  return pages.map((page, index) => ({
    ...page,
    id: page.id ?? `page-${index}-${page.slug}`,
    status: page.status ?? "draft",
    publishedAt: page.publishedAt ?? updatedAt,
    body: page.body ?? { en: "", zh: "" }
  }));
}

async function getCloudflareKv() {
  if (process.env.EXPORTFORGE_SELF_HOST === "1") {
    return null;
  }

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const context = await getCloudflareContext({ async: true }) as CloudflareContext;
    return context.env?.EXPORTFORGE_KV ?? null;
  } catch {
    return null;
  }
}

async function readLocalStateFile() {
  const [{ readFile }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path")
  ]);
  const statePath = path.join(process.cwd(), ".data", "admin-state.json");
  return readFile(statePath, "utf8");
}

async function writeLocalStateFile(value: string) {
  const [{ mkdir, writeFile }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path")
  ]);
  const dataDir = path.join(process.cwd(), ".data");
  const statePath = path.join(dataDir, "admin-state.json");

  await mkdir(dataDir, { recursive: true });
  await writeFile(statePath, value, "utf8");
}

async function readLocalUploadFile(id: string) {
  const [{ readFile }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path")
  ]);
  const filePath = path.join(process.cwd(), ".data", "uploads", `${sanitizeStoredFileId(id)}.json`);
  return readFile(filePath, "utf8");
}

async function writeLocalUploadFile(id: string, value: string) {
  const [{ mkdir, writeFile }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path")
  ]);
  const uploadDir = path.join(process.cwd(), ".data", "uploads");
  const filePath = path.join(uploadDir, `${sanitizeStoredFileId(id)}.json`);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, value, "utf8");
}

async function deleteLocalUploadFile(id: string) {
  const [{ unlink }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path")
  ]);
  const filePath = path.join(process.cwd(), ".data", "uploads", `${sanitizeStoredFileId(id)}.json`);

  await unlink(filePath).catch(() => undefined);
}

function normalizeAdminState(parsed: AdminState): AdminState {
  const refreshActiveTemplateContent = shouldRefreshActiveTemplateContent(parsed);
  const productsSource = refreshActiveTemplateContent ? productCategories : (parsed.products ?? productCategories);
  const articlesSource = refreshActiveTemplateContent ? articles : mergeSeedArticles(parsed.articles ?? articles);
  const navigationSource = refreshActiveTemplateContent ? defaultNavigation : parsed.navigation;
  const uploadedFilesSource = refreshActiveTemplateContent ? mergeActiveTemplateMedia(parsed.uploadedFiles) : mergeActiveTemplateMedia(parsed.uploadedFiles ?? uploadedFiles);
  const siteSettingsSource = refreshActiveTemplateContent
    ? {
        ...(parsed.siteSettings ?? {}),
        title: defaultSiteSettings.title,
        tagline: defaultSiteSettings.tagline,
        contentVersion: currentTemplateContentVersion,
        defaultArticleCategory: productCategories[0]?.slug ?? "uncategorized",
        privacySummary: defaultSiteSettings.privacySummary
      }
    : parsed.siteSettings;

  const normalizedState: AdminState = {
    ...parsed,
    products: productsSource.map((product, index) => ({
      ...product,
      id: product.id ?? `product-${index}-${product.slug}`,
      imageUrl: normalizeCurrentTemplateAssetUrl(product.imageUrl)
    })),
    pages: normalizePages(parsed.pages, parsed.updatedAt),
    articles: articlesSource.map((article) => ({
      ...article,
      id: article.id ?? `article-${article.slug}`,
      body: normalizeCurrentTemplateAssetTranslation(article.body),
      coverImageUrl: normalizeCurrentTemplateAssetUrl(article.coverImageUrl),
      status: article.status ?? "published",
      featuredOnHome: article.featuredOnHome ?? true,
      publishedAt: article.publishedAt ?? parsed.updatedAt
    })),
    leads: parsed.leads ?? [],
    contactChannels: refreshActiveTemplateContent ? normalizeActiveTemplateContactChannels(parsed.contactChannels) : mergeContactChannels(parsed.contactChannels),
    uploadedFiles: uploadedFilesSource.map((file) => ({
      ...file,
      url: normalizeCurrentTemplateAssetUrl(file.url)
    })),
    users: normalizeAdminUsers(parsed.users),
    rolePermissions: normalizeRolePermissions(parsed.rolePermissions),
    activeTheme: refreshActiveTemplateContent ? "equipment" : parsed.activeTheme ?? "equipment",
    enabledLocales: normalizeEnabledLocales(parsed.enabledLocales),
    navigation: normalizeNavigation(navigationSource),
    siteSettings: normalizeSiteSettings(siteSettingsSource),
    templateSettings: normalizeTemplateSettings(refreshActiveTemplateContent ? defaultTemplateSettings : parsed.templateSettings),
    pageLayouts: [],
    aiSettings: normalizeAiSettings(parsed.aiSettings),
    aiCreditSettings: normalizeAiCreditSettings(parsed.aiCreditSettings),
    aiUsageRecords: Array.isArray(parsed.aiUsageRecords) ? parsed.aiUsageRecords.slice(0, 500) : [],
    updatedAt: parsed.updatedAt ?? new Date().toISOString()
  };

  return {
    ...normalizedState,
    pageLayouts: normalizePageLayouts(refreshActiveTemplateContent ? [] : parsed.pageLayouts, normalizedState)
  };
}

export async function readAdminState(): Promise<AdminState> {
  try {
    const kv = await getCloudflareKv();
    const raw = kv ? await kv.get(stateKey) : await readLocalStateFile();
    if (!raw) throw new Error("Missing admin state");
    const parsed = JSON.parse(raw) as AdminState;
    return normalizeAdminState(parsed);
  } catch {
    const fallback = createDefaultAdminState();
    await writeAdminState(fallback);
    return fallback;
  }
}

export function sanitizeAdminState(state: AdminState): AdminState {
  return {
    ...state,
    siteSettings: sanitizeSiteSettingsSecrets(state.siteSettings),
    users: state.users.map(({ passwordHash: _passwordHash, ...user }) => user),
    aiSettings: {
      ...state.aiSettings,
      apiKey: "",
      apiKeyConfigured: Boolean(state.aiSettings.apiKey),
      imageApiKey: "",
      imageApiKeyConfigured: Boolean(state.aiSettings.imageApiKey),
      voiceApiKey: "",
      voiceApiKeyConfigured: Boolean(state.aiSettings.voiceApiKey)
    }
  };
}

export function preserveUserPasswordHashes(nextState: AdminState, existingState: AdminState): AdminState {
  return {
    ...nextState,
    siteSettings: preserveMailSecrets(nextState.siteSettings, existingState.siteSettings),
    aiSettings: {
      ...nextState.aiSettings,
      apiKey: nextState.aiSettings.apiKey?.trim() || existingState.aiSettings.apiKey || "",
      imageApiKey: nextState.aiSettings.imageApiKey?.trim() || existingState.aiSettings.imageApiKey || "",
      voiceApiKey: nextState.aiSettings.voiceApiKey?.trim() || existingState.aiSettings.voiceApiKey || ""
    },
    users: nextState.users.map((user) => {
      const existing = existingState.users.find((item) => item.id === user.id || item.email.toLowerCase() === user.email.toLowerCase());
      return {
        ...user,
        passwordHash: user.passwordHash ?? existing?.passwordHash
      };
    })
  };
}

export async function writeAdminState(state: AdminState): Promise<AdminState> {
  const nextState = { ...state, updatedAt: new Date().toISOString() };
  const serialized = JSON.stringify(nextState, null, 2);
  const kv = await getCloudflareKv();

  if (kv) {
    await kv.put(stateKey, serialized);
  } else {
    await writeLocalStateFile(serialized);
  }

  return nextState;
}

export async function writeStoredFile(file: StoredUploadFile) {
  const serialized = JSON.stringify(file);
  const kv = await getCloudflareKv();

  if (kv) {
    await kv.put(`${uploadKeyPrefix}${file.id}`, serialized);
  } else {
    await writeLocalUploadFile(file.id, serialized);
  }
}

export async function readStoredFile(id: string): Promise<StoredUploadFile | null> {
  const safeId = sanitizeStoredFileId(id);

  if (!safeId) return null;

  try {
    const kv = await getCloudflareKv();
    const raw = kv ? await kv.get(`${uploadKeyPrefix}${safeId}`) : await readLocalUploadFile(safeId);

    if (!raw) return null;
    return JSON.parse(raw) as StoredUploadFile;
  } catch {
    return null;
  }
}

export async function deleteStoredFile(id: string) {
  const safeId = sanitizeStoredFileId(id);

  if (!safeId) return;

  const kv = await getCloudflareKv();
  if (kv) {
    await kv.delete(`${uploadKeyPrefix}${safeId}`);
  } else {
    await deleteLocalUploadFile(safeId);
  }
}
