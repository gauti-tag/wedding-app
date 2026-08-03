"use client";

import { useMemo, useState, type FormEvent, type MouseEvent } from "react";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";
import { AdminCheckIn } from "@/components/admin/AdminCheckIn";
import { AdminDessertsEditor } from "@/components/admin/AdminDessertsEditor";
import { AdminDrinksEditor } from "@/components/admin/AdminDrinksEditor";
import { AdminMenuEditor } from "@/components/admin/AdminMenuEditor";
import { AdminScheduleEditor } from "@/components/admin/AdminScheduleEditor";
import { AdminSiteEditor } from "@/components/admin/AdminSiteEditor";
import { AdminStoryEditor } from "@/components/admin/AdminStoryEditor";
import { AdminUsersEditor } from "@/components/admin/AdminUsersEditor";
import { hasPermission, roleLabels, type Permission } from "@/lib/roles";
import type {
  AdminUserPublic,
  AuditEntry,
  DessertsContent,
  DrinksContent,
  GuestOf,
  MenuContent,
  Photo,
  PhotoAlbum,
  Rsvp,
  ScheduleContent,
  SiteContent,
  StoryContent,
} from "@/lib/types";

const ADMIN_NAV_OFFSET = 96;

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

/** Clés RSVP historiques : gautier = prénom 1, francybel = prénom 2. */
function guestOfLabelsFromSite(
  site: Pick<SiteContent, "partnerOne" | "partnerTwo">,
): Record<GuestOf, string> {
  return {
    gautier: site.partnerOne,
    francybel: site.partnerTwo,
    both: `${site.partnerOne} & ${site.partnerTwo}`,
  };
}

type Props = {
  currentUser: AdminUserPublic;
  initialPhotos: Photo[];
  initialRsvps: Rsvp[];
  initialSite: SiteContent;
  initialStory: StoryContent;
  initialSchedule: ScheduleContent;
  initialMenu: MenuContent;
  initialDrinks: DrinksContent;
  initialDesserts: DessertsContent;
  initialUsers: AdminUserPublic[];
  initialAudit: AuditEntry[];
};

const albumLabels: Record<PhotoAlbum, string> = {
  hero: "Hero (plein écran)",
  story: "Notre histoire",
  gallery: "Galerie",
};

const adminNav: { href: string; label: string; permission: Permission }[] = [
  { href: "#admin-photos", label: "Photos", permission: "manage_photos" },
  { href: "#admin-site", label: "Couple & hero", permission: "manage_content" },
  { href: "#admin-story", label: "Histoire", permission: "manage_content" },
  { href: "#admin-schedule", label: "Programme", permission: "manage_content" },
  { href: "#admin-menu", label: "Menu", permission: "manage_content" },
  { href: "#admin-desserts", label: "Desserts", permission: "manage_content" },
  { href: "#admin-drinks", label: "Boissons", permission: "manage_content" },
  { href: "#admin-rsvp", label: "RSVP", permission: "view_rsvp" },
  { href: "#admin-checkin", label: "Check-in", permission: "check_in" },
  { href: "#admin-users", label: "Utilisateurs", permission: "manage_users" },
  { href: "#admin-audit", label: "Audit", permission: "view_audit" },
];

/** Formats alignés sur les ratios d’affichage du site (object-cover). */
const albumSizeGuides: Record<
  PhotoAlbum,
  { ratio: string; size: string; tip: string; slots?: string }
> = {
  hero: {
    ratio: "Paysage 16:9 (ou 3:2)",
    size: "1920 × 1080 px (idéal : 2400 × 1350 px)",
    tip: "Plein écran. Cadrez le sujet au centre : les bords sont coupés sur mobile (écran vertical).",
  },
  story: {
    ratio: "1ʳᵉ photo 16:10 · 2ᵉ et 3ᵉ en 4:5",
    size: "1600 × 1000 px · puis 1200 × 1500 px",
    tip: "Seules les 3 premières photos « Notre histoire » s’affichent. Recadrage object-cover dans chaque case.",
    slots: "Grande (haut) : paysage · Deux petites : portrait",
  },
  gallery: {
    ratio: "Portrait 4:5 ou 3:4 (mélange possible)",
    size: "1200 × 1500 px (ou ~1600 px sur le grand côté)",
    tip: "Colonne masonry : l’image garde son ratio. Les portraits donnent un bel effet d’ensemble.",
  },
};

