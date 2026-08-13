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
 * Bannière PWA compacte (mobile) : peu d’espace, verre soft, 3 choix mémorisés.
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
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] px-2.5 pb-[max(0.4rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
    >
      <div className="pwa-banner pointer-events-auto mx-auto w-full max-w-md pwa-sheet-in">
        <div className="flex items-center gap-2.5">
          <span
            className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne/70"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p id={titleId} className="truncate text-[0.8rem] font-medium leading-tight text-mist">
              {copy.title}
            </p>
            {!showIosSteps ? (
              <p className="mt-0.5 truncate text-[0.68rem] leading-tight text-soft/85">
                {copy.body}
              </p>
            ) : null}
          </div>

          {canInstall && !showIosSteps ? (
            <button
              type="button"
              onClick={() => void onInstall()}
              className="shrink-0 border border-cacao/25 bg-cacao/90 px-2.5 py-1.5 text-[0.62rem] font-semibold tracking-[0.12em] text-ivory uppercase transition-colors hover:bg-cacao"
            >
              {copy.install}
            </button>
          ) : null}

          <button
            type="button"
            onClick={onLater}
            className="shrink-0 px-1 py-1 text-[1.05rem] leading-none text-soft/70 transition-colors hover:text-mist"
            aria-label={copy.close}
          >
            ×
          </button>
        </div>

        {showIosSteps ? (
          <p className="mt-2 border-t border-line/60 pt-2 text-[0.7rem] leading-snug text-mist/90">
            {copy.iosHint}
          </p>
        ) : null}

        <div className="mt-1.5 flex items-center gap-3 pl-4">
          <button
            type="button"
            onClick={onLater}
            className="text-[0.58rem] tracking-[0.14em] text-soft/75 uppercase transition-colors hover:text-champagne"
          >
            {copy.later}
          </button>
          <span className="text-soft/35" aria-hidden>
            ·
          </span>
          <button
            type="button"
            onClick={onNever}
            className="text-[0.58rem] tracking-[0.14em] text-soft/75 uppercase transition-colors hover:text-champagne"
          >
            {copy.never}
          </button>
        </div>
      </div>
    </div>
  );
}
