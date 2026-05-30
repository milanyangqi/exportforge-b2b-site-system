import { Fragment, type CSSProperties } from "react";
import { IndustrialVisual } from "@/components/IndustrialVisual";
import { HeroPosterCarousel } from "@/components/HeroPosterCarousel";
import { ProductGrid } from "@/components/ProductGrid";
import { HomeNavigationShell } from "@/components/PublicSiteShell";
import { RfqForm } from "@/components/RfqForm";
import { locales } from "@/config/locales";
import { themes } from "@/config/themes";
import { siteSettings } from "@/data/site";
import { t, ui } from "@/lib/i18n";
import type { AdminState, HomeSectionKey, LocaleCode, ProductCategory, SiteTemplateCustomBlock } from "@/types/site";

export function ActiveTemplate({ locale, state }: { locale: LocaleCode; state: AdminState }) {
  const activeTheme = themes[state.activeTheme] ?? themes.industrial;
  const templateSettings = state.templateSettings;
  const homeArticles = state.articles
    .filter((article) => article.status === "published" && article.featuredOnHome)
    .slice(0, templateSettings.homeArticleCount);
  const homeProductSlugs = [
    "food-tin-packaging",
    "gift-tin-packaging",
    "cosmetic-tin-packaging",
    "tea-coffee-tins",
    "candle-tins",
    "custom-tin-box-manufacturing"
  ];
  const preferredHomeProducts = homeProductSlugs
    .map((slug) => state.products.find((product) => product.slug === slug))
    .filter((product): product is ProductCategory => Boolean(product));
  const preferredHomeProductSlugs = new Set(preferredHomeProducts.map((product) => product.slug));
  const additionalHomeProducts = state.products.filter((product) => !preferredHomeProductSlugs.has(product.slug));
  const homeProducts = [...preferredHomeProducts, ...additionalHomeProducts].slice(0, templateSettings.homeProductCount);
  const visibleLocales = locales.filter((item) => state.enabledLocales.includes(item.code));
  const templateText = (key: string, fallback: string) => {
    const value = templateSettings.textBlocks[key];
    return value ? t(value, locale) : fallback;
  };
  const getCustomBlockImages = (block: SiteTemplateCustomBlock) => {
    const images = (block.imageItems ?? [])
      .filter((item) => item.enabled && item.url.trim())
      .sort((a, b) => a.order - b.order);

    if (images.length > 0) return images;
    return block.mediaUrl ? [{
      id: `${block.id}-fallback-image`,
      url: block.mediaUrl,
      alt: block.title,
      caption: { en: "", zh: "" },
      enabled: true,
      order: 10
    }] : [];
  };
  const renderCustomBlockImages = (block: SiteTemplateCustomBlock, title: string) => {
    const layout = block.imageLayout ?? "single";
    const images = layout === "single" ? getCustomBlockImages(block).slice(0, 1) : getCustomBlockImages(block);
    if (images.length === 0) return null;

    return (
      <div
        className={`custom-template-image-set layout-${layout}${block.imageCarouselAutoplay ?? true ? " autoplay" : ""}`}
        style={{ "--custom-carousel-duration": `${Math.max(3, Math.min(15, block.imageCarouselIntervalSeconds ?? 5))}s` } as CSSProperties}
      >
        {images.map((item) => (
          <figure className="custom-template-media" key={item.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.alt ? t(item.alt, locale) : title} loading="lazy" />
            {item.caption && t(item.caption, locale) ? <figcaption>{t(item.caption, locale)}</figcaption> : null}
          </figure>
        ))}
        {layout === "carousel" && images.length > 1 ? (
          <div className="custom-template-carousel-dots" aria-hidden="true">
            {images.map((item, index) => <span className={index === 0 ? "active" : ""} key={item.id} />)}
          </div>
        ) : null}
      </div>
    );
  };
  const renderCustomBlockVideo = (mediaUrl: string, title: string) => {
    if (!mediaUrl) return null;
    const isDirectVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaUrl);

    return (
      <figure className="custom-template-media video">
        {isDirectVideo ? (
          <video src={mediaUrl} controls preload="metadata" />
        ) : (
          <iframe src={mediaUrl} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        )}
      </figure>
    );
  };
  const coreHomeSections = [
    {
      key: "navigation" as HomeSectionKey,
      order: templateSettings.sectionOrder.navigation,
      node: (
        <HomeNavigationShell
          brandName={state.siteSettings.title || "Xiyida Packaging"}
          ctaLabel={t(templateSettings.primaryCtaLabel, locale) || t(ui.quote, locale)}
          enabledLocales={state.enabledLocales}
          locale={locale}
          navigation={state.navigation}
        />
      )
    },
    {
      key: "hero" as HomeSectionKey,
      order: templateSettings.sectionOrder.hero,
      node: (
        <section className={`hero-section home-template-${templateSettings.homeTemplate}${templateSettings.showHeroVisual ? "" : " hero-no-visual"}`}>
          {templateSettings.heroCarouselEnabled ? (
            <HeroPosterCarousel
              enabled={templateSettings.heroCarouselAutoplay}
              intervalSeconds={templateSettings.heroCarouselIntervalSeconds}
              slides={templateSettings.heroSlides}
            />
          ) : null}
          <div className="hero-poster-overlay" aria-hidden="true" />
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="eyebrow">{t(templateSettings.heroKicker, locale) || t(ui.heroKicker, locale)}</span>
              <h1>{t(templateSettings.heroTitle, locale) || t(ui.heroTitle, locale)}</h1>
              <p>{t(templateSettings.heroBody, locale) || t(ui.heroBody, locale)}</p>
              <div className="hero-actions">
                <a className="button primary" href="#rfq">{t(templateSettings.primaryCtaLabel, locale) || t(ui.quote, locale)}</a>
                <a className="button secondary" href={`/${locale}/products`}>{t(templateSettings.secondaryCtaLabel, locale) || t(ui.navProducts, locale)}</a>
              </div>
              {templateSettings.showHeroMetrics ? (
                <div className="metrics">
                  <div><strong>{templateText("heroMetric1Value", "Food-safe")}</strong><span>{templateText("heroMetric1Label", "Tinplate packaging options")}</span></div>
                  <div><strong>{templateText("heroMetric2Value", "Custom print")}</strong><span>{templateText("heroMetric2Label", "Shape, color, and finish support")}</span></div>
                  <div><strong>{templateText("heroMetric3Value", "Export ready")}</strong><span>{templateText("heroMetric3Label", "Carton packing and shipment documents")}</span></div>
                </div>
              ) : null}
            </div>
            {templateSettings.showHeroVisual ? <IndustrialVisual /> : null}
          </div>
        </section>
      )
    },
    {
      key: "products" as HomeSectionKey,
      order: templateSettings.sectionOrder.products,
      node: (
        <section className="section">
          <div className="section-head">
            <span className="eyebrow">{templateText("productsEyebrow", "Tin packaging applications")}</span>
            <h2>{templateText("productsTitle", "Custom metal tins for food, gifts, cosmetics, tea, coffee, and candles.")}</h2>
            <p>{templateText("productsBody", "Browse application-focused packaging categories for importers, brand owners, distributors, and promotional packaging programs.")}</p>
          </div>
          <ProductGrid flat locale={locale} products={homeProducts} />
        </section>
      )
    },
    {
      key: "factory" as HomeSectionKey,
      order: templateSettings.sectionOrder.factory,
      node: (
        <section className="section dark-band">
          <div className="section-head">
            <span className="eyebrow">{templateText("factoryEyebrow", "Factory capability")}</span>
            <h2>{templateText("factoryTitle", "Tinplate forming, printing, inspection, and export packing are aligned before shipment.")}</h2>
          </div>
          <div className="theme-grid">
            {[
              [templateText("factoryCard1Title", "Mold and forming"), templateText("factoryCard1Body", "Round, rectangular, square, hinged, window, embossed, and shaped tin box structures.")],
              [templateText("factoryCard2Title", "Printing and finish"), templateText("factoryCard2Body", "Offset printing, matte or glossy varnish, embossing, debossing, and brand color matching.")],
              [templateText("factoryCard3Title", "Export packing"), templateText("factoryCard3Body", "Protective sleeves, inner cartons, master cartons, pallet plans, and buyer-ready documentation.")]
            ].map(([title, body], index) => (
              <article key={title} className={index === 0 ? "theme-card active" : "theme-card"}>
                <span style={{ background: index === 0 ? activeTheme.colors.accent : activeTheme.colors.primary }} />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
      )
    },
    {
      key: "markets" as HomeSectionKey,
      order: templateSettings.sectionOrder.markets,
      node: (
        <section className="section split">
          <div>
            <span className="eyebrow">{templateText("marketsEyebrow", "Export markets")}</span>
            <h2>{templateText("marketsTitle", "Buyer-ready communication for brands sourcing custom tin packaging.")}</h2>
            <p>
              {templateText("marketsBody", "Xiyida Packaging supports multilingual product pages, quick RFQ details, and export documentation for buyers comparing food tins, gift tins, cosmetic tins, and custom metal boxes.")}
            </p>
            <div className="language-strip">
              {visibleLocales.map((item) => (
                <span key={item.code}>{item.nativeName}</span>
              ))}
            </div>
          </div>
          <div className="workflow-panel">
            <h3>{templateText("marketsChecklistTitle", "RFQ checklist")}</h3>
            <ol>
              <li>{templateText("marketsChecklist1", "Tin shape, size, lid style, insert needs, and intended product use.")}</li>
              <li>{templateText("marketsChecklist2", "Artwork status, printing colors, finish, embossing, and sample expectations.")}</li>
              <li>{templateText("marketsChecklist3", "Quantity target, packing method, destination, and delivery schedule.")}</li>
            </ol>
            <p>{templateText("marketsNote", siteSettings.aiDraftPolicy)}</p>
          </div>
        </section>
      )
    },
    {
      key: "articles" as HomeSectionKey,
      order: templateSettings.sectionOrder.articles,
      node: (
        <section className="section">
          <div className="section-head">
            <span className="eyebrow">{templateText("articlesEyebrow", "Packaging knowledge")}</span>
            <h2>{templateText("articlesTitle", "Buyer guides for tin structures, printing finishes, samples, and export packing.")}</h2>
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
      )
    },
    {
      key: "rfq" as HomeSectionKey,
      order: templateSettings.sectionOrder.rfq,
      node: (
        <section className="section rfq-section" id="rfq">
          <div className="rfq-copy">
            <span className="eyebrow">{templateText("rfqEyebrow", "Send RFQ")}</span>
            <h2>{templateText("rfqTitle", "Share your tin box project and export requirements.")}</h2>
            <p>{templateText("rfqBody", "Send tin style, size, artwork status, quantity target, destination, and packing needs. The sales team will review the details and respond with a clear project proposal.")}</p>
            <div className="rfq-guidance">
              <strong>{templateText("rfqGuidanceTitle", "For a faster reply, include:")}</strong>
              <ul>
                <li>{templateText("rfqGuidance1", "Tin shape, dimensions, lid structure, and insert requirements.")}</li>
                <li>{templateText("rfqGuidance2", "Artwork files, printing method, finish, embossing, and color expectations.")}</li>
                <li>{templateText("rfqGuidance3", "Quantity target, inner packing, master carton, destination, and delivery timeline.")}</li>
              </ul>
            </div>
            <p className="rfq-response-note">{templateText("rfqNote", "Xiyida Packaging reviews each inquiry by application, structure, artwork, and packing needs so the response matches the intended retail or promotional use.")}</p>
          </div>
          <RfqForm locale={locale} />
        </section>
      )
    }
  ];
  const customHomeSections = templateSettings.customBlocks
    .filter((block) => block.enabled)
    .map((block) => {
      const eyebrow = (block.eyebrow ? t(block.eyebrow, locale) : "") || (block.type === "video" ? "Video" : block.type === "image" ? "Image" : block.type === "cta" ? "Action" : "Custom section");
      const title = t(block.title, locale);
      const body = t(block.body, locale);
      const buttonLabel = (block.buttonLabel ? t(block.buttonLabel, locale) : "") || title;
      const media = block.type === "image"
        ? renderCustomBlockImages(block, title)
        : block.type === "video" ? renderCustomBlockVideo(block.mediaUrl ?? "", title) : null;
      const isExternalLink = Boolean(block.openInNewTab);

      return {
        key: block.id,
        order: block.order,
        node: (
          <section className={`section custom-template-section custom-template-${block.type} theme-${block.theme ?? (block.type === "cta" ? "dark" : "light")} align-${block.align ?? "left"} layout-${block.layout ?? (block.type === "image" || block.type === "video" ? "media-left" : "stacked")} spacing-${block.spacing ?? "normal"}`}>
            <div className="custom-template-inner">
              {block.type !== "text" && block.type !== "cta" && block.layout !== "media-right" ? media : null}
              <div className="custom-template-copy">
                {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
                <h2>{title}</h2>
                {body ? <p>{body}</p> : null}
                {block.type === "cta" ? (
                  <a className="button primary" href={block.linkUrl || "#rfq"} target={isExternalLink ? "_blank" : undefined} rel={isExternalLink ? "noopener noreferrer" : undefined}>
                    {buttonLabel}
                  </a>
                ) : null}
              </div>
              {block.type !== "text" && block.type !== "cta" && block.layout === "media-right" ? media : null}
            </div>
          </section>
        )
      };
    });
  const homeSections = [...coreHomeSections, ...customHomeSections].sort((a, b) => a.order - b.order);

  return (
    <main>
      {homeSections.map((section) => "key" in section && section.key in templateSettings.visibleSections
        ? templateSettings.visibleSections[section.key as HomeSectionKey] ? <Fragment key={section.key}>{section.node}</Fragment> : null
        : <Fragment key={section.key}>{section.node}</Fragment>)}
    </main>
  );
}
