import type { LocaleCode } from "@/types/site";

export const locales = [
  { code: "en", label: "English", nativeName: "English", dir: "ltr", region: "Global" },
  { code: "zh", label: "Chinese", nativeName: "中文", dir: "ltr", region: "China" },
  { code: "th", label: "Thai", nativeName: "ไทย", dir: "ltr", region: "Southeast Asia" },
  { code: "vi", label: "Vietnamese", nativeName: "Tiếng Việt", dir: "ltr", region: "Southeast Asia" },
  { code: "id", label: "Indonesian", nativeName: "Bahasa Indonesia", dir: "ltr", region: "Southeast Asia" },
  { code: "ms", label: "Malay", nativeName: "Bahasa Melayu", dir: "ltr", region: "Southeast Asia" },
  { code: "fil", label: "Filipino", nativeName: "Filipino", dir: "ltr", region: "Southeast Asia" },
  { code: "my", label: "Burmese", nativeName: "မြန်မာ", dir: "ltr", region: "Southeast Asia" },
  { code: "km", label: "Khmer", nativeName: "ខ្មែរ", dir: "ltr", region: "Southeast Asia" },
  { code: "lo", label: "Lao", nativeName: "ລາວ", dir: "ltr", region: "Southeast Asia" },
  { code: "ar", label: "Arabic", nativeName: "العربية", dir: "rtl", region: "MENA" },
  { code: "es", label: "Spanish", nativeName: "Español", dir: "ltr", region: "Europe / LATAM" },
  { code: "fr", label: "French", nativeName: "Français", dir: "ltr", region: "Europe / Africa" },
  { code: "de", label: "German", nativeName: "Deutsch", dir: "ltr", region: "Europe" },
  { code: "it", label: "Italian", nativeName: "Italiano", dir: "ltr", region: "Europe" },
  { code: "pt", label: "Portuguese", nativeName: "Português", dir: "ltr", region: "Europe / LATAM" },
  { code: "hi", label: "Hindi", nativeName: "हिन्दी", dir: "ltr", region: "South Asia" },
  { code: "ru", label: "Russian", nativeName: "Русский", dir: "ltr", region: "Eurasia" },
  { code: "ja", label: "Japanese", nativeName: "日本語", dir: "ltr", region: "East Asia" },
  { code: "ko", label: "Korean", nativeName: "한국어", dir: "ltr", region: "East Asia" },
  { code: "ur", label: "Urdu", nativeName: "اردو", dir: "rtl", region: "South Asia" }
] as const;

export const supportedLocales = locales.map((locale) => locale.code) as LocaleCode[];
export const defaultLocale: LocaleCode = "en";

export function isLocale(value: string): value is LocaleCode {
  return supportedLocales.includes(value as LocaleCode);
}

export function getLocaleMeta(locale: LocaleCode) {
  return locales.find((item) => item.code === locale) ?? locales[0];
}
