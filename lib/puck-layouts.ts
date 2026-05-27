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

const baseLayoutLabels: Record<Exclude<PageLayoutKey, `page:${string}`>, string> = {
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

function asPuckData(content: VisualPageLayoutData["content"]): VisualPageLayoutData {
  return {
    root: { props: { title: "" } },
    content,
    zones: {}
  };
}

function text(value: Translation | undefined, fallback = "") {
  return value?.zh || value?.en || fallback;
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
          ctaLabel: text(settings.primaryCtaLabel, "获取报价")
        }
      };
    }

    if (key === "hero") {
      const firstSlide = settings.heroSlides.find((slide) => slide.enabled) ?? settings.heroSlides[0];
      return {
        type: "HeroSection",
        props: {
          id: createId("hero-section", index),
          eyebrow: text(settings.heroKicker, "面向全球买家的 CNC 刀具供应"),
          title: text(settings.heroTitle, "硬质合金铣刀与钻头"),
          body: text(settings.heroBody, "面向经销商长期备货的硬质合金刀具供应。"),
          primaryLabel: text(settings.primaryCtaLabel, "获取报价"),
          primaryHref: "#rfq",
          secondaryLabel: text(settings.secondaryCtaLabel, "产品目录"),
          secondaryHref: "/products",
          imageUrl: firstSlide?.imageUrl ?? "",
          showMetrics: settings.showHeroMetrics,
          metric1Value: templateText(settings, "heroMetric1Value", "0.2-25mm"),
          metric1Label: templateText(settings, "heroMetric1Label", "End mill diameter range"),
          metric2Value: templateText(settings, "heroMetric2Value", "HSS / M35 / Carbide"),
          metric2Label: templateText(settings, "heroMetric2Label", "Drill bit supply"),
          metric3Value: templateText(settings, "heroMetric3Value", "OEM"),
          metric3Label: templateText(settings, "heroMetric3Label", "Laser marking and packing")
        }
      };
    }

    if (key === "products") {
      return {
        type: "ProductList",
        props: {
          id: createId("product-list", index),
          eyebrow: templateText(settings, "productsEyebrow", coreSectionLabels.products),
          title: templateText(settings, "productsTitle", "硬质合金刀具目录"),
          body: templateText(settings, "productsBody", "覆盖经销商备货、工厂加工与定制刀具需求。"),
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
          title: templateText(settings, "factoryTitle", "从几何、涂层到包装的供应能力"),
          card1Title: templateText(settings, "factoryCard1Title", "OEM 图纸定制"),
          card1Body: templateText(settings, "factoryCard1Body", "适合经销商长期备货、样品确认与批量订单。"),
          card2Title: templateText(settings, "factoryCard2Title", "涂层与刃口处理"),
          card2Body: templateText(settings, "factoryCard2Body", "适合经销商长期备货、样品确认与批量订单。"),
          card3Title: templateText(settings, "factoryCard3Title", "私标包装交付"),
          card3Body: templateText(settings, "factoryCard3Body", "适合经销商长期备货、样品确认与批量订单。"),
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
          title: templateText(settings, "marketsTitle", "多语言市场与 RFQ 清单"),
          body: templateText(settings, "marketsBody", "支持多语言产品页、快速 RFQ 信息和出口文件。"),
          checklistTitle: templateText(settings, "marketsChecklistTitle", "RFQ 清单"),
          item1: templateText(settings, "marketsChecklist1", "刀具类型、直径、刃长、总长和柄径。"),
          item2: templateText(settings, "marketsChecklist2", "工件材料、硬度、涂层和切削条件。"),
          item3: templateText(settings, "marketsChecklist3", "数量、包装、激光打标、目的地和交付目标。")
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
        title: templateText(settings, "rfqTitle", "把刀具清单发给 KeyproTools"),
        body: templateText(settings, "rfqBody", "规格、数量、涂层、包装和交期信息会在前台询盘表单中收集。")
      }
    };
  }) satisfies VisualPageLayoutData["content"];
}

function customBlockComponent(block: SiteTemplateCustomBlock, index: number) {
  const shared = {
    id: block.id || createId("custom-block", index),
    eyebrow: text(block.eyebrow, ""),
    title: text(block.title, "自定义模块"),
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
        buttonLabel: text(block.buttonLabel, "了解更多"),
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
      type: "PageHero",
      props: {
        id: `page-${page.slug}-hero`,
        eyebrow: "Page",
        title: text(page.title, page.slug),
        body: text(page.excerpt, "")
      }
    },
    {
      type: "RichTextBlock",
      props: {
        id: `page-${page.slug}-body`,
        body: text(page.body, "")
      }
    }
  ]);
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
            eyebrow: "KeyproTools products",
            title: "Carbide end mills, drill bits, and OEM tooling for metalworking buyers.",
            body: "Browse the main tooling families, compare application fit, and send RFQ details for distributor pricing, coating, marking, and export packing."
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
            title: "Send diameter, quantity, coating, material, packaging, and destination.",
            body: "KeyproTools will match geometry, stock range, OEM marking, and export packing for your buying program."
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
            eyebrow: "Technical library",
            title: "Buying guides and application notes for end mills, drill bits, and OEM tool orders.",
            body: "Read KeyproTools buying guides for cutting tool geometry, coating choices, drill bit assortments, OEM packaging, and distributor RFQ preparation."
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
            title: "Turn this tooling note into a clear RFQ.",
            body: "Share diameter, coating, workpiece material, quantity, packaging, and destination so KeyproTools can respond with a practical quotation."
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
            title: "KeyproTools product images and tooling resources",
            body: "End mill, drill bit, coating, packaging, catalog, specification, and article media are collected here for buyer review."
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
            title: "Send your end mill, drill bit, or OEM tooling request to KeyproTools.",
            body: "Share drawings, size lists, coating requirements, packaging details, and destination so the sales team can prepare a practical export quote."
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
  const byKey = new Map<PageLayoutKey, SitePageLayout>();

  defaultLayouts.forEach((layout) => byKey.set(layout.key, layout));

  if (Array.isArray(layouts)) {
    layouts.forEach((layout, index) => {
      const key = typeof layout?.key === "string" ? layout.key as PageLayoutKey : null;
      if (!key || !isValidLayoutData(layout.data)) return;

      byKey.set(key, {
        key,
        label: typeof layout.label === "string" && layout.label.trim()
          ? layout.label
          : key.startsWith("page:") ? `页面：${key.replace(/^page:/, "")}` : baseLayoutLabels[key as keyof typeof baseLayoutLabels] ?? `布局 ${index + 1}`,
        data: layout.data,
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
