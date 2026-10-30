import { GuestAlbumSection } from "@/components/GuestAlbumSection";
import { GuestbookSection } from "@/components/GuestbookSection";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { GuestAlbumContent } from "@/lib/guest-album";
import type { GuestbookContent } from "@/lib/guestbook";
import { t } from "@/lib/localized";
import type { ThanksPageContent } from "@/lib/thanks-page";
import type { ScheduleContent, SiteContent } from "@/lib/types";

export function ThanksPage({
  content,
  siteContent,
  locale,
  dict,
  schedule,
  guestbook,
  guestAlbum,
  preview = false,
}: {
  content: ThanksPageContent;
  siteContent: Pick<SiteContent, "partnerOne" | "partnerTwo" | "hero">;
  locale: Locale;
  dict: Dictionary;
  schedule: ScheduleContent;
  guestbook: GuestbookContent;
  guestAlbum: GuestAlbumContent;
  preview?: boolean;
}) {
  const names = [siteContent.partnerOne, siteContent.partnerTwo].filter(Boolean).join(" & ");
  const dateLabel =
    t(siteContent.hero.weddingDateLabel, locale) || "";
  const dayTitle = locale === "en" ? "Revisit the day" : "Revoir la journée";

  return (
    <div className="bg-ivory text-mist">
      <header className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
        {dateLabel ? <p className="eyebrow">{dateLabel}</p> : null}
        <h1 className="section-title mt-4 text-5xl text-mist md:text-7xl">
          {t(content.title, locale)}
        </h1>
        {names ? <p className="mt-5 text-lg text-soft md:text-xl">{names}</p> : null}
        {t(content.phrase, locale) ? (
          <p className="mx-auto mt-8 max-w-xl text-xl leading-relaxed text-mist md:text-2xl">
            {t(content.phrase, locale)}
          </p>
        ) : null}
      </header>

      {t(content.letter, locale) ? (
        <section className="mx-auto max-w-xl px-5 pb-16">
          <p className="whitespace-pre-line text-base leading-8 text-soft">
            {t(content.letter, locale)}
          </p>
        </section>
      ) : null}

      <GuestAlbumSection
        initial={guestAlbum}
        locale={locale}
        dict={dict}
        readOnly={preview}
      />
      <GuestbookSection
        initial={guestbook}
        locale={locale}
        dict={dict}
        readOnly={preview}
      />

      {content.showSchedule && schedule.venues.length > 0 ? (
        <section className="site-section site-section--border-t">
          <div className="section-shell max-w-xl">
            <p className="eyebrow">{dayTitle}</p>
            <ul className="mt-6 space-y-4">
              {schedule.venues.map((venue) => (
                <li key={venue.id} className="border-t border-line pt-4">
                  <p className="text-sm text-mist">{t(venue.title, locale)}</p>
                  <p className="mt-1 text-xs text-soft">
                    {[t(venue.time, locale), t(venue.place, locale)].filter(Boolean).join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <footer className="px-5 py-16 text-center">
        <p className="text-sm text-soft">{t(content.closing, locale)}</p>
        {names ? <p className="mt-2 text-base text-mist">{names}</p> : null}
      </footer>
    </div>
  );
}
