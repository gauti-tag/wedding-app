"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { BeforeInstallPromptEvent } from "@/lib/pwa-install";

type Listener = () => void;

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<Listener>();
let listening = false;

function emit() {
  for (const listener of listeners) listener();
}

function ensureBeforeInstallListener() {
  if (typeof window === "undefined" || listening) return;
  listening = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    emit();
  });

  window.addEventListener("appinstalled", () => {
    deferred = null;
    emit();
  });
}

function subscribe(listener: Listener) {
  ensureBeforeInstallListener();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return deferred;
}

function getServerSnapshot() {
  return null;
}

export function useDeferredInstallPrompt() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export async function promptNativeInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  ensureBeforeInstallListener();
  if (!deferred) return "unavailable";
  const event = deferred;
  await event.prompt();
  const { outcome } = await event.userChoice;
  deferred = null;
  emit();
  return outcome;
}
