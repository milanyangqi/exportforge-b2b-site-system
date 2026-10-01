import { publicText } from "@/lib/public-localization";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductCatalog } from "@/components/ProductCatalog";
import { PuckPageRenderer } from "@/components/PuckPageRenderer";
import { parseCatalogPage } from "@/lib/catalog-pagination";
import { publishedProducts } from "@/lib/product-catalog";
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

type CatalogSearchParams = { page?: string | string[]; category?: string | string[] };

function catalogView(state: Awaited<ReturnType<typeof readAdminState>>, query: CatalogSearchParams) {
  const requestedCategory = Array.isArray(query.category) ? query.category[0] : query.category;
  const category = state.products.some(product => product.slug === requestedCategory) ? requestedCategory || "" : "";
  const products = publishedProducts(state.articles, state.products);
  const total = category ? products.filter(article => article.category === category).length : products.length;
  const page = parseCatalogPage(query.page, total);
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  return { category, page, path: `/products${params.size ? `?${params}` : ""}` };
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: LocaleCode }>; searchParams: Promise<CatalogSearchParams> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const view = catalogView(state, await searchParams);
  const alternates = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, localeCode) => {
    if (state.products.some((product) => productContentComplete(product, localeCode))) {
      paths[localeCode] = localePath(localeCode, view.path);
    }
    return paths;
  }, {});

  return buildPageMetadata(state, {
    locale,
    path: localePath(locale, view.path),
    title: `${productsTitle(state.siteSettings.title, locale)}${view.page > 1 ? ` · ${locale === "zh" ? "第" : "Page "}${view.page}${locale === "zh" ? "页" : ""}` : ""}`,
    description: productsDescription(state.siteSettings.title, locale),
    kind: "products",
    image: state.products.find((product) => product.imageUrl)?.imageUrl,
    contentComplete: state.products.some((product) => productContentComplete(product, locale)),
    alternates
  });
}

export default async function ProductsPage({ params, searchParams }: { params: Promise<{ locale: LocaleCode }>; searchParams: Promise<CatalogSearchParams> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const view = catalogView(state, await searchParams);
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
      {!view.category && view.page === 1 ? <section className="section">
        <div className="section-head">
          <span className="eyebrow">{state.siteSettings.title} {publicText("Products", locale)}</span>
          <h1>{pageTitle}</h1>
          <p>{pageDescription}</p>
        </div>
        <ProductGrid locale={locale} products={state.products} />
      </section> : null}
      <ProductCatalog state={state} locale={locale} page={view.page} selectedCategory={view.category} />
    </main>
  );

  return (
    <PuckPageRenderer
      className="subpage products-subpage puck-public-page"
      catalogPage={view.page}
      catalogCategory={view.category}
      fallback={fallback}
      layoutKey="products-index"
      locale={locale}
      prefix={structuredData}
      state={state}
    />
  );
}
