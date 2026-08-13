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
 * Bannière soft mobile pour installer la PWA.
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
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      role="presentation"
    >
      <aside
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        className="pwa-install-sheet pointer-events-auto w-full max-w-md border border-line bg-ivory/95 p-4 shadow-[0_-8px_32px_rgba(59,36,22,0.12)] backdrop-blur-md supports-[backdrop-filter]:bg-ivory/90"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p id={titleId} className="text-sm font-medium leading-snug text-mist">
              {copy.title}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-soft">{copy.body}</p>
          </div>
          <button
            type="button"
            onClick={closeLater}
            className="shrink-0 px-1 text-lg leading-none text-soft hover:text-mist"
            aria-label={copy.closeAria}
          >
            ×
          </button>
        </div>

        {showIosHint ? (
          <p className="mt-3 border border-line bg-white/70 px-3 py-2 text-xs leading-relaxed text-mist">
            {copy.iosHint}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void onInstall()}
            disabled={busy}
            className="btn-primary w-full !px-3 !py-2.5 text-[0.68rem] disabled:opacity-60"
          >
            {busy ? "…" : copy.install}
          </button>
          <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
            <button
              type="button"
              onClick={closeLater}
              className="text-[0.65rem] tracking-[0.14em] text-soft uppercase hover:text-champagne"
            >
              {copy.later}
            </button>
            <button
              type="button"
              onClick={closeNever}
              className="text-[0.65rem] tracking-[0.14em] text-soft uppercase hover:text-champagne"
            >
              {copy.never}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
