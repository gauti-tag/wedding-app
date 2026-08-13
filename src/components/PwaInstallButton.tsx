"use client";

import { useEffect, useState } from "react";
import {
  promptNativeInstall,
  useDeferredInstallPrompt,
} from "@/lib/pwa-deferred-prompt";
import {
  dismissPwaInstallNever,
  isIosDevice,
  isMobileViewport,
  isStandaloneDisplay,
} from "@/lib/pwa-install";

export function PwaInstallButton({
  label,
  iosHint,
}: {
  label: string;
  iosHint?: string;
}) {
  const deferred = useDeferredInstallPrompt();
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay()) {
      setVisible(false);
      return;
    }
    const iosDevice = isIosDevice();
    setIos(iosDevice);
    // Footer : toujours proposé hors mode installé (même après « ne plus demander »).
    if (iosDevice || isMobileViewport() || deferred) {
      setVisible(true);
    }
  }, [deferred]);

  async function onInstall() {
    if (ios && !deferred) {
      window.alert(iosHint || "Sur iPhone / iPad : Partager → Sur l’écran d’accueil.");
      return;
    }
    const outcome = await promptNativeInstall();
    if (outcome === "accepted") {
      dismissPwaInstallNever();
      setVisible(false);
    } else if (outcome === "unavailable" && ios) {
      window.alert(iosHint || "Sur iPhone / iPad : Partager → Sur l’écran d’accueil.");
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
