"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import type { Rsvp } from "@/lib/types";

type CheckInResult = {
  ok?: boolean;
  alreadyCheckedIn?: boolean;
  code?: string;
  error?: string;
  rsvp?: Rsvp;
};

export function AdminCheckIn() {
  const [manualToken, setManualToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [lastGuest, setLastGuest] = useState<Rsvp | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef("");

  useEffect(() => {
    return () => {
      void stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function stopScanner() {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
      await scanner.clear();
    } catch {
      // ignore
    }
    scannerRef.current = null;
    setScanning(false);
  }

  async function startScanner() {
    setMessage("");
    try {
      const scanner = new Html5Qrcode("admin-qr-reader");
      scannerRef.current = scanner;
      setScanning(true);
      await scanner.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          if (decoded === lastScanRef.current || busy) return;
          lastScanRef.current = decoded;
          void onCheckIn(decoded);
        },
        () => undefined,
      );
    } catch {
      setScanning(false);
      setMessage("Caméra indisponible. Saisissez le jeton manuellement.");
    }
  }

  async function onCheckIn(rawToken: string) {
    const token = rawToken.trim();
    if (!token) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as CheckInResult;
      if (!res.ok) {
        setLastGuest(data.rsvp || null);
        setMessage(data.error || "Check-in refusé.");
        return;
      }
      setLastGuest(data.rsvp || null);
      setMessage(
        data.alreadyCheckedIn
          ? `${data.rsvp?.name || "Invité"} est déjà enregistré(e).`
          : `${data.rsvp?.name || "Invité"} — présence enregistrée.`,
      );
      setManualToken("");
    } catch {
      setMessage("Erreur réseau lors du check-in.");
    } finally {
      setBusy(false);
      window.setTimeout(() => {
        lastScanRef.current = "";
      }, 2500);
    }
  }

  return (
    <section id="admin-checkin" className="mt-14 scroll-mt-28 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title text-3xl text-mist">Check-in jour J</h2>
          <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
            Scannez le QR code de la carte d’invitation pour marquer la présence réelle des
            invités.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {!scanning ? (
            <button type="button" onClick={startScanner} className="btn-primary">
              Lancer la caméra
            </button>
          ) : (
            <button type="button" onClick={() => void stopScanner()} className="btn-ghost">
              Arrêter la caméra
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border border-line bg-white p-4">
          <div id="admin-qr-reader" className="overflow-hidden rounded-sm bg-forest" />
          {!scanning ? (
            <p className="mt-3 text-center text-sm text-soft">
              La caméra affichera ici le flux de scan.
            </p>
          ) : null}
        </div>

        <div className="space-y-4 border border-line bg-white p-5">
          <div>
            <label className="label" htmlFor="manual-token">
              Jeton manuel
            </label>
            <input
              id="manual-token"
              className="field"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Collez le token ou le JSON du QR"
            />
          </div>
          <button
            type="button"
            disabled={busy || !manualToken.trim()}
            onClick={() => void onCheckIn(manualToken)}
            className="btn-primary w-full disabled:opacity-60"
          >
            {busy ? "Vérification…" : "Enregistrer la présence"}
          </button>

          {message ? <p className="meta-date text-sm text-champagne">{message}</p> : null}

          {lastGuest ? (
            <div className="border border-line bg-forest p-4 text-sm">
              <p className="text-mist">{lastGuest.name}</p>
              <p className="mt-1 text-soft">{lastGuest.email}</p>
              <p className="mt-1 text-soft">{lastGuest.phone}</p>
              <p className="meta-date mt-3 text-xs tracking-[0.14em] text-champagne uppercase">
                {lastGuest.checkedInAt
                  ? `Check-in : ${new Date(lastGuest.checkedInAt).toLocaleString("fr-FR")}`
                  : "Pas encore check-in"}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
