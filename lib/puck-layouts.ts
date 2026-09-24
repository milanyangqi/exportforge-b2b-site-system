import type {
  AdminState,
  Article,
  HomeSectionKey,
  PageLayoutKey,
  SitePage,
  SitePageLayout,
  SiteTemplateCustomBlock,
  SiteTemplateSettings,
  Translation,
  UploadedFile,
  VisualPageLayoutData
} from "@/types/site";

type SystemPageLayoutKey = Exclude<PageLayoutKey, `page:${string}`>;

const baseLayoutLabels: Record<SystemPageLayoutKey, string> = {
  home: "首页",
  "products-index": "产品列表页",
  "product-detail": "产品详情页",
  "articles-index": "文章列表页",
  "article-detail": "文章详情页",
  "files-index": "资料下载页",
  contact: "联系页"
};

const coreSectionLabels: Record<HomeSectionKey, string> = {
  navigation: "首页导航",
  hero: "首页首屏",
  products: "产品列表",
  factory: "工厂能力",
  markets: "市场与 RFQ 清单",
  articles: "文章列表",
  rfq: "询盘表单"
};

function isSystemLayoutKey(key: PageLayoutKey): key is SystemPageLayoutKey {
  return !key.startsWith("page:");
}

function asPuckData(content: VisualPageLayoutData["content"]): VisualPageLayoutData {
  return {
    root: { props: { title: "" } },
    content,
    zones: {}
  };
}

function text(value: Translation | undefined, fallback = "") {
  return value?.en || value?.zh || fallback;
}

function templateText(settings: SiteTemplateSettings, key: string, fallback = "") {
  return text(settings.textBlocks[key], fallback);
}

function createId(prefix: string, index: number) {
  return `${prefix}-${index + 1}`;
}

function coreHomeComponents(settings: SiteTemplateSettings) {
  const sectionOrder = (Object.keys(settings.visibleSections) as HomeSectionKey[])
    .filter((key) => settings.visibleSections[key])
    .map((key) => ({
      key,
      order: settings.sectionOrder[key] ?? 999
    }))
    .sort((a, b) => a.order - b.order);

  return sectionOrder.map(({ key }, index) => {
    if (key === "navigation") {
      return {
        type: "HomeNavigation",
        props: {
          id: createId("home-navigation", index),
          ctaLabel: text(settings.primaryCtaLabel, "Request quote")
        }
      };
    }

    if (key === "hero") {
      const firstSlide = settings.heroSlides.find((slide) => slide.enabled) ?? settings.heroSlides[0];
      return {
        type: "HeroSection",
        props: {
          id: createId("hero-section", index),
          eyebrow: text(settings.heroKicker, "Built for global buyers"),
          title: text(settings.heroTitle, "Export-ready product supply"),
          body: text(settings.heroBody, "Create a focused B2B storefront with current products, articles, downloads, and RFQ details."),
          primaryLabel: text(settings.primaryCtaLabel, "Request quote"),
          primaryHref: "#rfq",
          secondaryLabel: text(settings.secondaryCtaLabel, "Products"),
          secondaryHref: "/products",
          imageUrl: firstSlide?.imageUrl ?? "",
          showMetrics: settings.showHeroMetrics,
          metric1Value: templateText(settings, "heroMetric1Value", "24h"),
          metric1Label: templateText(settings, "heroMetric1Label", "RFQ response workflow"),
          metric2Value: templateText(settings, "heroMetric2Value", "OEM"),
          metric2Label: templateText(settings, "heroMetric2Label", "Custom supply support"),
          metric3Value: templateText(settings, "heroMetric3Value", "OEM"),
          metric3Label: templateText(settings, "heroMetric3Label", "Packing and documentation")
        }
      };
    }

    if (key === "products") {
      return {
        type: "ProductList",
        props: {
          id: createId("product-list", index),
          eyebrow: templateText(settings, "productsEyebrow", coreSectionLabels.products),
          title: templateText(settings, "productsTitle", "Product categories"),
          body: templateText(settings, "productsBody", "Browse current categories and send requirements for quotation."),
          limit: settings.homeProductCount,
          flat: true
        }
      };
    }

    if (key === "factory") {
      return {
        type: "FeatureCards",
        props: {
          id: createId("feature-cards", index),
          eyebrow: templateText(settings, "factoryEyebrow", coreSectionLabels.factory),
          title: templateText(settings, "factoryTitle", "Supply capabilities for repeat orders"),
          card1Title: templateText(settings, "factoryCard1Title", "OEM customization"),
          card1Body: templateText(settings, "factoryCard1Body", "Support sample confirmation, batch production, and repeat buying programs."),
          card2Title: templateText(settings, "factoryCard2Title", "Quality checkpoints"),
          card2Body: templateText(settings, "factoryCard2Body", "Keep specifications, inspection, and delivery details visible for buyers."),
          card3Title: templateText(settings, "factoryCard3Title", "Export packing"),
          card3Body: templateText(settings, "factoryCard3Body", "Prepare buyer-ready labels, cartons, and shipment documentation."),
          tone: "dark"
        }
      };
    }

    if (key === "markets") {
      return {
        type: "MarketSection",
        props: {
          id: createId("market-section", index),
          eyebrow: templateText(settings, "marketsEyebrow", coreSectionLabels.markets),
          title: templateText(settings, "marketsTitle", "Multilingual markets and RFQ details"),
          body: templateText(settings, "marketsBody", "Support localized pages, quick RFQ information, and export documentation."),
          checklistTitle: templateText(settings, "marketsChecklistTitle", "RFQ checklist"),
          item1: templateText(settings, "marketsChecklist1", "Product type, specification, and target use."),
          item2: templateText(settings, "marketsChecklist2", "Material, quality requirements, and preferred standards."),
          item3: templateText(settings, "marketsChecklist3", "Quantity, packing, destination, and delivery target.")
        }
      };
    }

    if (key === "articles") {
      return {
        type: "ArticleList",
        props: {
          id: createId("article-list", index),
          eyebrow: templateText(settings, "articlesEyebrow", coreSectionLabels.articles),
          title: templateText(settings, "articlesTitle", "技术文章"),
          limit: settings.homeArticleCount
        }
      };
    }

    return {
      type: "RfqSection",
      props: {
        id: createId("rfq-section", index),
        eyebrow: templateText(settings, "rfqEyebrow", coreSectionLabels.rfq),
        title: templateText(settings, "rfqTitle", "Send the details for quotation"),
        body: templateText(settings, "rfqBody", "The RFQ form collects product, quantity, packing, destination, and delivery details.")
      }
    };
  }) satisfies VisualPageLayoutData["content"];
}

