import { notFound } from "next/navigation";
import { ContactDock } from "@/components/ContactDock";
import { Header } from "@/components/Header";
import { getLocaleMeta, isLocale } from "@/config/locales";
import { themes } from "@/config/themes";
import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;

  if (!isLocale(resolvedParams.locale)) {
    notFound();
  }

  const locale = resolvedParams.locale as LocaleCode;
  const meta = getLocaleMeta(locale);
  const state = await readAdminState();
  const activeTheme = themes[state.activeTheme] ?? themes.industrial;

  return (
    <html lang={locale} dir={meta.dir} data-theme={activeTheme.key} style={{
      "--ink": activeTheme.colors.ink,
      "--muted": activeTheme.colors.muted,
      "--bg": activeTheme.colors.background,
      "--panel": activeTheme.colors.panel,
      "--primary": activeTheme.colors.primary,
      "--accent": activeTheme.colors.accent,
      "--line": activeTheme.colors.line,
      "--radius": activeTheme.radius
    } as React.CSSProperties}>
      <body>
        <Header locale={locale} navigation={state.navigation} enabledLocales={state.enabledLocales} />
        {children}
        <ContactDock locale={locale} channels={state.contactChannels} />
      </body>
    </html>
  );
}
