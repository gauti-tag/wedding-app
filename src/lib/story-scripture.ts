import type {
  LocalizedText,
  StoryContent,
  StoryScriptureBlock,
  StoryScriptureReference,
} from "@/lib/types";

const emptyL = (): LocalizedText => ({ fr: "", en: "" });

function asLocalized(raw: unknown): LocalizedText {
  if (!raw || typeof raw !== "object") return emptyL();
  const obj = raw as { fr?: unknown; en?: unknown };
  return {
    fr: typeof obj.fr === "string" ? obj.fr : "",
    en: typeof obj.en === "string" ? obj.en : "",
  };
}

export function emptyStoryScriptureBlock(): StoryScriptureBlock {
  return {
    enabled: false,
    eyebrow: emptyL(),
    references: [],
  };
}

export function defaultStoryScriptureEyebrow(): LocalizedText {
  return {
    fr: "Parole inspirante",
    en: "Scripture",
  };
}

export function weddingScripturePreset(): StoryScriptureReference[] {
  return [
    {
      id: "wedding-1cor13",
      reference: {
        fr: "1 Corinthiens 13:4-7",
        en: "1 Corinthians 13:4-7",
      },
      text: {
        fr: "L’amour est patient, il est plein de bonté ; l’amour n’est pas envieux ; l’amour ne se vante pas, il ne s’enfle pas d’orgueil. Il ne fait rien de malhonnête, il ne cherche pas son intérêt, il ne s’irrite pas, il ne garde pas rancune. Il ne se réjouit pas du mal, mais il se réjouit de la vérité. Il excuse tout, il croit tout, il espère tout, il supporte tout.",
        en: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs. Love does not delight in evil but rejoices with the truth. It always protects, always trusts, always hopes, always perseveres.",
      },
    },
    {
      id: "wedding-gen2",
      reference: {
        fr: "Genèse 2:24",
        en: "Genesis 2:24",
      },
      text: {
        fr: "C’est pourquoi l’homme quittera son père et sa mère et s’attachera à sa femme, et ils deviendront une seule chair.",
        en: "That is why a man leaves his father and mother and is united to his wife, and they become one flesh.",
      },
    },
    {
      id: "wedding-eccl4",
      reference: {
        fr: "Ecclésiaste 4:12",
        en: "Ecclesiastes 4:12",
      },
      text: {
        fr: "Une corde à trois fils ne se rompt pas facilement.",
        en: "A cord of three strands is not quickly broken.",
      },
    },
  ];
}

export function weddingScriptureBlockPreset(): StoryScriptureBlock {
  return {
    enabled: true,
    eyebrow: defaultStoryScriptureEyebrow(),
    references: weddingScripturePreset(),
  };
}

function normalizeReference(raw: unknown): StoryScriptureReference | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const id = typeof obj.id === "string" ? obj.id.trim() : "";
  if (!id || id.length > 80) return null;
  const reference = asLocalized(obj.reference);
  const text = asLocalized(obj.text);
  if (!reference.fr.trim() && !reference.en.trim()) return null;
  if (!text.fr.trim() && !text.en.trim()) return null;
  return { id, reference, text };
}

export function normalizeStoryScriptureBlock(
  raw: unknown,
  fallback?: StoryScriptureBlock,
): StoryScriptureBlock {
  const base = fallback ?? emptyStoryScriptureBlock();
  if (!raw || typeof raw !== "object") return base;

  const obj = raw as Record<string, unknown>;
  const references: StoryScriptureReference[] = [];
  if (Array.isArray(obj.references)) {
    for (const item of obj.references) {
      const ref = normalizeReference(item);
      if (ref) references.push(ref);
      if (references.length >= 5) break;
    }
  }

  const eyebrow = asLocalized(obj.eyebrow);
  const hasEyebrow = eyebrow.fr.trim() || eyebrow.en.trim();

  return {
    enabled: typeof obj.enabled === "boolean" ? obj.enabled : base.enabled,
    eyebrow: hasEyebrow ? eyebrow : base.eyebrow,
    references,
  };
}

export function normalizeStoryContent(raw: Partial<StoryContent> | null | undefined): StoryContent {
  const scriptureFallback = emptyStoryScriptureBlock();
  return {
    eyebrow: asLocalized(raw?.eyebrow),
    title: asLocalized(raw?.title),
    body: asLocalized(raw?.body),
    scripture: normalizeStoryScriptureBlock(raw?.scripture, scriptureFallback),
  };
}

export function hasVisibleScripture(
  block: StoryScriptureBlock | undefined,
  locale: "fr" | "en",
): boolean {
  if (!block?.enabled) return false;
  return block.references.some(
    (ref) =>
      (ref.text[locale]?.trim() || ref.text.fr?.trim() || ref.text.en?.trim()) &&
      (ref.reference[locale]?.trim() || ref.reference.fr?.trim() || ref.reference.en?.trim()),
  );
}

export function newScriptureReferenceId(): string {
  return `verse_${Date.now().toString(36)}`;
}
