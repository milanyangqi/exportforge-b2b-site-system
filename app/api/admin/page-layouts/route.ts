import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { readAdminState, sanitizeAdminState, writeAdminState } from "@/lib/server/admin-store";
import type { AdminState, PageLayoutKey, RoleKey, SiteTemplateSettings, Translation, VisualPageLayoutData } from "@/types/site";

type PageLayoutRequest = {
  key?: PageLayoutKey;
  label?: string;
  data?: VisualPageLayoutData;
  templateSettings?: Partial<Pick<SiteTemplateSettings, "footerCopyright" | "footerCredit" | "footerTagline">>;
};

const frontendManagerRoles = new Set<RoleKey>(["super-admin", "admin"]);

function canManageTemplates(state: AdminState, role?: RoleKey) {
  if (!role) return false;
  if (frontendManagerRoles.has(role)) return true;
  return Boolean(state.rolePermissions?.[role]?.allowedTabs?.includes("templates"));
}

function isPageLayoutKey(value: unknown): value is PageLayoutKey {
  return typeof value === "string"
    && (value === "home"
      || value === "products-index"
      || value === "product-detail"
      || value === "articles-index"
      || value === "article-detail"
      || value === "files-index"
      || value === "contact"
      || value.startsWith("page:"));
}

function isPuckData(value: unknown): value is VisualPageLayoutData {
  if (!value || typeof value !== "object") return false;
  const data = value as VisualPageLayoutData;
  return Array.isArray(data.content);
}

function normalizeFooterTranslation(value: unknown, fallback: Translation): Translation {
  if (!value || typeof value !== "object") return fallback;
  const record = value as Partial<Translation>;
  const en = typeof record.en === "string" && record.en.trim() ? record.en.trim() : fallback.en;
  const zh = typeof record.zh === "string" && record.zh.trim() ? record.zh.trim() : fallback.zh;

  return {
    ...fallback,
    en,
    zh
  };
}

export async function POST(request: Request) {
  const sessionEmail = await getAdminSessionEmail();

  if (!sessionEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await readAdminState();
  const currentUser = state.users.find((user) => user.email.toLowerCase() === sessionEmail.toLowerCase());

  if (!canManageTemplates(state, currentUser?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json() as PageLayoutRequest;

  if (!isPageLayoutKey(body.key) || !isPuckData(body.data)) {
    return NextResponse.json({ error: "页面布局格式不正确。" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const existing = state.pageLayouts.find((layout) => layout.key === body.key);
  const label = body.label?.trim() || existing?.label || body.key;
  const pageLayouts = [
    ...state.pageLayouts.filter((layout) => layout.key !== body.key),
    {
      key: body.key,
      label,
      data: body.data,
      updatedAt: now,
      publishedAt: now
    }
  ].sort((a, b) => a.label.localeCompare(b.label, "zh-Hans-CN"));

  const footerSettings = body.templateSettings;
  const templateSettings = footerSettings
    ? {
      ...state.templateSettings,
      footerTagline: normalizeFooterTranslation(footerSettings.footerTagline, state.templateSettings.footerTagline),
      footerCopyright: normalizeFooterTranslation(footerSettings.footerCopyright, state.templateSettings.footerCopyright),
      footerCredit: normalizeFooterTranslation(footerSettings.footerCredit, state.templateSettings.footerCredit)
    }
    : state.templateSettings;

  const savedState = await writeAdminState({
    ...state,
    templateSettings,
    pageLayouts
  });

  return NextResponse.json({ state: sanitizeAdminState(savedState) });
}
