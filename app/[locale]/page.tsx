import { ActiveTemplate } from "@/components/templates/ActiveTemplate";
import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export default async function LocaleHome({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();

  return <ActiveTemplate locale={locale} state={state} />;
}
