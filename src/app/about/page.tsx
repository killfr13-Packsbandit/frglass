"use client";

import { useLanguage } from "../components/LanguageProvider";

const copy = {
  en: {
    eyebrow: "About",
    title1: "Shaped by flame.",
    title2: "Made by hand.",
    p1: "This is a place for handmade borosilicate glass art — shaped by fire, color and patience. Every piece is made by hand directly in the flame.",
    p2: "The work includes wearable glass art, marbles, decorative objects and experimental pieces. No mass production — every object is a one-of-a-kind piece.",
    p3: "Over time, this space may grow into an art workshop for creative process, exchange and small personal sessions. For now, the focus is simple: handmade glass art, honest work and pieces born from the flame.",
  },
  de: {
    eyebrow: "Über mich",
    title1: "Von der Flamme geformt.",
    title2: "Von Hand gemacht.",
    p1: "Hier geht es um handgemachte Glaskunst aus Borosilikatglas — geformt durch Feuer, Farbe und Geduld. Jedes Stück entsteht von Hand direkt in der Flamme.",
    p2: "Meine Arbeiten reichen von tragbarer Glaskunst über Murmeln und dekorative Objekte bis zu experimentellen Einzelstücken. Keine Massenproduktion — jedes Objekt ist ein Unikat.",
    p3: "Mit der Zeit kann dieser Ort zu einer offenen Kunstwerkstatt für kreativen Austausch und kleine persönliche Sessions wachsen. Im Mittelpunkt steht aber zuerst das Wesentliche: handgemachte Glaskunst, ehrliche Arbeit und Stücke, die aus der Flamme entstehen.",
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
