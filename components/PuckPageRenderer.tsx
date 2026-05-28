import type { ReactNode } from "react";
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
  className
}: PuckPageRendererProps) {
  const layout = findPageLayout(state, layoutKey);

  if (!layout) return <>{fallback}</>;

  return (
    <>
      {prefix}
      <main className={className ?? (layoutKey === "home" ? "puck-public-page" : "subpage puck-public-page")}>
        {layout.data.content.map((item, index) => (
          <PuckVisualBlock
            currentArticle={currentArticle}
            currentPage={currentPage}
            currentProduct={currentProduct}
            item={item}
            key={String(item.props.id ?? `${item.type}-${index}`)}
            locale={locale}
            state={state}
          />
        ))}
      </main>
    </>
  );
}
