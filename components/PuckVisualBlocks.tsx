/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { ArticleContent } from "@/components/ArticleContent";
import { HeroPosterCarousel } from "@/components/HeroPosterCarousel";
import { ProductGrid } from "@/components/ProductGrid";
import { HomeNavigationShell } from "@/components/PublicSiteShell";
import { PublicContactList } from "@/components/PublicContactList";
import { RfqForm } from "@/components/RfqForm";
import { locales } from "@/config/locales";
import { t } from "@/lib/i18n";
import type { AdminState, Article, LocaleCode, ProductCategory, SitePage, VisualPageLayoutData } from "@/types/site";

type PuckVisualItem = VisualPageLayoutData["content"][number];

type PuckVisualBlockProps = {
  item: PuckVisualItem;
  state: AdminState;
  locale: LocaleCode;
  currentProduct?: ProductCategory;
  currentArticle?: Article;
  currentPage?: SitePage;
};

function propString(props: Record<string, unknown>, key: string, fallback = "") {
  const value = props[key];
  return typeof value === "string" ? value : fallback;
}

function propNumber(props: Record<string, unknown>, key: string, fallback = 0) {
  const value = Number(props[key]);
  return Number.isFinite(value) ? value : fallback;
}

function propBoolean(props: Record<string, unknown>, key: string, fallback = false) {
  const value = props[key];
  return typeof value === "boolean" ? value : fallback;
}

function propArray<T = Record<string, unknown>>(props: Record<string, unknown>, key: string): T[] {
  const value = props[key];
  return Array.isArray(value) ? value as T[] : [];
}

function splitLines(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

type VisualImageItem = {
  url: string;
  alt: string;
  caption: string;
  linkHref: string;
};

function normalizeImageItem(value: unknown): VisualImageItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const url = typeof item.url === "string" && item.url.trim()
    ? item.url.trim()
    : typeof item.source === "string" ? item.source.trim() : "";
  if (!url) return null;

  return {
    url,
    alt: typeof item.alt === "string" ? item.alt : "",
    caption: typeof item.caption === "string" ? item.caption : "",
    linkHref: typeof item.linkHref === "string" ? item.linkHref : ""
  };
}

function collectImages(
  props: Record<string, unknown>,
  leadingUrls: string[] = [],
  imageItemsKey = "imageItems",
  imageUrlsKey = "imageUrls"
): VisualImageItem[] {
  const images: VisualImageItem[] = [];
  const seen = new Set<string>();
  const push = (item: VisualImageItem | null) => {
    if (!item || seen.has(item.url)) return;
    seen.add(item.url);
    images.push(item);
  };

  leadingUrls.forEach((url) => push(url ? { url, alt: "", caption: "", linkHref: "" } : null));
  propArray(props, imageItemsKey).forEach((item) => push(normalizeImageItem(item)));
  splitLines(propString(props, imageUrlsKey)).forEach((url) => push({ url, alt: "", caption: "", linkHref: "" }));

  return images;
}

function imageAspectClass(value: string) {
  if (value === "square") return "aspect-square";
  if (value === "portrait") return "aspect-portrait";
  if (value === "standard") return "aspect-standard";
  return "aspect-wide";
}

function renderImageSet({
  altFallback,
  aspect,
  fit,
  frame,
  images,
  layout,
  tone
}: {
  altFallback: string;
  aspect: string;
  fit: string;
  frame: string;
  images: VisualImageItem[];
  layout: string;
  tone: string;
}) {
  if (images.length === 0) return null;

  const safeLayout = layout === "carousel" && images.length < 2 ? "single" : layout;

  return (
    <div className={`puck-public-custom-media-set layout-${safeLayout} fit-${fit} frame-${frame} tone-${tone} ${imageAspectClass(aspect)}`}>
      {images.map((image, index) => {
        const figure = (
          <figure key={`${image.url}-${index}`} style={{ "--custom-image-delay": `${index * 3}s` } as CSSProperties}>
            <img src={image.url} alt={image.alt || altFallback} loading="lazy" />
            {image.caption ? <figcaption>{image.caption}</figcaption> : null}
          </figure>
        );

        return image.linkHref ? <a href={image.linkHref} key={`${image.url}-${index}`}>{figure}</a> : figure;
      })}
    </div>
  );
}

