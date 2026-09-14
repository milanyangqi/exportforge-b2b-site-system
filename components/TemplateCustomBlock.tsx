/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { TemplateImageCarousel } from "@/components/TemplateImageCarousel";
import { ArticleContent } from "@/components/ArticleContent";
import { t } from "@/lib/i18n";
import type { LocaleCode, SiteTemplateCustomBlock } from "@/types/site";

export function TemplateCustomBlock({
  block,
  locale,
}: {
  block: SiteTemplateCustomBlock;
  locale: LocaleCode;
}) {
  const getCustomBlockImages = (block: SiteTemplateCustomBlock) => {
    const images = (block.imageItems ?? [])
      .filter((item) => item.enabled && item.url.trim())
      .sort((a, b) => a.order - b.order);

    if (images.length > 0) return images;
    return block.mediaUrl
      ? [
          {
            id: `${block.id}-fallback-image`,
            url: block.mediaUrl,
            alt: block.title,
            caption: { en: "", zh: "" },
            enabled: true,
            order: 10,
          },
        ]
      : [];
  };
  const renderCustomBlockImages = (
    block: SiteTemplateCustomBlock,
    title: string,
  ) => {
    const layout = block.imageLayout ?? "single";
    const images =
      layout === "single"
        ? getCustomBlockImages(block).slice(0, 1)
        : getCustomBlockImages(block);
    if (images.length === 0) return null;
    if (layout === "carousel")
      return (
        <TemplateImageCarousel
          images={images.map((image) => ({
            id: image.id,
            url: image.url,
            alt: image.alt ? t(image.alt, locale) : title,
            caption: image.caption ? t(image.caption, locale) : "",
          }))}
          autoplay={block.imageCarouselAutoplay ?? true}
          interval={block.imageCarouselIntervalSeconds ?? 5}
        />
      );

    return (
      <div
        className={`custom-template-image-set layout-${layout}${(block.imageCarouselAutoplay ?? true) ? " autoplay" : ""}`}
        style={
          {
            "--custom-carousel-duration": `${Math.max(3, Math.min(15, block.imageCarouselIntervalSeconds ?? 5))}s`,
          } as CSSProperties
        }
      >
        {images.map((item) => (
          <figure className="custom-template-media" key={item.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.alt ? t(item.alt, locale) : title}
              loading="lazy"
            />
            {item.caption && t(item.caption, locale) ? (
              <figcaption>{t(item.caption, locale)}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    );
  };
  const renderCustomBlockVideo = (mediaUrl: string, title: string) => {
    if (!mediaUrl) return null;
    const isDirectVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaUrl);

    return (
      <figure className="custom-template-media video">
        {isDirectVideo ? (
          <video src={mediaUrl} controls preload="metadata" />
        ) : (
          <iframe
            src={mediaUrl}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}
      </figure>
    );
  };
  const eyebrow =
    (block.eyebrow ? t(block.eyebrow, locale) : "") ||
    (block.type === "video"
      ? "Video"
      : block.type === "image"
        ? "Image"
        : block.type === "cta"
          ? "Action"
          : "Custom section");
  const title = t(block.title, locale);
  const body = t(block.body, locale);
  const buttonLabel =
    (block.buttonLabel ? t(block.buttonLabel, locale) : "") || title;
  const media =
    block.type === "image"
      ? renderCustomBlockImages(block, title)
      : block.type === "video"
        ? renderCustomBlockVideo(block.mediaUrl ?? "", title)
        : null;
  const isExternalLink = Boolean(block.openInNewTab);

  return (
    <section
      className={`gb-section custom-template-section custom-template-${block.type} theme-${block.theme ?? (block.type === "cta" ? "dark" : "light")} align-${block.align ?? "left"} layout-${block.layout ?? (block.type === "image" || block.type === "video" ? "media-left" : "stacked")} spacing-${block.spacing ?? "normal"}`}
    >
      <div className="custom-template-inner">
        {block.type !== "text" &&
        block.type !== "cta" &&
        block.layout !== "media-right"
          ? media
          : null}
        <div className="custom-template-copy">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h2>{title}</h2>
          {body ? <ArticleContent body={body} /> : null}
          {block.type === "cta" ? (
            <a
              className="gb-button"
              href={block.linkUrl || "#rfq"}
              target={isExternalLink ? "_blank" : undefined}
              rel={isExternalLink ? "noopener noreferrer" : undefined}
            >
              {buttonLabel}
            </a>
          ) : null}
        </div>
        {block.type !== "text" &&
        block.type !== "cta" &&
        block.layout === "media-right"
          ? media
          : null}
      </div>
    </section>
  );
}
