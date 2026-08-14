import { GallerySection } from "@/components/GallerySection";
import { GuestbookSection } from "@/components/GuestbookSection";
import { GuestAlbumSection } from "@/components/GuestAlbumSection";
import { InfoSection } from "@/components/InfoSection";
import { MenuSection } from "@/components/MenuSection";
import { RsvpForm } from "@/components/RsvpForm";
import { ScheduleSection } from "@/components/ScheduleSection";
import { StorySection } from "@/components/StorySection";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { GuestAlbumContent } from "@/lib/guest-album";
import type { GuestbookContent } from "@/lib/guestbook";
import type { InfoContent } from "@/lib/info-content";
import { orderedEnabledSections } from "@/lib/site-features";
import type {
  DessertsContent,
  DrinksContent,
  MenuContent,
  Photo,
  ScheduleContent,
  SiteContent,
  StoryContent,
} from "@/lib/types";

export function SiteSections({
  locale,
  dict,
  siteContent,
  photos,
  story,
  schedule,
  menu,
  drinks,
  desserts,
  info,
  guestbook,
  guestAlbum,
  capacityFull,
}: {
  locale: Locale;
  dict: Dictionary;
  siteContent: SiteContent;
  photos: Photo[];
  story: StoryContent;
  schedule: ScheduleContent;
  menu: MenuContent;
  drinks: DrinksContent;
  desserts: DessertsContent;
  info: InfoContent;
  guestbook: GuestbookContent;
  guestAlbum: GuestAlbumContent;
  capacityFull: boolean;
}) {
  const features = siteContent.features;
  const sections = orderedEnabledSections(features);

  return (
    <>
      {sections.map((key) => {
        if (key === "story") {
          return (
            <StorySection
              key={key}
              photos={photos}
              story={story}
              locale={locale}
              dict={dict}
            />
          );
        }
        if (key === "schedule") {
          return (
            <ScheduleSection
              key={key}
              schedule={schedule}
              weddingDate={siteContent.weddingDate}
              locale={locale}
              dict={dict}
              showCountdown={features.countdown}
            />
          );
        }
        if (key === "menu") {
          return (
            <MenuSection
              key={key}
              dict={dict}
              locale={locale}
              menu={menu}
              drinks={drinks}
              desserts={desserts}
              showMenu={features.enabled.menu}
              showDrinks={features.enabled.drinks}
              showDesserts={features.enabled.desserts}
            />
          );
        }
        if (key === "gallery") {
          return <GallerySection key={key} photos={photos} dict={dict} />;
        }
        if (key === "info") {
          return <InfoSection key={key} info={info} locale={locale} dict={dict} />;
        }
        if (key === "guestbook") {
          return (
            <GuestbookSection key={key} initial={guestbook} locale={locale} dict={dict} />
          );
        }
        if (key === "guestAlbum") {
          return (
            <GuestAlbumSection key={key} initial={guestAlbum} locale={locale} dict={dict} />
          );
        }
        return (
          <RsvpForm
            key={key}
            dict={dict}
            locale={locale}
            siteContent={siteContent}
            capacityFull={capacityFull}
          />
        );
      })}
    </>
  );
}
