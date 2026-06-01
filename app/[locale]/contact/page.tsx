import { RfqForm } from "@/components/RfqForm";
import { PublicContactList } from "@/components/PublicContactList";
import { PuckPageRenderer } from "@/components/PuckPageRenderer";
import { readAdminState } from "@/lib/server/admin-store";
import { absoluteUrl, buildBreadcrumbJsonLd, buildPageMetadata, jsonLd, localePath } from "@/lib/seo";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

function contactTitle(siteTitle: string) {
  return `Contact ${siteTitle}`;
}

function contactDescription(siteTitle: string) {
  return `Send your request to ${siteTitle} and the team will follow up with details.`;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const alternates = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, localeCode) => {
    if (localeCode === "en" || localeCode === "zh") paths[localeCode] = localePath(localeCode, "/contact");
    return paths;
  }, {});

  return buildPageMetadata(state, {
    locale,
    path: localePath(locale, "/contact"),
    title: contactTitle(state.siteSettings.title),
    description: contactDescription(state.siteSettings.title),
    kind: "contact",
    contentComplete: locale === "en" || locale === "zh",
    alternates
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const pageTitle = contactTitle(state.siteSettings.title);
  const pageDescription = contactDescription(state.siteSettings.title);
  const structuredData = (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: pageTitle,
            description: pageDescription,
            url: absoluteUrl(state, localePath(locale, "/contact"))
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildBreadcrumbJsonLd(state, [
            { name: state.siteSettings.title, path: localePath(locale) },
            { name: "Contact", path: localePath(locale, "/contact") }
          ]))
        }}
      />
    </>
  );
  const fallback = (
    <main className="subpage">
      {structuredData}
      <section className="section split contact-section">
        <div className="contact-copy">
          <span className="eyebrow">Contact</span>
          <h1>{pageTitle}</h1>
          <p>{pageDescription}</p>
          <PublicContactList channels={state.contactChannels} locale={locale} />
        </div>
        <div className="contact-rfq-panel" id="rfq">
          <span className="eyebrow">RFQ details</span>
          <h2>Tell us what to quote.</h2>
          <RfqForm locale={locale} />
        </div>
      </section>
    </main>
  );

  return (
    <PuckPageRenderer
      fallback={fallback}
      layoutKey="contact"
      locale={locale}
      prefix={structuredData}
      state={state}
    />
  );
}
