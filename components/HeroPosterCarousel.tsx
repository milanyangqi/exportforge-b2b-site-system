import type { CSSProperties } from "react";
import type { SiteHeroSlide } from "@/types/site";

const fallbackHeroSlides: SiteHeroSlide[] = [
  {
    id: "hero-tooling-range",
    imageUrl: "/assets/current-template/hero.webp",
    alt: { en: "Illustrative custom bracket" },
    enabled: true,
    order: 10
  },
  {
    id: "hero-cnc-factory",
    imageUrl: "/assets/current-template/process.webp",
    alt: { en: "Illustrative additive process" },
    enabled: true,
    order: 20
  },
  {
    id: "hero-export-packing",
    imageUrl: "/assets/current-template/parts.webp",
    alt: { en: "Illustrative custom parts" },
    enabled: true,
    order: 30
  }
];

export function HeroPosterCarousel({
  enabled = true,
  intervalSeconds = 7,
  slides = fallbackHeroSlides
}: {
  enabled?: boolean;
  intervalSeconds?: number;
  slides?: SiteHeroSlide[];
}) {
  const activeSlides = [...(slides.length > 0 ? slides : fallbackHeroSlides)]
    .filter((slide) => slide.enabled && slide.imageUrl)
    .sort((a, b) => a.order - b.order);
  const posterSlides = activeSlides.length > 0 ? activeSlides : fallbackHeroSlides;
  const shouldAnimate = enabled && posterSlides.length > 1;
  const safeInterval = Number.isFinite(intervalSeconds) ? Math.max(3, Math.min(15, Math.trunc(intervalSeconds))) : 7;

  return (
    <div className={shouldAnimate ? "hero-poster-carousel" : "hero-poster-carousel static"} aria-hidden="true">
      {posterSlides.map((slide, index) => (
        <span
          className="hero-poster-slide"
          key={slide.id || slide.imageUrl}
          style={{
            "--poster-delay": `${index * safeInterval}s`,
            "--poster-duration": `${posterSlides.length * safeInterval}s`,
            "--poster-image": `url(${slide.imageUrl})`
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
