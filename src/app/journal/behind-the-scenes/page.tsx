"use client";

import { useLanguage } from "../../components/LanguageProvider";

const copy = {
  en: {
    eyebrow: "Workshop",
    title1: "Behind the scenes",
    title2: "at the torch.",
    intro: "A few photos and notes from the workshop — the torch, tools and the steps behind the finished pieces.",
    sectionTitle: "How I work",
    p1: "Borosilicate glass is heated and shaped directly at the torch. Heat, timing and movement make a big difference, so every piece develops a little differently.",
    p2: "I use this page to show more of the process: new pieces, tests, tools and things that normally do not make it into the final photos.",
    alt1: "Working at the torch",
    alt2: "Borosilicate glass process",
  },
  de: {
    eyebrow: "Werkstatt",
    title1: "Hinter den Kulissen",
    title2: "am Brenner.",
    intro: "Ein paar Bilder und Notizen aus der Werkstatt — Brenner, Werkzeuge und die Arbeit hinter den fertigen Stücken.",
    sectionTitle: "So arbeite ich",
    p1: "Borosilikatglas wird direkt am Brenner erhitzt und geformt. Hitze, Timing und Bewegung machen viel aus, deshalb entwickelt sich jedes Stück etwas anders.",
    p2: "Auf dieser Seite zeige ich mehr vom Prozess: neue Stücke, Tests, Werkzeuge und Dinge, die auf den fertigen Fotos meistens nicht zu sehen sind.",
    alt1: "Arbeit am Brenner",
    alt2: "Arbeit mit Borosilikatglas",
  },
} as const;

export default function Page() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <section className="mx-auto max-w-7xl">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
          {t.eyebrow}
        </p>

        <h1 className="max-w-4xl text-6xl font-black uppercase leading-tight">
          {t.title1}
          <br />
          {t.title2}
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-neutral-300">
          {t.intro}
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img
              src="/workshop/me1.png"
              alt={t.alt1}
              className="h-[560px] w-full object-cover"
            />
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img
              src="/workshop/me2.jpg"
              alt={t.alt2}
              className="h-[560px] w-full object-cover"
            />
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-3xl">
          <h2 className="text-4xl font-black uppercase">
            {t.sectionTitle}
          </h2>

          <p className="mt-6 text-lg leading-8 text-neutral-300">
            {t.p1}
          </p>

          <p className="mt-6 text-lg leading-8 text-neutral-300">
            {t.p2}
          </p>
        </div>
      </section>
    </main>
  );
}
