"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  PWA_SUGGEST_EVENT,
  captureInstallPrompt,
  isIosDevice,
  isLikelyMobile,
  isPwaStandalone,
  markInstallLater,
  markInstallNever,
  markInstalled,
  promptNativeInstall,
  shouldOfferInstallPrompt,
  subscribePwaInstall,
  type BeforeInstallPromptEvent,
  getDeferredInstallPrompt,
} from "@/lib/pwa-install";

const ENGAGE_MS = 28_000;
const ENGAGE_SCROLL_RATIO = 0.42;
const SHOW_DELAY_MS = 480;

type Copy = {
  title: string;
  body: string;
  install: string;
  later: string;
  never: string;
  iosHint: string;
  close: string;
};

/**
 * Invitation soft d’installation PWA (mobile) :
 * différée (temps / scroll / RSVP), 3 choix mémorisés, bottom sheet discret.
 */
export function PwaInstallPrompt({ copy }: { copy: Copy }) {
  const titleId = useId();
  const [eligible, setEligible] = useState(false);
  const [open, setOpen] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [hasDeferred, setHasDeferred] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const engaged = useRef(false);
  const openedOnce = useRef(false);

  useEffect(() => {
    if (isPwaStandalone() || !isLikelyMobile() || !shouldOfferInstallPrompt()) {
      return;
    }

    setEligible(true);
    setIosHint(isIosDevice());
    setHasDeferred(Boolean(getDeferredInstallPrompt()));

    const onBeforeInstall = (event: Event) => {
      captureInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const unsub = subscribePwaInstall(() => {
      setHasDeferred(Boolean(getDeferredInstallPrompt()));
      if (isPwaStandalone() || !shouldOfferInstallPrompt()) {
        setOpen(false);
        setEligible(false);
      }
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!eligible) return;

    const tryOpen = () => {
      if (openedOnce.current) return;
      if (!shouldOfferInstallPrompt() || isPwaStandalone()) return;
      // Android : attendre le prompt natif si possible ; iOS : toujours OK (guide).
      if (!isIosDevice() && !getDeferredInstallPrompt()) return;
      openedOnce.current = true;
      window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    };

    const onEngage = () => {
      if (engaged.current) return;
      engaged.current = true;
      tryOpen();
    };

    const timer = window.setTimeout(onEngage, ENGAGE_MS);

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      if (window.scrollY / max >= ENGAGE_SCROLL_RATIO) onEngage();
    };

    const onSuggest = () => {
      engaged.current = true;
      tryOpen();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(PWA_SUGGEST_EVENT, onSuggest);
    onScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(PWA_SUGGEST_EVENT, onSuggest);
    };
  }, [eligible]);

  // Android : le BIP peut arriver après l’engagement — rouvre si on a déjà engagé.
  useEffect(() => {
    if (!eligible || !hasDeferred || iosHint) return;
    if (engaged.current && !openedOnce.current && shouldOfferInstallPrompt()) {
      openedOnce.current = true;
      window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    }
  }, [eligible, hasDeferred, iosHint]);

  async function onInstall() {
    if (iosHint) {
      setShowIosSteps(true);
      return;
    }
    const result = await promptNativeInstall();
    if (result === "accepted") {
      setOpen(false);
      setEligible(false);
    } else if (result === "dismissed") {
      markInstallLater();
      setOpen(false);
    }
  }

  function onLater() {
    markInstallLater();
    setOpen(false);
  }

  function onNever() {
    markInstallNever();
    setOpen(false);
    setEligible(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        markInstallLater();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Marque installé si l’utilisateur bascule en standalone (après install).
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const onChange = () => {
      if (mq.matches) {
        markInstalled();
        setOpen(false);
        setEligible(false);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (!eligible || !open) return null;

  const canInstall = iosHint || hasDeferred;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
    >
      <div
        className={[
          "mx-auto w-full max-w-md border border-line bg-ivory/95 p-4 shadow-[0_-8px_40px_rgba(59,36,22,0.12)] backdrop-blur-md",
          "supports-[backdrop-filter]:bg-ivory/90 pwa-sheet-in",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow text-[0.65rem]">App</p>
            <h2 id={titleId} className="section-title mt-1 text-xl text-mist">
              {copy.title}
            </h2>
            <p className="mt-2 text-sm font-normal leading-relaxed text-soft">{copy.body}</p>
          </div>
          <button
            type="button"
            onClick={onLater}
            className="shrink-0 px-1 py-0.5 text-lg leading-none text-soft hover:text-mist"
            aria-label={copy.close}
          >
            ×
          </button>
        </div>

        {showIosSteps ? (
          <p className="mt-3 border border-line bg-white/70 px-3 py-2.5 text-sm leading-relaxed text-mist">
            {copy.iosHint}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-2">
          {canInstall ? (
            <button
              type="button"
              onClick={() => void onInstall()}
              className="btn-primary w-full !px-3 !py-2.5 text-[0.7rem]"
            >
              {copy.install}
            </button>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onLater}
              className="btn-ghost min-h-11 flex-1 !px-3 !py-2.5 text-[0.65rem]"
            >
              {copy.later}
            </button>
            <button
              type="button"
              onClick={onNever}
              className="min-h-11 flex-1 px-2 text-[0.65rem] tracking-[0.14em] text-soft uppercase hover:text-champagne"
            >
              {copy.never}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
