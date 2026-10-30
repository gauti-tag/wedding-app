"use client";

import { useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";
import { AdminCheckIn } from "@/components/admin/AdminCheckIn";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminDessertsEditor } from "@/components/admin/AdminDessertsEditor";
import { AdminDrinksEditor } from "@/components/admin/AdminDrinksEditor";
import { AdminGuestAlbumEditor } from "@/components/admin/AdminGuestAlbumEditor";
import { AdminGuestbookEditor } from "@/components/admin/AdminGuestbookEditor";
import { AdminInfoEditor } from "@/components/admin/AdminInfoEditor";
import { AdminInviteQr } from "@/components/admin/AdminInviteQr";
import { AdminMcRundownEditor } from "@/components/admin/AdminMcRundownEditor";
import { AdminMenuEditor } from "@/components/admin/AdminMenuEditor";
import { AdminPdfExport } from "@/components/admin/AdminPdfExport";
import { AdminRsvpComposer } from "@/components/admin/AdminRsvpComposer";
import { AdminPhotosList } from "@/components/admin/AdminPhotosList";
import { AdminScheduleEditor } from "@/components/admin/AdminScheduleEditor";
import { AdminThanksEditor } from "@/components/admin/AdminThanksEditor";
import { AdminSeatingEditor } from "@/components/admin/AdminSeatingEditor";
import { AdminSiteEditor } from "@/components/admin/AdminSiteEditor";
import { AdminStoryEditor } from "@/components/admin/AdminStoryEditor";
import { AdminTeeStudio } from "@/components/admin/AdminTeeStudio";
import { AdminUsersEditor } from "@/components/admin/AdminUsersEditor";
import type { GuestAlbumContent } from "@/lib/guest-album";
import type { GuestbookContent } from "@/lib/guestbook";
import type { InfoContent } from "@/lib/info-content";
import type { AdminPrivacySettings } from "@/lib/admin-privacy";
import { type TeeStudioContent } from "@/lib/tee-studio";
import type { ThanksPageContent } from "@/lib/thanks-page";
import { maskName, maskPhone } from "@/lib/mask-pii";
import { MAX_HERO_PHOTOS } from "@/lib/hero-carousel";
import { ALBUM_IMAGE_TARGETS } from "@/lib/image-targets";
import { formatOptionalDatetimeLabel } from "@/lib/rsvp-deadline";
import { guestExportCsv, type GuestExportContext } from "@/lib/guest-export";
import {
  guestTicketQrDataUrl,
  invitationCardBlob,
  invitationCardFilename,
} from "@/lib/invitation-card";
import { receptionNotice } from "@/lib/whatsapp";
import { downloadRsvpExcel } from "@/lib/rsvp-excel";
import {
  EVENT_ROLES,
  eventRoleLabel,
  formatEventRoles,
  hasEventRole,
  normalizeEventRoles,
  type EventRole,
} from "@/lib/event-roles";
import { formatSeatingLabel } from "@/lib/seating";
import {
  emptyGuestCriteria,
  guestCriteriaActive,
  matchesGuestCriteria,
  type GuestCriteria,
} from "@/lib/guest-criteria";
import { GuestCriteriaBar } from "@/components/admin/GuestCriteriaBar";
import { guestStatusLabel } from "@/lib/rsvp-release";
import { hasPermission, roleLabel, type Permission } from "@/lib/roles";
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
  RsvpPlaceSendLog,
  RsvpReleaseLog,
  RsvpReminderLog,
  ScheduleContent,
  SeatingPlanContent,
  SiteContent,
  StoryContent,
} from "@/lib/types";

const ADMIN_NAV_OFFSET = 96;

const eventRoleShortLabel: Record<EventRole, string> = {
  committee: "Comité",
  best_man: "Garçon",
  maid_of_honor: "Femme",
};

function EventRoleToggles({
  rsvp,
  busy,
  onToggle,
}: {
  rsvp: Rsvp;
  busy: boolean;
  onToggle: (rsvp: Rsvp, role: EventRole) => void;
}) {
  const selected = normalizeEventRoles(rsvp.eventRoles);
  return (
    <div className="flex flex-wrap gap-1">
      {EVENT_ROLES.map((role) => {
        const active = selected.includes(role);
        const full = eventRoleLabel(role);
        return (
          <button
            key={role}
            type="button"
            title={full}
            aria-label={full}
            aria-pressed={active}
            disabled={busy}
            onClick={() => onToggle(rsvp, role)}
            className={`!px-2 !py-1 text-[10px] whitespace-nowrap disabled:opacity-50 ${
              active ? "btn-primary" : "btn-ghost"
            }`}
          >
            {eventRoleShortLabel[role]}
          </button>
        );
      })}
    </div>
  );
}

