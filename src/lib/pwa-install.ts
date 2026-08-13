/** Préférences + détection pour l’invite d’installation PWA. */

export const PWA_INSTALL_PREF_KEY = "pwa-install-pref";
export const PWA_LATER_MS = 7 * 24 * 60 * 60 * 1000;

export type PwaInstallPref =
  | { status: "never" }
  | { status: "later"; until: number };

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** Mobile / tablette tactile — pas de bannière desktop. */
export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 767px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

export function readPwaInstallPref(): PwaInstallPref | null {
  try {
    const raw = localStorage.getItem(PWA_INSTALL_PREF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PwaInstallPref;
    if (parsed?.status === "never") return parsed;
    if (parsed?.status === "later" && typeof parsed.until === "number") return parsed;
    return null;
  } catch {
    return null;
  }
}

export function writePwaInstallPref(pref: PwaInstallPref): void {
  try {
    localStorage.setItem(PWA_INSTALL_PREF_KEY, JSON.stringify(pref));
  } catch {
    // private mode / quota
  }
}

export function clearPwaInstallPref(): void {
  try {
    localStorage.removeItem(PWA_INSTALL_PREF_KEY);
  } catch {
    // ignore
  }
}

/** true si on peut encore proposer l’installation. */
export function canOfferPwaInstall(): boolean {
  if (isStandaloneDisplay()) return false;
  if (!isMobileViewport()) return false;
  const pref = readPwaInstallPref();
  if (!pref) return true;
  if (pref.status === "never") return false;
  return Date.now() >= pref.until;
}

export function dismissPwaInstallLater(ms = PWA_LATER_MS): void {
  writePwaInstallPref({ status: "later", until: Date.now() + ms });
}

export function dismissPwaInstallNever(): void {
  writePwaInstallPref({ status: "never" });
}
