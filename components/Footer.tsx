"use client";

import { usePathname } from "next/navigation";
import { PublicFooterShell } from "@/components/PublicSiteShell";
import type { ContactChannel, LocaleCode, SiteNavigationItem } from "@/types/site";

export function Footer({
  brandName,
  channels,
  locale,
  navigation
}: {
  brandName: string;
  channels: ContactChannel[];
  locale: LocaleCode;
  navigation: SiteNavigationItem[];
}) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith(`/${locale}/admin`);

  if (isAdminPath) return null;

  return (
    <PublicFooterShell
      brandName={brandName}
      channels={channels}
      locale={locale}
      navigation={navigation}
    />
  );
}
