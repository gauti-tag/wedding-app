"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  return (
    <div
      className="nav-link flex items-center gap-1 text-[0.68rem] tracking-[0.18em] uppercase"
      aria-label="Language"
    >
      <Link
        href="/fr"
        className={`no-underline transition-colors ${
          locale === "fr" ? "text-mist" : "text-soft hover:text-champagne"
        }`}
        hrefLang="fr"
        aria-current={locale === "fr" ? "page" : undefined}
      >
        FR
      </Link>
      <span className="text-soft/50">/</span>
      <Link
        href="/en"
        className={`no-underline transition-colors ${
          locale === "en" ? "text-mist" : "text-soft hover:text-champagne"
        }`}
        hrefLang="en"
        aria-current={locale === "en" ? "page" : undefined}
      >
        EN
      </Link>
    </div>
  );
}
