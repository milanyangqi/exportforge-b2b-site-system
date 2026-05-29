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

function getSmtpEncryption(settings: SiteSettings) {
  if (settings.mailSmtpEncryption === "tls" || settings.mailSmtpEncryption === "none") return settings.mailSmtpEncryption;
  return settings.mailSmtpSecure === false ? "none" : "ssl";
}

function getSmtpUser(settings: SiteSettings) {
  if (settings.mailSmtpUseDifferentAccountName) return settings.mailSmtpAccountName?.trim() || settings.mailSmtpUser?.trim() || "";
  return settings.mailSmtpUser?.trim() || settings.mailFromEmail?.trim() || settings.adminEmail?.trim() || "";
}

function createSmtpTransportOptions(settings: SiteSettings) {
  const encryption = getSmtpEncryption(settings);

  return {
    host: settings.mailSmtpHost?.trim(),
    port: Number(settings.mailSmtpPort || 465),
    secure: encryption === "ssl",
    requireTLS: encryption === "tls",
    auth: {
      user: getSmtpUser(settings),
      pass: decryptMailSecret(settings.mailSmtpPassword)
    }
  };
}

function appendLeadContext(body: string, lead?: AdminLead) {
  if (!lead) return body;

  return [
    body,
    "---",
    `Name: ${lead.fullName || "No name"}`,
    `Company: ${lead.company || "No company"}`,
    `Product: ${lead.productType || "No product"}`,
    `Quantity: ${lead.quantity || "No quantity"}`,
    `Email: ${lead.email || "No email"}`,
    `WhatsApp / Phone: ${lead.whatsapp || "No WhatsApp / Phone"}`,
    `Destination: ${lead.destination || "No destination"}`,
    `Material: ${lead.workpieceMaterial || "No material"}`,
    lead.message ? `Message: ${lead.message}` : ""
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
  const user = getSmtpUser(settings);
  const password = decryptMailSecret(settings.mailSmtpPassword);
  const from = buildFrom(settings);

  if (!host || !port || !user || !password) {
    return { ok: false, provider: "smtp", message: "请先填写 SMTP 服务器、端口、账号和授权码/密码。" };
  }
  if (!from) return { ok: false, provider: "smtp", message: "请先填写有效的发件人邮箱。" };

  const nodemailer = await import(/* webpackIgnore: true */ "nodemailer");
  const transporter = nodemailer.createTransport(createSmtpTransportOptions(settings));
  const info = await transporter.sendMail({
    from,
    to: draft.to,
    replyTo: normalizeEmail(settings.mailReplyToEmail) || undefined,
    subject: draft.subject,
    text: appendLeadContext(draft.body, lead)
  });

  return { ok: true, provider: "smtp", message: "邮件已通过 SMTP 发送。", id: info.messageId };
}

async function verifyTcpConnection(host: string, port: number, encrypted: boolean) {
  const net = await import("node:net");
  const tls = await import("node:tls");

  await new Promise<void>((resolve, reject) => {
    const socket = encrypted
      ? tls.connect({ host, port, servername: host, rejectUnauthorized: false })
      : net.createConnection({ host, port });

    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("连接超时"));
    }, 8000);

    socket.once(encrypted ? "secureConnect" : "connect", () => {
      clearTimeout(timer);
      socket.end();
      resolve();
    });
    socket.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

export async function verifyMailConnection(settings: SiteSettings): Promise<MailSendResult> {
  const provider = settings.mailProvider || "mailto";

  if (provider === "mailto") {
    return {
      ok: false,
      provider,
      message: "本机邮件客户端不需要网站后端连通测试，请直接打开邮件客户端草稿。"
    };
  }

  if (provider === "http") {
    const apiKey = decryptMailSecret(settings.mailApiKey);
    const endpoint = settings.mailApiBaseUrl?.trim();

    if (!endpoint || !apiKey) return { ok: false, provider, message: "请先填写第三方邮件 API 地址和 API Key。" };

    try {
      new URL(endpoint);
      return {
        ok: true,
        provider,
        message: "第三方邮件 API 地址和 API Key 已填写；该方式通常需要通过发送测试邮件验证真实发信。"
      };
    } catch {
      return { ok: false, provider, message: "第三方邮件 API 地址格式不正确。" };
    }
  }

  if (isCloudflareRuntime()) {
    return {
      ok: false,
      provider,
      message: "Cloudflare Workers 不支持传统 SMTP 直连，请改用第三方邮件 API 或本机邮件客户端。"
    };
  }

  const host = settings.mailSmtpHost?.trim();
  const port = Number(settings.mailSmtpPort || 465);
  const user = getSmtpUser(settings);
  const password = decryptMailSecret(settings.mailSmtpPassword);

  if (!host || !port || !user || !password) {
    return { ok: false, provider, message: "请先填写 SMTP 服务器、端口、账号和授权码/密码。" };
  }

  try {
    const nodemailer = await import(/* webpackIgnore: true */ "nodemailer");
    const transporter = nodemailer.createTransport(createSmtpTransportOptions(settings));

    await transporter.verify();
    const imapHost = settings.mailImapHost?.trim();
    const imapPort = Number(settings.mailImapPort || 993);
    if (settings.mailImapEnabled !== false && imapHost && imapPort) {
      await verifyTcpConnection(imapHost, imapPort, settings.mailImapEncryption !== "none");
      return { ok: true, provider, message: "SMTP 验证通过，IMAP 服务器端口也可连接。" };
    }

    return { ok: true, provider, message: "SMTP 连通测试通过，可以继续发送测试邮件。" };
  } catch (error) {
    return {
      ok: false,
      provider,
      message: error instanceof Error ? `SMTP 连通测试失败：${error.message}` : "SMTP 连通测试失败，请检查服务器、端口、账号和授权码。"
    };
  }
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
