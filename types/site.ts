import type { LucideIcon } from "lucide-react";
import type { Data as PuckData } from "@puckeditor/core";

export type LocaleCode =
  | "en"
  | "zh"
  | "th"
  | "vi"
  | "id"
  | "ms"
  | "fil"
  | "my"
  | "km"
  | "lo"
  | "ar"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "hi"
  | "ru"
  | "ja"
  | "ko"
  | "ur";

export type Translation<T = string> = Partial<Record<LocaleCode, T>> & { en: T };

export type ThemeKey =
  | "industrial"
  | "clean-export"
  | "premium-brand"
  | "equipment"
  | "consumer-goods";

export type RoleKey = "super-admin" | "admin" | "editor" | "sales" | "viewer";

export type Permission =
  | "products:view"
  | "products:create"
  | "products:edit"
  | "products:delete"
  | "products:publish"
  | "pages:view"
  | "pages:create"
  | "pages:edit"
  | "pages:delete"
  | "pages:publish"
  | "articles:view"
  | "articles:create"
  | "articles:edit"
  | "articles:delete"
  | "articles:publish"
  | "leads:view"
  | "leads:assign"
  | "leads:status"
  | "leads:export"
  | "users:manage"
  | "templates:manage"
  | "themes:manage"
  | "settings:manage"
  | "ai:configure"
  | "ai:generate";

export type ContactChannelType =
  | "phone"
  | "whatsapp"
  | "email"
  | "wechat"
  | "zalo"
  | "line"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "messenger"
  | "linkedin"
  | "skype"
  | "custom"
  | "rfq";

export type ContactChannel = {
  id: string;
  type: ContactChannelType;
  label: Translation;
  value: string;
  href: string;
  color: string;
  enabled: boolean;
  qrCodeUrl?: string;
  iconUrl?: string;
  icon?: LucideIcon;
};

export type SeoSettings = {
  title?: Translation;
  description?: Translation;
  ogImageUrl?: string;
  canonicalUrl?: string;
  indexable?: boolean;
};

export type ProductCategory = {
  id?: string;
  slug: string;
  name: Translation;
  summary: Translation;
  parentId?: string;
  applications: Translation<string[]>;
  specs: string[];
  themeFit: ThemeKey[];
  imageUrl?: string;
  seo?: SeoSettings;
};

export type Article = {
  id?: string;
  slug: string;
  title: Translation;
  excerpt: Translation;
  body?: Translation;
  category: string;
  status?: "draft" | "published" | "trash";
  featuredOnHome?: boolean;
  publishedAt?: string;
  deletedAt?: string;
  coverImageUrl?: string;
  seo?: SeoSettings;
};

export type SitePage = {
  id?: string;
  slug: string;
  title: Translation;
  excerpt: Translation;
  body: Translation;
  status?: "draft" | "published" | "trash";
  publishedAt?: string;
  deletedAt?: string;
  seo?: SeoSettings;
};

export type SiteNavigationItem = {
  id: string;
  label: Translation;
  href: string;
  enabled: boolean;
  order: number;
  parentId?: string;
  openInNewTab?: boolean;
};

export type UploadedFile = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  storageKey?: string;
  description?: Translation;
  enabled?: boolean;
};

export type LeadStatus = "new" | "contacted" | "quoted" | "closed" | "spam";

export type LeadPayload = {
  fullName?: string;
  company?: string;
  productType: string;
  quantity: string;
  email: string;
  whatsapp?: string;
  destination?: string;
  workpieceMaterial?: string;
  message?: string;
  locale?: LocaleCode;
  sourcePath?: string;
};

export type AdminLead = LeadPayload & {
  id: string;
  status: LeadStatus;
  createdAt: string;
  assignedTo?: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  active: boolean;
  aiCredits?: number;
  allowedTabs?: string[];
  articleImportEnabled?: boolean;
  jobTitle?: string;
  phone?: string;
  avatarUrl?: string;
  passwordHash?: string;
};

export type AdminRolePermissions = {
  allowedTabs: string[];
  settingsSections?: string[];
  articleImportEnabled?: boolean;
};

export type AiCreditSettings = {
  enabled: boolean;
  pointsPerThousandTokens: number;
  pointPriceCny: number;
};

export type WorldClockCity = {
  id: string;
  city: string;
  country: string;
  zone: string;
  custom?: boolean;
};

export type AiUsageRecord = {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  pointsUsed: number;
  balanceAfter: number;
  createdAt: string;
};

export type AiSettings = {
  provider: string;
  model: string;
  baseUrl: string;
  apiKey?: string;
  apiKeyConfigured?: boolean;
  imageProvider: string;
  imageModel: string;
  imageBaseUrl: string;
  imageApiKey?: string;
  imageApiKeyConfigured?: boolean;
  voiceProvider: string;
  voiceModel: string;
  voiceBaseUrl: string;
  voiceApiKey?: string;
  voiceApiKeyConfigured?: boolean;
  defaultLocale: LocaleCode;
  brandVoice: string;
  targetMarkets: string[];
  requiredKeywords: string[];
  blockedWords: string[];
  enabled: boolean;
};

