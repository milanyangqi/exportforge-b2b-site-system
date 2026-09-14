/* eslint-disable @next/next/no-img-element */
import { Fragment, type ReactNode } from "react";
import {
  ArrowRight,
  Package,
  SlidersHorizontal,
  MessageCircle,
} from "lucide-react";
import { HomeNavigationShell } from "@/components/PublicSiteShell";
import { ProductGrid } from "@/components/ProductGrid";
import { RfqForm } from "@/components/RfqForm";
import { SkewerSpecification } from "@/components/SkewerSpecification";
import { GrillBeatsHero } from "@/components/GrillBeatsHero";
import { TemplateCustomBlock } from "@/components/TemplateCustomBlock";
import { t } from "@/lib/i18n";
import type { AdminState, HomeSectionKey, LocaleCode } from "@/types/site";

export function ActiveTemplate({
  locale,
  state,
}: {
  locale: LocaleCode;
  state: AdminState;
}) {
  const s = state.templateSettings;
  const zh = locale === "zh";
  const copy = (key: string, en: string, cn: string) =>
    s.textBlocks[key] ? t(s.textBlocks[key], locale) : zh ? cn : en;
  const sections: { key: string; order: number; node: ReactNode }[] = [
    {
      key: "navigation",
      order: s.sectionOrder.navigation,
      node: (
        <>
          <div className="gb-utility">
            <div>
              <span>
                {zh
                  ? "批发采购 · 包装定制"
                  : "Wholesale enquiries  /  Custom packaging"}
              </span>
              <span>
                {zh
                  ? "为你的业务选择竹签"
                  : "Small details. Bigger possibilities."}
              </span>
            </div>
          </div>
          <HomeNavigationShell
            brandName={state.siteSettings.title}
            ctaLabel={t(s.primaryCtaLabel, locale)}
            enabledLocales={state.enabledLocales}
            locale={locale}
            navigation={state.navigation}
          />
        </>
      ),
    },
    {
      key: "hero",
      order: s.sectionOrder.hero,
      node: <GrillBeatsHero locale={locale} settings={s} />,
    },
    {
      key: "products",
      order: s.sectionOrder.products,
      node: (
        <section className="gb-section gb-catalog" id="products">
          <div className="gb-section-heading">
            <h2>
              {copy("productsTitle", "Find your skewer", "找到适合你的竹签")}
            </h2>
            <p>
              {copy(
                "productsBody",
                "Explore the range. Tell us the specifications your business needs.",
                "浏览产品系列，告诉我们你的采购规格。",
              )}
            </p>
          </div>
          <ProductGrid
            flat
            locale={locale}
            products={state.products.slice(0, s.homeProductCount)}
          />
          <SkewerSpecification locale={locale} />
        </section>
      ),
    },
    {
      key: "markets",
      order: s.sectionOrder.markets,
      node: (
        <section className="gb-support">
          <div className="gb-section">
            <h2>
              {copy(
                "marketsTitle",
                "More than just skewers",
                "从选型到包装，一起确认",
              )}
            </h2>
            <div className="gb-support-grid">
              {[
                {
                  Icon: SlidersHorizontal,
                  title: zh ? "产品选型" : "Product selection",
                  body: zh
                    ? "说明使用场景，沟通款式与期望尺寸。"
                    : "Find a style and share the dimensions that suit your application.",
                  href: `/${locale}/products`,
                  link: zh ? "浏览产品" : "Explore products",
                },
                {
                  Icon: Package,
                  title: zh ? "包装选项" : "Packaging options",
                  body: zh
                    ? "从散装到零售纸套，沟通数量与标签需求。"
                    : "From bulk packs to retail sleeves, discuss the format for your market.",
                  href: `/${locale}/pages/custom-packaging`,
                  link: zh ? "了解包装" : "Explore packaging",
                },
                {
                  Icon: MessageCircle,
                  title: zh ? "样品咨询" : "Sample enquiries",
                  body: zh
                    ? "在确认订单前咨询样品、规格与包装方案。"
                    : "Ask about samples to review the product before confirming an order.",
                  href: `/${locale}/contact?intent=sample#rfq`,
                  link: zh ? "咨询样品" : "Ask about samples",
                },
              ].map(({ Icon, ...item }) => (
                <article key={item.href}>
                  <Icon size={29} strokeWidth={1.3} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <a href={item.href}>
                      {item.link} <ArrowRight size={15} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ),
    },
    {
      key: "factory",
      order: s.sectionOrder.factory,
      node: (
        <section className="gb-section gb-packaging">
          <img
            src="/assets/current-template/packaging.webp"
            alt={zh ? "竹签包装示意" : "Bamboo skewer packaging concept"}
            width="900"
            height="600"
            loading="lazy"
          />
          <div>
            <span className="gb-eyebrow">
              {zh ? "包装与品牌" : "PACKAGING & PRIVATE LABEL"}
            </span>
            <h2>
              {copy(
                "factoryTitle",
                "Your brand. Your packaging.",
                "你的品牌，你的包装。",
              )}
            </h2>
            <p>
              {copy(
                "factoryBody",
                "Start with the format that fits your business.",
                "选择适合你业务的包装形式。",
              )}
            </p>
            <a
              className="gb-button gb-button-outline"
              href={`/${locale}/pages/custom-packaging`}
            >
              {zh ? "了解定制包装" : "Explore custom packaging"}
              <ArrowRight size={16} />
            </a>
          </div>
        </section>
      ),
    },
    {
      key: "articles",
      order: s.sectionOrder.articles,
      node: (
        <section className="gb-section gb-guides">
          <div className="gb-section-heading">
            <h2>
              {copy(
                "articlesTitle",
                "A little sourcing guidance",
                "采购小指南",
              )}
            </h2>
            <a href={`/${locale}/articles`}>
              {zh ? "全部文章" : "All guides"} →
            </a>
          </div>
          <div className="gb-guide-grid">
            {state.articles
              .filter((a) => a.status === "published" && a.featuredOnHome)
              .slice(0, s.homeArticleCount)
              .map((a) => (
                <a
                  key={a.slug}
                  className="gb-guide"
                  href={`/${locale}/articles/${a.slug}`}
                >
                  <img
                    src={a.coverImageUrl}
                    alt={t(a.title, locale)}
                    loading="lazy"
                    width="240"
                    height="180"
                  />
                  <div>
                    <span className="gb-eyebrow">
                      {zh ? "采购参考" : "BUYER NOTES"}
                    </span>
                    <h3>{t(a.title, locale)}</h3>
                    <p>{t(a.excerpt, locale)}</p>
                    <span>{zh ? "阅读文章" : "Read guide"} ↗</span>
                  </div>
                </a>
              ))}
          </div>
        </section>
      ),
    },
    {
      key: "rfq",
      order: s.sectionOrder.rfq,
      node: (
        <section className="gb-inquiry" id="rfq">
          <div className="gb-section gb-inquiry-grid">
            <div>
              <span className="gb-eyebrow">
                {zh ? "准备开始采购？" : "READY TO TALK?"}
              </span>
              <h2>
                {copy(
                  "rfqTitle",
                  "Start your sourcing enquiry.",
                  "开始你的采购询盘。",
                )}
              </h2>
              <p>
                {copy(
                  "rfqBody",
                  "Tell us what you need.",
                  "告诉我们你的需求。",
                )}
              </p>
              <p className="gb-inquiry-note">
                {zh
                  ? "不确定尺寸？可以先说明用途。我们将根据你的需求确认细节。"
                  : "Not sure about a size? Describe the application and we can discuss the details."}
              </p>
              <a href={`/${locale}/pages/privacy`}>
                {zh ? "询盘信息说明" : "How we use your enquiry information"} ↗
              </a>
            </div>
            <RfqForm locale={locale} />
          </div>
        </section>
      ),
    },
  ];
  for (const block of s.customBlocks.filter((b) => b.enabled)) {
    sections.push({
      key: block.id,
      order: block.order,
      node: <TemplateCustomBlock block={block} locale={locale} />,
    });
  }
  return (
    <main className="gb-home">
      {sections
        .sort((a, b) => a.order - b.order)
        .filter(
          (section) =>
            !(section.key in s.visibleSections) ||
            s.visibleSections[section.key as HomeSectionKey],
        )
        .map((section) => (
          <Fragment key={section.key}>{section.node}</Fragment>
        ))}
    </main>
  );
}
