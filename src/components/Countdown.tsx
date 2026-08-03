"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/types";

type Unit = { label: string; value: number };

function getUnits(targetDate: string, labels: Dictionary["countdown"]): Unit[] {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  return [
    { label: labels.days, value: Math.floor(diff / (1000 * 60 * 60 * 24)) },
    { label: labels.hours, value: Math.floor((diff / (1000 * 60 * 60)) % 24) },
    { label: labels.minutes, value: Math.floor((diff / (1000 * 60)) % 60) },
    { label: labels.seconds, value: Math.floor((diff / 1000) % 60) },
  ];
}

export function Countdown({
  targetDate,
  labels,
  compact = false,
}: {
  targetDate: string;
  labels: Dictionary["countdown"];
  compact?: boolean;
}) {
  const [units, setUnits] = useState<Unit[] | null>(null);

  useEffect(() => {
    setUnits(getUnits(targetDate, labels));
    const id = window.setInterval(() => setUnits(getUnits(targetDate, labels)), 1000);
    return () => window.clearInterval(id);
  }, [targetDate, labels]);

  const display =
    units ??
    [
      { label: labels.days, value: 0 },
      { label: labels.hours, value: 0 },
      { label: labels.minutes, value: 0 },
      { label: labels.seconds, value: 0 },
    ];

  return (
    <div
      className={compact ? "flex items-end gap-2.5" : "grid grid-cols-4 gap-3 md:gap-5"}
      suppressHydrationWarning
    >
      {display.map((unit) => (
        <div key={unit.label} className="text-center">
          <div
            className={
              compact
                ? "meta-date text-sm leading-none text-mist"
                : "meta-date text-3xl text-mist md:text-5xl"
            }
            suppressHydrationWarning
          >
            {String(unit.value).padStart(2, "0")}
          </div>
          <div
            className={
              compact
                ? "meta-date mt-0.5 text-[0.55rem] tracking-[0.14em] text-soft uppercase"
                : "meta-date mt-1 text-[0.65rem] tracking-[0.2em] text-soft uppercase"
            }
          >
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}
