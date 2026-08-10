"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { MAX_HERO_PHOTOS } from "@/lib/hero-carousel";
import type { HeroCarouselSettings, Photo } from "@/lib/types";

type Props = {
  photos: Photo[];
  settings: HeroCarouselSettings;
  fallbackAlt: string;
};

const luxuryEase = [0.16, 1, 0.3, 1] as const;

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
      <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,#a67c52_0%,transparent_42%),radial-gradient(circle_at_75%_70%,#6b3e2a_0%,transparent_40%),linear-gradient(160deg,#3b2416,#5a3824_50%,#3b2416)]" />
    );
  }

  if (slides.length === 1 || reduceMotion) {
    const photo = slides[0];
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo.url}
        alt={photo.caption || fallbackAlt}
        className="h-full w-full object-cover"
      />
    );
  }

  const duration = settings.transitionMs / 1000;
  const active = slides[index];

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, x: 56 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -56 },
    },
    zoom: {
      initial: { opacity: 0, scale: 1.12 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.96 },
    },
  }[settings.effect];

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => {
        if (settings.pauseOnHover) setPaused(true);
      }}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={active.id}
          className="absolute inset-0"
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration, ease: luxuryEase }}
        >
          <motion.img
            src={active.url}
            alt={active.caption || fallbackAlt}
            className="h-full w-full object-cover"
            initial={settings.kenBurns ? { scale: 1 } : false}
            animate={
              settings.kenBurns
                ? { scale: 1.08 }
                : { scale: 1 }
            }
            transition={
              settings.kenBurns
                ? {
                    duration: Math.max(settings.intervalMs / 1000, duration + 0.4),
                    ease: "linear",
                  }
                : { duration: 0 }
            }
          />
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-[5] flex -translate-x-1/2 gap-2 md:bottom-10">
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
    </div>
  );
}
