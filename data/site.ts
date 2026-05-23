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

export const defaultNavigation: SiteNavigationItem[] = [
  {
    id: "nav-products",
    label: {
      en: "Products",
      zh: "产品",
      vi: "Sản phẩm",
      th: "สินค้า",
      id: "Produk",
      ar: "المنتجات",
      es: "Productos",
      fr: "Produits",
      de: "Produkte",
      it: "Prodotti",
      pt: "Produtos",
      hi: "उत्पाद",
      ru: "Продукты",
      ja: "製品",
      ko: "제품",
      ur: "مصنوعات"
    },
    href: "/products",
    enabled: true,
    order: 10
  },
  {
    id: "nav-articles",
    label: {
      en: "Articles",
      zh: "文章",
      vi: "Bài viết",
      th: "บทความ",
      id: "Artikel",
      ar: "المقالات",
      es: "Artículos",
      fr: "Articles",
      de: "Artikel",
      it: "Articoli",
      pt: "Artigos",
      hi: "लेख",
      ru: "Статьи",
      ja: "記事",
      ko: "글",
      ur: "مضامین"
    },
    href: "/articles",
    enabled: true,
    order: 20
  },
  {
    id: "nav-files",
    label: {
      en: "Files",
      zh: "资料下载",
      vi: "Tệp",
      th: "ไฟล์",
      id: "File",
      ar: "الملفات",
      es: "Archivos",
      fr: "Fichiers",
      de: "Dateien",
      it: "File",
      pt: "Arquivos",
      hi: "फाइलें",
      ru: "Файлы",
      ja: "資料",
      ko: "자료",
      ur: "فائلیں"
    },
    href: "/files",
    enabled: true,
    order: 25
  },
  {
    id: "nav-contact",
    label: {
      en: "Contact",
      zh: "联系",
      vi: "Liên hệ",
      th: "ติดต่อ",
      id: "Kontak",
      ar: "تواصل",
      es: "Contacto",
      fr: "Contact",
      de: "Kontakt",
      it: "Contatto",
      pt: "Contato",
      hi: "संपर्क",
      ru: "Контакты",
      ja: "お問い合わせ",
      ko: "문의",
      ur: "رابطہ"
    },
    href: "/contact",
    enabled: true,
    order: 30
  }
];

export const uploadedFiles: UploadedFile[] = [];

export const productCategories: ProductCategory[] = [
  {
    id: "product-carbide-end-mills",
    slug: "carbide-end-mills",
    name: { en: "Carbide End Mills", zh: "硬质合金铣刀", vi: "Dao phay carbide", th: "ดอกเอ็นมิลคาร์ไบด์", id: "End mill carbide", ar: "قواطع كربيد" },
    summary: {
      en: "Square, ball nose, corner radius, roughing, high-feed, long-neck, and micro cutters for global distributors.",
      zh: "覆盖平底、球头、圆鼻、粗加工、高进给、长颈和微径刀具，适合海外经销商选型。",
      ar: "قواطع متنوعة للموزعين العالميين تشمل النهايات المسطحة والكروية والدقيقة."
    },
    applications: { en: ["Steel", "Stainless", "Aluminum", "Graphite"], zh: ["钢件", "不锈钢", "铝合金", "石墨"], ar: ["الفولاذ", "الألومنيوم", "الجرافيت"] },
    specs: ["2F-6F", "0.2-20mm", "AlTiN / DLC / TiSiN", "OEM laser marking"],
    themeFit: ["industrial", "equipment", "clean-export"]
  },
  {
    id: "product-drill-bits",
    slug: "drill-bits",
    name: { en: "Drill Bits", zh: "钻头", vi: "Mũi khoan", th: "ดอกสว่าน", id: "Mata bor", ar: "لقم الثقب" },
    summary: {
      en: "Stub, jobber, long series, center, step, and coolant-through drills for export catalog programs.",
      zh: "短钻、直柄钻、长刃钻、中心钻、阶梯钻和内冷钻，适合目录化出口。",
      ar: "لقم حفر قياسية وطويلة ومركزية ومتدرجة للتوريد والتصدير."
    },
    applications: { en: ["Automotive", "Mold", "Fixture", "Batch machining"] },
    specs: ["HSS / Carbide", "DIN / ANSI", "Coolant-through", "Private label tubes"],
    themeFit: ["industrial", "clean-export"]
  },
  {
    id: "product-custom-tooling",
    slug: "custom-tooling",
    name: { en: "Custom Tooling", zh: "定制刀具", vi: "Dụng cụ tùy chỉnh", th: "เครื่องมือตามแบบ", id: "Perkakas kustom", ar: "أدوات مخصصة" },
    summary: {
      en: "Drawing-based dimensions, custom geometry, private-label packaging, and buyer-specific quote workflows.",
      zh: "支持图纸定制、特殊几何、私标包装和针对买家的报价流程。",
      ar: "تصنيع حسب الرسم والهندسة المطلوبة مع تغليف خاص وعروض أسعار مخصصة."
    },
    applications: { en: ["OEM", "Distributor brand", "Special material", "Replacement project"] },
    specs: ["Drawing upload ready", "MOQ rules", "QC report package", "FOB / EXW / DDP"],
    themeFit: ["industrial", "premium-brand", "equipment"]
  }
];

