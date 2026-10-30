"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib/copy-text";

export function CopyWhatsAppButton({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  const [label, setLabel] = useState("Copier");

  async function onClick() {
    try {
      await copyToClipboard(message);
      setLabel("Copié");
    } catch {
      setLabel("Copie impossible");
    }
    window.setTimeout(() => setLabel("Copier"), 2000);
  }

  return (
    <button
      type="button"
      className={className || "min-h-10 text-xs tracking-[0.12em] text-champagne uppercase hover:text-mist"}
      onClick={() => void onClick()}
    >
      {label}
    </button>
  );
}
