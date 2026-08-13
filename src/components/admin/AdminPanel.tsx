"use client";

import { useMemo, useState, type FormEvent, type MouseEvent } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";
import { AdminCheckIn } from "@/components/admin/AdminCheckIn";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminDessertsEditor } from "@/components/admin/AdminDessertsEditor";
import { AdminDrinksEditor } from "@/components/admin/AdminDrinksEditor";
import { AdminInviteQr } from "@/components/admin/AdminInviteQr";
import { AdminMcRundownEditor } from "@/components/admin/AdminMcRundownEditor";
import { AdminMenuEditor } from "@/components/admin/AdminMenuEditor";
import { AdminScheduleEditor } from "@/components/admin/AdminScheduleEditor";
import { AdminSeatingEditor } from "@/components/admin/AdminSeatingEditor";
import { AdminSiteEditor } from "@/components/admin/AdminSiteEditor";
import { AdminStoryEditor } from "@/components/admin/AdminStoryEditor";
import { AdminUsersEditor } from "@/components/admin/AdminUsersEditor";
import { maskName, maskPhone } from "@/lib/mask-pii";
import { MAX_HERO_PHOTOS } from "@/lib/hero-carousel";
import { ALBUM_IMAGE_TARGETS } from "@/lib/image-targets";
import { formatOptionalDatetimeLabel } from "@/lib/rsvp-deadline";
import { formatSeatingLabel } from "@/lib/seating";
import { hasPermission, roleLabels, type Permission } from "@/lib/roles";
import type {
  AdminUserPublic,
  AuditEntry,
  DessertsContent,
  DrinksContent,
  McRundownContent,
  MenuContent,
  Photo,
  PhotoAlbum,
  Rsvp,
  RsvpReminderLog,
  ScheduleContent,
  SeatingPlanContent,
  SiteContent,
  StoryContent,
} from "@/lib/types";

const ADMIN_NAV_OFFSET = 96;

function formatAdminDate(iso: string, withTime = false) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  if (!withTime) return `${dd}/${mm}/${yyyy}`;
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function scrollToAdminSection(hash: string) {
  const id = hash.replace(/^#/, "");
  const el = document.getElementById(id);
  if (!el) return;

  const target = el.getBoundingClientRect().top + window.scrollY - ADMIN_NAV_OFFSET;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    window.scrollTo({ top: target, behavior: "auto" });
    history.replaceState(null, "", hash);
    return;
  }

  const start = window.scrollY;
  const distance = target - start;
  const duration = Math.min(1000, Math.max(450, Math.abs(distance) * 0.45));
  let startTime: number | null = null;

  function step(timestamp: number) {
    if (startTime === null) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    window.scrollTo(0, start + distance * easeInOutCubic(progress));
    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }
    history.replaceState(null, "", hash);
  }

  requestAnimationFrame(step);
}

