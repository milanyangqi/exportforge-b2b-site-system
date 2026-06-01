import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

function filesTitle(siteTitle: string) {
  return `${siteTitle} downloads`;
}

function filesDescription(siteTitle: string) {
  return `Download current ${siteTitle} images, documents, and media resources.`;
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default async function FilesPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  await params;
  const state = await readAdminState();
  const files = state.uploadedFiles.filter((file) => file.enabled !== false);
  const pageTitle = filesTitle(state.siteSettings.title);
  const pageDescription = filesDescription(state.siteSettings.title);

  return (
    <main className="subpage">
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Downloads</span>
          <h1>{pageTitle}</h1>
          <p>{pageDescription}</p>
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
