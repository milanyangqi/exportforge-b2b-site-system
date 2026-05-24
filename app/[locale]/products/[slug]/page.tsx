/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { RfqForm } from "@/components/RfqForm";
import { t } from "@/lib/i18n";
import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export default async function ProductCategoryPage({
  params
}: {
  params: Promise<{ locale: LocaleCode; slug: string }>;
}) {
  const { locale, slug } = await params;
  const state = await readAdminState();
  const product = state.products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="subpage">
      <section className="product-detail">
        <div>
          <span className="eyebrow">Product category</span>
          <h1>{t(product.name, locale)}</h1>
          <p>{t(product.summary, locale)}</p>
          <div className="chips">
            {product.specs.map((spec) => (
              <span key={spec}>{spec}</span>
            ))}
          </div>
        </div>
        {product.imageUrl ? (
          <figure className="product-detail-media">
            <img src={product.imageUrl} alt={t(product.name, locale)} />
          </figure>
        ) : null}
        <div className="workflow-panel">
          <h3>Applications</h3>
          <ul className="detail-list">
            {t(product.applications, locale).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section rfq-section" id="rfq">
        <div>
          <span className="eyebrow">Request category quote</span>
          <h2>Send diameter, quantity, coating, material, packaging, and destination.</h2>
          <p>KeyproTools will match geometry, stock range, OEM marking, and export packing for your buying program.</p>
        </div>
        <RfqForm locale={locale} />
      </section>
    </main>
  );
}
