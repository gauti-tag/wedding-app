"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

const luxuryEase = [0.16, 1, 0.3, 1] as const;

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
