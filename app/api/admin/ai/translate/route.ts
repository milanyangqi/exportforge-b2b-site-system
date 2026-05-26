import { NextResponse } from "next/server";
import { getLocaleMeta, isLocale, locales } from "@/config/locales";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { preserveUserPasswordHashes, readAdminState, sanitizeAdminState, writeAdminState } from "@/lib/server/admin-store";
import type { AdminState, AiSettings, LocaleCode, Translation } from "@/types/site";

type TranslationScope = "all" | "article" | "page" | "products" | "templates" | "navigation";

type TranslatePayload = {
  state?: AdminState;
  scope?: TranslationScope;
  targetId?: string;
  sourceLocale?: LocaleCode | "auto";
  targetLocales?: LocaleCode[];
  overwrite?: boolean;
};

type TranslationJob = {
  id: string;
  label: string;
  sourceLanguage: string;
  targetLocale: LocaleCode;
  targetLanguage: string;
  sourceText: string;
};

type TranslationResponse = {
  translations?: Record<string, string>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

const managerRoles = new Set(["super-admin", "admin"]);

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

function cloneState(state: AdminState): AdminState {
  return JSON.parse(JSON.stringify(state)) as AdminState;
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function pickSourceText(translation: Translation, preferredLocale: LocaleCode) {
  const preferred = translation[preferredLocale];
  if (nonEmpty(preferred)) return preferred.trim();

  for (const localeCode of ["zh", "en", ...locales.map((item) => item.code)] as LocaleCode[]) {
    const value = translation[localeCode];
    if (nonEmpty(value)) return value.trim();
  }

  return "";
}

function pickSourceTextWithLocale(translation: Translation, preferredLocale: LocaleCode | "auto") {
  if (preferredLocale !== "auto") {
    const preferred = translation[preferredLocale];
    if (nonEmpty(preferred)) return { text: preferred.trim(), locale: preferredLocale };
  }

  for (const localeCode of ["zh", "en", ...locales.map((item) => item.code)] as LocaleCode[]) {
    const value = translation[localeCode];
    if (nonEmpty(value)) return { text: value.trim(), locale: localeCode };
  }

  return { text: "", locale: preferredLocale === "auto" ? "zh" as LocaleCode : preferredLocale };
}

function pickSourceList(translation: Translation<string[]>, preferredLocale: LocaleCode) {
  const preferred = translation[preferredLocale];
  if (Array.isArray(preferred) && preferred.length > 0) return preferred;

  for (const localeCode of ["zh", "en", ...locales.map((item) => item.code)] as LocaleCode[]) {
    const value = translation[localeCode];
    if (Array.isArray(value) && value.length > 0) return value;
  }

  return [];
}

function pickSourceListWithLocale(translation: Translation<string[]>, preferredLocale: LocaleCode | "auto") {
  if (preferredLocale !== "auto") {
    const preferred = translation[preferredLocale];
    if (Array.isArray(preferred) && preferred.length > 0) return { list: preferred, locale: preferredLocale };
  }

  for (const localeCode of ["zh", "en", ...locales.map((item) => item.code)] as LocaleCode[]) {
    const value = translation[localeCode];
    if (Array.isArray(value) && value.length > 0) return { list: value, locale: localeCode };
  }

  return { list: [] as string[], locale: preferredLocale === "auto" ? "zh" as LocaleCode : preferredLocale };
}

function parseTranslatedList(value: string) {
  return value
    .split(/\n+/)
    .map((item) => item.replace(/^\s*(?:[-*]|\d+[.)])\s*/g, "").trim())
    .filter(Boolean);
}

function shouldInclude(scope: TranslationScope, expected: TranslationScope) {
  return scope === "all" || scope === expected;
}

function collectTranslationJobs(
  state: AdminState,
  scope: TranslationScope,
  targetId: string | undefined,
  sourceLocale: LocaleCode | "auto",
  requestedTargetLocales: LocaleCode[] | undefined,
  overwrite: boolean
) {
  const jobs: TranslationJob[] = [];
  const appliers = new Map<string, (value: string) => void>();
  const enabledLocales = state.enabledLocales.length > 0 ? state.enabledLocales : ["en", "zh"] as LocaleCode[];
  const selectedTargetLocales = requestedTargetLocales?.length
    ? requestedTargetLocales.filter((localeCode) => enabledLocales.includes(localeCode))
    : enabledLocales;
  let skippedCount = 0;

  function queueText(translation: Translation | undefined, label: string) {
    if (!translation) return;
    const { text: sourceText, locale: detectedSourceLocale } = pickSourceTextWithLocale(translation, sourceLocale);
    if (!sourceText) return;

    selectedTargetLocales
      .filter((targetLocale) => targetLocale !== detectedSourceLocale)
      .forEach((targetLocale) => {
      if (!overwrite && nonEmpty(translation[targetLocale]) && translation[targetLocale]?.trim() !== sourceText) {
        skippedCount += 1;
        return;
      }

      const id = `job-${jobs.length + 1}`;
      jobs.push({
        id,
        label,
        sourceLanguage: getLocaleMeta(detectedSourceLocale).nativeName,
        targetLocale,
        targetLanguage: getLocaleMeta(targetLocale).nativeName,
        sourceText
      });
      appliers.set(id, (value) => {
        translation[targetLocale] = value.trim();
      });
    });
  }

  function queueList(translation: Translation<string[]> | undefined, label: string) {
    if (!translation) return;
    const { list: sourceList, locale: detectedSourceLocale } = pickSourceListWithLocale(translation, sourceLocale);
    if (sourceList.length === 0) return;
    const sourceText = sourceList.join("\n");

    selectedTargetLocales
      .filter((targetLocale) => targetLocale !== detectedSourceLocale)
      .forEach((targetLocale) => {
      const currentTargetList = translation[targetLocale];
      const targetMatchesSource = Array.isArray(currentTargetList) && currentTargetList.join("\n").trim() === sourceText.trim();
      if (!overwrite && Array.isArray(currentTargetList) && currentTargetList.length > 0 && !targetMatchesSource) {
        skippedCount += 1;
        return;
      }

      const id = `job-${jobs.length + 1}`;
      jobs.push({
        id,
        label,
        sourceLanguage: getLocaleMeta(detectedSourceLocale).nativeName,
        targetLocale,
        targetLanguage: getLocaleMeta(targetLocale).nativeName,
        sourceText
      });
      appliers.set(id, (value) => {
        translation[targetLocale] = parseTranslatedList(value);
      });
    });
  }

  if (shouldInclude(scope, "products")) {
    state.products.forEach((product) => {
      queueText(product.name, `产品分类 ${product.slug} 名称`);
      queueText(product.summary, `产品分类 ${product.slug} 摘要`);
      queueList(product.applications, `产品分类 ${product.slug} 应用列表`);
    });
  }

  if (shouldInclude(scope, "article")) {
    state.articles
      .filter((article) => !targetId || article.id === targetId || article.slug === targetId)
      .forEach((article) => {
        queueText(article.title, `文章 ${article.slug} 标题`);
        queueText(article.excerpt, `文章 ${article.slug} 摘要`);
        queueText(article.body, `文章 ${article.slug} 正文`);
      });
  }

  if (shouldInclude(scope, "page")) {
    state.pages
      .filter((page) => !targetId || page.id === targetId || page.slug === targetId)
      .forEach((page) => {
        queueText(page.title, `页面 ${page.slug} 标题`);
        queueText(page.excerpt, `页面 ${page.slug} 摘要`);
        queueText(page.body, `页面 ${page.slug} 正文`);
      });
  }

  if (shouldInclude(scope, "navigation")) {
    state.navigation.forEach((item) => queueText(item.label, `导航 ${item.href}`));
  }

  if (shouldInclude(scope, "templates")) {
    const template = state.templateSettings;
    queueText(template.heroKicker, "首页模板首屏眉标");
    queueText(template.heroTitle, "首页模板首屏标题");
    queueText(template.heroBody, "首页模板首屏说明");
    queueText(template.primaryCtaLabel, "首页模板主按钮");
    queueText(template.secondaryCtaLabel, "首页模板次按钮");
    template.heroSlides.forEach((slide) => queueText(slide.alt, `首页轮播 ${slide.id} 替代文本`));
    Object.entries(template.textBlocks).forEach(([key, value]) => queueText(value, `首页模板文案 ${key}`));
  }

  if (scope === "all") {
    state.contactChannels.forEach((channel) => queueText(channel.label, `联系方式 ${channel.id}`));
    state.uploadedFiles.forEach((file) => queueText(file.description, `媒体 ${file.name} 描述`));
  }

  return { jobs, appliers, skippedCount };
}

function buildPrompt(jobs: TranslationJob[]) {
  return [
    "Translate the following B2B website content for KeyproTools.",
    "Return strict JSON only in this shape: {\"translations\":{\"job-id\":\"translated text\"}}.",
    "Preserve Markdown syntax, URLs, model numbers, product names, units, and placeholders.",
    "For list items, return one translated item per line.",
    "Do not add explanations, comments, or extra keys.",
    JSON.stringify(jobs.map(({ id, label, sourceLanguage, targetLanguage, sourceText }) => ({ id, label, sourceLanguage, targetLanguage, sourceText })))
  ].join("\n\n");
}

async function requestAiTranslations(settings: AiSettings, jobs: TranslationJob[]) {
  const provider = settings.provider?.trim();
  const model = settings.model?.trim();
  const apiKey = settings.apiKey?.trim() ?? "";
  const url = endpointUrl(provider, settings.baseUrl?.trim() ?? "");

  if (!provider || !model) {
    throw new Error("请先选择 AI 供应商并填写模型。");
  }

  if (!url) {
    throw new Error("OpenAI-compatible 或自定义供应商需要填写 Base URL。");
  }

  if (!apiKey) {
    throw new Error("请先在 AI 内容设置中保存 API Key。");
  }

  const prompt = buildPrompt(jobs);
  const init: RequestInit = provider === "anthropic"
    ? {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model,
        max_tokens: 12000,
        temperature: 0.1,
        messages: [{ role: "user", content: prompt }]
      })
    }
    : {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        max_tokens: 12000,
        temperature: 0.1,
        messages: [
          { role: "system", content: "You are a precise localization translator. Return JSON only." },
          { role: "user", content: prompt }
        ]
      })
    };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal
    });
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`翻译 API 请求失败：HTTP ${response.status} ${text.slice(0, 240)}`);
    }

    const parsed = JSON.parse(text) as {
      choices?: { message?: { content?: string } }[];
      content?: { type?: string; text?: string }[];
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
        input_tokens?: number;
        output_tokens?: number;
      };
    };
    const content = provider === "anthropic"
      ? parsed.content?.find((item) => item.type === "text" || item.text)?.text
      : parsed.choices?.[0]?.message?.content;

    if (!content) throw new Error("翻译 API 没有返回内容。");

    const jsonText = content
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    const translationResponse = JSON.parse(jsonText) as TranslationResponse;
    const promptTokens = parsed.usage?.prompt_tokens ?? parsed.usage?.input_tokens ?? 0;
    const completionTokens = parsed.usage?.completion_tokens ?? parsed.usage?.output_tokens ?? 0;

    return {
      ...translationResponse,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: parsed.usage?.total_tokens ?? promptTokens + completionTokens
      }
    } satisfies TranslationResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("翻译 API 请求超时，请检查网络、模型或供应商配置。");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function estimateTokens(jobs: TranslationJob[]) {
  const characters = jobs.reduce((sum, job) => sum + job.sourceText.length + job.label.length + job.targetLanguage.length, 0);
  return Math.max(1, Math.ceil(characters / 3.5));
}

