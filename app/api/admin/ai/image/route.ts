import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { buildStoredFileUrl, readAdminState, sanitizeAdminState, writeAdminState, writeStoredFile } from "@/lib/server/admin-store";
import type { AiSettings, AdminState, UploadedFile } from "@/types/site";

type ImagePayload = {
  title?: string;
  excerpt?: string;
  body?: string;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/g, "");
}

function defaultBaseUrl(provider: string) {
  if (provider === "openai") return "https://api.openai.com/v1";
  return "";
}

function endpointUrl(settings: AiSettings) {
  const baseUrl = trimTrailingSlash(settings.baseUrl?.trim() || defaultBaseUrl(settings.provider));

  if (!baseUrl) return "";
  if (/\/images\/generations$/i.test(baseUrl)) return baseUrl;
  return `${baseUrl}/images/generations`;
}

function stripMarkdown(value: string) {
  return value
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[[^\]]+]\([^)]+\)/g, "$1")
    .replace(/[#>*_`|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildImagePrompt(payload: ImagePayload) {
  const title = payload.title?.trim() || "B2B cutting tools article";
  const excerpt = payload.excerpt?.trim() || "";
  const body = stripMarkdown(payload.body ?? "").slice(0, 1800);

  return [
    "Create a professional square hero image for a B2B technical article on a cutting-tools website named KeyproTools.",
    "Style: realistic industrial product photography, clean CNC workshop lighting, carbide end mills and drill bits, export-ready, no text, no logos, no watermarks.",
    `Article title: ${title}`,
    excerpt ? `Article excerpt: ${excerpt}` : "",
    body ? `Article body context: ${body}` : "",
    "Avoid people, charts, UI screenshots, written words, distorted tools, unsafe sparks, and dark blurry backgrounds."
  ].filter(Boolean).join("\n");
}

function estimateImageTokens(payload: ImagePayload) {
  const textLength = [payload.title, payload.excerpt, payload.body].filter(Boolean).join(" ").length;
  return Math.max(4000, Math.ceil(textLength / 3.5) + 3500);
}

function chargeImageCredits(state: AdminState, userEmail: string, totalTokens: number) {
  if (!state.aiCreditSettings.enabled) return state;
  const currentUser = state.users.find((user) => user.email.toLowerCase() === userEmail.toLowerCase());
  const currentBalance = currentUser?.aiCredits ?? 0;
  const pointsUsed = Math.max(1, Math.ceil((totalTokens / 1000) * state.aiCreditSettings.pointsPerThousandTokens));
  const balanceAfter = Math.max(0, currentBalance - pointsUsed);
  const createdAt = new Date().toISOString();

  return {
    ...state,
    users: state.users.map((user) => (
      user.email.toLowerCase() === userEmail.toLowerCase()
        ? { ...user, aiCredits: balanceAfter }
        : user
    )),
    aiUsageRecords: [
      {
        id: `ai-usage-${Date.now()}`,
        userId: currentUser?.id ?? "",
        userEmail,
        action: "生成文章配图",
        provider: state.aiSettings.provider,
        model: "gpt-image-1",
        promptTokens: totalTokens,
        completionTokens: 0,
        totalTokens,
        pointsUsed,
        balanceAfter,
        createdAt
      },
      ...(state.aiUsageRecords ?? [])
    ].slice(0, 500)
  };
}

async function fetchGeneratedImage(settings: AiSettings, prompt: string) {
  const apiKey = settings.apiKey?.trim() ?? "";
  const url = endpointUrl(settings);

  if (!url) {
    throw new Error("请在 AI 设置里填写支持图片生成的 OpenAI-compatible Base URL。");
  }
  if (!apiKey) {
    throw new Error("请先在 AI 内容设置中保存 API Key。");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      n: 1
    })
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`图片生成失败：HTTP ${response.status} ${text.slice(0, 240)}`);
  }

  const parsed = JSON.parse(text) as { data?: { b64_json?: string; url?: string }[] };
  const item = parsed.data?.[0];

  if (item?.b64_json) {
    return {
      bytes: Buffer.from(item.b64_json, "base64"),
      mimeType: "image/png"
    };
  }

  if (item?.url) {
    const imageResponse = await fetch(item.url);
    if (!imageResponse.ok) throw new Error("图片生成成功，但下载图片失败。");
    return {
      bytes: Buffer.from(await imageResponse.arrayBuffer()),
      mimeType: imageResponse.headers.get("content-type") || "image/png"
    };
  }

  throw new Error("图片生成 API 未返回图片内容。");
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "ai-article-image";
}

export async function POST(request: Request) {
  const sessionEmail = await getAdminSessionEmail();

  if (!sessionEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [payload, state] = await Promise.all([
    request.json().catch(() => ({} as ImagePayload)) as Promise<ImagePayload>,
    readAdminState()
  ]);
  const currentUser = state.users.find((user) => user.email.toLowerCase() === sessionEmail.toLowerCase());

  if (!currentUser?.active) {
    return NextResponse.json({ error: "当前账号不可用。" }, { status: 403 });
  }
  if (state.aiCreditSettings.enabled && (currentUser.aiCredits ?? 0) <= 0) {
    return NextResponse.json({ error: "AI 积分不足，请联系最高管理员充值后再使用。" }, { status: 402 });
  }
  if (!payload.title && !payload.body) {
    return NextResponse.json({ error: "请先生成文章内容，再根据文章生成配图。" }, { status: 400 });
  }

  try {
    const prompt = buildImagePrompt(payload);
    const generated = await fetchGeneratedImage(state.aiSettings, prompt);
    const id = `ai-image-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const createdAt = new Date().toISOString();
    const name = `${slugify(payload.title ?? "ai-article-image")}.png`;

    await writeStoredFile({
      id,
      name,
      mimeType: generated.mimeType,
      size: generated.bytes.byteLength,
      base64: generated.bytes.toString("base64"),
      createdAt
    });

    const uploadedFile: UploadedFile = {
      id,
      name,
      mimeType: generated.mimeType,
      size: generated.bytes.byteLength,
      url: buildStoredFileUrl(id),
      storageKey: id,
      createdAt,
      description: {
        en: `AI-generated illustration for ${payload.title ?? "article"}`,
        zh: `AI 根据文章内容生成的配图：${payload.title ?? "文章"}`
      },
      enabled: true
    };
    const chargedState = chargeImageCredits({
      ...state,
      uploadedFiles: [uploadedFile, ...state.uploadedFiles]
    }, sessionEmail, estimateImageTokens(payload));
    const savedState = await writeAdminState(chargedState);

    return NextResponse.json({
      file: uploadedFile,
      state: sanitizeAdminState(savedState),
      message: "文章配图已生成并保存到媒体库。"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "图片生成失败";
    return NextResponse.json({ error: message }, { status: message.includes("API Key") || message.includes("Base URL") ? 400 : 502 });
  }
}
