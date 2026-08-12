"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PhotoFill } from "@/components/PhotoFill";
import { Reveal } from "@/components/Reveal";
import type { Dictionary } from "@/i18n/types";
import type { Photo } from "@/lib/types";

const GALLERY_SCROLL_THRESHOLD = 6;

export function GallerySection({
  photos,
  dict,
}: {
  photos: Photo[];
  dict: Dictionary;
}) {
  const gallery = photos.filter((p) => p.album === "gallery");
  const scrollable = gallery.length > GALLERY_SCROLL_THRESHOLD;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!scrollable) return;
    const el = scrollerRef.current;
    if (!el) return;

    const desktop = window.matchMedia("(min-width: 768px)");

    function update() {
      if (!el) return;
      if (!desktop.matches) {
        setAtBottom(true);
        return;
      }
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
      setAtBottom(remaining < 12);
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    desktop.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      desktop.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, [scrollable, gallery.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
        return;
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((i) => (i === null ? i : (i + 1) % gallery.length));
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((i) =>
          i === null ? i : (i - 1 + gallery.length) % gallery.length,
        );
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [activeIndex, gallery.length]);

  const activePhoto = activeIndex !== null ? gallery[activeIndex] : null;

  const lightbox =
    mounted && activePhoto ? (
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-cacao/90 px-3 py-6 md:px-8"
        role="dialog"
        aria-modal="true"
        aria-label={dict.gallery.lightboxLabel}
        onClick={() => setActiveIndex(null)}
      >
        <button
          type="button"
          className="absolute top-4 right-4 z-10 min-h-11 min-w-11 text-sm tracking-[0.16em] text-[#f7f4f0] uppercase touch-manipulation"
          onClick={() => setActiveIndex(null)}
        >
          {dict.gallery.close}
        </button>

        {gallery.length > 1 ? (
          <>
            <button
              type="button"
              className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center text-2xl text-[#f7f4f0]/90 touch-manipulation md:left-6"
              aria-label={dict.gallery.prev}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((i) =>
                  i === null ? i : (i - 1 + gallery.length) % gallery.length,
                );
              }}
            >
              ‹
            </button>
            <button
              type="button"
              className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center text-2xl text-[#f7f4f0]/90 touch-manipulation md:right-6"
              aria-label={dict.gallery.next}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((i) => (i === null ? i : (i + 1) % gallery.length));
              }}
            >
              ›
            </button>
          </>
        ) : null}

        <figure
          className="relative max-h-[min(88svh,900px)] w-full max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activePhoto.url}
            alt={activePhoto.caption || dict.gallery.photoAlt}
            className="mx-auto h-auto max-h-[min(78dvh,820px)] w-full max-w-full object-contain"
          />
          {activePhoto.caption ? (
            <figcaption className="mt-3 text-center text-sm text-[#f7f4f0]/85">
              {activePhoto.caption}
            </figcaption>
          ) : null}
          <p className="mt-2 text-center text-[0.65rem] tracking-[0.18em] text-[#f7f4f0]/55 uppercase">
            {(activeIndex ?? 0) + 1} / {gallery.length}
          </p>
        </figure>
      </div>
    ) : null;

  return (
    <section id="gallery" className="py-24 md:py-32">
      <div className="section-shell">
        <Reveal>
          <p className="eyebrow">{dict.gallery.eyebrow}</p>
          <h2 className="section-title mt-4 text-4xl text-mist md:text-5xl">{dict.gallery.title}</h2>
          <p className="mt-4 max-w-xl text-base font-normal text-soft">{dict.gallery.subtitle}</p>
        </Reveal>

        <div className="relative mt-12">
          <div
            ref={scrollerRef}
            className={
              scrollable
                ? "md:max-h-[min(70vh,52rem)] md:overflow-y-auto md:overscroll-contain md:scroll-smooth md:pr-1 md:[scrollbar-color:var(--caramel)_transparent] md:[scrollbar-width:thin] md:[&::-webkit-scrollbar]:w-1.5 md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-caramel/70 md:[&::-webkit-scrollbar-track]:bg-transparent"
                : undefined
            }
          >
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {gallery.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Reveal key={i} delay={i * 0.05} className="mb-4 break-inside-avoid">
                      <div
                        className={`border border-line bg-pine/40 ${
                          i % 3 === 0
                            ? "aspect-[4/5]"
                            : i % 3 === 1
                              ? "aspect-square"
                              : "aspect-[3/4]"
                        }`}
                      >
                        <div className="flex h-full items-end p-4 text-xs tracking-[0.16em] text-champagne/70 uppercase">
                          {dict.gallery.placeholder}
                        </div>
                      </div>
                    </Reveal>
                  ))
                : gallery.map((photo, i) => (
                    <Reveal
                      key={photo.id}
                      delay={Math.min(i, 8) * 0.04}
                      className="mb-4 break-inside-avoid"
                    >
                      <button
                        type="button"
                        className="block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left touch-manipulation"
                        onClick={() => setActiveIndex(i)}
                        aria-label={dict.gallery.openPhoto}
                      >
                        <figure className="overflow-hidden border border-line">
                          <div className="relative aspect-[4/5] w-full overflow-hidden">
                            <PhotoFill
                              src={photo.url}
                              alt={photo.caption || dict.gallery.photoAlt}
                              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cacao/15 via-cacao/25 to-cacao/55 md:from-cacao/25 md:via-cacao/45 md:to-cacao/90" />
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(59,36,22,0.28),transparent_50%,rgba(59,36,22,0.16))] md:bg-[linear-gradient(90deg,rgba(59,36,22,0.45),transparent_50%,rgba(59,36,22,0.25))]" />
                          </div>
                          {photo.caption ? (
                            <figcaption className="border-t border-line bg-white/90 px-3 py-2 text-xs text-soft">
                              {photo.caption}
                            </figcaption>
                          ) : null}
                        </figure>
                      </button>
                    </Reveal>
                  ))}
            </div>
          </div>

          {scrollable && !atBottom ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ivory via-ivory/80 to-transparent"
            />
          ) : null}
        </div>
      </div>

      {lightbox ? createPortal(lightbox, document.body) : null}
    </section>
  );
}
