import type { HeroCarouselEffect, HeroCarouselSettings } from "@/lib/types";

export const MAX_HERO_PHOTOS = 6;

export const defaultHeroCarousel: HeroCarouselSettings = {
  autoplay: true,
  intervalMs: 5500,
  transitionMs: 1200,
  effect: "fade",
  kenBurns: true,
  pauseOnHover: true,
};

const effects: HeroCarouselEffect[] = ["fade", "slide", "zoom"];

export function normalizeHeroCarousel(
  raw?: Partial<HeroCarouselSettings> | null,
): HeroCarouselSettings {
  const intervalMs = Number(raw?.intervalMs);
  const transitionMs = Number(raw?.transitionMs);
  const effect = effects.includes(raw?.effect as HeroCarouselEffect)
    ? (raw!.effect as HeroCarouselEffect)
    : defaultHeroCarousel.effect;

  return {
    autoplay: raw?.autoplay ?? defaultHeroCarousel.autoplay,
    intervalMs: Number.isFinite(intervalMs)
      ? Math.min(15000, Math.max(2500, Math.round(intervalMs)))
      : defaultHeroCarousel.intervalMs,
    transitionMs: Number.isFinite(transitionMs)
      ? Math.min(3000, Math.max(400, Math.round(transitionMs)))
      : defaultHeroCarousel.transitionMs,
    effect,
    kenBurns: raw?.kenBurns ?? defaultHeroCarousel.kenBurns,
    pauseOnHover: raw?.pauseOnHover ?? defaultHeroCarousel.pauseOnHover,
  };
}
