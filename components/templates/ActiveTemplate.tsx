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
  const collections = state.products.filter((item) => item.kind === "collection" && item.status === "published").slice(0, 4);
  const featured = state.products.filter((item) => item.kind === "product" && item.status === "published" && item.featuredOnHome).slice(0, settings.homeProductCount);
  const sections: { key: HomeSectionKey; node: ReactNode }[] = [
    {
      key: "navigation",
      node: <HomeNavigationShell brandName={state.siteSettings.title} ctaLabel={zh ? "联系" : "Get in touch"} enabledLocales={state.enabledLocales} locale={locale} navigation={state.navigation} />
    },
    {
      key: "hero",
      node: <section className="river-hero">
        <img className="river-hero-photo" src={settings.heroSlides.find((slide) => slide.enabled)?.imageUrl || asset + "hero.jpg"} alt={zh ? "植物乡居风格编织家居场景" : "Botanical cottage with handcrafted textiles"} />
        <div className="river-hero-shade" />
        <div className="river-hero-copy">
          <span className="river-kicker">{t(settings.heroKicker, locale)}</span>
          <h1>{t(settings.heroTitle, locale)}</h1>
          <p>{t(settings.heroBody, locale)}</p>
          <a className="river-button" href={"/" + locale + "/products"}>{zh ? "探索系列" : "Explore the collection"} <span aria-hidden="true">↗</span></a>
        </div>
        <div className="river-hero-side">RIVERMAKE · MADE WITH CARE</div>
      </section>
    },
    {
      key: "products",
      node: <section className="river-section river-collections">
        <div className="river-section-top"><span className="river-kicker">{zh ? "我们的系列" : "THE COLLECTIONS"}</span><span className="river-flower" aria-hidden="true">✳</span></div>
        <div className="river-section-heading"><h2>{zh ? "给日常，多一点手作温度。" : "A little more handmade, every day."}</h2><p>{zh ? "探索以编织纹理、柔和色彩与自然家居为灵感的系列。" : "Explore tactile pieces inspired by yarn, gentle colour and the comforts of home."}</p></div>
        <div className="river-collection-grid">{collections.map((item) => <a className="river-collection-card" href={"/" + locale + "/products/" + item.slug} key={item.slug}><img src={item.imageUrl} alt={t(item.name, locale)} loading="lazy" /><div><h3>{t(item.name, locale)}</h3><span aria-hidden="true">↗</span></div></a>)}</div>
        <div className="river-section-heading river-featured-title"><h2>{zh ? "值得慢慢欣赏的细节" : "Made to be lived with."}</h2><a href={"/" + locale + "/products"}>{zh ? "查看全部" : "View all pieces"} ↗</a></div>
        <div className="river-featured-grid">{featured.map((item) => <a className="river-featured-card" href={"/" + locale + "/products/" + item.slug} key={item.slug}><img src={item.thumbnailUrl || item.imageUrl} alt={t(item.name, locale)} loading="lazy" /><h3>{t(item.name, locale)}</h3><span>{zh ? "查看详情" : "Explore piece"} ↗</span></a>)}</div>
      </section>
    },
    {
      key: "factory",
      node: <section className="river-story-band"><div className="river-story-copy"><span className="river-kicker">{zh ? "手作的节奏" : "THE MAKING"}</span><h2>{zh ? "一针一线，织出自己的节奏。" : "Every stitch tells a quieter story."}</h2><p>{zh ? "从纱线的触感到最后一处收边，我们关注手作物件在日常生活中的细节。" : "From the feel of yarn to the final edge, the beauty is in the details that stay with us."}</p><a className="river-text-link" href={"/" + locale + "/pages/process"}>{zh ? "了解制作过程" : "Explore the making"} ↗</a></div><img src={asset + "making.jpg"} alt={zh ? "手工编织过程" : "Hands making a crochet textile"} loading="lazy" /></section>
    },
    {
      key: "markets",
      node: <section className="river-section river-notes"><span className="river-kicker">{zh ? "灵感笔记" : "A NOTE FROM THE STUDIO"}</span><div><h2>{zh ? "自然、纹理与日常居所。" : "Inspired by gardens. Made for home."}</h2><p>{zh ? "植物与纱线的色彩，为每一个舒适角落带来灵感。" : "Botanical colour and handworked texture bring warmth to the places we return to."}</p><a href={"/" + locale + "/pages/about"}>{zh ? "认识 Rivermake" : "Discover Rivermake"} ↗</a></div></section>
    },
    {
      key: "articles",
      node: <section className="river-section river-gallery"><div className="river-gallery-copy"><span className="river-kicker">{zh ? "家居灵感" : "AT HOME"}</span><h2>{zh ? "让手作融入每一天。" : "The art of feeling at home."}</h2><p>{zh ? "柔软的盖毯、编织收纳与餐桌织物，为空间增添轻柔层次。" : "Soft throws, woven storage and table textiles add thoughtful layers to everyday spaces."}</p></div><img src={asset + "table-runner.jpg"} alt={zh ? "手工织物布置的餐桌" : "A table styled with a woven runner"} loading="lazy" /></section>
    },
    {
      key: "rfq",
      node: <section className="river-contact" id="rfq"><div><span className="river-kicker">{zh ? "开启对话" : "LET'S TALK"}</span><h2>{zh ? "有想法？欢迎告诉我们。" : "Something in mind? Let's talk."}</h2><p>{zh ? "如果您对系列、材质或合作方式感兴趣，请留下需求。" : "Share the pieces, materials or project ideas you have in mind."}</p></div><RfqForm locale={locale} /></section>
    }
  ];
  return <main className="river-site">{sections.filter(({ key }) => settings.visibleSections[key]).sort((a, b) => settings.sectionOrder[a.key] - settings.sectionOrder[b.key]).map(({ key, node }) => <div key={key}>{node}</div>)}</main>;
}
