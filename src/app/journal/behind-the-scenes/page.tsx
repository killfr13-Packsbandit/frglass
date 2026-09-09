"use client";

import { useLanguage } from "../../components/LanguageProvider";

const copy = {
  en: {
    eyebrow: "Process",
    title1: "Behind the scenes.",
    title2: "Fire, glass and time.",
    intro: "A quiet look into the process behind handmade borosilicate glass art: the flame, the tools, the colors and the slow decisions that shape every piece.",
    sectionTitle: "Made slowly.",
    p1: "Borosilicate glass is shaped directly in the flame. Heat, timing and movement decide the final form. Some pieces start with a clear idea, others grow through the process.",
    p2: "This page will collect moments from the bench — experiments, new pieces, color tests, tools and the small details that usually stay behind the finished object.",
    alt1: "Working at the flame",
    alt2: "Borosilicate glass process",
  },
  de: {
    eyebrow: "Prozess",
    title1: "Hinter den Kulissen.",
    title2: "Feuer, Glas und Zeit.",
    intro: "Ein ruhiger Blick auf den Prozess hinter handgemachter Borosilikat-Glaskunst: die Flamme, die Werkzeuge, die Farben und die kleinen Entscheidungen, die jedes Stück formen.",
    sectionTitle: "Langsam gemacht.",
    p1: "Borosilikatglas wird direkt in der Flamme geformt. Hitze, Timing und Bewegung bestimmen die endgültige Form. Manche Stücke beginnen mit einer klaren Idee, andere entwickeln sich erst während des Prozesses.",
    p2: "Diese Seite sammelt Momente von der Werkbank — Experimente, neue Stücke, Farbtests, Werkzeuge und all die kleinen Details, die hinter dem fertigen Objekt oft unsichtbar bleiben.",
    alt1: "Arbeit an der Flamme",
    alt2: "Prozess mit Borosilikatglas",
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
