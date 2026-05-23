import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { t, ui } from "@/lib/i18n";
import type { LocaleCode } from "@/types/site";

export function Header({ locale }: { locale: LocaleCode }) {
  return (
    <header className="site-header">
      <Link className="brand" href={`/${locale}`}>
        <span className="brand-mark">
          <ShieldCheck size={22} />
        </span>
        <span>ExportForge</span>
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        <Link href={`/${locale}/products`}>{t(ui.navProducts, locale)}</Link>
        <Link href={`/${locale}/articles`}>{t(ui.navArticles, locale)}</Link>
        <Link href={`/${locale}/contact`}>{t(ui.navContact, locale)}</Link>
      </nav>
      <div className="header-actions">
        <LanguageSwitcher locale={locale} />
        <a className="quote-link" href="#rfq">
          {t(ui.quote, locale)}
        </a>
      </div>
    </header>
  );
}
