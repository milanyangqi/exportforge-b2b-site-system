import { ProductGrid } from "@/components/ProductGrid";
import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();

  return (
    <main className="subpage products-subpage">
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
