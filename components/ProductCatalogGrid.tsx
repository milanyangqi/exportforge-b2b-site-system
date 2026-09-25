"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { CatalogCard } from "@/lib/product-catalog";
import type { LocaleCode } from "@/types/site";

export function ProductCatalogGrid({ cards, locale, filterable = false }: { cards: CatalogCard[]; locale: LocaleCode; filterable?: boolean }) {
  const [category, setCategory] = useState("");
  const categories = Array.from(new Map(cards.map(card => [card.category, card.categoryLabel])));
  const visible = category ? cards.filter(card => card.category === category) : cards;
  const zh = locale === "zh";
  return (
    <>
      {filterable ? <div className="catalog-filters" role="group" aria-label={zh ? "产品分类筛选" : "Filter products by category"}>
        <button type="button" aria-pressed={!category} onClick={() => setCategory("")}>{zh ? "全部产品" : "All products"} ({cards.length})</button>
        {categories.map(([slug, label]) => <button type="button" key={slug} aria-pressed={category === slug} onClick={() => setCategory(slug)}>{label}</button>)}
      </div> : null}
      <p className="catalog-count" aria-live="polite">{visible.length} {zh ? "款产品" : "products"}</p>
      <div className="catalog-grid">
        {visible.map(card => <a className="catalog-card" href={`/${locale}/articles/${card.slug}`} key={card.id}>
          <div className="catalog-card-image">
            {card.imageUrl ? <img src={card.imageUrl} alt={card.title} loading="lazy" decoding="async" /> : <span>{zh ? "图片待添加" : "Image coming soon"}</span>}
          </div>
          <div className="catalog-card-copy"><span className="catalog-category">{card.categoryLabel}</span><h3>{card.title}</h3><p>{card.excerpt}</p><span className="catalog-details">{zh ? "查看产品" : "View product"} →</span></div>
        </a>)}
      </div>
      {!visible.length ? <p>{zh ? "此分类暂无已发布产品，可通过下方表单咨询定制方案。" : "No products are published in this category yet. Contact us below for a custom solution."}</p> : null}
    </>
  );
}
