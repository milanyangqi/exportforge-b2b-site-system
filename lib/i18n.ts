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
  heroKicker: { en: "Configurable export site system", zh: "可定制外贸独立站系统", vi: "Hệ thống website xuất khẩu", th: "ระบบเว็บไซต์ส่งออก", id: "Sistem situs ekspor", ar: "نظام مواقع التصدير" },
  heroTitle: { en: "Launch multilingual B2B sites for factories, brands, and exporters.", zh: "为工厂、品牌和外贸团队快速上线多语言 B2B 独立站。", vi: "Ra mắt website B2B đa ngôn ngữ cho nhà máy và nhà xuất khẩu.", th: "เปิดตัวเว็บไซต์ B2B หลายภาษาสำหรับผู้ส่งออก", id: "Luncurkan situs B2B multibahasa untuk eksportir.", ar: "أطلق مواقع B2B متعددة اللغات للمصانع والمصدرين." },
  heroBody: { en: "Products, SEO content, RFQ leads, social contact channels, user permissions, themes, and AI content workflows are separated into reusable modules for future custom development.", zh: "产品、SEO内容、询盘、社交联系、多用户权限、主题和 AI 内容流程全部模块化，方便后续按客户二次开发。", ar: "المنتجات والمحتوى وطلبات الأسعار وقنوات التواصل والصلاحيات والقوالب وسير عمل الذكاء الاصطناعي مبنية كوحدات قابلة للتخصيص." }
} satisfies Record<string, Translation>;
