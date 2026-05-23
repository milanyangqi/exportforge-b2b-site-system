import { ProductGrid } from "@/components/ProductGrid";
import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();

  return (
    <main className="subpage">
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Products</span>
          <h1>Extensible category pages for export catalogs.</h1>
          <p>Start category-first, then add SKU tables, downloads, certifications, and industry-specific fields as each client needs them.</p>
        </div>
        <ProductGrid locale={locale} products={state.products} />
      </section>
    </main>
  );
}