function localizeHref(href: string, locale: LocaleCode) {
  const value = href.trim();
  if (!value) return "#";
  if (/^(https?:|mailto:|tel:|#)/i.test(value)) return value;
  if (value.startsWith(`/${locale}/`) || value === `/${locale}`) return value;
  return `/${locale}${value.startsWith("/") ? value : `/${value}`}`;
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function SectionHead({ eyebrow, title, body }: { eyebrow?: string; title?: string; body?: string }) {
  if (!eyebrow && !title && !body) return null;

  return (
    <div className="section-head">
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      {title ? <h2>{title}</h2> : null}
      {body ? <p>{body}</p> : null}
    </div>
  );
}

function HomeNavigation({ props, state, locale }: { props: Record<string, unknown>; state: AdminState; locale: LocaleCode }) {
  const ctaLabel = propString(props, "ctaLabel", t(state.templateSettings.primaryCtaLabel, locale) || "RFQ");

  return (
    <HomeNavigationShell
      brandName={state.siteSettings.title || "KeyproTools"}
      ctaLabel={ctaLabel}
      enabledLocales={state.enabledLocales}
      locale={locale}
      navigation={state.navigation}
    />
  );
}

function HeroSection({ props, locale }: { props: Record<string, unknown>; locale: LocaleCode }) {
  const title = propString(props, "title", "KeyproTools");
  const backgroundMode = propString(props, "backgroundMode", "single");
  const images = collectImages(props, [propString(props, "mediaLibraryUrl"), propString(props, "imageUrl")]);
  const imageUrl = backgroundMode !== "none" ? images[0]?.url ?? "" : "";
  const primaryHref = localizeHref(propString(props, "primaryHref", "#rfq"), locale);
  const secondaryHref = localizeHref(propString(props, "secondaryHref", "/products"), locale);
  const showMetrics = propBoolean(props, "showMetrics", true);
  const heroSlides = images.map((image, index) => ({
    id: `puck-hero-${index}`,
    imageUrl: image.url,
    alt: { en: image.alt || title },
    enabled: true,
    order: index
  }));
  const metrics = [
    [propString(props, "metric1Value"), propString(props, "metric1Label")],
    [propString(props, "metric2Value"), propString(props, "metric2Label")],
    [propString(props, "metric3Value"), propString(props, "metric3Label")]
  ].filter(([value, label]) => value || label);

  return (
    <section className={`puck-public-hero height-${propString(props, "heroHeight", "standard")} align-${propString(props, "contentPosition", "left")} overlay-${propString(props, "overlayTone", "dark")}${imageUrl || heroSlides.length ? " has-image" : ""}`}>
      {backgroundMode === "carousel" && heroSlides.length > 1 ? (
        <HeroPosterCarousel enabled intervalSeconds={6} slides={heroSlides} />
      ) : imageUrl ? (
        <img className="puck-public-hero-image" src={imageUrl} alt={title} />
      ) : null}
      <div className="puck-public-hero-overlay" aria-hidden="true" />
      <div className="puck-public-hero-inner">
        {propString(props, "eyebrow") ? <span className="eyebrow">{propString(props, "eyebrow")}</span> : null}
        <h1>{title}</h1>
        {propString(props, "body") ? <p>{propString(props, "body")}</p> : null}
        <div className={`hero-actions style-${propString(props, "buttonStyle", "default")}`}>
          {propString(props, "primaryLabel") ? <a className="button primary" href={primaryHref}>{propString(props, "primaryLabel")}</a> : null}
          {propString(props, "secondaryLabel") ? <a className="button secondary" href={secondaryHref}>{propString(props, "secondaryLabel")}</a> : null}
        </div>
        {showMetrics && metrics.length > 0 ? (
          <div className="metrics">
            {metrics.map(([value, label]) => (
              <div key={`${value}-${label}`}><strong>{value}</strong><span>{label}</span></div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PageHero({ props }: { props: Record<string, unknown> }) {
  const imageUrl = propString(props, "mediaLibraryUrl") || propString(props, "imageUrl");
  const style = imageUrl ? { "--page-hero-image": `url(${imageUrl})` } as CSSProperties : undefined;

  return (
    <section className={`section puck-public-page-hero tone-${propString(props, "tone", "light")} align-${propString(props, "align", "left")} height-${propString(props, "height", "standard")}${imageUrl ? " has-image" : ""}`} style={style}>
      <div className="section-head subpage-head">
        {propString(props, "eyebrow") ? <span className="eyebrow">{propString(props, "eyebrow")}</span> : null}
        <h1>{propString(props, "title", "Page")}</h1>
        {propString(props, "body") ? <p>{propString(props, "body")}</p> : null}
      </div>
    </section>
  );
}

function ProductList({ props, state, locale }: { props: Record<string, unknown>; state: AdminState; locale: LocaleCode }) {
  const limit = propNumber(props, "limit", 0);
  const products = limit > 0 ? state.products.slice(0, limit) : state.products;
  const columns = propString(props, "columns", "auto");

  return (
    <section className={`section puck-public-product-list tone-${propString(props, "tone", "light")} columns-${columns}`}>
      <SectionHead eyebrow={propString(props, "eyebrow")} title={propString(props, "title")} body={propString(props, "body")} />
      <ProductGrid flat={propBoolean(props, "flat", false)} locale={locale} products={products} />
    </section>
  );
}

function FeatureCards({ props }: { props: Record<string, unknown> }) {
  const customCards = propArray<Record<string, unknown>>(props, "cards")
    .map((card) => ({
      title: propString(card, "title"),
      body: propString(card, "body"),
      icon: propString(card, "icon"),
      imageUrl: propString(card, "imageUrl"),
      href: propString(card, "href")
    }))
    .filter((card) => card.title || card.body || card.icon || card.imageUrl);
  const fallbackCards = [
    { title: propString(props, "card1Title"), body: propString(props, "card1Body"), icon: "", imageUrl: "", href: "" },
    { title: propString(props, "card2Title"), body: propString(props, "card2Body"), icon: "", imageUrl: "", href: "" },
    { title: propString(props, "card3Title"), body: propString(props, "card3Body"), icon: "", imageUrl: "", href: "" }
  ].filter((card) => card.title || card.body);
  const cards = customCards.length > 0 ? customCards : fallbackCards;

  return (
    <section className={`section puck-public-feature-cards tone-${propString(props, "tone", "dark")} columns-${propString(props, "columns", "auto")}`}>
      <SectionHead eyebrow={propString(props, "eyebrow")} title={propString(props, "title")} body={propString(props, "body")} />
      <div className="theme-grid">
        {cards.map((card, index) => {
          const content = (
            <>
              {card.imageUrl ? <img src={card.imageUrl} alt={card.title || card.icon || "Feature"} loading="lazy" /> : <span>{card.icon}</span>}
              {card.title ? <h3>{card.title}</h3> : null}
              {card.body ? <p>{card.body}</p> : null}
            </>
          );

          return card.href ? (
            <a className={index === 0 ? "theme-card active" : "theme-card"} href={card.href} key={`${card.title}-${index}`}>{content}</a>
          ) : (
            <article className={index === 0 ? "theme-card active" : "theme-card"} key={`${card.title}-${index}`}>{content}</article>
          );
        })}
      </div>
    </section>
  );
}

function MarketSection({ props, state }: { props: Record<string, unknown>; state: AdminState }) {
  const visibleLocales = locales.filter((item) => state.enabledLocales.includes(item.code));
  const checklistItems = propArray<Record<string, unknown>>(props, "checklistItems")
    .map((item) => [propString(item, "label"), propString(item, "body")])
    .filter(([label, body]) => label || body);
  const fallbackItems = [propString(props, "item1"), propString(props, "item2"), propString(props, "item3")]
    .filter(Boolean)
    .map((item) => ["", item]);
  const items = checklistItems.length > 0 ? checklistItems : fallbackItems;
  const mediaUrl = propString(props, "mediaLibraryUrl");

  return (
    <section className={`section split puck-public-market-section tone-${propString(props, "tone", "light")} layout-${propString(props, "layout", "checklist")}`}>
      <div>
        {propString(props, "eyebrow") ? <span className="eyebrow">{propString(props, "eyebrow")}</span> : null}
        <h2>{propString(props, "title", "Markets")}</h2>
        {propString(props, "body") ? <p>{propString(props, "body")}</p> : null}
        <div className="language-strip">
          {visibleLocales.map((item) => <span key={item.code}>{item.nativeName}</span>)}
        </div>
      </div>
      <div className="workflow-panel">
        <h3>{propString(props, "checklistTitle", "RFQ checklist")}</h3>
        {mediaUrl && propString(props, "layout") === "image" ? <img className="puck-public-panel-image" src={mediaUrl} alt={propString(props, "sideTitle", "Market image")} loading="lazy" /> : null}
        {propString(props, "sideTitle") ? <strong>{propString(props, "sideTitle")}</strong> : null}
        {propString(props, "sideBody") ? <p>{propString(props, "sideBody")}</p> : null}
        <ol>
          {items.map(([label, body], index) => (
            <li key={`${label}-${body}-${index}`}>{label ? <strong>{label}</strong> : null}{body ? <span>{body}</span> : null}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ArticleList({ props, state, locale }: { props: Record<string, unknown>; state: AdminState; locale: LocaleCode }) {
  const limit = propNumber(props, "limit", 0);
  const articles = state.articles.filter((article) => article.status === "published");
  const visibleArticles = limit > 0 ? articles.slice(0, limit) : articles;

  return (
    <section className={`section puck-public-article-list tone-${propString(props, "tone", "light")} columns-${propString(props, "columns", "auto")}`}>
      <SectionHead eyebrow={propString(props, "eyebrow")} title={propString(props, "title")} body={propString(props, "body")} />
      <div className="article-grid">
        {visibleArticles.map((article) => (
          <a className="article-card" href={`/${locale}/articles/${article.slug}`} key={article.slug}>
            {article.coverImageUrl ? (
              <span className="article-card-media">
                <img src={article.coverImageUrl} alt={t(article.title, locale)} loading="lazy" />
              </span>
            ) : null}
            <span>{article.category}</span>
            <h3>{t(article.title, locale)}</h3>
            {propBoolean(props, "showExcerpt", true) ? <p>{t(article.excerpt, locale)}</p> : null}
          </a>
        ))}
        {visibleArticles.length === 0 ? <p>暂无已发布文章。</p> : null}
      </div>
    </section>
  );
}

function RfqSection({ props, locale }: { props: Record<string, unknown>; locale: LocaleCode }) {
  const guidanceItems = propArray<Record<string, unknown>>(props, "guidanceItems")
    .map((item) => propString(item, "text"))
    .filter(Boolean);

  return (
    <section className={`section rfq-section tone-${propString(props, "tone", "light")}`} id="rfq">
      <div>
        {propString(props, "eyebrow") ? <span className="eyebrow">{propString(props, "eyebrow")}</span> : null}
        <h2>{propString(props, "title", "Tell us what to quote.")}</h2>
        {propString(props, "body") ? <p>{propString(props, "body")}</p> : null}
        {guidanceItems.length > 0 ? (
          <div className="puck-public-guidance">
            {propString(props, "guidanceTitle") ? <strong>{propString(props, "guidanceTitle")}</strong> : null}
            <ul>{guidanceItems.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        ) : null}
      </div>
      <RfqForm locale={locale} />
    </section>
  );
}

function TextSection({ props, locale }: { props: Record<string, unknown>; locale: LocaleCode }) {
  const imageUrl = propString(props, "mediaLibraryUrl") || propString(props, "imageUrl");
  const layout = imageUrl ? propString(props, "layout", "media-right") : "text";
  const copyNode = (
    <div className={propString(props, "align") === "center" ? "section-head centered" : "section-head"}>
      {propString(props, "eyebrow") ? <span className="eyebrow">{propString(props, "eyebrow")}</span> : null}
      <h2>{propString(props, "title", "Text section")}</h2>
      {propString(props, "body") ? <ArticleContent body={propString(props, "body")} /> : null}
      {propString(props, "buttonLabel") ? <a className="button primary" href={localizeHref(propString(props, "buttonHref", "#rfq"), locale)}>{propString(props, "buttonLabel")}</a> : null}
    </div>
  );
  const mediaNode = imageUrl ? (
    <figure className="puck-public-text-media">
      <img src={imageUrl} alt={propString(props, "title", "Section image")} loading="lazy" />
    </figure>
  ) : null;

  return (
    <section className={`section puck-public-text-section tone-${propString(props, "tone", "light")} spacing-${propString(props, "spacing", "normal")} width-${propString(props, "width", "normal")} layout-${layout}`}>
      <div className="puck-public-text-inner">
        {layout === "media-left" ? mediaNode : null}
        {copyNode}
        {layout === "media-right" ? mediaNode : null}
      </div>
    </section>
  );
}

function RichTextBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <section className={`section puck-public-richtext-section tone-${propString(props, "tone", "light")}`}>
      <article className={`content-detail puck-public-richtext width-${propString(props, "width", "normal")}`}>
        <ArticleContent body={propString(props, "body")} />
      </article>
    </section>
  );
}

function ImageGallery({ props }: { props: Record<string, unknown> }) {
  const imageLimit = propNumber(props, "imageLimit", 0);
  const images = collectImages(props, [propString(props, "mediaLibraryUrl")]).slice(0, imageLimit > 0 ? imageLimit : 12);
  if (!images.length) return null;

  return (
    <section className="section puck-public-gallery-section">
      <SectionHead eyebrow={propString(props, "eyebrow")} title={propString(props, "title")} body={propString(props, "body")} />
      {renderImageSet({
        altFallback: propString(props, "title", "Gallery image"),
        aspect: propString(props, "imageAspect", "standard"),
        fit: propString(props, "imageFit", "cover"),
        frame: "soft",
        images,
        layout: propString(props, "layout", "grid"),
        tone: "normal"
      })}
    </section>
  );
}

function VideoSection({ props }: { props: Record<string, unknown> }) {
  const mediaUrl = propString(props, "mediaLibraryUrl") || propString(props, "mediaUrl");
  if (!mediaUrl) return null;

  const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(mediaUrl);
  const layout = propString(props, "layout", "stacked");
  const copyNode = (
    <SectionHead eyebrow={propString(props, "eyebrow")} title={propString(props, "title")} body={propString(props, "body")} />
  );
  const mediaNode = (
    <figure className="custom-template-media video">
      {isDirectVideo ? (
        <video poster={propString(props, "posterUrl") || undefined} src={mediaUrl} controls preload="metadata" />
      ) : (
        <iframe src={mediaUrl} title={propString(props, "title", "Video")} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      )}
    </figure>
  );

  return (
    <section className={`section puck-public-video-section tone-${propString(props, "tone", "light")} layout-${layout}`}>
      <div className="puck-public-video-inner">
        {layout === "media-left" ? mediaNode : null}
        {copyNode}
        {layout !== "media-left" ? mediaNode : null}
      </div>
    </section>
  );
}

function CtaSection({ props, locale }: { props: Record<string, unknown>; locale: LocaleCode }) {
  const imageUrl = propString(props, "mediaLibraryUrl") || propString(props, "imageUrl");
  const style = imageUrl ? { "--cta-bg-image": `url(${imageUrl})` } as CSSProperties : undefined;

  return (
    <section
      className={`section puck-public-cta tone-${propString(props, "tone", "dark")} align-${propString(props, "align", "split")} spacing-${propString(props, "spacing", "normal")}${imageUrl ? " has-image" : ""}`}
      style={style}
    >
      <div>
        {propString(props, "eyebrow") ? <span className="eyebrow">{propString(props, "eyebrow")}</span> : null}
        <h2>{propString(props, "title", "Ready to quote?")}</h2>
        {propString(props, "body") ? <p>{propString(props, "body")}</p> : null}
      </div>
      <div className="puck-public-cta-actions">
        <a className="button primary" href={localizeHref(propString(props, "href", "#rfq"), locale)}>
          {propString(props, "buttonLabel", "Learn more")}
        </a>
        {propString(props, "secondaryLabel") ? (
          <a className="button secondary" href={localizeHref(propString(props, "secondaryHref", "/contact"), locale)}>
            {propString(props, "secondaryLabel")}
          </a>
        ) : null}
      </div>
    </section>
  );
}

function CustomSection({ props, locale }: { props: Record<string, unknown>; locale: LocaleCode }) {
  const moduleType = propString(props, "moduleType", "media");
  const title = propString(props, "title", "自定义模块");
  const body = propString(props, "body");
  const imageMode = propString(props, "imageMode", "single");
  const imageLimit = propNumber(props, "imageLimit", 0);
  const collectedImages = collectImages(props, [propString(props, "mediaLibraryUrl"), propString(props, "mediaUrl")]);
  const images = imageMode === "none"
    ? []
    : collectedImages.slice(0, imageMode === "single" ? 1 : imageLimit > 0 ? imageLimit : 12);
  const backgroundImageUrl = imageMode === "background"
    ? propString(props, "backgroundImageUrl") || images[0]?.url || ""
    : "";
  const videoUrl = propString(props, "videoLibraryUrl") || propString(props, "videoUrl");
  const buttonLabel = propString(props, "buttonLabel");
  const buttonHref = localizeHref(propString(props, "buttonHref", "#rfq"), locale);
  const tone = propString(props, "tone", "light");
  const align = propString(props, "align", "left");
  const layout = propString(props, "layout", moduleType === "text" || moduleType === "cta" ? "stacked" : "media-left");
  const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(videoUrl);
  const sectionStyle = backgroundImageUrl ? { "--custom-bg-image": `url(${backgroundImageUrl})` } as CSSProperties : undefined;
  const mediaNode = moduleType === "video" && videoUrl ? (
    <figure className="puck-public-custom-media video">
      {isDirectVideo ? (
        <video poster={propString(props, "videoPosterUrl") || undefined} src={videoUrl} controls preload="metadata" />
      ) : (
        <iframe src={videoUrl} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      )}
    </figure>
  ) : moduleType === "media" && images.length > 0 && imageMode !== "background" ? (
    renderImageSet({
      altFallback: title || "Custom image",
      aspect: propString(props, "imageAspect", "wide"),
      fit: propString(props, "imageFit", "cover"),
      frame: propString(props, "imageFrame", "soft"),
      images,
      layout: imageMode === "carousel"
        ? "carousel"
        : imageMode === "gallery" ? propString(props, "imageLayout", "grid") : "single",
      tone: propString(props, "imageTone", "normal")
    })
  ) : null;
  const copyNode = (
    <div className="puck-public-custom-copy">
      {propString(props, "eyebrow") ? <span className="eyebrow">{propString(props, "eyebrow")}</span> : null}
      {title ? <h2>{title}</h2> : null}
      {body ? <ArticleContent body={body} /> : null}
      {(moduleType === "cta" || buttonLabel) ? (
        <a className={`button ${propString(props, "buttonStyle", "primary")}`} href={buttonHref}>{buttonLabel || "了解更多"}</a>
      ) : null}
    </div>
  );

  return (
    <section
      className={`section puck-public-custom-section type-${moduleType} theme-${tone} align-${align} layout-${layout} width-${propString(props, "width", "contained")} spacing-${propString(props, "spacing", "normal")}${backgroundImageUrl ? " has-bg" : ""}`}
      style={sectionStyle}
    >
      <div className="puck-public-custom-inner">
        {layout === "media-left" ? mediaNode : null}
        {copyNode}
        {layout !== "media-left" ? mediaNode : null}
      </div>
    </section>
  );
}

function ProductDetail({ currentProduct, locale }: { currentProduct?: ProductCategory; locale: LocaleCode }) {
  if (!currentProduct) return null;

  return (
    <section className="product-detail">
      <div>
        <span className="eyebrow">Product category</span>
        <h1>{t(currentProduct.name, locale)}</h1>
        <p>{t(currentProduct.summary, locale)}</p>
        <div className="chips">
          {currentProduct.specs.map((spec) => <span key={spec}>{spec}</span>)}
        </div>
      </div>
      {currentProduct.imageUrl ? (
        <figure className="product-detail-media">
          <img src={currentProduct.imageUrl} alt={t(currentProduct.name, locale)} />
        </figure>
      ) : null}
      <div className="workflow-panel">
        <h3>Applications</h3>
        <ul className="detail-list">
          {t(currentProduct.applications, locale).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </section>
  );
}

function ArticleDetail({ currentArticle, locale }: { currentArticle?: Article; locale: LocaleCode }) {
  if (!currentArticle) return null;

  return (
    <article className="content-detail">
      <span className="eyebrow">{currentArticle.category}</span>
      <h1>{t(currentArticle.title, locale)}</h1>
      <p className="detail-excerpt">{t(currentArticle.excerpt, locale)}</p>
      {currentArticle.coverImageUrl ? (
        <figure className="article-cover">
          <img src={currentArticle.coverImageUrl} alt={t(currentArticle.title, locale)} />
        </figure>
      ) : null}
      <ArticleContent body={currentArticle.body ? t(currentArticle.body, locale) : t(currentArticle.excerpt, locale)} />
    </article>
  );
}

function FileList({ state }: { state: AdminState }) {
  const files = state.uploadedFiles.filter((file) => file.enabled !== false);

  return (
    <section className="section">
      <div className="download-grid">
        {files.map((file) => (
          <article className="download-card" key={file.id}>
            <div>
              <strong>{file.name}</strong>
              <span>{file.mimeType || "application/octet-stream"} · {formatFileSize(file.size)}</span>
            </div>
            <a href={file.url} download={file.name}>下载</a>
          </article>
        ))}
        {files.length === 0 ? <p>暂无可下载文件。</p> : null}
      </div>
    </section>
  );
}

function ContactChannels({ props, state, locale }: { props: Record<string, unknown>; state: AdminState; locale: LocaleCode }) {
  return (
    <section className={`section contact-section puck-public-contact-section tone-${propString(props, "tone", "light")}`}>
      <div className="contact-copy">
        {propString(props, "eyebrow") ? <span className="eyebrow">{propString(props, "eyebrow")}</span> : null}
        {propString(props, "title") ? <h2>{propString(props, "title")}</h2> : null}
        {propString(props, "body") ? <p>{propString(props, "body")}</p> : null}
        <PublicContactList channels={state.contactChannels} locale={locale} />
      </div>
    </section>
  );
}

export function PuckVisualBlock({ item, state, locale, currentProduct, currentArticle }: PuckVisualBlockProps) {
  const props = item.props as Record<string, unknown>;

  switch (item.type) {
    case "HomeNavigation":
      return <HomeNavigation props={props} state={state} locale={locale} />;
    case "HeroSection":
      return <HeroSection props={props} locale={locale} />;
    case "PageHero":
      return <PageHero props={props} />;
    case "ProductList":
      return <ProductList props={props} state={state} locale={locale} />;
    case "FeatureCards":
      return <FeatureCards props={props} />;
    case "MarketSection":
      return <MarketSection props={props} state={state} />;
    case "ArticleList":
      return <ArticleList props={props} state={state} locale={locale} />;
    case "RfqSection":
      return <RfqSection props={props} locale={locale} />;
    case "TextSection":
      return <TextSection props={props} locale={locale} />;
    case "RichTextBlock":
      return <RichTextBlock props={props} />;
    case "ImageGallery":
      return <ImageGallery props={props} />;
    case "VideoSection":
      return <VideoSection props={props} />;
    case "CtaSection":
      return <CtaSection props={props} locale={locale} />;
    case "CustomMediaSection":
    case "CustomTextSection":
    case "CustomVideoSection":
    case "CustomCtaSection":
    case "CustomSection":
      return <CustomSection props={props} locale={locale} />;
    case "ProductDetail":
      return <ProductDetail currentProduct={currentProduct} locale={locale} />;
    case "ArticleDetail":
      return <ArticleDetail currentArticle={currentArticle} locale={locale} />;
    case "FileList":
      return <FileList state={state} />;
    case "ContactChannels":
      return <ContactChannels props={props} state={state} locale={locale} />;
    default:
      return null;
  }
}
