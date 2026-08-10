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
  const [lite, setLite] = useState(false);

  useEffect(() => {
    setLite(
      window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(max-width: 767px)").matches,
    );
  }, []);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={lite ? { opacity: 0, y: 16 } : { opacity: 0, y: 36, filter: "blur(6px)" }}
      whileInView={lite ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: lite ? 0.12 : 0.22, margin: "0px 0px -6% 0px" }}
      transition={{
        duration: lite ? 0.55 : 1.05,
        delay: lite ? Math.min(delay, 0.12) : delay,
        ease: luxuryEase,
      }}
    >
      {children}
    </motion.div>
  );
}
