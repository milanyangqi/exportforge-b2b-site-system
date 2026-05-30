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
  quote: { en: "Send RFQ", zh: "发送询盘", vi: "Gửi RFQ", th: "ส่ง RFQ", id: "Kirim RFQ", ar: "إرسال RFQ", es: "Enviar RFQ", fr: "Envoyer RFQ", de: "RFQ senden", it: "Invia RFQ", pt: "Enviar RFQ", hi: "RFQ भेजें", ru: "Отправить RFQ", ja: "RFQ送信", ko: "RFQ 보내기", ur: "RFQ بھیجیں" },
  heroKicker: { en: "Custom tin box packaging for global buyers", zh: "面向全球买家的定制铁盒包装", vi: "Bao bì hộp thiếc tùy chỉnh cho người mua toàn cầu", th: "บรรจุภัณฑ์กล่องดีบุกสำหรับผู้ซื้อทั่วโลก", id: "Kemasan kaleng khusus untuk pembeli global", ar: "تغليف علب معدنية مخصصة للمشترين العالميين" },
  heroTitle: { en: "Custom tin box packaging for food, gifts, beauty, and lifestyle brands.", zh: "面向食品、礼品、美妆和生活方式品牌的定制铁盒包装。", vi: "Bao bì hộp thiếc tùy chỉnh cho thực phẩm, quà tặng và làm đẹp.", th: "บรรจุภัณฑ์กล่องดีบุกสำหรับอาหาร ของขวัญ และความงาม", id: "Kemasan kaleng khusus untuk makanan, hadiah, dan kecantikan.", ar: "علب معدنية مخصصة للأغذية والهدايا والجمال." },
  heroBody: { en: "Xiyida Packaging manufactures custom tin boxes with structure review, printing, finishing, inspection, and export packing support.", zh: "Xiyida Packaging 提供定制铁盒制造，覆盖结构评审、印刷、表面处理、质检和出口包装支持。", ar: "تصنع Xiyida Packaging علبا معدنية مخصصة مع دعم التصميم والطباعة والفحص والتغليف للتصدير." }
} satisfies Record<string, Translation>;
