import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { readAdminState, sanitizeAdminState, writeAdminState } from "@/lib/server/admin-store";
import { collectTemplatePackageFiles, normalizeTemplatePackageLayouts } from "@/lib/puck-layouts";
import type { AdminState, RoleKey, TemplatePackagePayload, ThemeKey } from "@/types/site";

type TemplatePackageRequest = {
  action?: "export" | "import";
  templatePackage?: TemplatePackagePayload;
};

const frontendManagerRoles = new Set<RoleKey>(["super-admin", "admin"]);
const themeKeys = new Set<ThemeKey>(["industrial", "clean-export", "premium-brand", "equipment", "consumer-goods"]);

function canManageTemplates(state: AdminState, role?: RoleKey) {
  if (!role) return false;
  if (frontendManagerRoles.has(role)) return true;
  return Boolean(state.rolePermissions?.[role]?.allowedTabs?.includes("templates"));
}

function isTemplatePackage(value: unknown): value is TemplatePackagePayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as TemplatePackagePayload;
  return payload.format === "exportforge-template-package"
    && payload.version === 1
    && Array.isArray(payload.pageLayouts)
    && Boolean(payload.templateSettings);
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

  const body = await request.json() as TemplatePackageRequest;

  if (body.action === "export") {
    const payload: TemplatePackagePayload = {
      format: "exportforge-template-package",
      version: 1,
      createdAt: new Date().toISOString(),
      pageLayouts: state.pageLayouts,
      templateSettings: state.templateSettings,
      activeTheme: state.activeTheme,
      navigation: state.navigation,
      uploadedFiles: collectTemplatePackageFiles(state)
    };

    return NextResponse.json(payload);
  }

  if (body.action === "import") {
    if (!isTemplatePackage(body.templatePackage)) {
      return NextResponse.json({ error: "模板包格式不正确。" }, { status: 400 });
    }

    const templatePackage = body.templatePackage;
    const mergedFiles = [...state.uploadedFiles];
    const knownFileIds = new Set(mergedFiles.map((file) => file.id));

    for (const file of templatePackage.uploadedFiles ?? []) {
      if (!file?.id || knownFileIds.has(file.id)) continue;
      mergedFiles.push(file);
      knownFileIds.add(file.id);
    }

    const nextState: AdminState = {
      ...state,
      activeTheme: themeKeys.has(templatePackage.activeTheme) ? templatePackage.activeTheme : state.activeTheme,
      navigation: Array.isArray(templatePackage.navigation) ? templatePackage.navigation : state.navigation,
      templateSettings: templatePackage.templateSettings,
      uploadedFiles: mergedFiles
    };

    const savedState = await writeAdminState({
      ...nextState,
      pageLayouts: normalizeTemplatePackageLayouts(templatePackage.pageLayouts, nextState)
    });

    return NextResponse.json({ state: sanitizeAdminState(savedState) });
  }

  return NextResponse.json({ error: "Unsupported template package action." }, { status: 400 });
}
