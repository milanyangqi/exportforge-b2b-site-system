import type { CSSProperties } from "react";

const heroPosters = [
  "/assets/tools/hero-tooling-range.jpg",
  "/assets/tools/hero-cnc-factory.jpg",
  "/assets/tools/hero-export-packing.jpg"
];

export function HeroPosterCarousel() {
  return (
    <div className="hero-poster-carousel" aria-hidden="true">
      {heroPosters.map((image) => (
        <span
          className="hero-poster-slide"
          key={image}
          style={{ "--poster-image": `url(${image})` } as CSSProperties}
        />
      ))}
    </div>
  );
}
