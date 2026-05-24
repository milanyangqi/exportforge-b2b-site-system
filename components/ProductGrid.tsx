/* eslint-disable @next/next/no-img-element */
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { t } from "@/lib/i18n";
import type { LocaleCode, ProductCategory } from "@/types/site";

type ProductTreeNode = ProductCategory & {
  children: ProductTreeNode[];
};

function getProductId(product: ProductCategory) {
  return product.id ?? product.slug;
}

function buildProductTree(products: ProductCategory[]) {
  const nodes = new Map<string, ProductTreeNode>();
  const roots: ProductTreeNode[] = [];

  products.forEach((product) => {
    nodes.set(getProductId(product), { ...product, children: [] });
  });

  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
      return;
    }

    roots.push(node);
  });

  return roots;
}

function ProductCard({ locale, product, compact = false }: { locale: LocaleCode; product: ProductCategory; compact?: boolean }) {
  return (
    <article className={compact ? "product-card compact" : "product-card"}>
      {product.imageUrl ? (
        <a className="product-card-media" href={`/${locale}/products/${product.slug}`} aria-label={t(product.name, locale)}>
          <img src={product.imageUrl} alt={t(product.name, locale)} loading="lazy" />
        </a>
      ) : null}
      <div className="product-card-head">
        <span className="product-icon">
          <CheckCircle2 size={compact ? 17 : 21} />
        </span>
        <a href={`/${locale}/products/${product.slug}`} aria-label={t(product.name, locale)}>
          <ArrowUpRight size={compact ? 18 : 20} />
        </a>
      </div>
      <h3>{t(product.name, locale)}</h3>
      <p>{t(product.summary, locale)}</p>
      <div className="chips">
        {product.specs.map((spec) => (
          <span key={spec}>{spec}</span>
        ))}
      </div>
    </article>
  );
}

function ProductTreeBranch({ locale, product, depth = 0 }: { locale: LocaleCode; product: ProductTreeNode; depth?: number }) {
  return (
    <div className="product-tree-item">
      <ProductCard compact={depth > 0} locale={locale} product={product} />
      {product.children.length > 0 ? (
        <div className="product-subcategory-list">
          {product.children.map((child) => (
            <ProductTreeBranch depth={depth + 1} key={child.slug} locale={locale} product={child} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ProductGrid({ flat = false, locale, products }: { flat?: boolean; locale: LocaleCode; products: ProductCategory[] }) {
  const items = buildProductTree(products ?? []);

  if (flat) {
    return (
      <div className="product-tree-grid product-tree-grid-flat">
        {(products ?? []).map((product) => (
          <ProductCard key={product.slug} locale={locale} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="product-tree-grid">
      {items.map((product) => (
        <ProductTreeBranch key={product.slug} locale={locale} product={product} />
      ))}
    </div>
  );
}
