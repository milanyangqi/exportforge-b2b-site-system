import type { ThemeKey } from "@/types/site";

export type SiteTheme = {
  key: ThemeKey;
  name: string;
  description: string;
  colors: {
    ink: string;
    muted: string;
    background: string;
    panel: string;
    primary: string;
    accent: string;
    line: string;
  };
  radius: string;
  heroLayout: "technical-grid" | "clean-split" | "premium-band" | "equipment-spec" | "catalog-first";
  contactDock: "left-rail" | "right-rail" | "bottom-sheet";
};

export const themes: Record<ThemeKey, SiteTheme> = {
  industrial: {
    key: "industrial",
    name: "Industrial",
    description: "For machining, tools, machinery, metalwork, and manufacturing exporters.",
    colors: { ink: "#092436", muted: "#597080", background: "#f3f8fb", panel: "#ffffff", primary: "#0b5f7d", accent: "#f36f21", line: "#c7d8e2" },
    radius: "8px",
    heroLayout: "technical-grid",
    contactDock: "left-rail"
  },
  "clean-export": {
    key: "clean-export",
    name: "Clean Export",
    description: "For broad trading companies and general export catalogs.",
    colors: { ink: "#17212b", muted: "#65717d", background: "#f7f9fb", panel: "#ffffff", primary: "#1c6f68", accent: "#d8a23a", line: "#d7dee5" },
    radius: "6px",
    heroLayout: "clean-split",
    contactDock: "right-rail"
  },
  "premium-brand": {
    key: "premium-brand",
    name: "Premium Brand",
    description: "For higher-ticket branded export products.",
    colors: { ink: "#161717", muted: "#6d6a62", background: "#f5f2ea", panel: "#fffdfa", primary: "#27251f", accent: "#b88445", line: "#ded4c4" },
    radius: "4px",
    heroLayout: "premium-band",
    contactDock: "right-rail"
  },
  equipment: {
    key: "equipment",
    name: "Equipment",
    description: "For machinery, automation, and specification-led equipment sales.",
    colors: { ink: "#111827", muted: "#5b6573", background: "#eef2f6", panel: "#ffffff", primary: "#233b63", accent: "#e4572e", line: "#cfd8e3" },
    radius: "8px",
    heroLayout: "equipment-spec",
    contactDock: "left-rail"
  },
  "consumer-goods": {
    key: "consumer-goods",
    name: "Consumer Goods",
    description: "For packaging, lifestyle, home, gifts, and wholesale goods.",
    colors: { ink: "#1d2930", muted: "#66767d", background: "#f6faf7", panel: "#ffffff", primary: "#27735f", accent: "#ed7d6f", line: "#d5e4dd" },
    radius: "10px",
    heroLayout: "catalog-first",
    contactDock: "bottom-sheet"
  }
};

export const activeTheme = themes.industrial;
