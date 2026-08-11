import { Reveal } from "@/components/Reveal";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { t } from "@/lib/localized";
import type { Photo, StoryContent } from "@/lib/types";

export function StorySection({
  photos,
  story,
  locale,
  dict,
}: {
  photos: Photo[];
  story: StoryContent;
  locale: Locale;
  dict: Dictionary;
}) {
  const storyPhotos = photos.filter((p) => p.album === "story").slice(0, 3);

  return (
    <section id="story" className="py-24 md:py-32">
      <div className="section-shell grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal>
          <p className="eyebrow">{t(story.eyebrow, locale)}</p>
          <h2 className="section-title mt-4 text-4xl text-mist md:text-5xl">
            {t(story.title, locale)}
          </h2>
          <div className="divider my-7" />
          <p className="max-w-xl whitespace-pre-line text-base font-normal leading-8 text-soft md:text-lg">
            {t(story.body, locale)}
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {(storyPhotos.length
              ? storyPhotos
              : dict.story.placeholders.map((caption, index) => ({
                  id: `placeholder-${index}`,
                  url: "",
                  caption,
                }))
            ).map((photo, index) => (
              <div
                key={photo.id}
                className={`relative overflow-hidden border border-line bg-forest/60 ${
                  index === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[4/5]"
                }`}
              >
                {photo.url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.caption || dict.story.photoAlt}
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cacao/15 via-cacao/25 to-cacao/55 md:from-cacao/25 md:via-cacao/45 md:to-cacao/90" />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(59,36,22,0.28),transparent_50%,rgba(59,36,22,0.16))] md:bg-[linear-gradient(90deg,rgba(59,36,22,0.45),transparent_50%,rgba(59,36,22,0.25))]" />
                  </>
                ) : (
                  <div className="flex h-full w-full items-end bg-[linear-gradient(145deg,#efe8e0,#e5d9cc_40%,#d4c0a8)] p-4">
                    <span className="text-xs tracking-[0.18em] text-champagne uppercase">
                      {photo.caption} — {dict.story.uploadHint}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
