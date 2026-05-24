import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { preserveUserPasswordHashes, readAdminState, sanitizeAdminState, writeAdminState } from "@/lib/server/admin-store";
import type { AdminState, RoleKey } from "@/types/site";

const frontendManagerRoles = new Set<RoleKey>(["super-admin", "admin"]);

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
    || JSON.stringify(state.siteSettings ?? {}) !== JSON.stringify(existingState.siteSettings ?? {});

  if (frontendSettingsChanged && !frontendManagerRoles.has(currentUser?.role ?? "viewer")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const nextState = preserveUserPasswordHashes(state, existingState);
  return NextResponse.json(sanitizeAdminState(await writeAdminState(nextState)));
}
