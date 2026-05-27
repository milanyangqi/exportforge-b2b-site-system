/* eslint-disable @next/next/no-img-element */
import { PuckPageRenderer } from "@/components/PuckPageRenderer";
import { t } from "@/lib/i18n";
import { readAdminState } from "@/lib/server/admin-store";
import { articleContentComplete, buildBreadcrumbJsonLd, buildPageMetadata, jsonLd, localePath } from "@/lib/seo";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

const articlesTitle = "Buying guides and application notes for end mills, drill bits, and OEM tool orders.";
const articlesDescription = "Read KeyproTools buying guides for cutting tool geometry, coating choices, drill bit assortments, OEM packaging, and distributor RFQ preparation.";

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
    title: articlesTitle,
    description: articlesDescription,
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
  const structuredData = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd(buildBreadcrumbJsonLd(state, [
          { name: state.siteSettings.title, path: localePath(locale) },
          { name: "Articles", path: localePath(locale, "/articles") }
        ]))
      }}
    />
  );
  const fallback = (
    <main className="subpage articles-subpage">
      {structuredData}
      <section className="section">
        <div className="section-head subpage-head">
          <span className="eyebrow">Technical library</span>
          <h1>Buying guides and application notes for end mills, drill bits, and OEM tool orders.</h1>
        </div>
        <div className="article-grid">
          {publishedArticles.map((article) => (
            <a className="article-card" href={`/${locale}/articles/${article.slug}`} key={article.slug}>
              {article.coverImageUrl ? (
                <span className="article-card-media">
                  <img src={article.coverImageUrl} alt={t(article.title, locale)} loading="lazy" />
                </span>
              ) : null}
              <span>{article.category}</span>
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
