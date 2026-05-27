import { ActiveTemplate } from "@/components/templates/ActiveTemplate";
import { readAdminState } from "@/lib/server/admin-store";
import { buildOrganizationJsonLd, buildPageMetadata, buildWebsiteJsonLd, homeContentComplete, jsonLd, localePath, localized } from "@/lib/seo";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const alternates = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, localeCode) => {
    if (homeContentComplete(state, localeCode)) paths[localeCode] = localePath(localeCode);
    return paths;
  }, {});

  return buildPageMetadata(state, {
    locale,
    path: localePath(locale),
    title: localized(state.templateSettings.heroTitle, locale),
    description: localized(state.templateSettings.heroBody, locale),
    kind: "home",
    image: state.templateSettings.heroSlides.find((slide) => slide.enabled)?.imageUrl,
    contentComplete: homeContentComplete(state, locale),
    alternates
  });
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(buildOrganizationJsonLd(state, locale)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(buildWebsiteJsonLd(state, locale)) }}
      />
      <ActiveTemplate locale={locale} state={state} />
    </>
  );
}
