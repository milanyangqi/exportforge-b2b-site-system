import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { readAdminState } from "@/lib/server/admin-store";
import { verifyMailConnection } from "@/lib/server/mail";
import type { RoleKey } from "@/types/site";

function canUseMail(role: RoleKey | undefined, allowedTabs?: string[]) {
  return role === "super-admin" || role === "admin" || Boolean(allowedTabs?.includes("mail"));
}

export async function POST() {
  const sessionEmail = await getAdminSessionEmail();
  if (!sessionEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const state = await readAdminState();
  const currentUser = state.users.find((user) => user.email.toLowerCase() === sessionEmail.toLowerCase());
  const allowedTabs = currentUser?.allowedTabs ?? state.rolePermissions?.[currentUser?.role ?? "viewer"]?.allowedTabs;
  if (!canUseMail(currentUser?.role, allowedTabs)) {
    return NextResponse.json({ error: "只有有邮件权限的用户可以测试邮件连通。" }, { status: 403 });
  }

  const result = await verifyMailConnection(state.siteSettings);

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
