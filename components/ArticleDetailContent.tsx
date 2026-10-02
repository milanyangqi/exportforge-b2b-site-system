/* eslint-disable @next/next/no-img-element */
import { ArticleContent } from "@/components/ArticleContent";
import { ArticleGallery } from "@/components/ArticleGallery";
import { articleGallery } from "@/lib/article-gallery";
import { t } from "@/lib/i18n";
import { categoryLabel, publicText } from "@/lib/public-localization";
import type { Article, LocaleCode, ProductCategory } from "@/types/site";

export function ArticleDetailContent({ article, locale, products }: {
  article: Article;
  locale: LocaleCode;
  products: ProductCategory[];
}) {
  const title = t(article.title, locale);
  const category = categoryLabel(article.category, products, locale);
  const body = article.body ? t(article.body, locale) : t(article.excerpt, locale);
  const images = articleGallery(article.coverImageUrl, body, title, locale);
  const leadingImage = /^\s*!\[[^\]]*\]\(\s*(<[^>]+>|[^\s)]+)\s*\)\s*/.exec(body);
  const firstImageUrl = leadingImage?.[1].replace(/^<|>$/g, "");
  const displayBody = leadingImage && firstImageUrl === article.coverImageUrl ? body.slice(leadingImage[0].length) : body;

  return (
    <article className="content-detail product-article-detail">
      <nav className="product-article-breadcrumb" aria-label={locale === "zh" ? "当前位置" : "Breadcrumb"}>
        <a href={`/${locale}/articles`}>{publicText("Articles", locale)}</a>
        <span aria-hidden="true">/</span>
        <span>{category}</span>
      </nav>
      <div className={`product-article-intro${images.length ? " has-image" : ""}`}>
        <ArticleGallery images={images} locale={locale} />
        <div className="product-article-copy">
          <span className="eyebrow">{category}</span>
          <h1>{title}</h1>
          <p className="detail-excerpt">{t(article.excerpt, locale)}</p>
          <a className="button primary" href={`/${locale}/contact#rfq`}>{locale === "zh" ? "咨询这款铁盒" : "Request details"}</a>
          <p className="article-inquiry-note">{locale === "zh" ? "提供尺寸、数量和设计稿，讨论您的定制方案。" : "Share your dimensions, quantity and artwork to discuss customization."}</p>
        </div>
      </div>
      <div className="product-article-body">
        <ArticleContent body={displayBody} locale={locale} />
      </div>
    </article>
  );
}
