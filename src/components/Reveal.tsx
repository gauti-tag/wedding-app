"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

const luxuryEase = [0.16, 1, 0.3, 1] as const;

const scrollDirection = { current: 1 };
let scrollDirectionBound = false;

function bindScrollDirection() {
  if (scrollDirectionBound || typeof window === "undefined") return;
  scrollDirectionBound = true;
  let last = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 2) return;
      scrollDirection.current = y > last ? 1 : -1;
      last = y;
    },
    { passive: true },
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [lite, setLite] = useState(true);

  useEffect(() => {
    const mobile =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 767px)").matches;
    setLite(mobile);
  }, []);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: lite ? 16 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: lite ? 0.1 : 0.2, margin: "0px 0px -4% 0px" }}
      transition={{
        duration: lite ? 0.45 : 0.9,
        delay: lite ? Math.min(delay, 0.08) : delay,
        ease: luxuryEase,
      }}
      style={{ filter: "none" }}
    >
      {children}
    </motion.div>
  );
}

/** Réapparaît à chaque entrée dans l’écran, vers le haut ou vers le bas. */
export function DirectionalReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.28, margin: "0px 0px -6% 0px" });
  const [lite, setLite] = useState(true);

  useEffect(() => {
    bindScrollDirection();
    const mobile =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 767px)").matches;
    setLite(mobile);
  }, []);

  if (reduceMotion) {
    return <article className={className}>{children}</article>;
  }

  const offset = lite ? 14 : 26;

  return (
    <motion.article
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: offset }}
      animate={{
        opacity: inView ? 1 : 0,
        y: inView ? 0 : scrollDirection.current * offset,
      }}
      transition={{ duration: lite ? 0.4 : 0.65, ease: luxuryEase }}
    >
      {children}
    </motion.article>
  );
}
