/* eslint-disable @next/next/no-img-element */
import { t } from "@/lib/i18n";
import type { LocaleCode, ProductCategory } from "@/types/site";

export function PackagingCategories({ products, locale }: { products: ProductCategory[]; locale: LocaleCode }) {
  return <div className="packaging-categories">
    {products.map(product => <a href={`/${locale}/products/${product.slug}`} className="packaging-category" key={product.slug}>
      {product.imageUrl ? <img src={product.imageUrl} alt="" width="400" height="400" loading="lazy" /> : null}
      <div><h3>{t(product.name, locale)}</h3><span>{locale === "zh" ? "查看系列" : "Explore collection"} <span aria-hidden="true">↗</span></span></div>
    </a>)}
  </div>;
}
