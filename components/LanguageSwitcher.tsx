"use client";

import { Globe2 } from "lucide-react";
import { locales } from "@/config/locales";
import type { LocaleCode } from "@/types/site";

export function LanguageSwitcher({ locale, enabledLocales = locales.map((item) => item.code) }: { locale: LocaleCode; enabledLocales?: LocaleCode[] }) {
  const visibleLocales = locales.filter((item) => enabledLocales.includes(item.code) || item.code === locale);

  function changeLocale(nextLocale: string) {
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
            {item.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
