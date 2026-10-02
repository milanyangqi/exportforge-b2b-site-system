export type GalleryImage = { url: string; label: string };

/** Collect existing CMS photos without changing the article's text or image placement. */
export function articleGallery(cover: string | undefined, body: string, title: string, locale: string): GalleryImage[] {
  const images: GalleryImage[] = [];
  const seen = new Set<string>();
  const add = (url: string, label: string) => {
    url = url.trim().replace(/^<|>$/g, "");
    if (!/^(https?:\/\/|\/(?!\/))/i.test(url) || seen.has(url)) return;
    seen.add(url);
    const safeLabel = label && !(locale === "en" && /[\u4e00-\u9fff]/.test(label));
    images.push({ url, label: safeLabel ? label : `${title} — ${images.length + 1}` });
  };
  if (cover) add(cover, title);
  // Ignore fenced examples. Old media-library image links are supported too.
  const content = body.replace(/```[\s\S]*?(?:```|$)/g, "");
  const pattern = /(!?)\[([^\]]*)\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+["'][^\n]*?["'])?\s*\)/g;
  for (const match of content.matchAll(pattern)) {
    const label = match[2].replace(/^(?:下载文件：|Download file:\s*)/, "");
    if (match[1] || /\.(?:jpe?g|png|webp|gif|avif)(?:[?#].*)?$/i.test(label) || /\.(?:jpe?g|png|webp|gif|avif)(?:[?#].*)?$/i.test(match[3])) add(match[3], label);
  }
  return images;
}
