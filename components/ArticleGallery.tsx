"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { GalleryImage } from "@/lib/article-gallery";

export function ArticleGallery({ images, locale }: { images: GalleryImage[]; locale: string }) {
  const [selected, setSelected] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const zh = locale === "zh";
  const current = images[selected] ?? images[0];
  const move = (step: number) => setSelected(index => (index + step + images.length) % images.length);
  useEffect(() => { setSelected(0); }, [images]);
  if (!current) return null;
  const arrows = <>
    <button type="button" className="gallery-arrow previous" onClick={() => move(-1)} aria-label={zh ? "上一张图片" : "Previous image"}><ChevronLeft size={22} /></button>
    <button type="button" className="gallery-arrow next" onClick={() => move(1)} aria-label={zh ? "下一张图片" : "Next image"}><ChevronRight size={22} /></button>
  </>;
  return <div className="tin-gallery" aria-label={zh ? "产品图片" : "Product images"}>
    <div className="tin-gallery-stage" onKeyDown={event => {
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
    }}>
      <button type="button" className="gallery-open" ref={openButton} onClick={() => dialog.current?.showModal()} aria-label={zh ? "放大图片" : "Enlarge image"}>
        <img src={current.url} alt={current.label} width="1000" height="1000" decoding="async" />
        <span className="gallery-expand"><Expand size={18} /></span>
      </button>
      {images.length > 1 ? arrows : null}
      <span className="gallery-position" aria-live="polite">{selected + 1} / {images.length}</span>
    </div>
    {images.length > 1 ? <div className="tin-gallery-thumbnails" aria-label={zh ? "选择图片" : "Choose an image"}>
      {images.map((image, index) => <button type="button" key={image.url} aria-label={`${zh ? "查看图片" : "View image"} ${index + 1}: ${image.label}`} aria-pressed={index === selected} onClick={() => setSelected(index)}>
        <img src={image.url} alt="" width="80" height="80" loading="lazy" />
      </button>)}
    </div> : null}
    <dialog className="gallery-lightbox" ref={dialog} onClose={() => openButton.current?.focus()} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} onKeyDown={event => {
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
    }}>
      <button type="button" className="gallery-close" onClick={() => dialog.current?.close()} aria-label={zh ? "关闭图片" : "Close image"} autoFocus><X size={26} /></button>
      <img src={current.url} alt={current.label} />
      {images.length > 1 ? arrows : null}
      <p aria-live="polite">{selected + 1} / {images.length} · {current.label}</p>
    </dialog>
  </div>;
}
