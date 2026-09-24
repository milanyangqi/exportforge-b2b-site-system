/* eslint-disable @next/next/no-img-element */
import { HomeNavigationShell } from "@/components/PublicSiteShell";
import { RfqForm } from "@/components/RfqForm";
import { t } from "@/lib/i18n";
import type { AdminState, LocaleCode } from "@/types/site";

const asset = "/assets/current-template/";

export function ActiveTemplate({ locale, state }: { locale: LocaleCode; state: AdminState }) {
  const zh = locale === "zh";
  const copy = (en: string, cn: string) => zh ? cn : en;
  const quoteHref = `/${locale}/contact#rfq`;
  const guide = [
    { number: "01", title: copy("Send your drawing", "发送图纸"), body: copy("Share a CAD file or describe the part you need.", "上传 CAD 文件，或描述您需要的零件。") },
    { number: "02", title: copy("Specify requirements", "说明要求"), body: copy("Include quantity, material preference, finish and destination.", "填写数量、材料偏好、表面要求和目的地。") },
    { number: "03", title: copy("Review together", "共同确认"), body: copy("We review the request and discuss feasible options before quoting.", "我们先审核需求，再沟通可行方案与报价。") }
  ];
  const cards = [
    { label: copy("Processes", "工艺介绍"), title: copy("Choose a route that fits the part.", "选择适合零件的加工路径。"), image: "process.webp", href: `/${locale}/services/processes` },
    { label: copy("Materials", "材料选择"), title: copy("Discuss function, finish and fit.", "从用途、外观与配合要求出发。"), image: "materials.webp", href: `/${locale}/services/materials` },
    { label: copy("Part Gallery", "零件图库"), title: copy("Explore forms before sending CAD.", "先看结构，再提交图纸。"), image: "parts.webp", href: `/${locale}/services/gallery` }
  ];

  return (
    <main className="cm-site">
      <HomeNavigationShell
        brandName={state.siteSettings.title}
        ctaLabel={t(state.templateSettings.primaryCtaLabel, locale)}
        enabledLocales={state.enabledLocales}
        locale={locale}
        navigation={state.navigation}
      />
      <section className="cm-hero">
        <div className="cm-hero-copy">
          <p className="cm-kicker">{t(state.templateSettings.heroKicker, locale)}</p>
          <h1>{t(state.templateSettings.heroTitle, locale)}</h1>
          <p className="cm-lead">{t(state.templateSettings.heroBody, locale)}</p>
          <div className="cm-actions">
            <a className="cm-button primary" href="#rfq">{t(state.templateSettings.primaryCtaLabel, locale)}</a>
            <a className="cm-button outline" href={`/${locale}/services/gallery`}>{copy("Explore sample parts", "查看零件示意")}</a>
          </div>
          <p className="cm-hero-note">{copy("Your drawing stays private within the quotation workflow.", "图纸仅用于本次询价流程。")}</p>
        </div>
        <figure className="cm-hero-art"><img src={`${asset}hero.webp`} alt={copy("Illustrative 3D printed metal bracket", "3D 打印金属支架示意图")} /><figcaption>{copy("Concept imagery; confirm actual process and material when requesting a quote.", "图片为概念示意；实际工艺与材料以询价确认为准。")}</figcaption></figure>
      </section>
      <div className="cm-proof-strip">
        <span>{copy("CAD-based requests", "来图加工")}</span><span>{copy("Material discussion", "材料沟通")}</span><span>{copy("Custom parts", "定制零件")}</span><span>{copy("Export inquiries", "海外询盘")}</span>
      </div>
      <section className="cm-section cm-path" id="process">
        <div className="cm-heading"><p className="cm-kicker">{copy("How it works", "合作流程")}</p><h2>{copy("From your CAD file to a clear quotation.", "从图纸到清晰报价。")}</h2><p>{copy("A simple path for engineers and purchasing teams ordering custom 3D printed parts.", "为海外工程师与采购团队准备的定制零件询价路径。")}</p></div>
        <div className="cm-steps">{guide.map((step) => <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div>
      </section>
      <section className="cm-section cm-capabilities">
        <div className="cm-heading"><p className="cm-kicker">{copy("Explore", "了解服务")}</p><h2>{copy("The details behind a better part.", "从需求细节理解零件。")}</h2></div>
        <div className="cm-card-grid">{cards.map((card) => <a className="cm-image-card" href={card.href} key={card.label}><img src={`${asset}${card.image}`} alt="" loading="lazy" /><div><span>{card.label}</span><h3>{card.title}</h3><b aria-hidden="true">↗</b></div></a>)}</div>
      </section>
      <section className="cm-quality-band">
        <img src={`${asset}process.webp`} alt="" loading="lazy" />
        <div><p className="cm-kicker">{copy("Quality approach", "质量流程")}</p><h2>{copy("Requirements first. Review at every step.", "先明确要求，再逐步核对。")}</h2><p>{copy("Share critical dimensions, fit, finish and inspection needs with your drawing so they can be addressed during review.", "提交图纸时说明关键尺寸、装配、公差、表面与检验要求，便于评估。")}</p><a className="cm-text-link" href={`/${locale}/services/quality`}>{copy("See our review approach", "查看需求审核流程")} →</a></div>
      </section>
      <section className="cm-section cm-gallery">
        <div className="cm-heading"><p className="cm-kicker">{copy("Sample forms", "结构示意")}</p><h2>{copy("Different geometries. One place to start.", "不同结构，从这里开始。")}</h2><p>{copy("These are concept visuals. Actual capability and material selection are confirmed against your drawing.", "以下为概念示意；实际工艺和材料以图纸评估为准。")}</p></div>
        <div className="cm-sample-grid">{state.products.slice(0, 3).map((part) => <a href={`/${locale}/products/${part.slug}`} key={part.slug}><img src={part.imageUrl} alt={t(part.name, locale)} loading="lazy" /><span>{t(part.name, locale)} ↗</span></a>)}</div>
      </section>
      <section className="cm-section cm-quote" id="rfq">
        <div className="cm-quote-copy"><p className="cm-kicker">{copy("Custom quote", "定制询价")}</p><h2>{copy("Upload your CAD. Tell us what matters.", "上传图纸，说明关键要求。")}</h2><p>{copy("Add your drawing, target quantity, preferred material, destination and timing. We will review the details you provide before responding.", "请提供图纸、目标数量、材料偏好、目的地与交期要求，我们将据此审核需求。")}</p><ul><li>{copy("CAD drawing or clear requirements", "CAD 图纸或明确的零件需求")}</li><li>{copy("Quantity and material preference", "数量及材料偏好")}</li><li>{copy("Finish, tolerance and destination", "表面、公差和交付目的地")}</li></ul><a className="cm-text-link" href={quoteHref}>{copy("Open full quote page", "打开完整询价页")} →</a></div>
        <div className="cm-form-panel"><RfqForm locale={locale} /></div>
      </section>
    </main>
  );
}
