import type { LocalizedText } from "@/lib/types";

const emptyL = (): LocalizedText => ({ fr: "", en: "" });

export type FaqItem = {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
};

export type InfoPlace = {
  id: string;
  name: LocalizedText;
  address: LocalizedText;
  /** Lien Google Maps / Waze / Apple Plans. */
  mapUrl: string;
  note: LocalizedText;
};

/** FAQ + lieux / carte — section publique activable. */
export type InfoContent = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  intro: LocalizedText;
  faqs: FaqItem[];
  places: InfoPlace[];
};

export function emptyInfoContent(): InfoContent {
  return {
    eyebrow: { fr: "Infos pratiques", en: "Practical info" },
    title: { fr: "FAQ & accès", en: "FAQ & directions" },
    intro: {
      fr: "Les réponses aux questions fréquentes et les accès aux lieux.",
      en: "Answers to common questions and directions to the venues.",
    },
    faqs: [
      {
        id: "faq-dress",
        question: { fr: "Quelle tenue prévoir ?", en: "What should I wear?" },
        answer: {
          fr: "Tenue élégante recommandée. Le dress code détaillé figure dans le programme.",
          en: "Smart attire recommended. See the schedule section for the dress code.",
        },
      },
      {
        id: "faq-kids",
        question: { fr: "Les enfants sont-ils les bienvenus ?", en: "Are children welcome?" },
        answer: {
          fr: "Merci de nous indiquer leur présence dans le RSVP pour organiser au mieux.",
          en: "Please mention them in your RSVP so we can plan accordingly.",
        },
      },
    ],
    places: [],
  };
}

export function normalizeInfoContent(raw: unknown): InfoContent {
  const d = emptyInfoContent();
  if (!raw || typeof raw !== "object") return d;
  const o = raw as Partial<InfoContent>;
  const loc = (v: unknown, fb: LocalizedText): LocalizedText => {
    if (!v || typeof v !== "object") return fb;
    const x = v as { fr?: unknown; en?: unknown };
    return {
      fr: typeof x.fr === "string" ? x.fr : fb.fr,
      en: typeof x.en === "string" ? x.en : fb.en,
    };
  };
  return {
    eyebrow: loc(o.eyebrow, d.eyebrow),
    title: loc(o.title, d.title),
    intro: loc(o.intro, d.intro),
    faqs: Array.isArray(o.faqs)
      ? o.faqs
          .filter((f): f is FaqItem => Boolean(f && typeof f === "object"))
          .map((f, i) => ({
            id: typeof f.id === "string" && f.id ? f.id : `faq-${i}`,
            question: loc(f.question, emptyL()),
            answer: loc(f.answer, emptyL()),
          }))
      : d.faqs,
    places: Array.isArray(o.places)
      ? o.places
          .filter((p): p is InfoPlace => Boolean(p && typeof p === "object"))
          .map((p, i) => ({
            id: typeof p.id === "string" && p.id ? p.id : `place-${i}`,
            name: loc(p.name, emptyL()),
            address: loc(p.address, emptyL()),
            mapUrl: typeof p.mapUrl === "string" ? p.mapUrl : "",
            note: loc(p.note, emptyL()),
          }))
      : [],
  };
}
