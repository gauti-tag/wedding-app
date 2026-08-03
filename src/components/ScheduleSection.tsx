import { Countdown } from "@/components/Countdown";
import { Reveal } from "@/components/Reveal";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { t } from "@/lib/localized";
import type { ScheduleContent } from "@/lib/types";

export function ScheduleSection({
  schedule,
  weddingDate,
  locale,
  dict,
}: {
  schedule: ScheduleContent;
  weddingDate: string;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <section id="schedule" className="border-y border-line bg-forest/80 py-24 md:py-32">
      <div className="section-shell">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{t(schedule.eyebrow, locale)}</p>
          <h2 className="section-title mt-4 text-4xl text-mist md:text-5xl">
            {t(schedule.title, locale)}
          </h2>
          <p className="mt-5 whitespace-pre-line text-base font-normal leading-7 text-soft">
            {t(schedule.dressCode, locale)}
          </p>
          <div className="mt-8 max-w-md border-t border-line pt-6">
            <Countdown targetDate={weddingDate} labels={dict.countdown} />
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {schedule.venues.map((venue, index) => (
            <Reveal key={venue.id} delay={index * 0.1}>
              <article className="border border-line bg-white/80 p-7 md:p-9">
                <p className="meta-date text-xs tracking-[0.22em] text-gold uppercase">
                  {t(venue.time, locale)}
                </p>
                <h3 className="section-title mt-3 text-2xl text-mist md:text-3xl">
                  {t(venue.title, locale)}
                </h3>
                <p className="mt-4 font-medium text-champagne">{t(venue.place, locale)}</p>
                <p className="mt-1 text-sm font-normal text-soft">{t(venue.address, locale)}</p>
                {venue.mapUrl ? (
                  <a
                    href={venue.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-block text-xs tracking-[0.18em] text-champagne uppercase no-underline hover:text-mist"
                  >
                    {t(schedule.directions, locale)}
                  </a>
                ) : null}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
