import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { readAdminState, sanitizeAdminState, writeAdminState } from "@/lib/server/admin-store";
import type { AdminState, AiSettings, LocaleCode, Translation } from "@/types/site";

type GenerateAction = "titleSuggestions" | "draft";
type GenerateTarget = "article" | "page";

type GeneratePayload = {
  action?: GenerateAction;
  target?: GenerateTarget;
  purpose?: string;
  topic?: string;
  selectedTitle?: string;
  category?: string;
  audience?: string;
  languages?: LocaleCode[];
  sections?: string[];
  writeMode?: string;
};

type AiUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

const managerRoles = new Set(["super-admin", "admin", "editor"]);

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
    "baidu-qianfan": "https://api.baiduqianfan.ai/v1",
    "tencent-hunyuan": "https://api.hunyuan.cloud.tencent.com/v1",
    "volcengine-ark": "https://ark.cn-beijing.volces.com/api/v3",
    minimax: "https://api.minimax.io/v1",
    "iflytek-spark": "https://spark-api-open.xf-yun.com/x2",
    siliconflow: "https://api.siliconflow.cn/v1",
    anthropic: "https://api.anthropic.com/v1"
  };

  return defaultBaseUrls[provider] ?? "";
}

function endpointUrl(provider: string, baseUrl: string) {
  const normalizedBase = trimTrailingSlash(baseUrl || defaultBaseUrl(provider));

  if (!normalizedBase) return "";
  if (/\/(chat\/completions|messages)$/i.test(normalizedBase)) return normalizedBase;
  if (provider === "anthropic") return `${normalizedBase}/messages`;
  return `${normalizedBase}/chat/completions`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `ai-draft-${Date.now()}`;
}

function parseJsonContent(value: string) {
  const cleaned = value.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

function estimateTokens(payload: GeneratePayload, responseText = "") {
  const text = JSON.stringify(payload) + responseText;
  return Math.max(800, Math.ceil(text.length / 3.5));
}

function usageFromOpenAi(parsed: { usage?: Record<string, number> }, fallback: number): AiUsage {
  const promptTokens = parsed.usage?.prompt_tokens ?? parsed.usage?.input_tokens ?? Math.ceil(fallback * 0.55);
  const completionTokens = parsed.usage?.completion_tokens ?? parsed.usage?.output_tokens ?? Math.ceil(fallback * 0.45);
  const totalTokens = parsed.usage?.total_tokens ?? promptTokens + completionTokens;

  return { promptTokens, completionTokens, totalTokens };
}

function chargeAiCredits(state: AdminState, userEmail: string, action: string, usage: AiUsage) {
  if (!state.aiCreditSettings.enabled) return state;
  const currentUser = state.users.find((user) => user.email.toLowerCase() === userEmail.toLowerCase());
  const currentBalance = currentUser?.aiCredits ?? 0;
  const pointsUsed = Math.max(1, Math.ceil((usage.totalTokens / 1000) * state.aiCreditSettings.pointsPerThousandTokens));
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
        action,
        provider: state.aiSettings.provider,
        model: state.aiSettings.model,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        pointsUsed,
        balanceAfter,
        createdAt
      },
      ...(state.aiUsageRecords ?? [])
    ].slice(0, 500)
  };
}

function buildPrompt(settings: AiSettings, payload: GeneratePayload) {
  const target = payload.target === "page" ? "page" : "article";
  const purpose = payload.purpose || (target === "article" ? "buying guide" : "service page");
  const topic = payload.topic?.trim() || "cutting tools";
  const selectedTitle = payload.selectedTitle?.trim();
  const audience = payload.audience?.trim() || settings.targetMarkets.join(", ") || "global B2B buyers";
  const languages = (payload.languages?.length ? payload.languages : ["zh", "en"]).join(", ");
  const sections = (payload.sections?.length ? payload.sections : ["buyer-intent", "product-fit", "rfq-checklist", "faq", "cta"]).join(", ");
  const keywords = settings.requiredKeywords.join(", ") || topic;

  if (payload.action === "titleSuggestions") {
    return [
      "Return strict JSON only with this shape:",
      "{\"titles\":[{\"en\":\"...\",\"zh\":\"...\"}]}",
      "Generate 5 clear B2B content title candidates.",
      `Content type: ${target}`,
      `Purpose: ${purpose}`,
      `Topic: ${topic}`,
      `Audience: ${audience}`,
      `Required keywords: ${keywords}`,
      `Brand voice: ${settings.brandVoice}`,
      "Titles should be practical, buyer-focused, SEO-friendly, and not exaggerated."
    ].join("\n\n");
  }

  return [
    "Return strict JSON only with this shape:",
    "{\"slug\":\"...\",\"title\":{\"en\":\"...\",\"zh\":\"...\"},\"excerpt\":{\"en\":\"...\",\"zh\":\"...\"},\"body\":{\"en\":\"markdown...\",\"zh\":\"markdown...\"}}",
    `Create a complete ${target} draft for a B2B export website named KeyproTools.`,
    `Purpose: ${purpose}`,
    `Topic: ${topic}`,
    selectedTitle ? `Use this exact user-approved title as the main content direction: ${selectedTitle}` : "Create a suitable title if no user-approved title is provided.",
    `Audience: ${audience}`,
    `Languages required: ${languages}`,
    `Required sections/modules: ${sections}`,
    `Required keywords: ${keywords}`,
    `Brand voice: ${settings.brandVoice}`,
    "Use Markdown headings, short paragraphs, useful RFQ details, and practical buyer language.",
    "Do not invent certifications, factory scale, customer names, or unsupported claims."
  ].filter(Boolean).join("\n\n");
}

