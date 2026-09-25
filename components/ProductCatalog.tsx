import { ProductCatalogGrid } from "@/components/ProductCatalogGrid";
import { catalogCards, homeProducts, publishedProducts } from "@/lib/product-catalog";
import type { AdminState, LocaleCode } from "@/types/site";

export function ProductCatalog({ state, locale, mode = "all", category }: {
  state: AdminState; locale: LocaleCode; mode?: "home" | "all" | "category"; category?: string;
}) {
  const all = mode === "home" ? homeProducts(state.articles, state.products) : publishedProducts(state.articles, state.products);
  const articles = mode === "category" ? all.filter(article => article.category === category) : all;
  const zh = locale === "zh";
  if (mode === "home" && !articles.length) return null;
  return <section className="section product-catalog" aria-label={zh ? "产品目录" : "Product catalog"}>
    <div className="catalog-heading"><div><span className="eyebrow">{zh ? "产品目录" : "Product catalog"}</span><h2>{mode === "home" ? (zh ? "探索我们的产品" : "Explore our products") : mode === "category" ? (zh ? "此分类产品" : "Products in this category") : (zh ? "全部产品" : "All products")}</h2></div>
      {mode === "home" ? <a className="button secondary" href={`/${locale}/products`}>{zh ? "查看全部产品" : "View all products"} →</a> : null}
    </div>
    <ProductCatalogGrid cards={catalogCards(articles, state.products, locale)} locale={locale} filterable={mode === "all"} />
  </section>;
}
