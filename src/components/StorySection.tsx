import { Reveal } from "@/components/Reveal";
import { StoryScriptureBlock } from "@/components/StoryScriptureBlock";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { t } from "@/lib/localized";
import { hasVisibleScripture } from "@/lib/story-scripture";
import type { Photo, StoryContent } from "@/lib/types";

type StoryPhotoItem = {
  id: string;
  url: string;
  caption: string;
};

function StoryPhotoTile({
  photo,
  photoAlt,
  uploadHint,
  index,
  className = "",
}: {
  photo: StoryPhotoItem;
  photoAlt: string;
  uploadHint: string;
  index: number;
  className?: string;
}) {
  const spanClass = index === 0 ? "col-span-2" : "";
  const placeholderAspect = index === 0 ? "aspect-[16/10]" : "aspect-[4/5]";

  return (
    <div
      className={`relative overflow-hidden border border-line bg-forest/60 ${spanClass} ${className}`}
    >
      {photo.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt={photo.caption || photoAlt}
          className="block h-auto w-full max-w-full object-contain"
          draggable={false}
          decoding="async"
        />
      ) : (
        <div className={`flex h-full w-full items-end bg-[linear-gradient(145deg,#efe8e0,#e5d9cc_40%,#d4c0a8)] p-4 ${placeholderAspect}`}>
          <span className="text-xs tracking-[0.18em] text-champagne uppercase">
            {photo.caption} — {uploadHint}
          </span>
        </div>
      )}
    </div>
  );
}

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
  const storyPhotos = photos
    .filter((p) => p.album === "story")
    .sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt))
    .slice(0, 3);

  const items: StoryPhotoItem[] = storyPhotos.length
    ? storyPhotos.map((p) => ({
        id: p.id,
        url: p.url,
        caption: p.caption,
      }))
    : dict.story.placeholders.map((caption, index) => ({
        id: `placeholder-${index}`,
        url: "",
        caption,
      }));

  const showScripture = hasVisibleScripture(story.scripture, locale);
  const heroPhoto = items[0];

  return (
    <section id="story" className="site-section">
      <div
        className={`section-shell site-section-blocks${showScripture ? " site-section-blocks--separated" : ""}`}
      >
        <StoryScriptureBlock
          block={story.scripture}
          locale={locale}
          fallbackEyebrow={dict.story.scriptureEyebrow}
        />

        <div className="site-section-grid items-center lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal className="site-section-head">
            <p className="eyebrow">{t(story.eyebrow, locale)}</p>
            <h2 className="section-title text-4xl text-mist md:text-5xl">
              {t(story.title, locale)}
            </h2>

            {heroPhoto ? (
              <Reveal delay={0.06} className="site-section-body lg:hidden">
                <StoryPhotoTile
                  photo={heroPhoto}
                  photoAlt={dict.story.photoAlt}
                  uploadHint={dict.story.uploadHint}
                  index={0}
                  className="!col-span-1 w-full"
                />
              </Reveal>
            ) : null}

            <div className="divider site-section-divider" />
            <p className="max-w-xl whitespace-pre-line text-base font-normal leading-8 text-soft md:text-lg">
              {t(story.body, locale)}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {items.map((photo, index) => (
                <StoryPhotoTile
                  key={photo.id}
                  photo={photo}
                  photoAlt={dict.story.photoAlt}
                  uploadHint={dict.story.uploadHint}
                  index={index}
                  className={index === 0 ? "hidden lg:block" : undefined}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
