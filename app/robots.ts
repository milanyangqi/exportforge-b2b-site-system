import type { MetadataRoute } from "next";
import { readAdminState } from "@/lib/server/admin-store";
import { absoluteUrl, isSiteIndexable } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const state = await readAdminState();
  const indexable = isSiteIndexable(state);

  return {
    rules: indexable
      ? [
          {
            userAgent: "*",
            allow: "/",
            disallow: ["/api/", "/*/admin", "/*/admin/", "/*/admin/login"]
          }
        ]
      : [
          {
            userAgent: "*",
            disallow: "/"
          }
        ],
    sitemap: absoluteUrl(state, "/sitemap.xml")
  };
}
