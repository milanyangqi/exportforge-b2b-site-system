import { IndustrialVisual } from "@/components/IndustrialVisual";
import { ProductGrid } from "@/components/ProductGrid";
import { RfqForm } from "@/components/RfqForm";
import { locales } from "@/config/locales";
import { themes } from "@/config/themes";
import { siteSettings } from "@/data/site";
import { t, ui } from "@/lib/i18n";
import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export default async function LocaleHome({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const activeTheme = themes[state.activeTheme] ?? themes.industrial;
  const homeArticles = state.articles.filter((article) => article.status === "published" && article.featuredOnHome);

  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">{t(ui.heroKicker, locale)}</span>
          <h1>{t(ui.heroTitle, locale)}</h1>
          <p>{t(ui.heroBody, locale)}</p>
          <div className="hero-actions">
            <a className="button primary" href="#rfq">{t(ui.quote, locale)}</a>
            <a className="button secondary" href={`/${locale}/admin`}>View Admin Foundation</a>
          </div>
          <div className="metrics">
            <div><strong>11</strong><span>Languages incl. SEA + Arabic</span></div>
            <div><strong>5</strong><span>Theme presets</span></div>
            <div><strong>RBAC</strong><span>User permissions</span></div>
          </div>
        </div>
        <IndustrialVisual />
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Product content system</span>
          <h2>Category-first product pages for SEO, trust, and RFQ conversion.</h2>
          <p>Fields are intentionally extensible for machinery, tools, consumer goods, materials, and customized export catalogs.</p>
        </div>
        <ProductGrid locale={locale} products={state.products} />
      </section>

      <section className="section dark-band">
        <div className="section-head">
          <span className="eyebrow">Customization layer</span>
          <h2>Themes and templates are separate from content, so each client can be customized without rewriting core logic.</h2>
        </div>
        <div className="theme-grid">
          {Object.values(themes).map((theme) => (
            <article key={theme.key} className={theme.key === activeTheme.key ? "theme-card active" : "theme-card"}>
              <span style={{ background: theme.colors.accent }} />
              <h3>{theme.name}</h3>
              <p>{theme.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split">
        <div>
          <span className="eyebrow">Multilingual market coverage</span>
          <h2>Built for Southeast Asia, Arabic RTL, and future global expansion.</h2>
          <p>
            URLs use language prefixes, content fields support localized values, and Arabic switches the page direction to RTL.
          </p>
          <div className="language-strip">
            {locales.map((item) => (
              <span key={item.code}>{item.nativeName}</span>
            ))}
          </div>
        </div>
        <div className="workflow-panel">
          <h3>AI draft workflow</h3>
          <ol>
            <li>Input industry, products, markets, keywords, and brand voice.</li>
            <li>Generate homepage, product, FAQ, SEO, article, or translation drafts.</li>
            <li>Human editor reviews and publishes through role-based approval.</li>
          </ol>
          <p>{siteSettings.aiDraftPolicy}</p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">SEO content</span>
          <h2>Article and solution content is ready for buying guides, applications, and localization pages.</h2>
        </div>
        <div className="article-grid">
          {homeArticles.map((article) => (
            <a key={article.slug} className="article-card" href={`/${locale}/articles/${article.slug}`}>
              <span>{article.category}</span>
              <h3>{t(article.title, locale)}</h3>
              <p>{t(article.excerpt, locale)}</p>
            </a>
          ))}
          {homeArticles.length === 0 ? <p>暂无已发布并同步首页的文章。</p> : null}
        </div>
      </section>

      <section className="section rfq-section" id="rfq">
        <div>
          <span className="eyebrow">RFQ lead capture</span>
          <h2>Capture quote requests with locale, source page, product intent, and sales follow-up status.</h2>
          <p>Email notification, CRM sync, and spam protection are isolated integration points for future development.</p>
        </div>
        <RfqForm locale={locale} />
      </section>
    </main>
  );
}
