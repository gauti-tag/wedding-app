"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { formatCheckInGuestLines, resolveCheckInGuestDetails } from "@/lib/guest-of";
import { formatEventRoles, hasEventRole } from "@/lib/event-roles";
import { formatSeatingLabel, normalizeChildSeats } from "@/lib/seating";
import { maskName, maskPhone } from "@/lib/mask-pii";
import type { Rsvp, SiteContent } from "@/lib/types";
import { seatingWhatsAppForRsvp, type ReceptionNotice } from "@/lib/whatsapp";
import { WhatsAppSenderHint } from "@/components/admin/WhatsAppSenderHint";
import { CopyWhatsAppButton } from "@/components/admin/CopyWhatsAppButton";

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

function formatCheckInStamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCheckInAccount(guest: Rsvp) {
  const name = (guest.checkedInByName || "").trim();
  const email = (guest.checkedInByEmail || "").trim();
  if (name && email) return `${name} · ${email}`;
  return name || email || "Compte non enregistré";
}

function formatScanPlace(guest: Rsvp, repeat: boolean) {
  const table = (guest.tableLabel || "").trim();
  const seat = (guest.seatLabel || "").trim();
  const lines = hasEventRole(guest)
    ? [`Rôle : ${formatEventRoles(guest.eventRoles)}`, "Pas de table ni de siège"]
    : [
        table ? `Table : ${table}` : "Table : non assignée",
        seat ? `Siège : ${seat}` : "Siège : non assigné",
      ];

  normalizeChildSeats(guest.childSeats, guest.childCount).forEach((child, index) => {
    const place = formatSeatingLabel(child.tableLabel, child.seatLabel);
    lines.push(
      place
        ? `Enfant ${index + 1} : ${place}`
        : `Enfant ${index + 1} : table et siège non assignés`,
    );
  });

  if (repeat && guest.checkedInAt) {
    lines.push(`Premier check-in : ${formatCheckInStamp(guest.checkedInAt)}`);
    lines.push(`Compte : ${formatCheckInAccount(guest)}`);
  }

  return lines.join("\n");
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(pattern);
  }
}

type ScanCue = "success" | "repeat" | "error";

let scanAudio: AudioContext | null = null;

function scanAudioContext() {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!scanAudio || scanAudio.state === "closed") scanAudio = new Ctx();
  return scanAudio;
}