function customBlockComponent(block: SiteTemplateCustomBlock, index: number) {
  const shared = {
    id: block.id || createId("custom-block", index),
    eyebrow: text(block.eyebrow, ""),
    title: text(block.title, "Custom section"),
    body: text(block.body, ""),
    align: block.align ?? "left",
    tone: block.theme ?? "light"
  };

  if (block.type === "image") {
    const images = (block.imageItems ?? [])
      .filter((item) => item.enabled && item.url.trim())
      .sort((a, b) => a.order - b.order)
      .slice(0, 6)
      .map((item) => item.url)
      .join("\n");

    return {
      type: "ImageGallery",
      props: {
        ...shared,
        imageUrls: images || block.mediaUrl || "",
        layout: block.imageLayout ?? "grid"
      }
    };
  }

  if (block.type === "video") {
    return {
      type: "VideoSection",
      props: {
        ...shared,
        mediaUrl: block.mediaUrl ?? ""
      }
    };
  }

  if (block.type === "cta") {
    return {
      type: "CtaSection",
      props: {
        ...shared,
        buttonLabel: text(block.buttonLabel, "Learn more"),
        href: block.linkUrl || "#rfq"
      }
    };
  }

  return {
    type: "TextSection",
    props: shared
  };
}

function createHomeLayout(settings: SiteTemplateSettings) {
  const customComponents = settings.customBlocks
    .filter((block) => block.enabled)
    .sort((a, b) => a.order - b.order)
    .map(customBlockComponent);

  return asPuckData([...coreHomeComponents(settings), ...customComponents]);
}

function defaultPageLayout(page: SitePage) {
  return asPuckData([
    {
      type: "PageDetail",
      props: {
        id: `page-${page.slug}-detail`
      }
    }
  ]);
}

function isLegacyStaticPageLayout(key: PageLayoutKey, data: VisualPageLayoutData) {
  if (!key.startsWith("page:")) return false;
  const slug = key.replace(/^page:/, "");
  const content = data.content;

  return content.length === 2
    && content[0]?.type === "PageHero"
    && content[1]?.type === "RichTextBlock"
    && String(content[0]?.props?.id ?? "") === `page-${slug}-hero`
    && String(content[1]?.props?.id ?? "") === `page-${slug}-body`;
}

