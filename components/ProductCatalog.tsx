"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { t } from "@/lib/i18n";
import type { LocaleCode, ProductCategory } from "@/types/site";
const types: Record<string, { en: string; zh: string }> = {"hair-bow":{en:"Hair bows",zh:"蝴蝶结"},"hair-clip":{en:"Hair clips",zh:"发夹"},"claw-clip":{en:"Claw clips",zh:"抓夹"},"scrunchie":{en:"Scrunchies",zh:"发圈"},"hair-pin":{en:"Hair pins",zh:"发簪"}};
export function ProductCatalog({ products, locale, initialCategory = "" }: { products: ProductCategory[]; locale: LocaleCode; initialCategory?: string }) {
  const zh = locale === "zh";
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const collections = products.filter((item) => item.kind === "collection" && item.status === "published");
  const found = products.filter((item) => item.kind === "product" && item.status === "published" && (!category || item.categorySlugs?.includes(category)) && `${item.name.en} ${item.name.zh}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <section className="dawn-catalog"><div className="dawn-catalog-controls"><label>{zh ? "产品系列" : "Collection"}<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">{zh ? "全部系列" : "All collections"}</option>{collections.map((item) => <option value={item.slug} key={item.slug}>{t(item.name, locale)}</option>)}</select></label><label>{zh ? "搜索发饰" : "Search accessories"}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={zh ? "例如：珍珠发夹" : "e.g. pearl barrette"} /></label></div><p className="dawn-result-count" aria-live="polite">{found.length} {zh ? "项产品" : "products"}</p><div className="dawn-catalog-grid">{found.map((item) => <a className="dawn-catalog-card" href={`/${locale}/products/${item.slug}`} key={item.slug}><img src={item.thumbnailUrl || item.imageUrl} alt={t(item.name, locale)} loading="lazy"/><small>{types[item.productType || ""]?.[zh ? "zh" : "en"] || (zh ? "发饰" : "Hair accessories")}</small><h2>{t(item.name, locale)}</h2><span>{zh ? "查看详情" : "Explore details"} ↗</span></a>)}</div>{found.length === 0 ? <p>{zh ? "未找到匹配产品。" : "No matching products found."}</p> : null}</section>;
}
export function ProductGallery({ product, locale }: { product: ProductCategory; locale: LocaleCode }) {
  const images = [product.imageUrl, ...(product.gallery || []).map((item) => item.url)].filter(Boolean) as string[];
  const [active, setActive] = useState(0);
  return <div className="dawn-gallery"><img className="dawn-gallery-main" src={images[active]} alt={t(product.name, locale)} />{images.length > 1 ? <div className="dawn-gallery-thumbs">{images.map((url, index) => <button type="button" key={url} aria-label={`${locale === "zh" ? "产品图" : "Product image"} ${index+1}`} aria-pressed={index===active} onClick={() => setActive(index)}><img src={url} alt="" /></button>)}</div> : null}</div>;
}
