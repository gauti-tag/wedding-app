"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import {
  formatCheckInGuestLines,
  resolveCheckInGuestDetails,
} from "@/lib/guest-of";
import { formatSeatingLabel, normalizeChildSeats } from "@/lib/seating";
import { maskName, maskPhone } from "@/lib/mask-pii";
import type { Rsvp, SiteContent } from "@/lib/types";
import { seatingWhatsAppForRsvp } from "@/lib/whatsapp";

function guestOfLabelsFromSite(
  site: Pick<SiteContent, "partnerOne" | "partnerTwo" | "rsvpConfig">,
): Record<string, string> {
  const fromConfig: Record<string, string> = {};
  for (const option of site.rsvpConfig?.guestOfOptions || []) {
    fromConfig[option.id] = option.label.fr || option.label.en || option.id;
  }
  if (Object.keys(fromConfig).length) return fromConfig;
  return {
    gautier: site.partnerOne,
    francybel: site.partnerTwo,
    both: `${site.partnerOne}${site.partnerTwo ? ` & ${site.partnerTwo}` : ""}`,
  };
}

type CheckInResult = {
  ok?: boolean;
  alreadyCheckedIn?: boolean;
  code?: string;
  error?: string;
  rsvp?: Rsvp;
};

function formatScanPlace(guest: Rsvp, repeat: boolean) {
  const table = (guest.tableLabel || "").trim();
  const seat = (guest.seatLabel || "").trim();
  const lines = repeat
    ? [
        table ? `Table : ${table}` : "Table : non assignée",
        seat ? `Siège : ${seat}` : "Siège : non assigné",
      ]
    : [seat ? `Numéro de siège : ${seat}` : "Numéro de siège : non assigné"];

  normalizeChildSeats(guest.childSeats, guest.childCount).forEach((child, index) => {
    if (repeat) {
      const place = formatSeatingLabel(child.tableLabel, child.seatLabel);
      lines.push(
        place
          ? `Enfant ${index + 1} : ${place}`
          : `Enfant ${index + 1} : table et siège non assignés`,
      );
      return;
    }
    const childSeat = (child.seatLabel || "").trim();
    lines.push(
      childSeat
        ? `Enfant ${index + 1} · siège ${childSeat}`
        : `Enfant ${index + 1} · siège non assigné`,
    );
  });

  return lines.join("\n");
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(pattern);
  }
}

