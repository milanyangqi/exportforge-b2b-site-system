/* eslint-disable @next/next/no-img-element */
import { ProductCatalog, ProductGallery } from "@/components/ProductCatalog";
import { ArticleContent } from "@/components/ArticleContent";
import { RfqForm } from "@/components/RfqForm";
import { t } from "@/lib/i18n";
import type { AdminState, LocaleCode, ProductCategory, SitePage } from "@/types/site";
const asset = "/assets/current-template/";

export function YuvaProducts({ state, locale, initialCategory = "" }: { state: AdminState; locale: LocaleCode; initialCategory?: string }) {
  const zh = locale === "zh";
  const collection = state.products.find((item) => item.slug === initialCategory);
  return <main className="dawn-page"><section className="dawn-page-intro"><p className="dawn-kicker">{zh ? "美妆工具" : "OUR COLLECTION"}</p><h1>{collection ? t(collection.name, locale) : zh ? "探索美妆工具。" : "Explore beauty tools."}</h1><p>{zh ? "从刷具到礼盒，为您的品牌寻找合适的产品方向。" : "From brushes to gift sets, find the direction for your collection."}</p></section><ProductCatalog products={state.products} locale={locale} initialCategory={initialCategory}/></main>;
}

export function YuvaProduct({ product, locale }: { product: ProductCategory; locale: LocaleCode }) {
  const zh = locale === "zh";
  return <main className="dawn-page"><section className="dawn-product-detail"><ProductGallery product={product} locale={locale}/><div className="dawn-detail-copy"><p className="dawn-kicker">{zh ? "产品系列" : "PRODUCT COLLECTION"}</p><h1>{t(product.name, locale)}</h1><p>{t(product.summary, locale)}</p><div className="dawn-detail-note"><strong>{zh ? "可讨论的方向" : "Discuss your brief"}</strong><span>{zh ? "刷型或工具形状 · 材质与外观 · 包装方式" : "Tool shape · Materials & finish · Packaging"}</span></div><a className="dawn-button" href="#rfq">{zh ? "询问此产品" : "Enquire about this tool"} ↗</a><small>{zh ? "具体规格与可供款式请通过询盘确认。" : "Confirm specifications and available options with your inquiry."}</small></div></section><YuvaContact locale={locale} embedded productName={t(product.name, locale)} /></main>;
}

export function YuvaContact({ locale, embedded = false, productName = "" }: { locale: LocaleCode; embedded?: boolean; productName?: string }) {
  const zh = locale === "zh";
  const body = <section className="dawn-contact" id="rfq"><div><p className="dawn-kicker">{zh ? "联系询盘" : "LET’S CREATE WHAT’S NEXT"}</p>{embedded ? <h2>{zh ? "说说您的计划。" : "Tell us your vision."}</h2> : <h1>{zh ? "说说您的计划。" : "Tell us your vision."}</h1>}<p>{zh ? "分享产品方向、目标市场、预计数量与定制需求。" : "Share your product direction, market, estimated quantity and customization needs."}</p><a href={`/${locale}/pages/privacy`}>{zh ? "阅读询盘隐私说明" : "Read inquiry privacy"} ↗</a></div><RfqForm locale={locale} productName={productName}/></section>;
  return embedded ? body : <main className="dawn-page">{body}</main>;
}

export function YuvaStory({ page, locale }: { page: SitePage; locale: LocaleCode }) {
  const zh = locale === "zh";
  const image = page.slug === "oem-odm" ? "gift-set.jpg" : page.slug === "factories" ? "factory.jpg" : page.slug === "research" ? "quality.jpg" : "brushes.jpg";
  return <main className="dawn-page"><section className="dawn-story-hero"><div><p className="dawn-kicker">{page.slug === "oem-odm" ? "OEM / ODM" : "DAWNORIGIN"}</p><h1>{t(page.title, locale)}</h1><p>{t(page.excerpt, locale)}</p>{page.slug === "oem-odm" ? <a className="dawn-button" href={`/${locale}/contact`}>{zh ? "提交需求" : "Share your brief"} ↗</a> : null}</div>{page.slug !== "privacy" ? <img src={asset+image} alt={zh ? "美妆工具图片" : "Beauty tools"} /> : null}</section><section className="dawn-story-body"><ArticleContent body={t(page.body, locale)} /></section>{page.slug !== "privacy" ? <YuvaContact locale={locale} embedded /> : null}</main>;
}
