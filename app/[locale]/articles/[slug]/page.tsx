import { notFound } from "next/navigation";
import { RfqForm } from "@/components/RfqForm";
import { t } from "@/lib/i18n";
import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({
  params
}: {
  params: Promise<{ locale: LocaleCode; slug: string }>;
}) {
  const { locale, slug } = await params;
  const state = await readAdminState();
  const article = state.articles.find((item) => item.slug === slug && item.status === "published");

  if (!article) {
    notFound();
  }

  return (
    <main className="subpage">
      <article className="content-detail">
        <span className="eyebrow">{article.category}</span>
        <h1>{t(article.title, locale)}</h1>
        <p className="detail-excerpt">{t(article.excerpt, locale)}</p>
        <div className="detail-body">
          {(article.body ? t(article.body, locale) : t(article.excerpt, locale))
            .split("\n")
            .filter(Boolean)
            .map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
        </div>
      </article>
      <section className="section rfq-section" id="rfq">
        <div>
          <span className="eyebrow">Need a quote?</span>
          <h2>Turn this content into a product RFQ discussion.</h2>
          <p>Buyer questions and article context can become sales-qualified inquiries.</p>
        </div>
        <RfqForm locale={locale} />
      </section>
    </main>
  );
}
