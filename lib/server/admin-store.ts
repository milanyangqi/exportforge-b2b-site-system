import { articles, contactChannels, defaultEnabledLocales, defaultNavigation, productCategories, siteSettings, uploadedFiles } from "@/data/site";
import { isLocale } from "@/config/locales";
import type { AdminState, LocaleCode, SiteNavigationItem, SiteSettings } from "@/types/site";

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
const keyproContentVersion = "keyprotools-tools-v1";

const defaultSiteSettings: SiteSettings = {
  title: siteSettings.brand,
  tagline: "Carbide end mills, drill bits, OEM tooling, and export-ready packing.",
  contentVersion: keyproContentVersion,
  siteIconUrl: "",
  fontFamily: "\"Manrope\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://exportforge-b2b-site-system.437991663.workers.dev",
  adminEmail: process.env.INITIAL_ADMIN_EMAIL ?? "admin@example.com",
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

function sanitizeStoredFileId(id: string) {
  return id.replace(/[^a-zA-Z0-9._-]/g, "");
}

export function buildStoredFileUrl(id: string) {
  return `/api/files/${encodeURIComponent(id)}`;
}

export function createDefaultAdminState(): AdminState {
  return {
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
    users: [
      {
        id: "u-super-admin",
        name: "System Admin",
        email: process.env.INITIAL_ADMIN_EMAIL ?? "admin@example.com",
        role: "super-admin",
        active: true,
        jobTitle: "Owner"
      },
      {
        id: "u-sales",
        name: "Sales Manager",
        email: "sales@example.com",
        role: "sales",
        active: true,
        jobTitle: "Sales"
      }
    ],
    aiSettings: {
      provider: process.env.AI_PROVIDER ?? "openai-compatible",
      model: process.env.AI_MODEL ?? "gpt-4.1-mini",
      baseUrl: process.env.AI_BASE_URL ?? "",
      defaultLocale: "en",
      brandVoice: "Clear, technical, buyer-focused cutting tool copy for KeyproTools.",
      targetMarkets: ["Europe", "North America", "Southeast Asia", "MENA"],
      requiredKeywords: ["carbide end mills", "drill bits", "OEM tooling", "quality inspection"],
      blockedWords: [],
      enabled: Boolean(process.env.AI_API_KEY)
    },
    updatedAt: new Date().toISOString()
  };
}

function normalizeSiteSettings(settings?: Partial<SiteSettings>): SiteSettings {
  const next = { ...defaultSiteSettings, ...(settings ?? {}) };
  const validLocale = isLocale(next.siteLanguage) ? next.siteLanguage : defaultSiteSettings.siteLanguage;

  return {
    ...next,
    siteLanguage: validLocale,
    postsPerPage: Number.isFinite(next.postsPerPage) && next.postsPerPage > 0 ? Math.trunc(next.postsPerPage) : defaultSiteSettings.postsPerPage,
    thumbnailWidth: Number.isFinite(next.thumbnailWidth) ? Math.max(0, Math.trunc(next.thumbnailWidth)) : defaultSiteSettings.thumbnailWidth,
    thumbnailHeight: Number.isFinite(next.thumbnailHeight) ? Math.max(0, Math.trunc(next.thumbnailHeight)) : defaultSiteSettings.thumbnailHeight,
    mediumWidth: Number.isFinite(next.mediumWidth) ? Math.max(0, Math.trunc(next.mediumWidth)) : defaultSiteSettings.mediumWidth,
    mediumHeight: Number.isFinite(next.mediumHeight) ? Math.max(0, Math.trunc(next.mediumHeight)) : defaultSiteSettings.mediumHeight,
    largeWidth: Number.isFinite(next.largeWidth) ? Math.max(0, Math.trunc(next.largeWidth)) : defaultSiteSettings.largeWidth,
    largeHeight: Number.isFinite(next.largeHeight) ? Math.max(0, Math.trunc(next.largeHeight)) : defaultSiteSettings.largeHeight
  };
}

function mergeContactChannels(existingChannels = contactChannels) {
  const existingIds = new Set(existingChannels.map((channel) => channel.id));
  const missingDefaultChannels = contactChannels.filter((channel) => !existingIds.has(channel.id));

  return [...existingChannels, ...missingDefaultChannels];
}

function normalizeKeyproContactChannels(existingChannels = contactChannels) {
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

function shouldRefreshKeyproContent(parsed: AdminState) {
  return parsed.siteSettings?.contentVersion !== keyproContentVersion;
}

function mergeKeyproMedia(existingFiles = uploadedFiles) {
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
  const refreshKeyproContent = shouldRefreshKeyproContent(parsed);
  const productsSource = refreshKeyproContent ? productCategories : (parsed.products ?? productCategories);
  const articlesSource = refreshKeyproContent ? articles : mergeSeedArticles(parsed.articles ?? articles);
  const navigationSource = refreshKeyproContent ? defaultNavigation : parsed.navigation;
  const uploadedFilesSource = refreshKeyproContent ? mergeKeyproMedia(parsed.uploadedFiles) : mergeKeyproMedia(parsed.uploadedFiles ?? uploadedFiles);
  const siteSettingsSource = refreshKeyproContent
    ? {
        ...(parsed.siteSettings ?? {}),
        title: defaultSiteSettings.title,
        tagline: defaultSiteSettings.tagline,
        contentVersion: keyproContentVersion,
        defaultArticleCategory: productCategories[0]?.slug ?? "uncategorized",
        privacySummary: defaultSiteSettings.privacySummary
      }
    : parsed.siteSettings;

  return {
    ...parsed,
    products: productsSource.map((product, index) => ({
      ...product,
      id: product.id ?? `product-${index}-${product.slug}`
    })),
    pages: normalizePages(parsed.pages, parsed.updatedAt),
    articles: articlesSource.map((article) => ({
      ...article,
      id: article.id ?? `article-${article.slug}`,
      status: article.status ?? "published",
      featuredOnHome: article.featuredOnHome ?? true,
      publishedAt: article.publishedAt ?? parsed.updatedAt
    })),
    leads: parsed.leads ?? [],
    contactChannels: refreshKeyproContent ? normalizeKeyproContactChannels(parsed.contactChannels) : mergeContactChannels(parsed.contactChannels),
    uploadedFiles: uploadedFilesSource,
    users: parsed.users ?? createDefaultAdminState().users,
    activeTheme: parsed.activeTheme ?? "industrial",
    enabledLocales: normalizeEnabledLocales(parsed.enabledLocales),
    navigation: normalizeNavigation(navigationSource),
    siteSettings: normalizeSiteSettings(siteSettingsSource),
    aiSettings: parsed.aiSettings ?? createDefaultAdminState().aiSettings,
    updatedAt: parsed.updatedAt ?? new Date().toISOString()
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
    users: state.users.map(({ passwordHash: _passwordHash, ...user }) => user)
  };
}

export function preserveUserPasswordHashes(nextState: AdminState, existingState: AdminState): AdminState {
  return {
    ...nextState,
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
