import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ThemeStyles } from "@/components/ThemeStyles";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { eventLabel, resolveDictionary } from "@/lib/site";
import { getSiteContent } from "@/lib/storage";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};

  const siteContent = await getSiteContent();
  const dict = resolveDictionary(getDictionary(raw), siteContent.vocabulary, raw);
  const names = eventLabel(siteContent, raw);
  const title = `${names} — ${dict.meta.titleSuffix}`;
  const description = dict.meta.description;
  const ogLocale = raw === "fr" ? "fr_FR" : "en_US";

  return {
    title,
    description,
    themeColor: siteContent.theme.colors.text,
    alternates: {
      canonical: `/${raw}`,
      languages: {
        fr: "/fr",
        en: "/en",
        "x-default": "/fr",
      },
    },
    openGraph: {
      type: "website",
      url: `/${raw}`,
      title,
      description,
      siteName: names,
      locale: ogLocale,
      alternateLocale: raw === "fr" ? ["en_US"] : ["fr_FR"],
      images: [
        {
          url: "/og.jpg",
          width: 1200,
          height: 630,
          alt: names,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.jpg"],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const siteContent = await getSiteContent();

  return (
    <SmoothScroll>
      <ThemeStyles theme={siteContent.theme} />
      <div lang={locale} className="contents">
        {children}
      </div>
    </SmoothScroll>
  );
}