export function AdminPanel({
  currentUser,
  initialPhotos,
  initialRsvps,
  initialSite,
  initialStory,
  initialSchedule,
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
  const [site, setSite] = useState(initialSite);
  const [album, setAlbum] = useState<PhotoAlbum>("gallery");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendBusyId, setResendBusyId] = useState<string | null>(null);
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);
  const [rsvpPage, setRsvpPage] = useState(1);
  const [rsvpQuery, setRsvpQuery] = useState("");

  const guestOfLabels = useMemo(() => guestOfLabelsFromSite(site), [site]);
  const RSVP_PAGE_SIZE = 10;

  const counts = useMemo(() => {
    const yes = rsvps.filter((r) => r.status === "yes");
    const checkedIn = rsvps.filter((r) => Boolean(r.checkedInAt));
    const ofPartnerOne = rsvps.filter((r) => r.guestOf === "gautier" || r.guestOf === "both").length;
    const ofPartnerTwo = rsvps.filter(
      (r) => r.guestOf === "francybel" || r.guestOf === "both",
    ).length;
    return {
      total: rsvps.length,
      yes: yes.length,
      checkedIn: checkedIn.length,
      ofPartnerOne,
      ofPartnerTwo,
    };
  }, [rsvps]);

  const filteredRsvps = useMemo(() => {
    const q = rsvpQuery.trim().toLowerCase();
    if (!q) return rsvps;
    const qDigits = q.replace(/[\s.\-()]/g, "");
    return rsvps.filter((r) => {
      const guestLabel = (guestOfLabels[r.guestOf] || r.guestOf || "").toLowerCase();
      const haystack = [
        r.name,
        r.email,
        r.phone,
        r.status,
        guestLabel,
        r.message,
        r.ticketToken,
        r.checkedInAt ? "check-in" : "",
        r.emailSentAt ? "mail" : "",
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
      setMessage("Choisissez une image.");
      return;
    }
    setBusy(true);
    setMessage("");
    const form = new FormData();
    form.append("file", file);
    form.append("album", album);
    form.append("caption", caption);

    const res = await fetch("/api/photos", { method: "POST", body: form });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setMessage(data.error || "Upload impossible.");
      return;
    }

    setPhotos((prev) => {
      const next = [...prev];
      if (data.photo.album === "hero") {
        return [...next.map((p) => (p.album === "hero" ? { ...p, album: "gallery" as const } : p)), data.photo];
      }
      return [...next, data.photo];
    });
    setFile(null);
    setCaption("");
    setMessage("Photo ajoutée.");
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
      setMessage(data.error || "Suppression impossible.");
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

  async function onResendTicket(id: string) {
    setResendBusyId(id);
    setMessage("");
    try {
      const res = await fetch("/api/rsvp/resend-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Renvoi du mail impossible.");
        return;
      }
      setRsvps((prev) => prev.map((r) => (r.id === id ? data.rsvp : r)));
      setMessage("Carte / e-mail renvoyé.");
    } catch {
      setMessage("Renvoi du mail impossible.");
    } finally {
      setResendBusyId(null);
    }
  }

  async function onDeleteRsvp(id: string, name: string) {
    if (!confirm(`Supprimer la réponse de ${name} ?`)) return;
    setDeleteBusyId(id);
    setMessage("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Suppression impossible.");
        return;
      }
      setRsvps((prev) => {
        const next = prev.filter((r) => r.id !== id);
        const nextPageCount = Math.max(1, Math.ceil(next.length / RSVP_PAGE_SIZE));
        setRsvpPage((page) => Math.min(page, nextPageCount));
        return next;
      });
      setMessage("RSVP supprimé.");
    } catch {
      setMessage("Suppression impossible.");
    } finally {
      setDeleteBusyId(null);
    }
  }

  function exportCsv() {
    const header = [
      "name",
      "email",
      "phone",
      "status",
      "guestOf",
      "message",
      "ticketToken",
      "checkedInAt",
      "emailSentAt",
      "createdAt",
    ];
    const rows = rsvps.map((r) =>
      [
        r.name,
        r.email,
        r.phone,
        r.status,
        guestOfLabels[r.guestOf] || r.guestOf,
        r.message,
        r.ticketToken,
        r.checkedInAt || "",
        r.emailSentAt || "",
        r.createdAt,
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
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Réponses", value: counts.total },
            { label: "RSVP oui", value: counts.yes },
            { label: "Check-in jour J", value: counts.checkedIn },
            { label: `Côté ${site.partnerOne}`, value: counts.ofPartnerOne },
            { label: `Côté ${site.partnerTwo}`, value: counts.ofPartnerTwo },
          ].map((item) => (
            <div key={item.label} className="border border-line bg-white p-5">
              <p className="text-xs tracking-[0.18em] text-soft uppercase">{item.label}</p>
              <p className="meta-date mt-2 text-4xl text-mist">{item.value}</p>
            </div>
          ))}
        </div>
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
              Fichier JPG ou WebP, max 8 Mo. L’image remplit toujours la zone réservée
              (recadrage automatique) : respectez le ratio pour éviter de couper les visages.
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
          {message ? <p className="text-sm text-champagne">{message}</p> : null}
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
                  <img src={photo.url} alt={photo.caption || "Photo"} className="aspect-[4/3] w-full object-cover" />
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
            placeholder="Nom, email, téléphone, statut, invité(e) de…"
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
                <th className="px-4 py-3 font-medium">Mail carte</th>
                <th className="px-4 py-3 font-medium">Check-in</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-soft">
                    Aucune réponse pour l’instant.
                  </td>
                </tr>
              ) : filteredRsvps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-soft">
                    Aucun résultat pour « {rsvpQuery.trim()} ».
                  </td>
                </tr>
              ) : (
                pagedRsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <div className="text-mist">{rsvp.name}</div>
                      <div className="text-xs text-soft">{rsvp.email}</div>
                    </td>
                    <td className="px-4 py-3 text-soft">{rsvp.phone || "—"}</td>
                    <td className="px-4 py-3 text-champagne">{rsvp.status}</td>
                    <td className="px-4 py-3 text-mist">
                      {guestOfLabels[rsvp.guestOf] || rsvp.guestOf || "—"}
                    </td>
                    <td className="px-4 py-3 text-soft">
                      {rsvp.emailSentAt
                        ? new Date(rsvp.emailSentAt).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-soft">
                      {rsvp.checkedInAt
                        ? new Date(rsvp.checkedInAt).toLocaleString("fr-FR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        {rsvp.status !== "no" ? (
                          <>
                            <a
                              href={`/ticket/${rsvp.ticketToken}`}
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
                                onClick={() => void onResendTicket(rsvp.id)}
                                className="text-left text-xs tracking-[0.12em] text-soft uppercase hover:text-champagne disabled:opacity-50"
                              >
                                {resendBusyId === rsvp.id ? "Envoi…" : "Renvoyer mail"}
                              </button>
                            ) : null}
                          </>
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
                ))
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

      {can("check_in") ? <AdminCheckIn /> : null}
      {can("manage_users") ? (
        <AdminUsersEditor initialUsers={initialUsers} currentUserId={currentUser.id} />
      ) : null}
      {can("view_audit") ? <AdminAuditLog initialEntries={initialAudit} /> : null}
    </div>
  );
}
