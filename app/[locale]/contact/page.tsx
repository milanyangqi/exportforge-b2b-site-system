import { RfqForm } from "@/components/RfqForm";
import { PublicContactList } from "@/components/PublicContactList";
import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

function contactTitle(siteTitle: string) {
  return `Contact ${siteTitle}`;
}

function contactDescription(siteTitle: string) {
  return `Send your request to ${siteTitle} and the team will follow up with details.`;
}

export default async function ContactPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const pageTitle = contactTitle(state.siteSettings.title);
  const pageDescription = contactDescription(state.siteSettings.title);

  return (
    <main className="subpage">
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
}
