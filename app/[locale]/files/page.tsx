import { readAdminState } from "@/lib/server/admin-store";
import { buildBreadcrumbJsonLd, buildPageMetadata, jsonLd, localePath } from "@/lib/seo";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

const filesTitle = "KeyproTools product images and tooling resources";
const filesDescription = "Download KeyproTools end mill, drill bit, coating, packaging, catalog, specification, and article media for buyer review.";

export async function generateMetadata({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const alternates = state.enabledLocales.reduce<Partial<Record<LocaleCode, string>>>((paths, localeCode) => {
    if (localeCode === "en" || localeCode === "zh") paths[localeCode] = localePath(localeCode, "/files");
    return paths;
  }, {});

  return buildPageMetadata(state, {
    locale,
    path: localePath(locale, "/files"),
    title: filesTitle,
    description: filesDescription,
    kind: "files",
    contentComplete: locale === "en" || locale === "zh",
    alternates
  });
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default async function FilesPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  const { locale } = await params;
  const state = await readAdminState();
  const files = state.uploadedFiles.filter((file) => file.enabled !== false);

  return (
    <main className="subpage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildBreadcrumbJsonLd(state, [
            { name: state.siteSettings.title, path: localePath(locale) },
            { name: "Downloads", path: localePath(locale, "/files") }
          ]))
        }}
      />
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Downloads</span>
          <h1>KeyproTools product images and tooling resources</h1>
          <p>End mill, drill bit, coating, packaging, catalog, specification, and article media are collected here for buyer review.</p>
        </div>
        <div className="download-grid">
          {files.map((file) => (
            <article className="download-card" key={file.id}>
              <div>
                <strong>{file.name}</strong>
                <span>{file.mimeType || "application/octet-stream"} · {formatFileSize(file.size)}</span>
              </div>
              <a href={file.url} download={file.name}>下载</a>
            </article>
          ))}
          {files.length === 0 ? <p>暂无可下载文件。</p> : null}
        </div>
      </section>
    </main>
  );
}
