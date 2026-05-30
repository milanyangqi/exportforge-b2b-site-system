import { RfqForm } from "@/components/RfqForm";
import { PublicContactList } from "@/components/PublicContactList";
import { PuckPageRenderer } from "@/components/PuckPageRenderer";
import { readAdminState } from "@/lib/server/admin-store";
import { absoluteUrl, buildBreadcrumbJsonLd, buildPageMetadata, jsonLd, localePath } from "@/lib/seo";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

const contactTitle = "Contact Xiyida Packaging for custom tin box projects.";
const contactDescription = "Send tin shape, size, artwork, finish, packing details, and destination so Xiyida Packaging can review your packaging project.";

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
  const structuredData = (
    <>
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
    </>
  );
  const fallback = (
    <main className="subpage">
      {structuredData}
      <section className="section split contact-section">
        <div className="contact-copy">
          <span className="eyebrow">Contact</span>
          <h1>Send your custom tin box packaging request to Xiyida Packaging.</h1>
          <p>Share tin shape, size, artwork status, finish, packing details, and destination so the sales team can review your export packaging project.</p>
          <PublicContactList channels={state.contactChannels} locale={locale} />
        </div>
        <div className="contact-rfq-panel" id="rfq">
          <span className="eyebrow">RFQ details</span>
          <h2>Tell us what to review.</h2>
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
