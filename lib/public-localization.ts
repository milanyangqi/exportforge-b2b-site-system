import type { LocaleCode, ProductCategory } from "@/types/site";
import { t } from "@/lib/i18n";

const zh: Record<string, string> = {
  "Product category": "产品分类", "Applications": "应用场景", "Page": "页面",
  "Food-contact lining": "食品接触内涂层", "Round / square / rectangular": "圆形 / 方形 / 长方形",
  "Embossed lid": "压凸盒盖", "Inner tray option": "可选内托", "Export carton packing": "出口纸箱包装",
  "Heart / round / hinged": "心形 / 圆形 / 铰链式", "Spot color printing": "专色印刷", "Embossing": "压凸工艺",
  "Ribbon and insert support": "可配丝带与内托", "Shelf-ready finish": "适合零售陈列的表面处理",
  "Small round tins": "小型圆罐", "Matte / gloss finish": "哑光 / 亮光表面", "Soft-touch look": "柔感外观",
  "Inner coating option": "可选内涂层", "Batch color matching": "批次配色",
  "Round / square tins": "圆形 / 方形铁罐", "Slip lid / plug lid": "套盖 / 嵌入式盖", "Aroma protection design": "保香结构设计",
  "Foil bag compatibility": "可搭配铝箔袋", "Label or direct print": "标签或直接印刷",
  "Round candle tins": "圆形蜡烛罐", "Friction lid": "扣合式盖", "Matte / metallic finish": "哑光 / 金属质感表面",
  "Heat-aware structure review": "耐热结构评审", "Color series support": "支持系列配色",
  "Structure review": "结构评审", "Mold development": "模具开发", "CMYK / spot color print": "四色 / 专色印刷",
  "Emboss / deboss": "压凸 / 压凹", "QC and export packing": "质检与出口包装",
  "Products": "产品", "Articles": "文章", "Contact": "联系我们", "RFQ details": "询盘详情",
  "Tell us what to review.": "请告诉我们您的需求。", "Need project support?": "需要项目支持？",
  "Turn this article into a clear RFQ.": "根据产品信息提交具体询盘。", "Request category review": "咨询此类产品",
  "Send quantity, requirements, packaging, and destination.": "请提供数量、具体要求、包装方式及目的地。",
  "Wuhu Xiyida Packaging Co., Ltd.": "芜湖喜意达包装有限公司"
};

export function publicText(value: string, locale: LocaleCode) {
  return locale === "zh" ? zh[value] ?? value : value;
}

export function categoryLabel(value: string, products: ProductCategory[], locale: LocaleCode) {
  const product = products.find(item => item.slug === value || item.id === value);
  if (product) return t(product.name, locale);
  return locale === "zh" && /^[a-z][a-z\s-]*$/i.test(value) ? "包装知识" : value;
}

export function isDownloadPage(href: string) {
  try {
    const url = new URL(href, "https://xiyidapackaging.com");
    if (!["xiyidapackaging.com", "www.xiyidapackaging.com", "xiyida-packaging-site.437991663.workers.dev"].includes(url.hostname)) return false;
    return /^\/(?:[a-z]{2}\/)?files\/?$/.test(url.pathname);
  } catch { return false; }
}
