/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { RfqForm } from "@/components/RfqForm";
import { t } from "@/lib/i18n";
import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

function renderInlineContent(text: string, key: number): ReactNode {
  const match = /\[([^\]]+)]\(([^)]+)\)/.exec(text);
  if (!match) return text;

  const [token, label, href] = match;
  const before = text.slice(0, match.index);
  const after = text.slice(match.index + token.length);

  return (
    <>
      {before}
      <a className="article-file-link" href={href} download={href.startsWith("data:") ? label.replace(/^下载文件：/, "") : undefined}>
        {label}
      </a>
      {after ? renderInlineContent(after, key + 1) : null}
    </>
  );
}

function renderArticleBlock(block: string, index: number) {
  const trimmed = block.trim();
  const imageMatch = /^!\[([^\]]*)]\(([^)]+)\)$/.exec(trimmed);

  if (imageMatch) {
    return (
      <figure className="article-inline-image" key={`${index}-${trimmed}`}>
        <img src={imageMatch[2]} alt={imageMatch[1] || "Article image"} />
        {imageMatch[1] ? <figcaption>{imageMatch[1]}</figcaption> : null}
      </figure>
    );
  }

  if (trimmed.startsWith("## ")) {
    return <h2 key={`${index}-${trimmed}`}>{trimmed.slice(3)}</h2>;
  }

  if (trimmed.startsWith("> ")) {
    return <blockquote key={`${index}-${trimmed}`}>{renderInlineContent(trimmed.slice(2), index)}</blockquote>;
  }

  if (trimmed.startsWith("- ")) {
    return <p className="article-list-line" key={`${index}-${trimmed}`}>{renderInlineContent(trimmed.slice(2), index)}</p>;
  }

  return <p key={`${index}-${trimmed}`}>{renderInlineContent(trimmed, index)}</p>;
}

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
        {article.coverImageUrl ? (
          <figure className="article-cover">
            <img src={article.coverImageUrl} alt={t(article.title, locale)} />
          </figure>
        ) : null}
        <div className="detail-body">
          {(article.body ? t(article.body, locale) : t(article.excerpt, locale))
            .split("\n")
            .filter(Boolean)
            .map(renderArticleBlock)}
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
