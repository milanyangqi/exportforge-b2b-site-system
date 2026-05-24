import keyproContent from "@/data/keypro-content.json";
import type { Article, ContactChannel, LocaleCode, ProductCategory, SiteNavigationItem, UploadedFile } from "@/types/site";

export const defaultEnabledLocales: LocaleCode[] = [
  "en",
  "zh",
  "th",
  "vi",
  "id",
  "ms",
  "fil",
  "my",
  "km",
  "lo",
  "ar",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "hi",
  "ru",
  "ja",
  "ko",
  "ur"
];

export const defaultNavigation = keyproContent.defaultNavigation as SiteNavigationItem[];

export const uploadedFiles = keyproContent.uploadedFiles as UploadedFile[];

export const productCategories = keyproContent.productCategories as ProductCategory[];

export const articles = keyproContent.articles as Article[];

export const contactChannels: ContactChannel[] = [
  {
    id: "phone",
    type: "phone",
    label: { en: "Phone", zh: "电话", vi: "Điện thoại", th: "โทรศัพท์", id: "Telepon", ar: "الهاتف" },
    value: "+86 188 0000 0000",
    href: "tel:+8618800000000",
    color: "#10b981",
    enabled: true
  },
  {
    id: "whatsapp",
    type: "whatsapp",
    label: { en: "WhatsApp", zh: "WhatsApp", vi: "WhatsApp", th: "WhatsApp", id: "WhatsApp", ar: "واتساب" },
    value: "+86 188 0000 0000",
    href: "https://wa.me/8618800000000",
    color: "#25d366",
    enabled: true
  },
  {
    id: "email",
    type: "email",
    label: { en: "Email", zh: "邮箱", vi: "Email", th: "อีเมล", id: "Email", ar: "البريد" },
    value: "sales@keyprotools.com",
    href: "mailto:sales@keyprotools.com",
    color: "#ff4f66",
    enabled: true
  },
  {
    id: "wechat",
    type: "wechat",
    label: { en: "WeChat", zh: "微信", vi: "WeChat", th: "WeChat", id: "WeChat", ar: "ويتشات" },
    value: "KeyproTools",
    href: "#wechat",
    color: "#23c80d",
    enabled: true,
    qrCodeUrl: "/qr-placeholder"
  },
  {
    id: "linkedin",
    type: "linkedin",
    label: { en: "LinkedIn", zh: "LinkedIn", vi: "LinkedIn", th: "LinkedIn", id: "LinkedIn", ar: "لينكدإن" },
    value: "KeyproTools",
    href: "https://www.linkedin.com/company/keyprotools",
    color: "#0a66c2",
    enabled: false
  },
  {
    id: "zalo",
    type: "zalo",
    label: { en: "Zalo", zh: "Zalo", vi: "Zalo", th: "Zalo", id: "Zalo", ar: "زالو" },
    value: "+84 900 000 000",
    href: "https://zalo.me/84900000000",
    color: "#0068ff",
    enabled: false
  },
  {
    id: "line",
    type: "line",
    label: { en: "Line", zh: "Line", vi: "Line", th: "Line", id: "Line", ar: "لاين" },
    value: "@keyprotools",
    href: "https://line.me/R/ti/p/@keyprotools",
    color: "#06c755",
    enabled: false
  },
  {
    id: "facebook",
    type: "facebook",
    label: { en: "Facebook", zh: "Facebook", vi: "Facebook", th: "Facebook", id: "Facebook", ar: "فيسبوك" },
    value: "KeyproTools",
    href: "https://facebook.com/keyprotools",
    color: "#1877f2",
    enabled: false
  },
  {
    id: "instagram",
    type: "instagram",
    label: { en: "Instagram", zh: "Instagram", vi: "Instagram", th: "Instagram", id: "Instagram", ar: "إنستغرام" },
    value: "@keyprotools",
    href: "https://instagram.com/keyprotools",
    color: "#e4405f",
    enabled: false
  },
  {
    id: "tiktok",
    type: "tiktok",
    label: { en: "TikTok", zh: "TikTok", vi: "TikTok", th: "TikTok", id: "TikTok", ar: "تيك توك" },
    value: "@keyprotools",
    href: "https://www.tiktok.com/@keyprotools",
    color: "#111827",
    enabled: false
  },
  {
    id: "rfq",
    type: "rfq",
    label: { en: "RFQ", zh: "询盘", vi: "Báo giá", th: "ใบเสนอราคา", id: "RFQ", ar: "عرض سعر" },
    value: "Request quote",
    href: "#rfq",
    color: "#243b78",
    enabled: true
  }
];

export const siteSettings = keyproContent.siteSettings;
