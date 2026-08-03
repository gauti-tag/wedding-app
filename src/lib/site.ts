import type { SiteContent } from "@/lib/types";

export const site = {
  contactEmail: "contact@exemple.com",
  /** Remplacez par votre domaine de prod (ex. https://gautier-et-francybel.fr) */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export function coupleLabel(content: Pick<SiteContent, "partnerOne" | "partnerTwo">) {
  return `${content.partnerOne} & ${content.partnerTwo}`;
}
