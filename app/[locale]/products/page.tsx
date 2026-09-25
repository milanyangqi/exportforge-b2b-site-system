import { publicText, categoryLabel } from "@/lib/public-localization";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductCatalog } from "@/components/ProductCatalog";
import { PuckPageRenderer } from "@/components/PuckPageRenderer";
import { readAdminState } from "@/lib/server/admin-store";
import { buildBreadcrumbJsonLd, buildPageMetadata, jsonLd, localePath, productContentComplete } from "@/lib/seo";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

function productsTitle(siteTitle: string, locale: LocaleCode) {
  return locale === "zh" ? `产品目录 | ${siteTitle}` : `${siteTitle} products`;
}

function productsDescription(siteTitle: string, locale: LocaleCode) {
  return locale === "zh" ? `${siteTitle}：浏览产品分类，比较适用方案，提交数量、包装及目的地等询盘需求。` : `Browse current ${siteTitle} product categories, compare fit, and send RFQ details.`;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const alternates = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, localeCode) => {
    if (state.products.some((product) => productContentComplete(product, localeCode))) {
      paths[localeCode] = localePath(localeCode, "/products");
    }
    return paths;
  }, {});

  return buildPageMetadata(state, {
    locale,
    path: localePath(locale, "/products"),
    title: productsTitle(state.siteSettings.title, locale),
    description: productsDescription(state.siteSettings.title, locale),
    kind: "products",
    image: state.products.find((product) => product.imageUrl)?.imageUrl,
    contentComplete: state.products.some((product) => productContentComplete(product, locale)),
    alternates
  });
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const pageTitle = productsTitle(state.siteSettings.title, locale);
  const pageDescription = productsDescription(state.siteSettings.title, locale);
  const structuredData = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd(buildBreadcrumbJsonLd(state, [
          { name: state.siteSettings.title, path: localePath(locale) },
          { name: publicText("Products", locale), path: localePath(locale, "/products") }
        ]))
      }}
    />
  );
  const fallback = (
    <main className="subpage products-subpage">
      {structuredData}
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">{state.siteSettings.title} {publicText("Products", locale)}</span>
          <h1>{pageTitle}</h1>
          <p>{pageDescription}</p>
        </div>
        <ProductGrid locale={locale} products={state.products} />
      </section>
      <ProductCatalog state={state} locale={locale} />
    </main>
  );

  return (
    <PuckPageRenderer
      className="subpage products-subpage puck-public-page"
      fallback={fallback}
      layoutKey="products-index"
      locale={locale}
      prefix={structuredData}
      state={state}
    />
  );
}
