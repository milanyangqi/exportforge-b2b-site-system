import type { PageLayoutKey, VisualPageLayoutData } from "@/types/site";

export type BlockPresetCategory = string;

export type BlockPreset = {
  id: string;
  category: BlockPresetCategory;
  label: string;
  description: string;
  thumbnail: string;
  requiredAssets: string[];
  sourceNote?: string;
  puckData: VisualPageLayoutData["content"];
};

export type PagePreset = {
  id: string;
  layoutKey: PageLayoutKey;
  label: string;
  description: string;
  thumbnail: string;
  requiredAssets: string[];
  puckData: VisualPageLayoutData;
};

export const currentTemplateAssetPaths = new Set<string>();

export const blockPresetCategories: Array<{ key: BlockPresetCategory; label: string; description: string }> = [
  { key: "nested-columns", label: "嵌套列", description: "多列容器、复杂栅格、左右分栏和组合布局。" },
  { key: "text-path", label: "路径文字", description: "沿路径排版的装饰文字、弧形标题和视觉强调文字。" },
  { key: "title", label: "标题", description: "页面标题、区块标题、说明标题和标题组合。" },
  { key: "post-cards", label: "文章卡片", description: "文章列表、博客卡片、新闻卡片和内容推荐。" },
  { key: "button", label: "按钮", description: "主按钮、次按钮、图标按钮、CTA 按钮和按钮组。" },
  { key: "image-carousel", label: "图片轮播", description: "首屏轮播、展示轮播、案例轮播和横向滑动图片。" },
  { key: "toggles", label: "折叠开关", description: "折叠面板、展开收起内容和问答开关。" },
  { key: "table-of-contents", label: "目录", description: "文章目录、页面锚点目录和快速导航。" },
  { key: "circles-info", label: "圆形信息", description: "圆形图标、圆形数据、环形信息和视觉卖点。" },
  { key: "image-hotspots", label: "图片热点", description: "带热点标注的产品图、场景图和流程图。" },
  { key: "content-boxes", label: "内容盒子", description: "信息盒、功能盒、卖点盒和内容组合卡。" },
  { key: "testimonials", label: "客户评价", description: "客户评价、案例背书、合作反馈和引用内容。" },
  { key: "menu", label: "菜单", description: "导航菜单、分类菜单、页内菜单和链接列表。" },
  { key: "flip-boxes", label: "翻转盒子", description: "正反面切换卡片、悬停翻转和交互说明盒。" },
  { key: "openstreetmap", label: "地图", description: "地图位置、联系地址、服务区域和门店定位。" },
  { key: "image", label: "图片", description: "单图、场景图、带说明图片和媒体框。" },
  { key: "progress-bar", label: "进度条", description: "进度展示、能力比例、步骤进度和数据条。" },
  { key: "checklist", label: "清单", description: "准备清单、功能清单、任务清单和勾选列表。" },
  { key: "gallery", label: "图库", description: "图片网格、内容图库、场景图库和案例图库。" },
  { key: "tabs", label: "标签页", description: "Tab 切换、内容分组、规格分组和选项卡。" },
  { key: "image-before-after", label: "图片前后对比", description: "前后对比图、效果对比和状态对比。" },
  { key: "social-links", label: "社交链接", description: "社交媒体链接、联系方式入口和外部平台链接。" },
  { key: "tag-cloud", label: "标签云", description: "标签集合、关键词云、分类标签和主题入口。" },
  { key: "countdown", label: "倒计时", description: "活动倒计时、里程碑倒计时和限时提醒。" },
  { key: "text-block", label: "文本块", description: "正文内容、说明文字、富文本和段落区块。" },
  { key: "social-sharing", label: "社交分享", description: "分享按钮、内容分享和社媒传播入口。" },
  { key: "news-ticker", label: "新闻滚动", description: "公告滚动、新闻条、动态信息和通知条。" },
  { key: "counter-boxes", label: "计数器盒子", description: "数据统计、数字证明、增长指标和计数卡片。" },
  { key: "alert", label: "提醒", description: "提示框、警告框、成功提示和重要通知。" }
];

export const blockPresetCategoryLabels = Object.fromEntries(
  blockPresetCategories.map((category) => [category.key, category.label])
) as Record<BlockPresetCategory, string>;

