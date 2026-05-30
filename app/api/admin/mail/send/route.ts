import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { readAdminState, sanitizeAdminState, writeAdminState } from "@/lib/server/admin-store";
import { buildLeadMailDraft, sendMailWithSettings } from "@/lib/server/mail";
import type { RoleKey } from "@/types/site";

type MailSendPayload = {
  leadId?: string;
  to?: string;
  subject?: string;
  body?: string;
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
    return NextResponse.json({ error: "只有有邮件权限的用户可以发送邮件。" }, { status: 403 });
  }

  const payload = await request.json().catch(() => ({})) as MailSendPayload;
  const lead = payload.leadId ? state.leads.find((item) => item.id === payload.leadId) : undefined;
  const baseDraft = lead ? buildLeadMailDraft(state, lead) : null;
  const draft = {
    to: payload.to?.trim() || baseDraft?.to || "",
    subject: payload.subject?.trim() || baseDraft?.subject || "KeyproTools message",
    body: payload.body?.trim() || baseDraft?.body || ""
  };
  const result = await sendMailWithSettings(state.siteSettings, draft, lead);

  if (!result.ok) return NextResponse.json(result, { status: 400 });

  const nextState = lead
    ? {
      ...state,
      leads: state.leads.map((item) => item.id === lead.id ? { ...item, status: item.status === "new" ? "contacted" : item.status } : item)
    }
    : state;
  const savedState = lead ? await writeAdminState(nextState) : state;

  return NextResponse.json({
    ...result,
    state: sanitizeAdminState(savedState)
  });
}
