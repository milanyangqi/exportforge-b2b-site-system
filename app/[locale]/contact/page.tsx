import { RfqForm } from "@/components/RfqForm";
import { PublicContactList } from "@/components/PublicContactList";
import { readAdminState } from "@/lib/server/admin-store";
import { absoluteUrl, buildBreadcrumbJsonLd, buildPageMetadata, jsonLd, localePath } from "@/lib/seo";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

const contactTitle = "Contact KeyproTools for end mills, drill bits, and OEM tooling quotes.";
const contactDescription = "Send drawings, size lists, coating requirements, packaging details, and destination so KeyproTools can prepare a practical export quote.";

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
    title: contactTitle,
    description: contactDescription,
    kind: "contact",
    contentComplete: locale === "en" || locale === "zh",
    alternates
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();

  return (
    <main className="subpage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: contactTitle,
            description: contactDescription,
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
      <section className="section split contact-section">
        <div className="contact-copy">
          <span className="eyebrow">Contact</span>
          <h1>Send your end mill, drill bit, or OEM tooling request to KeyproTools.</h1>
          <p>Share drawings, size lists, coating requirements, packaging details, and destination so the sales team can prepare a practical export quote.</p>
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
}
