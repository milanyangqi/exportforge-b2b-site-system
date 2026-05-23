import { t } from "@/lib/i18n";
import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export default async function ArticlesPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const publishedArticles = state.articles.filter((article) => article.status === "published");

  return (
    <main className="subpage">
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">SEO Library</span>
          <h1>Buying guides, application notes, and localization content.</h1>
        </div>
        <div className="article-grid">
          {publishedArticles.map((article) => (
            <a className="article-card" href={`/${locale}/articles/${article.slug}`} key={article.slug}>
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
}