function formatCheckInAccount(rsvp: Rsvp) {
  const name = (rsvp.checkedInByName || "").trim();
  const email = (rsvp.checkedInByEmail || "").trim();
  if (name && email) return `${name} · ${email}`;
  return name || email;
}

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

function RsvpReminderActions({
  rsvp,
  reminders,
  plans,
  busyId,
  onRemind,
}: {
  rsvp: Rsvp;
  reminders: Record<string, RsvpReminderLog>;
  plans: SiteContent["whatsappReminders"];
  busyId: string | null;
  onRemind: (id: string, reminderId: string, label: string) => void;
}) {
  if (rsvp.status !== "yes" || rsvp.blockedAt || plans.length === 0) return null;
  return (
    <>
      {plans.map((reminder) => {
        const sentAt = reminders[rsvp.id]?.[reminder.id];
        const busy = busyId === `${rsvp.id}:${reminder.id}`;
        return (
          <button
            key={reminder.id}
            type="button"
            title={
              sentAt
                ? `Déjà préparé le ${formatAdminDate(sentAt, true)}. Ouvre à nouveau WhatsApp pour cet invité.`
                : `Ouvre WhatsApp avec le rappel « ${reminder.label} » pour cet invité.`
            }
            disabled={busy}
            onClick={() => onRemind(rsvp.id, reminder.id, reminder.label)}
            className="btn-ghost !px-3 !py-1.5 text-left text-xs disabled:opacity-50"
          >
            {busy ? "Ouverture…" : sentAt ? `Renvoyer ${reminder.label}` : `Rappel ${reminder.label}`}
          </button>
        );
      })}
    </>
  );
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
  initialPlaceSends: Record<string, RsvpPlaceSendLog>;
  initialReleases: Record<string, RsvpReleaseLog>;
  initialSite: SiteContent;
  initialStory: StoryContent;
  initialSchedule: ScheduleContent;
  initialMcRundown: McRundownContent;
  initialSeatingPlan: SeatingPlanContent;
  initialMenu: MenuContent;
  initialDrinks: DrinksContent;
  initialDesserts: DessertsContent;
  initialInfo: InfoContent;
  initialGuestbook: GuestbookContent;
  initialGuestAlbum: GuestAlbumContent;
  initialTeeStudio: TeeStudioContent;
  initialThanks: ThanksPageContent;
  initialUsers: AdminUserPublic[];
  initialAudit: AuditEntry[];
  initialPrivacy: AdminPrivacySettings;
};

const albumLabels: Record<PhotoAlbum, string> = {
  hero: "Hero (carrousel, max 6)",
  story: "Notre histoire",
  gallery: "Galerie",
};

const adminNav: { href: string; label: string; permission: Permission }[] = [
  { href: "#admin-dashboard", label: "Synthèse", permission: "view_dashboard" },
  { href: "#admin-invite-qr", label: "QR", permission: "manage_content" },
  { href: "#admin-tees", label: "Tees", permission: "manage_content" },
  { href: "#admin-photos", label: "Photos", permission: "manage_photos" },
  { href: "#admin-site", label: "Site", permission: "manage_content" },
  { href: "#admin-thanks", label: "Merci", permission: "manage_content" },
  { href: "#admin-story", label: "Histoire", permission: "manage_content" },
  { href: "#admin-schedule", label: "Programme", permission: "manage_content" },
  { href: "#admin-mc-rundown", label: "MC", permission: "manage_content" },
  { href: "#admin-menu", label: "Menu", permission: "manage_content" },
  { href: "#admin-desserts", label: "Desserts", permission: "manage_content" },
  { href: "#admin-drinks", label: "Boissons", permission: "manage_content" },
  { href: "#admin-info", label: "FAQ", permission: "manage_content" },
  { href: "#admin-guestbook", label: "Livre d’or", permission: "manage_content" },
  { href: "#admin-guest-album", label: "Album", permission: "manage_content" },
  { href: "#admin-pdf", label: "PDF", permission: "view_rsvp" },
  { href: "#admin-rsvp", label: "RSVP", permission: "view_rsvp" },
  { href: "#admin-seating", label: "Tables", permission: "view_rsvp" },
  { href: "#admin-checkin", label: "Check-in", permission: "check_in" },
  { href: "#admin-users", label: "Users", permission: "manage_users" },
  { href: "#admin-audit", label: "Audit", permission: "view_audit" },
];

/** L’image envoyée est conservée en entier (aucun recadrage). */
const albumSizeGuides: Record<
  PhotoAlbum,
  { ratio: string; size: string; tip: string; slots?: string }
