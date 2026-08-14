"use client";

import { useEffect } from "react";

/**
 * Empêche le scroll / étirement horizontal du document sur /admin uniquement.
 * overflow-x: clip sur html fait d’html le scrollport → sticky reste utilisable.
 */
export function AdminViewportLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.add("is-admin");
    const prev = {
      htmlOverflowX: html.style.overflowX,
      bodyOverflowX: body.style.overflowX,
      bodyMaxWidth: body.style.maxWidth,
      bodyWidth: body.style.width,
      htmlOverscrollX: html.style.overscrollBehaviorX,
      bodyOverscrollX: body.style.overscrollBehaviorX,
    };

    html.style.overflowX = "clip";
    html.style.overscrollBehaviorX = "none";
    body.style.overflowX = "clip";
    body.style.maxWidth = "100%";
    body.style.width = "100%";
    body.style.overscrollBehaviorX = "none";

    return () => {
      html.classList.remove("is-admin");
      html.style.overflowX = prev.htmlOverflowX;
      html.style.overscrollBehaviorX = prev.htmlOverscrollX;
      body.style.overflowX = prev.bodyOverflowX;
      body.style.maxWidth = prev.bodyMaxWidth;
      body.style.width = prev.bodyWidth;
      body.style.overscrollBehaviorX = prev.bodyOverscrollX;
    };
  }, []);

  return null;
}
