"use client";

import { useEffect, useState } from "react";
import {
  captureInstallPrompt,
  getDeferredInstallPrompt,
  isIosDevice,
  isPwaStandalone,
  markInstalled,
  promptNativeInstall,
  subscribePwaInstall,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa-install";

export function PwaInstallButton({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isPwaStandalone()) return;

    const ios = isIosDevice();
    setIosHint(ios);

    const sync = () => {
      if (isPwaStandalone()) {
        setVisible(false);
        return;
      }
      setVisible(ios || Boolean(getDeferredInstallPrompt()));
    };

    sync();

    const onBeforeInstall = (event: Event) => {
      captureInstallPrompt(event as BeforeInstallPromptEvent);
      sync();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    const unsub = subscribePwaInstall(sync);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      unsub();
    };
  }, []);

  async function onInstall() {
    if (iosHint) {
      window.alert(
        "Sur iPhone / iPad : bouton Partager (carré + flèche) → « Sur l’écran d’accueil » → Ajouter.",
      );
      return;
    }
    const result = await promptNativeInstall();
    if (result === "accepted") {
      markInstalled();
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => void onInstall()}
      className="text-xs tracking-[0.18em] text-champagne uppercase no-underline hover:text-mist"
    >
      {label}
    </button>
  );
}
