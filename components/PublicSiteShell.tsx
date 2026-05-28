"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ContactChannelIcon } from "@/components/ContactChannelIcon";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { t, ui } from "@/lib/i18n";
import type { ContactChannel, ContactChannelType, LocaleCode, SiteNavigationItem } from "@/types/site";

type NavigationNode = SiteNavigationItem & {
  children: NavigationNode[];
};

type LinkClickHandler = (event: MouseEvent<HTMLAnchorElement>) => void;

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

export function resolvePublicHref(href: string, locale: LocaleCode) {
  if (!href || href === "/") return `/${locale}`;
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return href;
  if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
  return href.startsWith("/") ? `/${locale}${href}` : `/${locale}/${href}`;
}

export function buildNavigationTree(navigation: SiteNavigationItem[]): NavigationNode[] {
  const visibleItems = [...navigation]
    .filter((item) => item.enabled)
    .sort((a, b) => a.order - b.order);
  const nodesById = new Map(visibleItems.map((item) => [item.id, { ...item, children: [] as NavigationNode[] }]));
  const roots: NavigationNode[] = [];

  visibleItems.forEach((item) => {
    const node = nodesById.get(item.id);
    if (!node) return;

    if (item.parentId && nodesById.has(item.parentId)) {
      nodesById.get(item.parentId)?.children.push(node);
      return;
    }

    roots.push(node);
  });

  return roots;
}

function NavigationTreeLink({
  locale,
  node,
  onLinkClick
}: {
  locale: LocaleCode;
  node: NavigationNode;
  onLinkClick?: LinkClickHandler;
}) {
  const href = resolvePublicHref(node.href, locale);
  const external = href.startsWith("http");
  const hasChildren = node.children.length > 0;

  return (
    <div className={hasChildren ? "nav-item has-children" : "nav-item"}>
      <Link
        className="nav-link"
        href={href}
        target={node.openInNewTab || external ? "_blank" : undefined}
        rel={node.openInNewTab || external ? "noreferrer" : undefined}
        onClick={onLinkClick}
      >
        <span>{t(node.label, locale)}</span>
        {hasChildren ? <span className="nav-link-caret" aria-hidden="true" /> : null}
      </Link>
      {hasChildren ? (
        <div className="nav-dropdown">
          {node.children.map((child) => (
            <NavigationTreeLink locale={locale} node={child} onLinkClick={onLinkClick} key={child.id} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BrandLink({
  brandName,
  className,
  markClassName,
  locale,
  onLinkClick
}: {
  brandName: string;
  className: string;
  markClassName: string;
  locale: LocaleCode;
  onLinkClick?: LinkClickHandler;
}) {
  return (
    <Link className={className} href={`/${locale}`} onClick={onLinkClick}>
      <span className={markClassName} aria-hidden="true">
        <ShieldCheck size={22} />
      </span>
      <span>{brandName}</span>
    </Link>
  );
}

export function PublicHeaderShell({
  brandName,
  ctaHref = "#rfq",
  ctaLabel,
  enabledLocales,
  locale,
  navigation,
  preventNavigation = false
}: {
  brandName: string;
  ctaHref?: string;
  ctaLabel?: ReactNode;
  enabledLocales: LocaleCode[];
  locale: LocaleCode;
  navigation: SiteNavigationItem[];
  preventNavigation?: boolean;
}) {
  const navigationTree = buildNavigationTree(navigation);
  const handleLinkClick: LinkClickHandler | undefined = preventNavigation
    ? (event) => event.preventDefault()
    : undefined;

  return (
    <header className="site-header">
      <BrandLink
        brandName={brandName}
        className="brand"
        markClassName="brand-mark"
        locale={locale}
        onLinkClick={handleLinkClick}
      />
      <nav className="nav-links" aria-label="Primary navigation">
        {navigationTree.map((item) => (
          <NavigationTreeLink locale={locale} node={item} onLinkClick={handleLinkClick} key={item.id} />
        ))}
      </nav>
      <div className="header-actions">
        <LanguageSwitcher locale={locale} enabledLocales={enabledLocales} preventNavigation={preventNavigation} />
        <a className="quote-link" href={ctaHref} onClick={handleLinkClick}>
          {ctaLabel ?? t(ui.quote, locale)}
        </a>
      </div>
    </header>
  );
}

export function HomeNavigationShell({
  brandName,
  ctaLabel,
  enabledLocales,
  locale,
  navigation,
  preventNavigation = false
}: {
  brandName: string;
  ctaLabel: ReactNode;
  enabledLocales: LocaleCode[];
  locale: LocaleCode;
  navigation: SiteNavigationItem[];
  preventNavigation?: boolean;
}) {
  const navigationTree = buildNavigationTree(navigation);
  const handleLinkClick: LinkClickHandler | undefined = preventNavigation
    ? (event) => event.preventDefault()
    : undefined;

  return (
    <section className="template-home-navigation" aria-label="Home navigation">
      <div className="template-home-nav-inner">
        <BrandLink
          brandName={brandName}
          className="template-home-brand"
          markClassName="template-home-brand-mark"
          locale={locale}
          onLinkClick={handleLinkClick}
        />
        <nav className="template-home-nav-links nav-links" aria-label="Primary navigation">
          {navigationTree.map((item) => (
            <NavigationTreeLink locale={locale} node={item} onLinkClick={handleLinkClick} key={item.id} />
          ))}
        </nav>
        <div className="template-home-header-actions">
          <LanguageSwitcher locale={locale} enabledLocales={enabledLocales} preventNavigation={preventNavigation} />
          <a className="template-home-nav-cta" href="#rfq" onClick={handleLinkClick}>
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

export function PublicFooterShell({
  brandName,
  channels,
  locale,
  navigation,
  preventNavigation = false
}: {
  brandName: string;
  channels: ContactChannel[];
  locale: LocaleCode;
  navigation: SiteNavigationItem[];
  preventNavigation?: boolean;
}) {
  const footerNavigation = [...navigation].filter((item) => item.enabled).sort((a, b) => a.order - b.order);
  const socialChannels = channels.filter((channel) => channel.enabled && socialTypes.has(channel.type) && channel.href && !channel.href.startsWith("#"));
  const handleLinkClick: LinkClickHandler | undefined = preventNavigation
    ? (event) => event.preventDefault()
    : undefined;

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand-block">
          <strong>{brandName}</strong>
          <span>Carbide end mills, drill bits, OEM tooling, and export-ready packing for global buyers.</span>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          {footerNavigation.map((item) => {
            const href = resolvePublicHref(item.href, locale);
            const external = href.startsWith("http");

            return (
              <Link
                href={href}
                key={item.id}
                target={item.openInNewTab || external ? "_blank" : undefined}
                rel={item.openInNewTab || external ? "noreferrer" : undefined}
                onClick={handleLinkClick}
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
                  onClick={handleLinkClick}
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