export type SiteSettings = {
  title: string;
  tagline: string;
  contentVersion?: string;
  siteIconUrl: string;
  fontFamily: string;
  siteUrl: string;
  adminEmail: string;
  mailFromEmail?: string;
  mailFromName?: string;
  mailReplyToEmail?: string;
  mailProvider?: "mailto" | "smtp" | "http";
  mailSmtpHost?: string;
  mailSmtpPort?: number;
  mailSmtpSecure?: boolean;
  mailSmtpEncryption?: "ssl" | "tls" | "none";
  mailSmtpAccountName?: string;
  mailSmtpUseDifferentAccountName?: boolean;
  mailSmtpUser?: string;
  mailSmtpPassword?: string;
  mailSmtpPasswordConfigured?: boolean;
  mailReplyToDifferent?: boolean;
  mailImapEnabled?: boolean;
  mailImapHost?: string;
  mailImapPort?: number;
  mailImapEncryption?: "ssl" | "tls" | "none";
  mailImapCollectExternalReplies?: boolean;
  mailApiProvider?: string;
  mailApiBaseUrl?: string;
  mailApiKey?: string;
  mailApiKeyConfigured?: boolean;
  mailReplyTemplate?: string;
  allowRegistration: boolean;
  defaultUserRole: RoleKey;
  siteLanguage: LocaleCode;
  timezone: string;
  worldClockCities?: WorldClockCity[];
  dateFormat: string;
  timeFormat: string;
  defaultArticleCategory: string;
  defaultArticleStatus: "draft" | "published";
  postsPerPage: number;
  showFeaturedArticles: boolean;
  searchEngineVisible: boolean;
  thumbnailWidth: number;
  thumbnailHeight: number;
  mediumWidth: number;
  mediumHeight: number;
  largeWidth: number;
  largeHeight: number;
  uploadsOrganizedByMonth: boolean;
  productUrlBase: string;
  articleUrlBase: string;
  fileUrlBase: string;
  privacyPageUrl: string;
  cookieNoticeEnabled: boolean;
  privacySummary: string;
};

export type HomeTemplateKey = "industrial-showcase" | "catalog-focus" | "rfq-focus";

export type HomeSectionKey = "navigation" | "hero" | "products" | "factory" | "markets" | "articles" | "rfq";

export type SiteHeroSlide = {
  id: string;
  imageUrl: string;
  alt: Translation;
  enabled: boolean;
  order: number;
};

export type SiteTemplateCustomBlockType = "text" | "image" | "video" | "cta";
export type SiteTemplateImageLayout = "single" | "split" | "grid" | "mosaic" | "carousel";

export type SiteTemplateImageItem = {
  id: string;
  url: string;
  alt?: Translation;
  caption?: Translation;
  enabled: boolean;
  order: number;
};

export type SiteTemplateCustomBlock = {
  id: string;
  type: SiteTemplateCustomBlockType;
  eyebrow?: Translation;
  title: Translation;
  body: Translation;
  mediaUrl?: string;
  imageItems?: SiteTemplateImageItem[];
  imageLayout?: SiteTemplateImageLayout;
  imageCarouselAutoplay?: boolean;
  imageCarouselIntervalSeconds?: number;
  buttonLabel?: Translation;
  linkUrl?: string;
  openInNewTab?: boolean;
  align?: "left" | "center";
  layout?: "stacked" | "media-left" | "media-right";
  theme?: "light" | "tint" | "dark";
  spacing?: "compact" | "normal" | "large";
  enabled: boolean;
  order: number;
};

export type SiteTemplateSettings = {
  homeTemplate: HomeTemplateKey;
  heroKicker: Translation;
  heroTitle: Translation;
  heroBody: Translation;
  primaryCtaLabel: Translation;
  secondaryCtaLabel: Translation;
  heroCarouselEnabled: boolean;
  heroCarouselAutoplay: boolean;
  heroCarouselIntervalSeconds: number;
  heroSlides: SiteHeroSlide[];
  showHeroVisual: boolean;
  showHeroMetrics: boolean;
  footerTagline: Translation;
  footerCopyright: Translation;
  footerCredit: Translation;
  homeProductCount: number;
  homeArticleCount: number;
  visibleSections: Record<HomeSectionKey, boolean>;
  sectionOrder: Record<HomeSectionKey, number>;
  textBlocks: Record<string, Translation>;
  customBlocks: SiteTemplateCustomBlock[];
};

export type PageLayoutKey =
  | "home"
  | "products-index"
  | "product-detail"
  | "articles-index"
  | "article-detail"
  | "files-index"
  | "contact"
  | `page:${string}`;

export type VisualPageLayoutData = PuckData<Record<string, Record<string, unknown>>>;

export type SitePageLayout = {
  key: PageLayoutKey;
  label: string;
  data: VisualPageLayoutData;
  updatedAt: string;
  publishedAt?: string;
};

export type TemplatePackagePayload = {
  format: "exportforge-template-package";
  version: 1;
  createdAt: string;
  pageLayouts: SitePageLayout[];
  templateSettings: SiteTemplateSettings;
  activeTheme: ThemeKey;
  navigation?: SiteNavigationItem[];
  uploadedFiles?: UploadedFile[];
};

export type AdminState = {
  products: ProductCategory[];
  pages: SitePage[];
  articles: Article[];
  leads: AdminLead[];
  contactChannels: ContactChannel[];
  uploadedFiles: UploadedFile[];
  users: AdminUser[];
  rolePermissions?: Partial<Record<RoleKey, AdminRolePermissions>>;
  activeTheme: ThemeKey;
  enabledLocales: LocaleCode[];
  navigation: SiteNavigationItem[];
  siteSettings: SiteSettings;
  templateSettings: SiteTemplateSettings;
  pageLayouts: SitePageLayout[];
  aiSettings: AiSettings;
  aiCreditSettings: AiCreditSettings;
  aiUsageRecords: AiUsageRecord[];
  updatedAt: string;
};
