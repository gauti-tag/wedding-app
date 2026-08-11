"use client";

import { useEffect, useId, useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const links = [
    { href: "#story", label: dict.nav.story },
    { href: "#schedule", label: dict.nav.schedule },
    { href: "#menu", label: dict.nav.menu },
    { href: "#gallery", label: dict.nav.gallery },
    { href: "#rsvp", label: dict.nav.rsvp },
  ];

  const nameParts = coupleName.split(/\s*&\s*/);
  const initialOne = (nameParts[0] || coupleName).trim().charAt(0).toUpperCase();
  const initialTwo = (nameParts[1] || "").trim().charAt(0).toUpperCase();
  const initials = initialTwo ? `${initialOne} & ${initialTwo}` : initialOne;

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 40);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const solid = scrolled || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        solid
          ? "border-b border-line bg-ivory/95 md:bg-ivory/90 md:backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="section-shell flex items-center gap-2 py-2.5 md:gap-4 md:py-4">
        <a
          href="#top"
          aria-label={coupleName}
          className={`couple-name flex min-w-0 flex-1 items-center gap-2.5 no-underline touch-manipulation md:gap-3 ${
            solid ? "text-mist" : "text-[#f7f4f0]"
          }`}
          onClick={() => setMenuOpen(false)}
        >
          <WeddingRingIcon className="hidden h-[0.9em] w-[0.9em] shrink-0 opacity-90 md:block" />
          <span className="text-[1.75rem] tracking-wide md:hidden">{initials}</span>
          <span className="hidden text-3xl md:inline">{coupleName}</span>
        </a>

        <nav className="hidden items-center gap-5 md:flex lg:gap-7" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`nav-link text-[0.72rem] tracking-[0.22em] uppercase no-underline transition-colors touch-manipulation ${
                solid
                  ? "text-champagne hover:text-mist"
                  : "text-[#f7f4f0]/85 hover:text-[#f7f4f0]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          <div
            className={`hidden md:block ${
              solid
                ? ""
                : "[&_a]:text-[#f7f4f0]/85 [&_a[aria-current=page]]:text-[#f7f4f0] [&_span]:text-[#f7f4f0]/45"
            }`}
          >
            <LanguageSwitcher locale={locale} />
          </div>

          <a
            href="#rsvp"
            className={`hidden !px-4 !py-2.5 text-[0.68rem] touch-manipulation md:inline-flex ${
              solid ? "btn-primary" : "btn-primary-light"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {dict.nav.confirm}
          </a>

          <button
            type="button"
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center touch-manipulation md:hidden ${
              solid ? "text-mist" : "text-[#f7f4f0]"
            }`}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}</span>
            <span className="relative block h-3.5 w-[1.35rem]" aria-hidden>
              <span
                className={`absolute left-0 h-[1.5px] w-full bg-current transition-transform duration-300 ${
                  menuOpen ? "top-[6px] rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-[6px] h-[1.5px] w-full bg-current transition-opacity duration-200 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-full bg-current transition-transform duration-300 ${
                  menuOpen ? "top-[6px] -rotate-45" : "top-[12px]"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id={menuId}
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          menuOpen ? "max-h-[min(85svh,32rem)] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="border-t border-line bg-ivory">
          <nav className="section-shell pb-6 pt-3" aria-label={dict.nav.openMenu}>
            <div className="mb-2 flex justify-end border-b border-line pb-3">
              <LanguageSwitcher locale={locale} />
            </div>

            <ul className="flex flex-col">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="flex min-h-[3.25rem] items-center border-b border-line text-[0.82rem] tracking-[0.18em] text-mist uppercase no-underline touch-manipulation active:bg-forest/70"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#rsvp"
              className="btn-primary mt-5 inline-flex w-full justify-center touch-manipulation"
              onClick={() => setMenuOpen(false)}
            >
              {dict.nav.confirm}
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