export const articles: Article[] = [
  {
    id: "article-export-catalog",
    slug: "how-to-build-export-product-catalog",
    title: { en: "How to structure an export product catalog for RFQ conversion", zh: "如何设计更容易获得询盘的外贸产品目录", ar: "كيفية تنظيم كتالوج تصدير يجلب طلبات أسعار" },
    excerpt: { en: "A practical guide to categories, specs, applications, and trust signals.", zh: "围绕品类、规格、应用和信任内容的实用指南。", ar: "دليل عملي للفئات والمواصفات والتطبيقات وعناصر الثقة." },
    body: { en: "Use clear categories, specification tables, application guidance, and RFQ calls to action.", zh: "用清晰分类、规格表、应用建议和询盘入口组织外贸产品目录。" },
    category: "buying-guide",
    status: "published",
    featuredOnHome: true,
    publishedAt: new Date().toISOString()
  },
  {
    id: "article-sea-localization",
    slug: "southeast-asia-localization-checklist",
    title: { en: "Southeast Asia localization checklist for industrial exporters", zh: "工业品出口东南亚本地化检查清单", ar: "قائمة تحقق للتوطين في جنوب شرق آسيا" },
    excerpt: { en: "Language, WhatsApp habits, market proof, quotation response time, and distributor trust.", zh: "覆盖语言、WhatsApp沟通、市场背书、报价速度和经销商信任。", ar: "اللغة وقنوات التواصل وسرعة العرض والثقة لدى الموزعين." },
    body: { en: "Local language pages, instant contact, and proof of export capability matter across Southeast Asia.", zh: "本地语言页面、即时联系入口和出口能力背书会明显影响东南亚买家信任。" },
    category: "seo",
    status: "published",
    featuredOnHome: true,
    publishedAt: new Date().toISOString()
  }
];

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
    value: "sales@example.com",
    href: "mailto:sales@example.com",
    color: "#ff4f66",
    enabled: true
  },
  {
    id: "wechat",
    type: "wechat",
    label: { en: "WeChat", zh: "微信", vi: "WeChat", th: "WeChat", id: "WeChat", ar: "ويتشات" },
    value: "ExportFactory",
    href: "#wechat",
    color: "#23c80d",
    enabled: true,
    qrCodeUrl: "/qr-placeholder"
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
    value: "@exportforge",
    href: "https://line.me/R/ti/p/@exportforge",
    color: "#06c755",
    enabled: false
  },
  {
    id: "facebook",
    type: "facebook",
    label: { en: "Facebook", zh: "Facebook", vi: "Facebook", th: "Facebook", id: "Facebook", ar: "فيسبوك" },
    value: "ExportForge",
    href: "https://facebook.com/exportforge",
    color: "#1877f2",
    enabled: false
  },
  {
    id: "instagram",
    type: "instagram",
    label: { en: "Instagram", zh: "Instagram", vi: "Instagram", th: "Instagram", id: "Instagram", ar: "إنستغرام" },
    value: "@exportforge",
    href: "https://instagram.com/exportforge",
    color: "#e4405f",
    enabled: false
  },
  {
    id: "tiktok",
    type: "tiktok",
    label: { en: "TikTok", zh: "TikTok", vi: "TikTok", th: "TikTok", id: "TikTok", ar: "تيك توك" },
    value: "@exportforge",
    href: "https://www.tiktok.com/@exportforge",
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

export const siteSettings = {
  brand: "ExportForge",
  activeTheme: "industrial",
  markets: ["North America", "Europe", "Southeast Asia", "MENA"],
  aiDraftPolicy: "AI content is always saved as draft and requires human review before publishing."
};