> = {
  hero: {
    ratio: "Format d’origine",
    size: `${ALBUM_IMAGE_TARGETS.hero.label} — plein cadre, du mobile au bureau`,
    tip: "Jusqu’à 6 photos. Chacune couvre tout le hero. Le cadrage s’adapte à l’écran, sans bandes.",
    slots: "1 à 6 images — défilement en boucle",
  },
  story: {
    ratio: "Format d’origine",
    size: `${ALBUM_IMAGE_TARGETS.story.label} — photo entière`,
    tip: "Seules les 3 premières photos « Notre histoire » s’affichent, chacune en entier.",
    slots: "Jusqu’à 3 photos, dans leur format d’origine",
  },
  gallery: {
    ratio: "Format d’origine",
    size: `${ALBUM_IMAGE_TARGETS.gallery.label} — photo entière`,
    tip: "Chaque photo s’affiche en entier dans la galerie, sans recadrage.",
  },
};

export function AdminPanel({
  currentUser,
  initialPhotos,
  initialRsvps,
  initialReminders,
  initialPlaceSends,
  initialReleases,
  initialSite,
  initialStory,
  initialSchedule,
  initialMcRundown,
  initialSeatingPlan,
  initialMenu,
  initialDrinks,
  initialDesserts,
  initialInfo,
  initialGuestbook,
  initialGuestAlbum,
  initialTeeStudio,
  initialThanks,
  initialUsers,
  initialAudit,
  initialPrivacy,
}: Props) {
  const can = (permission: Permission) => hasPermission(currentUser.role, permission);
  const navItems = adminNav.filter((item) => can(item.permission));
  const isOwner = currentUser.role === "admin";

  const [photos, setPhotos] = useState(initialPhotos);
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [seatingPlan, setSeatingPlan] = useState(initialSeatingPlan);
  const [reminders, setReminders] = useState(initialReminders);
  const [placeSends, setPlaceSends] = useState(initialPlaceSends);
  const [releases] = useState(initialReleases);
  const [site, setSite] = useState(initialSite);
  const [privacy, setPrivacy] = useState(initialPrivacy);
  const [album, setAlbum] = useState<PhotoAlbum>("gallery");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const { showSuccess, showError, showInfo, AlertDialog } = useAdminAlert();
  const [resendBusyId, setResendBusyId] = useState<string | null>(null);
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);
  const [blockBusyId, setBlockBusyId] = useState<string | null>(null);
  const [roleBusyId, setRoleBusyId] = useState<string | null>(null);
  const [rsvpPage, setRsvpPage] = useState(1);
  const [rsvpQuery, setRsvpQuery] = useState("");
  const [criteria, setCriteria] = useState<GuestCriteria>(emptyGuestCriteria);
  const [openRsvpId, setOpenRsvpId] = useState<string | null>(null);
  const [cardBusyId, setCardBusyId] = useState<string | null>(null);
  const rsvpSearchRef = useRef<HTMLDivElement>(null);
  const canBlockRsvp = isOwner;
  /** Propriétaire toujours en clair ; équipe masquée seulement si le propriétaire l’active. */
  const showGuestPii = isOwner || !privacy.maskGuestPiiForTeam;

  const guestOfLabels = useMemo(() => guestOfLabelsFromSite(site), [site]);
  const reception = useMemo(
    () => receptionNotice(initialSchedule.venues, "fr"),
    [initialSchedule.venues],
  );
  const RSVP_PAGE_SIZE = 10;

  const filteredRsvps = useMemo(() => {
    const q = rsvpQuery.trim().toLowerCase();
    const qDigits = q.replace(/[\s.\-()]/g, "");
    return rsvps.filter((r) => {
      if (!matchesGuestCriteria(r, criteria)) return false;
      if (!q) return true;
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
  }, [rsvps, rsvpQuery, criteria, guestOfLabels]);

  const rsvpFiltering = Boolean(rsvpQuery.trim()) || guestCriteriaActive(criteria);

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
        .sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
      const keepIds = new Set(
        heroes.slice(Math.max(0, heroes.length - (MAX_HERO_PHOTOS - 1))).map((p) => p.id),
      );
      const galleryMax = Math.max(
        -1,
        ...prev.filter((p) => p.album === "gallery").map((p) => p.order),
      );
      let demoted = 0;
      return [
        ...prev.map((p) => {
          if (p.album !== "hero" || keepIds.has(p.id)) return p;
          demoted += 1;
          return { ...p, album: "gallery" as const, order: galleryMax + demoted };
        }),
        data.photo,
      ];
    });
    setFile(null);
    setCaption("");
    showSuccess(
      data.resizedTo
        ? `Photo ajoutée (${data.resizedTo.label}), affichée en entier.`
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

  function revealRsvpSearch() {
    const node = rsvpSearchRef.current;
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY - 56;
    if (node.getBoundingClientRect().top > 72) {
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }

  function onRsvpQueryChange(value: string) {
    const starting = !rsvpQuery.trim() && Boolean(value.trim());
    setRsvpQuery(value);
    setRsvpPage(1);
    setOpenRsvpId(null);
    if (starting) revealRsvpSearch();
  }

  function onCriteriaChange(next: GuestCriteria) {
    setCriteria(next);
    setRsvpPage(1);
    setOpenRsvpId(null);
    revealRsvpSearch();
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

  async function onToggleEventRole(rsvp: Rsvp, role: EventRole) {
    const current = normalizeEventRoles(rsvp.eventRoles);
    const next = current.includes(role)
      ? current.filter((item) => item !== role)
      : [...current, role];
    setRoleBusyId(rsvp.id);
    try {
      const res = await fetch("/api/rsvp/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rsvp.id, eventRoles: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Enregistrement du rôle impossible.");
        return;
      }
      setRsvps((prev) => prev.map((item) => (item.id === rsvp.id ? data.rsvp : item)));
      const hadSeat = Boolean((rsvp.tableLabel || "").trim() || (rsvp.seatLabel || "").trim());
      showSuccess(
        next.length && hadSeat
          ? "Rôle enregistré. La table et le siège de l’adulte ont été libérés."
          : "Rôle enregistré.",
      );
    } catch {
      showError("Enregistrement du rôle impossible.");
    } finally {
      setRoleBusyId(null);
    }
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

  async function recordPlaceSend(id: string) {
    try {
      const res = await fetch("/api/rsvp/place-sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as { log?: RsvpPlaceSendLog; error?: string };
      if (res.status === 403) return;
      if (!res.ok || !data.log) {
        showError(data.error || "Le compteur d’envoi n’a pas pu être mis à jour.");
        return;
      }
      setPlaceSends((prev) => ({ ...prev, [id]: data.log! }));
    } catch {
      showError("Le compteur d’envoi n’a pas pu être mis à jour.");
    }
  }

  async function unlockPlace(id: string) {
    try {
      const res = await fetch("/api/rsvp/place-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as { log?: RsvpPlaceSendLog; error?: string };
      if (!res.ok || !data.log) {
        showError(data.error || "Déverrouillage impossible.");
        return;
      }
      setPlaceSends((prev) => ({ ...prev, [id]: data.log! }));
      showSuccess("Place déverrouillée. Vous pouvez attribuer une nouvelle place.");
    } catch {
      showError("Déverrouillage impossible.");
    }
  }

  function guestExportContext(): GuestExportContext {
    return {
      guestOfLabels,
      partnerOne: site.partnerOne,
      partnerTwo: site.partnerTwo,
      reminderPlans: site.whatsappReminders,
      reminders,
      placeSends,
      releases,
      showGuestPii,
    };
  }

  function exportCsv() {
    const blob = new Blob([guestExportCsv(rsvps, guestExportContext())], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rsvp-mariage.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportExcel() {
    try {
      await downloadRsvpExcel(rsvps, guestExportContext());
    } catch {
      showError("Export Excel impossible.");
    }
  }

  async function downloadGuestCard(rsvp: Rsvp) {
    if (!rsvp.ticketToken) {
      showError("Cette invitation n’a pas encore de carte.");
      return;
    }
    const coupleNames =
      site.eventTitle?.fr?.trim() ||
      [site.partnerOne, site.partnerTwo].filter(Boolean).join(" & ") ||
      "Événement";
    const dateLabel = site.hero.weddingDateLabel.fr || site.weddingDate;
    setCardBusyId(rsvp.id);
    try {
      const qrDataUrl = await guestTicketQrDataUrl(rsvp.ticketToken);
      const blob = await invitationCardBlob({
        guestName: rsvp.name,
        coupleNames,
        dateLabel,
        qrDataUrl,
        ticketCode: rsvp.ticketToken,
      });
      const filename = invitationCardFilename(rsvp.name, new Set());
      const file = new File([blob], filename, { type: "image/png" });
      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: rsvp.name });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
        }
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      showError("Téléchargement de la carte impossible.");
    } finally {
      setCardBusyId(null);
    }
  }

  function cardDownloadButton(rsvp: Rsvp) {
    const busy = cardBusyId === rsvp.id;
    return (
      <button
        type="button"
        disabled={busy || !rsvp.ticketToken}
        onClick={() => void downloadGuestCard(rsvp)}
        className="text-xs tracking-[0.12em] text-champagne uppercase hover:text-mist disabled:opacity-50"
      >
        {busy ? "Téléchargement…" : "Télécharger"}
      </button>
    );
  }

  return (
    <div className="admin-panel min-w-0 max-w-full">
      {AlertDialog}
      <div className="flex min-w-0 max-w-full flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-full flex-1 basis-full sm:basis-[min(100%,16rem)]">
          <p className="eyebrow">Espace couple</p>
          <h1 className="section-title mt-3 break-words text-3xl text-mist sm:text-4xl md:text-5xl">
            Administration
          </h1>
          <p className="mt-3 max-w-full break-words text-sm font-normal text-soft sm:max-w-xl">
            Connecté : {currentUser.name} · {roleLabel(currentUser.role)}
          </p>
        </div>
        <div className="flex w-full min-w-0 max-w-full flex-wrap gap-2 sm:w-auto sm:gap-3">
          <a href="/" className="btn-ghost !px-3 !py-2.5 text-[0.65rem] sm:!px-4 sm:text-[0.72rem]">
            Voir le site
          </a>
          <button
            type="button"
            onClick={onLogout}
            className="btn-primary !px-3 !py-2.5 text-[0.65rem] sm:!px-4 sm:text-[0.72rem]"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {navItems.length > 0 ? (
        <nav
          aria-label="Rubriques de l’espace couple"
          className="sticky top-0 z-30 mt-8 w-full min-w-0 max-w-full border-y border-line bg-ivory/95 py-2.5 backdrop-blur-md supports-[backdrop-filter]:bg-ivory/90 sm:py-3"
        >
          <ul className="flex w-full min-w-0 max-w-full gap-0.5 overflow-x-auto overscroll-x-contain pb-1 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => (
              <li key={item.href} className="shrink-0">
                <a
                  href={item.href}
                  onClick={(event) => onAdminNavClick(event, item.href)}
                  className="nav-link inline-block whitespace-nowrap px-2 py-2 text-[0.58rem] tracking-[0.1em] text-champagne uppercase no-underline transition-colors duration-300 hover:text-mist sm:px-3 sm:text-[0.68rem] sm:tracking-[0.16em]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="admin-panel-body mt-0 min-w-0 max-w-full">
      {can("view_dashboard") || can("view_rsvp") ? (
        <AdminDashboard
          rsvps={rsvps}
          site={site}
          guestOfLabels={guestOfLabels}
          onExportCsv={exportCsv}
          onExportExcel={() => void exportExcel()}
          canExport={can("view_rsvp")}
          showGuestPii={showGuestPii}
          seatingPlan={seatingPlan}
          showPlanLink={can("view_rsvp")}
          releases={releases}
        />
      ) : null}

      {can("manage_content") ? (
        <AdminInviteQr
          eventType={site.eventType}
          eventTitle={site.eventTitle}
          partnerOne={site.partnerOne}
          partnerTwo={site.partnerTwo}
          weddingDateLabel={site.hero.weddingDateLabel}
        />
      ) : null}

      {can("manage_content") ? (
        <AdminTeeStudio initial={initialTeeStudio} site={site} photos={photos} />
      ) : null}

      {can("manage_photos") ? (
      <section
        id="admin-photos" className="mt-12 grid min-w-0 scroll-mt-28 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
      >
        <form onSubmit={onUpload} className="min-w-0 space-y-4 border border-line bg-white p-4 sm:p-6">
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
              Fichier JPG ou WebP, max 8 Mo. L’image est conservée en entier et affichée à 100 % dans son cadre.
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

        <div className="min-w-0 space-y-4">
          <h2 className="section-title text-3xl text-mist">Photos ({photos.length})</h2>
          <AdminPhotosList
            photos={photos}
            albumLabels={albumLabels}
            onPhotosChange={setPhotos}
            onDelete={onDelete}
            onError={(message) => showError(message)}
          />
        </div>
      </section>
      ) : null}

      {can("manage_content") ? (
        <>
          <AdminSiteEditor initialSite={site} onSaved={setSite} />
          <AdminThanksEditor
            initial={initialThanks}
            site={site}
            schedule={initialSchedule}
            guestbook={initialGuestbook}
            guestAlbum={initialGuestAlbum}
          />
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
          <AdminInfoEditor initial={initialInfo} />
          <AdminGuestbookEditor initial={initialGuestbook} />
          <AdminGuestAlbumEditor initial={initialGuestAlbum} />
        </>
      ) : null}

      {can("view_rsvp") ? (
        <AdminPdfExport
          rsvps={rsvps}
          site={site}
          seatingPlan={initialSeatingPlan}
          guestOfLabels={guestOfLabels}
          reminders={reminders}
          placeSends={placeSends}
          releases={releases}
          showGuestPii={showGuestPii}
        />
      ) : null}

      {can("view_rsvp") ? (
      <section id="admin-rsvp" className="mt-14 min-w-0 max-w-full scroll-mt-28">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title text-3xl font-semibold text-mist">RSVP</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportCsv} className="btn-ghost" disabled={!rsvps.length}>
              Exporter CSV
            </button>
            <button
              type="button"
              onClick={() => void exportExcel()}
              className="btn-ghost"
              disabled={!rsvps.length}
            >
              Exporter Excel
            </button>
          </div>
        </div>

        {can("manage_rsvp") ? (
          <AdminRsvpComposer
            site={site}
            rsvps={rsvps}
            onCreated={(rsvp) => {
              setRsvps((prev) => [rsvp, ...prev.filter((item) => item.id !== rsvp.id)]);
              setRsvpPage(1);
              setOpenRsvpId(rsvp.id);
            }}
          />
        ) : null}

        <div
          ref={rsvpSearchRef}
          className="sticky top-14 z-20 mb-4 border-y border-line bg-ivory/95 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-ivory/90"
        >
          <label className="label" htmlFor="rsvp-search">
            Rechercher
          </label>
          <input
            id="rsvp-search"
            type="search"
            className="field"
            value={rsvpQuery}
            onFocus={revealRsvpSearch}
            onChange={(e) => onRsvpQueryChange(e.target.value)}
            placeholder="Nom, téléphone, statut, invité(e) de…"
            autoComplete="off"
            enterKeyHint="search"
          />
          <GuestCriteriaBar
            value={criteria}
            onChange={onCriteriaChange}
            partnerOne={site.partnerOne}
            partnerTwo={site.partnerTwo}
          />
          <p className="mt-3 text-sm text-mist">
            {filteredRsvps.length}{" "}
            {rsvpFiltering
              ? filteredRsvps.length === 1
                ? "résultat"
                : "résultats"
              : filteredRsvps.length === 1
                ? "invité"
                : "invités"}
          </p>
        </div>

        {rsvpFiltering ? (
          <div className="mb-6 max-h-[min(70dvh,36rem)] overflow-y-auto border border-line bg-white">
            {filteredRsvps.length === 0 ? (
              <p className="px-3 py-5 text-sm text-soft">
                {rsvpQuery.trim()
                  ? `Aucun résultat pour « ${rsvpQuery.trim()} ».`
                  : "Aucun invité pour ces critères."}
              </p>
            ) : (
              <ul>
                {filteredRsvps.map((rsvp) => {
                  const displayName = showGuestPii ? rsvp.name : maskName(rsvp.name);
                  const displayPhone = showGuestPii
                    ? rsvp.phone || "—"
                    : maskPhone(rsvp.phone || "");
                  const open = openRsvpId === rsvp.id;
                  const place = hasEventRole(rsvp)
                    ? formatEventRoles(rsvp.eventRoles)
                    : formatSeatingLabel(rsvp.tableLabel, rsvp.seatLabel) || "Sans table";
                  return (
                    <li key={rsvp.id} className="border-b border-line last:border-b-0">
                      <div className="flex items-start gap-2 px-3 py-2.5">
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-start justify-between gap-3 text-left"
                          aria-expanded={open}
                          onClick={() => setOpenRsvpId(open ? null : rsvp.id)}
                        >
                          <span className="min-w-0">
                            <span className="block break-words font-medium text-mist">{displayName}</span>
                            <span className="mt-0.5 block text-xs text-soft">
                              {displayPhone}
                              {" · "}
                              {guestOfLabels[rsvp.guestOf] || rsvp.guestOf || "—"}
                              {" · "}
                              {place}
                              {rsvp.checkedInAt ? " · Arrivé" : ""}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs tracking-[0.12em] text-champagne uppercase">
                            {guestStatusLabel(rsvp.status, releases[rsvp.id])}
                          </span>
                        </button>
                        {can("manage_rsvp") ? (
                          <button
                            type="button"
                            disabled={deleteBusyId === rsvp.id}
                            onClick={() => void onDeleteRsvp(rsvp.id, rsvp.name)}
                            className="shrink-0 text-xs tracking-[0.12em] text-red-700 uppercase hover:text-red-900 disabled:opacity-50"
                          >
                            {deleteBusyId === rsvp.id ? "Suppression…" : "Supprimer"}
                          </button>
                        ) : null}
                      </div>
                      {open ? (
                        <div className="flex flex-wrap items-center gap-2 px-3 pb-3">
                          {can("manage_rsvp") && rsvp.status !== "no" ? (
                            <EventRoleToggles
                              rsvp={rsvp}
                              busy={roleBusyId === rsvp.id}
                              onToggle={(guest, role) => void onToggleEventRole(guest, role)}
                            />
                          ) : null}
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
                              {cardDownloadButton(rsvp)}
                              {can("manage_rsvp") ? (
                                <button
                                  type="button"
                                  disabled={resendBusyId === rsvp.id}
                                  onClick={() => void onWhatsAppTicket(rsvp.id)}
                                  className="text-xs tracking-[0.12em] text-soft uppercase hover:text-champagne disabled:opacity-50"
                                >
                                  {resendBusyId === rsvp.id ? "Ouverture…" : "WhatsApp"}
                                </button>
                              ) : null}
                              {can("manage_rsvp") ? (
                                <RsvpReminderActions
                                  rsvp={rsvp}
                                  reminders={reminders}
                                  plans={site.whatsappReminders}
                                  busyId={resendBusyId}
                                  onRemind={(id, reminderId, label) =>
                                    void onWhatsAppReminder(id, reminderId, label)
                                  }
                                />
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}

        {can("manage_rsvp") && !rsvpFiltering ? (
          <div className="mb-6 border border-line bg-white/80 px-4 py-4 md:px-5">
            <p className="text-sm font-medium text-mist">Rappels WhatsApp</p>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-soft">
              Chaque confirmation « oui » a ces rappels dans ses actions. Un clic ouvre WhatsApp
              pour cet invité seulement. Les rappels se planifient dans Couple & hero.
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

        {/* Mobile : cartes (évite min-width tableau qui élargit la page) */}
        {!rsvpFiltering ? (
        <>
        <div className="space-y-3 md:hidden">
          {rsvps.length === 0 ? (
            <p className="border border-line px-3 py-5 text-sm text-soft">
              Aucune réponse pour l’instant.
            </p>
          ) : filteredRsvps.length === 0 ? (
            <p className="border border-line px-3 py-5 text-sm text-soft">
              Aucun résultat pour « {rsvpQuery.trim()} ».
            </p>
          ) : (
            pagedRsvps.map((rsvp) => {
              const displayName = showGuestPii ? rsvp.name : maskName(rsvp.name);
              const displayPhone = showGuestPii
                ? rsvp.phone || "—"
                : maskPhone(rsvp.phone || "");

              return (
                <article key={rsvp.id} className="min-w-0 space-y-3 border border-line bg-white p-3">
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="break-words font-medium text-mist">{displayName}</p>
                      {hasEventRole(rsvp) ? (
                        <p className="mt-0.5 text-xs text-champagne">
                          {formatEventRoles(rsvp.eventRoles)}
                        </p>
                      ) : null}
                      <p className="mt-0.5 break-all text-sm text-soft">{displayPhone}</p>
                    </div>
                    <span className="shrink-0 text-xs tracking-[0.12em] text-champagne uppercase">
                      {guestStatusLabel(rsvp.status, releases[rsvp.id])}
                    </span>
                  </div>
                  <dl className="admin-grid-2 grid gap-x-3 gap-y-2 text-xs text-soft">
                    <div>
                      <dt className="tracking-[0.12em] uppercase">Invité(e) de</dt>
                      <dd className="mt-0.5 break-words text-mist">
                        {guestOfLabels[rsvp.guestOf] || rsvp.guestOf || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="tracking-[0.12em] uppercase">Enfants</dt>
                      <dd className="mt-0.5 text-mist">{rsvp.childCount ?? 0}</dd>
                    </div>
                    <div>
                      <dt className="tracking-[0.12em] uppercase">Table</dt>
                      <dd className="mt-0.5 break-words text-mist">
                        {formatSeatingLabel(rsvp.tableLabel, rsvp.seatLabel) || "—"}
                      </dd>
                    </div>
                    <div className="col-span-2" suppressHydrationWarning>
                      <dt className="tracking-[0.12em] uppercase">Check-in</dt>
                      <dd className="mt-0.5">
                        {rsvp.checkedInAt ? (
                          <>
                            <span>{formatAdminDate(rsvp.checkedInAt, true)}</span>
                            <span className="mt-0.5 block text-mist">
                              {formatCheckInAccount(rsvp) || "Compte non enregistré"}
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </dd>
                    </div>
                  </dl>
                  <div className="flex flex-wrap items-center gap-2 border-t border-line pt-2">
                    {can("manage_rsvp") && rsvp.status !== "no" ? (
                      <EventRoleToggles
                        rsvp={rsvp}
                        busy={roleBusyId === rsvp.id}
                        onToggle={(guest, role) => void onToggleEventRole(guest, role)}
                      />
                    ) : null}
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
                        {cardDownloadButton(rsvp)}
                        {can("manage_rsvp") ? (
                          <button
                            type="button"
                            disabled={resendBusyId === rsvp.id}
                            onClick={() => void onWhatsAppTicket(rsvp.id)}
                            className="text-xs tracking-[0.12em] text-soft uppercase hover:text-champagne disabled:opacity-50"
                          >
                            {resendBusyId === rsvp.id ? "Ouverture…" : "WhatsApp"}
                          </button>
                        ) : null}
                        {can("manage_rsvp") ? (
                          <RsvpReminderActions
                            rsvp={rsvp}
                            reminders={reminders}
                            plans={site.whatsappReminders}
                            busyId={resendBusyId}
                            onRemind={(id, reminderId, label) =>
                              void onWhatsAppReminder(id, reminderId, label)
                            }
                          />
                        ) : null}
                      </>
                    ) : null}
                    {canBlockRsvp ? (
                      <button
                        type="button"
                        disabled={blockBusyId === rsvp.id}
                        onClick={() =>
                          void onToggleBlockRsvp(rsvp.id, rsvp.name, Boolean(rsvp.blockedAt))
                        }
                        className={`text-xs tracking-[0.12em] uppercase disabled:opacity-50 ${
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
                        className="text-xs tracking-[0.12em] text-red-700 uppercase hover:text-red-900 disabled:opacity-50"
                      >
                        {deleteBusyId === rsvp.id ? "Suppression…" : "Supprimer"}
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Desktop / tablette : tableau */}
        <div className="admin-scroll-x hidden border border-line md:block">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-forest text-xs tracking-[0.14em] text-soft uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Téléphone</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Invité(e) de</th>
                <th className="px-4 py-3 font-medium">Enfants</th>
                <th className="px-4 py-3 font-medium">Table</th>
                <th className="px-4 py-3 font-medium">Suivi</th>
                <th className="px-4 py-3 font-medium">Check-in</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-soft">
                    Aucune réponse pour l’instant.
                  </td>
                </tr>
              ) : filteredRsvps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-soft">
                    Aucun résultat pour « {rsvpQuery.trim()} ».
                  </td>
                </tr>
              ) : (
                pagedRsvps.map((rsvp) => {
                  const displayName = showGuestPii ? rsvp.name : maskName(rsvp.name);
                  const displayPhone = showGuestPii
                    ? rsvp.phone || "—"
                    : maskPhone(rsvp.phone || "");

                  return (
                  <tr key={rsvp.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <div className="text-mist">{displayName}</div>
                      {hasEventRole(rsvp) ? (
                        <p className="mt-0.5 text-xs text-champagne">
                          {formatEventRoles(rsvp.eventRoles)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-soft">{displayPhone}</td>
                    <td className="px-4 py-3 text-champagne">{guestStatusLabel(rsvp.status, releases[rsvp.id])}</td>
                    <td className="px-4 py-3 text-mist">
                      {guestOfLabels[rsvp.guestOf] || rsvp.guestOf || "—"}
                    </td>
                    <td className="px-4 py-3 text-soft">{rsvp.childCount ?? 0}</td>
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
                      {rsvp.checkedInAt ? (
                        <>
                          <div>{formatAdminDate(rsvp.checkedInAt, true)}</div>
                          <div className="mt-0.5 text-xs text-mist">
                            {formatCheckInAccount(rsvp) || "Compte non enregistré"}
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[9rem] flex-wrap items-center gap-2">
                        {can("manage_rsvp") && rsvp.status !== "no" ? (
                          <EventRoleToggles
                            rsvp={rsvp}
                            busy={roleBusyId === rsvp.id}
                            onToggle={(guest, role) => void onToggleEventRole(guest, role)}
                          />
                        ) : null}
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
                            {cardDownloadButton(rsvp)}
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
                            {can("manage_rsvp") ? (
                              <RsvpReminderActions
                                rsvp={rsvp}
                                reminders={reminders}
                                plans={site.whatsappReminders}
                                busyId={resendBusyId}
                                onRemind={(id, reminderId, label) =>
                                  void onWhatsAppReminder(id, reminderId, label)
                                }
                              />
                            ) : null}
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
        </>
        ) : null}
      </section>
      ) : null}

      {can("view_rsvp") ? (
        <AdminSeatingEditor
          rsvps={rsvps}
          initialPlan={seatingPlan}
          onPlanChange={setSeatingPlan}
          site={site}
          guestOfLabels={guestOfLabels}
          canEdit={can("manage_rsvp")}
          showGuestPii={showGuestPii}
          reception={reception}
          placeSends={placeSends}
          onPlaceSend={
            can("manage_rsvp") || can("check_in")
              ? (id) => void recordPlaceSend(id)
              : undefined
          }
          canUnlock={isOwner}
          onUnlock={isOwner ? (id) => void unlockPlace(id) : undefined}
          onUpdated={(updated) =>
            setRsvps((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
          }
        />
      ) : null}

      {can("check_in") ? (
        <AdminCheckIn
          site={site}
          reception={reception}
          rsvps={rsvps}
          showGuestPii={showGuestPii}
          onPlaceSend={(id) => void recordPlaceSend(id)}
          onCheckedIn={(updated) =>
            setRsvps((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
          }
        />
      ) : null}
      {can("manage_users") ? (
        <AdminUsersEditor
          initialUsers={initialUsers}
          currentUserId={currentUser.id}
          isOwner={isOwner}
          privacy={privacy}
          onPrivacyChange={setPrivacy}
        />
      ) : null}
      {can("view_audit") ? <AdminAuditLog initialEntries={initialAudit} /> : null}
      </div>
    </div>
  );
}
