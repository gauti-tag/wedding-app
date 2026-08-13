/** Gestion partagée de l’invitation d’installation PWA (prompt + préférences). */

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STORAGE_KEY = "wedding-pwa-install-v1";
const LATER_MS = 7 * 24 * 60 * 60 * 1000;

export type InstallPref =
  | { v: 1; status: "never" }
  | { v: 1; status: "later"; until: number }
  | { v: 1; status: "installed" };

export const PWA_SUGGEST_EVENT = "pwa-install:suggest";

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function subscribePwaInstall(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDeferredInstallPrompt() {
  return deferred;
}

export function captureInstallPrompt(event: BeforeInstallPromptEvent) {
  event.preventDefault();
  deferred = event;
  notify();
}

export function clearDeferredInstallPrompt() {
  deferred = null;
  notify();
}

export function isPwaStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

/** Mobile / tactile : le prompt soft n’apparaît que dans ces contextes. */
export function isLikelyMobile() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 767px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

export function isIosDevice() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function readInstallPref(): InstallPref | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InstallPref;
    if (!parsed || parsed.v !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeInstallPref(pref: InstallPref) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
  } catch {
    // private mode / quota
  }
  notify();
}

export function shouldOfferInstallPrompt() {
  if (typeof window === "undefined") return false;
  if (isPwaStandalone()) return false;
  const pref = readInstallPref();
  if (!pref) return true;
  if (pref.status === "never" || pref.status === "installed") return false;
  if (pref.status === "later") return Date.now() >= pref.until;
  return true;
}

export function markInstallNever() {
  writeInstallPref({ v: 1, status: "never" });
}

export function markInstallLater(ms = LATER_MS) {
  writeInstallPref({ v: 1, status: "later", until: Date.now() + ms });
}

export function markInstalled() {
  writeInstallPref({ v: 1, status: "installed" });
  clearDeferredInstallPrompt();
}

/** Demande d’afficher le prompt (ex. après RSVP réussi). */
export function suggestPwaInstall() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PWA_SUGGEST_EVENT));
}

export async function promptNativeInstall() {
  const event = deferred;
  if (!event) return "unavailable" as const;
  await event.prompt();
  const choice = await event.userChoice;
  clearDeferredInstallPrompt();
  if (choice.outcome === "accepted") {
    markInstalled();
    return "accepted" as const;
  }
  return "dismissed" as const;
}
