"use client";

import { FormEvent, useState } from "react";
import { Reveal } from "@/components/Reveal";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { t } from "@/lib/localized";
import type { GuestbookContent, GuestbookEntry } from "@/lib/guestbook";

export function GuestbookSection({
  initial,
  locale,
  dict,
}: {
  initial: GuestbookContent;
  locale: Locale;
  dict: Dictionary;
}) {
  const [entries, setEntries] = useState(
    initial.entries.filter((e) => e.status === "approved"),
  );
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error || dict.guestbook.error);
        return;
      }
      const entry = data.entry as GuestbookEntry | undefined;
      if (entry?.status === "approved") {
        setEntries((prev) => [entry, ...prev]);
      }
      setName("");
      setMessage("");
      setFeedback(
        data.pending ? dict.guestbook.pending : dict.guestbook.success,
      );
    } catch {
      setFeedback(dict.guestbook.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="guestbook" className="border-t border-line bg-forest/50 py-24 md:py-32">
      <div className="section-shell grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Reveal>
          <p className="eyebrow">{t(initial.eyebrow, locale) || dict.guestbook.eyebrow}</p>
          <h2 className="section-title mt-4 text-4xl text-mist md:text-5xl">
            {t(initial.title, locale) || dict.guestbook.title}
          </h2>
          <p className="mt-5 text-base font-normal leading-7 text-soft">
            {t(initial.intro, locale) || dict.guestbook.intro}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4 border border-line bg-white/80 p-5">
            <div>
              <label className="label" htmlFor="gb-name">
                {dict.guestbook.name}
              </label>
              <input
                id="gb-name"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
              />
            </div>
            <div>
              <label className="label" htmlFor="gb-message">
                {dict.guestbook.message}
              </label>
              <textarea
                id="gb-message"
                className="field min-h-28 resize-y"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                maxLength={1000}
              />
            </div>
            <button type="submit" className="btn-primary disabled:opacity-60" disabled={busy}>
              {busy ? dict.guestbook.sending : dict.guestbook.submit}
            </button>
            {feedback ? <p className="text-sm text-soft">{feedback}</p> : null}
          </form>
        </Reveal>

        <div className="space-y-4">
          {entries.length === 0 ? (
            <p className="text-sm text-soft">{dict.guestbook.empty}</p>
          ) : (
            entries.map((entry) => (
              <article key={entry.id} className="border border-line bg-white/80 p-5">
                <p className="text-sm font-medium text-mist">{entry.name}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-soft">
                  {entry.message}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
