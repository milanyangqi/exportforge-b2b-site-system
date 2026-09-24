import type { LocaleCode } from "@/types/site";

export const locales = [
  { code: "en", label: "English", nativeName: "English", dir: "ltr" as "ltr" | "rtl", region: "Global", flag: "🇺🇸" },
  { code: "zh", label: "Chinese", nativeName: "中文", dir: "ltr" as "ltr" | "rtl", region: "China", flag: "🇨🇳" }
] as const;

export const supportedLocales = locales.map((locale) => locale.code) as LocaleCode[];
export const defaultLocale: LocaleCode = "en";

export function isLocale(value: string): value is LocaleCode {
  return supportedLocales.includes(value as LocaleCode);
}

export function getLocaleMeta(locale: LocaleCode) {
  return locales.find((item) => item.code === locale) ?? locales[0];
}
