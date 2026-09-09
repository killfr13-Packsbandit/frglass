"use client";

import { useLanguage } from "../components/LanguageProvider";

const copy = {
  en: {
    eyebrow: "About",
    title1: "FRGLASS",
    title2: "Borosilicate from Austria.",
    p1: "I make borosilicate glass by hand at the torch. Most of the work is jewelry, marbles, small objects and whatever else I feel like trying.",
    p2: "I like clean shapes, strong colors and pieces that still feel handmade. Everything is made individually in my workshop.",
    p3: "The workshop is still growing. Over time I would like to open it up a bit more for other glassworkers, small workshops and shared time at the torch.",
  },
  de: {
    eyebrow: "Über mich",
    title1: "FRGLASS",
    title2: "Borosilikat aus Österreich.",
    p1: "Ich arbeite von Hand mit Borosilikatglas am Brenner. Dabei entstehen vor allem Schmuck, Murmeln, kleine Objekte und immer wieder neue Versuche.",
    p2: "Ich mag klare Formen, kräftige Farben und Stücke, bei denen man noch sieht, dass sie handgemacht sind. Alles entsteht einzeln in meiner Werkstatt.",
    p3: "Die Werkstatt wächst noch. Mit der Zeit möchte ich sie etwas mehr für andere Glasbläser, kleine Workshops und gemeinsame Zeit am Brenner öffnen.",
  },
} as const;

export default function Page() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <section className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
            {t.eyebrow}
          </p>

          <h1 className="text-6xl font-black uppercase leading-tight">
            {t.title1}
            <br />
            {t.title2}
          </h1>

          <p className="mt-8 text-lg leading-8 text-neutral-300">{t.p1}</p>
          <p className="mt-6 text-lg leading-8 text-neutral-300">{t.p2}</p>
          <p className="mt-6 text-lg leading-8 text-neutral-300">{t.p3}</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <img
            src="/workshop/me1.png"
            alt="FRGLASS studio"
            className="h-[720px] w-full object-cover"
          />
        </div>
      </section>
    </main>
  );
}
