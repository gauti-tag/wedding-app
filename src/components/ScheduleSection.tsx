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
  showCountdown = true,
}: {
  schedule: ScheduleContent;
  weddingDate: string;
  locale: Locale;
  dict: Dictionary;
  showCountdown?: boolean;
}) {
  return (
    <section id="schedule" className="site-section site-section--border-y bg-forest/80">
      <div className="section-shell">
        <Reveal className="site-section-head max-w-2xl">
          <p className="eyebrow">{t(schedule.eyebrow, locale)}</p>
          <h2 className="section-title text-4xl text-mist md:text-5xl">
            {t(schedule.title, locale)}
          </h2>
          <p className="site-section-lead whitespace-pre-line">
            {t(schedule.dressCode, locale)}
          </p>
          {showCountdown ? (
            <div className="site-section-aside max-w-md">
              <Countdown targetDate={weddingDate} labels={dict.countdown} />
            </div>
          ) : null}
        </Reveal>

        <div className="site-section-body site-section-cards md:grid-cols-2">
          {schedule.venues.map((venue, index) => (
            <Reveal key={venue.id} delay={index * 0.1}>
              <article className="site-section-card">
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