type PresetSourceKey = "reui" | "tailgrids" | "preblocks" | "oxbow" | "shadcnspace" | "blocksso" | "twblocks" | "uilib";
type PresetKind =
  | "hero"
  | "pageHero"
  | "text"
  | "cta"
  | "features"
  | "checklist"
  | "accordion"
  | "tabs"
  | "carousel"
  | "stats"
  | "logos"
  | "timeline"
  | "testimonials"
  | "gallery"
  | "richText"
  | "bento"
  | "articles"
  | "products"
  | "contact";

type PresetTheme = {
  accent: string;
  audience: string;
  body: string;
  category: BlockPresetCategory;
  cta: string;
  id: string;
  label: string;
  source: PresetSourceKey;
  title: string;
  tone: "light" | "tint" | "dark";
};

const sourceNotes: Record<PresetSourceKey, string> = {
  reui: "Inspired by ReUI open-source shadcn component patterns; converted into local Puck JSON.",
  tailgrids: "Inspired by TailGrids React/Tailwind blocks; converted into local Puck JSON.",
  preblocks: "Inspired by Preblocks shadcn block patterns; converted into local Puck JSON.",
  oxbow: "Inspired by Oxbow UI Tailwind and Alpine blocks; converted into local Puck JSON.",
  shadcnspace: "Inspired by Shadcn Space open-source block layouts; converted into local Puck JSON.",
  blocksso: "Inspired by Blocks.so shadcn UI blocks; converted into local Puck JSON.",
  twblocks: "Inspired by TWBlocks open-source website sections; converted into local Puck JSON.",
  uilib: "Inspired by Uilib open-source React and Tailwind blocks; converted into local Puck JSON."
};

const kinds: PresetKind[] = [
  "hero",
  "pageHero",
  "text",
  "cta",
  "features",
  "checklist",
  "accordion",
  "tabs",
  "carousel",
  "stats",
  "logos",
  "timeline",
  "testimonials",
  "gallery",
  "richText",
  "bento",
  "articles",
  "products",
  "contact"
];

const palettes = [
  ["#0f766e", "#14b8a6", "#f8fafc"],
  ["#1d4ed8", "#38bdf8", "#eef2ff"],
  ["#be123c", "#fb7185", "#fff1f2"],
  ["#7c3aed", "#a78bfa", "#f5f3ff"],
  ["#047857", "#86efac", "#ecfdf5"],
  ["#b45309", "#fbbf24", "#fffbeb"],
  ["#334155", "#94a3b8", "#f8fafc"],
  ["#9d174d", "#f9a8d4", "#fdf2f8"],
  ["#155e75", "#67e8f9", "#ecfeff"],
  ["#4338ca", "#818cf8", "#eef2ff"]
];

