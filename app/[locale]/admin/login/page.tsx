import type { Metadata } from "next";
import { AdminLogin } from "@/components/AdminLogin";
import type { LocaleCode } from "@/types/site";

export const metadata: Metadata = {
  title: "Admin Login | KeyproTools",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLoginPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  return <AdminLogin locale={locale} />;
}
