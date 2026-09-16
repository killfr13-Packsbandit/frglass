import "server-only";

import type { SiteContentMap } from "../app/siteContent";
import {
  isR2Configured,
  mediaBucket,
  mediaKeyFromUrl,
  normalizeMediaUrl,
  readJson,
  writeJson,
} from "./r2Storage";

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
  "home.workshop.title.en": [
    { old: "Glass in the flame", next: "At the torch" },
  ],
  "home.workshop.title.de": [
    { old: "Glas in der Flamme", next: "Am Brenner" },
  ],
  "home.workshop.text.en": [
    {
      old: "I make each piece by hand from borosilicate glass at the torch. Some start with a clear idea, others develop while I work.",
      next: "I make each piece by hand from borosilicate glass in my workshop in Carinthia. Some start with a clear idea, others develop while I work.",
    },
    {
      old: "This is where the pieces begin. Borosilicate glass is heated at the torch, kept in motion and shaped step by step. Some pieces start from a clear idea, while others only reveal their direction during the process.",
      next: "I make each piece by hand from borosilicate glass in my workshop in Carinthia. Some pieces start with a clear idea, while others only reveal their direction while I work.",
    },
    {
      old: "I make each piece by hand from borosilicate glass in my workshop in Carinthia. Some start with a clear idea, others develop while I work.",
      next: "I make each piece by hand from borosilicate glass in my workshop in Carinthia. Some pieces start with a clear idea, while others only reveal their direction while I work.",
    },
  ],
  "home.workshop.text.de": [
    {
      old: "Ich fertige jedes Stück von Hand aus Borosilikatglas am Brenner. Manche Arbeiten sind vorher geplant, andere entwickeln sich erst beim Machen.",
      next: "In meiner Werkstatt in Kärnten fertige ich jedes Stück von Hand aus Borosilikatglas am Brenner. Manche Arbeiten sind vorher geplant, andere entwickeln sich erst beim Machen.",
    },
    {
      old: "Hier beginnt jedes Stück. Borosilikatglas wird am Brenner erhitzt, ständig in Bewegung gehalten und Schritt für Schritt geformt. Manche Arbeiten starten mit einer klaren Idee, andere zeigen erst während des Prozesses, wohin sie sich entwickeln.",
      next: "In meiner Werkstatt in Kärnten fertige ich jedes Stück von Hand aus Borosilikatglas am Brenner. Manche Arbeiten starten mit einer klaren Idee, andere zeigen erst während der Arbeit, wohin sie sich entwickeln.",
    },
    {
      old: "In meiner Werkstatt in Kärnten fertige ich jedes Stück von Hand aus Borosilikatglas am Brenner. Manche Arbeiten sind vorher geplant, andere entwickeln sich erst beim Machen.",
      next: "In meiner Werkstatt in Kärnten fertige ich jedes Stück von Hand aus Borosilikatglas am Brenner. Manche Arbeiten starten mit einer klaren Idee, andere zeigen erst während der Arbeit, wohin sie sich entwickeln.",
    },
  ],
  "home.studio.title.en": [
    { old: "Fire, glass and craft", next: "The workspace" },
  ],
  "home.studio.title.de": [
    { old: "Feuer, Glas und Handwerk", next: "Der Arbeitsplatz" },
  ],
  "home.studio.text.en": [
    {
      old: "A closer look at the place where I work with borosilicate glass, test ideas and gradually develop the studio further.",
      next: "A quick look at my workspace, the setup and my plans for future studio time and small sessions.",
    },
  ],
  "home.studio.text.de": [
    {
      old: "Ein genauerer Blick auf den Ort, an dem ich mit Borosilikatglas arbeite, Ideen ausprobiere und die Werkstatt Schritt für Schritt weiterentwickle.",
      next: "Ein kleiner Einblick in meinen Arbeitsplatz, die Ausstattung und meine Pläne für spätere Werkstattzeit und kleine Sessions.",
    },
  ],
  "studio.intro.en": [
    {
      old: "My workshop in Carinthia is where ideas become glass. I work with borosilicate glass directly at the torch, combining heat, movement and patience until a form begins to emerge. The space is still evolving — just like the work that is made here.",
      next: "My workshop in Carinthia is where glass rods and tubes become jewelry, small objects, experiments and one-off pieces. I work with borosilicate glass (COE 33), heating it to working temperature in an oxygen/gas flame and shaping it directly at the torch. For now the space is mainly set up for my own work; over time I would like to open it up step by step to other people interested in glass.",
    },
  ],
  "studio.intro.de": [
    {
      old: "Meine Werkstatt in Kärnten ist der Ort, an dem aus Ideen Glas wird. Ich arbeite direkt am Brenner mit Borosilikatglas und verbinde Hitze, Bewegung und Geduld, bis sich eine Form entwickelt. Der Raum wächst dabei genauso weiter wie die Arbeiten, die hier entstehen.",
      next: "Meine Werkstatt in Kärnten ist der Ort, an dem aus Glasstäben und -röhren Schmuck, kleine Objekte, Experimente und Einzelstücke entstehen. Ich arbeite mit Borosilikatglas (COE 33), das in einer Sauerstoff-/Gasflamme auf Arbeitstemperatur gebracht und direkt am Brenner geformt wird. Im Moment ist der Platz vor allem für meine eigene Arbeit eingerichtet; langfristig möchte ich ihn Schritt für Schritt auch für andere Glasinteressierte öffnen.",
    },
  ],
  "studio.card1.text.en": [
    { old: "Later I would like to make a properly equipped torch space available by arrangement to glassworkers who already have experience and want to work independently.", next: "In the future I would like to offer a usable torch station for people who already have lampworking experience. The basic setup would include the torch, gas and oxygen, ventilation and the essential workshop equipment." },
  ],
  "studio.card1.text.de": [
    { old: "Später möchte ich einen gut ausgestatteten Brennerplatz nach Absprache auch Glasarbeitern mit eigener Erfahrung zur Verfügung stellen, die selbstständig arbeiten möchten.", next: "Geplant ist später ein nutzbarer Brennerplatz für Menschen, die bereits Erfahrung mit Lampworking haben. Brenner, Gas und Sauerstoff, Absaugung und grundlegende Werkstattausstattung sollen dabei vor Ort vorhanden sein." },
  ],
  "studio.card2.text.en": [
    { old: "For beginners I am planning small, personal sessions that focus on the material, safe handling at the torch and the first steps toward a piece of their own.", next: "For beginners I would like to offer small, personal sessions covering the material, the flame and the first basic movements, with the chance to shape a small glass piece under guidance." },
  ],
  "studio.card2.text.de": [
    { old: "Für Einsteiger sind kleine, persönliche Sessions geplant, bei denen das Material, der sichere Umgang am Brenner und die ersten Schritte zum eigenen Stück im Mittelpunkt stehen.", next: "Für Einsteiger möchte ich kleine, persönliche Sessions anbieten, in denen man Material, Flamme und die ersten Grundbewegungen kennenlernt und unter Anleitung ein kleines eigenes Glasstück formt." },
  ],
  "studio.card3.text.en": [
    { old: "The studio should also be a place for meeting other glassworkers, sharing techniques and ideas, and sometimes simply working next to each other.", next: "I do not want the workshop to be only a production space. It should also leave room for meeting other glassworkers, working together, sharing techniques and learning from one another." },
  ],
  "studio.card3.text.de": [
    { old: "Die Werkstatt soll auch Raum für Austausch mit anderen Glasarbeitern bieten – für Techniken, Ideen und manchmal einfach für gemeinsames Arbeiten am Brenner.", next: "Die Werkstatt soll nicht nur Produktionsort sein. Ich möchte auch Raum für Austausch mit anderen Glasleuten, gemeinsames Arbeiten, neue Techniken und gegenseitige Inspiration schaffen." },
  ],
  "studio.card4.text.en": [
    { old: "Depending on time, setup and experience, individual sessions or focused projects may also become possible later on.", next: "For anyone who wants to focus on a specific technique or get a first look without a larger group, individual one-to-one sessions could become possible later. The content would depend on experience and goals." },
  ],
  "studio.card4.text.de": [
    { old: "Je nach Zeit, Ausstattung und Erfahrung sollen später auch individuelle Sessions oder gezielte Projekte möglich werden.", next: "Wer gezielt an einer Technik arbeiten oder einen ersten Einblick ohne größere Gruppe bekommen möchte, könnte später individuelle 1:1-Sessions anfragen. Umfang und Inhalt richten sich dann nach Erfahrung und Ziel." },
  ],
  "studio.vision.en": [
    { old: "The studio is not meant to become a fixed concept overnight. I am building it up step by step, learning what works and leaving enough space for it to grow naturally.", next: "I would rather let the workshop grow in a useful and safe way than rush into a large course program. That is why I am expanding the equipment, workstations and possibilities step by step while the space remains my own working studio as well." },
  ],
  "studio.vision.de": [
    { old: "Die Werkstatt soll nicht von heute auf morgen zu einem fertigen Konzept werden. Ich baue sie Schritt für Schritt weiter aus, sehe was funktioniert und lasse genug Raum, damit sie sich natürlich entwickeln kann.", next: "Mir ist wichtiger, die Werkstatt sinnvoll und sicher wachsen zu lassen, als möglichst schnell ein großes Kursprogramm anzubieten. Deshalb baue ich Ausstattung, Arbeitsplätze und Möglichkeiten Schritt für Schritt aus – während der Raum weiterhin mein eigener Arbeitsplatz bleibt." },
  ],
  "studio.contact.text.en": [
    { old: "If torch time, a future workshop or simply an exchange about borosilicate glass interests you, send me a message. We can work out the details personally.", next: "If you are interested in future torch time, a small workshop or an individual session, feel free to get in touch already. It also helps me understand which offers people are actually looking for." },
  ],
  "studio.contact.text.de": [
    { old: "Wenn dich Werkstattzeit, ein späterer Workshop oder einfach der Austausch über Borosilikatglas interessiert, schreib mir. Alles Weitere können wir persönlich besprechen.", next: "Wenn du dich für zukünftige Brennerzeit, einen kleinen Workshop oder eine individuelle Session interessierst, kannst du dich gerne schon melden. Dann weiß ich auch besser, welche Angebote später tatsächlich gefragt sind." },
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

function referencedR2Media(content: SiteContentMap) {
  return new Set(
    Object.entries(content)
      .filter(([key]) => key.endsWith(".url"))
      .map(([, value]) => mediaKeyFromUrl(value))
      .filter((key): key is string => Boolean(key)),
  );
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
    throw error;
  }
}

export async function saveSiteContent(content: SiteContentMap) {
  if (!isSiteContentStorageConfigured()) {
    throw new Error("Cloudflare R2 is not configured yet.");
  }

  const previousContent = await getSiteContent();
  const previousMedia = referencedR2Media(previousContent);
  const normalizedContent = normalizeSiteContent(content);
  const nextMedia = referencedR2Media(normalizedContent);

  await writeJson(CATALOG_KEY, normalizedContent);

  const removedMedia = [...previousMedia].filter((key) => !nextMedia.has(key));
  if (removedMedia.length) {
    await mediaBucket().delete(removedMedia);
  }

  return normalizedContent;
}