const defaultLayoutSignatures: Partial<Record<SystemPageLayoutKey, string[]>> = {
  "products-index": ["PageHero:products-index-hero", "ProductList:products-index-list"],
  "product-detail": ["ProductDetail:product-detail-main", "RfqSection:product-detail-rfq"],
  "articles-index": ["PageHero:articles-index-hero", "ArticleList:articles-index-list"],
  "article-detail": ["ArticleDetail:article-detail-main", "RfqSection:article-detail-rfq"],
  "files-index": ["PageHero:files-index-hero", "FileList:files-index-list"],
  contact: ["PageHero:contact-hero", "ContactChannels:contact-channels", "RfqSection:contact-rfq"]
};

const legacyDefaultLayoutText: Partial<Record<SystemPageLayoutKey, string[]>> = {
  "products-index": [
    "KeyproTools products",
    "Carbide end mills, drill bits, and OEM tooling for metalworking buyers.",
    "Browse the main tooling families"
  ],
  "product-detail": [
    "Send diameter, quantity, coating, material, packaging, and destination.",
    "KeyproTools will match geometry",
    "KeyproTools will review the category details"
  ],
  "articles-index": [
    "Technical library",
    "Buying guides and application notes for end mills",
    "Read KeyproTools buying guides"
  ],
  "article-detail": [
    "Turn this tooling note into a clear RFQ.",
    "Share diameter, coating, workpiece material"
  ],
  "files-index": [
    "KeyproTools product images and tooling resources",
    "End mill, drill bit, coating, packaging"
  ],
  contact: [
    "Send your end mill, drill bit, or OEM tooling request to KeyproTools.",
    "Share drawings, size lists, coating requirements"
  ]
};

function layoutSignature(data: VisualPageLayoutData) {
  return data.content.map((item) => `${item.type}:${String(item.props?.id ?? "")}`);
}

function isLegacyDefaultSystemLayout(key: PageLayoutKey, data: VisualPageLayoutData) {
  if (!isSystemLayoutKey(key)) return false;
  const expectedSignature = defaultLayoutSignatures[key];
  const legacyText = legacyDefaultLayoutText[key];
  if (!expectedSignature || !legacyText) return false;

  const signature = layoutSignature(data);
  const matchesDefaultStructure = signature.length === expectedSignature.length
    && expectedSignature.every((item: string, index: number) => signature[index] === item);
  if (!matchesDefaultStructure) return false;

  const serialized = JSON.stringify(data);
  return legacyText.some((item: string) => serialized.includes(item));
}

function baseLayouts(state: Pick<AdminState, "templateSettings">, now: string): SitePageLayout[] {
  return [
    {
      key: "home",
      label: baseLayoutLabels.home,
      data: createHomeLayout(state.templateSettings),
      updatedAt: now
    },
    {
      key: "products-index",
      label: baseLayoutLabels["products-index"],
      data: asPuckData([
        {
          type: "PageHero",
          props: {
            id: "products-index-hero",
            eyebrow: "Products",
            title: "Product categories",
            body: "Browse current product categories, compare fit, and send RFQ details."
          }
        },
        { type: "ProductList", props: { id: "products-index-list", limit: 0, flat: false } }
      ]),
      updatedAt: now
    },
    {
      key: "product-detail",
      label: baseLayoutLabels["product-detail"],
      data: asPuckData([
        { type: "ProductDetail", props: { id: "product-detail-main" } },
        {
          type: "RfqSection",
          props: {
            id: "product-detail-rfq",
            eyebrow: "Request category quote",
            title: "Send quantity, requirements, packaging, and destination.",
            body: "The team will review the category details and respond with a practical quotation."
          }
        }
      ]),
      updatedAt: now
    },
    {
      key: "articles-index",
      label: baseLayoutLabels["articles-index"],
      data: asPuckData([
        {
          type: "PageHero",
          props: {
            id: "articles-index-hero",
            eyebrow: "Articles",
            title: "Articles and application notes",
            body: "Read current buying guides, application notes, and updates."
          }
        },
        { type: "ArticleList", props: { id: "articles-index-list", limit: 0 } }
      ]),
      updatedAt: now
    },
    {
      key: "article-detail",
      label: baseLayoutLabels["article-detail"],
      data: asPuckData([
        { type: "ArticleDetail", props: { id: "article-detail-main" } },
        {
          type: "RfqSection",
          props: {
            id: "article-detail-rfq",
            eyebrow: "Need a quote?",
            title: "Turn this article into a clear request.",
            body: "Share product details, quantity, packaging, and destination so the team can respond with a practical quotation."
          }
        }
      ]),
      updatedAt: now
    },
    {
      key: "files-index",
      label: baseLayoutLabels["files-index"],
      data: asPuckData([
        {
          type: "PageHero",
          props: {
            id: "files-index-hero",
            eyebrow: "Downloads",
            title: "Downloads and media resources",
            body: "Download current images, documents, and media resources."
          }
        },
        { type: "FileList", props: { id: "files-index-list" } }
      ]),
      updatedAt: now
    },
    {
      key: "contact",
      label: baseLayoutLabels.contact,
      data: asPuckData([
        {
          type: "PageHero",
          props: {
            id: "contact-hero",
            eyebrow: "Contact",
            title: "Send your request",
            body: "Share product details, quantity, packaging, and destination so the team can prepare a practical quotation."
          }
        },
        { type: "ContactChannels", props: { id: "contact-channels", title: "Contact channels" } },
        { type: "RfqSection", props: { id: "contact-rfq", eyebrow: "RFQ details", title: "Tell us what to quote.", body: "" } }
      ]),
      updatedAt: now
    }
  ];
}

