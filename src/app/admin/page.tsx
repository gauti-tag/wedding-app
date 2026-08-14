import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { getAuditLog } from "@/lib/audit";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import {
  getAdminPrivacy,
  getDesserts,
  getDrinks,
  getGuestAlbum,
  getGuestbook,
  getInfoContent,
  getMcRundown,
  getMenu,
  getPhotos,
  getRsvpReminders,
  getRsvps,
  getSchedule,
  getSeatingPlan,
  getSiteContent,
  getStory,
} from "@/lib/storage";
import { defaultAdminPrivacy } from "@/lib/admin-privacy";
import { emptyMcRundown } from "@/lib/mc-rundown";
import { emptySeatingPlan } from "@/lib/seating";
import { emptyGuestbookContent } from "@/lib/guestbook";
import { emptyGuestAlbumContent } from "@/lib/guest-album";
import { emptyInfoContent } from "@/lib/info-content";
import { ensureSeedAdmin, listPublicUsers, publicUser } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await ensureSeedAdmin();
  const user = await getSessionUser();

  if (!user) {
    return <AdminLogin />;
  }

  const canContent = hasPermission(user.role, "manage_content");
  const canPhotos = hasPermission(user.role, "manage_photos");
  const canRsvp = hasPermission(user.role, "view_rsvp") || hasPermission(user.role, "check_in");
  const canUsers = hasPermission(user.role, "manage_users");
  const canAudit = hasPermission(user.role, "view_audit");

  const [
    photos,
    rsvps,
    reminders,
    siteContent,
    story,
    schedule,
    mcRundown,
    seatingPlan,
    menu,
    drinks,
    desserts,
    info,
    guestbook,
    guestAlbum,
    users,
    audit,
    privacy,
  ] = await Promise.all([
    canPhotos || canContent ? getPhotos() : Promise.resolve([]),
    canRsvp ? getRsvps() : Promise.resolve([]),
    canRsvp ? getRsvpReminders() : Promise.resolve({}),
    getSiteContent(),
    canContent
      ? getStory()
      : Promise.resolve({ eyebrow: { fr: "", en: "" }, title: { fr: "", en: "" }, body: { fr: "", en: "" } }),
    canContent
      ? getSchedule()
      : Promise.resolve({
          eyebrow: { fr: "", en: "" },
          title: { fr: "", en: "" },
          dressCode: { fr: "", en: "" },
          directions: { fr: "", en: "" },
          venues: [],
        }),
    canContent ? getMcRundown() : Promise.resolve(emptyMcRundown()),
    canRsvp ? getSeatingPlan() : Promise.resolve(emptySeatingPlan()),
    canContent
      ? getMenu()
      : Promise.resolve({ subtitle: { fr: "", en: "" }, note: { fr: "", en: "" }, cuisines: [] }),
    canContent ? getDrinks() : Promise.resolve({ items: [] }),
    canContent ? getDesserts() : Promise.resolve({ items: [] }),
    canContent ? getInfoContent() : Promise.resolve(emptyInfoContent()),
    canContent ? getGuestbook() : Promise.resolve(emptyGuestbookContent()),
    canContent ? getGuestAlbum() : Promise.resolve(emptyGuestAlbumContent()),
    canUsers ? listPublicUsers() : Promise.resolve([]),
    canAudit ? getAuditLog(300) : Promise.resolve([]),
    getAdminPrivacy(),
  ]);

  return (
    <AdminPanel
      currentUser={publicUser(user)}
      initialPhotos={photos}
      initialRsvps={rsvps}
      initialReminders={reminders}
      initialSite={siteContent}
      initialStory={story}
      initialSchedule={schedule}
      initialMcRundown={mcRundown}
      initialSeatingPlan={seatingPlan}
      initialMenu={menu}
      initialDrinks={drinks}
      initialDesserts={desserts}
      initialInfo={info}
      initialGuestbook={guestbook}
      initialGuestAlbum={guestAlbum}
      initialUsers={users}
      initialAudit={audit}
      initialPrivacy={privacy ?? defaultAdminPrivacy()}
    />
  );
}
