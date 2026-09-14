"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { t } from "@/lib/i18n";
import type { LocaleCode, SiteTemplateSettings } from "@/types/site";
export function GrillBeatsHero({
  locale,
  settings: s,
}: {
  locale: LocaleCode;
  settings: SiteTemplateSettings;
}) {
  const slides = s.heroSlides
    .filter((slide) => slide.enabled && slide.imageUrl)
    .sort((a, b) => a.order - b.order);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(0);
    if (
      !s.heroCarouselEnabled ||
      !s.heroCarouselAutoplay ||
      slides.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = setInterval(
      () => setIndex((n) => (n + 1) % slides.length),
      Math.max(3, s.heroCarouselIntervalSeconds) * 1000,
    );
    return () => clearInterval(timer);
  }, [
    s.heroCarouselEnabled,
    s.heroCarouselAutoplay,
    s.heroCarouselIntervalSeconds,
    slides.length,
  ]);
  const slide = slides[index % slides.length];
  return (
    <section
      className={`gb-hero ${!s.showHeroVisual || !slide ? "gb-hero-text-only" : ""}`}
    >
      <div className="gb-hero-inner">
        <div className="gb-hero-copy">
          <span className="gb-eyebrow">{t(s.heroKicker, locale)}</span>
          <h1>{t(s.heroTitle, locale)}</h1>
          <p>{t(s.heroBody, locale)}</p>
          <div className="gb-hero-actions">
            <a className="gb-button" href={`/${locale}/contact#rfq`}>
              {t(s.primaryCtaLabel, locale)} <ArrowRight size={17} />
            </a>
            <a href={`/${locale}/products`}>
              {t(s.secondaryCtaLabel, locale)} ↗
            </a>
          </div>
          <div className="gb-hero-detail">
            {locale === "zh"
              ? "圆竹签 / 扁平竹签 / 结头签 / 包装"
              : "ROUND  /  PADDLE  /  KNOTTED  /  PACKAGED"}
          </div>
        </div>
        {s.showHeroVisual && slide && (
          <div className="gb-hero-media">
            <img
              src={slide.imageUrl}
              alt={t(slide.alt, locale)}
              width="1152"
              height="768"
              fetchPriority="high"
            />
            {s.heroCarouselEnabled && slides.length > 1 && (
              <div className="gb-slide-controls">
                {slides.map((item, n) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIndex(n)}
                    aria-label={`${locale === "zh" ? "切换海报" : "Show slide"} ${n + 1}`}
                    aria-pressed={index === n}
                  >
                    {n + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
