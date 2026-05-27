import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { preserveUserPasswordHashes, readAdminState, sanitizeAdminState, writeAdminState } from "@/lib/server/admin-store";
import type { AdminState, RoleKey } from "@/types/site";

const frontendManagerRoles = new Set<RoleKey>(["super-admin", "admin"]);
const frontendManagerTabs = new Set(["navigation", "templates", "settings", "languages", "themes", "ai"]);

function canSaveFrontendSettings(state: AdminState, role: RoleKey | undefined) {
  if (!role) return false;
  if (frontendManagerRoles.has(role)) return true;
  const permissions = state.rolePermissions?.[role];
  return Boolean(permissions?.allowedTabs?.some((tab) => frontendManagerTabs.has(tab)));
}

function creditControlChanged(nextState: AdminState, existingState: AdminState) {
  const nextBalances = (nextState.users ?? []).map((user) => ({ id: user.id, email: user.email, aiCredits: user.aiCredits ?? 0 }));
  const existingBalances = (existingState.users ?? []).map((user) => ({ id: user.id, email: user.email, aiCredits: user.aiCredits ?? 0 }));

  return JSON.stringify(nextState.aiCreditSettings ?? {}) !== JSON.stringify(existingState.aiCreditSettings ?? {})
    || JSON.stringify(nextBalances) !== JSON.stringify(existingBalances)
    || JSON.stringify(nextState.aiUsageRecords ?? []) !== JSON.stringify(existingState.aiUsageRecords ?? []);
}

export async function GET() {
  if (!await getAdminSessionEmail()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(sanitizeAdminState(await readAdminState()));
}

export async function PUT(request: Request) {
  const sessionEmail = await getAdminSessionEmail();

  if (!sessionEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = (await request.json()) as AdminState;
  const existingState = await readAdminState();
  const currentUser = existingState.users.find((user) => user.email.toLowerCase() === sessionEmail.toLowerCase());
  const frontendSettingsChanged =
    JSON.stringify(state.navigation ?? []) !== JSON.stringify(existingState.navigation ?? [])
    || JSON.stringify(state.enabledLocales ?? []) !== JSON.stringify(existingState.enabledLocales ?? [])
    || JSON.stringify(state.siteSettings ?? {}) !== JSON.stringify(existingState.siteSettings ?? {})
    || JSON.stringify(state.templateSettings ?? {}) !== JSON.stringify(existingState.templateSettings ?? {});

  if (frontendSettingsChanged && !canSaveFrontendSettings(existingState, currentUser?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (creditControlChanged(state, existingState) && currentUser?.role !== "super-admin") {
    return NextResponse.json({ error: "只有最高管理员可以设置 AI 积分。" }, { status: 403 });
  }

  const nextState = preserveUserPasswordHashes(state, existingState);
  return NextResponse.json(sanitizeAdminState(await writeAdminState(nextState)));
}
