import { ProductGrid } from "@/components/ProductGrid";
import { PuckPageRenderer } from "@/components/PuckPageRenderer";
import { readAdminState } from "@/lib/server/admin-store";
import { buildBreadcrumbJsonLd, buildPageMetadata, jsonLd, localePath, productContentComplete } from "@/lib/seo";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

function productsTitle(siteTitle: string) {
  return `${siteTitle} collections`;
}

function productsDescription(siteTitle: string) {
  return `Explore ${siteTitle} crochet, knit and woven home textiles.`;
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
    title: productsTitle(state.siteSettings.title),
    description: productsDescription(state.siteSettings.title),
    kind: "products",
    image: state.products.find((product) => product.imageUrl)?.imageUrl,
    contentComplete: state.products.some((product) => productContentComplete(product, locale)),
    alternates
  });
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const pageTitle = productsTitle(state.siteSettings.title);
  const pageDescription = productsDescription(state.siteSettings.title);
  const structuredData = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd(buildBreadcrumbJsonLd(state, [
          { name: state.siteSettings.title, path: localePath(locale) },
          { name: "Products", path: localePath(locale, "/products") }
        ]))
      }}
    />
  );
  const fallback = (
    <main className="subpage products-subpage">
      {structuredData}
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">{locale === "zh" ? "作品系列" : "THE COLLECTIONS"}</span>
          <h1>{pageTitle}</h1>
          <p>{pageDescription}</p>
        </div>
        <ProductGrid flat locale={locale} products={state.products.filter((item) => item.kind === "collection" && item.status === "published")} />
      </section>
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
