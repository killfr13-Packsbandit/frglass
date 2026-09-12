import "server-only";

import type { SiteContentMap } from "../app/siteContent";
import { isR2Configured, normalizeMediaUrl, readJson, writeJson } from "./r2Storage";

const CATALOG_KEY = "cms/site-content/catalog.json";

const STALE_COPY: Record<string, { old: string; next: string }[]> = {
  "home.hero.subtitle.en": [
    { old: "Borosilicate Glass", next: "Borosilicate glass · Carinthia, Austria" },
  ],
  "home.hero.subtitle.de": [
    { old: "Borosilikatglas", next: "Borosilikatglas · Kärnten, Österreich" },
  ],
  "home.hero.text.en": [
    {
      old: "Handmade borosilicate glass, jewelry and other experiments from my mind.",
      next: "I’m Florian Robatsch, a glass artist from Carinthia. At the torch I turn borosilicate glass into one-of-a-kind jewelry, objects and whatever ideas happen to stick in my head.",
    },
  ],
  "home.hero.text.de": [
    {
      old: "Handgemachtes Borosilikatglas, Schmuck und andere Experimente aus meinem Kopf.",
      next: "Ich bin Florian Robatsch, Glaskünstler aus Kärnten. Am Brenner entstehen aus Borosilikatglas handgemachte Unikate – Schmuck, Objekte und alles, was mir sonst noch durch den Kopf geht.",
    },
  ],
  "home.jewelry.intro.en": [
    {
      old: "Handmade pendants from borosilicate glass. Each piece is one of a kind.",
      next: "Handmade borosilicate glass pendants from Austria. Every piece is made individually at the torch and is one of a kind.",
    },
  ],
  "home.jewelry.intro.de": [
    {
      old: "Handgemachte Anhänger aus Borosilikatglas. Jedes Stück ein Unikat.",
      next: "Handgemachte Anhänger aus Borosilikatglas aus Österreich. Jedes Stück entsteht einzeln am Brenner und ist ein Unikat.",
    },
  ],
  "home.workshop.text.en": [
    {
      old: "I make each piece by hand from borosilicate glass at the torch. Some start with a clear idea, others develop while I work.",
      next: "I make each piece by hand from borosilicate glass in my workshop in Carinthia. Some start with a clear idea, others develop while I work.",
    },
  ],
  "home.workshop.text.de": [
    {
      old: "Ich fertige jedes Stück von Hand aus Borosilikatglas am Brenner. Manche Arbeiten sind vorher geplant, andere entwickeln sich erst beim Machen.",
      next: "In meiner Werkstatt in Kärnten fertige ich jedes Stück von Hand aus Borosilikatglas am Brenner. Manche Arbeiten sind vorher geplant, andere entwickeln sich erst beim Machen.",
    },
  ],
  "shop.intro.en": [
    {
      old: "These pieces are currently available. If you are interested in one, send me a message and we can arrange payment and shipping directly.",
      next: "These pieces are currently available. Open a piece to see all details and send an inquiry from there.",
    },
  ],
  "shop.intro.de": [
    {
      old: "Diese Stücke sind aktuell verfügbar. Wenn dich eines interessiert, schreib mir einfach und wir klären Bezahlung und Versand direkt.",
      next: "Diese Stücke sind aktuell verfügbar. Öffne ein Stück für alle Details und stelle deine Anfrage direkt auf der Produktseite.",
    },
  ],
};

const LEGACY_MEDIA: Array<{
  urlKey: string;
  typeKey: string;
  oldUrl: string;
  nextUrl: string;
}> = [
  {
    urlKey: "home.hero.media.url",
    typeKey: "home.hero.media.type",
    oldUrl: "/hero/hero.mp4",
    nextUrl: "/workshop/me2.jpg",
  },
  {
    urlKey: "home.workshop.main.url",
    typeKey: "home.workshop.main.type",
    oldUrl: "/workshop/hero.mp4",
    nextUrl: "/workshop/me2.jpg",
  },
  {
    urlKey: "home.workshop.media1.url",
    typeKey: "home.workshop.media1.type",
    oldUrl: "/workshop/me1.png",
    nextUrl: "/jewelry/Cobald5 x Opaldust Leaf.jpg",
  },
  {
    urlKey: "about.media.url",
    typeKey: "about.media.type",
    oldUrl: "/workshop/me1.png",
    nextUrl: "/workshop/me2.jpg",
  },
];

function normalizeSiteContent(content: SiteContentMap) {
  const next = { ...content };
  for (const [key, replacements] of Object.entries(STALE_COPY)) {
    for (const replacement of replacements) {
      if (next[key] === replacement.old) next[key] = replacement.next;
    }
  }
  for (const migration of LEGACY_MEDIA) {
    if (next[migration.urlKey] === migration.oldUrl) {
      next[migration.urlKey] = migration.nextUrl;
      next[migration.typeKey] = "image";
    }
  }
  for (const [key, value] of Object.entries(next)) {
    if (key.endsWith(".url")) next[key] = normalizeMediaUrl(value);
  }
  return next;
}

export function isSiteContentStorageConfigured() {
  return isR2Configured();
}

export async function getSiteContent(): Promise<SiteContentMap> {
  if (!isSiteContentStorageConfigured()) return {};

  try {
    const data = await readJson<unknown>(CATALOG_KEY);
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};

    const content: SiteContentMap = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (typeof value === "string") content[key] = value;
    }
    return normalizeSiteContent(content);
  } catch (error) {
    console.error("Could not load site content", error);
    return {};
  }
}

export async function saveSiteContent(content: SiteContentMap) {
  if (!isSiteContentStorageConfigured()) {
    throw new Error("Cloudflare R2 is not configured yet.");
  }

  const normalizedContent = normalizeSiteContent(content);
  await writeJson(CATALOG_KEY, normalizedContent);
  return normalizedContent;
}
