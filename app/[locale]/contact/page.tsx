import { RfqForm } from "@/components/RfqForm";
import { PublicContactList } from "@/components/PublicContactList";
import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export default async function ContactPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();

  return (
    <main className="subpage">
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
