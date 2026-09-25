import { publicText, categoryLabel } from "@/lib/public-localization";
/* eslint-disable @next/next/no-img-element */
import { PuckPageRenderer } from "@/components/PuckPageRenderer";
import { t } from "@/lib/i18n";
import { readAdminState } from "@/lib/server/admin-store";
import { articleContentComplete, buildBreadcrumbJsonLd, buildPageMetadata, jsonLd, localePath } from "@/lib/seo";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

function articlesTitle(siteTitle: string, locale: LocaleCode) {
  return locale === "zh" ? `文章与包装知识 | ${siteTitle}` : `${siteTitle} articles`;
}

function articlesDescription(siteTitle: string, locale: LocaleCode) {
  return locale === "zh" ? `${siteTitle}：查看包装采购指南、产品应用说明与最新文章。` : `Read current ${siteTitle} articles, buying guides, and application notes.`;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const publishedArticles = state.articles.filter((article) => article.status === "published");
  const alternates = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, localeCode) => {
    if (publishedArticles.some((article) => articleContentComplete(article, localeCode))) {
      paths[localeCode] = localePath(localeCode, "/articles");
    }
    return paths;
  }, {});

  return buildPageMetadata(state, {
    locale,
    path: localePath(locale, "/articles"),
    title: articlesTitle(state.siteSettings.title, locale),
    description: articlesDescription(state.siteSettings.title, locale),
    kind: "articles",
    image: publishedArticles.find((article) => article.coverImageUrl)?.coverImageUrl,
    contentComplete: publishedArticles.some((article) => articleContentComplete(article, locale)),
    alternates
  });
}

export default async function ArticlesPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const publishedArticles = state.articles.filter((article) => article.status === "published");
  const pageTitle = articlesTitle(state.siteSettings.title, locale);
  const structuredData = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd(buildBreadcrumbJsonLd(state, [
          { name: state.siteSettings.title, path: localePath(locale) },
          { name: publicText("Articles", locale), path: localePath(locale, "/articles") }
        ]))
      }}
    />
  );
  const fallback = (
    <main className="subpage articles-subpage">
      {structuredData}
      <section className="section">
        <div className="section-head subpage-head">
          <span className="eyebrow">{publicText("Articles", locale)}</span>
          <h1>{pageTitle}</h1>
        </div>
        <div className="article-grid">
          {publishedArticles.map((article) => (
            <a className="article-card" href={`/${locale}/articles/${article.slug}`} key={article.slug}>
              {article.coverImageUrl ? (
                <span className="article-card-media">
                  <img src={article.coverImageUrl} alt={t(article.title, locale)} loading="lazy" />
                </span>
              ) : null}
              <span>{categoryLabel(article.category, state.products, locale)}</span>
              <h3>{t(article.title, locale)}</h3>
              <p>{t(article.excerpt, locale)}</p>
            </a>
          ))}
          {publishedArticles.length === 0 ? <p>暂无已发布文章。</p> : null}
        </div>
      </section>
    </main>
  );

  return (
    <PuckPageRenderer
      className="subpage articles-subpage puck-public-page"
      fallback={fallback}
      layoutKey="articles-index"
      locale={locale}
      prefix={structuredData}
      state={state}
    />
  );
}
