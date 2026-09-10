"use client";

import Image from "next/image";
import { useLanguage } from "../../components/LanguageProvider";
import BehindScenesUpdates from "./BehindScenesUpdates";

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
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-32">
      <section className="mx-auto max-w-7xl">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">
          {t.eyebrow}
        </p>

        <h1 className="max-w-4xl break-words text-4xl font-black uppercase leading-tight sm:text-6xl">
          {t.title1}
          <br />
          {t.title2}
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-7 text-neutral-300 sm:mt-8 sm:text-lg sm:leading-8">
          {t.intro}
        </p>

        <div className="mt-10 grid gap-4 sm:mt-16 sm:gap-8 md:grid-cols-2">
          <div className="relative h-[400px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:h-[560px] sm:rounded-3xl">
            <Image
              src="/workshop/me1.png"
              alt={t.alt1}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="relative h-[400px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:h-[560px] sm:rounded-3xl">
            <Image
              src="/workshop/me2.jpg"
              alt={t.alt2}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <BehindScenesUpdates />

        <div className="mx-auto mt-14 max-w-3xl sm:mt-20">
          <h2 className="text-3xl font-black uppercase sm:text-4xl">
            {t.sectionTitle}
          </h2>

          <p className="mt-6 text-base leading-7 text-neutral-300 sm:text-lg sm:leading-8">
            {t.p1}
          </p>

          <p className="mt-5 text-base leading-7 text-neutral-300 sm:mt-6 sm:text-lg sm:leading-8">
            {t.p2}
          </p>
        </div>
      </section>
    </main>
  );
}
