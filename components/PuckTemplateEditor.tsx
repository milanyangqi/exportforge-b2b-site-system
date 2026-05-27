"use client";

/* eslint-disable @next/next/no-img-element */

import { type DragEvent, type MouseEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronsLeft, ChevronsRight, Download, FileUp, GripVertical, ImageIcon, Layers, Maximize2, Minimize2, Save, Search, Video, X } from "lucide-react";
import { Puck, createUsePuck } from "@puckeditor/core";
import type { Config, Data, Permissions, Plugin, Viewports } from "@puckeditor/core";
import { PublicFooterShell, PublicHeaderShell } from "@/components/PublicSiteShell";
import { PuckVisualBlock } from "@/components/PuckVisualBlocks";
import { getBaseLayoutLabels } from "@/lib/puck-layouts";
import type { AdminState, LocaleCode, PageLayoutKey, SitePageLayout, TemplatePackagePayload, VisualPageLayoutData } from "@/types/site";

type PuckTemplateEditorProps = {
  state: AdminState;
  locale: LocaleCode;
  canManage: boolean;
  onStateChange: (state: AdminState) => void;
  onStatus: (message: string) => void;
};

type PageOption = {
  key: PageLayoutKey;
  label: string;
  layout?: SitePageLayout;
};

type MediaPickerKind = "image" | "video";

type MediaPickerItem = {
  value: string;
  label: string;
  source: string;
  kind: MediaPickerKind;
};

type ImagePickerItem = {
  source?: string;
  url?: string;
  alt?: string;
  caption?: string;
  linkHref?: string;
};

type CustomSectionModuleType = "media" | "text" | "video" | "cta";

const customSectionPresetLabels: Record<string, string> = {
  CustomMediaSection: "图文模块",
  CustomTextSection: "纯文字模块",
  CustomVideoSection: "视频模块",
  CustomCtaSection: "行动按钮模块"
};

const useTypedPuck = createUsePuck<Config>();
const rootDropZone = "root:default-zone";

const baseLayoutOrder: PageLayoutKey[] = [
  "home",
  "products-index",
  "product-detail",
  "articles-index",
  "article-detail",
  "files-index",
  "contact"
];

const viewports: Viewports = [
  { icon: "Monitor", label: "桌面", width: "100%" },
  { icon: "Tablet", label: "平板", width: 1024 },
  { icon: "Smartphone", label: "手机", width: 430 }
];

const puckLeftPanelExpandedWidth = 236;
const puckLeftPanelCollapsedWidth = 44;

const puckInitialUi = {
  leftSideBarWidth: puckLeftPanelExpandedWidth,
  plugin: { current: "blocks" },
  rightSideBarWidth: 264,
  viewports: {
    current: { height: "auto" as const, width: "100%" as const },
    controlsVisible: true,
    options: viewports
  }
};

const puckTemplateEditorHeight = 820;

function blankData(): VisualPageLayoutData {
  return { root: { props: { title: "" } }, content: [], zones: {} };
}

function cloneLayoutData(data?: VisualPageLayoutData): VisualPageLayoutData {
  return data ? JSON.parse(JSON.stringify(data)) as VisualPageLayoutData : blankData();
}

function customSectionDefaultProps(moduleType: CustomSectionModuleType = "media") {
  const moduleLabel = getCustomSectionModuleLabel(moduleType);

  return {
    moduleType,
    eyebrow: "Custom section",
    title: moduleLabel,
    body: "在右侧属性面板编辑标题、正文、图片、视频、按钮和布局。",
    mediaLibraryUrl: "/assets/current-template/hero-tooling-range.jpg",
    mediaUrl: "/assets/current-template/hero-tooling-range.jpg",
    imageMode: moduleType === "text" || moduleType === "cta" ? "none" : "single",
    imageItems: [
      {
        source: "/assets/current-template/hero-tooling-range.jpg",
        url: "",
        alt: "KeyproTools tooling image",
        caption: "",
        linkHref: ""
      }
    ],
    imageUrls: "",
    imageLayout: "grid",
    imageFit: "cover",
    imageAspect: "wide",
    imageLimit: 0,
    imageFrame: "soft",
    imageTone: "normal",
    backgroundImageUrl: "",
    videoUrl: "",
    videoPosterUrl: "",
    buttonLabel: "了解更多",
    buttonHref: "#rfq",
    buttonStyle: "primary",
    layout: moduleType === "text" || moduleType === "cta" ? "stacked" : "media-left",
    align: "left",
    width: "contained",
    tone: "light",
    spacing: "normal"
  };
}

function field(type: "text" | "textarea" | "number", label: string, extra: Record<string, unknown> = {}) {
  return { type, label, ...extra };
}

function selectField(label: string, options: { label: string; value: string | number | boolean }[]) {
  return { type: "select" as const, label, options };
}

function radioField(label: string, options: { label: string; value: string | number | boolean }[]) {
  return { type: "radio" as const, label, options };
}

function booleanField(label: string) {
  return {
    type: "radio" as const,
    label,
    options: [
      { label: "显示", value: true },
      { label: "隐藏", value: false }
    ]
  };
}

function compactLabel(value: string, fallback: string) {
  return value.length > 42 ? `${value.slice(0, 39)}...` : value || fallback;
}

function createMediaPickerItems(state: AdminState, kind: MediaPickerKind) {
  const seen = new Set<string>();
  const items: MediaPickerItem[] = [];
  const push = (label: string, value: string | undefined, source: string) => {
    const normalized = value?.trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    items.push({ label: compactLabel(label, normalized), source, value: normalized, kind });
  };

  state.uploadedFiles
    .filter((file) => file.enabled !== false)
    .filter((file) => {
      if (kind === "image") return file.mimeType?.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(file.url);
      return file.mimeType?.startsWith("video/") || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(file.url);
    })
    .forEach((file) => push(file.description?.zh || file.description?.en || file.name, file.url, "媒体库"));

  if (kind === "image") {
    state.templateSettings.heroSlides.forEach((slide) => push(slide.alt?.zh || slide.alt?.en || slide.id, slide.imageUrl, "首屏轮播"));
    state.products.forEach((product) => push(product.name.zh || product.name.en || product.slug, product.imageUrl, "产品图片"));
    state.articles.forEach((article) => push(article.title.zh || article.title.en || article.slug, article.coverImageUrl, "文章封面"));
  }

  return items;
}

function getMediaPickerItemLabel(items: MediaPickerItem[], value: string, fallback: string) {
  const item = items.find((candidate) => candidate.value === value);
  return item ? `${item.source}：${item.label}` : compactLabel(value, fallback);
}

