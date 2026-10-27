"use client";

import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import {
  GUEST_EXPORT_HEADERS,
  SEATING_EXPORT_HEADERS,
  guestExportRow,
  seatingExportRows,
  type GuestExportContext,
} from "@/lib/guest-export";
import type { Rsvp, RsvpReminderLog, SeatingPlanContent, SiteContent } from "@/lib/types";

type Props = {
  rsvps: Rsvp[];
  site: SiteContent;
  seatingPlan: SeatingPlanContent;
  guestOfLabels: Record<string, string>;
  reminders: Record<string, RsvpReminderLog>;
  showGuestPii: boolean;
};

export function AdminPdfExport({
  rsvps,
  site,
  seatingPlan,
  guestOfLabels,
  reminders,
  showGuestPii,
}: Props) {
  const { showSuccess, showError, AlertDialog } = useAdminAlert();
  const [busy, setBusy] = useState<string | null>(null);

  const title = useMemo(() => {
    const custom = site.eventTitle?.fr?.trim();
    if (custom) return custom;
    return [site.partnerOne, site.partnerTwo].filter(Boolean).join(" & ");
  }, [site]);

  const exportContext = useMemo<GuestExportContext>(
    () => ({
      guestOfLabels,
      partnerOne: site.partnerOne,
      partnerTwo: site.partnerTwo,
      reminderPlans: site.whatsappReminders,
      reminders,
      showGuestPii,
    }),
    [guestOfLabels, reminders, showGuestPii, site.partnerOne, site.partnerTwo, site.whatsappReminders],
  );

  function exportRsvpPdf() {
    setBusy("rsvp");
    try {
      const doc = new jsPDF({ orientation: "landscape", format: "a3" });
      doc.setFontSize(14);
      doc.text(`RSVP — ${title}`, 14, 16);
      doc.setFontSize(9);
      doc.text(new Date().toLocaleString("fr-FR"), 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [Array.from(GUEST_EXPORT_HEADERS)],
        body: rsvps.map((rsvp) => guestExportRow(rsvp, exportContext).map((value) => String(value ?? ""))),
        styles: { fontSize: 7, cellPadding: 1.4, overflow: "linebreak" },
        headStyles: { fillColor: [59, 36, 22] },
        horizontalPageBreak: true,
        horizontalPageBreakRepeat: 0,
      });

      doc.save(`rsvp-${Date.now()}.pdf`);
      showSuccess("PDF RSVP téléchargé.");
    } catch {
      showError("Export PDF impossible.");
    } finally {
      setBusy(null);
    }
  }

  function exportSeatingPdf() {
    setBusy("seating");
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(14);
      doc.text(`Plan de table — ${title}`, 14, 16);
      doc.setFontSize(9);
      doc.text(new Date().toLocaleString("fr-FR"), 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [Array.from(SEATING_EXPORT_HEADERS)],
        body: seatingExportRows(rsvps, seatingPlan, exportContext),
        styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
        headStyles: { fillColor: [59, 36, 22] },
      });

      doc.save(`plan-table-${Date.now()}.pdf`);
      showSuccess("PDF plan de table téléchargé.");
    } catch {
      showError("Export PDF impossible.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section id="admin-pdf" className="mt-10 min-w-0 max-w-full scroll-mt-28 space-y-4">
      {AlertDialog}
      <div>
        <h2 className="section-title text-2xl text-mist sm:text-3xl">Exports PDF</h2>
        <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
          Liste RSVP et plan de table pour le suivi papier : lien, côté, places, rôles, occupation
          et check-in.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-ghost disabled:opacity-50"
          disabled={!rsvps.length || busy !== null}
          onClick={exportRsvpPdf}
        >
          {busy === "rsvp" ? "…" : "PDF — RSVP"}
        </button>
        <button
          type="button"
          className="btn-ghost disabled:opacity-50"
          disabled={busy !== null}
          onClick={exportSeatingPdf}
        >
          {busy === "seating" ? "…" : "PDF — Plan de table"}
        </button>
      </div>
    </section>
  );
}