function chargeAiCredits(state: AdminState, userId: string, userEmail: string, action: string, usage: TranslationResponse["usage"], estimatedTokens: number) {
  if (!state.aiCreditSettings.enabled) return state;

  const promptTokens = Math.max(0, Math.trunc(usage?.promptTokens ?? estimatedTokens));
  const completionTokens = Math.max(0, Math.trunc(usage?.completionTokens ?? estimatedTokens));
  const totalTokens = Math.max(1, Math.trunc(usage?.totalTokens ?? promptTokens + completionTokens));
  const pointsUsed = Math.max(1, Math.ceil((totalTokens / 1000) * state.aiCreditSettings.pointsPerThousandTokens));
  const currentUser = state.users.find((user) => user.id === userId || user.email.toLowerCase() === userEmail.toLowerCase());
  const currentBalance = currentUser?.aiCredits ?? 0;
  const balanceAfter = Math.max(0, currentBalance - pointsUsed);
  const createdAt = new Date().toISOString();

  return {
    ...state,
    users: state.users.map((user) => (
      user.id === userId || user.email.toLowerCase() === userEmail.toLowerCase()
        ? { ...user, aiCredits: balanceAfter }
        : user
    )),
    aiUsageRecords: [
      {
        id: `ai-usage-${Date.now()}`,
        userId,
        userEmail,
        action,
        provider: state.aiSettings.provider,
        model: state.aiSettings.model,
        promptTokens,
        completionTokens,
        totalTokens,
        pointsUsed,
        balanceAfter,
        createdAt
      },
      ...(state.aiUsageRecords ?? [])
    ].slice(0, 500)
  };
}

