import { publicText, categoryLabel } from "@/lib/public-localization";
/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { PuckPageRenderer } from "@/components/PuckPageRenderer";
import { RfqForm } from "@/components/RfqForm";
import { ProductCatalog } from "@/components/ProductCatalog";
import { t } from "@/lib/i18n";
import { readAdminState } from "@/lib/server/admin-store";
import { buildBreadcrumbJsonLd, buildPageMetadata, buildProductJsonLd, compactDescription, jsonLd, localePath, productContentComplete } from "@/lib/seo";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: LocaleCode; slug: string }>;
}) {
  const { locale, slug } = await params;
  const state = await readAdminState();
  const product = state.products.find((item) => item.slug === slug);

  if (!product) return {};

  const alternates = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, localeCode) => {
    if (productContentComplete(product, localeCode)) paths[localeCode] = localePath(localeCode, `/products/${product.slug}`);
    return paths;
  }, {});

  return buildPageMetadata(state, {
    locale,
    path: localePath(locale, `/products/${product.slug}`),
    title: t(product.name, locale),
    description: compactDescription(t(product.summary, locale), state.siteSettings.tagline),
    kind: "product",
    image: product.imageUrl,
    contentComplete: productContentComplete(product, locale),
    alternates,
    seo: product.seo
  });
}

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
  const structuredData = (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(buildProductJsonLd(state, product, locale)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildBreadcrumbJsonLd(state, [
            { name: state.siteSettings.title, path: localePath(locale) },
            { name: publicText("Products", locale), path: localePath(locale, "/products") },
            { name: t(product.name, locale), path: localePath(locale, `/products/${product.slug}`) }
          ]))
        }}
      />
    </>
  );
  const fallback = (
    <main className="subpage">
      {structuredData}
      <section className="product-detail">
        <div>
          <span className="eyebrow">{publicText("Product category", locale)}</span>
          <h1>{t(product.name, locale)}</h1>
          <p>{t(product.summary, locale)}</p>
          <div className="chips">
            {product.specs.map((spec) => (
              <span key={spec}>{publicText(spec, locale)}</span>
            ))}
          </div>
        </div>
        {product.imageUrl ? (
          <figure className="product-detail-media">
            <img src={product.imageUrl} alt={t(product.name, locale)} />
          </figure>
        ) : null}
        <div className="workflow-panel">
          <h3>{publicText("Applications", locale)}</h3>
          <ul className="detail-list">
            {t(product.applications, locale).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
      <ProductCatalog state={state} locale={locale} mode="category" category={product.slug} />
      <section className="section rfq-section" id="rfq">
        <div>
          <span className="eyebrow">{publicText("Request category review", locale)}</span>
          <h2>{publicText("Send quantity, requirements, packaging, and destination.", locale)}</h2>
          <p>{locale === "zh" ? `${state.siteSettings.title} 将根据您的采购计划评审产品详情、定制要求、检验及出口包装。` : `${state.siteSettings.title} will review product details, customization, inspection, and export packing for your buying program.`}</p>
        </div>
        <RfqForm locale={locale} />
      </section>
    </main>
  );

  return (
    <PuckPageRenderer
      currentProduct={product}
      fallback={fallback}
      layoutKey="product-detail"
      locale={locale}
      prefix={structuredData}
      state={state}
    />
  );
}
