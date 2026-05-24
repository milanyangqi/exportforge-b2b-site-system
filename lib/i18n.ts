import { defaultLocale, getLocaleMeta, isLocale } from "@/config/locales";
import type { LocaleCode, Translation } from "@/types/site";

export function normalizeLocale(locale?: string): LocaleCode {
  return locale && isLocale(locale) ? locale : defaultLocale;
}

export function t<T>(value: Translation<T>, locale: LocaleCode): T {
  return value[locale] ?? value.en;
}

export function isRtl(locale: LocaleCode) {
  return getLocaleMeta(locale).dir === "rtl";
}

export const ui = {
  navProducts: { en: "Products", zh: "产品", vi: "Sản phẩm", th: "สินค้า", id: "Produk", ar: "المنتجات", es: "Productos", fr: "Produits", de: "Produkte", it: "Prodotti", pt: "Produtos", hi: "उत्पाद", ru: "Продукты", ja: "製品", ko: "제품", ur: "مصنوعات" },
  navArticles: { en: "Articles", zh: "文章", vi: "Bài viết", th: "บทความ", id: "Artikel", ar: "المقالات", es: "Artículos", fr: "Articles", de: "Artikel", it: "Articoli", pt: "Artigos", hi: "लेख", ru: "Статьи", ja: "記事", ko: "글", ur: "مضامین" },
  navContact: { en: "Contact", zh: "联系", vi: "Liên hệ", th: "ติดต่อ", id: "Kontak", ar: "تواصل", es: "Contacto", fr: "Contact", de: "Kontakt", it: "Contatto", pt: "Contato", hi: "संपर्क", ru: "Контакты", ja: "お問い合わせ", ko: "문의", ur: "رابطہ" },
  navAdmin: { en: "Admin", zh: "后台", vi: "Quản trị", th: "ผู้ดูแล", id: "Admin", ar: "الإدارة", es: "Admin", fr: "Admin", de: "Admin", it: "Admin", pt: "Admin", hi: "Admin", ru: "Admin", ja: "Admin", ko: "Admin", ur: "Admin" },
  quote: { en: "Request Quote", zh: "获取报价", vi: "Yêu cầu báo giá", th: "ขอใบเสนอราคา", id: "Minta Penawaran", ar: "طلب عرض سعر", es: "Solicitar cotización", fr: "Demander un devis", de: "Angebot anfragen", it: "Richiedi preventivo", pt: "Solicitar orçamento", hi: "कोटेशन मांगें", ru: "Запросить цену", ja: "見積依頼", ko: "견적 요청", ur: "قیمت معلوم کریں" },
  heroKicker: { en: "CNC cutting tools for global buyers", zh: "面向全球买家的 CNC 刀具供应", vi: "Dụng cụ cắt CNC cho khách hàng toàn cầu", th: "เครื่องมือตัด CNC สำหรับผู้ซื้อทั่วโลก", id: "Alat potong CNC untuk pembeli global", ar: "أدوات قطع CNC للمشترين العالميين" },
  heroTitle: { en: "Carbide end mills and drill bits ready for distributor programs.", zh: "面向经销商长期备货的硬质合金铣刀与钻头。", vi: "Dao phay carbide và mũi khoan cho chương trình phân phối.", th: "ดอกเอ็นมิลคาร์ไบด์และดอกสว่านสำหรับผู้จัดจำหน่าย", id: "End mill carbide dan mata bor untuk distributor.", ar: "قواطع كربيد ولقم ثقب جاهزة للموزعين." },
  heroBody: { en: "KeyproTools supplies end mills, drill bits, custom tooling, coating options, private-label packing, and export-ready QC support for hardware and machining buyers.", zh: "KeyproTools 提供铣刀、钻头、定制刀具、涂层方案、私标包装和出口质检支持，服务五金工具与机加工采购商。", ar: "توفر KeyproTools قواطع التفريز ولقم الثقب والأدوات المخصصة والتغليف الخاص ودعم الفحص للتصدير." }
} satisfies Record<string, Translation>;
