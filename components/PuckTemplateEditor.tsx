"use client";

/* eslint-disable @next/next/no-img-element */

import { type DragEvent, type MouseEvent, type ReactNode, type Ref, type SyntheticEvent, type WheelEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronsLeft, ChevronsRight, Download, FileUp, GripVertical, ImageIcon, Layers, LayoutTemplate, Maximize2, Minimize2, Plus, Save, Search, Sparkles, Trash2, Video, X } from "lucide-react";
import { Puck, createUsePuck } from "@puckeditor/core";
import type { Config, Data, Permissions, Plugin, PuckAction, Viewports } from "@puckeditor/core";
import { PublicFooterShell, PublicHeaderShell } from "@/components/PublicSiteShell";
import { PuckVisualBlock } from "@/components/PuckVisualBlocks";
import { blockPresetCategories, blockPresetCategoryLabels, blockPresets, currentTemplateAssetPaths, pagePresets, type BlockPreset, type PagePreset } from "@/lib/puck-presets";
import { getBaseLayoutLabels } from "@/lib/puck-layouts";
import type { AdminState, LocaleCode, PageLayoutKey, SitePageLayout, TemplatePackagePayload, Translation, VisualPageLayoutData } from "@/types/site";

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

type PuckTemplateAddRequest = {
  label: string;
  target?: {
    id?: string;
    index: number;
    zone: string;
  };
  type: string;
};

type PuckTemplateEditKind = "text" | "image" | "video" | "button" | "html" | "layout";

type PuckTemplateEditFieldRequest = {
  componentId?: string;
  field: string;
  kind: PuckTemplateEditKind;
  label: string;
};

type CustomSectionModuleType = "media" | "text" | "video" | "cta" | "container";

type ContainerElementType = "" | "image" | "text" | "imageText" | "video" | "button" | "html" | "separator";

type ContainerSlotContentItem = {
  type: string;
  props: Record<string, unknown>;
};

type FooterDraftProps = {
  footerCopyright?: string;
  footerCredit?: string;
  footerTagline?: string;
};

const customSectionPresetLabels: Record<string, string> = {
  CustomMediaSection: "图文模块",
  CustomTextSection: "纯文字模块",
  CustomVideoSection: "视频模块",
  CustomCtaSection: "行动按钮模块"
};

const customQuickAddModules = [
  { type: "CustomMediaSection", label: "图文模块" },
  { type: "CustomTextSection", label: "纯文字模块" },
  { type: "CustomVideoSection", label: "视频模块" },
  { type: "CustomCtaSection", label: "行动按钮模块" },
  { type: "CustomSection", label: "自定义模块" }
];

const containerPatternChoices = [
  { label: "1/1", value: "1/1" },
  { label: "1/2 - 1/2", value: "1/2-1/2" },
  { label: "1/3 - 1/3 - 1/3", value: "1/3-1/3-1/3" },
  { label: "1/4 - 1/4 - 1/4 - 1/4", value: "1/4-1/4-1/4-1/4" },
  { label: "2/3 - 1/3", value: "2/3-1/3" },
  { label: "1/3 - 2/3", value: "1/3-2/3" },
  { label: "1/4 - 3/4", value: "1/4-3/4" },
  { label: "3/4 - 1/4", value: "3/4-1/4" },
  { label: "1/4 - 1/2 - 1/4", value: "1/4-1/2-1/4" },
  { label: "1/2 - 1/4 - 1/4", value: "1/2-1/4-1/4" },
  { label: "1/4 - 1/4 - 1/2", value: "1/4-1/4-1/2" },
  { label: "1/5 - 4/5", value: "1/5-4/5" },
  { label: "4/5 - 1/5", value: "4/5-1/5" },
  { label: "1/6 - 2/3 - 1/6", value: "1/6-2/3-1/6" }
];

const containerElementChoices: Array<{ label: string; value: ContainerElementType }> = [
  { label: "空容器", value: "" },
  { label: "图片", value: "image" },
  { label: "文字", value: "text" },
  { label: "图文", value: "imageText" },
  { label: "视频", value: "video" },
  { label: "按钮", value: "button" },
  { label: "HTML / 代码", value: "html" },
  { label: "分隔线", value: "separator" }
];

const containerAlignChoices = [
  { label: "左对齐", value: "left" },
  { label: "居中", value: "center" },
  { label: "右对齐", value: "right" }
];

const containerVerticalAlignChoices = [
  { label: "顶部", value: "start" },
  { label: "居中", value: "center" },
  { label: "底部", value: "end" }
];

const containerPaddingChoices = [
  { label: "无", value: "none" },
  { label: "紧凑", value: "compact" },
  { label: "标准", value: "normal" },
  { label: "宽松", value: "large" }
];

const containerMinHeightChoices = [
  { label: "自动", value: "auto" },
  { label: "矮", value: "short" },
  { label: "中", value: "medium" },
  { label: "高", value: "tall" }
];

const containerBackgroundChoices = [
  { label: "透明", value: "transparent" },
  { label: "白色", value: "white" },
  { label: "浅色", value: "tint" },
  { label: "深色", value: "dark" },
  { label: "自定义", value: "custom" }
];

const containerBorderChoices = [
  { label: "细边框", value: "line" },
  { label: "无边框", value: "none" },
  { label: "虚线", value: "dashed" },
  { label: "强调", value: "accent" }
];

const containerRadiusChoices = [
  { label: "无", value: "none" },
  { label: "小", value: "small" },
  { label: "中", value: "medium" },
  { label: "大", value: "large" }
];

const containerShadowChoices = [
  { label: "无", value: "none" },
  { label: "轻微", value: "soft" },
  { label: "明显", value: "strong" }
];

const containerTextSizeChoices = [
  { label: "小", value: "small" },
  { label: "标准", value: "normal" },
  { label: "大", value: "large" }
];

const mediaAspectChoices = [
  { label: "16:9", value: "wide" },
  { label: "4:3", value: "standard" },
  { label: "1:1", value: "square" },
  { label: "3:4", value: "portrait" }
];

const mediaFitChoices = [
  { label: "裁切填充", value: "cover" },
  { label: "完整显示", value: "contain" }
];

const imagePlacementChoices = [
  { label: "上方", value: "top" },
  { label: "左侧", value: "left" },
  { label: "右侧", value: "right" }
];

const imageDisplayModeChoices = [
  { label: "单图", value: "single" },
  { label: "淡入轮播", value: "carousel" }
];

const imageTransitionEffectChoices = [
  { label: "淡入", value: "fade" },
  { label: "缩放淡入", value: "zoom" }
];

const imageOverlayChoices = [
  { label: "无", value: "none" },
  { label: "渐变遮罩", value: "gradient" },
  { label: "深色遮罩", value: "dark" }
];

const imageHoverEffectChoices = [
  { label: "无", value: "none" },
  { label: "悬停放大", value: "zoom" }
];

const imageCaptionPlacementChoices = [
  { label: "图片下方", value: "below" },
  { label: "图片内底部", value: "inside" }
];

const buttonStyleChoices = [
  { label: "主按钮", value: "primary" },
  { label: "次按钮", value: "secondary" },
  { label: "文字链接", value: "text" },
  { label: "描边按钮", value: "outline" },
  { label: "幽灵按钮", value: "ghost" },
  { label: "胶囊按钮", value: "pill" },
  { label: "右箭头行动", value: "arrow" },
  { label: "光扫按钮", value: "sheen" },
  { label: "立体按压", value: "press" },
  { label: "玻璃质感", value: "glass" }
];

const buttonSizeChoices = [
  { label: "小", value: "small" },
  { label: "标准", value: "normal" },
  { label: "大", value: "large" },
  { label: "撑满", value: "full" }
];

const separatorStyleChoices = [
  { label: "实线", value: "solid" },
  { label: "虚线", value: "dashed" },
  { label: "点线", value: "dotted" }
];

const separatorWidthChoices = [
  { label: "短", value: "short" },
  { label: "中", value: "medium" },
  { label: "全宽", value: "full" }
];

const containerSlotComponentTypes = [
  "ContainerTextElement",
  "ContainerImageElement",
  "ContainerImageTextElement",
  "ContainerVideoElement",
  "ContainerButtonElement",
  "ContainerHtmlElement",
  "ContainerSeparatorElement"
];

const ratioHandledInsertIds = new Set<string>();
const importedPresetStorageKey = "exportforge-puck-imported-presets";
const deletedPresetStorageKey = "exportforge-puck-deleted-presets";
const templateWheelIgnoreSelector = [
  "input",
  "textarea",
  "select",
  "button",
  "[contenteditable='true']",
  ".puck-media-picker-modal",
  ".puck-media-picker-grid",
  ".puck-template-preset-panel",
  "[class*='_PuckFields']",
  "[class*='_PuckOutline']",
  "[class*='_PuckSidebar']",
  "[class*='_PuckDrawer']",
  "[class*='_PuckHeader']"
].join(",");

const useTypedPuck = createUsePuck<Config>();

function requestPuckFieldEdit(detail: PuckTemplateEditFieldRequest, event?: MouseEvent<HTMLElement>) {
  event?.preventDefault();
  event?.stopPropagation();
  const targetWindow = window.parent && window.parent !== window ? window.parent : window;
  targetWindow.dispatchEvent(new CustomEvent<PuckTemplateEditFieldRequest>("puck-template-request-edit-field", { detail }));
}

function getCustomSectionPrimaryEditTarget(type: string, props: Record<string, unknown>): Omit<PuckTemplateEditFieldRequest, "componentId"> {
  const moduleType = type === "CustomMediaSection"
    ? "media"
    : type === "CustomTextSection"
      ? "text"
      : type === "CustomVideoSection"
        ? "video"
        : type === "CustomCtaSection"
          ? "cta"
          : getCustomSectionModuleType(props.moduleType);

  if (moduleType === "video") return { field: "videoLibraryUrl", kind: "video", label: "视频：从媒体库选择" };
  if (moduleType === "cta") return { field: "buttonLabel", kind: "button", label: "按钮文字" };
  if (moduleType === "container") return { field: "slotItems", kind: "layout", label: "容器内部元素" };
  if (moduleType === "text") return { field: "body", kind: "text", label: "正文 Markdown" };
  return { field: "mediaLibraryUrl", kind: "image", label: "图片：从媒体库选择" };
}

function getPrimaryEditTarget(type: string, props: Record<string, unknown>): Omit<PuckTemplateEditFieldRequest, "componentId"> {
  if (type === "HeroSection") return { field: "mediaLibraryUrl", kind: "image", label: "从媒体库选择背景" };
  if (type === "PageHero") return { field: "mediaLibraryUrl", kind: "image", label: "背景/配图" };
  if (type === "TextSection") return { field: propStringFromRecord(props, "layout") === "text" ? "body" : "mediaLibraryUrl", kind: propStringFromRecord(props, "layout") === "text" ? "text" : "image", label: propStringFromRecord(props, "layout") === "text" ? "正文" : "配图" };
  if (type === "RichTextBlock") return { field: "body", kind: "text", label: "正文 Markdown" };
  if (type === "ImageGallery") return { field: "mediaLibraryUrl", kind: "image", label: "主图/首图" };
  if (type === "LoopingImagesPreset") return { field: "imageItems", kind: "image", label: "循环图片" };
  if (type === "VideoSection") return { field: "mediaLibraryUrl", kind: "video", label: "从媒体库选择视频" };
  if (type === "CtaSection") return { field: "buttonLabel", kind: "button", label: "按钮文字" };
  if (type === "ProductList" || type === "ArticleList" || type === "FeatureCards" || type === "MarketSection" || type === "RfqSection" || type === "ContactChannels") return { field: "title", kind: "text", label: "标题" };
  if (type === "HomeNavigation") return { field: "ctaLabel", kind: "button", label: "按钮文字" };
  if (type === "ContainerTextElement") return { field: "title", kind: "text", label: "标题" };
  if (type === "ContainerImageElement") return { field: "imageUrl", kind: "image", label: "图片：从媒体库选择" };
  if (type === "ContainerImageTextElement") return { field: "imageUrl", kind: "image", label: "图片：从媒体库选择" };
  if (type === "ContainerVideoElement") return { field: "videoUrl", kind: "video", label: "视频：从媒体库选择" };
  if (type === "ContainerButtonElement") return { field: "buttonLabel", kind: "button", label: "按钮文字" };
  if (type === "ContainerHtmlElement") return { field: "body", kind: "html", label: "HTML / Markdown" };
  if (type === "CustomMediaSection" || type === "CustomTextSection" || type === "CustomVideoSection" || type === "CustomCtaSection" || type === "CustomSection") return getCustomSectionPrimaryEditTarget(type, props);
  return { field: "title", kind: "text", label: "标题" };
}

