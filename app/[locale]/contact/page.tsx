import { RfqForm } from "@/components/RfqForm";
import { t } from "@/lib/i18n";
import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export default async function ContactPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();

  return (
    <main className="subpage">
      <section className="section split">
        <div>
          <span className="eyebrow">Contact</span>
          <h1>Send your end mill, drill bit, or OEM tooling request to KeyproTools.</h1>
          <p>Share drawings, size lists, coating requirements, packaging details, and destination so the sales team can prepare a practical export quote.</p>
          <div className="stack-list public">
            {state.contactChannels.filter((channel) => channel.enabled).map((channel) => (
              <a key={channel.id} href={channel.href}>
                <strong>{t(channel.label, locale)}</strong>
                <span>{channel.value}</span>
              </a>
            ))}
          </div>
        </div>
        <RfqForm locale={locale} />
      </section>
    </main>
  );
}
