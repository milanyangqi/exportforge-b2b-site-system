import { Fragment, type ReactNode } from "react";
import { ProductCatalog } from "@/components/ProductCatalog";
import { PuckVisualBlock } from "@/components/PuckVisualBlocks";
import { findPageLayout } from "@/lib/puck-layouts";
import type { AdminState, Article, LocaleCode, PageLayoutKey, ProductCategory, SitePage } from "@/types/site";

type PuckPageRendererProps = {
  state: AdminState;
  locale: LocaleCode;
  layoutKey: PageLayoutKey;
  fallback: ReactNode;
  prefix?: ReactNode;
  currentProduct?: ProductCategory;
  currentArticle?: Article;
  currentPage?: SitePage;
  className?: string;
  catalogPage?: number;
  catalogCategory?: string;
};

export function PuckPageRenderer({
  state,
  locale,
  layoutKey,
  fallback,
  prefix,
  currentProduct,
  currentArticle,
  currentPage,
  className,
  catalogPage,
  catalogCategory
}: PuckPageRendererProps) {
  const layout = findPageLayout(state, layoutKey);

  if (!layout) return <>{fallback}</>;

  // Insert from live CMS data, without rewriting stored layouts or translations.
  const anchorType = layoutKey === "product-detail" ? "ProductDetail" : "ProductList";
  const anchorIndex = layout.data.content.findIndex(item => item.type === anchorType);
  const catalogMode = layoutKey === "home" ? "home" : layoutKey === "products-index" ? "all" : layoutKey === "product-detail" ? "category" : null;
  const catalog = catalogMode ? <ProductCatalog state={state} locale={locale} mode={catalogMode} category={currentProduct?.slug} page={catalogPage} selectedCategory={catalogCategory} /> : null;

  return (
    <>
      {prefix}
      <main className={className ?? (layoutKey === "home" ? "puck-public-page" : "subpage puck-public-page")}>
        {layout.data.content.map((item, index) => (
          <Fragment key={String(item.props.id ?? `${item.type}-${index}`)}>
          {!(layoutKey === "products-index" && item.type === "ProductList" && ((catalogPage ?? 1) > 1 || catalogCategory)) ? <PuckVisualBlock
            currentArticle={currentArticle}
            currentPage={currentPage}
            currentProduct={currentProduct}
            item={item}
            key={String(item.props.id ?? `${item.type}-${index}`)}
            locale={locale}
            state={state}
          /> : null}
          {index === anchorIndex ? catalog : null}
          </Fragment>
        ))}
        {anchorIndex === -1 ? catalog : null}
      </main>
    </>
  );
}
