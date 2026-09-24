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
  quote: { en: "Get in touch", zh: "联系我们", vi: "Yêu cầu báo giá", th: "ขอใบเสนอราคา", id: "Minta Penawaran", ar: "طلب عرض سعر", es: "Solicitar cotización", fr: "Demander un devis", de: "Angebot anfragen", it: "Richiedi preventivo", pt: "Solicitar orçamento", hi: "कोटेशन मांगें", ru: "Запросить цену", ja: "見積依頼", ko: "견적 요청", ur: "قیمت معلوم کریں" },
  heroKicker: { en: "Handcrafted textiles for home", zh: "融入家居的手工织物" },
  heroTitle: { en: "Handmade for a softer home.", zh: "让手作，温柔融入家。" },
  heroBody: { en: "Explore crochet, knit and woven home textiles inspired by gardens and everyday living.", zh: "以花园与日常生活为灵感，探索钩织、针织与手工织物。" }
} satisfies Record<string, Translation>;
