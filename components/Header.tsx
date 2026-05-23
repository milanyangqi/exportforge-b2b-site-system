import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { t, ui } from "@/lib/i18n";
import type { LocaleCode, SiteNavigationItem } from "@/types/site";

function resolveNavigationHref(href: string, locale: LocaleCode) {
  if (!href || href === "/") return `/${locale}`;
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return href;
  return href.startsWith("/") ? `/${locale}${href}` : href;
}

export function Header({ locale, navigation, enabledLocales }: { locale: LocaleCode; navigation: SiteNavigationItem[]; enabledLocales: LocaleCode[] }) {
  const visibleNavigation = [...navigation].filter((item) => item.enabled).sort((a, b) => a.order - b.order);

  return (
    <header className="site-header">
      <Link className="brand" href={`/${locale}`}>
        <span className="brand-mark">
          <ShieldCheck size={22} />
        </span>
        <span>ExportForge</span>
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        {visibleNavigation.map((item) => {
          const href = resolveNavigationHref(item.href, locale);
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
      <div className="header-actions">
        <LanguageSwitcher locale={locale} enabledLocales={enabledLocales} />
        <a className="quote-link" href="#rfq">
          {t(ui.quote, locale)}
        </a>
      </div>
    </header>
  );
}
