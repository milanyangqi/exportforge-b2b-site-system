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
const currentTemplateContentVersion = "current-template-keyprotools-v1";
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
    allowedTabs: ["overview", "products", "leads", "mail", "contacts"],
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
    id: "hero-tooling-range",
    imageUrl: "/assets/current-template/hero-tooling-range.jpg",
    alt: { en: "Carbide end mills and drill bits hero poster", zh: "硬质合金铣刀与钻头首页海报" },
    enabled: true,
    order: 10
  },
  {
    id: "hero-cnc-factory",
    imageUrl: "/assets/current-template/hero-cnc-factory.jpg",
    alt: { en: "CNC factory tooling production hero poster", zh: "CNC 工厂刀具生产首页海报" },
    enabled: true,
    order: 20
  },
  {
    id: "hero-export-packing",
    imageUrl: "/assets/current-template/hero-export-packing.jpg",
    alt: { en: "Export packing and OEM tooling hero poster", zh: "出口包装与 OEM 刀具首页海报" },
    enabled: true,
    order: 30
  }
];

const defaultSiteSettings: SiteSettings = {
  title: siteSettings.brand,
  tagline: "Carbide end mills, drill bits, OEM tooling, and export-ready packing.",
  contentVersion: currentTemplateContentVersion,
  siteIconUrl: "",
  fontFamily: "\"Manrope\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://exportforge-b2b-site-system.437991663.workers.dev",
  adminEmail: process.env.INITIAL_ADMIN_EMAIL ?? "admin@example.com",
  mailFromEmail: process.env.INITIAL_ADMIN_EMAIL ?? "admin@example.com",
  mailFromName: siteSettings.brand,
  mailReplyToEmail: process.env.INITIAL_ADMIN_EMAIL ?? "admin@example.com",
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
  mailReplyTemplate: "Hello {name},\n\nThank you for your RFQ about {productType}. We have received your inquiry and will follow up with tooling details, quotation, and lead time soon.\n\nBest regards,\n{siteTitle}",
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
  privacySummary: "We use submitted RFQ details only for tooling quotation, sales follow-up, and service improvement."
};

