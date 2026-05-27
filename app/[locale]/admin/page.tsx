import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminApp } from "@/components/AdminApp";
import { getAdminSessionEmail } from "@/lib/server/auth";
import type { LocaleCode } from "@/types/site";

export const metadata: Metadata = {
  title: "Admin | KeyproTools",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: LocaleCode }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const email = await getAdminSessionEmail();

  if (!email) {
    redirect(`/${locale}/admin/login`);
  }

  return <AdminApp email={email} initialTab={resolvedSearchParams?.tab} locale={locale} />;
}
