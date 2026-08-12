"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type AdminAlertTone = "success" | "error" | "info";

export type AdminAlertAction = {
  label: string;
  href: string;
};

export type AdminAlertState = {
  title?: string;
  message: string;
  tone?: AdminAlertTone;
  action?: AdminAlertAction;
};

const TITLES: Record<AdminAlertTone, string> = {
  success: "Succès",
  error: "Erreur",
  info: "Information",
};

export function AdminAlertDialog({
  alert,
  onClose,
}: {
  alert: AdminAlertState | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !alert) return null;

  const tone = alert.tone || "info";
  const title = alert.title || TITLES[tone];

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-alert-title"
    >
      <div className="w-full max-w-md border border-line bg-white p-6 shadow-2xl md:p-8">
        <p
          className={`eyebrow ${
            tone === "error" ? "text-red-800" : tone === "success" ? "text-champagne" : "text-primary"
          }`}
        >
          Espace couple
        </p>
        <h2 id="admin-alert-title" className="section-title mt-3 text-2xl text-mist">
          {title}
        </h2>
        <p
          className={`mt-3 whitespace-pre-line text-sm leading-relaxed ${
            tone === "error" ? "text-red-800" : "text-soft"
          }`}
        >
          {alert.message}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {alert.action ? (
            <a
              href={alert.action.href}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost inline-flex justify-center no-underline"
              onClick={onClose}
            >
              {alert.action.label}
            </a>
          ) : null}
          <button type="button" className="btn-primary" onClick={onClose} autoFocus>
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function useAdminAlert() {
  const [alert, setAlert] = useState<AdminAlertState | null>(null);

  const showSuccess = useCallback(
    (message: string, titleOrAction?: string | AdminAlertAction, action?: AdminAlertAction) => {
      if (typeof titleOrAction === "object") {
        setAlert({ message, tone: "success", action: titleOrAction });
        return;
      }
      setAlert({ message, title: titleOrAction, tone: "success", action });
    },
    [],
  );

  const showError = useCallback((message: string, title?: string) => {
    setAlert({ message, title, tone: "error" });
  }, []);

  const showInfo = useCallback(
    (message: string, titleOrAction?: string | AdminAlertAction, action?: AdminAlertAction) => {
      if (typeof titleOrAction === "object") {
        setAlert({ message, tone: "info", action: titleOrAction });
        return;
      }
      setAlert({ message, title: titleOrAction, tone: "info", action });
    },
    [],
  );

  const clearAlert = useCallback(() => setAlert(null), []);

  return {
    alert,
    showSuccess,
    showError,
    showInfo,
    clearAlert,
    AlertDialog: <AdminAlertDialog alert={alert} onClose={clearAlert} />,
  };
}