const defaultTemplateTextBlocks: Record<string, Translation> = {
  productsEyebrow: { en: "Product catalog", zh: "PRODUCT CATALOG" },
  productsTitle: { en: "End mills, drill bits, and OEM tooling built for repeat purchasing.", zh: "硬质合金刀具目录" },
  productsBody: {
    en: "Browse core categories for CNC shops, hardware distributors, maintenance suppliers, and private-label tool programs.",
    zh: "覆盖经销商备货、工厂加工与定制刀具需求。"
  },
  factoryEyebrow: { en: "Factory capability", zh: "工厂能力" },
  factoryTitle: { en: "Geometry, coating, inspection, and packing are aligned before every export order.", zh: "从几何、涂层到包装的供应能力" },
  factoryCard1Title: { en: "Tool geometry", zh: "OEM 图纸定制" },
  factoryCard1Body: { en: "Square, ball nose, corner radius, long-neck, micro, step, and coolant-through options.", zh: "适合经销商长期备货、样品确认与批量订单。" },
  factoryCard2Title: { en: "Coating choice", zh: "涂层与刃口处理" },
  factoryCard2Body: { en: "AlTiN, TiSiN, DLC, bright finish, and buyer-specific series positioning.", zh: "适合经销商长期备货、样品确认与批量订单。" },
  factoryCard3Title: { en: "Export packing", zh: "私标包装交付" },
  factoryCard3Body: { en: "Plastic tubes, foam trays, barcode labels, carton marks, and distributor-ready assortments.", zh: "适合经销商长期备货、样品确认与批量订单。" },
  marketsEyebrow: { en: "Global supply", zh: "出口市场" },
  marketsTitle: { en: "Buyer-ready communication for distributors across major tooling markets.", zh: "多语言市场与 RFQ 清单" },
  marketsBody: {
    en: "KeyproTools supports multilingual product pages, quick RFQ details, and export documentation for buyers comparing end mills, drill bits, and OEM assortments.",
    zh: "支持多语言产品页、快速 RFQ 信息和出口文件，适合铣刀、钻头与 OEM 组合采购。"
  },
  marketsChecklistTitle: { en: "RFQ checklist", zh: "RFQ 清单" },
  marketsChecklist1: { en: "Tool type, diameter, flute length, overall length, and shank.", zh: "刀具类型、直径、刃长、总长和柄径。" },
  marketsChecklist2: { en: "Workpiece material, hardness, coating, and cutting condition.", zh: "工件材料、硬度、涂层和切削条件。" },
  marketsChecklist3: { en: "Quantity, packaging, laser marking, destination, and delivery target.", zh: "数量、包装、激光打标、目的地和交付目标。" },
  marketsNote: { en: siteSettings.aiDraftPolicy, zh: siteSettings.aiDraftPolicy },
  articlesEyebrow: { en: "Technical articles", zh: "技术文章" },
  articlesTitle: { en: "Selection guides for buyers comparing tool geometry, coating, and packaging.", zh: "技术文章" },
  rfqEyebrow: { en: "Request a quote", zh: "询盘表单" },
  rfqTitle: { en: "Share your tool list and export requirements.", zh: "把刀具清单发给 KeyproTools" },
  rfqBody: {
    en: "Send product type, size range, quantity, coating, destination, and packing needs. The sales team will turn it into a clear quotation.",
    zh: "规格、数量、涂层、包装和交期信息会在前台询盘表单中收集。"
  },
  rfqGuidanceTitle: { en: "For a faster reply, include:", zh: "为了更快回复，请包含：" },
  rfqGuidance1: { en: "Tool diameter, flute length, shank size, and tolerance.", zh: "刀具直径、刃长、柄径和公差。" },
  rfqGuidance2: { en: "Workpiece material, coating preference, and application details.", zh: "工件材料、涂层偏好和应用细节。" },
  rfqGuidance3: { en: "Packaging, private label, target quantity, and delivery market.", zh: "包装、私标、目标数量和交付市场。" },
  rfqNote: {
    en: "KeyproTools usually reviews RFQ details by product family so the quotation can match stock, OEM marking, and export packing requirements.",
    zh: "KeyproTools 会按产品系列审核 RFQ 信息，让报价匹配库存、OEM 打标和出口包装要求。"
  },
  heroMetric1Value: { en: "0.2-25mm", zh: "6 条产品线" },
  heroMetric1Label: { en: "End mill diameter range", zh: "产品目录" },
  heroMetric2Value: { en: "HSS / M35 / Carbide", zh: "OEM 定制" },
  heroMetric2Label: { en: "Drill bit supply", zh: "图纸与私标" },
  heroMetric3Value: { en: "OEM", zh: "出口包装" },
  heroMetric3Label: { en: "Laser marking and packing", zh: "经销商备货" }
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
  heroKicker: { en: "CNC cutting tools for global buyers", zh: "面向全球买家的 CNC 刀具供应" },
  heroTitle: { en: "Carbide end mills and drill bits ready for distributor programs.", zh: "面向经销商长期备货的硬质合金铣刀与钻头。" },
  heroBody: {
    en: "KeyproTools supplies end mills, drill bits, custom tooling, coating options, private-label packing, and export-ready QC support for hardware and machining buyers.",
    zh: "KeyproTools 提供铣刀、钻头、定制刀具、涂层方案、私标包装和出口质检支持，服务五金工具与机加工采购商。"
  },
  primaryCtaLabel: { en: "Request Quote", zh: "获取报价" },
  secondaryCtaLabel: { en: "Products", zh: "产品目录" },
  heroCarouselEnabled: true,
  heroCarouselAutoplay: true,
  heroCarouselIntervalSeconds: 7,
  heroSlides: defaultHeroSlides,
  showHeroVisual: true,
  showHeroMetrics: true,
  footerTagline: {
    en: "Carbide end mills, drill bits, OEM tooling, and export-ready packing for global buyers.",
    zh: "硬质合金铣刀、钻头、OEM 刀具和面向全球买家的出口包装。"
  },
  footerCopyright: {
    en: "Copyright © {year} {brand}. All rights reserved.",
    zh: "Copyright © {year} {brand}. All rights reserved."
  },
  footerCredit: {
    en: "Built for precision tooling and B2B export orders.",
    zh: "为精密刀具和 B2B 出口订单打造。"
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
    activeTheme: "industrial",
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
      brandVoice: "Clear, technical, buyer-focused cutting tool copy for KeyproTools.",
      targetMarkets: ["Europe", "North America", "Southeast Asia", "MENA"],
      requiredKeywords: ["carbide end mills", "drill bits", "OEM tooling", "quality inspection"],
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

  return {
    ...nextSettings,
    mailSmtpPassword: smtpPassword ? encryptMailSecret(smtpPassword) : existingSettings.mailSmtpPassword || "",
    mailApiKey: apiKey ? encryptMailSecret(apiKey) : existingSettings.mailApiKey || ""
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
    const allowedTabs = Array.isArray(current?.allowedTabs)
      ? current.allowedTabs.filter((item) => adminTabKeys.has(item))
      : fallback.allowedTabs;
    const settingsSections = Array.isArray(current?.settingsSections)
      ? current.settingsSections.filter((item) => settingsSectionKeys.has(item))
      : fallback.settingsSections ?? [];

    permissions[role] = {
      allowedTabs: allowedTabs.length > 0 ? allowedTabs : ["overview"],
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
  return mergeContactChannels(existingChannels).map((channel) => {
    if (channel.id === "email" && (channel.value === "sales@example.com" || channel.href === "mailto:sales@example.com")) {
      return { ...channel, value: "sales@keyprotools.com", href: "mailto:sales@keyprotools.com" };
    }

    if (channel.id === "wechat" && channel.value === "ExportFactory") {
      return { ...channel, value: "KeyproTools" };
    }

    if (channel.value === "ExportForge") {
      return { ...channel, value: "KeyproTools", href: channel.href.replace(/exportforge/gi, "keyprotools") };
    }

    if (channel.value.toLowerCase().includes("exportforge") || channel.href.toLowerCase().includes("exportforge")) {
      return {
        ...channel,
        value: channel.value.replace(/exportforge/gi, "keyprotools"),
        href: channel.href.replace(/exportforge/gi, "keyprotools")
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
  const retainedFiles = existingFiles.filter((file) => !seedIds.has(file.id));

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
    activeTheme: parsed.activeTheme ?? "industrial",
    enabledLocales: normalizeEnabledLocales(parsed.enabledLocales),
    navigation: normalizeNavigation(navigationSource),
    siteSettings: normalizeSiteSettings(siteSettingsSource),
    templateSettings: normalizeTemplateSettings(parsed.templateSettings),
    pageLayouts: [],
    aiSettings: normalizeAiSettings(parsed.aiSettings),
    aiCreditSettings: normalizeAiCreditSettings(parsed.aiCreditSettings),
    aiUsageRecords: Array.isArray(parsed.aiUsageRecords) ? parsed.aiUsageRecords.slice(0, 500) : [],
    updatedAt: parsed.updatedAt ?? new Date().toISOString()
  };

  return {
    ...normalizedState,
    pageLayouts: normalizePageLayouts(parsed.pageLayouts, normalizedState)
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
