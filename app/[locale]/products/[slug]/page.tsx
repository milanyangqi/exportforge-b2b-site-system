import {isCollection,isPublishedProduct} from "@/lib/catalog";
import { LoftyProducts, LoftyProduct } from "@/components/LoftyPages";
/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { PuckPageRenderer } from "@/components/PuckPageRenderer";
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
  const product = state.products.find((item) => item.slug === slug && isPublishedProduct(item));

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
  const product = state.products.find((item) => item.slug === slug && isPublishedProduct(item));

  if (!product) {
    notFound();
  }
  if (isCollection(product)) return <LoftyProducts state={state} locale={locale} initialCategory={product.slug}/>;
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
  const fallback = (<>{structuredData}<LoftyProduct product={product} locale={locale}/></>);

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
