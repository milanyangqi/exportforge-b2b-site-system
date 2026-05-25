import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { readAdminState } from "@/lib/server/admin-store";
import type { AiSettings } from "@/types/site";

type CollectPayload = {
  sourceUrl?: string;
  sourceText?: string;
  target?: "article" | "page";
  category?: string;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/g, "");
}

function defaultBaseUrl(provider: string) {
  const defaultBaseUrls: Record<string, string> = {
    openai: "https://api.openai.com/v1",
    deepseek: "https://api.deepseek.com",
    "qwen-cn": "https://dashscope.aliyuncs.com/compatible-mode/v1",
    "qwen-intl": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    kimi: "https://api.moonshot.ai/v1",
    zhipu: "https://open.bigmodel.cn/api/paas/v4",
    siliconflow: "https://api.siliconflow.cn/v1"
  };

  return defaultBaseUrls[provider] ?? "";
}

function endpointUrl(settings: AiSettings) {
  const normalizedBase = trimTrailingSlash(settings.baseUrl || defaultBaseUrl(settings.provider));

  if (!normalizedBase) return "";
  if (/\/chat\/completions$/i.test(normalizedBase)) return normalizedBase;
  return `${normalizedBase}/chat/completions`;
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `collected-${Date.now()}`;
}

async function fetchSource(url: string) {
  if (!url) return "";
  const parsedUrl = new URL(url);
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("只支持 http 或 https 网页链接。");
  }

  const response = await fetch(parsedUrl.toString(), {
    headers: {
      "User-Agent": "KeyproToolsContentCollector/1.0"
    },
    signal: AbortSignal.timeout(12000)
  });

  if (!response.ok) {
    throw new Error(`网页抓取失败：HTTP ${response.status}`);
  }

  return stripHtml(await response.text()).slice(0, 12000);
}

function buildPrompt(payload: CollectPayload, source: string) {
  const target = payload.target === "page" ? "page" : "article";

  return [
    "You are rewriting collected source material for the KeyproTools B2B cutting tools website.",
    "Return strict JSON only with this shape:",
    "{\"slug\":\"...\",\"title\":{\"en\":\"...\",\"zh\":\"...\"},\"excerpt\":{\"en\":\"...\",\"zh\":\"...\"},\"body\":{\"en\":\"markdown...\",\"zh\":\"markdown...\"}}",
    `Create a ${target} draft. Do not copy the source directly. Rewrite it into original, buyer-focused B2B content for carbide end mills, drill bits, OEM tooling, export packing, or machining buyers.`,
    "Use Markdown headings, short paragraphs, practical RFQ details, and no fabricated company claims.",
    `Source material:\n${source.slice(0, 12000)}`
  ].join("\n\n");
}

async function requestCollectedDraft(settings: AiSettings, payload: CollectPayload, source: string) {
  const apiKey = settings.apiKey?.trim() ?? "";
  const url = endpointUrl(settings);

  if (!url) throw new Error("请先在 设置 > AI 中填写 Base URL。");
  if (!apiKey) throw new Error("请先在 设置 > AI 中保存 API Key。");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      temperature: 0.35,
      max_tokens: 5000,
      messages: [
        { role: "system", content: "Return JSON only. You are an original B2B content editor." },
        { role: "user", content: buildPrompt(payload, source) }
      ]
    })
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`AI 二次创作失败：HTTP ${response.status} ${text.slice(0, 220)}`);
  }

  const parsed = JSON.parse(text) as { choices?: { message?: { content?: string } }[] };
  const content = parsed.choices?.[0]?.message?.content?.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  if (!content) throw new Error("AI 未返回采集内容。");

  return JSON.parse(content) as {
    slug?: string;
    title?: { en?: string; zh?: string };
    excerpt?: { en?: string; zh?: string };
    body?: { en?: string; zh?: string };
  };
}

export async function POST(request: Request) {
  const sessionEmail = await getAdminSessionEmail();
  if (!sessionEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [payload, state] = await Promise.all([
    request.json().catch(() => ({} as CollectPayload)) as Promise<CollectPayload>,
    readAdminState()
  ]);
  const user = state.users.find((item) => item.email.toLowerCase() === sessionEmail.toLowerCase());
  if (!user?.active) return NextResponse.json({ error: "当前账号不可用。" }, { status: 403 });

  const pastedText = payload.sourceText?.trim() ?? "";
  const fetchedText = await fetchSource(payload.sourceUrl?.trim() ?? "");
  const source = [fetchedText, pastedText].filter(Boolean).join("\n\n").trim();
  if (!source) return NextResponse.json({ error: "请填写网页链接，或粘贴要采集的内容。" }, { status: 400 });

  try {
    const aiDraft = await requestCollectedDraft(state.aiSettings, payload, source);
    const titleEn = aiDraft.title?.en?.trim() || "Collected content draft";
    const titleZh = aiDraft.title?.zh?.trim() || titleEn;

    return NextResponse.json({
      draft: {
        target: payload.target === "page" ? "page" : "article",
        slug: slugify(aiDraft.slug || titleEn),
        title: { en: titleEn, zh: titleZh },
        excerpt: {
          en: aiDraft.excerpt?.en?.trim() || titleEn,
          zh: aiDraft.excerpt?.zh?.trim() || titleZh
        },
        body: {
          en: aiDraft.body?.en?.trim() || "",
          zh: aiDraft.body?.zh?.trim() || aiDraft.body?.en?.trim() || ""
        },
        category: payload.category || state.siteSettings.defaultArticleCategory,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "采集失败";
    return NextResponse.json({ error: message }, { status: message.includes("API Key") || message.includes("Base URL") ? 400 : 502 });
  }
}
