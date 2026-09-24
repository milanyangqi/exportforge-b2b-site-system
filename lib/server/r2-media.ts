import { getCloudflareContext } from "@opennextjs/cloudflare";
type MediaBucket = { put(key: string, value: ArrayBuffer, options: { httpMetadata: { contentType: string; cacheControl: string } }): Promise<unknown>; delete(key: string): Promise<void> };
export async function getMediaBucket(): Promise<MediaBucket | null> {
  if (process.env.EXPORTFORGE_SELF_HOST === "1") return null;
  const context = await getCloudflareContext({ async: true });
  const env = context.env as unknown as { DAWN_MEDIA?: MediaBucket };
  return env.DAWN_MEDIA ?? null;
}
export function mediaPublicUrl(key: string) { return `/api/media/${encodeURIComponent(key)}`; }
