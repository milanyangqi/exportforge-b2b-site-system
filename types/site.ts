import type { LucideIcon } from "lucide-react";

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
  icon?: LucideIcon;
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
};

export type SiteNavigationItem = {
  id: string;
  label: Translation;
  href: string;
  enabled: boolean;
  order: number;
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
  productType: string;
  quantity: string;
  email: string;
  destination?: string;
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
  allowedTabs?: string[];
  jobTitle?: string;
  phone?: string;
  avatarUrl?: string;
  passwordHash?: string;
};

export type AiSettings = {
  provider: string;
  model: string;
  baseUrl: string;
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
  allowRegistration: boolean;
  defaultUserRole: RoleKey;
  siteLanguage: LocaleCode;
  timezone: string;
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

export type AdminState = {
  products: ProductCategory[];
  articles: Article[];
  leads: AdminLead[];
  contactChannels: ContactChannel[];
  uploadedFiles: UploadedFile[];
  users: AdminUser[];
  activeTheme: ThemeKey;
  enabledLocales: LocaleCode[];
  navigation: SiteNavigationItem[];
  siteSettings: SiteSettings;
  aiSettings: AiSettings;
  updatedAt: string;
};
