"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseLocalDateTime } from "@/lib/rsvp-deadline";
import type { ThanksMode } from "@/lib/thanks-page";

const WINDOW_MS = 36 * 60 * 60 * 1000;

/** Bascule l’invitation vers la page de remerciement à l’heure prévue. */
export function ThanksHandoff({ opensAt, mode }: { opensAt: string; mode: ThanksMode }) {
  const router = useRouter();

  useEffect(() => {
    if (mode !== "auto") return;
    const opens = parseLocalDateTime(opensAt);
    if (!opens) return;
    const remaining = opens.getTime() - Date.now();
    if (remaining <= 0) {
      router.refresh();
      return;
    }
    if (remaining > WINDOW_MS) return;
    const id = window.setInterval(() => {
      if (Date.now() >= opens.getTime()) {
        window.clearInterval(id);
        router.refresh();
      }
    }, 15000);
    return () => window.clearInterval(id);
  }, [mode, opensAt, router]);

  return null;
}
