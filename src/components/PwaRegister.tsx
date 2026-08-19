"use client";

import { useEffect } from "react";
import {
  captureInstallPrompt,
  hydrateDeferredFromWindow,
  markInstalled,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa-install";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    hydrateDeferredFromWindow();

    const onBeforeInstall = (event: Event) => {
      captureInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onCaptured = () => hydrateDeferredFromWindow();
    const onInstalled = () => markInstalled();

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("pwa-install:captured", onCaptured);
    window.addEventListener("pwa-install:installed", onInstalled);
    window.addEventListener("appinstalled", onInstalled);

    if (!("serviceWorker" in navigator)) {
      return () => {
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.removeEventListener("pwa-install:captured", onCaptured);
        window.removeEventListener("pwa-install:installed", onInstalled);
        window.removeEventListener("appinstalled", onInstalled);
      };
    }

    // En dev : désinstaller le SW pour éviter les chunks Next.js périmés.
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister();
      });
      if ("caches" in window) {
        void caches.keys().then((keys) => {
          for (const key of keys) void caches.delete(key);
        });
      }
      return () => {
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.removeEventListener("pwa-install:captured", onCaptured);
        window.removeEventListener("pwa-install:installed", onInstalled);
        window.removeEventListener("appinstalled", onInstalled);
      };
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silent fail in unsupported/private contexts
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("pwa-install:captured", onCaptured);
      window.removeEventListener("pwa-install:installed", onInstalled);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return null;
}
