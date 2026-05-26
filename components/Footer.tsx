"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactChannelIcon } from "@/components/ContactChannelIcon";
import { t } from "@/lib/i18n";
import type { ContactChannel, ContactChannelType, LocaleCode, SiteNavigationItem } from "@/types/site";

const socialTypes = new Set<ContactChannelType>([
  "whatsapp",
  "wechat",
  "zalo",
  "line",
  "facebook",
  "instagram",
  "tiktok",
  "messenger",
  "linkedin",
  "skype",
  "email",
  "custom"
]);

function resolveFooterHref(href: string, locale: LocaleCode) {
  if (!href || href === "/") return `/${locale}`;
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return href;
  return href.startsWith("/") ? `/${locale}${href}` : href;
}

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
  const footerNavigation = [...navigation].filter((item) => item.enabled).sort((a, b) => a.order - b.order);
  const socialChannels = channels.filter((channel) => channel.enabled && socialTypes.has(channel.type) && channel.href && !channel.href.startsWith("#"));

  if (isAdminPath) return null;

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand-block">
          <strong>{brandName}</strong>
          <span>Carbide end mills, drill bits, OEM tooling, and export-ready packing for global buyers.</span>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          {footerNavigation.map((item) => {
            const href = resolveFooterHref(item.href, locale);
            const external = href.startsWith("http");

            return (
              <Link
                href={href}
                key={item.id}
                target={item.openInNewTab || external ? "_blank" : undefined}
                rel={item.openInNewTab || external ? "noreferrer" : undefined}
              >
                {t(item.label, locale)}
              </Link>
            );
          })}
        </nav>
        {socialChannels.length > 0 ? (
          <div className="footer-socials" aria-label="Social media links">
            {socialChannels.map((channel) => {
              const label = t(channel.label, locale);

              return (
                <a
                  href={channel.href}
                  key={channel.id}
                  aria-label={label}
                  title={label}
                  style={{ "--social-color": channel.color } as CSSProperties}
                >
                  <ContactChannelIcon channel={channel} size={18} />
                </a>
              );
            })}
          </div>
        ) : null}
        <div className="footer-bottom">
          <span>Copyright © {new Date().getFullYear()} {brandName}. All rights reserved.</span>
          <span>Built for precision tooling and B2B export orders.</span>
        </div>
      </div>
    </footer>
  );
}