async function requestAiJson(settings: AiSettings, payload: GeneratePayload) {
  const provider = settings.provider;
  const model = settings.model;
  const apiKey = settings.apiKey?.trim() ?? "";
  const url = endpointUrl(provider, settings.baseUrl);

  if (!settings.enabled) throw new Error("AI 草稿入口未启用，请先在设置中启用。");
  if (!url) throw new Error("请先在 设置 > AI 中填写 Base URL。");
  if (!apiKey) throw new Error("请先在 设置 > AI 中保存 API Key。");

  const prompt = buildPrompt(settings, payload);
  const isAnthropic = provider === "anthropic";
  const response = await fetch(url, {
    method: "POST",
    headers: isAnthropic
      ? {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        }
      : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
    body: JSON.stringify(isAnthropic
      ? {
          model,
          max_tokens: payload.action === "titleSuggestions" ? 1200 : 5200,
          temperature: 0.35,
          messages: [{ role: "user", content: prompt }]
        }
      : {
          model,
          temperature: 0.35,
          max_tokens: payload.action === "titleSuggestions" ? 1200 : 5200,
          messages: [
            { role: "system", content: "Return JSON only. You are a senior B2B content strategist." },
            { role: "user", content: prompt }
          ]
        })
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`AI 生成失败：HTTP ${response.status} ${text.slice(0, 240)}`);
  }

  const parsed = JSON.parse(text) as {
    content?: { text?: string }[];
    choices?: { message?: { content?: string } }[];
    usage?: Record<string, number>;
  };
  const content = isAnthropic
    ? parsed.content?.map((item) => item.text).filter(Boolean).join("\n")
    : parsed.choices?.[0]?.message?.content;

  if (!content) throw new Error("AI 未返回可解析内容。");

  const fallbackTokens = estimateTokens(payload, content);
  return {
    data: parseJsonContent(content),
    usage: usageFromOpenAi(parsed, fallbackTokens)
  };
}

export async function POST(request: Request) {
  const sessionEmail = await getAdminSessionEmail();
  if (!sessionEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [payload, state] = await Promise.all([
    request.json().catch(() => ({} as GeneratePayload)) as Promise<GeneratePayload>,
    readAdminState()
  ]);
  const currentUser = state.users.find((user) => user.email.toLowerCase() === sessionEmail.toLowerCase());

  if (!currentUser?.active) return NextResponse.json({ error: "当前账号不可用。" }, { status: 403 });
  if (!managerRoles.has(currentUser.role)) return NextResponse.json({ error: "当前账号没有 AI 生成权限。" }, { status: 403 });
  if (state.aiCreditSettings.enabled && (currentUser.aiCredits ?? 0) <= 0) {
    return NextResponse.json({ error: "AI 积分不足，请联系最高管理员充值后再使用。" }, { status: 402 });
  }
  if (!payload.topic?.trim()) return NextResponse.json({ error: "请先填写内容主题。" }, { status: 400 });

  try {
    const normalizedPayload: GeneratePayload = {
      ...payload,
      action: payload.action === "titleSuggestions" ? "titleSuggestions" : "draft",
      target: payload.target === "page" ? "page" : "article"
    };
    const result = await requestAiJson(state.aiSettings, normalizedPayload);
    const chargedState = chargeAiCredits(
      state,
      sessionEmail,
      normalizedPayload.action === "titleSuggestions" ? "AI 生成标题候选" : "AI 生成内容草稿",
      result.usage
    );
    const savedState = await writeAdminState(chargedState);

    if (normalizedPayload.action === "titleSuggestions") {
      const titles = Array.isArray(result.data.titles) ? result.data.titles : [];
      return NextResponse.json({
        titles: titles
          .map((title: Partial<Translation>) => ({
            en: String(title.en ?? title.zh ?? "").trim(),
            zh: String(title.zh ?? title.en ?? "").trim()
          }))
          .filter((title: Translation) => title.en || title.zh)
          .slice(0, 5),
        state: sanitizeAdminState(savedState)
      });
    }

    const titleEn = String(result.data.title?.en ?? result.data.title?.zh ?? normalizedPayload.selectedTitle ?? normalizedPayload.topic).trim();
    const titleZh = String(result.data.title?.zh ?? result.data.title?.en ?? normalizedPayload.selectedTitle ?? normalizedPayload.topic).trim();
    return NextResponse.json({
      draft: {
        target: normalizedPayload.target,
        slug: slugify(result.data.slug || titleEn || titleZh),
        title: { en: titleEn, zh: titleZh },
        excerpt: {
          en: String(result.data.excerpt?.en ?? result.data.excerpt?.zh ?? titleEn).trim(),
          zh: String(result.data.excerpt?.zh ?? result.data.excerpt?.en ?? titleZh).trim()
        },
        body: {
          en: String(result.data.body?.en ?? result.data.body?.zh ?? "").trim(),
          zh: String(result.data.body?.zh ?? result.data.body?.en ?? "").trim()
        },
        category: normalizedPayload.category || state.siteSettings.defaultArticleCategory,
        createdAt: new Date().toISOString()
      },
      state: sanitizeAdminState(savedState)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI 生成失败";
    return NextResponse.json({ error: message }, { status: message.includes("API Key") || message.includes("Base URL") || message.includes("未启用") ? 400 : 502 });
  }
}
