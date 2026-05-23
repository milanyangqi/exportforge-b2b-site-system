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
  { code: "ar", label: "Arabic", nativeName: "العربية", dir: "rtl", region: "MENA" }
] as const;

export const supportedLocales = locales.map((locale) => locale.code) as LocaleCode[];
export const defaultLocale: LocaleCode = "en";

export function isLocale(value: string): value is LocaleCode {
  return supportedLocales.includes(value as LocaleCode);
}

export function getLocaleMeta(locale: LocaleCode) {
  return locales.find((item) => item.code === locale) ?? locales[0];
}
