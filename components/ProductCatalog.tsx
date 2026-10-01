import Link from "next/link";
import { CatalogPagination } from "@/components/CatalogPagination";
import { ProductCatalogGrid } from "@/components/ProductCatalogGrid";
import { catalogPageSize } from "@/lib/catalog-pagination";
import { catalogCards, homeProducts, publishedProducts } from "@/lib/product-catalog";
import type { AdminState, LocaleCode } from "@/types/site";

export function ProductCatalog({ state, locale, mode = "all", category, page = 1, selectedCategory = "" }: {
  state: AdminState; locale: LocaleCode; mode?: "home" | "all" | "category"; category?: string; page?: number; selectedCategory?: string;
}) {
  const all = mode === "home" ? homeProducts(state.articles, state.products) : publishedProducts(state.articles, state.products);
  const filtered = mode === "category" ? all.filter(article => article.category === category)
    : mode === "all" && selectedCategory ? all.filter(article => article.category === selectedCategory) : all;
  const articles = mode === "all" ? filtered.slice((page - 1) * catalogPageSize, page * catalogPageSize) : filtered;
  const zh = locale === "zh";
  const activeCategory = state.products.find(product => product.slug === selectedCategory);
  if (mode === "home" && !articles.length) return null;
  return <section className="section product-catalog" aria-label={zh ? "产品目录" : "Product catalog"}>
    <div className="catalog-heading"><div><span className="eyebrow">{zh ? "产品目录" : "Product catalog"}</span><h2>{mode === "home" ? (zh ? "探索我们的产品" : "Explore our products") : mode === "category" ? (zh ? "此分类产品" : "Products in this category") : activeCategory ? activeCategory.name[locale] || activeCategory.name.en : (zh ? "全部产品" : "All products")}</h2></div>
      {mode === "home" ? <a className="button secondary" href={`/${locale}/products`}>{zh ? "查看全部产品" : "View all products"} →</a> : null}
    </div>
    {mode === "all" ? <div className="catalog-filters" role="group" aria-label={zh ? "产品分类筛选" : "Filter products by category"}>
      <Link aria-current={!selectedCategory ? "page" : undefined} href={`/${locale}/products`}>{zh ? "全部产品" : "All products"} ({all.length})</Link>
      {state.products.map(product => {
        const count = all.filter(article => article.category === product.slug).length;
        return count ? <Link aria-current={selectedCategory === product.slug ? "page" : undefined} href={`/${locale}/products?category=${encodeURIComponent(product.slug)}`} key={product.slug}>{product.name[locale] || product.name.en} ({count})</Link> : null;
      })}
    </div> : null}
    <ProductCatalogGrid cards={catalogCards(articles, state.products, locale)} locale={locale} totalCount={mode === "all" ? filtered.length : undefined} />
    {mode === "all" ? <CatalogPagination base="products" category={selectedCategory} locale={locale} page={page} total={filtered.length} /> : null}
  </section>;
}
