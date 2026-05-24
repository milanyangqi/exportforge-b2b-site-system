"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { t, ui } from "@/lib/i18n";
import type { LocaleCode, SiteNavigationItem } from "@/types/site";

type NavigationNode = SiteNavigationItem & {
  children: NavigationNode[];
};

function resolveNavigationHref(href: string, locale: LocaleCode) {
  if (!href || href === "/") return `/${locale}`;
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return href;
  return href.startsWith("/") ? `/${locale}${href}` : href;
}

function buildNavigationTree(navigation: SiteNavigationItem[]): NavigationNode[] {
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

function NavigationTreeLink({ node, locale }: { node: NavigationNode; locale: LocaleCode }) {
  const href = resolveNavigationHref(node.href, locale);
  const external = href.startsWith("http");
  const hasChildren = node.children.length > 0;

  return (
    <div className={hasChildren ? "nav-item has-children" : "nav-item"}>
      <Link
        className="nav-link"
        href={href}
        target={node.openInNewTab || external ? "_blank" : undefined}
        rel={node.openInNewTab || external ? "noreferrer" : undefined}
      >
        <span>{t(node.label, locale)}</span>
        {hasChildren ? <span className="nav-link-caret" aria-hidden="true" /> : null}
      </Link>
      {hasChildren ? (
        <div className="nav-dropdown">
          {node.children.map((child) => (
            <NavigationTreeLink node={child} locale={locale} key={child.id} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

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
  const navigationTree = useMemo(() => buildNavigationTree(currentNavigation), [currentNavigation]);
  const isAdminPath = pathname?.startsWith(`/${locale}/admin`);

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

  return (
    <header className="site-header">
      <Link className="brand" href={`/${locale}`}>
        <span className="brand-mark">
          <ShieldCheck size={22} />
        </span>
        <span>{currentBrandName}</span>
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        {navigationTree.map((item) => (
          <NavigationTreeLink node={item} locale={locale} key={item.id} />
        ))}
      </nav>
      <div className="header-actions">
        <LanguageSwitcher locale={locale} enabledLocales={currentEnabledLocales} />
        {isAdminPath ? (
          <Link className="quote-link" href={`/${locale}`}>
            前台首页
          </Link>
        ) : (
          <a className="quote-link" href="#rfq">
            {t(ui.quote, locale)}
          </a>
        )}
      </div>
    </header>
  );
}
