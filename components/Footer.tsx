"use client";

import { usePathname } from "next/navigation";
import { PublicFooterShell } from "@/components/PublicSiteShell";
import type { ContactChannel, LocaleCode, SiteNavigationItem, SiteTemplateSettings } from "@/types/site";

export function Footer({
  brandName,
  channels,
  locale,
  navigation,
  templateSettings
}: {
  brandName: string;
  channels: ContactChannel[];
  locale: LocaleCode;
  navigation: SiteNavigationItem[];
  templateSettings?: SiteTemplateSettings;
}) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith(`/${locale}/admin`);

  if (isAdminPath) return null;

  return (
    <PublicFooterShell
      brandName={brandName}
      channels={channels}
      copyright={templateSettings?.footerCopyright}
      credit={templateSettings?.footerCredit}
      tagline={templateSettings?.footerTagline}
      locale={locale}
      navigation={navigation}
    />
  );
}
