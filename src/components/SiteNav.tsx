"use client";

import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { WeddingRingIcon } from "@/components/icons/WeddingRingIcon";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

export function SiteNav({
  locale,
  dict,
  coupleName,
}: {
  locale: Locale;
  dict: Dictionary;
  coupleName: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  const links = [
    { href: "#story", label: dict.nav.story },
    { href: "#schedule", label: dict.nav.schedule },
    { href: "#menu", label: dict.nav.menu },
    { href: "#gallery", label: dict.nav.gallery },
    { href: "#rsvp", label: dict.nav.rsvp },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-ivory/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="section-shell flex items-center justify-between gap-3 py-4">
        <a
          href="#top"
          className={`couple-name inline-flex items-center gap-2.5 text-2xl no-underline md:gap-3 md:text-3xl ${
            scrolled ? "text-mist" : "text-[#f7f4f0]"
          }`}
        >
          <WeddingRingIcon className="h-[0.85em] w-[0.85em] shrink-0 opacity-90" />
          <span>{coupleName}</span>
        </a>
        <nav className="hidden items-center gap-5 md:flex lg:gap-7">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`nav-link text-[0.72rem] tracking-[0.22em] uppercase no-underline transition-colors ${
                scrolled
                  ? "text-champagne hover:text-mist"
                  : "text-[#f7f4f0]/85 hover:text-[#f7f4f0]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3 md:gap-4">
          <div className={scrolled ? "" : "[&_a]:text-[#f7f4f0]/85 [&_a[aria-current=page]]:text-[#f7f4f0] [&_span]:text-[#f7f4f0]/45"}>
            <LanguageSwitcher locale={locale} />
          </div>
          <a
            href="#rsvp"
            className={`!px-4 !py-2.5 text-[0.68rem] ${
              scrolled ? "btn-primary" : "btn-primary-light"
            }`}
          >
            {dict.nav.confirm}
          </a>
        </div>
      </div>
    </header>
  );
}
