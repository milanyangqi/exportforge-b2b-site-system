import { readAdminState } from "@/lib/server/admin-store";
import type { LocaleCode } from "@/types/site";

export const dynamic = "force-dynamic";

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default async function FilesPage({ params }: { params: Promise<{ locale: LocaleCode }> }) {
  await params;
  const state = await readAdminState();
  const files = state.uploadedFiles.filter((file) => file.enabled !== false);

  return (
    <main className="subpage">
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
