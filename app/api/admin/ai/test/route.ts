import { NextResponse } from "next/server";
import { getAdminSessionEmail } from "@/lib/server/auth";
import { readAdminState } from "@/lib/server/admin-store";
import type { AiSettings } from "@/types/site";

type TestPayload = Partial<AiSettings>;

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

function buildTestRequest(provider: string, model: string, apiKey: string, url: string): { url: string; init: RequestInit } {
  if (provider === "anthropic") {
    return {
      url,
      init: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model,
          max_tokens: 12,
          messages: [{ role: "user", content: "Reply with OK." }]
        })
      }
    };
  }

  return {
    url,
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        max_tokens: 12,
        temperature: 0,
        messages: [{ role: "user", content: "Reply with OK." }]
      })
    }
  };
}

export async function POST(request: Request) {
  if (!await getAdminSessionEmail()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [payload, state] = await Promise.all([
    request.json().catch(() => ({} as TestPayload)) as Promise<TestPayload>,
    readAdminState()
  ]);
  const provider = payload.provider?.trim() || state.aiSettings.provider;
  const model = payload.model?.trim() || state.aiSettings.model;
  const baseUrl = payload.baseUrl?.trim() ?? state.aiSettings.baseUrl;
  const apiKey = payload.apiKey?.trim() || state.aiSettings.apiKey || "";
  const url = endpointUrl(provider, baseUrl);

  if (!provider || !model) {
    return NextResponse.json({ ok: false, error: "请先选择供应商并填写模型。" }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ ok: false, error: "OpenAI-compatible 或自定义供应商需要填写 Base URL。" }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "请填写 API Key，或先保存已配置的密钥。" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const testRequest = buildTestRequest(provider, model, apiKey, url);
    const response = await fetch(testRequest.url, {
      ...testRequest.init,
      signal: controller.signal
    });
    const text = await response.text();
    const detail = text.slice(0, 240);

    if (!response.ok) {
      return NextResponse.json({
        ok: false,
        error: `API 测试失败：HTTP ${response.status}`,
        detail
      }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      message: "API 连接测试通过。",
      provider,
      model
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "API 测试超时，请检查 Base URL、网络或模型供应商。"
      : error instanceof Error ? error.message : "API 测试失败";

    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
