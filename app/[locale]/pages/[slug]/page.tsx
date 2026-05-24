import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/ArticleContent";
import { t } from "@/lib/i18n";
import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export default async function SitePageDetail({
  params
}: {
  params: Promise<{ locale: LocaleCode; slug: string }>;
}) {
  const { locale, slug } = await params;
  const state = await readAdminState();
  const page = state.pages.find((item) => item.slug === slug && item.status === "published");

  if (!page) {
    notFound();
  }

  return (
    <main className="subpage">
      <article className="content-detail">
        <span className="eyebrow">Page</span>
        <h1>{t(page.title, locale)}</h1>
        <p className="detail-excerpt">{t(page.excerpt, locale)}</p>
        <ArticleContent body={t(page.body, locale)} />
      </article>
    </main>
  );
}
