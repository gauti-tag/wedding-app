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
  getRsvpPlaceSends,
  getRsvpReleases,
  getRsvpReminders,
  getRsvps,
  getSchedule,
  getSeatingPlan,
  getSiteContent,
  getStory,
  getTeeStudio,
  getThanksPage,
} from "@/lib/storage";
import { defaultAdminPrivacy } from "@/lib/admin-privacy";
import { emptyMcRundown } from "@/lib/mc-rundown";
import { emptySeatingPlan } from "@/lib/seating";
import { emptyGuestbookContent } from "@/lib/guestbook";
import { emptyGuestAlbumContent } from "@/lib/guest-album";
import { emptyInfoContent } from "@/lib/info-content";
import {
  emptyDessertsContent,
  emptyDrinksContent,
  emptyMenuContent,
} from "@/lib/menu-headings";
import { emptyTeeStudio } from "@/lib/tee-studio";
import { emptyThanksPage } from "@/lib/thanks-page";
import { emptyStoryScriptureBlock } from "@/lib/story-scripture";
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
    placeSends,
    releases,
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
    teeStudio,
    thanks,
    users,
    audit,
    privacy,
  ] = await Promise.all([
    canPhotos || canContent ? getPhotos() : Promise.resolve([]),
    canRsvp ? getRsvps() : Promise.resolve([]),
    canRsvp ? getRsvpReminders() : Promise.resolve({}),
    canRsvp ? getRsvpPlaceSends() : Promise.resolve({}),
    canRsvp ? getRsvpReleases() : Promise.resolve({}),
    getSiteContent(),
    canContent
      ? getStory()
      : Promise.resolve({
          eyebrow: { fr: "", en: "" },
          title: { fr: "", en: "" },
          body: { fr: "", en: "" },
          scripture: emptyStoryScriptureBlock(),
        }),
    canRsvp || canContent
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
      : Promise.resolve(emptyMenuContent()),
    canContent ? getDrinks() : Promise.resolve(emptyDrinksContent()),
    canContent ? getDesserts() : Promise.resolve(emptyDessertsContent()),
    canContent ? getInfoContent() : Promise.resolve(emptyInfoContent()),
    canContent ? getGuestbook() : Promise.resolve(emptyGuestbookContent()),
    canContent ? getGuestAlbum() : Promise.resolve(emptyGuestAlbumContent()),
    canContent ? getTeeStudio() : Promise.resolve(emptyTeeStudio()),
    canContent ? getThanksPage() : Promise.resolve(emptyThanksPage()),
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
      initialPlaceSends={placeSends}
      initialReleases={releases}
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
      initialTeeStudio={teeStudio}
      initialThanks={thanks}
      initialUsers={users}
      initialAudit={audit}
      initialPrivacy={privacy ?? defaultAdminPrivacy()}
    />
  );
}
