"use client";

import { Globe2 } from "lucide-react";
import { locales } from "@/config/locales";
import type { LocaleCode } from "@/types/site";

export function LanguageSwitcher({
  locale,
  enabledLocales = locales.map((item) => item.code),
  preventNavigation = false
}: {
  locale: LocaleCode;
  enabledLocales?: LocaleCode[];
  preventNavigation?: boolean;
}) {
  const visibleLocaleCodes = Array.from(new Set([...enabledLocales, locale]));
  const visibleLocales = visibleLocaleCodes
    .map((code) => locales.find((item) => item.code === code))
    .filter((item): item is typeof locales[number] => Boolean(item));

  function changeLocale(nextLocale: string) {
    if (preventNavigation) return;
    const segments = window.location.pathname.split("/");
    segments[1] = nextLocale;
    window.location.href = segments.join("/") || `/${nextLocale}`;
  }

  return (
    <label className="language-select" aria-label="Select language">
      <Globe2 size={17} />
      <select value={locale} onChange={(event) => changeLocale(event.target.value)}>
        {visibleLocales.map((item) => (
          <option key={item.code} value={item.code}>
            {item.flag} {item.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
