"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { PublicHeaderShell } from "@/components/PublicSiteShell";
import { t, ui } from "@/lib/i18n";
import type { LocaleCode, SiteNavigationItem } from "@/types/site";

export function Header({
  brandName,
  locale,
  navigation,
  enabledLocales
}: {
  brandName: string;
  locale: LocaleCode;
  navigation: SiteNavigationItem[];
  enabledLocales: LocaleCode[];
}) {
  const pathname = usePathname();
  const [currentBrandName, setCurrentBrandName] = useState(brandName);
  const [currentNavigation, setCurrentNavigation] = useState(navigation);
  const [currentEnabledLocales, setCurrentEnabledLocales] = useState(enabledLocales);
  const isAdminPath = pathname?.startsWith(`/${locale}/admin`);
  const isLocaleHomePath = pathname === `/${locale}` || pathname === `/${locale}/`;
  const ctaLabel = useMemo(() => isAdminPath ? "前台首页" : t(ui.quote, locale), [isAdminPath, locale]);
  const ctaHref = isAdminPath ? `/${locale}` : "#rfq";

  useEffect(() => {
    setCurrentBrandName(brandName);
    setCurrentNavigation(navigation);
    setCurrentEnabledLocales(enabledLocales);
  }, [brandName, enabledLocales, navigation]);

  useEffect(() => {
    let cancelled = false;

    async function refreshPublicShell() {
      try {
        const response = await fetch("/api/site-state", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json() as {
          enabledLocales?: LocaleCode[];
          navigation?: SiteNavigationItem[];
          siteTitle?: string;
        };
        if (cancelled) return;
        if (payload.siteTitle) setCurrentBrandName(payload.siteTitle);
        if (Array.isArray(payload.navigation)) setCurrentNavigation(payload.navigation);
        if (Array.isArray(payload.enabledLocales)) setCurrentEnabledLocales(payload.enabledLocales);
      } catch {
        // Keep the server-rendered header if the public state refresh is unavailable.
      }
    }

    void refreshPublicShell();
    window.addEventListener("focus", refreshPublicShell);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", refreshPublicShell);
    };
  }, [pathname]);

  if (isLocaleHomePath) return null;

  return (
    <PublicHeaderShell
      brandName={currentBrandName}
      ctaHref={ctaHref}
      ctaLabel={ctaLabel}
      enabledLocales={currentEnabledLocales}
      locale={locale}
      navigation={currentNavigation}
    />
  );
}
