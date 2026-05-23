import { AdminLogin } from "@/components/AdminLogin";
import type { LocaleCode } from "@/types/site";

export default async function AdminLoginPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  return <AdminLogin locale={locale} />;
}
