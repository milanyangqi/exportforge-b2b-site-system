/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/ArticleContent";
import { RfqForm } from "@/components/RfqForm";
import { t } from "@/lib/i18n";
import { readAdminState } from "@/lib/server/admin-store";
import { articleContentComplete, buildArticleJsonLd, buildBreadcrumbJsonLd, buildPageMetadata, compactDescription, jsonLd, localePath } from "@/lib/seo";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: LocaleCode; slug: string }>;
}) {
  const { locale, slug } = await params;
  const state = await readAdminState();
  const article = state.articles.find((item) => item.slug === slug && item.status === "published");

  if (!article) return {};

  const alternates = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, localeCode) => {
    if (articleContentComplete(article, localeCode)) paths[localeCode] = localePath(localeCode, `/articles/${article.slug}`);
    return paths;
  }, {});

  return buildPageMetadata(state, {
    locale,
    path: localePath(locale, `/articles/${article.slug}`),
    title: t(article.title, locale),
    description: compactDescription(t(article.excerpt, locale), state.siteSettings.tagline),
    kind: "article",
    image: article.coverImageUrl,
    publishedTime: article.publishedAt,
    contentComplete: articleContentComplete(article, locale),
    alternates,
    seo: article.seo
  });
}

export default async function ArticleDetailPage({
  params
}: {
  params: Promise<{ locale: LocaleCode; slug: string }>;
}) {
  const { locale, slug } = await params;
  const state = await readAdminState();
  const article = state.articles.find((item) => item.slug === slug && item.status === "published");

  if (!article) {
    notFound();
  }

  return (
    <main className="subpage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(buildArticleJsonLd(state, article, locale, localePath(locale, `/articles/${article.slug}`))) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildBreadcrumbJsonLd(state, [
            { name: state.siteSettings.title, path: localePath(locale) },
            { name: "Articles", path: localePath(locale, "/articles") },
            { name: t(article.title, locale), path: localePath(locale, `/articles/${article.slug}`) }
          ]))
        }}
      />
      <article className="content-detail">
        <span className="eyebrow">{article.category}</span>
        <h1>{t(article.title, locale)}</h1>
        <p className="detail-excerpt">{t(article.excerpt, locale)}</p>
        {article.coverImageUrl ? (
          <figure className="article-cover">
            <img src={article.coverImageUrl} alt={t(article.title, locale)} />
          </figure>
        ) : null}
        <ArticleContent body={article.body ? t(article.body, locale) : t(article.excerpt, locale)} />
      </article>
      <section className="section rfq-section" id="rfq">
        <div>
          <span className="eyebrow">Need a quote?</span>
          <h2>Turn this tooling note into a clear RFQ.</h2>
          <p>Share diameter, coating, workpiece material, quantity, packaging, and destination so KeyproTools can respond with a practical quotation.</p>
        </div>
        <RfqForm locale={locale} />
      </section>
    </main>
  );
}
