import type { Metadata, Viewport } from "next";
import { Great_Vibes, Poppins } from "next/font/google";
import { headers } from "next/headers";
import { PwaRegister } from "@/components/PwaRegister";
import { defaultLocale, isLocale } from "@/i18n/config";
import { PWA_EARLY_CAPTURE_SCRIPT } from "@/lib/pwa-install";
import { site } from "@/lib/site";
import "./globals.css";

const display = Great_Vibes({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const sans = Poppins({
  variable: "--font-sans-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#3b2416",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: "Wedding Invitation",
    template: `%s`,
  },
  description: "Wedding invitation",
  applicationName: "Wedding",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mariage",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerLocale = (await headers()).get("x-locale");
  const lang = headerLocale && isLocale(headerLocale) ? headerLocale : defaultLocale;

  return (
    <html lang={lang} className={`${display.variable} ${sans.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full touch-manipulation antialiased" suppressHydrationWarning>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: PWA_EARLY_CAPTURE_SCRIPT,
          }}
        />
        <PwaRegister />
      </body>
    </html>
  );
}