function hasScrollableAncestor(target: HTMLElement, boundary: HTMLElement) {
  let node: HTMLElement | null = target;

  while (node && node !== boundary) {
    const style = window.getComputedStyle(node);
    const canScrollY = /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1;
    if (canScrollY) return true;
    node = node.parentElement;
  }

  return false;
}

function restoreTemplateScrollAfterSave(shell: HTMLElement | null, isFullscreen: boolean, previousBodyOverflow: string) {
  if (typeof document === "undefined") return;

  if (!isFullscreen) document.body.style.overflow = previousBodyOverflow;

  window.requestAnimationFrame(() => {
    const activeElement = document.activeElement;
    const activeInPuck = activeElement instanceof HTMLElement && Boolean(shell?.contains(activeElement));
    const activeIsPreviewFrame = activeElement instanceof HTMLIFrameElement;

    if (!activeInPuck && !activeIsPreviewFrame) return;

    const workspace = shell?.closest<HTMLElement>(".admin-workspace");
    workspace?.focus({ preventScroll: true });
  });
}

function bridgeWheelToWorkspace(event: globalThis.WheelEvent, workspace: HTMLElement) {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || workspace.scrollHeight <= workspace.clientHeight + 1) return;

  const beforeScrollTop = workspace.scrollTop;
  workspace.scrollBy({ top: event.deltaY, behavior: "auto" });
  if (workspace.scrollTop !== beforeScrollTop) event.preventDefault();
}

function serializePuckData(data: Data | VisualPageLayoutData | undefined) {
  try {
    return JSON.stringify(data ?? null);
  } catch {
    return "";
  }
}

function propStringFromRecord(props: Record<string, unknown>, key: string, fallback = "") {
  const value = props[key];
  return typeof value === "string" ? value : fallback;
}

function findPuckItemSelectorById(content: VisualPageLayoutData["content"], componentId: string) {
  for (let index = 0; index < content.length; index += 1) {
    const item = content[index];
    const props = getPuckItemProps(item);
    const itemId = typeof props.id === "string" ? props.id : "";
    if (itemId === componentId) return { index, zone: rootDropZone };

    const slotItems = Array.isArray(props.slotItems) ? props.slotItems as VisualPageLayoutData["content"] : [];
    const slotIndex = slotItems.findIndex((slotItem) => {
      const slotProps = getPuckItemProps(slotItem);
      return typeof slotProps.id === "string" && slotProps.id === componentId;
    });
    if (slotIndex >= 0 && itemId) return { index: slotIndex, zone: `${itemId}:slotItems` };
  }

  return null;
}

function normalizeFieldSearchText(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function focusPuckFieldControl(detail: PuckTemplateEditFieldRequest) {
  const fieldCandidates = Array.from(document.querySelectorAll<HTMLElement>([
    `[name="${detail.field}"]`,
    `[id$="${detail.field}"]`,
    `[data-field="${detail.field}"]`,
    `[data-puck-field="${detail.field}"]`
  ].join(",")));
  const directControl = fieldCandidates.find((element) => element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement || element instanceof HTMLButtonElement);
  if (directControl) {
    directControl.focus();
    if (detail.kind === "image" || detail.kind === "video") directControl.click();
    return;
  }

  const normalizedLabel = normalizeFieldSearchText(detail.label);
  const fieldGroups = Array.from(document.querySelectorAll<HTMLElement>(".puck-media-picker-field, label, [class*='FieldLabel'], [class*='AutoField']"));
  const group = fieldGroups.find((element) => normalizeFieldSearchText(element.textContent || "").includes(normalizedLabel));
  const control = group?.querySelector<HTMLElement>("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])");
  if (control) {
    control.focus();
    if (detail.kind === "image" || detail.kind === "video") control.click();
  }
}

function containerPatternSlotCount(pattern: string) {
  return Math.max(1, pattern.split("-").filter(Boolean).length);
}

function blankContainerItem() {
  return {
    elementType: "",
    title: "",
    body: "",
    source: "",
    imageUrl: "",
    videoSource: "",
    videoUrl: "",
    href: "",
    buttonLabel: ""
  };
}

function createContainerSlotItem(index: number, elementType: ContainerElementType = "text", source: Record<string, unknown> = {}): ContainerSlotContentItem {
  const id = `${elementType || "slot"}-${Date.now().toString(36)}-${index}-${Math.random().toString(36).slice(2, 7)}`;
  const visualProps = {
    adminLabel: typeof source.adminLabel === "string" ? source.adminLabel : "",
    isHidden: typeof source.isHidden === "boolean" ? source.isHidden : false,
    align: typeof source.align === "string" ? source.align : "left",
    verticalAlign: typeof source.verticalAlign === "string" ? source.verticalAlign : "start",
    padding: typeof source.padding === "string" ? source.padding : "normal",
    minHeight: typeof source.minHeight === "string" ? source.minHeight : "auto",
    background: typeof source.background === "string" ? source.background : "transparent",
    customBackground: typeof source.customBackground === "string" ? source.customBackground : "",
    textColor: typeof source.textColor === "string" ? source.textColor : "",
    accentColor: typeof source.accentColor === "string" ? source.accentColor : "",
    borderStyle: typeof source.borderStyle === "string" ? source.borderStyle : "line",
    radius: typeof source.radius === "string" ? source.radius : "medium",
    shadow: typeof source.shadow === "string" ? source.shadow : "none"
  };
  const commonProps = {
    ...visualProps,
    id,
    title: typeof source.title === "string" ? source.title : "",
    eyebrow: typeof source.eyebrow === "string" ? source.eyebrow : "",
    body: typeof source.body === "string" ? source.body : "",
    href: typeof source.href === "string" ? source.href : "",
    buttonLabel: typeof source.buttonLabel === "string" ? source.buttonLabel : "",
    openInNewTab: typeof source.openInNewTab === "boolean" ? source.openInNewTab : false,
    imageUrl: typeof source.imageUrl === "string" ? source.imageUrl : "",
    source: typeof source.source === "string" ? source.source : "",
    videoUrl: typeof source.videoUrl === "string" ? source.videoUrl : "",
    videoSource: typeof source.videoSource === "string" ? source.videoSource : ""
  };

  if (elementType === "image") {
    return { type: "ContainerImageElement", props: { ...visualProps, id, imageUrl: commonProps.source || commonProps.imageUrl, alt: commonProps.title, caption: commonProps.body, href: commonProps.href, openInNewTab: commonProps.openInNewTab, displayMode: "single", imageItems: [], transitionEffect: "fade", intervalSeconds: 5, overlay: "none", hoverEffect: "none", captionPlacement: "below", imageRatio: "wide", imageFit: "cover" } };
  }
  if (elementType === "imageText") {
    return { type: "ContainerImageTextElement", props: { ...commonProps, imageUrl: commonProps.source || commonProps.imageUrl, title: commonProps.title || `内容 ${index + 1}`, displayMode: "single", imageItems: [], transitionEffect: "fade", intervalSeconds: 5, overlay: "none", hoverEffect: "none", captionPlacement: "below", imageRatio: "wide", imageFit: "cover", imagePlacement: "top", buttonStyle: "text" } };
  }
  if (elementType === "video") {
    return { type: "ContainerVideoElement", props: { ...commonProps, videoUrl: commonProps.videoSource || commonProps.videoUrl, title: commonProps.title || `视频 ${index + 1}`, videoRatio: "wide", autoplay: false, muted: true, loop: false } };
  }
  if (elementType === "button") {
    return { type: "ContainerButtonElement", props: { ...commonProps, buttonLabel: commonProps.buttonLabel || commonProps.title || "了解更多", href: commonProps.href || "#rfq", buttonStyle: "primary", buttonSize: "normal" } };
  }
  if (elementType === "html") {
    return { type: "ContainerHtmlElement", props: { ...visualProps, id, body: commonProps.body || "<p>HTML / Markdown content</p>", renderMode: "markdown" } };
  }
  if (elementType === "separator") {
    return { type: "ContainerSeparatorElement", props: { ...visualProps, id, separatorStyle: "solid", separatorWidth: "full", thickness: 1 } };
  }

  return {
    type: "ContainerTextElement",
    props: {
      id,
      title: commonProps.title || `内容 ${index + 1}`,
      body: commonProps.body || "双击文字可直接编辑，也可以在右侧属性面板修改。",
      href: commonProps.href
    }
  };
}

function defaultContainerElementTypeForModule(componentType: string, moduleType?: CustomSectionModuleType): ContainerElementType {
  const resolvedModuleType = componentType === "CustomMediaSection"
    ? "media"
    : componentType === "CustomTextSection"
      ? "text"
      : componentType === "CustomVideoSection"
        ? "video"
        : componentType === "CustomCtaSection"
          ? "cta"
          : moduleType ?? "container";

  if (resolvedModuleType === "media") return "imageText";
  if (resolvedModuleType === "video") return "video";
  if (resolvedModuleType === "cta") return "button";
  return "text";
}

function createContainerSlotContent(pattern: string, items: Record<string, unknown>[] = [], defaultElementType: ContainerElementType = "text") {
  return Array.from({ length: containerPatternSlotCount(pattern) }, (_, index) => {
    const item = items[index] && typeof items[index] === "object" ? items[index] : {};
    const elementType = typeof item.elementType === "string" ? item.elementType as ContainerElementType : defaultElementType;
    return createContainerSlotItem(index, elementType || defaultElementType || "text", item);
  });
}

function normalizeContainerSlotContent(pattern: string, items: ContainerSlotContentItem[], defaultElementType: ContainerElementType) {
  const slotCount = containerPatternSlotCount(pattern);
  return Array.from({ length: slotCount }, (_, index) => {
    const currentItem = items[index];
    if (currentItem?.type && currentItem.props && typeof currentItem.props === "object") return currentItem;
    return createContainerSlotItem(index, defaultElementType);
  });
}

function getLayoutItemProps(item: VisualPageLayoutData["content"][number]) {
  return item.props && typeof item.props === "object" ? item.props as Record<string, unknown> : {};
}

function normalizeCustomSectionContainerData<T extends Record<string, unknown>>(data: T): T {
  const props = (data.props && typeof data.props === "object" ? data.props : {}) as Record<string, unknown>;
  const containerPattern = typeof props.containerPattern === "string" ? props.containerPattern : "1/1";
  const componentType = typeof data.type === "string" ? data.type : "";
  const defaultElementType = defaultContainerElementTypeForModule(componentType, getCustomSectionModuleType(props.moduleType));
  const slotCount = containerPatternSlotCount(containerPattern);
  const currentItems = Array.isArray(props.containerItems) ? props.containerItems as Record<string, unknown>[] : [];
  const currentContent = Array.isArray(props.slotItems) ? props.slotItems as ContainerSlotContentItem[] : [];
  const nextItems = Array.from({ length: slotCount }, (_, index) => ({
    ...blankContainerItem(),
    ...(currentItems[index] && typeof currentItems[index] === "object" ? currentItems[index] : {})
  }));

  const nextContent = currentContent.length > 0
    ? normalizeContainerSlotContent(containerPattern, currentContent, defaultElementType)
    : createContainerSlotContent(containerPattern, nextItems, defaultElementType);

  if (currentItems.length === slotCount && currentContent.length === slotCount) return data;

  const nextProps = {
    ...props,
    slotItems: nextContent,
    containerItems: nextItems
  };

  return { ...data, props: nextProps } as T;
}
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

function createPresetInstanceId(sourceId: string, index: number) {
  return `${sourceId || "preset"}-${Date.now().toString(36)}-${index}-${Math.random().toString(36).slice(2, 7)}`;
}

function clonePresetContent(content: VisualPageLayoutData["content"]): VisualPageLayoutData["content"] {
  let idIndex = 0;
  const cloneItem = (item: VisualPageLayoutData["content"][number]): VisualPageLayoutData["content"][number] => {
    const props = getPuckItemProps(item);
    const nextProps: Record<string, unknown> = {
      ...props,
      id: createPresetInstanceId(typeof props.id === "string" ? props.id : item.type, idIndex)
    };
    idIndex += 1;

    if (Array.isArray(props.slotItems)) {
      nextProps.slotItems = (props.slotItems as VisualPageLayoutData["content"]).map(cloneItem);
    }

    return {
      ...item,
      props: nextProps as VisualPageLayoutData["content"][number]["props"]
    };
  };

  return content.map(cloneItem);
}

function clonePresetData(data: VisualPageLayoutData): VisualPageLayoutData {
  const cloned = cloneLayoutData(data);
  return {
    ...cloned,
    content: clonePresetContent(cloned.content ?? []),
    zones: cloned.zones ?? {}
  };
}

function uploadedFileUrls(state: AdminState) {
  return new Set(state.uploadedFiles.map((file) => file.url).filter(Boolean));
}

function listMissingPresetAssets(requiredAssets: string[], state: AdminState) {
  const uploadedUrls = uploadedFileUrls(state);
  return requiredAssets.filter((asset) => {
    if (!asset.trim()) return false;
    if (currentTemplateAssetPaths.has(asset)) return false;
    if (uploadedUrls.has(asset)) return false;
    return !/^https?:\/\//i.test(asset);
  });
}

function localizedTemplateText(value: Translation | undefined, locale: LocaleCode, fallback = "") {
  return value?.[locale] || value?.zh || value?.en || fallback;
}

function dataWithFooterDraftProps(data: VisualPageLayoutData | undefined, state: AdminState, locale: LocaleCode): VisualPageLayoutData {
  const cloned = cloneLayoutData(data);
  const rootProps = (cloned.root?.props ?? {}) as Record<string, unknown>;
  return {
    ...cloned,
    root: {
      ...cloned.root,
      props: {
        ...rootProps,
        footerTagline: localizedTemplateText(state.templateSettings.footerTagline, locale, "Carbide end mills, drill bits, OEM tooling, and export-ready packing for global buyers."),
        footerCopyright: localizedTemplateText(state.templateSettings.footerCopyright, locale, "Copyright © {year} {brand}. All rights reserved."),
        footerCredit: localizedTemplateText(state.templateSettings.footerCredit, locale, "Built for precision tooling and B2B export orders.")
      } as VisualPageLayoutData["root"]["props"]
    }
  };
}

function translationFromFooterDraft(value: unknown, fallback: Translation): Translation {
  const textValue = typeof value === "string" ? value.trim() : "";
  if (!textValue) return fallback;
  return {
    ...fallback,
    zh: textValue,
    en: fallback.en || textValue
  };
}

function customSectionDefaultProps(moduleType: CustomSectionModuleType = "media") {
  const moduleLabel = getCustomSectionModuleLabel(moduleType);
  const defaultElementType = defaultContainerElementTypeForModule("", moduleType);

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
    containerPattern: moduleType === "container" ? "1/3-1/3-1/3" : "1/1",
    containerItems: [
      { elementType: defaultElementType, title: "产品入口", body: "用于放置产品、服务或卖点说明。", href: "/products", buttonLabel: "查看产品", imageUrl: "" },
      { elementType: defaultElementType, title: "技术资料", body: "用于放置文章、下载资料或参数说明。", href: "/articles", buttonLabel: "阅读资料", imageUrl: "" },
      { elementType: defaultElementType, title: "询盘转化", body: "用于放置报价、联系或行动按钮。", href: "#rfq", buttonLabel: "获取报价", imageUrl: "" }
    ],
    showSummary: true,
    layout: moduleType === "text" || moduleType === "cta" || moduleType === "container" ? "stacked" : "media-left",
    align: "left",
    width: "contained",
    tone: "light",
    spacing: "normal"
  };
}

