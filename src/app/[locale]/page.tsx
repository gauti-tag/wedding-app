import { Hero } from "@/components/Hero";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { SiteSections } from "@/components/SiteSections";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { isGuestCapacityFull } from "@/lib/guest-capacity";
import { eventLabel, resolveDictionary } from "@/lib/site";
import { MAX_HERO_PHOTOS } from "@/lib/hero-carousel";
import {
  getDesserts,
  getDrinks,
  getMenu,
  getPhotos,
  getRsvps,
  getSchedule,
  getSiteContent,
  getStory,
} from "@/lib/storage";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const baseDict = getDictionary(raw);
  const [photos, siteContent, story, schedule, menu, drinks, desserts, rsvps] =
    await Promise.all([
      getPhotos(),
      getSiteContent(),
      getStory(),
      getSchedule(),
      getMenu(),
      getDrinks(),
      getDesserts(),
      getRsvps(),
    ]);
  const dict = resolveDictionary(baseDict, siteContent.vocabulary, raw);
  const heroPhotos = photos
    .filter((photo) => photo.album === "hero")
    .sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt))
    .slice(0, MAX_HERO_PHOTOS);
  const names = eventLabel(siteContent, raw);
  const capacityFull = isGuestCapacityFull(siteContent.guestCapacity, rsvps);
  const features = siteContent.features;

  return (
    <>
      <SiteNav
        locale={raw}
        dict={dict}
        coupleName={names}
        features={features}
      />
      <main id={features.enabled.hero ? undefined : "top"}>
        {features.enabled.hero ? (
          <Hero heroPhotos={heroPhotos} siteContent={siteContent} locale={raw} />
        ) : null}
        <SiteSections
          locale={raw}
          dict={dict}
          siteContent={siteContent}
          photos={photos}
          story={story}
          schedule={schedule}
          menu={menu}
          drinks={drinks}
          desserts={desserts}
          capacityFull={capacityFull}
        />
      </main>
      <SiteFooter dict={dict} siteContent={siteContent} locale={raw} />
      <PwaInstallPrompt copy={dict.footer.installPrompt} />
    </>
  );
}
