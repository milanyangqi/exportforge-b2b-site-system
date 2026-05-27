import { ProductGrid } from "@/components/ProductGrid";
import { readAdminState } from "@/lib/server/admin-store";
import { buildBreadcrumbJsonLd, buildPageMetadata, jsonLd, localePath, productContentComplete } from "@/lib/seo";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

const productsTitle = "Carbide end mills, drill bits, and OEM tooling for metalworking buyers.";
const productsDescription = "Browse KeyproTools cutting tool categories, compare application fit, and send RFQ details for distributor pricing, coating, marking, and export packing.";

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
    title: productsTitle,
    description: productsDescription,
    kind: "products",
    image: state.products.find((product) => product.imageUrl)?.imageUrl,
    contentComplete: state.products.some((product) => productContentComplete(product, locale)),
    alternates
  });
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();

  return (
    <main className="subpage products-subpage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildBreadcrumbJsonLd(state, [
            { name: state.siteSettings.title, path: localePath(locale) },
            { name: "Products", path: localePath(locale, "/products") }
          ]))
        }}
      />
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">KeyproTools products</span>
          <h1>Carbide end mills, drill bits, and OEM tooling for metalworking buyers.</h1>
          <p>Browse the main tooling families, compare application fit, and send RFQ details for distributor pricing, coating, marking, and export packing.</p>
        </div>
        <ProductGrid locale={locale} products={state.products} />
      </section>
    </main>
  );
}