function customSectionContainerOnlyProps(componentType: string, containerPattern: string) {
  const moduleType = componentType === "CustomTextSection"
    ? "text"
    : componentType === "CustomVideoSection"
      ? "video"
      : componentType === "CustomCtaSection"
        ? "cta"
        : componentType === "CustomSection"
          ? "container"
          : "media";
  const defaultElementType = defaultContainerElementTypeForModule(componentType, moduleType);

  const containerItems = Array.from({ length: containerPatternSlotCount(containerPattern) }, () => ({
    ...blankContainerItem(),
    elementType: defaultElementType
  }));

  return {
    ...customSectionDefaultProps(moduleType),
    eyebrow: "",
    title: "",
    body: "",
    mediaLibraryUrl: "",
    mediaUrl: "",
    imageMode: "none",
    imageItems: [],
    imageUrls: "",
    backgroundImageUrl: "",
    videoLibraryUrl: "",
    videoUrl: "",
    videoPosterUrl: "",
    buttonLabel: "",
    buttonHref: "",
    containerPattern,
    containerItems,
    slotItems: createContainerSlotContent(containerPattern, containerItems, defaultElementType),
    showSummary: true,
    layout: "stacked",
    align: "left"
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

function yesNoField(label: string) {
  return {
    type: "radio" as const,
    label,
    options: [
      { label: "是", value: true },
      { label: "否", value: false }
    ]
  };
}

function editableTextField(type: "text" | "textarea", label: string, extra: Record<string, unknown> = {}) {
  return { type, label, contentEditable: true, ...extra };
}

function slotField(label: string, allow = containerSlotComponentTypes) {
  return { type: "slot" as const, label, allow };
}

function hiddenSlotField(label: string, allow = containerSlotComponentTypes) {
  return { ...slotField(label, allow), visible: false };
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

function PuckColorCssField({
  id,
  label,
  onChange,
  readOnly,
  value
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  value?: string;
}) {
  const stringValue = typeof value === "string" ? value : "";
  const colorValue = /^#[0-9a-f]{6}$/i.test(stringValue.trim()) ? stringValue.trim() : "#f2fbff";

  return (
    <label className="puck-color-css-field" htmlFor={id}>
      <span>{label}</span>
      <div>
        <input
          aria-label={`${label} 颜色选择`}
          disabled={readOnly}
          type="color"
          value={colorValue}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
        <input
          disabled={readOnly}
          id={id}
          placeholder="#f2fbff / linear-gradient(...) / color-mix(...)"
          type="text"
          value={stringValue}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </div>
    </label>
  );
}

function colorCssField(label: string) {
  return {
    type: "custom" as const,
    label,
    render: ({ id, value, onChange, readOnly }: { id: string; value?: string; onChange: (value: string) => void; readOnly?: boolean }) => (
      <PuckColorCssField id={id} label={label} value={value} onChange={onChange} readOnly={readOnly} />
    )
  };
}

function PuckNumberTuningField({
  id,
  label,
  max,
  min,
  onChange,
  readOnly,
  step = 1,
  value
}: {
  id: string;
  label: string;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  readOnly?: boolean;
  step?: number;
  value?: number | string;
}) {
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : (min ?? 0);
  const clamp = (nextValue: number) => {
    if (!Number.isFinite(nextValue)) return safeValue;
    return Math.max(min ?? nextValue, Math.min(max ?? nextValue, nextValue));
  };

  return (
    <label className="puck-number-tuning-field" htmlFor={id}>
      <span>{label}</span>
      <div className="is-input-only">
        <input
          disabled={readOnly}
          id={id}
          max={max}
          min={min}
          step={step}
          type="number"
          value={safeValue}
          onChange={(event) => onChange(clamp(Number(event.currentTarget.value)))}
        />
      </div>
    </label>
  );
}

function numberTuningField(label: string, min: number, max: number, step = 1) {
  return {
    type: "custom" as const,
    label,
    render: ({ id, value, onChange, readOnly }: { id: string; value?: number | string; onChange: (value: number) => void; readOnly?: boolean }) => (
      <PuckNumberTuningField id={id} label={label} max={max} min={min} step={step} value={value} onChange={onChange} readOnly={readOnly} />
    )
  };
}

function PuckManualNumberField({
  id,
  label,
  max,
  min,
  onChange,
  readOnly,
  value
}: {
  id: string;
  label: string;
  max?: number;
  min?: number;
  onChange: (value: number | string) => void;
  readOnly?: boolean;
  value?: number | string;
}) {
  const stringValue = value === undefined || value === null ? "" : String(value);
  const [draftValue, setDraftValue] = useState(stringValue);
  const [isFocused, setIsFocused] = useState(false);
  const commitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isFocused) setDraftValue(stringValue);
  }, [isFocused, stringValue]);

  useEffect(() => () => {
    if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);
  }, []);

  const commitPreviewValue = (nextDraftValue: string) => {
    const nextValue = Number(nextDraftValue);
    if (Number.isFinite(nextValue)) onChange(nextValue);
  };

  const schedulePreviewCommit = (nextDraftValue: string) => {
    if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);
    commitTimerRef.current = window.setTimeout(() => {
      commitPreviewValue(nextDraftValue);
    }, 350);
  };

  const commitValue = () => {
    if (commitTimerRef.current) {
      window.clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
    const nextValue = Number(draftValue);
    if (!Number.isFinite(nextValue)) {
      setDraftValue(stringValue);
      return;
    }
    const clampedValue = Math.max(min ?? nextValue, Math.min(max ?? nextValue, nextValue));
    setDraftValue(String(clampedValue));
    onChange(clampedValue);
  };

  return (
    <label className="puck-manual-number-field" htmlFor={id}>
      <span>{label}</span>
      <input
        disabled={readOnly}
        id={id}
        inputMode="numeric"
        max={max}
        min={min}
        pattern="[0-9]*"
        type="text"
        value={draftValue}
        onBlur={() => {
          setIsFocused(false);
          commitValue();
        }}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          setDraftValue(nextValue);
          if (nextValue.trim()) schedulePreviewCommit(nextValue);
        }}
        onFocus={() => setIsFocused(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
      />
    </label>
  );
}

function manualNumberField(label: string, min: number, max: number) {
  return {
    type: "custom" as const,
    label,
    render: ({ id, value, onChange, readOnly }: { id: string; value?: number | string; onChange: (value: number | string) => void; readOnly?: boolean }) => (
      <PuckManualNumberField id={id} label={label} max={max} min={min} value={value} onChange={onChange} readOnly={readOnly} />
    )
  };
}

