/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { PuckPageRenderer } from "@/components/PuckPageRenderer";
import { ProductGrid } from "@/components/ProductGrid";
import { RfqForm } from "@/components/RfqForm";
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
            { name: "Products", path: localePath(locale, "/products") },
            { name: t(product.name, locale), path: localePath(locale, `/products/${product.slug}`) }
          ]))
        }}
      />
    </>
  );
  const related = state.products.filter((item) => item.kind === "product" && item.status === "published" && item.categorySlugs?.includes(product.slug));
  const fallback = (
    <main className="subpage river-detail">
      {structuredData}
      <section className="product-detail">
        <div>
          <span className="eyebrow">{locale === "zh" ? "手工织物" : "HANDCRAFTED TEXTILES"}</span>
          <h1>{t(product.name, locale)}</h1>
          <p>{t(product.summary, locale)}</p>
        </div>
        {product.imageUrl ? (
          <figure className="product-detail-media">
            <img src={product.imageUrl} alt={t(product.name, locale)} />
          </figure>
        ) : null}
      </section>
      {related.length > 0 ? <section className="section river-related"><div className="section-head"><span className="eyebrow">{locale === "zh" ? "探索作品" : "EXPLORE THE PIECES"}</span><h2>{locale === "zh" ? "系列中的更多细节" : "More from this collection"}</h2></div><ProductGrid flat locale={locale} products={related} /></section> : null}
      <section className="section rfq-section" id="rfq">
        <div>
          <span className="eyebrow">{locale === "zh" ? "联系我们" : "GET IN TOUCH"}</span>
          <h2>{locale === "zh" ? "告诉我们您感兴趣的作品。" : "Tell us what you have in mind."}</h2>
          <p>{locale === "zh" ? "可说明希望了解的款式、材质、数量和目的地。" : "Share the piece, materials, quantity and destination you would like to discuss."}</p>
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
