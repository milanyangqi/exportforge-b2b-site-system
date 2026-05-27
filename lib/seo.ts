import type { Metadata } from "next";
import type { AdminState, Article, LocaleCode, ProductCategory, SeoSettings, SitePage, Translation } from "@/types/site";

export type SeoPageKind = "website" | "home" | "products" | "product" | "articles" | "article" | "page" | "files" | "contact";

type MetadataInput = {
  locale: LocaleCode;
  path: string;
  title: string;
  description: string;
  kind: SeoPageKind;
  image?: string;
  publishedTime?: string;
  contentComplete?: boolean;
  alternates?: Partial<Record<LocaleCode, string>>;
  seo?: SeoSettings;
};

const defaultSiteUrl = "https://exportforge-b2b-site-system.437991663.workers.dev";
const fallbackLocale: LocaleCode = "en";

export function normalizeSiteUrl(siteUrl?: string) {
  const rawUrl = siteUrl?.trim() || process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl;

  try {
    const url = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    return url.origin;
  } catch {
    return defaultSiteUrl;
  }
}

export function getSiteBaseUrl(state: AdminState) {
  return normalizeSiteUrl(state.siteSettings.siteUrl);
}

export function isSiteIndexable(state: AdminState) {
  return process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true" && state.siteSettings.searchEngineVisible;
}

export function absoluteUrl(state: AdminState, path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteBaseUrl(state)}${normalizedPath}`;
}

export function localized<T>(value: Translation<T> | undefined, locale: LocaleCode, fallback?: T): T {
  if (!value) return fallback as T;
  return value[locale] ?? value.en ?? fallback as T;
}

export function hasLocalizedText(value: Partial<Record<LocaleCode, string>> | undefined, locale: LocaleCode) {
  return Boolean(value?.[locale]?.trim());
}

export function hasLocalizedList(value: Partial<Record<LocaleCode, string[]>> | undefined, locale: LocaleCode) {
  return Array.isArray(value?.[locale]) && (value?.[locale]?.length ?? 0) > 0;
}

export function stripMarkdown(value: string) {
  return value
    .replace(/!\[([^\]]*)]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[`*_>#~-]/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function compactDescription(value: string, fallback: string) {
  const text = stripMarkdown(value || fallback);
  if (text.length <= 158) return text;
  return `${text.slice(0, 155).trim()}...`;
}

function compactTitle(value: string, brandName: string) {
  const text = stripMarkdown(value || brandName);
  return text.includes(brandName) ? text : `${text} | ${brandName}`;
}

export function localePath(locale: LocaleCode, path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath === "/") return `/${locale}`;
  return `/${locale}${normalizedPath}`;
}

export function buildLanguageAlternates(state: AdminState, pathsByLocale: Partial<Record<LocaleCode, string>>) {
  const languages = state.enabledLocales.reduce<Record<string, string>>((items, locale) => {
    const path = pathsByLocale[locale];
    if (path) items[locale] = absoluteUrl(state, path);
    return items;
  }, {});
  const defaultPath = pathsByLocale[fallbackLocale] ?? pathsByLocale[state.siteSettings.siteLanguage] ?? Object.values(pathsByLocale)[0];

  if (defaultPath) languages["x-default"] = absoluteUrl(state, defaultPath);
  return languages;
}

