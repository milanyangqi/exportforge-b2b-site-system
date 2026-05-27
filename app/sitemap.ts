import type { MetadataRoute } from "next";
import { readAdminState } from "@/lib/server/admin-store";
import {
  absoluteUrl,
  articleContentComplete,
  buildLanguageAlternates,
  homeContentComplete,
  localePath,
  pageContentComplete,
  productContentComplete
} from "@/lib/seo";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

type SitemapRoute = {
  path: string;
  alternates: Partial<Record<LocaleCode, string>>;
  lastModified?: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const state = await readAdminState();
  const publishedArticles = state.articles.filter((article) => article.status === "published");
  const publishedPages = state.pages.filter((page) => page.status === "published");
  const routes: SitemapRoute[] = [];

  function addLocalizedRoutes(
    pathsByLocale: Partial<Record<LocaleCode, string>>,
    priority: number,
    changeFrequency: SitemapRoute["changeFrequency"],
    lastModified?: string
  ) {
    state.enabledLocales.forEach((locale) => {
      const path = pathsByLocale[locale];
      if (!path) return;
      routes.push({
        path,
        alternates: pathsByLocale,
        lastModified,
        priority,
        changeFrequency
      });
    });
  }

  const homePaths = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, locale) => {
    if (homeContentComplete(state, locale)) paths[locale] = localePath(locale);
    return paths;
  }, {});
  addLocalizedRoutes(homePaths, 1, "weekly", state.updatedAt);

  const productsPaths = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, locale) => {
    const hasAnyProduct = state.products.some((product) => productContentComplete(product, locale));
    if (hasAnyProduct) paths[locale] = localePath(locale, "/products");
    return paths;
  }, {});
  addLocalizedRoutes(productsPaths, 0.85, "weekly", state.updatedAt);

  state.products.forEach((product) => {
    const pathsByLocale = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, locale) => {
      if (product.seo?.indexable !== false && productContentComplete(product, locale)) {
        paths[locale] = localePath(locale, `/products/${product.slug}`);
      }
      return paths;
    }, {});
    addLocalizedRoutes(pathsByLocale, 0.8, "weekly", state.updatedAt);
  });

  const articlesPaths = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, locale) => {
    const hasAnyArticle = publishedArticles.some((article) => articleContentComplete(article, locale));
    if (hasAnyArticle) paths[locale] = localePath(locale, "/articles");
    return paths;
  }, {});
  addLocalizedRoutes(articlesPaths, 0.75, "weekly", state.updatedAt);

  publishedArticles.forEach((article) => {
    const pathsByLocale = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, locale) => {
      if (article.seo?.indexable !== false && articleContentComplete(article, locale)) {
        paths[locale] = localePath(locale, `/articles/${article.slug}`);
      }
      return paths;
    }, {});
    addLocalizedRoutes(pathsByLocale, 0.72, "monthly", article.publishedAt ?? state.updatedAt);
  });

  const filesPaths = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, locale) => {
    if (locale === "en" || locale === "zh") paths[locale] = localePath(locale, "/files");
    return paths;
  }, {});
  addLocalizedRoutes(filesPaths, 0.45, "monthly", state.updatedAt);

  const contactPaths = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, locale) => {
    if (locale === "en" || locale === "zh") paths[locale] = localePath(locale, "/contact");
    return paths;
  }, {});
  addLocalizedRoutes(contactPaths, 0.6, "monthly", state.updatedAt);

  publishedPages.forEach((page) => {
    const pathsByLocale = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, locale) => {
      if (page.seo?.indexable !== false && pageContentComplete(page, locale)) {
        paths[locale] = localePath(locale, `/pages/${page.slug}`);
      }
      return paths;
    }, {});
    addLocalizedRoutes(pathsByLocale, 0.65, "monthly", page.publishedAt ?? state.updatedAt);
  });

  return routes.map((route) => ({
    url: absoluteUrl(state, route.path),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: buildLanguageAlternates(state, route.alternates)
    }
  }));
}
