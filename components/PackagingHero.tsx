/* eslint-disable @next/next/no-img-element */
import { ArrowUpRight } from "lucide-react";

export function PackagingHero({ title, body, eyebrow, imageUrl, primaryLabel, primaryHref, secondaryLabel, secondaryHref, locale }: {
  title: string; body: string; eyebrow: string; imageUrl: string;
  primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string; locale: string;
}) {
  const zh = locale === "zh";
  return <section className="packaging-hero">
    <div className="packaging-hero-copy">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{body}</p>
      <div className="hero-actions">
        {primaryLabel ? <a className="button primary" href={primaryHref}>{primaryLabel}<ArrowUpRight size={18} /></a> : null}
        {secondaryLabel ? <a className="packaging-text-link" href={secondaryHref}>{secondaryLabel}<span aria-hidden="true">→</span></a> : null}
      </div>
      <div className="packaging-hero-services">
        <span>{zh ? "定制盒型" : "Custom shapes"}</span><span>{zh ? "印刷与表面工艺" : "Print & finish"}</span><span>{zh ? "出口包装支持" : "Export packing"}</span>
      </div>
    </div>
    {imageUrl ? <div className="packaging-hero-visual">
      <img src={imageUrl} alt={zh ? "食品、礼品与生活方式铁盒包装" : "Tin packaging for food, gifts and lifestyle products"} width="1000" height="1000" fetchPriority="high" />
      <div className="packaging-hero-caption"><span>{zh ? "为您的品牌定制" : "Made for your brand"}</span><strong>{zh ? "从细节开始，让包装更出色。" : "A better package starts with the details."}</strong></div>
    </div> : null}
  </section>;
}
