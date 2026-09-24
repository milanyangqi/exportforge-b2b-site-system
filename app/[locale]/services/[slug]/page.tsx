/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { LocaleCode } from "@/types/site";

type ServiceSlug = "processes" | "materials" | "gallery" | "quality" | "about";
type Block = { en: string; zh: string };
type Service = { title: Block; eyebrow: Block; intro: Block; image: string; cards: { title: Block; body: Block }[] };
const text = (en: string, zh: string): Block => ({ en, zh });
const pages: Record<ServiceSlug, Service> = {
  processes: {
    title: text("A practical route from drawing to part.", "从图纸到零件的合作路径。"),
    eyebrow: text("Processes", "工艺介绍"),
    intro: text("Different geometries call for different decisions. Share the model and intended use so we can discuss a suitable manufacturing route before quoting.", "不同结构需要不同方案。请提供模型与用途，以便报价前讨论合适的加工路径。"),
    image: "process.webp",
    cards: [
      { title: text("Review the geometry", "评估结构"), body: text("We start with the shape, critical features and intended use you provide.", "先了解您提供的结构、关键特征与实际用途。") },
      { title: text("Discuss options", "沟通选项"), body: text("Material, finish and process are discussed against your requirements.", "根据要求讨论材料、表面与工艺。") },
      { title: text("Confirm before production", "生产前确认"), body: text("A quotation should reflect the agreed part and delivery requirements.", "报价应基于确认后的零件与交付要求。") }
    ]
  },
  materials: {
    title: text("Start with what the part needs to do.", "从零件用途选择材料。"), eyebrow: text("Materials", "材料选择"),
    intro: text("Strength, appearance, temperature, flexibility and budget all affect material selection. Share your requirements and we will confirm available options during review.", "强度、外观、温度、柔韧性及预算都会影响材料选择。请说明需求，具体可选材料在评估时确认。"), image: "materials.webp",
    cards: [
      { title: text("Functional needs", "功能要求"), body: text("Tell us about loads, fit, environment and expected use.", "请说明受力、装配、使用环境和用途。") },
      { title: text("Visual finish", "外观要求"), body: text("State your preferred color, texture and visible-surface needs.", "请说明颜色、纹理和可见表面要求。") },
      { title: text("Available options", "可选方案"), body: text("Specific material and finish availability is confirmed during quotation.", "具体材料和表面选项以报价确认。") }
    ]
  },
  gallery: {
    title: text("Forms that start a useful conversation.", "从结构示意开始沟通。"), eyebrow: text("Part gallery", "零件图库"),
    intro: text("The images here illustrate possible part geometries. They are concept visuals, not documented customer projects or proof of specific material capability.", "本页图片用于展示可能的零件结构，属于概念视觉，并非已交付客户案例或特定材料能力证明。"), image: "parts.webp",
    cards: [
      { title: text("Lightweight structures", "轻量化结构"), body: text("Describe where weight, stiffness and mounting points matter.", "说明重量、刚性和安装点要求。") },
      { title: text("Functional housings", "功能外壳"), body: text("Include mating parts, holes and surface requirements.", "请提供配合件、孔位与表面要求。") },
      { title: text("Complex geometry", "复杂结构"), body: text("Send CAD data so feasibility can be reviewed against the actual model.", "提交 CAD 文件，以实际模型评估可制造性。") }
    ]
  },
  quality: {
    title: text("Clear requirements make better reviews.", "明确要求，便于逐项核对。"), eyebrow: text("Quality approach", "质量流程"),
    intro: text("Add critical dimensions, tolerances, fit, finish and inspection requests when you submit a drawing. We can then discuss what is feasible and what needs clarification.", "提交图纸时注明关键尺寸、公差、装配、表面与检验要求，便于讨论可行性及待确认事项。"), image: "process.webp",
    cards: [
      { title: text("Drawing review", "图纸审核"), body: text("Identify the dimensions and features that are important to your application.", "标明对应用重要的尺寸与结构。") },
      { title: text("Requirement confirmation", "要求确认"), body: text("Clarify finish, tolerance and any requested inspection method.", "确认表面、公差及所需检验方式。") },
      { title: text("Quotation scope", "报价范围"), body: text("Keep the quoted scope aligned with the agreed requirements.", "确保报价范围与已确认要求一致。") }
    ]
  },
  about: {
    title: text("Curious about what you want to make.", "从好奇心出发，理解您的设计。"), eyebrow: text("About CuriousMake", "关于 CuriousMake"),
    intro: text("CuriousMake is presented here as a custom 3D printing inquiry service for overseas buyers. Share your design goals and we will discuss the next step together.", "CuriousMake 在此提供面向海外客户的定制 3D 打印询价入口。请说明设计目标，我们将沟通下一步。"), image: "hero.webp",
    cards: [
      { title: text("Drawing-led", "以图纸为起点"), body: text("The request starts with your model and intended use.", "从您的模型与用途开始沟通。") },
      { title: text("Requirement-focused", "关注要求"), body: text("Material, quantity and delivery context guide the discussion.", "材料、数量与交付背景帮助明确方案。") },
      { title: text("Human review", "人工审核"), body: text("Questions can be clarified before a quotation is prepared.", "报价前可先澄清待确认的问题。") }
    ]
  }
};
function getPage(slug: string) { return Object.hasOwn(pages, slug) ? pages[slug as ServiceSlug] : null; }
export async function generateMetadata({ params }: { params: Promise<{ locale: LocaleCode; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params; const page = getPage(slug); if (!page) return {};
  const language = locale === "zh" ? "zh" : "en";
  return { title: `${page.eyebrow[language]} | CuriousMake`, description: page.intro[language] };
}
export default async function ServicePage({ params }: { params: Promise<{ locale: LocaleCode; slug: string }> }) {
  const { locale, slug } = await params; const page = getPage(slug); if (!page) notFound();
  const language = locale === "zh" ? "zh" : "en";
  return <main className="cm-service">
    <section className="cm-service-hero"><div><p className="cm-kicker">{page.eyebrow[language]}</p><h1>{page.title[language]}</h1><p>{page.intro[language]}</p><a className="cm-button primary" href={`/${locale}/contact#rfq`}>{language === "zh" ? "上传图纸获取报价" : "Upload CAD & Request a Quote"}</a></div><figure><img src={`/assets/current-template/${page.image}`} alt="" /><figcaption>{language === "zh" ? "概念示意图；实际工艺与材料以询价确认为准。" : "Concept image; process and material availability are confirmed during quotation."}</figcaption></figure></section>
    <div className="cm-service-grid">{page.cards.map((card) => <article key={card.title.en}><h2>{card.title[language]}</h2><p>{card.body[language]}</p></article>)}</div>
    <section className="cm-service-cta"><h2>{language === "zh" ? "准备好讨论您的零件了吗？" : "Ready to discuss your part?"}</h2><a className="cm-button primary" href={`/${locale}/contact#rfq`}>{language === "zh" ? "提交询价" : "Request a Quote"}</a></section>
  </main>;
}
