import type { LocalizedText, RsvpConfig, RsvpGuestOfOption } from "@/lib/types";

export const GUEST_RELATIONS = ["parent", "friend", "colleague"] as const;
export type GuestRelation = (typeof GUEST_RELATIONS)[number];

export const GUEST_HOST_SUFFIXES = ["host_one", "host_two"] as const;
export type GuestHostSuffix = (typeof GUEST_HOST_SUFFIXES)[number];

const RELATION_LABELS: Record<GuestRelation, LocalizedText> = {
  parent: { fr: "Parent de", en: "Parent of" },
  friend: { fr: "Ami de", en: "Friend of" },
  colleague: { fr: "Collègue de", en: "Collègue of" },
};

const HOST_SUFFIX_LABELS: Record<GuestHostSuffix, { fr: string; en: string }> = {
  host_one: { fr: "Hôte 1", en: "Host 1" },
  host_two: { fr: "Hôte 2", en: "Host 2" },
};

export function composeGuestOfId(relation: GuestRelation, host: GuestHostSuffix): string {
  return `${relation}_${host}`;
}

export function parseGuestOfId(
  id: string,
): { relation: GuestRelation; host: GuestHostSuffix } | null {
  const match = id.match(/^(parent|friend|colleague)_(host_one|host_two)$/);
  if (!match) return null;
  return {
    relation: match[1] as GuestRelation,
    host: match[2] as GuestHostSuffix,
  };
}

export function buildStructuredGuestOfOptions(
  partnerOne: string,
  partnerTwo: string,
): RsvpGuestOfOption[] {
  const one = partnerOne.trim() || "Hôte 1";
  const two = partnerTwo.trim() || "Hôte 2";
  const hosts: { suffix: GuestHostSuffix; name: string }[] = [
    { suffix: "host_one", name: one },
    { suffix: "host_two", name: two },
  ];

  return GUEST_RELATIONS.flatMap((relation) =>
    hosts.map((host) => ({
      id: composeGuestOfId(relation, host.suffix),
      label: {
        fr: `${RELATION_LABELS[relation].fr} ${host.name}`,
        en: `${RELATION_LABELS[relation].en} ${host.name}`,
      },
    })),
  );
}

export function isStructuredGuestOfConfig(options: RsvpGuestOfOption[]): boolean {
  if (options.length !== GUEST_RELATIONS.length * GUEST_HOST_SUFFIXES.length) return false;
  const expected = new Set(
    GUEST_RELATIONS.flatMap((relation) =>
      GUEST_HOST_SUFFIXES.map((host) => composeGuestOfId(relation, host)),
    ),
  );
  return options.every((option) => expected.has(option.id));
}

export function guestRelationLabel(relation: GuestRelation, locale: "fr" | "en"): string {
  return RELATION_LABELS[relation][locale];
}

export function guestHostOptions(
  partnerOne: string,
  partnerTwo: string,
  locale: "fr" | "en",
): { id: GuestHostSuffix; label: string }[] {
  const one = partnerOne.trim() || HOST_SUFFIX_LABELS.host_one[locale];
  const two = partnerTwo.trim() || HOST_SUFFIX_LABELS.host_two[locale];
  return [
    { id: "host_one", label: one },
    { id: "host_two", label: two },
  ];
}

/** Met à jour les libellés des options structurées et legacy quand les prénoms changent. */
export function syncGuestOfLabelsFromHosts(
  config: RsvpConfig,
  partnerOne: string,
  partnerTwo: string,
): RsvpConfig {
  if (isStructuredGuestOfConfig(config.guestOfOptions)) {
    return {
      ...config,
      guestOfOptions: buildStructuredGuestOfOptions(partnerOne, partnerTwo),
    };
  }

  const one = partnerOne.trim() || "Hôte 1";
  const two = partnerTwo.trim();
  const both = two ? `${one} & ${two}` : one;
  return {
    ...config,
    guestOfOptions: config.guestOfOptions.map((opt) => {
      if (opt.id === "gautier" || opt.id === "host_one") {
        return { ...opt, label: { fr: one, en: one } };
      }
      if (opt.id === "francybel" || opt.id === "host_two") {
        return { ...opt, label: { fr: two || one, en: two || one } };
      }
      if (opt.id === "both") {
        return { ...opt, label: { fr: both, en: both } };
      }
      return opt;
    }),
  };
}
