import type { PageLayoutKey, VisualPageLayoutData } from "@/types/site";

export type BlockPresetCategory = string;

export type BlockPreset = {
  id: string;
  category: BlockPresetCategory;
  label: string;
  description: string;
  thumbnail: string;
  requiredAssets: string[];
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

export const currentTemplateAssetPaths = new Set([
  "/assets/current-template/hero-tooling-range.jpg",
  "/assets/current-template/hero-cnc-factory.jpg",
  "/assets/current-template/hero-export-packing.jpg",
  "/assets/current-template/carbide-end-mills.png",
  "/assets/current-template/drill-bits.png",
  "/assets/current-template/coating-inspection.png",
  "/assets/current-template/export-packaging.png"
]);

export const blockPresetCategories: Array<{ key: BlockPresetCategory; label: string; description: string }> = [
  { key: "nested-columns", label: "嵌套列", description: "多列容器、复杂栅格、左右分栏和组合布局。" },
  { key: "text-path", label: "路径文字", description: "沿路径排版的装饰文字、弧形标题和视觉强调文字。" },
  { key: "title", label: "标题", description: "页面标题、区块标题、说明标题和标题组合。" },
  { key: "post-cards", label: "文章卡片", description: "文章列表、博客卡片、新闻卡片和内容推荐。" },
  { key: "button", label: "按钮", description: "主按钮、次按钮、图标按钮、CTA 按钮和按钮组。" },
  { key: "image-carousel", label: "图片轮播", description: "首屏轮播、产品轮播、案例轮播和横向滑动图片。" },
  { key: "toggles", label: "折叠开关", description: "折叠面板、展开收起内容和问答开关。" },
  { key: "table-of-contents", label: "目录", description: "文章目录、页面锚点目录和快速导航。" },
  { key: "circles-info", label: "圆形信息", description: "圆形图标、圆形数据、环形信息和视觉卖点。" },
  { key: "image-hotspots", label: "图片热点", description: "带热点标注的产品图、工厂图和流程图。" },
  { key: "content-boxes", label: "内容盒子", description: "信息盒、功能盒、卖点盒和内容组合卡。" },
  { key: "testimonials", label: "客户评价", description: "客户评价、案例背书、合作反馈和引用内容。" },
  { key: "menu", label: "菜单", description: "导航菜单、分类菜单、页内菜单和链接列表。" },
  { key: "flip-boxes", label: "翻转盒子", description: "正反面切换卡片、悬停翻转和交互说明盒。" },
  { key: "openstreetmap", label: "地图", description: "地图位置、联系地址、服务区域和门店定位。" },
  { key: "image", label: "图片", description: "单图、产品图、工厂图、带说明图片和媒体框。" },
  { key: "progress-bar", label: "进度条", description: "进度展示、能力比例、步骤进度和数据条。" },
  { key: "checklist", label: "清单", description: "采购清单、功能清单、RFQ 清单和勾选列表。" },
  { key: "gallery", label: "图库", description: "图片网格、产品图库、工厂图库和案例图库。" },
  { key: "tabs", label: "标签页", description: "Tab 切换、规格分组、内容分栏和选项卡。" },
  { key: "image-before-after", label: "图片前后对比", description: "前后对比图、加工效果对比和状态对比。" },
  { key: "social-links", label: "社交链接", description: "社交媒体链接、联系方式入口和外部平台链接。" },
  { key: "tag-cloud", label: "标签云", description: "标签集合、关键词云、分类标签和主题入口。" },
  { key: "countdown", label: "倒计时", description: "活动倒计时、交期倒计时和促销倒计时。" },
  { key: "text-block", label: "文本块", description: "正文内容、说明文字、富文本和段落区块。" },
  { key: "social-sharing", label: "社交分享", description: "分享按钮、文章分享、产品分享和社媒传播入口。" },
  { key: "news-ticker", label: "新闻滚动", description: "公告滚动、新闻条、动态信息和通知条。" },
  { key: "counter-boxes", label: "计数器盒子", description: "数据统计、数字证明、增长指标和计数卡片。" },
  { key: "alert", label: "提醒", description: "提示框、警告框、成功提示和重要通知。" }
];

export const blockPresetCategoryLabels = Object.fromEntries(
  blockPresetCategories.map((category) => [category.key, category.label])
) as Record<BlockPresetCategory, string>;

const loopingImageAssets = [
  "/assets/current-template/hero-tooling-range.jpg",
  "/assets/current-template/hero-cnc-factory.jpg",
  "/assets/current-template/hero-export-packing.jpg",
  "/assets/current-template/carbide-end-mills.png",
  "/assets/current-template/drill-bits.png",
  "/assets/current-template/coating-inspection.png",
  "/assets/current-template/export-packaging.png"
];

// Converted from dimi.me Lab's "Looping images" interaction into a dedicated local preset block.
export const blockPresets: BlockPreset[] = [
  {
    id: "looping-images-circular-gallery",
    category: "image-carousel",
    label: "Looping images",
    description: "多张图片沿圆形轨道无缝循环，适合产品系列、工厂场景或案例图片展示。",
    thumbnail: "/assets/current-template/hero-tooling-range.jpg",
    requiredAssets: loopingImageAssets,
    puckData: [
      {
        type: "LoopingImagesPreset",
        props: {
          id: "looping-images-preset",
          eyebrow: "Visual loop",
          title: "Looping images",
          body: "Circular image motion inspired by dimi.me Lab. Replace the images from the media library after inserting.",
          mediaLibraryUrl: "",
          imageUrls: "",
          imageItems: loopingImageAssets.map((url, index) => ({
            source: url,
            url: "",
            alt: `Looping image ${index + 1}`,
            caption: "",
            linkHref: ""
          })),
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
        }
      }
    ]
  }
];

// Reserved registry: add full-page presets here after review.
export const pagePresets: PagePreset[] = [];