function PuckMediaPickerField({
  id,
  items,
  kind,
  label,
  onChange,
  readOnly,
  value
}: {
  id: string;
  items: MediaPickerItem[];
  kind: MediaPickerKind;
  label: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  value?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedValue = typeof value === "string" ? value : "";
  const selectedItem = items.find((item) => item.value === selectedValue);
  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => `${item.source} ${item.label} ${item.value}`.toLowerCase().includes(normalized));
  }, [items, query]);

  return (
    <div className="puck-media-picker-field">
      <span className="puck-media-picker-label">{label}</span>
      <button
        aria-haspopup="dialog"
        aria-expanded={open}
        className="puck-media-picker-trigger"
        disabled={readOnly}
        id={id}
        type="button"
        onClick={() => setOpen(true)}
      >
        <span className="puck-media-picker-trigger-preview" aria-hidden="true">
          {selectedValue && kind === "image" ? (
            <img src={selectedValue} alt="" loading="lazy" />
          ) : kind === "video" ? (
            <Video size={16} />
          ) : (
            <ImageIcon size={16} />
          )}
        </span>
        <span className="puck-media-picker-trigger-copy">
          <strong>{selectedValue ? getMediaPickerItemLabel(items, selectedValue, "当前图片 URL") : `从媒体库选择${kind === "video" ? "视频" : "图片"}`}</strong>
          <small>{selectedValue || "点击打开媒体库弹窗"}</small>
        </span>
      </button>
      {selectedValue ? (
        <button
          className="puck-media-picker-clear"
          disabled={readOnly}
          type="button"
          onClick={() => onChange("")}
        >
          清空选择
        </button>
      ) : null}
      {open ? (
        <div className="puck-media-picker-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <div
            aria-labelledby={`${id}-title`}
            aria-modal="true"
            className="puck-media-picker-modal"
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="puck-media-picker-modal-head">
              <div>
                <h3 id={`${id}-title`}>选择{kind === "video" ? "视频" : "图片"}</h3>
                <span>{kind === "video" ? "从已上传视频中选择，也可以保留右侧手填 URL。" : "包含媒体库、首屏轮播、产品图和文章封面。"}</span>
              </div>
              <button aria-label="关闭媒体库" type="button" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <label className="puck-media-picker-search">
              <Search size={15} />
              <input
                autoFocus
                placeholder="搜索名称、来源或 URL"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="puck-media-picker-grid">
              {filteredItems.map((item) => (
                <button
                  className={`puck-media-picker-card${item.value === selectedValue ? " is-selected" : ""}`}
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <span className="puck-media-picker-card-preview">
                    {item.kind === "image" ? <img src={item.value} alt="" loading="lazy" /> : <Video size={24} />}
                  </span>
                  <span className="puck-media-picker-card-copy">
                    <strong>{item.label}</strong>
                    <small>{item.source}</small>
                  </span>
                </button>
              ))}
              {filteredItems.length === 0 ? (
                <div className="puck-media-picker-empty">没有匹配的媒体资源。</div>
              ) : null}
            </div>
            <div className="puck-media-picker-modal-actions">
              <button type="button" onClick={() => onChange("")}>不选择</button>
              <button type="button" onClick={() => setOpen(false)}>完成</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function mediaPickerField(label: string, items: MediaPickerItem[], kind: MediaPickerKind) {
  return {
    type: "custom" as const,
    label,
    render: ({ id, value, onChange, readOnly }: { id: string; value?: string; onChange: (value: string) => void; readOnly?: boolean }) => (
      <PuckMediaPickerField id={id} items={items} kind={kind} label={label} value={value} onChange={onChange} readOnly={readOnly} />
    )
  };
}

function imageCountField() {
  return field("number", "图片显示张数（0 为全部）", { min: 0, max: 12 });
}

function imageListField(label: string, mediaItems: MediaPickerItem[]) {
  return {
    type: "array" as const,
    label,
    min: 0,
    max: 12,
    arrayFields: {
      source: mediaPickerField("媒体库/已有图片", mediaItems, "image"),
      url: field("text", "外部图片 URL"),
      alt: field("text", "替代文字 Alt"),
      caption: field("text", "图片说明"),
      linkHref: field("text", "点击链接")
    },
    defaultItemProps: {
      source: "",
      url: "",
      alt: "",
      caption: "",
      linkHref: ""
    },
    getItemSummary: (item: { source?: string; url?: string; alt?: string; caption?: string }, index?: number) => (
      item.caption || item.alt || item.source || item.url || `图片 ${(index ?? 0) + 1}`
    )
  };
}

function getCustomSectionModuleType(value: unknown): CustomSectionModuleType {
  return value === "text" || value === "video" || value === "cta" ? value : "media";
}

function getCustomSectionModuleLabel(value: unknown) {
  const moduleType = getCustomSectionModuleType(value);
  if (moduleType === "text") return "纯文字模块";
  if (moduleType === "video") return "视频模块";
  if (moduleType === "cta") return "行动按钮模块";
  return "图文模块";
}

function createCustomSectionFields(
  moduleType: CustomSectionModuleType,
  imageItems: MediaPickerItem[],
  videoItems: MediaPickerItem[],
  options: { includeModuleType?: boolean } = {}
) {
  const includeModuleType = options.includeModuleType ?? true;
  const moduleTypeField = {
    type: "select" as const,
    label: "模块类型",
    options: [
      { label: "图文模块", value: "media" },
      { label: "纯文字模块", value: "text" },
      { label: "视频模块", value: "video" },
      { label: "行动按钮模块", value: "cta" }
    ]
  };
  const contentFields = {
    ...(includeModuleType ? { moduleType: moduleTypeField } : {}),
    eyebrow: field("text", "眉标"),
    title: field("textarea", "标题"),
    body: field("textarea", "正文 Markdown")
  };
  const layoutFields = {
    align: radioField("对齐", [
      { label: "左对齐", value: "left" },
      { label: "居中", value: "center" },
      { label: "右对齐", value: "right" }
    ]),
    width: radioField("模块宽度", [
      { label: "页面宽度", value: "contained" },
      { label: "窄版", value: "narrow" },
      { label: "全宽", value: "full" }
    ]),
    tone: radioField("背景", [
      { label: "白色", value: "light" },
      { label: "浅色强调", value: "tint" },
      { label: "深色强调", value: "dark" }
    ]),
    spacing: radioField("间距", [
      { label: "紧凑", value: "compact" },
      { label: "标准", value: "normal" },
      { label: "宽松", value: "large" }
    ])
  };
  const buttonFields = {
    buttonLabel: field("text", "按钮文字"),
    buttonHref: field("text", "按钮链接"),
    buttonStyle: radioField("按钮样式", [
      { label: "主按钮", value: "primary" },
      { label: "次按钮", value: "secondary" },
      { label: "文字链接", value: "text" }
    ])
  };
  const splitLayoutField = {
    layout: radioField("布局", [
      { label: "上下排列", value: "stacked" },
      { label: "媒体在左", value: "media-left" },
      { label: "媒体在右", value: "media-right" }
    ])
  };

  if (moduleType === "text") {
    return {
      ...contentFields,
      ...layoutFields
    };
  }

  if (moduleType === "video") {
    return {
      ...contentFields,
      videoLibraryUrl: mediaPickerField("视频：从媒体库选择", videoItems, "video"),
      videoUrl: field("text", "视频 URL / iframe URL"),
      videoPosterUrl: mediaPickerField("视频封面", imageItems, "image"),
      ...splitLayoutField,
      ...buttonFields,
      ...layoutFields
    };
  }

  if (moduleType === "cta") {
    return {
      ...contentFields,
      ...buttonFields,
      backgroundImageUrl: mediaPickerField("背景图：从媒体库选择", imageItems, "image"),
      ...layoutFields
    };
  }

  return {
    ...contentFields,
    imageMode: selectField("图片模式", [
      { label: "不显示图片", value: "none" },
      { label: "单图", value: "single" },
      { label: "图库", value: "gallery" },
      { label: "轮播", value: "carousel" },
      { label: "背景图", value: "background" }
    ]),
    mediaLibraryUrl: mediaPickerField("主图：从媒体库选择", imageItems, "image"),
    mediaUrl: field("text", "主图：手填 URL"),
    imageItems: imageListField("逐张图片（可多选）", imageItems),
    imageUrls: field("textarea", "批量图片 URL（每行一个）"),
    imageLimit: imageCountField(),
    imageLayout: radioField("图片布局", [
      { label: "网格", value: "grid" },
      { label: "马赛克", value: "mosaic" },
      { label: "横向滑动", value: "strip" },
      { label: "堆叠", value: "stacked" }
    ]),
    imageFit: radioField("图片裁切", [
      { label: "填满裁切", value: "cover" },
      { label: "完整显示", value: "contain" }
    ]),
    imageAspect: radioField("图片比例", [
      { label: "16:9", value: "wide" },
      { label: "4:3", value: "standard" },
      { label: "1:1", value: "square" },
      { label: "3:4", value: "portrait" }
    ]),
    imageFrame: radioField("图片边框", [
      { label: "柔和卡片", value: "soft" },
      { label: "无边框", value: "none" },
      { label: "细线", value: "line" },
      { label: "重阴影", value: "shadow" }
    ]),
    imageTone: radioField("图片效果", [
      { label: "原图", value: "normal" },
      { label: "冷色工业", value: "cool" },
      { label: "黑白", value: "mono" }
    ]),
    backgroundImageUrl: mediaPickerField("背景图：从媒体库选择", imageItems, "image"),
    ...splitLayoutField,
    ...buttonFields,
    ...layoutFields
  };
}

function createPageOptions(state: AdminState): PageOption[] {
  const labels = getBaseLayoutLabels();
  const layoutByKey = new Map(state.pageLayouts.map((layout) => [layout.key, layout]));
  const baseOptions = baseLayoutOrder.map((key) => ({
    key,
    label: labels[key as keyof typeof labels] ?? key,
    layout: layoutByKey.get(key)
  }));
  const pageOptions = state.pages
    .filter((page) => page.status !== "trash")
    .map((page) => {
      const key = `page:${page.slug}` as PageLayoutKey;
      return {
        key,
        label: `页面：${page.title.zh || page.title.en || page.slug}`,
        layout: layoutByKey.get(key)
      };
    });

  return [...baseOptions, ...pageOptions];
}

function previewMainClassName(layoutKey: PageLayoutKey) {
  if (layoutKey === "home") return "puck-public-page";
  if (layoutKey === "products-index") return "subpage products-subpage puck-public-page";
  if (layoutKey === "articles-index") return "subpage articles-subpage puck-public-page";
  return "subpage puck-public-page";
}

function preventPreviewNavigation(event: MouseEvent<HTMLElement>) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target?.closest("a")) return;
  event.preventDefault();
}

function PuckPreviewShell({
  children,
  layoutKey,
  locale,
  state
}: {
  children: ReactNode;
  layoutKey: PageLayoutKey;
  locale: LocaleCode;
  state: AdminState;
}) {
  return (
    <div className="puck-public-preview-shell" onClickCapture={preventPreviewNavigation}>
      {layoutKey === "home" ? null : (
        <PublicHeaderShell
          brandName={state.siteSettings.title}
          enabledLocales={state.enabledLocales}
          locale={locale}
          navigation={state.navigation}
          preventNavigation
        />
      )}
      <main className={previewMainClassName(layoutKey)}>
        {children}
      </main>
      <PublicFooterShell
        brandName={state.siteSettings.title}
        channels={state.contactChannels}
        locale={locale}
        navigation={state.navigation}
        preventNavigation
      />
    </div>
  );
}

function getPuckItemProps(item: VisualPageLayoutData["content"][number]) {
  return item.props && typeof item.props === "object" ? item.props as Record<string, unknown> : {};
}

function getPuckItemTitle(config: Config, item: VisualPageLayoutData["content"][number], index: number) {
  const props = getPuckItemProps(item);
  const componentLabel = config.components[item.type]?.label ?? item.type;
  const title = typeof props.title === "string" ? props.title.trim() : "";
  const presetLabel = customSectionPresetLabels[item.type];

  if (presetLabel) {
    return {
      title: presetLabel,
      detail: title && title !== presetLabel ? title : "自定义模块"
    };
  }

  if (item.type === "CustomSection") {
    const moduleLabel = getCustomSectionModuleLabel(props.moduleType);
    return {
      title: moduleLabel,
      detail: title && title !== "自定义模块" ? title : "自定义模块"
    };
  }

  return {
    title: componentLabel,
    detail: title || `模块 ${index + 1}`
  };
}

function PuckTemplateBlocksPanel({ canManage }: { canManage: boolean }) {
  const appState = useTypedPuck((puck) => puck.appState);
  const config = useTypedPuck((puck) => puck.config);
  const dispatch = useTypedPuck((puck) => puck.dispatch);
  const leftSideBarWidth = useTypedPuck((puck) => puck.appState.ui.leftSideBarWidth);
  const selectedItem = useTypedPuck((puck) => puck.selectedItem);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [structureCollapsed, setStructureCollapsed] = useState(false);
  const [libraryCollapsed, setLibraryCollapsed] = useState(false);
  const lastExpandedWidthRef = useRef(puckLeftPanelExpandedWidth);
  const content = (appState.data?.content ?? []) as VisualPageLayoutData["content"];
  const selectedId = selectedItem?.props?.id;

  useEffect(() => {
    if (!leftPanelCollapsed && typeof leftSideBarWidth === "number" && leftSideBarWidth > puckLeftPanelCollapsedWidth + 20) {
      lastExpandedWidthRef.current = leftSideBarWidth;
    }
  }, [leftPanelCollapsed, leftSideBarWidth]);

  const selectItem = useCallback((index: number) => {
    dispatch({ type: "setUi", ui: { itemSelector: { index, zone: rootDropZone } } });
  }, [dispatch]);

  const moveItem = useCallback((sourceIndex: number, destinationIndex: number) => {
    if (!canManage || sourceIndex === destinationIndex || sourceIndex < 0 || destinationIndex < 0 || sourceIndex >= content.length || destinationIndex >= content.length) return;
    dispatch({
      type: "reorder",
      sourceIndex,
      destinationIndex,
      destinationZone: rootDropZone,
      recordHistory: true
    });
    dispatch({ type: "setUi", ui: { itemSelector: { index: destinationIndex, zone: rootDropZone } } });
  }, [canManage, content.length, dispatch]);

  const handleDrop = (event: DragEvent<HTMLLIElement>, destinationIndex: number) => {
    event.preventDefault();
    const rawIndex = event.dataTransfer.getData("text/plain");
    const sourceIndex = dragIndex ?? Number(rawIndex);
    setDragIndex(null);
    if (!Number.isFinite(sourceIndex)) return;
    moveItem(sourceIndex, destinationIndex);
  };

  const toggleLeftPanel = useCallback(() => {
    if (leftPanelCollapsed) {
      dispatch({
        type: "setUi",
        ui: {
          leftSideBarVisible: true,
          leftSideBarWidth: lastExpandedWidthRef.current || puckLeftPanelExpandedWidth
        }
      });
      setLeftPanelCollapsed(false);
      return;
    }

    if (typeof leftSideBarWidth === "number" && leftSideBarWidth > puckLeftPanelCollapsedWidth + 20) {
      lastExpandedWidthRef.current = leftSideBarWidth;
    }
    dispatch({
      type: "setUi",
      ui: {
        leftSideBarVisible: true,
        leftSideBarWidth: puckLeftPanelCollapsedWidth
      }
    });
    setLeftPanelCollapsed(true);
  }, [dispatch, leftPanelCollapsed, leftSideBarWidth]);

  if (leftPanelCollapsed) {
    return (
      <div className="puck-template-left-panel is-rail-collapsed">
        <button
          aria-label="展开左侧模块面板"
          className="puck-template-rail-toggle"
          title="展开左侧模块面板"
          type="button"
          onClick={toggleLeftPanel}
        >
          <ChevronsRight size={15} />
          <span>模块</span>
        </button>
      </div>
    );
  }

  return (
    <div className="puck-template-left-panel">
      <div className="puck-template-left-panel-actions">
        <button
          aria-label="收起左侧模块面板"
          className="puck-template-left-collapse-button"
          title="收起左侧模块面板"
          type="button"
          onClick={toggleLeftPanel}
        >
          <ChevronsLeft size={14} />
          <span>收起左栏</span>
        </button>
      </div>
      <section className={`puck-template-structure-panel${structureCollapsed ? " is-collapsed" : ""}`}>
        <div className="puck-template-panel-head">
          <div>
            <strong>当前页面结构</strong>
            <span>点击编辑；拖拽或用箭头调整顺序</span>
          </div>
          <button
            aria-controls="puck-template-structure-body"
            aria-expanded={!structureCollapsed}
            aria-label={structureCollapsed ? "展开当前页面结构" : "收起当前页面结构"}
            className="puck-template-panel-toggle"
            type="button"
            onClick={() => setStructureCollapsed((collapsed) => !collapsed)}
          >
            <ChevronDown size={15} />
          </button>
        </div>
        <div className="puck-template-panel-body" hidden={structureCollapsed} id="puck-template-structure-body">
          {content.length > 0 ? (
            <ol className="puck-template-structure-list">
              {content.map((item, index) => {
                const itemProps = getPuckItemProps(item);
                const itemId = typeof itemProps.id === "string" ? itemProps.id : "";
                const isSelected = Boolean(itemId && selectedId === itemId);
                const label = getPuckItemTitle(config, item, index);

                return (
                  <li
                    className={`puck-template-structure-item${isSelected ? " is-selected" : ""}${dragIndex === index ? " is-dragging" : ""}`}
                    draggable={canManage}
                    key={itemId || `${item.type}-${index}`}
                    onDragEnd={() => setDragIndex(null)}
                    onDragOver={(event) => {
                      if (!canManage) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDragStart={(event) => {
                      if (!canManage) return;
                      setDragIndex(index);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", String(index));
                    }}
                    onDrop={(event) => handleDrop(event, index)}
                  >
                    <button className="puck-template-structure-main" type="button" onClick={() => selectItem(index)}>
                      <GripVertical size={15} aria-hidden="true" />
                      <span>
                        <strong>{label.title}</strong>
                        <small>{label.detail}</small>
                      </span>
                    </button>
                    <span className="puck-template-structure-move">
                      <button aria-label="上移模块" disabled={!canManage || index === 0} type="button" onClick={() => moveItem(index, index - 1)}>
                        <ArrowUp size={13} />
                      </button>
                      <button aria-label="下移模块" disabled={!canManage || index === content.length - 1} type="button" onClick={() => moveItem(index, index + 1)}>
                        <ArrowDown size={13} />
                      </button>
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="puck-template-structure-empty">当前页面还没有模块。</div>
          )}
        </div>
      </section>
      <section className={`puck-template-component-library${libraryCollapsed ? " is-collapsed" : ""}`}>
        <div className="puck-template-panel-head">
          <div>
            <strong>添加模块</strong>
            <span>从这里拖入画布</span>
          </div>
          <button
            aria-controls="puck-template-library-body"
            aria-expanded={!libraryCollapsed}
            aria-label={libraryCollapsed ? "展开添加模块" : "收起添加模块"}
            className="puck-template-panel-toggle"
            type="button"
            onClick={() => setLibraryCollapsed((collapsed) => !collapsed)}
          >
            <ChevronDown size={15} />
          </button>
        </div>
        <div className="puck-template-panel-body" hidden={libraryCollapsed} id="puck-template-library-body">
          <Puck.Components />
        </div>
      </section>
    </div>
  );
}

function createPuckPlugins(canManage: boolean): Plugin[] {
  return [
    {
      name: "blocks",
      label: "Blocks",
      icon: <Layers size={16} />,
      render: () => <PuckTemplateBlocksPanel canManage={canManage} />
    }
  ];
}

function createConfig(state: AdminState, locale: LocaleCode, layoutKey: PageLayoutKey): Config {
  const firstProduct = state.products[0];
  const firstArticle = state.articles.find((article) => article.status === "published") ?? state.articles[0];
  const imageMediaItems = createMediaPickerItems(state, "image");
  const videoMediaItems = createMediaPickerItems(state, "video");
  const customSectionFields = createCustomSectionFields("media", imageMediaItems, videoMediaItems);
  const customMediaSectionFields = createCustomSectionFields("media", imageMediaItems, videoMediaItems, { includeModuleType: false });
  const customTextSectionFields = createCustomSectionFields("text", imageMediaItems, videoMediaItems, { includeModuleType: false });
  const customVideoSectionFields = createCustomSectionFields("video", imageMediaItems, videoMediaItems, { includeModuleType: false });
  const customCtaSectionFields = createCustomSectionFields("cta", imageMediaItems, videoMediaItems, { includeModuleType: false });
  const render = (type: string) => {
    function PuckBlockPreview(props: Record<string, unknown>) {
      return (
        <div className="puck-editor-preview-scope">
          <PuckVisualBlock
            currentArticle={firstArticle}
            currentProduct={firstProduct}
            item={{ type, props: { id: String(props.id ?? type), ...props } }}
            locale={locale}
            state={state}
          />
        </div>
      );
    }

    PuckBlockPreview.displayName = `${type}Preview`;
    return PuckBlockPreview;
  };

  return {
    root: {
      render: ({ children }: { children: ReactNode }) => (
        <PuckPreviewShell layoutKey={layoutKey} locale={locale} state={state}>
          {children}
        </PuckPreviewShell>
      )
    },
    categories: {
      custom: {
        title: "添加模块类型",
        components: ["CustomMediaSection", "CustomTextSection", "CustomVideoSection", "CustomCtaSection", "CustomSection"],
        defaultExpanded: true
      },
      other: {
        visible: false
      }
    },
    components: {
      HomeNavigation: {
        label: "首页导航",
        fields: {
          ctaLabel: field("text", "按钮文字")
        },
        defaultProps: { ctaLabel: "获取报价" },
        render: render("HomeNavigation")
      },
      HeroSection: {
        label: "首屏",
        fields: {
          eyebrow: field("text", "眉标"),
          title: field("textarea", "标题"),
          body: field("textarea", "说明"),
          backgroundMode: selectField("背景类型", [
            { label: "单张图片", value: "single" },
            { label: "图片轮播", value: "carousel" },
            { label: "纯色/渐变", value: "none" }
          ]),
          mediaLibraryUrl: mediaPickerField("从媒体库选择背景", imageMediaItems, "image"),
          imageUrl: field("text", "手填背景图片 URL"),
          imageItems: imageListField("轮播/备用图片", imageMediaItems),
          imageUrls: field("textarea", "批量图片 URL（每行一个）"),
          overlayTone: radioField("遮罩强度", [
            { label: "深色", value: "dark" },
            { label: "品牌色", value: "brand" },
            { label: "浅色", value: "light" }
          ]),
          contentPosition: radioField("内容位置", [
            { label: "左侧", value: "left" },
            { label: "居中", value: "center" },
            { label: "右侧", value: "right" }
          ]),
          heroHeight: radioField("首屏高度", [
            { label: "紧凑", value: "compact" },
            { label: "标准", value: "standard" },
            { label: "沉浸", value: "tall" }
          ]),
          primaryLabel: field("text", "主按钮文字"),
          primaryHref: field("text", "主按钮链接"),
          secondaryLabel: field("text", "次按钮文字"),
          secondaryHref: field("text", "次按钮链接"),
          buttonStyle: radioField("按钮样式", [
            { label: "实心 + 描边", value: "default" },
            { label: "双实心", value: "solid" },
            { label: "极简文字", value: "minimal" }
          ]),
          showMetrics: booleanField("指标"),
          metric1Value: field("text", "指标 1 数值"),
          metric1Label: field("text", "指标 1 说明"),
          metric2Value: field("text", "指标 2 数值"),
          metric2Label: field("text", "指标 2 说明"),
          metric3Value: field("text", "指标 3 数值"),
          metric3Label: field("text", "指标 3 说明")
        },
        defaultProps: {
          eyebrow: "CNC cutting tools",
          title: "Carbide end mills and drill bits ready for distributor programs.",
          body: "Edit this hero directly in Puck.",
          backgroundMode: "single",
          mediaLibraryUrl: "",
          imageUrl: "",
          imageItems: [],
          imageUrls: "",
          overlayTone: "dark",
          contentPosition: "left",
          heroHeight: "standard",
          primaryLabel: "Request Quote",
          primaryHref: "#rfq",
          secondaryLabel: "Products",
          secondaryHref: "/products",
          buttonStyle: "default",
          showMetrics: true,
          metric1Value: "0.2-25mm",
          metric1Label: "End mill range",
          metric2Value: "OEM",
          metric2Label: "Laser marking",
          metric3Value: "Export",
          metric3Label: "Packing"
        },
        render: render("HeroSection")
      },
      PageHero: {
        label: "页面标题",
        fields: {
          eyebrow: field("text", "眉标"),
          title: field("textarea", "标题"),
          body: field("textarea", "说明"),
          mediaLibraryUrl: mediaPickerField("背景/配图", imageMediaItems, "image"),
          imageUrl: field("text", "手填图片 URL"),
          align: radioField("文字对齐", [
            { label: "左对齐", value: "left" },
            { label: "居中", value: "center" }
          ]),
          tone: radioField("背景色调", [
            { label: "白色", value: "light" },
            { label: "浅色强调", value: "tint" },
            { label: "深色", value: "dark" }
          ]),
          height: radioField("高度", [
            { label: "紧凑", value: "compact" },
            { label: "标准", value: "standard" },
            { label: "宽松", value: "large" }
          ])
        },
        defaultProps: { eyebrow: "Page", title: "Page title", body: "Page summary", mediaLibraryUrl: "", imageUrl: "", align: "left", tone: "light", height: "standard" },
        render: render("PageHero")
      },
      TextSection: {
        label: "文本区块",
        fields: {
          eyebrow: field("text", "眉标"),
          title: field("textarea", "标题"),
          body: field("textarea", "正文"),
          buttonLabel: field("text", "按钮文字"),
          buttonHref: field("text", "按钮链接"),
          mediaLibraryUrl: mediaPickerField("配图", imageMediaItems, "image"),
          imageUrl: field("text", "手填配图 URL"),
          layout: radioField("布局", [
            { label: "纯文字", value: "text" },
            { label: "图左文右", value: "media-left" },
            { label: "文左图右", value: "media-right" }
          ]),
          width: radioField("内容宽度", [
            { label: "窄", value: "narrow" },
            { label: "标准", value: "normal" },
            { label: "宽", value: "wide" }
          ]),
          align: {
            type: "radio",
            label: "对齐",
            options: [
              { label: "左对齐", value: "left" },
              { label: "居中", value: "center" }
            ]
          },
          tone: {
            type: "radio",
            label: "色调",
            options: [
              { label: "浅色", value: "light" },
              { label: "浅色强调", value: "tint" },
              { label: "深色", value: "dark" }
            ]
          },
          spacing: {
            type: "radio",
            label: "间距",
            options: [
              { label: "紧凑", value: "compact" },
              { label: "标准", value: "normal" },
              { label: "宽松", value: "large" }
            ]
          }
        },
        defaultProps: { eyebrow: "Section", title: "Text section", body: "Write your content here.", buttonLabel: "", buttonHref: "#rfq", mediaLibraryUrl: "", imageUrl: "", layout: "text", width: "normal", align: "left", tone: "light", spacing: "normal" },
        render: render("TextSection")
      },
      RichTextBlock: {
        label: "富文本正文",
        fields: {
          body: field("textarea", "正文 Markdown"),
          width: radioField("正文宽度", [
            { label: "窄", value: "narrow" },
            { label: "标准", value: "normal" },
            { label: "宽", value: "wide" }
          ]),
          tone: radioField("背景", [
            { label: "白色", value: "light" },
            { label: "浅色强调", value: "tint" },
            { label: "深色", value: "dark" }
          ])
        },
        defaultProps: { body: "Write Markdown content here.", width: "normal", tone: "light" },
        render: render("RichTextBlock")
      },
      ImageGallery: {
        label: "图库",
        fields: {
          eyebrow: field("text", "眉标"),
          title: field("textarea", "标题"),
          body: field("textarea", "说明"),
          mediaLibraryUrl: mediaPickerField("主图/首图", imageMediaItems, "image"),
          imageUrls: field("textarea", "图片 URL（每行一个）"),
          imageItems: imageListField("逐张选择图片", imageMediaItems),
          imageLimit: imageCountField(),
          layout: {
            type: "radio",
            label: "布局",
            options: [
              { label: "网格", value: "grid" },
              { label: "马赛克", value: "mosaic" },
              { label: "单图", value: "single" },
              { label: "横向滑动", value: "strip" },
              { label: "轮播", value: "carousel" }
            ]
          },
          imageFit: radioField("图片裁切", [
            { label: "填满裁切", value: "cover" },
            { label: "完整显示", value: "contain" }
          ]),
          imageAspect: radioField("图片比例", [
            { label: "4:3", value: "standard" },
            { label: "16:9", value: "wide" },
            { label: "1:1", value: "square" },
            { label: "3:4", value: "portrait" }
          ])
        },
        defaultProps: { eyebrow: "Gallery", title: "Image gallery", body: "", mediaLibraryUrl: "", imageUrls: "", imageItems: [], layout: "grid", imageFit: "cover", imageAspect: "standard" },
        render: render("ImageGallery")
      },
      VideoSection: {
        label: "视频",
        fields: {
          eyebrow: field("text", "眉标"),
          title: field("textarea", "标题"),
          body: field("textarea", "说明"),
          mediaLibraryUrl: mediaPickerField("从媒体库选择视频", videoMediaItems, "video"),
          mediaUrl: field("text", "视频 URL / iframe URL"),
          posterUrl: mediaPickerField("封面图", imageMediaItems, "image"),
          layout: radioField("布局", [
            { label: "视频在上", value: "stacked" },
            { label: "视频在左", value: "media-left" },
            { label: "视频在右", value: "media-right" }
          ]),
          tone: radioField("背景", [
            { label: "白色", value: "light" },
            { label: "浅色强调", value: "tint" },
            { label: "深色", value: "dark" }
          ])
        },
        defaultProps: { eyebrow: "Video", title: "Video section", body: "", mediaLibraryUrl: "", mediaUrl: "", posterUrl: "", layout: "stacked", tone: "light" },
        render: render("VideoSection")
      },
      CtaSection: {
        label: "行动按钮",
        fields: {
          eyebrow: field("text", "眉标"),
          title: field("textarea", "标题"),
          body: field("textarea", "说明"),
          buttonLabel: field("text", "按钮文字"),
          href: field("text", "按钮链接"),
          secondaryLabel: field("text", "次按钮文字"),
          secondaryHref: field("text", "次按钮链接"),
          mediaLibraryUrl: mediaPickerField("背景/配图", imageMediaItems, "image"),
          imageUrl: field("text", "手填背景图片 URL"),
          align: radioField("对齐", [
            { label: "左对齐", value: "left" },
            { label: "居中", value: "center" },
            { label: "两端布局", value: "split" }
          ]),
          tone: radioField("背景", [
            { label: "深色", value: "dark" },
            { label: "品牌色", value: "brand" },
            { label: "浅色", value: "light" }
          ]),
          spacing: radioField("间距", [
            { label: "紧凑", value: "compact" },
            { label: "标准", value: "normal" },
            { label: "宽松", value: "large" }
          ])
        },
        defaultProps: { eyebrow: "RFQ", title: "Ready to quote?", body: "", buttonLabel: "Contact us", href: "#rfq", secondaryLabel: "", secondaryHref: "/contact", mediaLibraryUrl: "", imageUrl: "", align: "split", tone: "dark", spacing: "normal" },
        render: render("CtaSection")
      },
      ProductList: {
        label: "产品列表",
        fields: {
          eyebrow: field("text", "眉标"),
          title: field("textarea", "标题"),
          body: field("textarea", "说明"),
          limit: field("number", "显示数量（0 为全部）", { min: 0, max: 24 }),
          flat: booleanField("平铺显示"),
          columns: radioField("列数", [
            { label: "自动", value: "auto" },
            { label: "2 列", value: "2" },
            { label: "3 列", value: "3" },
            { label: "4 列", value: "4" }
          ]),
          tone: radioField("背景", [
            { label: "白色", value: "light" },
            { label: "浅色强调", value: "tint" }
          ])
        },
        defaultProps: { eyebrow: "Products", title: "Product catalog", body: "", limit: 0, flat: false, columns: "auto", tone: "light" },
        render: render("ProductList")
      },
      FeatureCards: {
        label: "能力卡片",
        fields: {
          eyebrow: field("text", "眉标"),
          title: field("textarea", "标题"),
          body: field("textarea", "说明"),
          cards: {
            type: "array",
            label: "卡片列表",
            min: 1,
            max: 8,
            arrayFields: {
              title: field("text", "标题"),
              body: field("textarea", "说明"),
              icon: field("text", "图标/短标签"),
              imageUrl: mediaPickerField("配图", imageMediaItems, "image"),
              href: field("text", "链接")
            },
            defaultItemProps: { title: "Capability", body: "", icon: "", imageUrl: "", href: "" },
            getItemSummary: (item: { title?: string; icon?: string }, index?: number) => item.title || item.icon || `卡片 ${(index ?? 0) + 1}`
          },
          card1Title: field("text", "卡片 1 标题"),
          card1Body: field("textarea", "卡片 1 说明"),
          card2Title: field("text", "卡片 2 标题"),
          card2Body: field("textarea", "卡片 2 说明"),
          card3Title: field("text", "卡片 3 标题"),
          card3Body: field("textarea", "卡片 3 说明"),
          tone: {
            type: "radio",
            label: "色调",
            options: [
              { label: "浅色", value: "light" },
              { label: "浅色强调", value: "tint" },
              { label: "深色", value: "dark" }
            ]
          },
          columns: radioField("列数", [
            { label: "自动", value: "auto" },
            { label: "2 列", value: "2" },
            { label: "3 列", value: "3" },
            { label: "4 列", value: "4" }
          ])
        },
        defaultProps: {
          eyebrow: "Capability",
          title: "Factory capability",
          body: "",
          cards: [],
          card1Title: "OEM tooling",
          card1Body: "",
          card2Title: "Coating",
          card2Body: "",
          card3Title: "Private label",
          card3Body: "",
          tone: "dark",
          columns: "auto"
        },
        render: render("FeatureCards")
      },
      MarketSection: {
        label: "市场清单",
        fields: {
          eyebrow: field("text", "眉标"),
          title: field("textarea", "标题"),
          body: field("textarea", "说明"),
          checklistTitle: field("text", "清单标题"),
          item1: field("textarea", "清单 1"),
          item2: field("textarea", "清单 2"),
          item3: field("textarea", "清单 3"),
          checklistItems: {
            type: "array",
            label: "清单条目",
            min: 0,
            max: 12,
            arrayFields: {
              label: field("text", "条目标题"),
              body: field("textarea", "条目说明")
            },
            defaultItemProps: { label: "", body: "" },
            getItemSummary: (item: { label?: string; body?: string }, index?: number) => item.label || item.body || `条目 ${(index ?? 0) + 1}`
          },
          sideTitle: field("text", "右侧面板标题"),
          sideBody: field("textarea", "右侧面板说明"),
          mediaLibraryUrl: mediaPickerField("右侧配图", imageMediaItems, "image"),
          layout: radioField("布局", [
            { label: "文字 + 清单", value: "checklist" },
            { label: "文字 + 图片", value: "image" },
            { label: "上下排列", value: "stacked" }
          ]),
          tone: radioField("背景", [
            { label: "白色", value: "light" },
            { label: "浅色强调", value: "tint" },
            { label: "深色", value: "dark" }
          ])
        },
        defaultProps: {
          eyebrow: "Markets",
          title: "Markets and RFQ checklist",
          body: "",
          checklistTitle: "RFQ checklist",
          item1: "",
          item2: "",
          item3: "",
          checklistItems: [],
          sideTitle: "",
          sideBody: "",
          mediaLibraryUrl: "",
          layout: "checklist",
          tone: "light"
        },
        render: render("MarketSection")
      },
      ArticleList: {
        label: "文章列表",
        fields: {
          eyebrow: field("text", "眉标"),
          title: field("textarea", "标题"),
          body: field("textarea", "说明"),
          limit: field("number", "显示数量（0 为全部）", { min: 0, max: 24 }),
          columns: radioField("列数", [
            { label: "自动", value: "auto" },
            { label: "2 列", value: "2" },
            { label: "3 列", value: "3" }
          ]),
          showExcerpt: booleanField("摘要"),
          tone: radioField("背景", [
            { label: "白色", value: "light" },
            { label: "浅色强调", value: "tint" }
          ])
        },
        defaultProps: { eyebrow: "Articles", title: "Technical articles", body: "", limit: 0, columns: "auto", showExcerpt: true, tone: "light" },
        render: render("ArticleList")
      },
      ProductDetail: {
        label: "动态产品详情",
        fields: {},
        defaultProps: {},
        render: render("ProductDetail")
      },
      ArticleDetail: {
        label: "动态文章详情",
        fields: {},
        defaultProps: {},
        render: render("ArticleDetail")
      },
      RfqSection: {
        label: "询盘表单",
        fields: {
          eyebrow: field("text", "眉标"),
          title: field("textarea", "标题"),
          body: field("textarea", "说明"),
          guidanceTitle: field("text", "提示标题"),
          guidanceItems: {
            type: "array",
            label: "提示清单",
            min: 0,
            max: 8,
            arrayFields: {
              text: field("text", "提示内容")
            },
            defaultItemProps: { text: "" },
            getItemSummary: (item: { text?: string }, index?: number) => item.text || `提示 ${(index ?? 0) + 1}`
          },
          tone: radioField("背景", [
            { label: "白色", value: "light" },
            { label: "浅色强调", value: "tint" },
            { label: "深色", value: "dark" }
          ])
        },
        defaultProps: { eyebrow: "RFQ", title: "Tell us what to quote.", body: "", guidanceTitle: "", guidanceItems: [], tone: "light" },
        render: render("RfqSection")
      },
      ContactChannels: {
        label: "联系信息",
        fields: {
          eyebrow: field("text", "眉标"),
          title: field("text", "标题"),
          body: field("textarea", "说明"),
          tone: radioField("背景", [
            { label: "白色", value: "light" },
            { label: "浅色强调", value: "tint" },
            { label: "深色", value: "dark" }
          ])
        },
        defaultProps: { eyebrow: "", title: "Contact channels", body: "", tone: "light" },
        render: render("ContactChannels")
      },
      FileList: {
        label: "资料下载",
        fields: {},
        defaultProps: {},
        render: render("FileList")
      },
      CustomMediaSection: {
        label: "图文模块",
        fields: customMediaSectionFields,
        defaultProps: customSectionDefaultProps("media"),
        render: render("CustomSection")
      },
      CustomTextSection: {
        label: "纯文字模块",
        fields: customTextSectionFields,
        defaultProps: customSectionDefaultProps("text"),
        render: render("CustomSection")
      },
      CustomVideoSection: {
        label: "视频模块",
        fields: customVideoSectionFields,
        defaultProps: customSectionDefaultProps("video"),
        render: render("CustomSection")
      },
      CustomCtaSection: {
        label: "行动按钮模块",
        fields: customCtaSectionFields,
        defaultProps: customSectionDefaultProps("cta"),
        render: render("CustomSection")
      },
      CustomSection: {
        label: "自定义模块",
        fields: customSectionFields,
        resolveFields: (data) => {
          const props = "props" in data && data.props && typeof data.props === "object" ? data.props as Record<string, unknown> : data as Record<string, unknown>;
          return createCustomSectionFields(getCustomSectionModuleType(props.moduleType), imageMediaItems, videoMediaItems);
        },
        defaultProps: customSectionDefaultProps(),
        render: render("CustomSection")
      }
    }
  };
}

function PuckTemplateHeaderActions({
  canManage,
  onRequestClose,
  onSave,
  saving
}: {
  canManage: boolean;
  onRequestClose: () => void;
  onSave: (data: Data) => void;
  saving: boolean;
}) {
  const appState = useTypedPuck((puck) => puck.appState);

  return (
    <span className="puck-template-header-actions">
      <button
        className="puck-template-discard-button"
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRequestClose();
        }}
      >
        关闭编辑
      </button>
      <button
        className="puck-template-save-button"
        disabled={!canManage || saving}
        type="button"
        onClick={() => onSave(appState.data as Data)}
      >
        {saving ? "保存中" : "保存"}
      </button>
    </span>
  );
}

export function PuckTemplateEditor({ state, locale, canManage, onStateChange, onStatus }: PuckTemplateEditorProps) {
  const packageInputRef = useRef<HTMLInputElement>(null);
  const options = useMemo(() => createPageOptions(state), [state]);
  const [selectedKey, setSelectedKey] = useState<PageLayoutKey>("home");
  const selectedOption = options.find((option) => option.key === selectedKey) ?? options[0];
  const [draftData, setDraftData] = useState<VisualPageLayoutData>(() => cloneLayoutData(selectedOption?.layout?.data));
  const [saving, setSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [packageBusy, setPackageBusy] = useState(false);
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const selectedOptionKey = selectedOption?.key;
  const selectedOptionUpdatedAt = selectedOption?.layout?.updatedAt;
  const selectedOptionData = selectedOption?.layout?.data;
  const config = useMemo(() => createConfig(state, locale, selectedOptionKey ?? "home"), [state, locale, selectedOptionKey]);
  const puckPlugins = useMemo(() => createPuckPlugins(canManage), [canManage]);
  const permissions: Partial<Permissions> = useMemo(() => ({
    drag: canManage,
    duplicate: canManage,
    delete: canManage,
    edit: canManage,
    insert: canManage
  }), [canManage]);

  useEffect(() => {
    if (!selectedOptionKey) return;
    setDraftData(cloneLayoutData(selectedOptionData));
    setEditorResetKey((current) => current + 1);
    setCloseDialogOpen(false);
  }, [selectedOptionKey, selectedOptionUpdatedAt, selectedOptionData]);

  useEffect(() => {
    if (selectedOption) return;
    setSelectedKey("home");
  }, [selectedOption]);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  const closeEditorWithoutSaving = useCallback(() => {
    setDraftData(cloneLayoutData(selectedOptionData));
    setEditorResetKey((current) => current + 1);
    setIsFullscreen(false);
    setCloseDialogOpen(false);
    onStatus("已关闭编辑，未保存的模板改动已丢弃");
  }, [onStatus, selectedOptionData]);

  const saveLayout = useCallback(async (nextData: Data = draftData) => {
    if (!canManage || !selectedOption) {
      onStatus("当前账号没有前台模板权限");
      return;
    }

    setSaving(true);
    onStatus("正在保存 Puck 页面布局...");

    try {
      const response = await fetch("/api/admin/page-layouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: selectedOption.key,
          label: selectedOption.label,
          data: nextData
        })
      });

      const payload = await response.json() as { state?: AdminState; error?: string };
      if (!response.ok || !payload.state) {
        onStatus(payload.error || "Puck 页面布局保存失败");
        return;
      }

      onStateChange(payload.state);
      setDraftData(cloneLayoutData(nextData as VisualPageLayoutData));
      onStatus("Puck 页面布局已保存并发布");
    } catch (error) {
      onStatus(error instanceof Error ? error.message : "Puck 页面布局保存失败");
    } finally {
      setSaving(false);
    }
  }, [canManage, draftData, onStateChange, onStatus, selectedOption]);

  const puckOverrides = useMemo(() => ({
    headerActions: () => (
      <PuckTemplateHeaderActions
        canManage={canManage}
        onRequestClose={() => setCloseDialogOpen(true)}
        onSave={(nextData) => void saveLayout(nextData)}
        saving={saving}
      />
    )
  }), [canManage, saveLayout, saving]);

  async function exportTemplatePackage() {
    if (!canManage) {
      onStatus("当前账号没有前台模板权限");
      return;
    }

    setPackageBusy(true);
    onStatus("正在导出模板包...");

    try {
      const response = await fetch("/api/admin/template-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export" })
      });
      const payload = await response.json() as TemplatePackagePayload | { error?: string };

      if (!response.ok || "error" in payload) {
        onStatus("error" in payload ? payload.error || "模板包导出失败" : "模板包导出失败");
        return;
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `exportforge-template-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      onStatus("模板包已导出");
    } catch (error) {
      onStatus(error instanceof Error ? error.message : "模板包导出失败");
    } finally {
      setPackageBusy(false);
    }
  }

  async function importTemplatePackage(file: File | null) {
    if (!file) return;
    if (!canManage) {
      onStatus("当前账号没有前台模板权限");
      return;
    }

    setPackageBusy(true);
    onStatus("正在恢复模板包...");

    try {
      const templatePackage = JSON.parse(await file.text()) as TemplatePackagePayload;
      const response = await fetch("/api/admin/template-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", templatePackage })
      });
      const payload = await response.json() as { state?: AdminState; error?: string };

      if (!response.ok || !payload.state) {
        onStatus(payload.error || "模板包恢复失败");
        return;
      }

      onStateChange(payload.state);
      onStatus("模板包已恢复");
    } catch (error) {
      onStatus(error instanceof Error ? error.message : "模板包恢复失败");
    } finally {
      setPackageBusy(false);
    }
  }

  if (!selectedOption) {
    return <section className="settings-panel"><div className="empty-state">暂无可编辑页面。</div></section>;
  }

  return (
    <section className={`settings-panel puck-template-editor-panel${isFullscreen ? " is-fullscreen" : ""}`}>
      <div className="settings-panel-head with-action">
        <div>
          <h2>Puck 模板编辑器</h2>
          <span>通过拖拽区块编辑前台页面；保存后写入 Puck 布局 JSON，并支持模板包导出和恢复。</span>
        </div>
        <div className="settings-actions puck-template-actions">
          <label className="puck-template-page-select">
            <span>页面</span>
            <select value={selectedOption.key} onChange={(event) => setSelectedKey(event.target.value as PageLayoutKey)}>
              {options.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
          </label>
          <button type="button" disabled={!canManage || saving} onClick={() => void saveLayout()}>
            <Save size={15} />{saving ? "保存中" : "保存发布"}
          </button>
          <button
            aria-pressed={isFullscreen}
            className="puck-template-fullscreen-button"
            type="button"
            onClick={() => setIsFullscreen((current) => !current)}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            {isFullscreen ? "退出全屏" : "全屏编辑"}
          </button>
          <button type="button" disabled={!canManage || packageBusy} onClick={() => void exportTemplatePackage()}>
            <Download size={15} />导出模板包
          </button>
          <button type="button" disabled={!canManage || packageBusy} onClick={() => packageInputRef.current?.click()}>
            <FileUp size={15} />恢复模板包
          </button>
          <input
            accept="application/json,.json"
            ref={packageInputRef}
            type="file"
            hidden
            onChange={(event) => {
              void importTemplatePackage(event.currentTarget.files?.[0] ?? null);
              event.currentTarget.value = "";
            }}
          />
        </div>
      </div>
      <div className="puck-template-meta">
        <span>当前页面：{selectedOption.label}</span>
        <span>区块数：{draftData.content.length}</span>
        <span>最近保存：{selectedOption.layout?.updatedAt ? new Date(selectedOption.layout.updatedAt).toLocaleString() : "尚未保存"}</span>
      </div>
      <div className="puck-template-shell">
        <Puck
          config={config}
          data={draftData}
          headerPath={selectedOption.label}
          headerTitle="ExportForge Puck"
          height={isFullscreen ? "100%" : puckTemplateEditorHeight}
          key={`${selectedOption.key}-${editorResetKey}`}
          onChange={(nextData) => setDraftData(nextData as VisualPageLayoutData)}
          onPublish={(nextData) => void saveLayout(nextData)}
          overrides={puckOverrides}
          permissions={permissions}
          plugins={puckPlugins}
          ui={puckInitialUi}
          viewports={viewports}
        />
      </div>
      {closeDialogOpen ? (
        <div className="puck-template-dialog-backdrop" role="presentation">
          <div aria-labelledby="puck-close-dialog-title" aria-modal="true" className="puck-template-dialog" role="dialog">
            <div className="puck-template-dialog-icon" aria-hidden="true">!</div>
            <div className="puck-template-dialog-copy">
              <h3 id="puck-close-dialog-title">还没有保存，是否退出？</h3>
              <p>退出会丢弃当前未保存的模板编辑内容，已保存发布的内容不会受影响。</p>
            </div>
            <div className="puck-template-dialog-actions">
              <button className="puck-template-dialog-secondary" type="button" onClick={() => setCloseDialogOpen(false)}>
                继续编辑
              </button>
              <button className="puck-template-dialog-danger" type="button" onClick={closeEditorWithoutSaving}>
                不保存退出
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
