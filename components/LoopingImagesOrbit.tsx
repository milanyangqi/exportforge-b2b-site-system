"use client";

/* eslint-disable @next/next/no-img-element */

import { useLayoutEffect, useRef, type CSSProperties } from "react";

type LoopingOrbitImage = {
  url: string;
  alt: string;
};

export function LoopingImagesOrbit({
  altFallback,
  className,
  cycleSeconds,
  images
}: {
  altFallback: string;
  className: string;
  cycleSeconds: number;
  images: LoopingOrbitImage[];
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      root.style.setProperty("--loop-progress-angle", "0deg");
      root.style.setProperty("--loop-progress-counter-angle", "0deg");
      return;
    }

    const safeCycleSeconds = Number.isFinite(cycleSeconds) && cycleSeconds > 0 ? cycleSeconds : 8;
    let frameId = 0;

    const applyAngle = (time: number) => {
      const elapsedSeconds = time / 1000;
      const angle = ((elapsedSeconds / safeCycleSeconds) * 360) % 360;
      root.style.setProperty("--loop-progress-angle", `${angle}deg`);
      root.style.setProperty("--loop-progress-counter-angle", `${-angle}deg`);
    };

    const tick = (time: number) => {
      applyAngle(time);
      frameId = window.requestAnimationFrame(tick);
    };

    applyAngle(performance.now());
    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [cycleSeconds]);

  return (
    <div className={className} ref={rootRef}>
      <div className="puck-public-looping-images-stage">
        {images.map((image, index) => {
          const angle = (360 / images.length) * index;

          return (
            <figure
              className="puck-public-looping-image"
              key={`${image.url}-${index}`}
              style={{
                "--loop-image-angle": `${angle}deg`,
                "--loop-image-counter-angle": `${-angle}deg`
              } as CSSProperties}
            >
              <img src={image.url} alt={image.alt || altFallback} loading="lazy" />
            </figure>
          );
        })}
      </div>
    </div>
  );
}