export async function POST(request: Request) {
  const sessionEmail = await getAdminSessionEmail();
  if (!sessionEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [payload, existingState] = await Promise.all([
    request.json().catch(() => ({} as TranslatePayload)) as Promise<TranslatePayload>,
    readAdminState()
  ]);
  const sessionUser = existingState.users.find((user) => user.email.toLowerCase() === sessionEmail.toLowerCase());

  if (!sessionUser?.active || !managerRoles.has(sessionUser.role)) {
    return NextResponse.json({ error: "只有 Super Admin 或 Admin 可以执行自动翻译。" }, { status: 403 });
  }

  const sourceLocale = payload.sourceLocale === "auto" ? "auto" : payload.sourceLocale && isLocale(payload.sourceLocale) ? payload.sourceLocale : "auto";
  const targetLocales = Array.isArray(payload.targetLocales)
    ? payload.targetLocales.filter(isLocale)
    : undefined;
  const scope = payload.scope ?? "all";
  const nextState = cloneState(payload.state ?? existingState);
  const stateForSave = preserveUserPasswordHashes(nextState, existingState);
  const creditUser = stateForSave.users.find((user) => user.id === sessionUser.id || user.email.toLowerCase() === sessionUser.email.toLowerCase());

  if (stateForSave.aiCreditSettings.enabled && (creditUser?.aiCredits ?? 0) <= 0) {
    return NextResponse.json({ error: "AI 积分不足，请联系最高管理员充值后再使用。" }, { status: 402 });
  }
  const { jobs, appliers, skippedCount } = collectTranslationJobs(
    stateForSave,
    scope,
    payload.targetId,
    sourceLocale,
    targetLocales,
    Boolean(payload.overwrite)
  );

  if (jobs.length === 0) {
    const savedState = await writeAdminState(stateForSave);
    return NextResponse.json({
      ok: true,
      state: sanitizeAdminState(savedState),
      translatedCount: 0,
      skippedCount,
      message: "没有需要补齐的翻译字段。"
    });
  }

  try {
    const aiResult = await requestAiTranslations(stateForSave.aiSettings, jobs);
    let translatedCount = 0;

    Object.entries(aiResult.translations ?? {}).forEach(([id, value]) => {
      const apply = appliers.get(id);
      if (!apply || !nonEmpty(value)) return;
      apply(value);
      translatedCount += 1;
    });

    if (translatedCount === 0) {
      return NextResponse.json({ error: "翻译 API 返回内容为空，未写入任何字段。" }, { status: 502 });
    }

    const chargedState = chargeAiCredits(
      stateForSave,
      sessionUser.id,
      sessionUser.email,
      `自动翻译：${scope}`,
      aiResult.usage,
      estimateTokens(jobs)
    );
    const savedState = await writeAdminState(chargedState);
    return NextResponse.json({
      ok: true,
      state: sanitizeAdminState(savedState),
      translatedCount,
      skippedCount,
      pointsUsed: chargedState.aiUsageRecords?.[0]?.pointsUsed ?? 0,
      message: `已补齐 ${translatedCount} 个翻译字段。`
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "自动翻译失败";
    return NextResponse.json({ error: message }, { status: message.includes("API Key") || message.includes("供应商") ? 400 : 502 });
  }
}