export function buildPageMetadata(state: AdminState, input: MetadataInput): Metadata {
  const brandName = state.siteSettings.title || "KeyproTools";
  const seoTitle = localized(input.seo?.title, input.locale, "").trim();
  const seoDescription = localized(input.seo?.description, input.locale, "").trim();
  const title = compactTitle(seoTitle || input.title, brandName);
  const description = compactDescription(seoDescription || input.description, state.siteSettings.tagline);
  const canonicalPath = input.seo?.canonicalUrl?.trim() || input.path;
  const canonicalUrl = canonicalPath.startsWith("http") ? canonicalPath : absoluteUrl(state, canonicalPath);
  const indexable = isSiteIndexable(state) && input.contentComplete !== false && input.seo?.indexable !== false;
  const image = input.seo?.ogImageUrl || input.image || state.siteSettings.siteIconUrl;
  const languages = buildLanguageAlternates(state, input.alternates ?? { [input.locale]: input.path });
  const metadataBase = new URL(getSiteBaseUrl(state));

  return {
    metadataBase,
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages
    },
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable
      }
    },
    openGraph: {
      type: input.kind === "article" ? "article" : "website",
      siteName: brandName,
      locale: input.locale,
      title,
      description,
      url: canonicalUrl,
      images: image ? [{ url: image.startsWith("http") ? image : absoluteUrl(state, image), alt: title }] : undefined,
      publishedTime: input.publishedTime
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image.startsWith("http") ? image : absoluteUrl(state, image)] : undefined
    }
  };
}

export function productContentComplete(product: ProductCategory, locale: LocaleCode) {
  return hasLocalizedText(product.name, locale) && hasLocalizedText(product.summary, locale) && hasLocalizedList(product.applications, locale);
}

export function articleContentComplete(article: Article, locale: LocaleCode) {
  return hasLocalizedText(article.title, locale) && hasLocalizedText(article.excerpt, locale) && (!article.body || hasLocalizedText(article.body, locale));
}

export function pageContentComplete(page: SitePage, locale: LocaleCode) {
  return hasLocalizedText(page.title, locale) && hasLocalizedText(page.excerpt, locale) && hasLocalizedText(page.body, locale);
}

export function homeContentComplete(state: AdminState, locale: LocaleCode) {
  return hasLocalizedText(state.templateSettings.heroTitle, locale) && hasLocalizedText(state.templateSettings.heroBody, locale);
}

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildOrganizationJsonLd(state: AdminState, locale: LocaleCode) {
  const contacts = state.contactChannels.filter((channel) => channel.enabled);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: state.siteSettings.title,
    url: absoluteUrl(state, localePath(locale)),
    logo: state.siteSettings.siteIconUrl ? absoluteUrl(state, state.siteSettings.siteIconUrl) : undefined,
    description: state.siteSettings.tagline,
    contactPoint: contacts
      .filter((channel) => ["phone", "email", "whatsapp"].includes(channel.type))
      .map((channel) => ({
        "@type": "ContactPoint",
        contactType: localized(channel.label, locale, channel.type),
        telephone: channel.type === "phone" || channel.type === "whatsapp" ? channel.value : undefined,
        email: channel.type === "email" ? channel.value : undefined,
        url: channel.href?.startsWith("http") ? channel.href : undefined
      }))
  };
}

export function buildWebsiteJsonLd(state: AdminState, locale: LocaleCode) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: state.siteSettings.title,
    url: absoluteUrl(state, localePath(locale)),
    inLanguage: locale,
    description: state.siteSettings.tagline
  };
}

export function buildBreadcrumbJsonLd(state: AdminState, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(state, item.path)
    }))
  };
}

export function buildProductJsonLd(state: AdminState, product: ProductCategory, locale: LocaleCode) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localized(product.name, locale),
    description: localized(product.summary, locale),
    image: product.imageUrl ? absoluteUrl(state, product.imageUrl) : undefined,
    brand: {
      "@type": "Brand",
      name: state.siteSettings.title
    },
    category: product.slug,
    additionalProperty: product.specs.map((spec) => ({
      "@type": "PropertyValue",
      name: "Specification",
      value: spec
    }))
  };
}

export function buildArticleJsonLd(state: AdminState, article: Article, locale: LocaleCode, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: localized(article.title, locale),
    description: localized(article.excerpt, locale),
    image: article.coverImageUrl ? absoluteUrl(state, article.coverImageUrl) : undefined,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: locale,
    mainEntityOfPage: absoluteUrl(state, path),
    author: {
      "@type": "Organization",
      name: state.siteSettings.title
    },
    publisher: {
      "@type": "Organization",
      name: state.siteSettings.title
    }
  };
}