function isValidLayoutData(data: unknown): data is VisualPageLayoutData {
  if (!data || typeof data !== "object") return false;
  const value = data as VisualPageLayoutData;
  return Array.isArray(value.content);
}

export function normalizePageLayouts(layouts: unknown, state: Pick<AdminState, "pages" | "templateSettings">): SitePageLayout[] {
  const now = new Date().toISOString();
  const defaultLayouts = baseLayouts(state, now);
  const defaultLayoutByKey = new Map(defaultLayouts.map((layout) => [layout.key, layout]));
  const byKey = new Map<PageLayoutKey, SitePageLayout>();

  defaultLayouts.forEach((layout) => byKey.set(layout.key, layout));

  if (Array.isArray(layouts)) {
    layouts.forEach((layout, index) => {
      const key = typeof layout?.key === "string" ? layout.key as PageLayoutKey : null;
      if (!key || !isValidLayoutData(layout.data)) return;

      const pageSlug = key.startsWith("page:") ? key.replace(/^page:/, "") : "";
      const pageForLegacyLayout = pageSlug ? state.pages.find((page) => page.slug === pageSlug) : undefined;
      const defaultSystemLayout = isSystemLayoutKey(key) ? defaultLayoutByKey.get(key) : undefined;
      const data = pageForLegacyLayout && isLegacyStaticPageLayout(key, layout.data)
        ? defaultPageLayout(pageForLegacyLayout)
        : defaultSystemLayout && isLegacyDefaultSystemLayout(key, layout.data)
          ? defaultSystemLayout.data
        : layout.data;

      byKey.set(key, {
        key,
        label: typeof layout.label === "string" && layout.label.trim()
          ? layout.label
          : key.startsWith("page:") ? `页面：${key.replace(/^page:/, "")}` : baseLayoutLabels[key as keyof typeof baseLayoutLabels] ?? `布局 ${index + 1}`,
        data,
        updatedAt: typeof layout.updatedAt === "string" ? layout.updatedAt : now,
        publishedAt: typeof layout.publishedAt === "string" ? layout.publishedAt : undefined
      });
    });
  }

  state.pages.forEach((page) => {
    const key = `page:${page.slug}` as PageLayoutKey;
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        label: `页面：${text(page.title, page.slug)}`,
        data: defaultPageLayout(page),
        updatedAt: now
      });
    }
  });

  return Array.from(byKey.values());
}

export function findPageLayout(state: Pick<AdminState, "pageLayouts">, key: PageLayoutKey) {
  return state.pageLayouts.find((layout) => layout.key === key && layout.publishedAt && layout.data.content.length > 0);
}

export function collectTemplatePackageFiles(state: Pick<AdminState, "pageLayouts" | "templateSettings" | "uploadedFiles">): UploadedFile[] {
  const serialized = JSON.stringify({
    pageLayouts: state.pageLayouts,
    templateSettings: state.templateSettings
  });

  return state.uploadedFiles.filter((file) => file.url && serialized.includes(file.url));
}

export function normalizeTemplatePackageLayouts(layouts: unknown, state: Pick<AdminState, "pages" | "templateSettings">) {
  return normalizePageLayouts(layouts, state);
}

export function getBaseLayoutLabels() {
  return baseLayoutLabels;
}
