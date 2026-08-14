"use client";

import { useMemo, useState } from "react";
import { PwaBannerCard } from "@/components/PwaBannerCard";
import { resolvePwaBannerCopy } from "@/lib/pwa-banner";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { PwaBannerSettings } from "@/lib/types";

const FALLBACK_FOOTER: Dictionary["footer"] = {
  coupleSpace: "Espace couple",
  installApp: "Installer l’app",
  installPrompt: {
    title: "Sur l’écran d’accueil ?",
    body: "Pour rouvrir l’invitation en un tap.",
    install: "Oui",
    later: "Plus tard",
    never: "Ne plus demander",
    iosHint: "Safari → Partager → « Sur l’écran d’accueil ».",
    close: "Fermer",
  },
};

/**
 * Aperçu live de la bannière PWA (sticky dans le panneau admin).
 */
export function AdminPwaBannerPreview({ settings }: { settings: PwaBannerSettings }) {
  const [locale, setLocale] = useState<Locale>("fr");
  const [showIosSteps, setShowIosSteps] = useState(false);

  const copy = useMemo(
    () => resolvePwaBannerCopy(settings, FALLBACK_FOOTER, locale),
    [settings, locale],
  );

  const justify =
    settings.placement === "bottom-left"
      ? "justify-start"
      : settings.placement === "bottom-right"
        ? "justify-end"
        : "justify-center";

  return (
    <div className="space-y-3 border border-line bg-forest/50 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs tracking-[0.14em] text-champagne uppercase">Aperçu live</p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden border border-line bg-white text-[0.62rem] tracking-[0.12em] uppercase">
            <button
              type="button"
              className={`px-2.5 py-1 ${locale === "fr" ? "bg-cacao text-ivory" : "text-soft"}`}
              onClick={() => setLocale("fr")}
            >
              FR
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 ${locale === "en" ? "bg-cacao text-ivory" : "text-soft"}`}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
          </div>
          <button
            type="button"
            className="border border-line bg-white px-2.5 py-1 text-[0.62rem] tracking-[0.12em] text-soft uppercase"
            onClick={() => setShowIosSteps((v) => !v)}
          >
            {showIosSteps ? "Vue standard" : "Vue aide iOS"}
          </button>
        </div>
      </div>

      {!settings.enabled ? (
        <p className="py-6 text-center text-sm text-soft">
          Bannière désactivée — activez-la pour la voir sur le site.
        </p>
      ) : (
        <div className="mx-auto w-full max-w-[22rem]">
          <div className="overflow-hidden border border-line bg-[#ebe4db] shadow-sm">
            <div className="border-b border-line/70 bg-white/70 px-3 py-1.5 text-center text-[0.58rem] tracking-[0.14em] text-soft uppercase">
              Mobile · {settings.width} · {settings.height}
            </div>
            <div className="relative min-h-[17rem] px-3 pb-3 pt-8">
              <div className="pointer-events-none absolute inset-x-4 top-6 space-y-2 opacity-40">
                <div className="h-2 w-2/3 bg-cacao/15" />
                <div className="h-2 w-full bg-cacao/10" />
                <div className="h-2 w-5/6 bg-cacao/10" />
              </div>
              <div className={`relative flex min-h-[12rem] items-end ${justify}`}>
                <PwaBannerCard
                  copy={copy}
                  settings={settings}
                  showIosSteps={showIosSteps}
                  preview
                  className="pointer-events-none shadow-[0_8px_24px_rgba(59,36,22,0.12)]"
                />
              </div>
            </div>
          </div>

          {settings.showFooterButton ? (
            <p className="mt-3 text-center text-xs text-soft">
              Pied de page :{" "}
              <span className="tracking-[0.12em] text-champagne uppercase">
                {copy.footerInstall}
              </span>
            </p>
          ) : (
            <p className="mt-3 text-center text-xs text-soft">Bouton pied de page masqué.</p>
          )}
        </div>
      )}
    </div>
  );
}
