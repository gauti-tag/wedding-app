"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

function isMobileMotion() {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 767px)").matches
  );
}

export function ParallaxMedia({
  children,
  className = "",
  strength = 12,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || isMobileMotion()) return;
    const root = rootRef.current;
    const media = mediaRef.current;
    if (!root || !media) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        media,
        { yPercent: -strength / 2, scale: 1.08 },
        {
          yPercent: strength / 2,
          scale: 1.14,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [reduceMotion, strength]);

  return (
    <div ref={rootRef} className={`overflow-hidden ${className}`}>
      <div ref={mediaRef} className="h-full w-full md:will-change-transform">
        {children}
      </div>
    </div>
  );
}
