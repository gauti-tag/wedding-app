"use client";

import { useEffect, useId, useState } from "react";
import {
  promptNativeInstall,
  useDeferredInstallPrompt,
} from "@/lib/pwa-deferred-prompt";
import {
  canOfferPwaInstall,
  dismissPwaInstallLater,
  dismissPwaInstallNever,
  isIosDevice,
  isStandaloneDisplay,
} from "@/lib/pwa-install";

const ENGAGE_DELAY_MS = 28_000;
const ENGAGE_SCROLL_PX = 320;

type Copy = {
  title: string;
  body: string;
  install: string;
  later: string;
  never: string;
  iosHint: string;
  closeAria: string;
};

/**
 * Barre minimale mobile pour installer la PWA.
 * Différée (temps + scroll), mémorise « plus tard » / « ne plus demander ».
 */
export function PwaInstallPrompt({ copy }: { copy: Copy }) {
  const titleId = useId();
  const deferred = useDeferredInstallPrompt();
  const [open, setOpen] = useState(false);
  const [ios, setIos] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandaloneDisplay()) return;
    if (!canOfferPwaInstall()) return;

    setIos(isIosDevice());

    let shown = false;
    const tryShow = () => {
      if (shown || !canOfferPwaInstall()) return;
      shown = true;
      setOpen(true);
    };

    const onScroll = () => {
      if (window.scrollY >= ENGAGE_SCROLL_PX) tryShow();
    };

    const timer = window.setTimeout(tryShow, ENGAGE_DELAY_MS);

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const canNative = Boolean(deferred);

  function closeLater() {
    dismissPwaInstallLater();
    setOpen(false);
    setShowIosHint(false);
  }

  function closeNever() {
    dismissPwaInstallNever();
    setOpen(false);
    setShowIosHint(false);
  }

  async function onInstall() {
    if (ios && !canNative) {
      setShowIosHint(true);
      return;
    }
    setBusy(true);
    try {
      const outcome = await promptNativeInstall();
      if (outcome === "accepted") {
        dismissPwaInstallNever();
        setOpen(false);
      } else if (outcome === "unavailable") {
        setShowIosHint(true);
      } else {
        dismissPwaInstallLater();
        setOpen(false);
      }
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
      role="presentation"
    >
      <aside
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-describedby={showIosHint ? `${titleId}-hint` : undefined}
        className="pwa-install-sheet pointer-events-auto w-full max-w-sm border border-line/55 bg-ivory/80 px-3 py-2.5 shadow-[0_-4px_20px_rgba(59,36,22,0.08)] backdrop-blur-sm supports-[backdrop-filter]:bg-ivory/70"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <p
            id={titleId}
            className="min-w-0 flex-1 truncate text-[0.72rem] leading-none text-mist"
            title={copy.body}
          >
            {copy.title}
          </p>
          <button
            type="button"
            onClick={() => void onInstall()}
            disabled={busy}
            className="shrink-0 text-[0.62rem] tracking-[0.16em] text-champagne uppercase hover:text-mist disabled:opacity-50"
          >
            {busy ? "…" : copy.install}
          </button>
          <button
            type="button"
            onClick={closeLater}
            className="shrink-0 text-[0.62rem] tracking-[0.12em] text-soft uppercase hover:text-mist"
          >
            {copy.later}
          </button>
          <button
            type="button"
            onClick={closeNever}
            className="shrink-0 text-[0.58rem] tracking-[0.1em] text-soft/65 uppercase hover:text-soft"
            title={copy.never}
          >
            {copy.never}
          </button>
        </div>

        {showIosHint ? (
          <p
            id={`${titleId}-hint`}
            className="mt-1.5 truncate text-[0.65rem] leading-snug text-soft"
          >
            {copy.iosHint}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
