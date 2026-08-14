"use client";

import {
  pwaBannerBackgroundCss,
  pwaBannerButtonRadiusCss,
  pwaBannerGapClass,
  pwaBannerMaxWidthClass,
  pwaBannerPaddingCss,
  pwaBannerRadiusCss,
  type ResolvedPwaBannerCopy,
} from "@/lib/pwa-banner";
import type { PwaBannerSettings } from "@/lib/types";

type Props = {
  copy: ResolvedPwaBannerCopy;
  settings: Pick<
    PwaBannerSettings,
    "cardRadius" | "buttonRadius" | "width" | "height" | "placement" | "opacity"
  >;
  showIosSteps?: boolean;
  /** Afficher le bouton d’install (false si non éligible côté navigateur). */
  showInstallButton?: boolean;
  /** Mode aperçu admin : pas d’actions réelles. */
  preview?: boolean;
  onInstall?: () => void;
  onLater?: () => void;
  onNever?: () => void;
  onClose?: () => void;
  titleId?: string;
  className?: string;
};

/**
 * Cadre visuel de la bannière PWA (site + aperçu admin).
 */
export function PwaBannerCard({
  copy,
  settings,
  showIosSteps = false,
  showInstallButton = true,
  preview = false,
  onInstall,
  onLater,
  onNever,
  onClose,
  titleId,
  className = "",
}: Props) {
  const alignClass =
    settings.placement === "bottom-left"
      ? "mr-auto"
      : settings.placement === "bottom-right"
        ? "ml-auto"
        : "mx-auto";

  const compact = settings.height === "compact";
  const airy = settings.height === "airy" || settings.height === "tall";
  const opacity = settings.opacity ?? 1;
  const frosted = opacity < 0.98;

  return (
    <div
      className={`pwa-banner relative w-full ${alignClass} ${pwaBannerMaxWidthClass(settings.width)} ${className}`}
      style={{
        borderRadius: pwaBannerRadiusCss(settings.cardRadius),
        padding: pwaBannerPaddingCss(settings.height),
        background: pwaBannerBackgroundCss(opacity),
        backdropFilter: frosted ? "blur(12px)" : undefined,
        WebkitBackdropFilter: frosted ? "blur(12px)" : undefined,
      }}
    >
      <button
        type="button"
        onClick={onClose ?? onLater}
        className="absolute top-1.5 right-1.5 z-10 px-1.5 py-1 text-[1.05rem] leading-none text-soft/70 transition-colors hover:text-mist"
        aria-label={copy.close}
        tabIndex={preview ? -1 : undefined}
      >
        ×
      </button>

      <div
        className={`flex flex-col items-center px-1 text-center sm:px-2 ${pwaBannerGapClass(settings.height)}`}
      >
        <span
          className={`shrink-0 rounded-full bg-champagne/70 ${compact ? "mb-1 h-1 w-1" : "mb-1.5 h-1.5 w-1.5"}`}
          aria-hidden
        />
        <p
          id={titleId}
          className={`font-medium leading-tight text-mist ${compact ? "text-[0.74rem]" : airy ? "text-[0.88rem]" : "text-[0.8rem]"}`}
        >
          {copy.title}
        </p>
        {!showIosSteps ? (
          <p
            className={`leading-snug text-soft/85 ${compact ? "mt-0.5 text-[0.62rem]" : airy ? "mt-1 text-[0.74rem]" : "mt-0.5 text-[0.68rem]"}`}
          >
            {copy.body}
          </p>
        ) : null}

        {!showIosSteps && showInstallButton ? (
          <button
            type="button"
            onClick={onInstall}
            className={`shrink-0 border border-cacao/25 bg-cacao/90 font-semibold tracking-[0.12em] text-ivory uppercase transition-colors hover:bg-cacao ${
              compact
                ? "mt-1.5 px-2.5 py-1 text-[0.56rem]"
                : airy
                  ? "mt-3 px-4 py-2 text-[0.68rem]"
                  : "mt-2.5 px-3.5 py-1.5 text-[0.62rem]"
            }`}
            style={{ borderRadius: pwaBannerButtonRadiusCss(settings.buttonRadius) }}
            tabIndex={preview ? -1 : undefined}
          >
            {copy.install}
          </button>
        ) : null}

        {showIosSteps ? (
          <p
            className={`border-t border-line/60 leading-snug text-mist/90 ${
              compact ? "mt-1.5 pt-1.5 text-[0.62rem]" : "mt-2 pt-2 text-[0.7rem]"
            }`}
          >
            {copy.iosHint}
          </p>
        ) : null}

        <div
          className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 ${
            compact ? "mt-1.5" : airy ? "mt-3" : "mt-2"
          }`}
        >
          <button
            type="button"
            onClick={onLater}
            className="text-[0.58rem] tracking-[0.14em] text-soft/75 uppercase transition-colors hover:text-champagne"
            tabIndex={preview ? -1 : undefined}
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
            tabIndex={preview ? -1 : undefined}
          >
            {copy.never}
          </button>
        </div>
      </div>
    </div>
  );
}