/** Libellés « invité de » depuis la config RSVP (fallback hôtes). */
function guestOfLabelsFromSite(
  site: Pick<SiteContent, "partnerOne" | "partnerTwo" | "rsvpConfig" | "eventTitle">,
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

type Props = {
  currentUser: AdminUserPublic;
  initialPhotos: Photo[];
  initialRsvps: Rsvp[];
  initialReminders: Record<string, RsvpReminderLog>;
  initialSite: SiteContent;
  initialStory: StoryContent;
  initialSchedule: ScheduleContent;
  initialMcRundown: McRundownContent;
  initialSeatingPlan: SeatingPlanContent;
  initialMenu: MenuContent;
  initialDrinks: DrinksContent;
  initialDesserts: DessertsContent;
  initialUsers: AdminUserPublic[];
  initialAudit: AuditEntry[];
};

const albumLabels: Record<PhotoAlbum, string> = {
  hero: "Hero (carrousel, max 6)",
  story: "Notre histoire",
  gallery: "Galerie",
};

const adminNav: { href: string; label: string; permission: Permission }[] = [
  { href: "#admin-dashboard", label: "Tableau de bord", permission: "view_dashboard" },
  { href: "#admin-invite-qr", label: "QR invitation", permission: "manage_content" },
  { href: "#admin-photos", label: "Photos", permission: "manage_photos" },
  { href: "#admin-site", label: "Événement & site", permission: "manage_content" },
  { href: "#admin-story", label: "Histoire", permission: "manage_content" },
  { href: "#admin-schedule", label: "Programme", permission: "manage_content" },
  { href: "#admin-mc-rundown", label: "Feuille MC", permission: "manage_content" },
  { href: "#admin-menu", label: "Menu", permission: "manage_content" },
  { href: "#admin-desserts", label: "Desserts", permission: "manage_content" },
  { href: "#admin-drinks", label: "Boissons", permission: "manage_content" },
  { href: "#admin-rsvp", label: "RSVP", permission: "view_rsvp" },
  { href: "#admin-seating", label: "Plan de table", permission: "view_rsvp" },
  { href: "#admin-checkin", label: "Check-in", permission: "check_in" },
  { href: "#admin-users", label: "Utilisateurs", permission: "manage_users" },
  { href: "#admin-audit", label: "Audit", permission: "view_audit" },
];

/** Formats alignés sur les cadres d’affichage (remplissage du cadre prévu). */
const albumSizeGuides: Record<
  PhotoAlbum,
  { ratio: string; size: string; tip: string; slots?: string }
> = {
  hero: {
    ratio: "Paysage 16:9",
    size: `${ALBUM_IMAGE_TARGETS.hero.label} — remplit le cadre hero`,
    tip: "Jusqu’à 6 photos plein écran. Redimensionnées à 1920×1080 pour occuper tout le hero.",
    slots: "1 à 6 images — défilement en boucle",
  },
  story: {
    ratio: "1ʳᵉ photo 16:10 · 2ᵉ et 3ᵉ en 4:5",
    size: "1600 × 1000 puis 1200 × 1500 — remplit chaque emplacement",
    tip: "Seules les 3 premières photos « Notre histoire » s’affichent, chacune dans son cadre.",
    slots: "Grande (haut) : paysage · Deux petites : portrait",
  },
  gallery: {
    ratio: "Portrait 4:5",
    size: `${ALBUM_IMAGE_TARGETS.gallery.label} — remplit la tuile galerie`,
    tip: "Chaque photo occupe un cadre 4:5 (1200×1500).",
  },
};

export function AdminPanel({
  currentUser,
  initialPhotos,
  initialRsvps,
  initialReminders,
  initialSite,
  initialStory,
  initialSchedule,
  initialMcRundown,
  initialSeatingPlan,
  initialMenu,
  initialDrinks,
  initialDesserts,
  initialUsers,
  initialAudit,
}: Props) {
  const can = (permission: Permission) => hasPermission(currentUser.role, permission);
  const navItems = adminNav.filter((item) => can(item.permission));

  const [photos, setPhotos] = useState(initialPhotos);
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [reminders, setReminders] = useState(initialReminders);
  const [site, setSite] = useState(initialSite);
  const [album, setAlbum] = useState<PhotoAlbum>("gallery");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const { showSuccess, showError, showInfo, AlertDialog } = useAdminAlert();
  const [resendBusyId, setResendBusyId] = useState<string | null>(null);
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);
  const [blockBusyId, setBlockBusyId] = useState<string | null>(null);
  const [rsvpPage, setRsvpPage] = useState(1);
  const [rsvpQuery, setRsvpQuery] = useState("");
  const [revealedRsvpIds, setRevealedRsvpIds] = useState<Record<string, true>>({});
  const canRevealPii = currentUser.role === "admin";
  const canBlockRsvp = currentUser.role === "admin";

  const guestOfLabels = useMemo(() => guestOfLabelsFromSite(site), [site]);
  const RSVP_PAGE_SIZE = 10;

  const filteredRsvps = useMemo(() => {
    const q = rsvpQuery.trim().toLowerCase();
    if (!q) return rsvps;
    const qDigits = q.replace(/[\s.\-()]/g, "");
    return rsvps.filter((r) => {
      const guestLabel = (guestOfLabels[r.guestOf] || r.guestOf || "").toLowerCase();
      const haystack = [
        r.name,
        r.phone,
        r.status,
        guestLabel,
        r.message,
        r.tableLabel,
        r.seatLabel,
        r.ticketToken,
        r.checkedInAt ? "check-in" : "",
        r.emailSentAt ? "whatsapp" : "",
      ]
        .join(" ")
        .toLowerCase();
      if (haystack.includes(q)) return true;
      if (qDigits && r.phone.replace(/[\s.\-()]/g, "").includes(qDigits)) return true;
      return false;
    });
  }, [rsvps, rsvpQuery, guestOfLabels]);

  const rsvpPageCount = Math.max(1, Math.ceil(filteredRsvps.length / RSVP_PAGE_SIZE));
  const currentRsvpPage = Math.min(rsvpPage, rsvpPageCount);
  const pagedRsvps = useMemo(() => {
    const start = (currentRsvpPage - 1) * RSVP_PAGE_SIZE;
    return filteredRsvps.slice(start, start + RSVP_PAGE_SIZE);
  }, [filteredRsvps, currentRsvpPage]);

  async function onUpload(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      showInfo("Choisissez une image.");
      return;
    }
    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    form.append("album", album);
    form.append("caption", caption);

    const res = await fetch("/api/photos", { method: "POST", body: form });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      showError(data.error || "Upload impossible.");
      return;
    }

    setPhotos((prev) => {
      if (data.photo.album !== "hero") return [...prev, data.photo];
      const heroes = prev
        .filter((p) => p.album === "hero")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const keepIds = new Set(
        heroes.slice(Math.max(0, heroes.length - (MAX_HERO_PHOTOS - 1))).map((p) => p.id),
      );
      return [
        ...prev.map((p) =>
          p.album === "hero" && !keepIds.has(p.id) ? { ...p, album: "gallery" as const } : p,
        ),
        data.photo,
      ];
    });
    setFile(null);
    setCaption("");
    showSuccess(
      data.resizedTo
        ? `Photo ajoutée et ajustée au cadre ${data.resizedTo.label}.`
        : "Photo ajoutée.",
    );
  }

  async function onDelete(id: string) {
    if (!confirm("Supprimer cette photo ?")) return;
    const res = await fetch("/api/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json();
      showError(data.error || "Suppression impossible.");
      return;
    }
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  }

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  function onAdminNavClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    scrollToAdminSection(href);
  }

  async function onWhatsAppTicket(id: string) {
    setResendBusyId(id);
    try {
      const res = await fetch("/api/rsvp/resend-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "WhatsApp impossible.");
        return;
      }
      setRsvps((prev) => prev.map((r) => (r.id === id ? data.rsvp : r)));
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      }
      showSuccess("WhatsApp ouvert — envoyez le message à l’invité.");
    } catch {
      showError("WhatsApp impossible.");
    } finally {
      setResendBusyId(null);
    }
  }

  async function onWhatsAppReminder(id: string, reminderId: string, reminderLabel: string) {
    const busyKey = `${id}:${reminderId}`;
    setResendBusyId(busyKey);
    try {
      const res = await fetch("/api/rsvp/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reminderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Rappel WhatsApp impossible.");
        return;
      }
      if (data.reminder) {
        setReminders((prev) => ({ ...prev, [id]: data.reminder }));
      }
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      }
      showSuccess(`WhatsApp ouvert — envoyez le rappel « ${reminderLabel} ».`);
    } catch {
      showError("Rappel WhatsApp impossible.");
    } finally {
      setResendBusyId(null);
    }
  }

  async function onNextReminder(reminderId: string, reminderLabel: string) {
    const next = rsvps.find(
      (r) => r.status === "yes" && !r.blockedAt && !reminders[r.id]?.[reminderId],
    );
    if (!next) {
      showInfo(
        `Tous les invités « oui » ont déjà le rappel « ${reminderLabel} » (ou aucun éligible).`,
      );
      return;
    }
    await onWhatsAppReminder(next.id, reminderId, reminderLabel);
  }

  async function onToggleBlockRsvp(id: string, name: string, currentlyBlocked: boolean) {
    const nextBlocked = !currentlyBlocked;
    const ok = confirm(
      nextBlocked
        ? `Bloquer ${name} ? La carte et le check-in afficheront « non autorisé à l’événement ».`
        : `Débloquer ${name} ? L’accès à l’événement sera rétabli.`,
    );
    if (!ok) return;
    setBlockBusyId(id);
    try {
      const res = await fetch("/api/rsvp/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, blocked: nextBlocked }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Action impossible.");
        return;
      }
      setRsvps((prev) => prev.map((r) => (r.id === id ? data.rsvp : r)));
      showSuccess(nextBlocked ? `${name} a été bloqué(e).` : `${name} a été débloqué(e).`);
    } catch {
      showError("Action impossible.");
    } finally {
      setBlockBusyId(null);
    }
  }

  async function onDeleteRsvp(id: string, name: string) {
    if (!confirm(`Supprimer la réponse de ${name} ?`)) return;
    setDeleteBusyId(id);
    try {
      const res = await fetch("/api/rsvp", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Suppression impossible.");
        return;
      }
      setRsvps((prev) => {
        const next = prev.filter((r) => r.id !== id);
        const nextPageCount = Math.max(1, Math.ceil(next.length / RSVP_PAGE_SIZE));
        setRsvpPage((page) => Math.min(page, nextPageCount));
        return next;
      });
      showSuccess("RSVP supprimé.");
    } catch {
      showError("Suppression impossible.");
    } finally {
      setDeleteBusyId(null);
    }
  }

  function exportCsv() {
    const header = [
      "name",
      "phone",
      "status",
      "guestOf",
      "message",
      "table",
      "seat",
      "ticketToken",
      "submittedAt",
      "whatsappSentAt",
      "ticketViewedAt",
      "ticketViewCount",
      "checkedInAt",
      "blockedAt",
    ];
    const rows = rsvps.map((r) =>
      [
        r.name,
        r.phone,
        r.status,
        guestOfLabels[r.guestOf] || r.guestOf,
        r.message,
        r.tableLabel || "",
        r.seatLabel || "",
        r.ticketToken,
        r.createdAt,
        r.emailSentAt || "",
        r.ticketViewedAt || "",
        String(r.ticketViewCount ?? 0),
        r.checkedInAt || "",
        r.blockedAt || "",
      ]
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rsvp-mariage.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="section-shell py-10 md:py-14">
      {AlertDialog}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Espace couple</p>
          <h1 className="section-title mt-3 text-4xl text-mist md:text-5xl">Administration</h1>
          <p className="mt-3 max-w-xl text-sm font-normal text-soft">
            Connecté : {currentUser.name} · {roleLabels[currentUser.role]}
          </p>
        </div>
        <div className="flex gap-3">
          <a href="/" className="btn-ghost">
            Voir le site
          </a>
          <button type="button" onClick={onLogout} className="btn-primary">
            Déconnexion
          </button>
        </div>
      </div>

      {navItems.length > 0 ? (
        <nav
          aria-label="Rubriques de l’espace couple"
          className="sticky top-0 z-30 -mx-4 mt-8 border-y border-line bg-ivory/95 px-4 py-3 backdrop-blur-md md:-mx-0 md:px-0"
        >
          <ul className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => (
              <li key={item.href} className="shrink-0">
                <a
                  href={item.href}
                  onClick={(event) => onAdminNavClick(event, item.href)}
                  className="nav-link inline-block px-3 py-2 text-[0.68rem] tracking-[0.16em] text-champagne uppercase no-underline transition-colors duration-300 hover:text-mist"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {can("view_dashboard") || can("view_rsvp") || can("check_in") ? (
        <AdminDashboard
          rsvps={rsvps}
          site={site}
          guestOfLabels={guestOfLabels}
          onExportCsv={exportCsv}
          canExport={can("view_rsvp")}
        />
      ) : null}

      {can("manage_content") ? (
        <AdminInviteQr
          partnerOne={site.partnerOne}
          partnerTwo={site.partnerTwo}
          weddingDateLabel={site.hero.weddingDateLabel}
        />
      ) : null}

      {can("manage_photos") ? (
      <section
        id="admin-photos"
        className="mt-12 grid scroll-mt-28 gap-10 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <form onSubmit={onUpload} className="space-y-4 border border-line bg-white p-6">
          <h2 className="section-title text-3xl text-mist">Ajouter une photo</h2>
          <div>
            <label className="label" htmlFor="album">
              Album
            </label>
            <select
              id="album"
              className="field"
              value={album}
              onChange={(e) => setAlbum(e.target.value as PhotoAlbum)}
            >
              {Object.entries(albumLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <aside className="space-y-2 border border-line bg-forest p-4 text-sm leading-relaxed text-soft">
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">
              Format recommandé — {albumLabels[album]}
            </p>
            <p>
              <span className="text-mist">Ratio d’espace : </span>
              {albumSizeGuides[album].ratio}
            </p>
            <p>
              <span className="text-mist">Taille idéale : </span>
              {albumSizeGuides[album].size}
            </p>
            {albumSizeGuides[album].slots ? (
              <p>
                <span className="text-mist">Emplacements : </span>
                {albumSizeGuides[album].slots}
              </p>
            ) : null}
            <p>{albumSizeGuides[album].tip}</p>
            <p className="text-xs text-soft/90">
              Fichier JPG ou WebP, max 8 Mo. L’image remplit le cadre prévu (sans être étirée).
            </p>
          </aside>

          <div>
            <label className="label" htmlFor="caption">
              Légende
            </label>
            <input
              id="caption"
              className="field"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Optionnel"
            />
          </div>
          <div>
            <label className="label" htmlFor="file">
              Fichier image
            </label>
            <input
              id="file"
              type="file"
              accept="image/*"
              className="field"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? "Upload…" : "Uploader"}
          </button>
        </form>

        <div className="space-y-4">
          <h2 className="section-title text-3xl text-mist">Photos ({photos.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {photos.length === 0 ? (
              <p className="text-sm text-soft">Aucune photo pour le moment.</p>
            ) : (
              photos.map((photo) => (
                <article key={photo.id} className="overflow-hidden border border-line bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.caption || "Photo"}
                    className="aspect-[4/3] h-auto w-full object-cover"
                  />
                  <div className="space-y-2 p-3">
                    <p className="text-xs tracking-[0.14em] text-gold uppercase">
                      {albumLabels[photo.album]}
                    </p>
                    <p className="truncate text-sm text-mist">{photo.caption || "Sans légende"}</p>
                    <button
                      type="button"
                      onClick={() => onDelete(photo.id)}
                      className="text-xs tracking-[0.14em] text-soft uppercase hover:text-champagne"
                    >
                      Supprimer
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
      ) : null}

      {can("manage_content") ? (
        <>
          <AdminSiteEditor initialSite={site} onSaved={setSite} />
          <AdminStoryEditor initialStory={initialStory} />
          <AdminScheduleEditor initialSchedule={initialSchedule} />
          <AdminMcRundownEditor
            initialRundown={initialMcRundown}
            coupleNames={`${site.partnerOne} & ${site.partnerTwo}`}
            dateLabel={site.hero.weddingDateLabel.fr || site.weddingDate}
          />
          <AdminMenuEditor initialMenu={initialMenu} />
          <AdminDessertsEditor initialDesserts={initialDesserts} />
          <AdminDrinksEditor initialDrinks={initialDrinks} />
        </>
      ) : null}

      {can("view_rsvp") ? (
      <section id="admin-rsvp" className="mt-14 scroll-mt-28">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title text-3xl font-semibold text-mist">RSVP</h2>
          <button type="button" onClick={exportCsv} className="btn-ghost" disabled={!rsvps.length}>
            Exporter CSV
          </button>
        </div>

        {can("manage_rsvp") ? (
          <div className="mb-6 border border-line bg-white/80 px-4 py-4 md:px-5">
            <p className="text-sm font-medium text-mist">Rappels WhatsApp</p>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-soft">
              Messages prêts pour les invités confirmés (« oui »). Les rappels se planifient
              dynamiquement dans Couple & hero.
            </p>
            {site.whatsappReminders.length === 0 ? (
              <p className="mt-3 text-xs text-soft">
                Aucun rappel planifié. Ajoutez-en dans Couple & hero.
              </p>
            ) : (
              <>
                <ul className="mt-3 space-y-1 text-xs text-soft">
                  {site.whatsappReminders.map((reminder) => (
                    <li key={reminder.id}>
                      <span className="text-mist">{reminder.label}</span> ·{" "}
                      {formatOptionalDatetimeLabel(reminder.date) || "Date à définir"}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  {site.whatsappReminders.map((reminder) => (
                    <button
                      key={reminder.id}
                      type="button"
                      className="btn-ghost !px-4 !py-2 text-xs"
                      disabled={Boolean(resendBusyId)}
                      onClick={() => void onNextReminder(reminder.id, reminder.label)}
                    >
                      Prochain « {reminder.label} »
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : null}

        <div className="mb-4">
          <label className="label" htmlFor="rsvp-search">
            Rechercher
          </label>
          <input
            id="rsvp-search"
            type="search"
            className="field max-w-xl"
            value={rsvpQuery}
            onChange={(e) => {
              setRsvpQuery(e.target.value);
              setRsvpPage(1);
            }}
            placeholder="Nom, téléphone, statut, invité(e) de…"
            autoComplete="off"
          />
          {rsvpQuery.trim() ? (
            <p className="mt-2 text-xs tracking-[0.12em] text-soft uppercase">
              {filteredRsvps.length} résultat{filteredRsvps.length > 1 ? "s" : ""}
            </p>
          ) : null}
        </div>

        <div className="overflow-x-auto border border-line">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-forest text-xs tracking-[0.14em] text-soft uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Téléphone</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Invité(e) de</th>
                <th className="px-4 py-3 font-medium">Table</th>
                <th className="px-4 py-3 font-medium">Suivi</th>
                <th className="px-4 py-3 font-medium">Check-in</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-soft">
                    Aucune réponse pour l’instant.
                  </td>
                </tr>
              ) : filteredRsvps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-soft">
                    Aucun résultat pour « {rsvpQuery.trim()} ».
                  </td>
                </tr>
              ) : (
                pagedRsvps.map((rsvp) => {
                  const revealed = canRevealPii && Boolean(revealedRsvpIds[rsvp.id]);
                  const displayName = revealed ? rsvp.name : maskName(rsvp.name);
                  const displayPhone = revealed
                    ? rsvp.phone || "—"
                    : maskPhone(rsvp.phone || "");

                  return (
                  <tr key={rsvp.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <div className="text-mist">{displayName}</div>
                      {canRevealPii ? (
                        <button
                          type="button"
                          className="mt-1 text-left text-[10px] tracking-[0.12em] text-champagne uppercase hover:text-mist"
                          onClick={() =>
                            setRevealedRsvpIds((prev) => {
                              const next = { ...prev };
                              if (next[rsvp.id]) delete next[rsvp.id];
                              else next[rsvp.id] = true;
                              return next;
                            })
                          }
                        >
                          {revealed ? "Masquer" : "Afficher"}
                        </button>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-soft">{displayPhone}</td>
                    <td className="px-4 py-3 text-champagne">{rsvp.status}</td>
                    <td className="px-4 py-3 text-mist">
                      {guestOfLabels[rsvp.guestOf] || rsvp.guestOf || "—"}
                    </td>
                    <td className="px-4 py-3 text-soft">
                      {formatSeatingLabel(rsvp.tableLabel, rsvp.seatLabel) || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs leading-5 text-soft" suppressHydrationWarning>
                      <div>
                        <span className="text-mist">Soumis</span> ·{" "}
                        {formatAdminDate(rsvp.createdAt, true)}
                      </div>
                      <div>
                        <span className="text-mist">WhatsApp</span> ·{" "}
                        {rsvp.emailSentAt ? formatAdminDate(rsvp.emailSentAt, true) : "—"}
                      </div>
                      <div>
                        <span className="text-mist">Carte</span> ·{" "}
                        {rsvp.ticketViewedAt ? formatAdminDate(rsvp.ticketViewedAt, true) : "—"}
                      </div>
                      <div>
                        <span className="text-mist">Vues</span> · {rsvp.ticketViewCount ?? 0}
                      </div>
                      {rsvp.status === "yes" && site.whatsappReminders.length > 0 ? (
                        <>
                          {site.whatsappReminders.map((reminder) => (
                            <div key={reminder.id}>
                              <span className="text-mist">{reminder.label}</span> ·{" "}
                              {reminders[rsvp.id]?.[reminder.id]
                                ? formatAdminDate(reminders[rsvp.id][reminder.id], true)
                                : "—"}
                            </div>
                          ))}
                        </>
                      ) : null}
                      {rsvp.blockedAt ? (
                        <div className="text-red-800">
                          <span className="text-mist">Accès</span> · Bloqué
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-soft" suppressHydrationWarning>
                      {rsvp.checkedInAt ? formatAdminDate(rsvp.checkedInAt, true) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        {rsvp.status !== "no" ? (
                          <>
                            <a
                              href={`/ticket/${rsvp.ticketToken}?preview=1`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs tracking-[0.12em] text-champagne uppercase no-underline hover:text-mist"
                            >
                              Carte
                            </a>
                            {can("manage_rsvp") ? (
                              <button
                                type="button"
                                disabled={resendBusyId === rsvp.id}
                                onClick={() => void onWhatsAppTicket(rsvp.id)}
                                className="text-left text-xs tracking-[0.12em] text-soft uppercase hover:text-champagne disabled:opacity-50"
                              >
                                {resendBusyId === rsvp.id ? "Ouverture…" : "WhatsApp"}
                              </button>
                            ) : null}
                            {can("manage_rsvp") &&
                            rsvp.status === "yes" &&
                            !rsvp.blockedAt &&
                            site.whatsappReminders.length > 0
                              ? site.whatsappReminders.map((reminder) => (
                                  <button
                                    key={reminder.id}
                                    type="button"
                                    disabled={resendBusyId === `${rsvp.id}:${reminder.id}`}
                                    onClick={() =>
                                      void onWhatsAppReminder(
                                        rsvp.id,
                                        reminder.id,
                                        reminder.label,
                                      )
                                    }
                                    className="text-left text-xs tracking-[0.12em] text-soft uppercase hover:text-champagne disabled:opacity-50"
                                  >
                                    {resendBusyId === `${rsvp.id}:${reminder.id}`
                                      ? "Ouverture…"
                                      : `Rappel ${reminder.label}`}
                                  </button>
                                ))
                              : null}
                          </>
                        ) : null}
                        {canBlockRsvp ? (
                          <button
                            type="button"
                            disabled={blockBusyId === rsvp.id}
                            onClick={() =>
                              void onToggleBlockRsvp(rsvp.id, rsvp.name, Boolean(rsvp.blockedAt))
                            }
                            className={`text-left text-xs tracking-[0.12em] uppercase disabled:opacity-50 ${
                              rsvp.blockedAt
                                ? "text-champagne hover:text-mist"
                                : "text-red-700 hover:text-red-900"
                            }`}
                          >
                            {blockBusyId === rsvp.id
                              ? "…"
                              : rsvp.blockedAt
                                ? "Débloquer"
                                : "Bloquer"}
                          </button>
                        ) : null}
                        {can("manage_rsvp") ? (
                          <button
                            type="button"
                            disabled={deleteBusyId === rsvp.id}
                            onClick={() => void onDeleteRsvp(rsvp.id, rsvp.name)}
                            className="text-left text-xs tracking-[0.12em] text-red-700 uppercase hover:text-red-900 disabled:opacity-50"
                          >
                            {deleteBusyId === rsvp.id ? "Suppression…" : "Supprimer"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredRsvps.length > RSVP_PAGE_SIZE ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs tracking-[0.12em] text-soft uppercase">
              Page {currentRsvpPage} / {rsvpPageCount} · {filteredRsvps.length} réponse
              {filteredRsvps.length > 1 ? "s" : ""}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-ghost !px-4 !py-2 disabled:opacity-40"
                disabled={currentRsvpPage <= 1}
                onClick={() => setRsvpPage((page) => Math.max(1, page - 1))}
              >
                Précédent
              </button>
              <button
                type="button"
                className="btn-ghost !px-4 !py-2 disabled:opacity-40"
                disabled={currentRsvpPage >= rsvpPageCount}
                onClick={() => setRsvpPage((page) => Math.min(rsvpPageCount, page + 1))}
              >
                Suivant
              </button>
            </div>
          </div>
        ) : null}
      </section>
      ) : null}

      {can("view_rsvp") ? (
        <AdminSeatingEditor
          rsvps={rsvps}
          initialPlan={initialSeatingPlan}
          site={site}
          canEdit={can("manage_rsvp")}
          onUpdated={(updated) =>
            setRsvps((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
          }
        />
      ) : null}

      {can("check_in") ? <AdminCheckIn site={site} /> : null}
      {can("manage_users") ? (
        <AdminUsersEditor initialUsers={initialUsers} currentUserId={currentUser.id} />
      ) : null}
      {can("view_audit") ? <AdminAuditLog initialEntries={initialAudit} /> : null}
    </div>
  );
}
