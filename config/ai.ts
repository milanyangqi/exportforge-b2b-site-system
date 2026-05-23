import type { LocaleCode } from "@/types/site";

export type AiGenerationKind =
  | "homepage"
  | "product-category"
  | "product-detail"
  | "faq"
  | "seo"
  | "article"
  | "translation"
  | "rfq-reply";

export const aiContentConfig = {
  provider: process.env.AI_PROVIDER ?? "openai-compatible",
  baseUrl: process.env.AI_BASE_URL,
  model: process.env.AI_MODEL,
  publishMode: "draft-review-only",
  supportedKinds: ["homepage", "product-category", "product-detail", "faq", "seo", "article", "translation", "rfq-reply"] as AiGenerationKind[],
  defaultMarkets: ["global", "southeast-asia", "mena"],
  requiredInputs: ["industry", "products", "targetMarket", "keywords", "brandVoice"],
  localeCoverage: ["en", "zh", "th", "vi", "id", "ms", "fil", "my", "km", "lo", "ar"] as LocaleCode[]
};

export function canGenerateAiDraft() {
  return Boolean(process.env.AI_API_KEY);
}
