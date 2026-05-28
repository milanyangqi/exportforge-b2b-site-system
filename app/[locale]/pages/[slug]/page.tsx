import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/ArticleContent";
import { PuckPageRenderer } from "@/components/PuckPageRenderer";
import { t } from "@/lib/i18n";
import { readAdminState } from "@/lib/server/admin-store";
import { buildBreadcrumbJsonLd, buildPageMetadata, compactDescription, jsonLd, localePath, pageContentComplete } from "@/lib/seo";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: LocaleCode; slug: string }>;
}) {
  const { locale, slug } = await params;
  const state = await readAdminState();
  const page = state.pages.find((item) => item.slug === slug && item.status === "published");

  if (!page) return {};

  const alternates = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, localeCode) => {
    if (pageContentComplete(page, localeCode)) paths[localeCode] = localePath(localeCode, `/pages/${page.slug}`);
    return paths;
  }, {});

  return buildPageMetadata(state, {
    locale,
    path: localePath(locale, `/pages/${page.slug}`),
    title: t(page.title, locale),
    description: compactDescription(t(page.excerpt, locale), state.siteSettings.tagline),
    kind: "page",
    contentComplete: pageContentComplete(page, locale),
    alternates,
    seo: page.seo
  });
}

export default async function SitePageDetail({
  params
}: {
  params: Promise<{ locale: LocaleCode; slug: string }>;
}) {
  const { locale, slug } = await params;
  const state = await readAdminState();
  const page = state.pages.find((item) => item.slug === slug && item.status === "published");

  if (!page) {
    notFound();
  }
  const structuredData = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd(buildBreadcrumbJsonLd(state, [
          { name: state.siteSettings.title, path: localePath(locale) },
          { name: t(page.title, locale), path: localePath(locale, `/pages/${page.slug}`) }
        ]))
      }}
    />
  );
  const fallback = (
    <main className="subpage">
      {structuredData}
      <article className="content-detail">
        <span className="eyebrow">Page</span>
        <h1>{t(page.title, locale)}</h1>
        <p className="detail-excerpt">{t(page.excerpt, locale)}</p>
        <ArticleContent body={t(page.body, locale)} />
      </article>
    </main>
  );

  return (
    <PuckPageRenderer
      currentPage={page}
      fallback={fallback}
      layoutKey={`page:${page.slug}`}
      locale={locale}
      prefix={structuredData}
      state={state}
    />
  );
}
