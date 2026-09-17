import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { preserveUserPasswordHashes, readAdminState, sanitizeAdminState, writeAdminState } from "@/lib/server/admin-store";
import type { AdminState, RoleKey } from "@/types/site";

const frontendManagerRoles = new Set<RoleKey>(["super-admin", "admin"]);
const frontendManagerTabs = new Set(["navigation", "templates", "settings", "languages", "themes", "ai", "mail"]);

function canSaveFrontendSettings(state: AdminState, user: AdminState["users"][number] | undefined) {
  if (!user) return false;
  if (frontendManagerRoles.has(user.role)) return true;
  if (user.allowedTabs?.some((tab) => frontendManagerTabs.has(tab))) return true;
  const permissions = state.rolePermissions?.[user.role];
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
  if (!currentUser?.active) return NextResponse.json({error:"Forbidden"},{status:403});
  const tabs = new Set(currentUser.allowedTabs ?? existingState.rolePermissions?.[currentUser.role]?.allowedTabs ?? []);
  const changes = (key: keyof AdminState) => JSON.stringify(state[key]) !== JSON.stringify(existingState[key]);
  if (currentUser.role !== "super-admin") {
    const userShape = (users: AdminState["users"]) => users.map(({passwordHash: _hash,...user}) => user);
    if (JSON.stringify(userShape(state.users)) !== JSON.stringify(userShape(existingState.users)) || changes("rolePermissions")) return NextResponse.json({error:"Forbidden"},{status:403});
    const moduleTabs = {products:"products",pages:"pages",articles:"articles",leads:"leads",contactChannels:"contacts",uploadedFiles:"files"} as const;
    for (const [key,tab] of Object.entries(moduleTabs)) if(changes(key as keyof AdminState) && !tabs.has(tab)) return NextResponse.json({error:"Forbidden"},{status:403});
  }
  const frontendSettingsChanged =
    JSON.stringify(state.navigation ?? []) !== JSON.stringify(existingState.navigation ?? [])
    || JSON.stringify(state.enabledLocales ?? []) !== JSON.stringify(existingState.enabledLocales ?? [])
    || JSON.stringify(state.siteSettings ?? {}) !== JSON.stringify(existingState.siteSettings ?? {})
    || JSON.stringify(state.templateSettings ?? {}) !== JSON.stringify(existingState.templateSettings ?? {})
    || JSON.stringify(state.pageLayouts ?? []) !== JSON.stringify(existingState.pageLayouts ?? []);

  if (frontendSettingsChanged && !canSaveFrontendSettings(existingState, currentUser)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (creditControlChanged(state, existingState) && currentUser?.role !== "super-admin") {
    return NextResponse.json({ error: "只有最高管理员可以设置 AI 积分。" }, { status: 403 });
  }

  const nextState = preserveUserPasswordHashes(state, existingState);
  return NextResponse.json(sanitizeAdminState(await writeAdminState(nextState)));
}
