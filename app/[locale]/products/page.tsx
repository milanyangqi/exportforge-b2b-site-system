import { ProductGrid } from "@/components/ProductGrid";
import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

function productsTitle(siteTitle: string) {
  return `${siteTitle} products`;
}

function productsDescription(siteTitle: string) {
  return `Browse current ${siteTitle} product categories, compare fit, and send RFQ details.`;
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const pageTitle = productsTitle(state.siteSettings.title);
  const pageDescription = productsDescription(state.siteSettings.title);

  return (
    <main className="subpage products-subpage">
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">{state.siteSettings.title} products</span>
          <h1>{pageTitle}</h1>
          <p>{pageDescription}</p>
        </div>
        <ProductGrid locale={locale} products={state.products} />
      </section>
    </main>
  );
}
