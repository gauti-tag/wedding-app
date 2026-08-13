import { Countdown } from "@/components/Countdown";
import { PwaInstallButton } from "@/components/PwaInstallButton";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { t } from "@/lib/localized";
import { eventLabel } from "@/lib/site";
import type { SiteContent } from "@/lib/types";

export function SiteFooter({
  dict,
  siteContent,
  locale,
}: {
  dict: Dictionary;
  siteContent: SiteContent;
  locale: Locale;
}) {
  return (
    <footer className="border-t border-line py-12">
      <div className="section-shell flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="couple-name text-3xl text-mist">
            {eventLabel(siteContent, locale)}
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-x-5 gap-y-2">
            <p className="meta-date text-sm text-soft">
              {t(siteContent.hero.weddingDateLabel, locale)}
            </p>
            {siteContent.features.countdown ? (
              <Countdown
                targetDate={siteContent.weddingDate}
                labels={dict.countdown}
                compact
              />
            ) : null}
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <PwaInstallButton label={dict.footer.installApp} iosHint={dict.pwaInstall.iosHint} />
          <a
            href="/admin"
            className="text-xs tracking-[0.18em] text-soft uppercase no-underline hover:text-champagne"
          >
            {dict.footer.coupleSpace}
          </a>
        </div>
      </div>
    </footer>
  );
}
