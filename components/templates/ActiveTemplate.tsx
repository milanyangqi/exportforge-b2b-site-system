/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { HomeNavigationShell } from "@/components/PublicSiteShell";
import { RfqForm } from "@/components/RfqForm";
import { t } from "@/lib/i18n";
import type { AdminState, HomeSectionKey, LocaleCode } from "@/types/site";

const asset = "/assets/current-template/";

export function ActiveTemplate({ locale, state }: { locale: LocaleCode; state: AdminState }) {
  const zh = locale === "zh";
  const settings = state.templateSettings;
  const products = state.products.slice(0, settings.homeProductCount);
  const sections: { key: HomeSectionKey; node: ReactNode }[] = [
    {
      key: "navigation",
      node: <HomeNavigationShell brandName={state.siteSettings.title} ctaLabel={zh ? "提交询盘" : "Start an inquiry"} enabledLocales={state.enabledLocales} locale={locale} navigation={state.navigation} />
    },
    {
      key: "hero",
      node: <section className="cedar-hero">
        <div className="cedar-hero-copy">
          <p className="cedar-kicker">{t(settings.heroKicker, locale)}</p>
          <h1>{t(settings.heroTitle, locale)}</h1>
          <p className="cedar-lead">{t(settings.heroBody, locale)}</p>
          <div className="cedar-actions">
            <a className="cedar-button" href={`/${locale}/products`}>{zh ? "探索产品系列" : "Explore collections"}<span aria-hidden="true">↗</span></a>
            <a className="cedar-text-link" href={`/${locale}/pages/oem-odm`}>{zh ? "了解定制合作" : "Explore OEM / ODM"} ↗</a>
          </div>
          <p className="cedar-hero-foot">{zh ? "藤条香薰 · 香薰蜡烛 · 室内喷雾" : "REED DIFFUSERS  ·  SCENTED CANDLES  ·  ROOM SPRAYS"}</p>
        </div>
        <div className="cedar-hero-photo"><img src={settings.heroSlides.find(slide => slide.enabled)?.imageUrl || `${asset}hero.jpg`} alt={zh ? "植物系香薰产品静物" : "Botanical home fragrance collection"} /></div>
      </section>
    },
    {
      key: "products",
      node: <section className="cedar-section cedar-products">
        <div className="cedar-section-heading"><div><p className="cedar-kicker">{zh ? "产品系列" : "THE COLLECTION"}</p><h2>{zh ? "让香气融入每一种空间。" : "Fragrance for every kind of space."}</h2></div><a className="cedar-text-link" href={`/${locale}/products`}>{zh ? "查看全部产品" : "View all products"} ↗</a></div>
        <div className="cedar-product-grid">{products.map((product, index) => <a className="cedar-product-card" key={product.slug} href={`/${locale}/products/${product.slug}`}>
          <div className="cedar-product-photo"><img src={product.imageUrl} alt={t(product.name, locale)} loading="lazy" /></div>
          <div className="cedar-product-meta"><span>0{index + 1} / {zh ? "产品系列" : "COLLECTION"}</span><span aria-hidden="true">↗</span></div>
          <h3>{t(product.name, locale)}</h3><p>{t(product.summary, locale)}</p>
        </a>)}</div>
      </section>
    },
    {
      key: "factory",
      node: <section className="cedar-oem"><div className="cedar-oem-photo"><img src={`${asset}quality.jpg`} alt={zh ? "香氛调配概念图" : "Fragrance development concept image"} loading="lazy" /></div><div className="cedar-oem-copy"><p className="cedar-kicker">{zh ? "定制合作" : "MADE FOR YOUR BRAND"}</p><h2>{zh ? "从一个香气构想，走向完整系列。" : "Your idea, thoughtfully made."}</h2><p>{zh ? "从香型方向、容器到包装呈现，先把需求说清楚，再确定样品、规格与报价。" : "Begin with the scent direction, vessel and packaging brief. Confirm samples, specifications and quotation as the project takes shape."}</p><a className="cedar-button cedar-button-light" href={`/${locale}/pages/oem-odm`}>{zh ? "了解 OEM / ODM" : "Explore OEM / ODM"} <span aria-hidden="true">↗</span></a></div></section>
    },
    {
      key: "markets",
      node: <section className="cedar-section cedar-process"><div className="cedar-section-heading"><div><p className="cedar-kicker">{zh ? "制作与品质" : "MAKING & QUALITY"}</p><h2>{zh ? "好的体验，源于每一步的沟通。" : "Considered at every step."}</h2></div></div><div className="cedar-story-grid"><a href={`/${locale}/pages/factory`}><img src={`${asset}factory.jpg`} alt={zh ? "香氛制作空间概念图" : "Fragrance making workspace concept image"} loading="lazy"/><div><h3>{zh ? "制作流程" : "The making"}</h3><span aria-hidden="true">↗</span></div><p>{zh ? "了解容器、组装、标签和包装环节如何进入项目需求。" : "See how vessels, assembly, labeling and packing enter the project brief."}</p></a><a href={`/${locale}/pages/quality`}><img src={`${asset}quality.jpg`} alt={zh ? "香氛评估概念图" : "Fragrance evaluation concept image"} loading="lazy"/><div><h3>{zh ? "品质沟通" : "Quality approach"}</h3><span aria-hidden="true">↗</span></div><p>{zh ? "在订单前明确样品、规格与验收重点。" : "Align samples, specifications and acceptance points before an order."}</p></a></div></section>
    },
    {
      key: "articles",
      node: <section className="cedar-about"><p className="cedar-kicker">CEDARORIGIN</p><h2>{zh ? "让自然香气，成为品牌的一部分。" : "Rooted in nature. Made for your story."}</h2><p>{zh ? "用克制的设计与清晰的合作流程，探索下一组家居香氛。" : "A calm visual language and a clear project path for your next home fragrance collection."}</p><a className="cedar-text-link" href={`/${locale}/pages/about`}>{zh ? "了解更多" : "Discover our approach"} ↗</a></section>
    },
    {
      key: "rfq",
      node: <section className="cedar-contact" id="rfq"><div><p className="cedar-kicker">{zh ? "开启合作" : "LET'S BEGIN"}</p><h2>{zh ? "告诉我们您的香氛构想。" : "Tell us what you imagine."}</h2><p>{zh ? "请提供产品类别、目标市场、香型方向、包装和预计数量。" : "Share your product category, destination market, scent direction, packaging brief and estimated quantity."}</p></div><RfqForm locale={locale}/></section>
    }
  ];
  return <main className="cedar-site">{sections.filter(({ key }) => settings.visibleSections[key]).sort((a, b) => settings.sectionOrder[a.key] - settings.sectionOrder[b.key]).map(({ key, node }) => <div key={key}>{node}</div>)}{settings.customBlocks.filter(block => block.enabled).sort((a,b) => a.order-b.order).map(block => <section className="cedar-section cedar-custom" key={block.id}><h2>{t(block.title, locale)}</h2><p>{t(block.body, locale)}</p>{block.mediaUrl && block.type === "image" ? <img src={block.mediaUrl} alt={t(block.title, locale)} loading="lazy" /> : null}{block.linkUrl ? <a className="cedar-button" href={block.linkUrl}>{block.buttonLabel ? t(block.buttonLabel, locale) : (zh ? "了解更多" : "Learn more")} ↗</a> : null}</section>)}</main>;
}
