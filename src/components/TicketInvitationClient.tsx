"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  guestName: string;
  coupleNames: string;
  dateLabel: string;
  qrDataUrl: string;
  ticketCode: string;
  /** Aperçu admin (?preview=1) : pas de dialogue ni téléchargement. */
  skipDownloadPrompt?: boolean;
};

const OFFLINE_TICKET_PREFIX = "wedding-ticket-offline:";

type OfflineTicketSnapshot = {
  guestName: string;
  coupleNames: string;
  dateLabel: string;
  qrDataUrl: string;
  ticketCode: string;
  savedAt: string;
};

function saveTicketOffline(snapshot: OfflineTicketSnapshot) {
  try {
    localStorage.setItem(
      `${OFFLINE_TICKET_PREFIX}${snapshot.ticketCode}`,
      JSON.stringify(snapshot),
    );
  } catch {
    /* quota / private mode */
  }
}

async function pinTicketPageInCache() {
  if (!("caches" in window)) return;
  try {
    const cache = await caches.open("wedding-tickets-v1");
    await cache.add(window.location.href);
  } catch {
    /* ignore */
  }
}

async function downloadInvitationCard(input: {
  guestName: string;
  coupleNames: string;
  dateLabel: string;
  qrDataUrl: string;
  ticketCode: string;
}) {
  const width = 900;
  const height = 1400;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  // Fond
  ctx.fillStyle = "#f7f4f0";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(48, 48, width - 96, height - 96);
  ctx.strokeStyle = "rgba(59,36,22,0.18)";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  ctx.fillStyle = "#6b3e2a";
  ctx.font = "500 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("INVITATION DE MARIAGE", width / 2, 140);

  ctx.fillStyle = "#3b2416";
  ctx.font = "400 64px Georgia, serif";
  ctx.fillText(input.coupleNames, width / 2, 230);

  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 24px Georgia, serif";
  ctx.fillText(input.dateLabel.toUpperCase(), width / 2, 290);

  ctx.beginPath();
  ctx.moveTo(width / 2 - 80, 340);
  ctx.lineTo(width / 2 + 80, 340);
  ctx.strokeStyle = "rgba(59,36,22,0.2)";
  ctx.stroke();

  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 20px Georgia, serif";
  ctx.fillText("CHER(E) INVITÉ(E)", width / 2, 400);

  ctx.fillStyle = "#3b2416";
  ctx.font = "600 40px Georgia, serif";
  ctx.fillText(input.guestName, width / 2, 460);

  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 22px Georgia, serif";
  const lines = [
    "Nous sommes honorés de vous compter",
    "parmi nos invités pour célébrer",
    "l'un des plus beaux jours de notre vie.",
  ];
  lines.forEach((line, i) => ctx.fillText(line, width / 2, 520 + i * 32));

  const qr = await loadImage(input.qrDataUrl);
  const qrSize = 360;
  const qrX = (width - qrSize) / 2;
  const qrY = 640;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
  ctx.strokeStyle = "rgba(59,36,22,0.18)";
  ctx.strokeRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 20px Georgia, serif";
  ctx.fillText("Présentez ce QR code à l'entrée", width / 2, 1060);

  ctx.fillStyle = "#6b3e2a";
  ctx.font = "500 18px monospace";
  ctx.fillText(input.ticketCode.slice(0, 10) + "…", width / 2, 1110);

  ctx.fillStyle = "#6b3e2a";
  ctx.font = "400 36px Georgia, serif";
  ctx.fillText(input.coupleNames, width / 2, 1200);

  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 16px Georgia, serif";
  ctx.fillText("TOGETHER FOREVER", width / 2, 1245);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("blob");

  const safeName = input.guestName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `invitation-${safeName || "carte"}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

export function TicketInvitationClient({
  guestName,
  coupleNames,
  dateLabel,
  qrDataUrl,
  ticketCode,
  skipDownloadPrompt = false,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [offlineReady, setOfflineReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!skipDownloadPrompt) {
      setPromptOpen(true);
    }
  }, [skipDownloadPrompt]);

  useEffect(() => {
    if (skipDownloadPrompt) return;
    saveTicketOffline({
      guestName,
      coupleNames,
      dateLabel,
      qrDataUrl,
      ticketCode,
      savedAt: new Date().toISOString(),
    });
    void pinTicketPageInCache().then(() => setOfflineReady(true));
  }, [guestName, coupleNames, dateLabel, qrDataUrl, ticketCode, skipDownloadPrompt]);

  useEffect(() => {
    const sync = () => setIsOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const closePrompt = useCallback(() => {
    setPromptOpen(false);
    setError("");
  }, []);

  async function onConfirmDownload() {
    setBusy(true);
    setError("");
    try {
      await downloadInvitationCard({
        guestName,
        coupleNames,
        dateLabel,
        qrDataUrl,
        ticketCode,
      });
      closePrompt();
    } catch {
      setError("Téléchargement impossible. Réessayez ou choisissez Non pour continuer.");
    } finally {
      setBusy(false);
    }
  }

  const dialog =
    mounted && promptOpen ? (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-download-title"
      >
        <div className="w-full max-w-md border border-line bg-white p-6 shadow-2xl md:p-8">
          <p className="eyebrow text-primary">Invitation</p>
          <h2 id="ticket-download-title" className="section-title mt-3 text-2xl text-mist">
            Enregistrer la carte ?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-soft">
            Souhaitez-vous télécharger votre carte d’invitation (image PNG) sur cet appareil ?
          </p>
          {error ? (
            <p className="mt-3 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-ghost w-full sm:w-auto"
              disabled={busy}
              onClick={closePrompt}
            >
              Non
            </button>
            <button
              type="button"
              className="btn-primary w-full sm:w-auto disabled:opacity-60"
              disabled={busy}
              onClick={() => void onConfirmDownload()}
            >
              {busy ? "Téléchargement…" : "Oui, télécharger"}
            </button>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-ivory px-4 py-12">
      {mounted && dialog ? createPortal(dialog, document.body) : null}

      {isOffline || offlineReady ? (
        <p
          className={`mb-4 max-w-md px-3 text-center text-xs tracking-[0.12em] uppercase ${
            isOffline ? "text-champagne" : "text-soft"
          }`}
          role="status"
        >
          {isOffline
            ? "Mode hors ligne — votre QR reste disponible"
            : "Carte enregistrée pour un usage hors ligne sur cet appareil"}
        </p>
      ) : null}

      <article className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-white px-8 py-10 text-center shadow-xl md:px-10 md:py-12">
        <div className="absolute top-5 left-5 h-8 w-8 border-t border-l border-primary/30" />
        <div className="absolute top-5 right-5 h-8 w-8 border-t border-r border-primary/30" />
        <div className="absolute bottom-5 left-5 h-8 w-8 border-b border-l border-primary/30" />
        <div className="absolute right-5 bottom-5 h-8 w-8 border-r border-b border-primary/30" />

        <p className="eyebrow text-primary tracking-[0.35em] uppercase">Wedding Invitation</p>

        <h1 className="couple-name mt-5 text-5xl text-mist">{coupleNames}</h1>

        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-line" />
          <span className="text-xl text-primary">♡</span>
          <div className="h-px w-12 bg-line" />
        </div>

        <p className="meta-date mt-5 text-sm tracking-[0.18em] text-soft uppercase">{dateLabel}</p>

        <div className="divider mx-auto my-8" />

        <p className="text-xs tracking-[0.25em] text-soft uppercase">Cher(e) invité(e)</p>

        <h2 className="mt-2 text-2xl font-semibold text-mist">{guestName}</h2>

        <p className="mx-auto mt-5 max-w-xs leading-7 text-soft">
          Nous sommes honorés de vous compter parmi nos invités pour célébrer l&apos;un des plus
          beaux jours de notre vie.
        </p>

        <div className="mt-8 inline-block rounded-2xl border border-line bg-white p-4 shadow-sm">
          <img src={qrDataUrl} alt="QR code d’invitation" className="h-56 w-56" />
        </div>

        <p className="mt-6 text-sm leading-6 text-soft">
          Présentez ce <span className="font-semibold text-mist">QR Code</span> à l&apos;entrée afin
          de confirmer votre présence.
        </p>

        <div className="mx-auto mt-6 h-px w-16 bg-line" />

        <p className="mt-5 text-xs tracking-[0.2em] text-soft uppercase">Code d&apos;invitation</p>

        <p className="mt-2 font-mono text-sm tracking-[0.25em] text-primary">
          {ticketCode.slice(0, 10)}…
        </p>

        <div className="mt-10">
          <p className="couple-name text-3xl text-primary">{coupleNames}</p>
          <p className="mt-2 text-xs tracking-[0.3em] text-soft uppercase">Together Forever</p>
        </div>
      </article>
    </main>
  );
}
