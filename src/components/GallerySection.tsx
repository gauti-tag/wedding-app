"use client";

import { useEffect, useRef, useState } from "react";
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
  const gallery = photos.filter((p) => p.album === "gallery" || p.album === "story");
  const scrollable = gallery.length > GALLERY_SCROLL_THRESHOLD;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    if (!scrollable) return;
    const el = scrollerRef.current;
    if (!el) return;

    function update() {
      if (!el) return;
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
      setAtBottom(remaining < 12);
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scrollable, gallery.length]);

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
                ? "max-h-[min(70vh,52rem)] overflow-y-auto overscroll-contain scroll-smooth pr-1 [scrollbar-color:var(--caramel)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-caramel/70 [&::-webkit-scrollbar-track]:bg-transparent"
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
                      <figure className="overflow-hidden border border-line">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={photo.caption || dict.gallery.photoAlt}
                          className="w-full object-cover transition duration-700 hover:scale-[1.03]"
                        />
                        {photo.caption ? (
                          <figcaption className="border-t border-line bg-white/90 px-3 py-2 text-xs text-soft">
                            {photo.caption}
                          </figcaption>
                        ) : null}
                      </figure>
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
    </section>
  );
}
