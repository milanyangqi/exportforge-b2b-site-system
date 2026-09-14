"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
export function TemplateImageCarousel({
  images,
  autoplay,
  interval,
}: {
  images: { id: string; url: string; alt: string; caption: string }[];
  autoplay: boolean;
  interval: number;
}) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (
      !autoplay ||
      images.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = setInterval(
      () => setIndex((n) => (n + 1) % images.length),
      Math.max(3, Math.min(15, interval)) * 1000,
    );
    return () => clearInterval(timer);
  }, [autoplay, interval, images.length]);
  const current = images[index % images.length];
  if (!current) return null;
  return (
    <div className="gb-image-carousel">
      <figure className="custom-template-media">
        <img src={current.url} alt={current.alt} loading="lazy" />
        {current.caption && <figcaption>{current.caption}</figcaption>}
      </figure>
      <div className="gb-carousel-buttons">
        {images.map((image, n) => (
          <button
            key={image.id}
            type="button"
            aria-label={image.alt || `Image ${n + 1}`}
            aria-pressed={index % images.length === n}
            onClick={() => setIndex(n)}
          >
            {n + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
