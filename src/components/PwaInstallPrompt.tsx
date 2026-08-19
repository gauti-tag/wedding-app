"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PwaBannerCard } from "@/components/PwaBannerCard";
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
import {
  pwaBannerPlacementShellClass,
  type ResolvedPwaBannerCopy,
} from "@/lib/pwa-banner";
import type { PwaBannerSettings } from "@/lib/types";

const ENGAGE_SCROLL_RATIO = 0.42;
const SHOW_DELAY_MS = 480;

/**
 * Bannière PWA compacte : textes, forme et emplacement pilotés par l’admin.
 */
export function PwaInstallPrompt({
  copy,
  settings,
}: {
  copy: ResolvedPwaBannerCopy;
  settings: PwaBannerSettings;
}) {
  const titleId = useId();
  const [eligible, setEligible] = useState(false);
  const [open, setOpen] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [hasDeferred, setHasDeferred] = useState(false);
  const [showManualSteps, setShowManualSteps] = useState(false);
  const [manualHint, setManualHint] = useState("");
  const [installBusy, setInstallBusy] = useState(false);
  const engaged = useRef(false);
  const openedOnce = useRef(false);

  useEffect(() => {
    if (!settings.enabled) return;
    if (isPwaStandalone()) return;
    if (settings.mobileOnly && !isLikelyMobile()) return;
    if (!shouldOfferInstallPrompt()) return;

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
  }, [settings.enabled, settings.mobileOnly]);

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

    const timer = window.setTimeout(onEngage, settings.engageMs);

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
  }, [eligible, settings.engageMs]);

  useEffect(() => {
    if (!eligible || !hasDeferred || iosHint) return;
    if (engaged.current && !openedOnce.current && shouldOfferInstallPrompt()) {
      openedOnce.current = true;
      window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    }
  }, [eligible, hasDeferred, iosHint]);

  async function onInstall() {
    if (installBusy) return;
    if (iosHint) {
      setManualHint(copy.iosHint);
      setShowManualSteps(true);
      return;
    }
    setInstallBusy(true);
    try {
      const result = await promptNativeInstall();
      if (result === "accepted") {
        setOpen(false);
        setEligible(false);
        return;
      }
      if (result === "dismissed") {
        markInstallLater();
        setOpen(false);
        return;
      }
      setManualHint(
        copy.locale === "en"
          ? "Chrome menu (⋮) → Install app / Add to Home screen."
          : "Menu Chrome (⋮) → Installer l’application / Ajouter à l’écran d’accueil.",
      );
      setShowManualSteps(true);
    } finally {
      setInstallBusy(false);
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

  if (!settings.enabled || !eligible || !open) return null;

  const canInstall = iosHint || hasDeferred;

  return (
    <div
      className={pwaBannerPlacementShellClass(settings.placement)}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
    >
      <PwaBannerCard
        copy={copy}
        settings={settings}
        showIosSteps={showManualSteps}
        stepsText={manualHint || copy.iosHint}
        showInstallButton={canInstall && !installBusy}
        titleId={titleId}
        className="pointer-events-auto pwa-sheet-in"
        onInstall={() => void onInstall()}
        onLater={onLater}
        onNever={onNever}
        onClose={onLater}
      />
    </div>
  );
}
