import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { t } from "@/lib/i18n";
import type { LocaleCode, ProductCategory } from "@/types/site";

export function ProductGrid({ locale, products }: { locale: LocaleCode; products: ProductCategory[] }) {
  const items = products ?? [];

  return (
    <div className="product-grid">
      {items.map((product) => (
        <article className="product-card" key={product.slug}>
          <div className="product-card-head">
            <span className="product-icon">
              <CheckCircle2 size={21} />
            </span>
            <a href={`/${locale}/products/${product.slug}`} aria-label={t(product.name, locale)}>
              <ArrowUpRight size={20} />
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
      ))}
    </div>
  );
}