function LoopingImagesField({
  id,
  items,
  label,
  onChange,
  onUploadImage,
  readOnly,
  value
}: {
  id: string;
  items: MediaPickerItem[];
  label: string;
  onChange: (value: ImagePickerItem[]) => void;
  onUploadImage?: (file: File) => Promise<string>;
  readOnly?: boolean;
  value?: ImagePickerItem[];
}) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const images = Array.isArray(value) ? value : [];
  const updateImage = (index: number, patch: Partial<ImagePickerItem>) => {
    onChange(images.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };
  const addImage = () => {
    const fallback = items[images.length % Math.max(items.length, 1)];
    onChange([...images, { source: fallback?.value ?? "", url: "", alt: "", caption: "", linkHref: "" }]);
  };
  const removeImage = (index: number) => {
    onChange(images.filter((_, itemIndex) => itemIndex !== index));
  };
  const uploadImage = async (index: number, file: File | null) => {
    if (!file || !onUploadImage) return;
    setUploadingIndex(index);
    try {
      const uploadedUrl = await onUploadImage(file);
      updateImage(index, { source: uploadedUrl, url: "" });
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="puck-looping-images-field" id={id}>
      <div className="puck-looping-images-field-head">
        <span>{label}</span>
        <button disabled={readOnly || images.length >= 8} type="button" onClick={addImage}>
          <Plus size={13} />添加图片
        </button>
      </div>
      <div className="puck-looping-images-list">
        {images.map((image, index) => {
          const source = image.source || image.url || "";
          return (
            <div className="puck-looping-image-row" key={`${source}-${index}`}>
              <span className="puck-looping-image-thumb">
                {source ? <img src={source} alt="" loading="lazy" /> : <ImageIcon size={18} />}
              </span>
              <div className="puck-looping-image-controls">
                <div className="puck-looping-image-media-row">
                  <strong>图片 {index + 1}</strong>
                  <label className="puck-looping-image-upload">
                    <input
                      accept="image/*"
                      disabled={readOnly || !onUploadImage || uploadingIndex === index}
                      type="file"
                      onChange={(event) => {
                        void uploadImage(index, event.currentTarget.files?.[0] ?? null);
                        event.currentTarget.value = "";
                      }}
                    />
                    {uploadingIndex === index ? "上传中..." : "本地上传"}
                  </label>
                  <PuckMediaPickerField
                    id={`${id}-${index}-source`}
                    items={items}
                    kind="image"
                    label="从媒体库选择"
                    readOnly={readOnly}
                    value={image.source || ""}
                    onChange={(nextSource) => updateImage(index, { source: nextSource })}
                  />
                </div>
                <label>
                  <span>外部图片 URL</span>
                  <input disabled={readOnly} type="text" value={image.url || ""} onChange={(event) => updateImage(index, { url: event.currentTarget.value })} />
                </label>
                <label>
                  <span>替代文字 Alt</span>
                  <input disabled={readOnly} type="text" value={image.alt || ""} onChange={(event) => updateImage(index, { alt: event.currentTarget.value })} />
                </label>
              </div>
              <button aria-label={`删除图片 ${index + 1}`} disabled={readOnly || images.length <= 2} type="button" onClick={() => removeImage(index)}>
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>
      {images.length === 0 ? <div className="puck-looping-images-empty">还没有循环图片，点击“添加图片”开始。</div> : null}
    </div>
  );
}

function loopingImagesField(label: string, mediaItems: MediaPickerItem[], onUploadImage?: (file: File) => Promise<string>) {
  return {
    type: "custom" as const,
    label,
    render: ({ id, value, onChange, readOnly }: { id: string; value?: ImagePickerItem[]; onChange: (value: ImagePickerItem[]) => void; readOnly?: boolean }) => (
      <LoopingImagesField id={id} items={mediaItems} label={label} value={value} onChange={onChange} onUploadImage={onUploadImage} readOnly={readOnly} />
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
  return value === "text" || value === "video" || value === "cta" || value === "container" ? value : "media";
}

function getCustomSectionModuleLabel(value: unknown) {
  const moduleType = getCustomSectionModuleType(value);
  if (moduleType === "text") return "纯文字模块";
  if (moduleType === "video") return "视频模块";
  if (moduleType === "cta") return "行动按钮模块";
  if (moduleType === "container") return "栅格容器";
  return "图文模块";
}

function containerItemsField(imageItems: MediaPickerItem[], videoItems: MediaPickerItem[]) {
  return {
    type: "array" as const,
    label: "容器项目",
    min: 1,
    max: 6,
    arrayFields: {
      elementType: selectField("元素类型", containerElementChoices),
      title: field("text", "标题"),
      body: field("textarea", "文字 / HTML"),
      source: mediaPickerField("图片：从媒体库选择", imageItems, "image"),
      imageUrl: field("text", "图片 URL"),
      videoSource: mediaPickerField("视频：从媒体库选择", videoItems, "video"),
      videoUrl: field("text", "视频 URL / iframe URL"),
      href: field("text", "链接"),
      buttonLabel: field("text", "按钮文字")
    },
    defaultItemProps: { elementType: "", title: "", body: "", source: "", imageUrl: "", videoSource: "", videoUrl: "", href: "", buttonLabel: "" },
    getItemSummary: (item: { elementType?: string; title?: string; body?: string }, index?: number) => {
      const elementLabel = containerElementChoices.find((choice) => choice.value === item.elementType)?.label;
      return item.title || elementLabel || item.body || `容器 ${(index ?? 0) + 1}`;
    }
  };
}

function containerBaseElementFields() {
  return {
    adminLabel: field("text", "元素备注（仅后台）"),
    isHidden: yesNoField("隐藏此元素"),
    align: radioField("内容对齐", containerAlignChoices),
    verticalAlign: radioField("垂直位置", containerVerticalAlignChoices),
    padding: radioField("内边距", containerPaddingChoices),
    minHeight: radioField("最小高度", containerMinHeightChoices),
    background: radioField("容器背景", containerBackgroundChoices),
    customBackground: field("text", "自定义背景色"),
    textColor: field("text", "文字颜色"),
    accentColor: field("text", "强调颜色"),
    borderStyle: radioField("边框", containerBorderChoices),
    radius: radioField("圆角", containerRadiusChoices),
    shadow: radioField("阴影", containerShadowChoices)
  };
}

function containerTextFields() {
  return {
    eyebrow: editableTextField("text", "眉标 / 小标签"),
    title: editableTextField("text", "标题"),
    body: editableTextField("textarea", "正文"),
    textSize: radioField("文字大小", containerTextSizeChoices),
    href: field("text", "整块链接"),
    openInNewTab: yesNoField("链接新窗口打开"),
    ...containerBaseElementFields()
  };
}

function containerImageFields(imageItems: MediaPickerItem[]) {
  return {
    displayMode: radioField("显示方式", imageDisplayModeChoices),
    imageUrl: mediaPickerField("图片：从媒体库选择", imageItems, "image"),
    externalImageUrl: field("text", "外部图片 URL"),
    imageItems: imageListField("轮播图片", imageItems),
    transitionEffect: radioField("轮播效果", imageTransitionEffectChoices),
    intervalSeconds: field("number", "轮播间隔秒数", { min: 3, max: 12 }),
    overlay: radioField("图片遮罩", imageOverlayChoices),
    hoverEffect: radioField("悬停效果", imageHoverEffectChoices),
    captionPlacement: radioField("说明位置", imageCaptionPlacementChoices),
    alt: editableTextField("text", "替代文字 Alt"),
    caption: editableTextField("text", "图片说明"),
    href: field("text", "图片链接"),
    openInNewTab: yesNoField("链接新窗口打开"),
    imageRatio: radioField("图片比例", mediaAspectChoices),
    imageFit: radioField("图片显示", mediaFitChoices),
    ...containerBaseElementFields()
  };
}

function containerImageTextFields(imageItems: MediaPickerItem[]) {
  return {
    displayMode: radioField("显示方式", imageDisplayModeChoices),
    imageUrl: mediaPickerField("图片：从媒体库选择", imageItems, "image"),
    externalImageUrl: field("text", "外部图片 URL"),
    imageItems: imageListField("轮播图片", imageItems),
    transitionEffect: radioField("轮播效果", imageTransitionEffectChoices),
    intervalSeconds: field("number", "轮播间隔秒数", { min: 3, max: 12 }),
    overlay: radioField("图片遮罩", imageOverlayChoices),
    hoverEffect: radioField("悬停效果", imageHoverEffectChoices),
    captionPlacement: radioField("文字位置", imageCaptionPlacementChoices),
    imagePlacement: radioField("图片位置", imagePlacementChoices),
    imageRatio: radioField("图片比例", mediaAspectChoices),
    imageFit: radioField("图片显示", mediaFitChoices),
    eyebrow: editableTextField("text", "眉标 / 小标签"),
    title: editableTextField("text", "标题"),
    body: editableTextField("textarea", "正文"),
    textSize: radioField("文字大小", containerTextSizeChoices),
    href: field("text", "链接"),
    openInNewTab: yesNoField("链接新窗口打开"),
    buttonLabel: editableTextField("text", "按钮文字"),
    buttonStyle: radioField("按钮样式", buttonStyleChoices),
    ...containerBaseElementFields()
  };
}

function containerVideoFields(imageItems: MediaPickerItem[], videoItems: MediaPickerItem[]) {
  return {
    videoUrl: mediaPickerField("视频：从媒体库选择", videoItems, "video"),
    externalVideoUrl: field("text", "外部视频 / iframe URL"),
    posterUrl: mediaPickerField("封面图", imageItems, "image"),
    videoRatio: radioField("视频比例", mediaAspectChoices),
    autoplay: yesNoField("自动播放"),
    muted: yesNoField("静音"),
    loop: yesNoField("循环播放"),
    title: editableTextField("text", "标题"),
    body: editableTextField("textarea", "说明"),
    textSize: radioField("文字大小", containerTextSizeChoices),
    ...containerBaseElementFields()
  };
}

function containerButtonFields() {
  return {
    buttonLabel: editableTextField("text", "按钮文字"),
    href: field("text", "按钮链接"),
    openInNewTab: yesNoField("新窗口打开"),
    buttonStyle: radioField("按钮样式", buttonStyleChoices),
    buttonSize: radioField("按钮尺寸", buttonSizeChoices),
    title: editableTextField("text", "辅助标题"),
    body: editableTextField("textarea", "辅助说明"),
    textSize: radioField("文字大小", containerTextSizeChoices),
    ...containerBaseElementFields()
  };
}

function containerHtmlFields() {
  return {
    body: editableTextField("textarea", "HTML / Markdown"),
    renderMode: radioField("渲染模式", [
      { label: "Markdown", value: "markdown" },
      { label: "HTML", value: "html" },
      { label: "纯文本", value: "plain" }
    ]),
    ...containerBaseElementFields()
  };
}

function containerSeparatorFields() {
  return {
    separatorStyle: radioField("线条样式", separatorStyleChoices),
    separatorWidth: radioField("线条宽度", separatorWidthChoices),
    thickness: field("number", "线条粗细", { min: 1, max: 12 }),
    ...containerBaseElementFields()
  };
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
      { label: "行动按钮模块", value: "cta" },
      { label: "栅格容器", value: "container" }
    ]
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
  const moduleFields = {
    ...(includeModuleType ? { moduleType: moduleTypeField } : {}),
    containerPattern: selectField("容器比例", containerPatternChoices),
    slotItems: hiddenSlotField("容器内部元素"),
    backgroundImageUrl: mediaPickerField("模块背景图", imageItems, "image"),
    ...layoutFields
  };

  if (moduleType === "text") {
    return moduleFields;
  }

  if (moduleType === "video") {
    return moduleFields;
  }

  if (moduleType === "cta") {
    return moduleFields;
  }

  if (moduleType === "container") {
    return moduleFields;
  }

  return moduleFields;
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
  footerDraft,
  layoutKey,
  locale,
  state
}: {
  children: ReactNode;
  footerDraft?: FooterDraftProps;
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
        copyright={footerDraft?.footerCopyright ? { zh: footerDraft.footerCopyright, en: footerDraft.footerCopyright } : state.templateSettings.footerCopyright}
        credit={footerDraft?.footerCredit ? { zh: footerDraft.footerCredit, en: footerDraft.footerCredit } : state.templateSettings.footerCredit}
        tagline={footerDraft?.footerTagline ? { zh: footerDraft.footerTagline, en: footerDraft.footerTagline } : state.templateSettings.footerTagline}
        locale={locale}
        navigation={state.navigation}
        preventNavigation
      />
    </div>
  );
}

function getPuckItemProps(item: VisualPageLayoutData["content"][number]) {
  return getLayoutItemProps(item);
}

function getPuckItemTitle(config: Config, item: VisualPageLayoutData["content"][number], index: number) {
  const props = getPuckItemProps(item);
  const componentLabel = config.components[item.type]?.label ?? item.type;
  const adminLabel = typeof props.adminLabel === "string" ? props.adminLabel.trim() : "";
  const title = typeof props.title === "string" ? props.title.trim() : "";
  const presetLabel = customSectionPresetLabels[item.type];

  if (presetLabel) {
    return {
      title: adminLabel || presetLabel,
      detail: title && title !== presetLabel ? title : "自定义模块"
    };
  }

  if (item.type === "CustomSection") {
    const moduleLabel = getCustomSectionModuleLabel(props.moduleType);
    return {
      title: adminLabel || moduleLabel,
      detail: title && title !== "自定义模块" ? title : "自定义模块"
    };
  }

  return {
    title: adminLabel || componentLabel,
    detail: title || `模块 ${index + 1}`
  };
}

function PuckTemplateComponentItem({
  canManage,
  children,
  name
}: {
  canManage: boolean;
  children: ReactNode;
  name: string;
}) {
  const config = useTypedPuck((puck) => puck.config);
  const quickAddModule = customQuickAddModules.find((module) => module.type === name);
  const moduleLabel = quickAddModule?.label ?? config.components[name]?.label ?? name;
  const isQuickAddModule = Boolean(quickAddModule);
  const lastRequestAtRef = useRef(0);
  const requestAdd = useCallback((event?: SyntheticEvent<HTMLElement>) => {
    if (!canManage) return;
    event?.preventDefault();
    event?.stopPropagation();
    const now = Date.now();
    if (now - lastRequestAtRef.current < 250) return;
    lastRequestAtRef.current = now;
    window.dispatchEvent(new CustomEvent<PuckTemplateAddRequest>("puck-template-request-add", {
      detail: { label: moduleLabel, type: name }
    }));
  }, [canManage, moduleLabel, name]);

  if (isQuickAddModule) {
    return (
      <div className="puck-template-component-item is-ratio-first">
        <div className="puck-template-component-item-row">
          <div
            className="puck-template-component-drag puck-template-component-ratio-trigger"
            data-puck-template-add-label={moduleLabel}
            data-puck-template-add-type={name}
            title={`选择${moduleLabel}容器比例`}
          >
            {children}
          </div>
          <button
            aria-label={`添加${moduleLabel}`}
            className="puck-template-component-add"
            data-puck-template-add-label={moduleLabel}
            data-puck-template-add-type={name}
            disabled={!canManage}
            title={`选择${moduleLabel}容器比例`}
            type="button"
            onClick={(event) => requestAdd(event)}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="puck-template-component-item is-native">
      <div className="puck-template-component-item-row is-native">
        <div className="puck-template-component-drag">{children}</div>
      </div>
    </div>
  );
}

type ManagedBlockPreset = BlockPreset & {
  source: "built-in" | "imported";
};

function isBlockPreset(value: unknown): value is BlockPreset {
  if (!value || typeof value !== "object") return false;
  const preset = value as Partial<BlockPreset>;
  return typeof preset.id === "string"
    && typeof preset.category === "string"
    && typeof preset.label === "string"
    && typeof preset.description === "string"
    && typeof preset.thumbnail === "string"
    && Array.isArray(preset.requiredAssets)
    && Array.isArray(preset.puckData);
}

function readStoredBlockPresets() {
  if (typeof window === "undefined") return { imported: [] as BlockPreset[], deletedIds: [] as string[] };

  try {
    const imported = JSON.parse(window.localStorage.getItem(importedPresetStorageKey) || "[]");
    const deletedIds = JSON.parse(window.localStorage.getItem(deletedPresetStorageKey) || "[]");

    return {
      imported: Array.isArray(imported) ? imported.filter(isBlockPreset) : [],
      deletedIds: Array.isArray(deletedIds) ? deletedIds.filter((id): id is string => typeof id === "string") : []
    };
  } catch {
    return { imported: [] as BlockPreset[], deletedIds: [] as string[] };
  }
}

function writeStoredBlockPresets(imported: BlockPreset[], deletedIds: string[]) {
  window.localStorage.setItem(importedPresetStorageKey, JSON.stringify(imported, null, 2));
  window.localStorage.setItem(deletedPresetStorageKey, JSON.stringify(deletedIds, null, 2));
}

function downloadJsonFile(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function PuckTemplatePresetPanel({
  canManage,
  onApplyPagePreset,
  onStatus,
  selectedLayoutKey,
  state
}: {
  canManage: boolean;
  onApplyPagePreset: (preset: PagePreset) => void;
  onStatus: (message: string) => void;
  selectedLayoutKey: PageLayoutKey;
  state: AdminState;
}) {
  const appState = useTypedPuck((puck) => puck.appState);
  const dispatch = useTypedPuck((puck) => puck.dispatch);
  const selectedItem = useTypedPuck((puck) => puck.selectedItem);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [activePresetCategory, setActivePresetCategory] = useState<BlockPreset["category"] | "all">("image-carousel");
  const [importPresetCategory, setImportPresetCategory] = useState<BlockPreset["category"]>("image-carousel");
  const [importedPresets, setImportedPresets] = useState<BlockPreset[]>([]);
  const [deletedPresetIds, setDeletedPresetIds] = useState<string[]>([]);
  const content = useMemo(() => (appState.data?.content ?? []) as VisualPageLayoutData["content"], [appState.data?.content]);
  const selectedId = selectedItem?.props?.id;
  const deletedPresetIdSet = useMemo(() => new Set(deletedPresetIds), [deletedPresetIds]);
  const managedBlockPresets = useMemo<ManagedBlockPreset[]>(() => [
    ...blockPresets
      .map((preset) => ({ ...preset, source: "built-in" as const })),
    ...importedPresets
      .filter((preset) => !deletedPresetIdSet.has(preset.id))
      .map((preset) => ({ ...preset, source: "imported" as const }))
  ], [deletedPresetIdSet, importedPresets]);
  const visibleBlockPresets = useMemo(() => (
    activePresetCategory === "all"
      ? managedBlockPresets
      : managedBlockPresets.filter((preset) => preset.category === activePresetCategory)
  ), [activePresetCategory, managedBlockPresets]);
  const presetCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    managedBlockPresets.forEach((preset) => counts.set(preset.category, (counts.get(preset.category) ?? 0) + 1));
    return counts;
  }, [managedBlockPresets]);
  useEffect(() => {
    const stored = readStoredBlockPresets();
    setImportedPresets(stored.imported);
    setDeletedPresetIds(stored.deletedIds);
  }, []);

  const persistPresetLibrary = useCallback((nextImported: BlockPreset[], nextDeletedIds: string[]) => {
    setImportedPresets(nextImported);
    setDeletedPresetIds(nextDeletedIds);
    writeStoredBlockPresets(nextImported, nextDeletedIds);
  }, []);

  const addBlockPreset = useCallback((preset: BlockPreset) => {
    const missingAssets = listMissingPresetAssets(preset.requiredAssets, state);
    if (!canManage || missingAssets.length > 0) return;

    const presetItems = clonePresetContent(preset.puckData);
    const selectedIndex = selectedId ? content.findIndex((item) => getPuckItemProps(item).id === selectedId) : -1;
    const destinationIndex = selectedIndex >= 0 ? selectedIndex + 1 : content.length;

    presetItems.forEach((item, offset) => {
      const props = getPuckItemProps(item);
      const itemId = typeof props.id === "string" ? props.id : createPresetInstanceId(item.type, offset);
      ratioHandledInsertIds.add(itemId);
      dispatch({
        type: "insert",
        componentType: item.type,
        destinationIndex: destinationIndex + offset,
        destinationZone: rootDropZone,
        id: itemId,
        recordHistory: true
      });
      dispatch({
        type: "replace",
        destinationIndex: destinationIndex + offset,
        destinationZone: rootDropZone,
        data: {
          ...item,
          props: {
            ...props,
            id: itemId
          }
        },
        recordHistory: true
      });
    });

    if (presetItems.length > 0) {
      dispatch({ type: "setUi", ui: { itemSelector: { index: destinationIndex + presetItems.length - 1, zone: rootDropZone } } });
    }
  }, [canManage, content, dispatch, selectedId, state]);

  const exportPreset = useCallback((preset: BlockPreset) => {
    downloadJsonFile(`${preset.id}.puck-preset.json`, { version: 1, preset });
    onStatus(`已导出预设：${preset.label}`);
  }, [onStatus]);

  const deletePreset = useCallback((preset: ManagedBlockPreset) => {
    if (!canManage) {
      onStatus("当前账号没有前台模板权限");
      return;
    }

    const nextImported = preset.source === "imported"
      ? importedPresets.filter((item) => item.id !== preset.id)
      : importedPresets;
    const nextDeletedIds = Array.from(new Set([...deletedPresetIds, preset.id]));
    persistPresetLibrary(nextImported, nextDeletedIds);
    onStatus(`已删除预设：${preset.label}`);
  }, [canManage, deletedPresetIds, importedPresets, onStatus, persistPresetLibrary]);

  const importPresetFile = useCallback(async (file: File | null) => {
    if (!canManage) {
      onStatus("当前账号没有前台模板权限");
      return;
    }
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text()) as { preset?: unknown } | unknown;
      const preset = isBlockPreset((parsed as { preset?: unknown }).preset) ? (parsed as { preset: BlockPreset }).preset : parsed;
      if (!isBlockPreset(preset)) {
        onStatus("预设文件格式不正确");
        return;
      }

      const nextPreset = { ...preset, id: `${preset.id}-${Date.now()}`, category: importPresetCategory };
      const nextImported = [...importedPresets, nextPreset];
      const nextDeletedIds = deletedPresetIds.filter((id) => id !== nextPreset.id);
      persistPresetLibrary(nextImported, nextDeletedIds);
      setActivePresetCategory(nextPreset.category);
      onStatus(`已导入预设：${nextPreset.label}`);
    } catch (error) {
      onStatus(error instanceof Error ? error.message : "预设导入失败");
    } finally {
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }, [canManage, deletedPresetIds, importPresetCategory, importedPresets, onStatus, persistPresetLibrary]);

  const renderPresetList = useCallback((presets: ManagedBlockPreset[]) => {
    if (presets.length === 0) {
      return (
        <div className="puck-template-preset-empty">
          <Sparkles size={15} />
          <span>当前分类暂无预设。后续把好看的开源区块发给我，我会按这个分类转换成 Puck JSON 并加入这里。</span>
        </div>
      );
    }

    return (
      <div className="puck-template-preset-grid">
        {presets.map((preset) => {
          const missingAssets = listMissingPresetAssets(preset.requiredAssets, state);
          const disabled = !canManage || missingAssets.length > 0;
          return (
            <div
              className={`puck-template-preset-card${disabled ? " is-disabled" : ""}`}
              key={preset.id}
              title={missingAssets.length > 0 ? `缺少素材：${missingAssets.join(", ")}` : "插入到当前选中模块之后"}
            >
              <button className="puck-template-preset-card-main" disabled={disabled} type="button" onClick={() => addBlockPreset(preset)}>
                <span className="puck-template-preset-thumb">
                  <img src={preset.thumbnail} alt="" loading="lazy" />
                </span>
                <span className="puck-template-preset-copy">
                  <strong><Sparkles size={13} />{preset.label}</strong>
                  <small>{preset.description}</small>
                  {missingAssets.length > 0 ? <em>缺少素材 {missingAssets.length} 个</em> : <em>{blockPresetCategoryLabels[preset.category]}</em>}
                </span>
              </button>
              {canManage ? (
                <span className="puck-template-preset-actions">
                  <button title="导出此预设" type="button" onClick={() => exportPreset(preset)}>
                    <Download size={12} />
                  </button>
                  {preset.source === "imported" ? (
                    <button title="删除此预设" type="button" onClick={() => deletePreset(preset)}>
                      <Trash2 size={12} />
                    </button>
                  ) : null}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }, [addBlockPreset, canManage, deletePreset, exportPreset, state]);

  return (
    <div className="puck-template-left-panel puck-template-presets-plugin">
      <section className="puck-template-preset-panel">
        <div className="puck-template-panel-head">
          <div>
            <strong>行业区块 / 页面预设</strong>
            <span>预留开源预设入口；转换为结构化 Puck JSON 后可直接添加</span>
          </div>
          <input
            ref={importInputRef}
            accept="application/json,.json"
            hidden
            type="file"
            onChange={(event) => void importPresetFile(event.currentTarget.files?.[0] ?? null)}
          />
        </div>
        <div className="puck-template-panel-body" id="puck-template-preset-body">
          <div className="puck-template-preset-importer">
            <label>
              <span>导入到分类</span>
              <select
                disabled={!canManage}
                value={importPresetCategory}
                onChange={(event) => setImportPresetCategory(event.currentTarget.value)}
              >
                {blockPresetCategories.map((category) => (
                  <option key={category.key} value={category.key}>{category.label}</option>
                ))}
              </select>
            </label>
            <button disabled={!canManage} type="button" onClick={() => importInputRef.current?.click()}>
              <FileUp size={14} />导入预设
            </button>
          </div>
          <div className="puck-template-preset-tabs" aria-label="区块分类">
            <div className="puck-template-preset-category">
              <button className={`puck-template-preset-tab-button${activePresetCategory === "all" ? " is-active" : ""}`} type="button" onClick={() => setActivePresetCategory("all")}>
                <span>全部</span>
                <em>{managedBlockPresets.length}</em>
              </button>
              {activePresetCategory === "all" ? (
                <div className="puck-template-preset-category-content">
                  <div className="puck-template-preset-category-note">
                    <strong>全部分类</strong>
                    <span>所有已添加的区块预设都会显示在这里。</span>
                  </div>
                  {renderPresetList(visibleBlockPresets)}
                </div>
              ) : null}
            </div>
            {blockPresetCategories.map((category) => (
              <div className="puck-template-preset-category" key={category.key}>
                <button
                  className={`puck-template-preset-tab-button${activePresetCategory === category.key ? " is-active" : ""}`}
                  title={category.description}
                  type="button"
                  onClick={() => setActivePresetCategory(category.key)}
                >
                  <span>{category.label}</span>
                  <em>{presetCountByCategory.get(category.key) ?? 0}</em>
                </button>
                {activePresetCategory === category.key ? (
                  <div className="puck-template-preset-category-content">
                    <div className="puck-template-preset-category-note">
                      <strong>{category.label}</strong>
                      <span>{category.description}</span>
                    </div>
                    {renderPresetList(visibleBlockPresets)}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="puck-template-page-presets">
            <strong><LayoutTemplate size={14} />整页预设</strong>
            {pagePresets.length > 0 ? pagePresets.map((preset) => {
              const missingAssets = listMissingPresetAssets(preset.requiredAssets, state);
              const layoutMismatch = preset.layoutKey !== selectedLayoutKey;
              const disabled = !canManage || missingAssets.length > 0 || layoutMismatch;
              return (
                <button
                  className="puck-template-page-preset"
                  disabled={disabled}
                  key={preset.id}
                  title={layoutMismatch ? `这个预设适用于 ${preset.layoutKey}` : missingAssets.length > 0 ? `缺少素材：${missingAssets.join(", ")}` : "用此预设替换当前页面草稿"}
                  type="button"
                  onClick={() => onApplyPagePreset(preset)}
                >
                  <img src={preset.thumbnail} alt="" loading="lazy" />
                  <span>
                    <strong>{preset.label}</strong>
                    <small>{layoutMismatch ? `适用于 ${preset.layoutKey}` : preset.description}</small>
                    {missingAssets.length > 0 ? <em>缺少素材 {missingAssets.length} 个</em> : null}
                  </span>
                </button>
              );
            }) : (
              <div className="puck-template-preset-empty is-compact">暂无整页预设。</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
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
  const [pendingAddModule, setPendingAddModule] = useState<PuckTemplateAddRequest | null>(null);
  const [editingStructureLabel, setEditingStructureLabel] = useState<{ index: number; value: string } | null>(null);
  const lastExpandedWidthRef = useRef(puckLeftPanelExpandedWidth);
  const content = useMemo(() => (appState.data?.content ?? []) as VisualPageLayoutData["content"], [appState.data?.content]);
  const selectedId = selectedItem?.props?.id;

  useEffect(() => {
    if (!leftPanelCollapsed && typeof leftSideBarWidth === "number" && leftSideBarWidth > puckLeftPanelCollapsedWidth + 20) {
      lastExpandedWidthRef.current = leftSideBarWidth;
    }
  }, [leftPanelCollapsed, leftSideBarWidth]);

  useEffect(() => {
    const handleAddRequest = (event: Event) => {
      const detail = (event as CustomEvent<PuckTemplateAddRequest>).detail;
      if (!detail?.type) return;
      setLibraryCollapsed(false);
      setPendingAddModule(detail);
    };

    window.addEventListener("puck-template-request-add", handleAddRequest);
    return () => window.removeEventListener("puck-template-request-add", handleAddRequest);
  }, []);

  useEffect(() => {
    const handleEditFieldRequest = (event: Event) => {
      const detail = (event as CustomEvent<PuckTemplateEditFieldRequest>).detail;
      if (!detail?.field) return;

      if (detail.componentId) {
        const selector = findPuckItemSelectorById(content, detail.componentId);
        if (selector) {
          dispatch({ type: "setUi", ui: { itemSelector: selector } });
        }
      }

      window.setTimeout(() => focusPuckFieldControl(detail), 80);
      window.setTimeout(() => focusPuckFieldControl(detail), 220);
    };

    window.addEventListener("puck-template-request-edit-field", handleEditFieldRequest);
    return () => window.removeEventListener("puck-template-request-edit-field", handleEditFieldRequest);
  }, [content, dispatch]);

  const selectItem = useCallback((index: number) => {
    dispatch({ type: "setUi", ui: { itemSelector: { index, zone: rootDropZone } } });
  }, [dispatch]);

  const saveStructureLabel = useCallback((index: number, value: string) => {
    const item = content[index];
    if (!canManage || !item) {
      setEditingStructureLabel(null);
      return;
    }

    const trimmedValue = value.trim();
    const currentProps = getPuckItemProps(item);
    dispatch({
      type: "replace",
      destinationIndex: index,
      destinationZone: rootDropZone,
      data: {
        ...item,
        props: {
          ...currentProps,
          id: typeof currentProps.id === "string" ? currentProps.id : `${item.type}-${index}`,
          adminLabel: trimmedValue
        }
      } as VisualPageLayoutData["content"][number],
      recordHistory: true
    });
    dispatch({ type: "setUi", ui: { itemSelector: { index, zone: rootDropZone } } });
    setEditingStructureLabel(null);
  }, [canManage, content, dispatch]);

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

  const addModuleWithContainerPattern = useCallback((componentType: string, containerPattern: string) => {
    const componentConfig = config.components[componentType];
    if (!canManage || !componentConfig) return;

    const id = `${componentType}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const defaultProps = "defaultProps" in componentConfig && componentConfig.defaultProps
      ? JSON.parse(JSON.stringify(componentConfig.defaultProps)) as Record<string, unknown>
      : {};
    const isCustomContainerModule = customQuickAddModules.some((module) => module.type === componentType);
    const selectedIndex = selectedId ? content.findIndex((item) => getPuckItemProps(item).id === selectedId) : -1;
    const destinationIndex = selectedIndex >= 0 ? selectedIndex + 1 : content.length;
    const nextItem = {
      type: componentType,
      props: {
        ...defaultProps,
        ...(isCustomContainerModule ? customSectionContainerOnlyProps(componentType, containerPattern) : {}),
        id,
        containerPattern
      }
    };
    if (!pendingAddModule?.target) {
      ratioHandledInsertIds.add(id);
      dispatch({
        type: "insert",
        componentType,
        destinationIndex,
        destinationZone: rootDropZone,
        id,
        recordHistory: true
      });
    }

    const targetIndex = pendingAddModule?.target?.index ?? destinationIndex;
    const targetZone = pendingAddModule?.target?.zone ?? rootDropZone;
    const targetId = pendingAddModule?.target?.id ?? id;
    dispatch({
      type: "replace",
      destinationIndex: targetIndex,
      destinationZone: targetZone,
      data: {
        ...nextItem,
        props: {
          ...nextItem.props,
          id: targetId
        }
      },
      recordHistory: true
    });
    dispatch({ type: "setUi", ui: { itemSelector: { index: targetIndex, zone: targetZone } } });
    setPendingAddModule(null);
  }, [canManage, config.components, content, dispatch, pendingAddModule?.target, selectedId]);

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
                const isEditingLabel = editingStructureLabel?.index === index;

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
                    <button
                      className="puck-template-structure-main"
                      type="button"
                      onClick={() => selectItem(index)}
                      onDoubleClick={(event) => {
                        if (!canManage) return;
                        event.preventDefault();
                        event.stopPropagation();
                        selectItem(index);
                        setEditingStructureLabel({ index, value: label.title });
                      }}
                    >
                      <GripVertical size={15} aria-hidden="true" />
                      <span>
                        {isEditingLabel ? (
                          <input
                            autoFocus
                            className="puck-template-structure-label-input"
                            value={editingStructureLabel.value}
                            onBlur={() => saveStructureLabel(index, editingStructureLabel.value)}
                            onChange={(event) => setEditingStructureLabel({ index, value: event.target.value })}
                            onClick={(event) => event.stopPropagation()}
                            onDoubleClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                saveStructureLabel(index, editingStructureLabel.value);
                              }
                              if (event.key === "Escape") {
                                event.preventDefault();
                                setEditingStructureLabel(null);
                              }
                            }}
                          />
                        ) : (
                          <strong title="双击修改模块名称">{label.title}</strong>
                        )}
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
          {pendingAddModule ? (
            <div
              className="puck-template-add-ratio-dialog"
              role="dialog"
              aria-label={`选择${pendingAddModule.label}容器比例`}
              onMouseDown={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <div className="puck-template-add-ratio-head">
                <strong>{pendingAddModule.label}</strong>
                <button aria-label="关闭容器比例选择" type="button" onClick={() => setPendingAddModule(null)}>
                  <X size={13} />
                </button>
              </div>
              <span>先选择容器比例，再添加模块内容。</span>
              <div className="puck-template-add-ratio-grid">
                {containerPatternChoices.map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => addModuleWithContainerPattern(pendingAddModule.type, choice.value)}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <Puck.Components />
        </div>
      </section>
    </div>
  );
}

function createPuckPlugins({
  canManage,
  onApplyPagePreset,
  onStatus,
  selectedLayoutKey,
  state
}: {
  canManage: boolean;
  onApplyPagePreset: (preset: PagePreset) => void;
  onStatus: (message: string) => void;
  selectedLayoutKey: PageLayoutKey;
  state: AdminState;
}): Plugin[] {
  return [
    {
      name: "blocks",
      label: "Blocks",
      icon: <Layers size={16} />,
      render: () => (
        <PuckTemplateBlocksPanel
          canManage={canManage}
        />
      )
    },
    {
      name: "presets",
      label: "Presets",
      icon: <LayoutTemplate size={16} />,
      render: () => (
        <PuckTemplatePresetPanel
          canManage={canManage}
          onApplyPagePreset={onApplyPagePreset}
          onStatus={onStatus}
          selectedLayoutKey={selectedLayoutKey}
          state={state}
        />
      )
    }
  ];
}

function createConfig(
  state: AdminState,
  locale: LocaleCode,
  layoutKey: PageLayoutKey,
  options: { onUploadImage?: (file: File) => Promise<string> } = {}
): Config {
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
      const componentId = typeof props.id === "string" && props.id ? props.id : type;
      const editTarget = getPrimaryEditTarget(type, props);
      const editTitle = editTarget.kind === "video"
        ? `双击编辑${editTarget.label}，右侧会定位到视频属性`
        : editTarget.kind === "image"
          ? `双击编辑${editTarget.label}，右侧会定位到图片属性`
          : `双击编辑${editTarget.label}`;

      return (
        <div
          className={`puck-editor-preview-scope puck-editor-preview-scope--${editTarget.kind}`}
          data-puck-edit-component={componentId}
          data-puck-edit-field={editTarget.field}
          data-puck-edit-kind={editTarget.kind}
          title={editTitle}
          onDoubleClick={(event) => requestPuckFieldEdit({ ...editTarget, componentId }, event)}
        >
          <PuckVisualBlock
            currentArticle={firstArticle}
            currentProduct={firstProduct}
            editable
            item={{ type, props: { ...props, id: componentId } }}
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
      fields: {
        title: field("text", "页面标题"),
        footerTagline: field("textarea", "页脚说明"),
        footerCopyright: field("text", "页脚版权行"),
        footerCredit: field("text", "页脚右侧说明")
      },
      render: ({ children, footerCopyright, footerCredit, footerTagline }: { children: ReactNode } & FooterDraftProps) => (
        <PuckPreviewShell
          footerDraft={{ footerCopyright, footerCredit, footerTagline }}
          layoutKey={layoutKey}
          locale={locale}
          state={state}
        >
          {children}
        </PuckPreviewShell>
      )
    },
    categories: {
      custom: {
        title: "模块类型",
        components: ["CustomMediaSection", "CustomTextSection", "CustomVideoSection", "CustomCtaSection", "CustomSection"],
        defaultExpanded: true
      },
      containerElements: {
        title: "容器元素",
        components: containerSlotComponentTypes,
        defaultExpanded: false
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
      LoopingImagesPreset: {
        label: "Looping images 预设",
        fields: {
          eyebrow: field("text", "小标题"),
          title: field("textarea", "标题"),
          body: field("textarea", "说明"),
          imageItems: loopingImagesField("循环图片", imageMediaItems, options.onUploadImage),
          imageUrls: field("textarea", "兼容批量图片 URL（每行一个）"),
          imageLimit: manualNumberField("图片数量（2-8）", 2, 8),
          backgroundMode: radioField("背景", [
            { label: "柔和光晕", value: "soft" },
            { label: "浅色强调", value: "tint" },
            { label: "深色", value: "dark" },
            { label: "自定义", value: "custom" },
            { label: "透明", value: "none" }
          ]),
          backgroundImageUrl: mediaPickerField("背景图：从媒体库选择", imageMediaItems, "image"),
          externalBackgroundImageUrl: field("text", "外部背景图 URL"),
          customBackground: colorCssField("背景颜色 / CSS"),
          stageSize: manualNumberField("轨道画布尺寸", 320, 760),
          itemSize: manualNumberField("图片尺寸", 72, 220),
          speedSeconds: manualNumberField("循环秒数", 4, 20),
          imageFit: radioField("图片裁切", [
            { label: "填满裁切", value: "cover" },
            { label: "完整显示", value: "contain" }
          ]),
          imageFrame: radioField("图片边框", [
            { label: "阴影", value: "shadow" },
            { label: "细线", value: "line" },
            { label: "无", value: "none" }
          ]),
          textAlign: radioField("文字对齐", [
            { label: "居中", value: "center" },
            { label: "左对齐", value: "left" }
          ])
        },
        defaultProps: {
          eyebrow: "Visual loop",
          title: "Looping images",
          body: "Circular image motion inspired by dimi.me Lab.",
          mediaLibraryUrl: "",
          imageUrls: "",
          imageItems: [],
          imageLimit: 8,
          backgroundMode: "soft",
          backgroundImageUrl: "",
          externalBackgroundImageUrl: "",
          customBackground: "",
          stageSize: 620,
          itemSize: 150,
          speedSeconds: 8,
          imageFit: "cover",
          imageFrame: "shadow",
          textAlign: "center"
        },
        render: render("LoopingImagesPreset")
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
          buttonStyle: radioField("主按钮样式", buttonStyleChoices),
          secondaryLabel: field("text", "次按钮文字"),
          secondaryHref: field("text", "次按钮链接"),
          secondaryButtonStyle: radioField("次按钮样式", buttonStyleChoices),
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
        defaultProps: { eyebrow: "RFQ", title: "Ready to quote?", body: "", buttonLabel: "Contact us", href: "#rfq", buttonStyle: "primary", secondaryLabel: "", secondaryHref: "/contact", secondaryButtonStyle: "secondary", mediaLibraryUrl: "", imageUrl: "", align: "split", tone: "dark", spacing: "normal" },
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
      ContainerTextElement: {
        label: "容器文字",
        fields: containerTextFields(),
        defaultProps: { title: "内容标题", eyebrow: "", body: "双击可直接编辑文字，也可以在右侧属性面板修改。", textSize: "normal", href: "", openInNewTab: false, align: "left", verticalAlign: "start", padding: "normal", minHeight: "auto", background: "transparent", customBackground: "", textColor: "", accentColor: "", borderStyle: "line", radius: "medium", shadow: "none", isHidden: false, adminLabel: "" },
        render: render("ContainerTextElement")
      },
      ContainerImageElement: {
        label: "容器图片",
        fields: containerImageFields(imageMediaItems),
        defaultProps: { imageUrl: "/assets/current-template/hero-tooling-range.jpg", externalImageUrl: "", imageItems: [], displayMode: "single", transitionEffect: "fade", intervalSeconds: 5, overlay: "none", hoverEffect: "none", captionPlacement: "below", alt: "Container image", caption: "", href: "", openInNewTab: false, imageRatio: "wide", imageFit: "cover", align: "left", verticalAlign: "start", padding: "normal", minHeight: "auto", background: "transparent", customBackground: "", textColor: "", accentColor: "", borderStyle: "line", radius: "medium", shadow: "none", isHidden: false, adminLabel: "" },
        render: render("ContainerImageElement")
      },
      ContainerImageTextElement: {
        label: "容器图文",
        fields: containerImageTextFields(imageMediaItems),
        defaultProps: { imageUrl: "/assets/current-template/hero-tooling-range.jpg", externalImageUrl: "", imageItems: [], displayMode: "single", transitionEffect: "fade", intervalSeconds: 5, overlay: "none", hoverEffect: "none", captionPlacement: "below", imagePlacement: "top", imageRatio: "wide", imageFit: "cover", eyebrow: "", title: "图文内容", body: "选择这个元素后，可在右侧修改图片、标题、正文和链接。", textSize: "normal", href: "", openInNewTab: false, buttonLabel: "", buttonStyle: "text", align: "left", verticalAlign: "start", padding: "normal", minHeight: "auto", background: "transparent", customBackground: "", textColor: "", accentColor: "", borderStyle: "line", radius: "medium", shadow: "none", isHidden: false, adminLabel: "" },
        render: render("ContainerImageTextElement")
      },
      ContainerVideoElement: {
        label: "容器视频",
        fields: containerVideoFields(imageMediaItems, videoMediaItems),
        defaultProps: { videoUrl: "", externalVideoUrl: "", title: "视频内容", body: "", posterUrl: "", videoRatio: "wide", autoplay: false, muted: true, loop: false, textSize: "normal", align: "left", verticalAlign: "start", padding: "normal", minHeight: "auto", background: "transparent", customBackground: "", textColor: "", accentColor: "", borderStyle: "line", radius: "medium", shadow: "none", isHidden: false, adminLabel: "" },
        render: render("ContainerVideoElement")
      },
      ContainerButtonElement: {
        label: "容器按钮",
        fields: containerButtonFields(),
        defaultProps: { buttonLabel: "了解更多", href: "#rfq", openInNewTab: false, buttonStyle: "primary", buttonSize: "normal", title: "", body: "", textSize: "normal", align: "left", verticalAlign: "start", padding: "normal", minHeight: "auto", background: "transparent", customBackground: "", textColor: "", accentColor: "", borderStyle: "line", radius: "medium", shadow: "none", isHidden: false, adminLabel: "" },
        render: render("ContainerButtonElement")
      },
      ContainerHtmlElement: {
        label: "容器 HTML",
        fields: containerHtmlFields(),
        defaultProps: { body: "<p>HTML / Markdown content</p>", renderMode: "markdown", align: "left", verticalAlign: "start", padding: "normal", minHeight: "auto", background: "transparent", customBackground: "", textColor: "", accentColor: "", borderStyle: "line", radius: "medium", shadow: "none", isHidden: false, adminLabel: "" },
        render: render("ContainerHtmlElement")
      },
      ContainerSeparatorElement: {
        label: "容器分隔线",
        fields: containerSeparatorFields(),
        defaultProps: { separatorStyle: "solid", separatorWidth: "full", thickness: 1, align: "center", verticalAlign: "center", padding: "normal", minHeight: "auto", background: "transparent", customBackground: "", textColor: "", accentColor: "", borderStyle: "none", radius: "none", shadow: "none", isHidden: false, adminLabel: "" },
        render: render("ContainerSeparatorElement")
      },
      CustomMediaSection: {
        label: "图文模块",
        fields: customMediaSectionFields,
        resolveData: (data) => normalizeCustomSectionContainerData(data as Record<string, unknown>),
        defaultProps: customSectionContainerOnlyProps("CustomMediaSection", "1/1"),
        render: render("CustomSection")
      },
      CustomTextSection: {
        label: "纯文字模块",
        fields: customTextSectionFields,
        resolveData: (data) => normalizeCustomSectionContainerData(data as Record<string, unknown>),
        defaultProps: customSectionContainerOnlyProps("CustomTextSection", "1/1"),
        render: render("CustomSection")
      },
      CustomVideoSection: {
        label: "视频模块",
        fields: customVideoSectionFields,
        resolveData: (data) => normalizeCustomSectionContainerData(data as Record<string, unknown>),
        defaultProps: customSectionContainerOnlyProps("CustomVideoSection", "1/1"),
        render: render("CustomSection")
      },
      CustomCtaSection: {
        label: "行动按钮模块",
        fields: customCtaSectionFields,
        resolveData: (data) => normalizeCustomSectionContainerData(data as Record<string, unknown>),
        defaultProps: customSectionContainerOnlyProps("CustomCtaSection", "1/1"),
        render: render("CustomSection")
      },
      CustomSection: {
        label: "自定义模块",
        fields: customSectionFields,
        resolveFields: (data) => {
          const props = "props" in data && data.props && typeof data.props === "object" ? data.props as Record<string, unknown> : data as Record<string, unknown>;
          return createCustomSectionFields(getCustomSectionModuleType(props.moduleType), imageMediaItems, videoMediaItems);
        },
        resolveData: (data) => normalizeCustomSectionContainerData(data as Record<string, unknown>),
        defaultProps: customSectionContainerOnlyProps("CustomSection", "1/1"),
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
  onRequestClose: (data: Data) => void;
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
          onRequestClose(appState.data as Data);
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

function PuckTemplateHeaderMeta({
  blockCount,
  innerRef,
  pageLabel,
  updatedAt
}: {
  blockCount: number;
  innerRef?: Ref<HTMLDivElement>;
  pageLabel: string;
  updatedAt?: string;
}) {
  return (
    <div className="puck-template-inline-meta" aria-label="当前模板页面状态" ref={innerRef}>
      <span>当前页面：{pageLabel}</span>
      <span>区块数：{blockCount}</span>
      <span>最近保存：{updatedAt ? new Date(updatedAt).toLocaleString() : "尚未保存"}</span>
    </div>
  );
}

export function PuckTemplateEditor({ state, locale, canManage, onStateChange, onStatus }: PuckTemplateEditorProps) {
  const packageInputRef = useRef<HTMLInputElement>(null);
  const headerMetaRef = useRef<HTMLDivElement>(null);
  const puckShellRef = useRef<HTMLDivElement>(null);
  const skipNextLayoutSyncRef = useRef<{ key: PageLayoutKey; updatedAt?: string } | null>(null);
  const stateRef = useRef(state);
  const options = useMemo(() => createPageOptions(state), [state]);
  const [selectedKey, setSelectedKey] = useState<PageLayoutKey>("home");
  const selectedOption = options.find((option) => option.key === selectedKey) ?? options[0];
  const [draftData, setDraftData] = useState<VisualPageLayoutData>(() => dataWithFooterDraftProps(selectedOption?.layout?.data, state, locale));
  const savedDraftSignatureRef = useRef(serializePuckData(draftData));
  const [saving, setSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [packageBusy, setPackageBusy] = useState(false);
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const selectedOptionKey = selectedOption?.key;
  const selectedOptionUpdatedAt = selectedOption?.layout?.updatedAt;
  const selectedOptionData = selectedOption?.layout?.data;
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const uploadTemplateImage = useCallback(async (file: File) => {
    if (!canManage) {
      onStatus("当前账号没有前台模板权限");
      throw new Error("No template permission");
    }
    if (!file.type.startsWith("image/")) {
      onStatus("请选择图片文件");
      throw new Error("请选择图片文件");
    }

    const formData = new FormData();
    formData.append("file", file);
    onStatus("图片上传中...");

    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "图片上传失败" }));
      throw new Error(payload.error || "图片上传失败");
    }

    const payload = await response.json() as { file: { url: string }; state: AdminState };
    onStateChange(payload.state);
    onStatus("图片已上传，可点击保存发布模板改动");
    return payload.file.url;
  }, [canManage, onStateChange, onStatus]);
  const config = useMemo(
    () => createConfig(state, locale, selectedOptionKey ?? "home", { onUploadImage: uploadTemplateImage }),
    [locale, selectedOptionKey, state, uploadTemplateImage]
  );
  const permissions: Partial<Permissions> = useMemo(() => ({
    drag: canManage,
    duplicate: canManage,
    delete: canManage,
    edit: canManage,
    insert: canManage
  }), [canManage]);

  useEffect(() => {
    if (!selectedOptionKey) return;
    const skipSync = skipNextLayoutSyncRef.current;
    if (skipSync?.key === selectedOptionKey && skipSync.updatedAt === selectedOptionUpdatedAt) {
      skipNextLayoutSyncRef.current = null;
      setCloseDialogOpen(false);
      return;
    }

    const nextSavedDraft = dataWithFooterDraftProps(selectedOptionData, stateRef.current, locale);
    savedDraftSignatureRef.current = serializePuckData(nextSavedDraft);
    setDraftData(nextSavedDraft);
    setEditorResetKey((current) => current + 1);
    setCloseDialogOpen(false);
  }, [selectedOptionKey, selectedOptionUpdatedAt, selectedOptionData, locale]);

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

  useEffect(() => {
    const meta = headerMetaRef.current;
    const shell = puckShellRef.current;
    const titleSlot = shell?.querySelector<HTMLElement>('[class*="_PuckHeader-title"]');

    if (!meta || !shell || !titleSlot) return;
    if (meta.parentElement !== titleSlot) titleSlot.insertBefore(meta, titleSlot.firstChild);

    return () => {
      if (meta.parentElement !== shell) shell.insertBefore(meta, shell.firstChild);
    };
  }, [editorResetKey, isFullscreen, selectedOptionKey]);

  useEffect(() => {
    if (isFullscreen) return;
    const shell = puckShellRef.current;
    const workspace = shell?.closest<HTMLElement>(".admin-workspace");
    if (!shell || !workspace) return;

    const cleanupFns: Array<() => void> = [];
    const attachedFrames = new WeakSet<HTMLIFrameElement>();

    const attachFrameWheelBridge = (frame: HTMLIFrameElement) => {
      if (attachedFrames.has(frame)) return;
      attachedFrames.add(frame);

      const attachDocumentWheel = () => {
        const frameDocument = frame.contentDocument;
        if (!frameDocument) return;

        const handleWheel = (event: globalThis.WheelEvent) => {
          const target = event.target;
          const targetElement = target && typeof (target as Element).closest === "function" ? target as Element : null;
          if (targetElement?.closest("input, textarea, select, button, [contenteditable='true']")) return;
          bridgeWheelToWorkspace(event, workspace);
        };

        frameDocument.addEventListener("wheel", handleWheel, { passive: false });
        cleanupFns.push(() => frameDocument.removeEventListener("wheel", handleWheel));
      };

      frame.addEventListener("load", attachDocumentWheel);
      cleanupFns.push(() => frame.removeEventListener("load", attachDocumentWheel));
      attachDocumentWheel();
    };

    const attachAllFrames = () => {
      shell.querySelectorAll<HTMLIFrameElement>("iframe").forEach(attachFrameWheelBridge);
    };

    const observer = new MutationObserver(attachAllFrames);
    observer.observe(shell, { childList: true, subtree: true });
    cleanupFns.push(() => observer.disconnect());
    attachAllFrames();

    return () => cleanupFns.forEach((cleanup) => cleanup());
  }, [editorResetKey, isFullscreen, selectedOptionKey]);

  const closeEditorWithoutSaving = useCallback((discardedChanges = true) => {
    const nextSavedDraft = dataWithFooterDraftProps(selectedOptionData, stateRef.current, locale);
    savedDraftSignatureRef.current = serializePuckData(nextSavedDraft);
    setDraftData(nextSavedDraft);
    setEditorResetKey((current) => current + 1);
    setIsFullscreen(false);
    setCloseDialogOpen(false);
    onStatus(discardedChanges ? "已关闭编辑，未保存的模板改动已丢弃" : "已关闭编辑");
  }, [locale, onStatus, selectedOptionData]);

  const requestCloseEditor = useCallback((currentData: Data) => {
    const hasUnsavedChanges = serializePuckData(currentData) !== savedDraftSignatureRef.current;
    if (hasUnsavedChanges) {
      setCloseDialogOpen(true);
      return;
    }

    closeEditorWithoutSaving(false);
  }, [closeEditorWithoutSaving]);

  const applyPagePreset = useCallback((preset: PagePreset) => {
    if (!canManage) {
      onStatus("当前账号没有前台模板权限");
      return;
    }
    if (!selectedOption || preset.layoutKey !== selectedOption.key) {
      onStatus("这个整页预设不适用于当前页面");
      return;
    }

    const missingAssets = listMissingPresetAssets(preset.requiredAssets, state);
    if (missingAssets.length > 0) {
      onStatus(`整页预设缺少素材：${missingAssets.join(", ")}`);
      return;
    }

    setDraftData(dataWithFooterDraftProps(clonePresetData(preset.puckData), state, locale));
    setEditorResetKey((current) => current + 1);
    onStatus(`已套用整页预设：${preset.label}，点击保存发布后生效`);
  }, [canManage, locale, onStatus, selectedOption, state]);

  const puckPlugins = useMemo(() => createPuckPlugins({
    canManage,
    onApplyPagePreset: applyPagePreset,
    onStatus,
    selectedLayoutKey: selectedOptionKey ?? "home",
    state
  }), [applyPagePreset, canManage, onStatus, selectedOptionKey, state]);

  const saveLayout = useCallback(async (nextData: Data = draftData) => {
    if (!canManage || !selectedOption) {
      onStatus("当前账号没有前台模板权限");
      return;
    }

    const previousBodyOverflow = typeof document === "undefined" ? "" : document.body.style.overflow;
    setSaving(true);
    onStatus("正在保存 Puck 页面布局...");

    try {
      const nextRootProps = (((nextData as VisualPageLayoutData).root?.props ?? {}) as Record<string, unknown>);
      const nextFooterSettings = {
        footerTagline: translationFromFooterDraft(nextRootProps.footerTagline, state.templateSettings.footerTagline),
        footerCopyright: translationFromFooterDraft(nextRootProps.footerCopyright, state.templateSettings.footerCopyright),
        footerCredit: translationFromFooterDraft(nextRootProps.footerCredit, state.templateSettings.footerCredit)
      };
      const response = await fetch("/api/admin/page-layouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: selectedOption.key,
          label: selectedOption.label,
          data: nextData,
          templateSettings: nextFooterSettings
        })
      });

      const payload = await response.json() as { state?: AdminState; error?: string };
      if (!response.ok || !payload.state) {
        onStatus(payload.error || "Puck 页面布局保存失败");
        return;
      }

      const savedLayout = payload.state.pageLayouts.find((layout) => layout.key === selectedOption.key);
      skipNextLayoutSyncRef.current = { key: selectedOption.key, updatedAt: savedLayout?.updatedAt };
      onStateChange(payload.state);
      const nextSavedDraft = dataWithFooterDraftProps(nextData as VisualPageLayoutData, payload.state, locale);
      savedDraftSignatureRef.current = serializePuckData(nextSavedDraft);
      setDraftData(nextSavedDraft);
      onStatus("Puck 页面布局已保存并发布");
    } catch (error) {
      onStatus(error instanceof Error ? error.message : "Puck 页面布局保存失败");
    } finally {
      setSaving(false);
      restoreTemplateScrollAfterSave(puckShellRef.current, isFullscreen, previousBodyOverflow);
    }
  }, [canManage, draftData, isFullscreen, locale, onStateChange, onStatus, selectedOption, state.templateSettings.footerCopyright, state.templateSettings.footerCredit, state.templateSettings.footerTagline]);

  const puckOverrides = useMemo(() => ({
    drawerItem: ({ children, name }: { children: ReactNode; name: string }) => (
      <PuckTemplateComponentItem canManage={canManage} name={name}>
        {children}
      </PuckTemplateComponentItem>
    ),
    headerActions: () => (
      <PuckTemplateHeaderActions
        canManage={canManage}
        onRequestClose={requestCloseEditor}
        onSave={(nextData) => void saveLayout(nextData)}
        saving={saving}
      />
    )
  }), [canManage, requestCloseEditor, saveLayout, saving]);

  const handlePuckAction = useCallback((action: PuckAction) => {
    if (!canManage || action.type !== "insert") return;
    if (action.id && ratioHandledInsertIds.has(action.id)) {
      ratioHandledInsertIds.delete(action.id);
      return;
    }
    const quickAddModule = customQuickAddModules.find((module) => module.type === action.componentType);
    if (!quickAddModule) return;

    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent<PuckTemplateAddRequest>("puck-template-request-add", {
        detail: {
          label: quickAddModule.label,
          target: {
            id: action.id,
            index: action.destinationIndex,
            zone: action.destinationZone
          },
          type: action.componentType
        }
      }));
    }, 0);
  }, [canManage]);

  const bridgeTemplateWheel = useCallback((event: WheelEvent<HTMLElement>) => {
    if (isFullscreen || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    const shell = puckShellRef.current;
    if (!target || !shell || target.closest(templateWheelIgnoreSelector) || hasScrollableAncestor(target, shell)) return;

    const workspace = shell.closest<HTMLElement>(".admin-workspace");
    if (!workspace || workspace.scrollHeight <= workspace.clientHeight + 1) return;

    bridgeWheelToWorkspace(event.nativeEvent, workspace);
  }, [isFullscreen]);

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
      <div className="puck-template-shell" ref={puckShellRef} onWheelCapture={bridgeTemplateWheel}>
        <PuckTemplateHeaderMeta
          blockCount={draftData.content.length}
          innerRef={headerMetaRef}
          pageLabel={selectedOption.label}
          updatedAt={selectedOption.layout?.updatedAt}
        />
        <Puck
          config={config}
          data={draftData}
          headerPath={selectedOption.label}
          headerTitle="ExportForge Puck"
          height={isFullscreen ? "100%" : puckTemplateEditorHeight}
          key={`${selectedOption.key}-${editorResetKey}`}
          onAction={handlePuckAction}
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
              <button className="puck-template-dialog-danger" type="button" onClick={() => closeEditorWithoutSaving(true)}>
                不保存退出
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
