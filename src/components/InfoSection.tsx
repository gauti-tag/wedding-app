"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { t } from "@/lib/localized";
import type { InfoContent } from "@/lib/info-content";

export function InfoSection({
  info,
  locale,
  dict,
}: {
  info: InfoContent;
  locale: Locale;
  dict: Dictionary;
}) {
  const [openId, setOpenId] = useState<string | null>(info.faqs[0]?.id ?? null);

  return (
    <section id="info" className="border-t border-line py-24 md:py-32">
      <div className="section-shell">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{t(info.eyebrow, locale) || dict.info.eyebrow}</p>
          <h2 className="section-title mt-4 text-4xl text-mist md:text-5xl">
            {t(info.title, locale) || dict.info.title}
          </h2>
          <p className="mt-5 text-base font-normal leading-7 text-soft">
            {t(info.intro, locale) || dict.info.intro}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-2">
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">
              {dict.info.faqLabel}
            </p>
            {info.faqs.length === 0 ? (
              <p className="text-sm text-soft">{dict.info.emptyFaq}</p>
            ) : (
              info.faqs.map((faq) => {
                const open = openId === faq.id;
                return (
                  <div key={faq.id} className="border border-line bg-white/80">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                      aria-expanded={open}
                      onClick={() => setOpenId(open ? null : faq.id)}
                    >
                      <span className="text-sm font-medium text-mist">
                        {t(faq.question, locale)}
                      </span>
                      <span className="text-champagne" aria-hidden>
                        {open ? "−" : "+"}
                      </span>
                    </button>
                    {open ? (
                      <p className="border-t border-line px-4 py-3 text-sm leading-relaxed text-soft whitespace-pre-line">
                        {t(faq.answer, locale)}
                      </p>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-4">
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">
              {dict.info.mapLabel}
            </p>
            {info.places.length === 0 ? (
              <p className="text-sm text-soft">{dict.info.emptyMap}</p>
            ) : (
              info.places.map((place) => (
                <article key={place.id} className="border border-line bg-white/80 p-5">
                  <h3 className="section-title text-xl text-mist">{t(place.name, locale)}</h3>
                  <p className="mt-2 text-sm text-soft">{t(place.address, locale)}</p>
                  {t(place.note, locale) ? (
                    <p className="mt-2 text-sm text-soft">{t(place.note, locale)}</p>
                  ) : null}
                  {place.mapUrl ? (
                    <a
                      href={place.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost mt-4 inline-flex !px-3 !py-2 text-[0.65rem] no-underline"
                    >
                      {dict.info.openMap}
                    </a>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
