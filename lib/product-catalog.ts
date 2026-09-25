import type { Article, LocaleCode, ProductCategory } from "@/types/site";

export type CatalogCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
  imageUrl: string;
};

const homeCategoryOrder = ["food-tin-packaging", "gift-tin-packaging", "tea-coffee-tins", "custom-tin-box-manufacturing"];

export function publishedProducts(articles: Article[], categories: ProductCategory[]) {
  const categoryKeys = new Map(categories.flatMap(category => [
    [category.slug, category.slug],
    ...(category.id ? [[category.id, category.slug]] : [])
  ] as [string, string][]));
  const seen = new Set<string>();
  return articles
    .filter(article => article.status === "published" && !article.deletedAt && categoryKeys.has(article.category))
    .sort((a, b) => {
      const date = (value?: string) => Number.isFinite(Date.parse(value ?? "")) ? Date.parse(value!) : 0;
      return date(b.publishedAt) - date(a.publishedAt) || a.slug.localeCompare(b.slug);
    })
    .filter(article => {
      const key = article.id || article.slug;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(article => ({ ...article, category: categoryKeys.get(article.category)! }));
}

export function homeProducts(articles: Article[], categories: ProductCategory[]) {
  const products = publishedProducts(articles, categories);
  const selected: Article[] = [];
  const seen = new Set<string>();
  const add = (article: Article) => {
    const key = article.id || article.slug;
    if (selected.length < 12 && !seen.has(key)) {
      selected.push(article);
      seen.add(key);
    }
  };
  for (const category of homeCategoryOrder) products.filter(article => article.category === category).slice(0, 3).forEach(add);
  products.forEach(add);
  return selected;
}

export function catalogImage(article: Article, locale: LocaleCode) {
  const safe = (url: string) => /^(https?:\/\/|\/(?!\/))/i.test(url.trim()) ? url.trim() : "";
  if (article.coverImageUrl && safe(article.coverImageUrl)) return safe(article.coverImageUrl);
  const body = article.body?.[locale] || article.body?.en || "";
  const match = body.match(/!\[[^\]]*\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+["'][^)]*)?\)/);
  return match ? safe(match[1].replace(/^<|>$/g, "")) : "";
}

export function catalogCards(articles: Article[], categories: ProductCategory[], locale: LocaleCode): CatalogCard[] {
  return articles.map(article => {
    const category = categories.find(item => item.slug === article.category);
    return {
      id: article.id || article.slug,
      slug: article.slug,
      title: article.title[locale] || article.title.en,
      excerpt: article.excerpt[locale] || article.excerpt.en,
      category: article.category,
      categoryLabel: category ? category.name[locale] || category.name.en : article.category,
      imageUrl: catalogImage(article, locale)
    };
  });
}
