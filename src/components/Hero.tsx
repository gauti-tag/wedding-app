"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HeroCarouselBackground } from "@/components/HeroCarouselBackground";
import type { Locale } from "@/i18n/config";
import { normalizeHeroCarousel } from "@/lib/hero-carousel";
import { t } from "@/lib/localized";
import { eventLabel } from "@/lib/site";
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
  const names = eventLabel(siteContent, locale);
  const carousel = normalizeHeroCarousel(siteContent.heroCarousel);
  const features = siteContent.features;

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
    <section id="top" className="relative h-dvh min-h-svh w-full max-w-full overflow-hidden scroll-mt-0">
      <div className="absolute inset-0 overflow-hidden bg-cacao">
        <HeroCarouselBackground
          photos={heroPhotos}
          settings={carousel}
          fallbackAlt={names}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cacao/30 via-cacao/40 to-cacao/88" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(59,36,22,0.42),transparent_52%,rgba(59,36,22,0.22))]" />
      </div>

      <div className="hero-copy section-shell relative z-10 flex h-full min-h-svh min-w-0 flex-col justify-end pb-16 pt-28 md:pb-20">
        <motion.p
          className="meta-date max-w-full text-[0.72rem] tracking-[0.16em] text-[#f7f4f0]/90 uppercase md:tracking-[0.28em]"
          {...fadeUp(0.12)}
        >
          {t(siteContent.hero.weddingDateLabel, locale)}
        </motion.p>
        <motion.h1
          className="couple-name mt-4 w-full min-w-0 max-w-full text-[clamp(2.65rem,11vw,3.75rem)] leading-[1.1] break-words text-[#f7f4f0] md:text-8xl lg:max-w-4xl lg:text-[7.5rem]"
          {...fadeUp(0.26)}
        >
          {names}
        </motion.h1>
        <motion.p
          className="mt-5 max-w-full text-base font-normal leading-relaxed break-words text-[#f7f4f0]/88 md:max-w-xl md:text-lg"
          {...fadeUp(0.4)}
        >
          {t(siteContent.hero.tagline, locale)}
        </motion.p>
        <motion.div className="mt-8 flex w-full min-w-0 max-w-full flex-wrap items-center gap-3" {...fadeUp(0.54)}>
          {features.enabled.rsvp ? (
            <a href="#rsvp" className="btn-primary-light">
              {t(siteContent.hero.ctaRsvp, locale)}
            </a>
          ) : null}
          {features.enabled.schedule ? (
            <a href="#schedule" className="btn-ghost-light">
              {t(siteContent.hero.ctaSchedule, locale)}
            </a>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
