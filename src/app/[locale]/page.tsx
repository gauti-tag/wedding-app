import { GallerySection } from "@/components/GallerySection";
import { Hero } from "@/components/Hero";
import { MenuSection } from "@/components/MenuSection";
import { RsvpForm } from "@/components/RsvpForm";
import { ScheduleSection } from "@/components/ScheduleSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { StorySection } from "@/components/StorySection";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { coupleLabel } from "@/lib/site";
import {
  getDesserts,
  getDrinks,
  getMenu,
  getPhotos,
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

  const dict = getDictionary(raw);
  const [photos, siteContent, story, schedule, menu, drinks, desserts] = await Promise.all([
    getPhotos(),
    getSiteContent(),
    getStory(),
    getSchedule(),
    getMenu(),
    getDrinks(),
    getDesserts(),
  ]);
  const heroPhoto = photos.find((photo) => photo.album === "hero");
  const names = coupleLabel(siteContent);

  return (
    <>
      <SiteNav locale={raw} dict={dict} coupleName={names} />
      <main>
        <Hero heroPhoto={heroPhoto} siteContent={siteContent} locale={raw} />
        <StorySection photos={photos} story={story} locale={raw} dict={dict} />
        <ScheduleSection
          schedule={schedule}
          weddingDate={siteContent.weddingDate}
          locale={raw}
          dict={dict}
        />
        <MenuSection
          dict={dict}
          locale={raw}
          menu={menu}
          drinks={drinks}
          desserts={desserts}
        />
        <GallerySection photos={photos} dict={dict} />
        <RsvpForm dict={dict} locale={raw} siteContent={siteContent} />
      </main>
      <SiteFooter dict={dict} siteContent={siteContent} locale={raw} />
    </>
  );
}