export function AdminCheckIn({
  site,
  rsvps,
  showGuestPii = true,
  onCheckedIn,
}: {
  site: Pick<SiteContent, "partnerOne" | "partnerTwo" | "rsvpConfig">;
  rsvps: Rsvp[];
  showGuestPii?: boolean;
  onCheckedIn?: (rsvp: Rsvp) => void;
}) {
  const [manualToken, setManualToken] = useState("");
  const [lookup, setLookup] = useState("");
  const [resendId, setResendId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastGuest, setLastGuest] = useState<Rsvp | null>(null);
  const [repeatScan, setRepeatScan] = useState(false);
  const { showSuccess, showError, showInfo, AlertDialog } = useAdminAlert();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef("");

  const guestOfLabels = useMemo(() => guestOfLabelsFromSite(site), [site]);
  const displayName = (name: string) => (showGuestPii ? name : maskName(name));
  const displayPhone = (phone: string) => (showGuestPii ? phone || "—" : maskPhone(phone || ""));

  const lostQrMatches = useMemo(() => {
    const q = lookup.trim().toLowerCase();
    if (q.length < 2) return [];
    return rsvps
      .filter((rsvp) => {
        if (rsvp.status === "no" || rsvp.blockedAt) return false;
        const lien = guestOfLabels[rsvp.guestOf] || rsvp.guestOf || "";
        return `${rsvp.name} ${rsvp.phone} ${lien}`.toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [lookup, rsvps, guestOfLabels]);

  const lastGuestDetails = useMemo(
    () =>
      lastGuest
        ? resolveCheckInGuestDetails(lastGuest, site, guestOfLabels)
        : null,
    [lastGuest, site, guestOfLabels],
  );

  const seatingLabel = useMemo(
    () => (lastGuest ? formatScanPlace(lastGuest, repeatScan) : ""),
    [lastGuest, repeatScan],
  );

  const seatingWa = useMemo(
    () => (lastGuest ? seatingWhatsAppForRsvp(lastGuest, site, { toGuest: true }) : null),
    [lastGuest, site],
  );

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
    try {
      const reader = document.getElementById("admin-qr-reader");
      const box = Math.max(
        160,
        Math.min(240, Math.floor(((reader?.clientWidth || 280) * 0.72) / 2) * 2),
      );
      const scanner = new Html5Qrcode("admin-qr-reader");
      scannerRef.current = scanner;
      setScanning(true);
      await scanner.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: box, height: box }, aspectRatio: 1 },
        (decoded) => {
          if (decoded === lastScanRef.current || busy) return;
          lastScanRef.current = decoded;
          void onCheckIn(decoded);
        },
        () => undefined,
      );
    } catch {
      setScanning(false);
      showInfo("Caméra indisponible. Saisissez le jeton manuellement.");
    }
  }

  async function onCheckIn(rawToken: string) {
    const token = rawToken.trim();
    if (!token) return;
    setBusy(true);
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as CheckInResult;
      if (!res.ok) {
        setLastGuest(data.rsvp || null);
        setRepeatScan(false);
        vibrate([40, 30, 40, 30, 80]);
        showError(data.error || "Check-in refusé.");
        return;
      }

      const guest = data.rsvp || null;
      const repeat = Boolean(data.alreadyCheckedIn);
      if (guest) onCheckedIn?.(guest);
      setLastGuest(guest);
      setRepeatScan(repeat);

      const place = guest ? formatScanPlace(guest, repeat) : "";
      const guestLines = guest
        ? formatCheckInGuestLines(resolveCheckInGuestDetails(guest, site, guestOfLabels))
        : "";
      const wa = guest ? seatingWhatsAppForRsvp(guest, site, { toGuest: true }) : null;
      const waAction =
        wa?.url
          ? { label: "Envoyer place WhatsApp", href: wa.url }
          : undefined;

      if (data.alreadyCheckedIn) {
        vibrate([60, 40, 60]);
        showInfo(
          [
            `${guest?.name || "Invité"} est déjà enregistré(e).`,
            guestLines ? `\n\n${guestLines}` : "",
            place ? `\n\n${place}` : "",
          ].join(""),
          "Déjà check-in",
          waAction,
        );
      } else {
        vibrate(200);
        showSuccess(
          [
            `${guest?.name || "Invité"} — présence enregistrée.`,
            guestLines ? `\n\n${guestLines}` : "",
            place ? `\n\n${place}` : "",
          ].join(""),
          "Check-in réussi",
          waAction,
        );
      }
      setManualToken("");
    } catch {
      vibrate([40, 30, 40, 30, 80]);
      showError("Erreur réseau lors du check-in.");
    } finally {
      setBusy(false);
      window.setTimeout(() => {
        lastScanRef.current = "";
      }, 2500);
    }
  }

  async function onResendTicket(rsvp: Rsvp) {
    setResendId(rsvp.id);
    try {
      const res = await fetch("/api/rsvp/resend-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rsvp.id }),
      });
      const data = (await res.json()) as { error?: string; whatsappUrl?: string };
      if (!res.ok || !data.whatsappUrl) {
        showError(data.error || "Impossible de préparer le WhatsApp.");
        return;
      }
      window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      showSuccess(
        `WhatsApp est ouvert pour ${displayName(rsvp.name)}. Il reste à appuyer sur Envoyer.`,
        "QR renvoyé",
      );
    } catch {
      showError("Erreur réseau lors du renvoi du QR.");
    } finally {
      setResendId(null);
    }
  }

  return (
    <section id="admin-checkin" className="mt-14 min-w-0 max-w-full scroll-mt-28 space-y-6">
      {AlertDialog}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title text-3xl text-mist">Check-in jour J</h2>
          <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
            Scannez le QR code de la carte d’invitation pour marquer la présence. Le premier scan
            affiche le numéro de siège ; un second scan rappelle la table et le siège. Si le QR
            est perdu, retrouvez l’invité ci-dessous et renvoyez sa carte sur WhatsApp.
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

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="border border-line bg-white p-4">
          <div id="admin-qr-reader" className="w-full min-w-0 max-w-full overflow-hidden rounded-sm bg-forest [&_video]:max-w-full [&_img]:max-w-full" />
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

          <div className="border-t border-line pt-4">
            <label className="label" htmlFor="lost-qr">
              QR perdu
            </label>
            <input
              id="lost-qr"
              className="field"
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              placeholder="Nom, téléphone ou lien"
              autoComplete="off"
            />
            {lookup.trim().length >= 2 ? (
              lostQrMatches.length === 0 ? (
                <p className="mt-3 text-xs text-soft">Aucun invité confirmé ou en attente.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {lostQrMatches.map((rsvp) => {
                    const place = formatScanPlace(rsvp, true);
                    const lien = guestOfLabels[rsvp.guestOf] || "";
                    return (
                      <li key={rsvp.id} className="border border-line p-3 text-sm">
                        <p className="text-mist">{displayName(rsvp.name)}</p>
                        <p className="mt-1 text-xs text-soft">
                          {displayPhone(rsvp.phone)}
                          {lien ? ` · ${lien}` : ""}
                        </p>
                        <p className="mt-2 whitespace-pre-line text-xs text-champagne">{place}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busy || !rsvp.ticketToken}
                            onClick={() => void onCheckIn(rsvp.ticketToken)}
                            className="btn-primary !px-3 !py-2 text-xs disabled:opacity-60"
                          >
                            Check-in
                          </button>
                          <button
                            type="button"
                            disabled={resendId === rsvp.id}
                            onClick={() => void onResendTicket(rsvp)}
                            className="btn-ghost !px-3 !py-2 text-xs disabled:opacity-60"
                          >
                            {resendId === rsvp.id ? "Préparation…" : "Renvoyer le QR"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )
            ) : (
              <p className="mt-3 text-xs text-soft">Saisissez au moins 2 caractères.</p>
            )}
          </div>

          {lastGuest ? (
            <div className="border border-line bg-forest p-4 text-sm">
              <p className="text-mist">{lastGuest.name}</p>
              <p className="mt-1 text-soft">{lastGuest.phone}</p>
              {lastGuestDetails ? (
                <dl className="mt-3 space-y-1.5 text-xs text-soft">
                  {lastGuestDetails.relation !== "—" ? (
                    <>
                      <div className="flex justify-between gap-3">
                        <dt className="tracking-[0.1em] uppercase">Lien</dt>
                        <dd className="text-mist">{lastGuestDetails.relation}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="tracking-[0.1em] uppercase">Côté</dt>
                        <dd className="text-mist">{lastGuestDetails.side}</dd>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between gap-3">
                      <dt className="tracking-[0.1em] uppercase">Invité(e) de</dt>
                      <dd className="text-right text-mist">{lastGuestDetails.guestOfLabel}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <dt className="tracking-[0.1em] uppercase">Enfants</dt>
                    <dd className="text-mist">
                      {lastGuestDetails.childCount === 0
                        ? "Aucun"
                        : lastGuestDetails.childCount}
                    </dd>
                  </div>
                </dl>
              ) : null}
              {seatingLabel ? (
                <p className="meta-date mt-3 text-xl tracking-[0.06em] text-champagne whitespace-pre-line">
                  {seatingLabel}
                </p>
              ) : (
                <p className="mt-3 text-xs text-soft">Aucune table assignée</p>
              )}
              <p className="meta-date mt-3 text-xs tracking-[0.14em] text-champagne uppercase">
                {lastGuest.checkedInAt
                  ? `Check-in : ${new Date(lastGuest.checkedInAt).toLocaleString("fr-FR")}`
                  : "Pas encore check-in"}
              </p>
              {seatingWa?.url ? (
                <a
                  href={seatingWa.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary mt-4 inline-flex w-full justify-center no-underline"
                >
                  Envoyer place par WhatsApp
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
