"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HeroCarouselBackground } from "@/components/HeroCarouselBackground";
import { ParallaxMedia } from "@/components/motion/ParallaxMedia";
import type { Locale } from "@/i18n/config";
import { normalizeHeroCarousel } from "@/lib/hero-carousel";
import { t } from "@/lib/localized";
import { coupleLabel } from "@/lib/site";
import type { Photo, SiteContent } from "@/lib/types";

const luxuryEase = [0.16, 1, 0.3, 1] as const;

export function Hero({
  heroPhotos,
  siteContent,
  locale,
}: {
  heroPhotos: Photo[];
  siteContent: SiteContent;
  locale: Locale;
}) {
  const reduceMotion = useReducedMotion();
  const names = coupleLabel(siteContent);
  const carousel = normalizeHeroCarousel(siteContent.heroCarousel);

  function fadeUp(delay: number) {
    return {
      initial: reduceMotion ? false : { opacity: 0, y: 28 },
      animate: { opacity: 1, y: 0 },
      transition: reduceMotion
        ? { duration: 0 }
        : { duration: 1.15, delay, ease: luxuryEase },
    };
  }

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0">
        <ParallaxMedia className="h-full w-full" strength={10}>
          <HeroCarouselBackground
            photos={heroPhotos}
            settings={carousel}
            fallbackAlt={names}
          />
        </ParallaxMedia>
        <div className="absolute inset-0 bg-gradient-to-b from-cacao/25 via-cacao/45 to-cacao/90" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(59,36,22,0.45),transparent_50%,rgba(59,36,22,0.25))]" />
      </div>

      <div className="section-shell relative z-10 flex min-h-[100svh] flex-col justify-end pb-16 pt-28 md:pb-20">
        <motion.p
          className="meta-date text-[0.72rem] tracking-[0.28em] text-[#f7f4f0]/90 uppercase"
          {...fadeUp(0.12)}
        >
          {t(siteContent.hero.weddingDateLabel, locale)}
        </motion.p>
        <motion.h1
          className="couple-name mt-4 max-w-4xl text-6xl leading-[1.1] text-[#f7f4f0] md:text-8xl lg:text-[7.5rem]"
          {...fadeUp(0.26)}
        >
          {names}
        </motion.h1>
        <motion.p
          className="mt-5 max-w-xl text-base font-normal leading-relaxed text-[#f7f4f0]/88 md:text-lg"
          {...fadeUp(0.4)}
        >
          {t(siteContent.hero.tagline, locale)}
        </motion.p>
        <motion.div className="mt-8 flex flex-wrap items-center gap-3" {...fadeUp(0.54)}>
          <a href="#rsvp" className="btn-primary-light">
            {t(siteContent.hero.ctaRsvp, locale)}
          </a>
          <a href="#schedule" className="btn-ghost-light">
            {t(siteContent.hero.ctaSchedule, locale)}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
