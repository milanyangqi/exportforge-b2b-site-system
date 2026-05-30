import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { readAdminState } from "@/lib/server/admin-store";
import { sendMailWithSettings } from "@/lib/server/mail";
import type { RoleKey } from "@/types/site";

type MailTestPayload = {
  to?: string;
};

function canUseMail(role: RoleKey | undefined, allowedTabs?: string[]) {
  return role === "super-admin" || role === "admin" || Boolean(allowedTabs?.includes("mail"));
}

export async function POST(request: Request) {
  const sessionEmail = await getAdminSessionEmail();
  if (!sessionEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const state = await readAdminState();
  const currentUser = state.users.find((user) => user.email.toLowerCase() === sessionEmail.toLowerCase());
  const allowedTabs = currentUser?.allowedTabs ?? state.rolePermissions?.[currentUser?.role ?? "viewer"]?.allowedTabs;
  if (!canUseMail(currentUser?.role, allowedTabs)) {
    return NextResponse.json({ error: "只有有邮件权限的用户可以发送测试邮件。" }, { status: 403 });
  }

  const payload = await request.json().catch(() => ({})) as MailTestPayload;
  const to = payload.to?.trim() || state.siteSettings.adminEmail || sessionEmail;
  const result = await sendMailWithSettings(state.siteSettings, {
    to,
    subject: `KeyproTools 邮件发送测试 ${new Date().toLocaleString("zh-CN")}`,
    body: "这是一封来自后台邮件设置的测试邮件。如果你收到它，说明当前发信方式可以正常工作。"
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
