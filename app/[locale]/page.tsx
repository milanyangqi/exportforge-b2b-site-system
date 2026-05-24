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
  const visibleLocales = locales.filter((item) => state.enabledLocales.includes(item.code));

  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">{t(ui.heroKicker, locale)}</span>
          <h1>{t(ui.heroTitle, locale)}</h1>
          <p>{t(ui.heroBody, locale)}</p>
          <div className="hero-actions">
            <a className="button primary" href="#rfq">{t(ui.quote, locale)}</a>
            <a className="button secondary" href={`/${locale}/products`}>{t(ui.navProducts, locale)}</a>
          </div>
          <div className="metrics">
            <div><strong>0.2-25mm</strong><span>End mill diameter range</span></div>
            <div><strong>HSS / M35 / Carbide</strong><span>Drill bit supply</span></div>
            <div><strong>OEM</strong><span>Laser marking and packing</span></div>
          </div>
        </div>
        <IndustrialVisual />
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Cutting tool catalog</span>
          <h2>End mills, drill bits, and OEM tooling built for repeat purchasing.</h2>
          <p>Browse core categories for CNC shops, hardware distributors, maintenance suppliers, and private-label tool programs.</p>
        </div>
        <ProductGrid locale={locale} products={state.products} />
      </section>

      <section className="section dark-band">
        <div className="section-head">
          <span className="eyebrow">Factory support</span>
          <h2>Geometry, coating, inspection, and packing are aligned before every export order.</h2>
        </div>
        <div className="theme-grid">
          {[
            ["Tool geometry", "Square, ball nose, corner radius, long-neck, micro, step, and coolant-through options."],
            ["Coating choice", "AlTiN, TiSiN, DLC, bright finish, and buyer-specific series positioning."],
            ["Export packing", "Plastic tubes, foam trays, barcode labels, carton marks, and distributor-ready assortments."]
          ].map(([title, body], index) => (
            <article key={title} className={index === 0 ? "theme-card active" : "theme-card"}>
              <span style={{ background: index === 0 ? activeTheme.colors.accent : activeTheme.colors.primary }} />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split">
        <div>
          <span className="eyebrow">Export markets</span>
          <h2>Buyer-ready communication for distributors across major tooling markets.</h2>
          <p>
            KeyproTools supports multilingual product pages, quick RFQ details, and export documentation for buyers comparing end mills, drill bits, and OEM assortments.
          </p>
          <div className="language-strip">
            {visibleLocales.map((item) => (
              <span key={item.code}>{item.nativeName}</span>
            ))}
          </div>
        </div>
        <div className="workflow-panel">
          <h3>RFQ checklist</h3>
          <ol>
            <li>Tool type, diameter, flute length, overall length, and shank.</li>
            <li>Workpiece material, hardness, coating, and cutting condition.</li>
            <li>Quantity, packaging, laser marking, destination, and delivery target.</li>
          </ol>
          <p>{siteSettings.aiDraftPolicy}</p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Technical articles</span>
          <h2>Selection guides for buyers comparing tool geometry, coating, and packaging.</h2>
        </div>
        <div className="article-grid">
          {homeArticles.map((article) => (
            <a key={article.slug} className="article-card" href={`/${locale}/articles/${article.slug}`}>
              {article.coverImageUrl ? (
                <span className="article-card-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={article.coverImageUrl} alt={t(article.title, locale)} loading="lazy" />
                </span>
              ) : null}
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
          <span className="eyebrow">Request a quote</span>
          <h2>Share your tool list and export requirements.</h2>
          <p>Send product type, size range, quantity, coating, destination, and packing needs. The sales team will turn it into a clear quotation.</p>
        </div>
        <RfqForm locale={locale} />
      </section>
    </main>
  );
}
