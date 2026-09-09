"use client";

import { useLanguage } from "../components/LanguageProvider";

const copy = {
  en: {
    eyebrow: "About",
    title1: "Florian Robatsch",
    title2: "from Carinthia, Austria.",
    p1: "I'm Florian Robatsch from St. Veit an der Glan in Carinthia, Austria. I've always liked making things with my hands — and if fire is involved, even better.",
    p2: "Glass fits that perfectly. I work with borosilicate glass at the torch and make jewelry, marbles, small objects and all kinds of experiments. Some pieces are planned, others simply develop while I work.",
    p3: "FRGLASS is the name I use to show my work online. My workshop is still growing step by step, and over time I would like to open the space a little more for other glassworkers, shared sessions and maybe small workshops.",
  },
  de: {
    eyebrow: "Über mich",
    title1: "Florian Robatsch",
    title2: "aus Kärnten, Österreich.",
    p1: "Ich bin Florian Robatsch aus St. Veit an der Glan in Kärnten. Ich mache einfach gern Dinge mit den Händen — und wenn dabei Feuer im Spiel ist, umso besser.",
    p2: "Da passt Glas ziemlich gut. Ich arbeite am Brenner mit Borosilikatglas und mache Schmuck, Murmeln, kleine Objekte und alles Mögliche, das ich ausprobieren möchte. Manche Sachen plane ich vorher, andere entstehen einfach beim Machen.",
    p3: "FRGLASS ist der Name, unter dem ich meine Arbeiten online zeige. Meine Werkstatt wächst Stück für Stück weiter und irgendwann möchte ich den Platz auch etwas mehr für andere Glasbläser, gemeinsame Sessions und vielleicht kleine Workshops öffnen.",
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

          <h1 className="text-6xl font-black leading-tight">
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
            alt={language === "de" ? "Florian Robatsch am Glasbrenner" : "Florian Robatsch at the glass torch"}
            className="h-[720px] w-full object-cover"
          />
        </div>
      </section>
    </main>
  );
}
