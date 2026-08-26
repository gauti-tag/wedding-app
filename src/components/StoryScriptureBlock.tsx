import { Reveal } from "@/components/Reveal";
import type { Locale } from "@/i18n/config";
import { t } from "@/lib/localized";
import { defaultStoryScriptureEyebrow, hasVisibleScripture } from "@/lib/story-scripture";
import type { StoryScriptureBlock } from "@/lib/types";

export function StoryScriptureBlock({
  block,
  locale,
  fallbackEyebrow,
}: {
  block: StoryScriptureBlock;
  locale: Locale;
  fallbackEyebrow: string;
}) {
  if (!hasVisibleScripture(block, locale)) return null;

  const eyebrow =
    t(block.eyebrow, locale).trim() ||
    t(defaultStoryScriptureEyebrow(), locale).trim() ||
    fallbackEyebrow;

  const references = block.references.filter(
    (ref) =>
      (t(ref.text, locale).trim() || t(ref.reference, locale).trim()),
  );

  return (
    <Reveal>
      <article className="relative mx-auto max-w-3xl border border-line bg-forest/80 px-6 py-10 text-center md:px-12 md:py-14">
          <div
            className="pointer-events-none absolute top-4 left-4 h-7 w-7 border-t border-l border-champagne/40"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute top-4 right-4 h-7 w-7 border-t border-r border-champagne/40"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-4 left-4 h-7 w-7 border-b border-l border-champagne/40"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-4 bottom-4 h-7 w-7 border-r border-b border-champagne/40"
            aria-hidden
          />

          <p className="eyebrow text-champagne">{eyebrow}</p>

          <div className="site-section-verse-stack">
            {references.map((ref, index) => {
              const text = t(ref.text, locale).trim();
              const reference = t(ref.reference, locale).trim();
              if (!text && !reference) return null;

              return (
                <figure key={ref.id} className="site-section-stack">
                  {text ? (
                    <blockquote className="scripture-quote">
                      <span className="text-champagne/70 not-italic" aria-hidden>
                        «{" "}
                      </span>
                      {text}
                      <span className="text-champagne/70 not-italic" aria-hidden>
                        {" "}
                        »
                      </span>
                    </blockquote>
                  ) : null}
                  {reference ? (
                    <figcaption className="meta-date text-sm tracking-[0.2em] text-soft uppercase">
                      — {reference}
                    </figcaption>
                  ) : null}
                  {index < references.length - 1 ? (
                    <div className="divider mx-auto my-2 w-16" aria-hidden />
                  ) : null}
                </figure>
              );
            })}
          </div>
        </article>
    </Reveal>
  );
}