const baseThemes: Array<Omit<PresetTheme, "id" | "category" | "source" | "tone">> = [
  { label: "SaaS 启动页", audience: "SaaS teams", title: "Launch a clearer product story", body: "Introduce the value, workflow and next action with calm, conversion-ready structure.", cta: "Start building", accent: "SaaS" },
  { label: "AI 工具页", audience: "AI product teams", title: "Turn complex automation into a simple path", body: "Show use cases, trust signals and product steps without overwhelming first-time visitors.", cta: "Explore workflow", accent: "AI" },
  { label: "设计机构页", audience: "creative studios", title: "Present premium services with editorial rhythm", body: "Balance portfolio proof, process clarity and a refined call to action.", cta: "View services", accent: "Studio" },
  { label: "教育课程页", audience: "course creators", title: "Guide learners from interest to enrollment", body: "Use structured benefits, modules and outcomes to reduce hesitation.", cta: "See curriculum", accent: "Course" },
  { label: "金融科技页", audience: "finance teams", title: "Make trust and clarity visible early", body: "Pair measurable proof with concise sections that explain risk, control and speed.", cta: "Request access", accent: "Fintech" },
  { label: "健康服务页", audience: "wellness brands", title: "Create a reassuring journey for visitors", body: "Combine calm copy, service steps and helpful prompts for high-consideration decisions.", cta: "Book a call", accent: "Care" },
  { label: "本地服务页", audience: "service businesses", title: "Help visitors choose the right service faster", body: "Show areas served, clear packages and social proof in a practical layout.", cta: "Get estimate", accent: "Local" },
  { label: "活动会议页", audience: "event organizers", title: "Build momentum before the date arrives", body: "Highlight speakers, schedule moments and registration prompts in one scan.", cta: "Reserve seat", accent: "Event" },
  { label: "招聘品牌页", audience: "hiring teams", title: "Show candidates what makes the team worth joining", body: "Use culture signals, role categories and process steps to set expectations.", cta: "See openings", accent: "Hiring" },
  { label: "电商品牌页", audience: "commerce brands", title: "Make the collection feel easy to browse", body: "Mix product highlights, benefit cards and trust proof for a better buying flow.", cta: "Shop collection", accent: "Shop" },
  { label: "非营利组织页", audience: "community teams", title: "Turn mission details into clear ways to help", body: "Explain the cause, impact metrics and contribution paths with approachable pacing.", cta: "Support mission", accent: "Impact" },
  { label: "应用下载页", audience: "mobile app teams", title: "Show the everyday outcome before the feature list", body: "Lead with useful scenarios, quick proof and a direct install prompt.", cta: "Download app", accent: "App" },
  { label: "房地产项目页", audience: "property teams", title: "Frame spaces, amenities and next visits elegantly", body: "Combine gallery moments, location notes and inquiry prompts for premium listings.", cta: "Schedule visit", accent: "Estate" },
  { label: "餐饮品牌页", audience: "food brands", title: "Make menu discovery feel lively and simple", body: "Use featured items, story cards and reservation prompts without visual clutter.", cta: "Book table", accent: "Dining" },
  { label: "咨询顾问页", audience: "consulting teams", title: "Explain expertise with practical proof", body: "Turn advisory offers, outcomes and process into a page that feels easy to trust.", cta: "Plan session", accent: "Advisory" },
  { label: "数据平台页", audience: "data teams", title: "Make insight workflows easier to understand", body: "Describe dashboards, automation and governance through plain structured sections.", cta: "View demo", accent: "Data" },
  { label: "安全产品页", audience: "security teams", title: "Present protection without fear-heavy copy", body: "Use calm proof, response steps and control summaries to build confidence.", cta: "Assess risk", accent: "Secure" },
  { label: "开发者工具页", audience: "developer teams", title: "Get builders from concept to integration quickly", body: "Surface docs, examples, package choices and community proof in scannable blocks.", cta: "Read docs", accent: "Dev" },
  { label: "媒体出版页", audience: "publishing teams", title: "Package stories, subscriptions and highlights", body: "Create a polished editorial entry with featured content and member prompts.", cta: "Subscribe", accent: "Media" },
  { label: "旅行目的地页", audience: "travel teams", title: "Turn destination interest into a planned route", body: "Show itineraries, highlights and booking prompts with immersive but practical sections.", cta: "Plan trip", accent: "Travel" }
];

