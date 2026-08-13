import { GallerySection } from "@/components/GallerySection";
import { MenuSection } from "@/components/MenuSection";
import { RsvpForm } from "@/components/RsvpForm";
import { ScheduleSection } from "@/components/ScheduleSection";
import { StorySection } from "@/components/StorySection";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
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
