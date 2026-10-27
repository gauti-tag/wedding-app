import {
  GUEST_EXPORT_COLUMN_WIDTHS,
  GUEST_EXPORT_HEADERS,
  guestExportExcelCells,
  guestExportRow,
  type GuestExportContext,
} from "@/lib/guest-export";
import type { Rsvp } from "@/lib/types";

export async function downloadRsvpExcel(rsvps: Rsvp[], ctx: GuestExportContext) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  const header = GUEST_EXPORT_HEADERS.map((value) => ({ value, fontWeight: "bold" as const }));
  const rows = rsvps.map((rsvp) => guestExportExcelCells(guestExportRow(rsvp, ctx)));

  await writeExcelFile([header, ...rows], {
    sheet: "RSVP",
    columns: GUEST_EXPORT_COLUMN_WIDTHS.map((width) => ({ width })),
  }).toFile("rsvp-mariage.xlsx");
}