function item(type: string, props: Record<string, unknown>): VisualPageLayoutData["content"][number] {
  return { type, props: props as VisualPageLayoutData["content"][number]["props"] };
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function svgDataUrl(label: string, index: number, variant = "card") {
  const [primary, secondary, background] = palettes[index % palettes.length];
  const safeLabel = label.replace(/[<>&]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${primary}"/><stop offset="1" stop-color="${secondary}"/></linearGradient><radialGradient id="r" cx="70%" cy="20%" r="70%"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="800" fill="${background}"/><rect x="72" y="72" width="1056" height="656" rx="42" fill="url(#g)" opacity=".94"/><circle cx="930" cy="170" r="230" fill="url(#r)"/><path d="M160 560C290 410 390 485 510 340s260-88 368-230" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="18" stroke-linecap="round"/><rect x="160" y="158" width="190" height="18" rx="9" fill="#fff" opacity=".58"/><rect x="160" y="205" width="520" height="34" rx="17" fill="#fff" opacity=".9"/><rect x="160" y="264" width="430" height="24" rx="12" fill="#fff" opacity=".7"/><rect x="160" y="614" width="170" height="54" rx="27" fill="#fff" opacity=".88"/><text x="160" y="385" fill="#fff" font-size="82" font-weight="800" font-family="Inter,Arial,sans-serif">${safeLabel}</text><text x="160" y="455" fill="#fff" opacity=".78" font-size="30" font-family="Inter,Arial,sans-serif">${variant.toUpperCase()} PRESET ${String(index + 1).padStart(3, "0")}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function themeFor(index: number): PresetTheme {
  const base = baseThemes[index % baseThemes.length];
  return {
    ...base,
    id: slug(`${base.accent}-${index + 1}`),
    category: blockPresetCategories[index % blockPresetCategories.length].key,
    source: (["reui", "tailgrids", "preblocks", "oxbow", "shadcnspace", "blocksso", "twblocks", "uilib"] as PresetSourceKey[])[index % 8],
    tone: (["light", "tint", "dark"] as const)[index % 3]
  };
}

function commonHead(theme: PresetTheme, kind: PresetKind, index: number) {
  return {
    eyebrow: `${theme.accent} / ${kind}`,
    title: theme.title,
    body: theme.body,
    tone: theme.tone,
    id: `preset-${theme.id}-${kind}-${index + 1}`
  };
}

function imageItem(theme: PresetTheme, index: number, offset = 0) {
  return {
    source: svgDataUrl(`${theme.accent} ${offset + 1}`, index + offset, "visual"),
    alt: `${theme.label} visual ${offset + 1}`,
    caption: offset % 2 === 0 ? "Generated neutral visual" : "",
    linkHref: ""
  };
}

function createPuckData(kind: PresetKind, theme: PresetTheme, index: number): VisualPageLayoutData["content"] {
  const head = commonHead(theme, kind, index);
  const image = svgDataUrl(theme.accent, index, kind);
  const imageB = svgDataUrl(`${theme.accent} Flow`, index + 13, kind);
  const imageC = svgDataUrl(`${theme.accent} Proof`, index + 29, kind);

  if (kind === "hero") {
    return [item("HeroSection", {
      ...head,
      backgroundMode: "carousel",
      mediaLibraryUrl: image,
      imageItems: [imageItem(theme, index), imageItem(theme, index, 1), imageItem(theme, index, 2)],
      overlayTone: index % 2 ? "brand" : "dark",
      contentPosition: index % 3 === 0 ? "center" : "left",
      heroHeight: index % 4 === 0 ? "tall" : "standard",
      primaryLabel: theme.cta,
      primaryHref: "#",
      secondaryLabel: "Learn more",
      secondaryHref: "#",
      buttonStyle: index % 2 ? "solid" : "default",
      showMetrics: true,
      metric1Value: `${index + 12}%`,
      metric1Label: "Faster decisions",
      metric2Value: "3 steps",
      metric2Label: "Clear journey",
      metric3Value: "24/7",
      metric3Label: "Always available"
    })];
  }

  if (kind === "pageHero") {
    return [item("PageHero", {
      ...head,
      mediaLibraryUrl: image,
      align: index % 2 ? "center" : "left",
      height: index % 3 === 0 ? "large" : "standard"
    })];
  }

  if (kind === "text") {
    return [item("TextSection", {
      ...head,
      buttonLabel: theme.cta,
      buttonHref: "#",
      mediaLibraryUrl: image,
      layout: index % 2 ? "media-left" : "media-right",
      width: index % 3 === 0 ? "wide" : "normal",
      align: index % 4 === 0 ? "center" : "left",
      spacing: index % 2 ? "large" : "normal"
    })];
  }

  if (kind === "cta") {
    return [item("CtaSection", {
      ...head,
      buttonLabel: theme.cta,
      href: "#",
      buttonStyle: index % 3 === 0 ? "pill" : "primary",
      secondaryLabel: "See details",
      secondaryHref: "#",
      secondaryButtonStyle: "outline",
      mediaLibraryUrl: image,
      align: index % 2 ? "center" : "split",
      spacing: index % 2 ? "compact" : "normal"
    })];
  }

  if (kind === "features") {
    return [item("FeatureCards", {
      ...head,
      cards: ["Plan", "Build", "Improve", "Scale"].slice(0, 3 + (index % 2)).map((label, offset) => ({
        title: `${label} with clarity`,
        body: `A neutral feature card for ${theme.audience} that can be rewritten for any project.`,
        icon: String(offset + 1).padStart(2, "0"),
        imageUrl: offset % 2 === 0 ? svgDataUrl(`${theme.accent} ${label}`, index + offset, "feature") : "",
        href: ""
      })),
      columns: index % 2 ? "4" : "3"
    })];
  }

  if (kind === "checklist") {
    return [item("MarketSection", {
      ...head,
      checklistTitle: "Launch checklist",
      checklistItems: [
        { label: "Audience", body: "Name the person, team or group this section is designed for." },
        { label: "Outcome", body: "State the practical result visitors should understand." },
        { label: "Action", body: "Provide a direct next step that works for this page." }
      ],
      sideTitle: "Reusable structure",
      sideBody: "Swap the nouns, keep the hierarchy, and adapt the section to another topic.",
      mediaLibraryUrl: image,
      layout: index % 2 ? "image" : "checklist"
    })];
  }

  if (kind === "accordion") {
    return [item("PresetAccordion", {
      ...head,
      defaultOpenIndex: 0,
      items: [
        { id: "overview", title: "What should this section explain?", body: "Use it to answer the first practical question a visitor has before taking action." },
        { id: "proof", title: "Where does proof appear?", body: "Add proof through metrics, short examples, case notes or concrete process details." },
        { id: "edit", title: "How can this be customized?", body: "Replace labels, body text and links after inserting the preset into the page." }
      ]
    })];
  }

  if (kind === "tabs") {
    return [item("PresetTabs", {
      ...head,
      items: [
        { id: "one", label: "Overview", metric: "01", title: "Introduce the promise", body: "Explain the page concept in language that matches the visitor's context.", imageUrl: image },
        { id: "two", label: "Workflow", metric: "02", title: "Show the path", body: "Break the experience into simple steps that reduce uncertainty.", imageUrl: imageB },
        { id: "three", label: "Proof", metric: "03", title: "Support the claim", body: "Use metrics, examples or short quotes to make the story credible.", imageUrl: imageC }
      ]
    })];
  }

  if (kind === "carousel") {
    return [item("PresetCarousel", {
      ...head,
      loop: true,
      items: ["Discover", "Compare", "Decide", "Continue"].map((label, offset) => ({
        tag: `${theme.accent} ${offset + 1}`,
        title: `${label} faster`,
        body: `A flexible carousel card for ${theme.audience}.`,
        imageUrl: svgDataUrl(`${theme.accent} ${label}`, index + offset, "slide"),
        href: "#"
      }))
    })];
  }

  if (kind === "stats") {
    return [item("PresetStatsGrid", {
      ...head,
      columns: index % 2 ? "3" : "4",
      stats: [
        { value: `${20 + index}%`, label: "More clarity", body: "A replaceable metric for the main page claim." },
        { value: "4x", label: "Reusable blocks", body: "Use the same pattern across multiple pages." },
        { value: "12", label: "Content moments", body: "Create small proof points visitors can scan." },
        { value: "1", label: "Primary action", body: "Keep the next step obvious and uncluttered." }
      ]
    })];
  }

  if (kind === "logos") {
    return [item("PresetLogoCloud", {
      ...head,
      logos: ["Atlas", "Northstar", "Signal", "Lumen", "Vertex", "Harbor"].map((name) => ({ name, logoUrl: "" }))
    })];
  }

  if (kind === "timeline") {
    return [item("PresetTimelineSteps", {
      ...head,
      steps: [
        { label: "01", title: "Map the goal", body: "Clarify who the page serves and what they need to decide." },
        { label: "02", title: "Shape the story", body: "Group benefits, proof and actions into a natural sequence." },
        { label: "03", title: "Publish and learn", body: "Review behavior and improve copy, order and emphasis." }
      ]
    })];
  }

  if (kind === "testimonials") {
    return [item("PresetTestimonials", {
      ...head,
      layout: index % 2 ? "featured" : "grid",
      testimonials: [
        { quote: "The page structure made the offer easier to understand without extra explanation.", name: "Project lead", role: theme.audience, imageUrl: "" },
        { quote: "We could replace the sample copy quickly and keep the layout polished.", name: "Content editor", role: "Marketing team", imageUrl: "" },
        { quote: "The preset gave us a useful starting point for a more specific page.", name: "Designer", role: "Product team", imageUrl: "" }
      ]
    })];
  }

  if (kind === "gallery") {
    return [item("ImageGallery", {
      ...head,
      mediaLibraryUrl: image,
      imageItems: [imageItem(theme, index), imageItem(theme, index, 1), imageItem(theme, index, 2), imageItem(theme, index, 3)],
      imageLimit: 8,
      layout: (["grid", "mosaic", "strip", "carousel"] as const)[index % 4],
      imageFit: "cover",
      imageAspect: (["standard", "wide", "square"] as const)[index % 3]
    })];
  }

  if (kind === "richText") {
    return [item("RichTextBlock", {
      id: head.id,
      body: `## ${theme.title}\n\n${theme.body}\n\n- Replace this neutral copy with project-specific details.\n- Keep the section focused on one audience and one next step.\n- Use supporting proof only where it helps the decision.`,
      width: index % 2 ? "wide" : "normal",
      tone: theme.tone
    })];
  }

  if (kind === "bento") {
    return [item("CustomSection", {
      ...head,
      moduleType: "container",
      imageMode: "background",
      backgroundImageUrl: image,
      containerPattern: index % 2 ? "1/3-2/3" : "2/3-1/3",
      slotItems: [
        item("ContainerImageTextElement", {
          id: `${head.id}-main`,
          imageUrl: imageB,
          title: "Primary story card",
          body: "Use this larger card for a visual, a featured benefit or a project summary.",
          imagePlacement: "top",
          imageRatio: "wide",
          imageFit: "cover",
          buttonLabel: "Explore",
          href: "#",
          buttonStyle: "text",
          padding: "large",
          background: "white",
          borderStyle: "line",
          radius: "medium",
          shadow: "soft"
        }),
        item("ContainerTextElement", {
          id: `${head.id}-side`,
          eyebrow: theme.accent,
          title: "Supporting note",
          body: "Add a compact detail, reminder or proof point here.",
          padding: "large",
          background: "tint",
          borderStyle: "line",
          radius: "medium",
          shadow: "none"
        })
      ],
      align: "left",
      layout: "stacked",
      width: "contained",
      spacing: "large"
    })];
  }

  if (kind === "articles") {
    return [item("ArticleList", {
      ...head,
      limit: 3 + (index % 3),
      columns: index % 2 ? "2" : "3",
      showExcerpt: true
    })];
  }

  if (kind === "products") {
    return [item("ProductList", {
      ...head,
      limit: 4 + (index % 5),
      flat: index % 2 === 0,
      columns: index % 2 ? "2" : "3"
    })];
  }

  return [item("ContactChannels", {
    ...head,
    title: "Make the next conversation easy to start",
    body: "Use managed contact channels from the CMS and adapt the surrounding copy to any project."
  })];
}

function createPreset(index: number): BlockPreset {
  const kind = kinds[index % kinds.length];
  const theme = themeFor(index);
  const categoryByKind: Partial<Record<PresetKind, BlockPresetCategory>> = {
    hero: "image-carousel",
    pageHero: "title",
    text: "text-block",
    cta: "button",
    features: "content-boxes",
    checklist: "checklist",
    accordion: "toggles",
    tabs: "tabs",
    carousel: "image-carousel",
    stats: "counter-boxes",
    logos: "social-links",
    timeline: "progress-bar",
    testimonials: "testimonials",
    gallery: "gallery",
    richText: "text-block",
    bento: "nested-columns",
    articles: "post-cards",
    products: "content-boxes",
    contact: "social-links"
  };
  const category = categoryByKind[kind] ?? theme.category;
  const label = `${theme.label} ${String(index + 1).padStart(3, "0")}`;

  return {
    id: `${theme.id}-${kind}-${String(index + 1).padStart(3, "0")}`,
    category,
    label,
    description: `中性 ${blockPresetCategoryLabels[category] ?? "区块"}预设，适合 ${theme.audience}，可替换文字、链接和图片。`,
    thumbnail: svgDataUrl(label, index, kind),
    requiredAssets: [],
    sourceNote: sourceNotes[theme.source],
    puckData: createPuckData(kind, theme, index)
  };
}

export const blockPresets: BlockPreset[] = Array.from({ length: 100 }, (_, index) => createPreset(index));

// Reserved registry: add full-page presets here after review.
export const pagePresets: PagePreset[] = [];
