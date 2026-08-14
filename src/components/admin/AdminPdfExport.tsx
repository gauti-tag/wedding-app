"use client";

import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { formatSeatingLabel } from "@/lib/seating";
import type { Rsvp, SeatingPlanContent, SiteContent } from "@/lib/types";

type Props = {
  rsvps: Rsvp[];
  site: SiteContent;
  seatingPlan: SeatingPlanContent;
  guestOfLabels: Record<string, string>;
};

export function AdminPdfExport({ rsvps, site, seatingPlan, guestOfLabels }: Props) {
  const { showSuccess, showError, AlertDialog } = useAdminAlert();
  const [busy, setBusy] = useState<string | null>(null);

  const title = useMemo(() => {
    const custom = site.eventTitle?.fr?.trim();
    if (custom) return custom;
    return [site.partnerOne, site.partnerTwo].filter(Boolean).join(" & ");
  }, [site]);

  function exportRsvpPdf() {
    setBusy("rsvp");
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(14);
      doc.text(`RSVP — ${title}`, 14, 16);
      doc.setFontSize(9);
      doc.text(new Date().toLocaleString("fr-FR"), 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [["Nom", "Tél.", "Statut", "Invité de", "Table", "Check-in"]],
        body: rsvps.map((r) => [
          r.name,
          r.phone || "—",
          r.status,
          guestOfLabels[r.guestOf] || r.guestOf || "—",
          formatSeatingLabel(r.tableLabel, r.seatLabel) || "—",
          r.checkedInAt ? new Date(r.checkedInAt).toLocaleString("fr-FR") : "—",
        ]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 36, 22] },
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
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text(`Plan de table — ${title}`, 14, 16);
      doc.setFontSize(9);
      doc.text(new Date().toLocaleString("fr-FR"), 14, 22);

      const yes = rsvps.filter((r) => r.status === "yes");
      const rows: string[][] = [];

      for (const table of seatingPlan.tables) {
        const seated = yes.filter(
          (r) =>
            (r.tableLabel || "").trim().toLowerCase() === table.label.trim().toLowerCase(),
        );
        if (seated.length === 0) {
          rows.push([`Table ${table.label}`, "—", table.seats.join(", ") || "—"]);
        } else {
          for (const g of seated) {
            rows.push([
              `Table ${table.label}`,
              g.name,
              g.seatLabel || "—",
            ]);
          }
        }
      }

      const unassigned = yes.filter((r) => !(r.tableLabel || "").trim());
      for (const g of unassigned) {
        rows.push(["Sans table", g.name, "—"]);
      }

      autoTable(doc, {
        startY: 28,
        head: [["Table", "Invité", "Siège"]],
        body: rows,
        styles: { fontSize: 9, cellPadding: 2 },
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
          Téléchargez la liste RSVP ou le plan de table pour impression / partage.
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
