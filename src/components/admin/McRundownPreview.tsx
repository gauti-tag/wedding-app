import type { ResolvedMcCue } from "@/lib/mc-rundown";
import type { McRundownContent } from "@/lib/types";

export function McRundownPreview({
  rundown,
  coupleNames,
  dateLabel,
  cues,
  compact = false,
}: {
  rundown: McRundownContent;
  coupleNames: string;
  dateLabel: string;
  cues: ResolvedMcCue[];
  compact?: boolean;
}) {
  return (
    <article
      className={`relative overflow-hidden border border-line bg-ivory text-mist shadow-sm ${
        compact ? "px-5 py-6" : "px-7 py-8 md:px-10 md:py-10"
      }`}
    >
      <div className="absolute inset-y-0 left-0 w-1.5 bg-cacao" aria-hidden />

      <p className="pl-3 text-[0.62rem] tracking-[0.22em] text-champagne uppercase">
        Feuille de route · Maître de cérémonie
      </p>
      <h3 className={`couple-name pl-3 text-mist ${compact ? "mt-2 text-3xl" : "mt-3 text-4xl"}`}>
        {coupleNames}
      </h3>
      <p className="meta-date mt-2 pl-3 text-xs tracking-[0.16em] text-soft uppercase">
        {dateLabel}
      </p>
      <p className={`pl-3 font-medium text-mist ${compact ? "mt-3 text-lg" : "mt-4 text-xl"}`}>
        {rundown.title || "Feuille de route MC"}
      </p>
      {rundown.notes ? (
        <p className="mt-3 whitespace-pre-line pl-3 text-sm leading-relaxed text-soft">
          {rundown.notes}
        </p>
      ) : null}

      <div className="mt-5 border-t border-line pl-3 pt-4">
        {cues.length === 0 ? (
          <p className="text-sm text-soft">Aucun passage pour le moment.</p>
        ) : (
          <ol className="space-y-4">
            {cues.map((cue) => (
              <li key={cue.id} className="border-b border-line/70 pb-3 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="font-medium tracking-wide text-mist">
                    {cue.startLabel} → {cue.endLabel}
                  </p>
                  <p className="text-xs tracking-[0.12em] text-champagne uppercase">
                    {cue.durationMinutes} min
                    {cue.owner ? ` · ${cue.owner}` : ""}
                  </p>
                </div>
                <p className="mt-1 text-base text-mist">{cue.label || "Passage sans libellé"}</p>
                {cue.notes ? (
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-soft">
                    {cue.notes}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>

      <p className="mt-6 pl-3 text-[0.62rem] tracking-[0.16em] text-soft/80 uppercase">
        Document interne — ne pas diffuser aux invités
      </p>
    </article>
  );
}