/** À appeler dans le geste qui lance la caméra, sinon le navigateur bloque le son. */
function armScanFeedback() {
  const ctx = scanAudioContext();
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

function playTone(ctx: AudioContext, frequency: number, start: number, duration: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function playScanCue(kind: ScanCue) {
  const ctx = scanAudioContext();
  if (ctx && ctx.state === "running") {
    const now = ctx.currentTime;
    if (kind === "success") playTone(ctx, 988, now, 0.14);
    if (kind === "repeat") {
      playTone(ctx, 740, now, 0.09);
      playTone(ctx, 740, now + 0.16, 0.09);
    }
    if (kind === "error") playTone(ctx, 196, now, 0.24);
  }
  if (kind === "success") vibrate(180);
  if (kind === "repeat") vibrate([70, 50, 70]);
  if (kind === "error") vibrate([40, 30, 40, 30, 80]);
}

export function AdminCheckIn({
  site,
  reception,
  rsvps,
  showGuestPii = true,
  onPlaceSend,
  onCheckedIn,
  senderPhone = "",
}: {
  site: Pick<SiteContent, "partnerOne" | "partnerTwo" | "rsvpConfig" | "hero">;
  reception?: ReceptionNotice;
  rsvps: Rsvp[];
  showGuestPii?: boolean;
  onPlaceSend?: (id: string) => void;
  onCheckedIn?: (rsvp: Rsvp) => void;
  senderPhone?: string;
}) {
  const [manualToken, setManualToken] = useState("");
  const [lookup, setLookup] = useState("");
  const [resendId, setResendId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastGuest, setLastGuest] = useState<Rsvp | null>(null);
  const [repeatScan, setRepeatScan] = useState(false);
  const [scanCue, setScanCue] = useState<ScanCue | null>(null);
  const [scanCueText, setScanCueText] = useState("");
  const { showSuccess, showError, showInfo, AlertDialog } = useAdminAlert();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef("");
  const lastScanAtRef = useRef(0);
  const busyRef = useRef(false);

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
    () =>
      lastGuest
        ? seatingWhatsAppForRsvp(lastGuest, site, { toGuest: true, reception })
        : null,
    [lastGuest, reception, site],
  );

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

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
    armScanFeedback();
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
          const now = Date.now();
          if (busyRef.current) return;
          if (decoded === lastScanRef.current && now - lastScanAtRef.current < 6000) return;
          lastScanRef.current = decoded;
          lastScanAtRef.current = now;
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
    armScanFeedback();
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
        const message = data.error || "Check-in refusé.";
        setLastGuest(data.rsvp || null);
        setRepeatScan(false);
        setScanCue("error");
        setScanCueText(message);
        playScanCue("error");
        showError(message);
        return;
      }

      const guest = data.rsvp || null;
      const repeat = Boolean(data.alreadyCheckedIn);
      if (guest) onCheckedIn?.(guest);
      setLastGuest(guest);
      setRepeatScan(repeat);
      setScanCue(repeat ? "repeat" : "success");
      setScanCueText(repeat ? "Déjà enregistré" : "Présence enregistrée");
      playScanCue(repeat ? "repeat" : "success");

      const roleLabel = guest && hasEventRole(guest) ? formatEventRoles(guest.eventRoles) : "";
      const whoName = guest ? displayName(guest.name) : "Invité";
      const who = roleLabel ? `${whoName} — ${roleLabel}` : whoName;
      const place = guest ? formatScanPlace(guest, repeat) : "";
      const guestLines = guest
        ? formatCheckInGuestLines(resolveCheckInGuestDetails(guest, site, guestOfLabels))
        : "";
      const wa = guest
        ? seatingWhatsAppForRsvp(guest, site, { toGuest: true, reception })
        : null;
      const waAction = wa?.url
        ? {
            label: "Envoyer place WhatsApp",
            href: wa.url,
            onActivate: () => {
              if (guest) onPlaceSend?.(guest.id);
            },
          }
        : undefined;
      const senderLine = wa?.url
        ? senderPhone
          ? `\n\nEnvoyez depuis ${senderPhone} : ouvrez WhatsApp avec ce compte sur ce téléphone.`
          : "\n\nLe message part du compte WhatsApp ouvert sur ce téléphone."
        : "";
      const details = [
        repeat ? `${who} est déjà enregistré(e).` : `${who} — présence enregistrée.`,
        guestLines ? `\n\n${guestLines}` : "",
        place ? `\n\n${place}` : "",
        senderLine,
      ].join("");

      if (repeat) showInfo(details, "Déjà check-in", waAction, wa?.message);
      else showSuccess(details, "Check-in réussi", waAction, wa?.message);
      setManualToken("");
    } catch {
      setScanCue("error");
      setScanCueText("Erreur réseau lors du check-in.");
      playScanCue("error");
      showError("Erreur réseau lors du check-in.");
    } finally {
      setBusy(false);
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
            Scannez le QR code de la carte d’invitation pour marquer la présence. Un son et une
            vibration confirment le résultat, puis la fiche s’ouvre à l’écran. Le premier scan
            affiche la table et le siège, ou le rôle si l’invité est hors plan. Un second scan
            rappelle aussi la date, l’heure et le compte du premier check-in. Si le QR est perdu,
            retrouvez l’invité ci-dessous.
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

          {scanCue ? (
            <p
              className={
                scanCue === "success"
                  ? "border border-champagne bg-champagne/15 px-3 py-2 text-sm text-mist"
                  : scanCue === "repeat"
                    ? "border border-champagne px-3 py-2 text-sm text-champagne"
                    : "border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
              }
              role="status"
            >
              {scanCueText}
            </p>
          ) : null}

          {lastGuest ? (
            <div className="border border-line bg-forest p-4 text-sm">
              <p className="text-mist">{displayName(lastGuest.name)}</p>
              {hasEventRole(lastGuest) ? (
                <p className="mt-1 text-xs tracking-[0.12em] text-champagne uppercase">
                  {formatEventRoles(lastGuest.eventRoles)}
                </p>
              ) : null}
              <p className="mt-1 text-soft">{displayPhone(lastGuest.phone)}</p>
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
                <>
                  <a
                    href={seatingWa.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary mt-4 inline-flex w-full justify-center no-underline"
                    onClick={() => lastGuest && onPlaceSend?.(lastGuest.id)}
                  >
                    Envoyer place par WhatsApp
                  </a>
                  {seatingWa.message ? (
                    <CopyWhatsAppButton
                      message={seatingWa.message}
                      className="btn-ghost mt-2 inline-flex w-full justify-center"
                    />
                  ) : null}
                  <div className="mt-2">
                    <WhatsAppSenderHint phone={senderPhone} />
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
