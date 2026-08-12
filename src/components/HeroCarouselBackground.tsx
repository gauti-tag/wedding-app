"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { PhotoFill } from "@/components/PhotoFill";
import { MAX_HERO_PHOTOS } from "@/lib/hero-carousel";
import type { HeroCarouselSettings, Photo } from "@/lib/types";

type Props = {
  photos: Photo[];
  settings: HeroCarouselSettings;
  fallbackAlt: string;
};

export function HeroCarouselBackground({ photos, settings, fallbackAlt }: Props) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = photos.slice(0, MAX_HERO_PHOTOS);
  const canLoop = slides.length > 1 && settings.autoplay && !reduceMotion;

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (!canLoop || paused) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, settings.intervalMs);
    return () => window.clearInterval(id);
  }, [canLoop, paused, settings.intervalMs, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="absolute inset-0 size-full bg-[radial-gradient(circle_at_25%_20%,#a67c52_0%,transparent_42%),radial-gradient(circle_at_75%_70%,#6b3e2a_0%,transparent_40%),linear-gradient(160deg,#3b2416,#5a3824_50%,#3b2416)]" />
    );
  }

  return (
    <div
      className="absolute inset-0 size-full overflow-hidden bg-cacao"
      onMouseEnter={() => {
        if (settings.pauseOnHover) setPaused(true);
      }}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((photo, i) => (
        <div
          key={photo.id}
          className="absolute inset-0 size-full transition-opacity"
          style={{
            opacity: i === index ? 1 : 0,
            transitionDuration: `${settings.transitionMs}ms`,
          }}
          aria-hidden={i !== index}
        >
          <PhotoFill
            src={photo.url}
            alt={photo.caption || fallbackAlt}
            sizes="100vw"
            priority={i === 0}
          />
        </div>
      ))}

      {slides.length > 1 ? (
        <div className="pointer-events-none absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-[5] flex -translate-x-1/2 gap-2 md:bottom-10">
          {slides.map((photo, i) => (
            <span
              key={photo.id}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-7 bg-[#f7f4f0]" : "w-1.5 bg-[#f7f4f0]/45"
              }`}
              aria-hidden
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
