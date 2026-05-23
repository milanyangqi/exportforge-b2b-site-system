import { aiContentConfig, canGenerateAiDraft } from "@/config/ai";
import { cmsCollections } from "@/config/cms-schema";
import { roles } from "@/config/rbac";
import { themes } from "@/config/themes";
import { locales } from "@/config/locales";

export function AdminDashboard() {
  return (
    <div className="admin-shell">
      <section className="admin-panel wide">
        <span className="eyebrow">System cockpit</span>
        <h1>Admin foundation for content, leads, users, themes, and AI drafts.</h1>
        <p>
          This page is a typed admin blueprint ready to connect to Payload CMS collections, PostgreSQL,
          storage adapters, and real authentication.
        </p>
      </section>

      <section className="admin-panel">
        <h2>Roles</h2>
        <div className="stack-list">
          {Object.entries(roles).map(([key, role]) => (
            <div key={key}>
              <strong>{role.label}</strong>
              <span>{role.permissions.length} permissions</span>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <h2>Languages</h2>
        <div className="tag-list">
          {locales.map((locale) => (
            <span key={locale.code}>{locale.nativeName}{locale.dir === "rtl" ? " RTL" : ""}</span>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <h2>Themes</h2>
        <div className="stack-list">
          {Object.values(themes).map((theme) => (
            <div key={theme.key}>
              <strong>{theme.name}</strong>
              <span>{theme.description}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <h2>CMS Collections</h2>
        <div className="stack-list">
          {cmsCollections.map((collection) => (
            <div key={collection.slug}>
              <strong>{collection.slug}</strong>
              <span>{collection.purpose}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-panel wide">
        <h2>AI Content Center</h2>
        <p>Provider: {aiContentConfig.provider}. Publish mode: {aiContentConfig.publishMode}.</p>
        <p>{canGenerateAiDraft() ? "AI API key detected." : "AI API key missing. Generation stays disabled with a clear setup path."}</p>
        <div className="tag-list">
          {aiContentConfig.supportedKinds.map((kind) => (
            <span key={kind}>{kind}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
