import type { AdminLead, AdminState, SiteSettings } from "@/types/site";
import { decryptMailSecret } from "@/lib/server/mail-secrets";

export type MailDraft = {
  to: string;
  subject: string;
  body: string;
};

export type MailSendResult = {
  ok: boolean;
  provider: SiteSettings["mailProvider"];
  message: string;
  id?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function buildLeadMailDraft(state: Pick<AdminState, "siteSettings">, lead: AdminLead): MailDraft {
  const template = state.siteSettings.mailReplyTemplate
    || "Hello {name},\n\nThank you for your RFQ about {productType}. We will follow up soon.\n\nBest regards,\n{siteTitle}";
  const body = template
    .replaceAll("{name}", lead.fullName || "there")
    .replaceAll("{company}", lead.company || "")
    .replaceAll("{productType}", lead.productType || "your tooling request")
    .replaceAll("{quantity}", lead.quantity || "")
    .replaceAll("{email}", lead.email || "")
    .replaceAll("{siteTitle}", state.siteSettings.title || "KeyproTools");

  return {
    to: lead.email,
    subject: `Re: ${lead.productType || "RFQ"} inquiry`,
    body
  };
}

function normalizeEmail(value?: string) {
  const email = value?.trim() ?? "";
  return emailPattern.test(email) ? email : "";
}

function buildFrom(settings: SiteSettings) {
  const email = normalizeEmail(settings.mailFromEmail || settings.adminEmail);
  const name = settings.mailFromName?.trim() || settings.title || "";

  if (!email) return "";
  return name ? `"${name.replaceAll('"', "'")}" <${email}>` : email;
}

function isCloudflareRuntime() {
  return typeof process !== "undefined" && process.env.NEXT_RUNTIME === "edge";
}

function appendLeadContext(body: string, lead?: AdminLead) {
  if (!lead) return body;

  return [
    body,
    "---",
    `姓名：${lead.fullName || "未填写姓名"}`,
    `公司：${lead.company || "No company"}`,
    `产品：${lead.productType || "No product"}`,
    `数量：${lead.quantity || "No quantity"}`,
    `邮箱：${lead.email || "No email"}`,
    `WhatsApp / Phone：${lead.whatsapp || "No WhatsApp / Phone"}`,
    `目的地：${lead.destination || "No destination"}`,
    `材料：${lead.workpieceMaterial || "No material"}`,
    lead.message ? `留言：${lead.message}` : ""
  ].filter(Boolean).join("\n");
}

async function sendSmtp(settings: SiteSettings, draft: MailDraft, lead?: AdminLead): Promise<MailSendResult> {
  if (isCloudflareRuntime()) {
    return {
      ok: false,
      provider: "smtp",
      message: "Cloudflare Workers 不支持传统 SMTP 直连，请改用第三方邮件 API 或本机邮件客户端。"
    };
  }

  const host = settings.mailSmtpHost?.trim();
  const port = Number(settings.mailSmtpPort || 465);
  const user = settings.mailSmtpUser?.trim();
  const password = decryptMailSecret(settings.mailSmtpPassword);
  const from = buildFrom(settings);

  if (!host || !port || !user || !password) {
    return { ok: false, provider: "smtp", message: "请先填写 SMTP 服务器、端口、账号和授权码/密码。" };
  }
  if (!from) return { ok: false, provider: "smtp", message: "请先填写有效的发件人邮箱。" };

  const nodemailer = await import(/* webpackIgnore: true */ "nodemailer");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: Boolean(settings.mailSmtpSecure),
    auth: { user, pass: password }
  });
  const info = await transporter.sendMail({
    from,
    to: draft.to,
    replyTo: normalizeEmail(settings.mailReplyToEmail) || undefined,
    subject: draft.subject,
    text: appendLeadContext(draft.body, lead)
  });

  return { ok: true, provider: "smtp", message: "邮件已通过 SMTP 发送。", id: info.messageId };
}

async function sendHttp(settings: SiteSettings, draft: MailDraft, lead?: AdminLead): Promise<MailSendResult> {
  const apiKey = decryptMailSecret(settings.mailApiKey);
  const endpoint = settings.mailApiBaseUrl?.trim();
  const from = buildFrom(settings);

  if (!endpoint || !apiKey) return { ok: false, provider: "http", message: "请先填写第三方邮件 API 地址和 API Key。" };
  if (!from) return { ok: false, provider: "http", message: "请先填写有效的发件人邮箱。" };

  const provider = (settings.mailApiProvider || "resend").toLowerCase();
  const payload = provider === "resend"
    ? {
      from,
      to: [draft.to],
      reply_to: normalizeEmail(settings.mailReplyToEmail) || undefined,
      subject: draft.subject,
      text: appendLeadContext(draft.body, lead)
    }
    : {
      from,
      to: draft.to,
      replyTo: normalizeEmail(settings.mailReplyToEmail) || undefined,
      subject: draft.subject,
      text: appendLeadContext(draft.body, lead)
    };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const responseText = await response.text();

  if (!response.ok) {
    return {
      ok: false,
      provider: "http",
      message: `第三方邮件 API 发送失败：${responseText.slice(0, 240) || response.statusText}`
    };
  }

  return { ok: true, provider: "http", message: "邮件已通过第三方邮件 API 发送。", id: responseText.slice(0, 120) };
}

export async function sendMailWithSettings(settings: SiteSettings, draft: MailDraft, lead?: AdminLead): Promise<MailSendResult> {
  const provider = settings.mailProvider || "mailto";
  const to = normalizeEmail(draft.to);

  if (!to) return { ok: false, provider, message: "请先填写有效的收件人邮箱。" };
  if (provider === "mailto") {
    return { ok: false, provider, message: "当前发送方式是本机邮件客户端，不会由网站后端直接发送。" };
  }

  try {
    return provider === "smtp"
      ? await sendSmtp(settings, { ...draft, to }, lead)
      : await sendHttp(settings, { ...draft, to }, lead);
  } catch (error) {
    return {
      ok: false,
      provider,
      message: error instanceof Error ? error.message : "邮件发送失败，请检查邮箱配置。"
    };
  }
}
