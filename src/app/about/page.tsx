"use client";

import { useLanguage } from "../components/LanguageProvider";

const copy = {
  en: {
    eyebrow: "About",
    title1: "Florian Robatsch",
    title2: "Carinthia, Austria.",
    p1: "I'm Florian Robatsch from Carinthia, Austria. I enjoy working with my hands and I like processes where material, tools and heat come together directly.",
    p2: "That is exactly what drew me to borosilicate glass. At the torch I make jewelry, marbles, small objects and all kinds of experiments. Some pieces are planned in advance, while others develop during the process.",
    p3: "FRGLASS is the name I use to show this work online. I am continuously building up my workshop and, over time, I would like to create more space for exchange, shared sessions and maybe small workshops.",
  },
  de: {
    eyebrow: "Über mich",
    title1: "Florian Robatsch",
    title2: "Kärnten, Österreich.",
    p1: "Ich bin Florian Robatsch aus Kärnten in Österreich. Ich arbeite gerne mit den Händen und mag Prozesse, bei denen Material, Werkzeug und Hitze direkt zusammenspielen.",
    p2: "Genau deshalb hat mich Borosilikatglas schnell gepackt. Am Brenner entstehen Schmuck, Murmeln, kleine Objekte und immer wieder neue Versuche. Manche Stücke sind vorher geplant, andere entwickeln sich erst während der Arbeit.",
    p3: "FRGLASS ist der Name, unter dem ich diese Arbeiten online zeige. Meine Werkstatt baue ich laufend weiter aus. Langfristig möchte ich dort auch Raum für Austausch, gemeinsame Sessions und vielleicht kleine Workshops schaffen.",
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
            alt={language === "de" ? "Arbeit am Glasbrenner" : "Working at the glass torch"}
            className="h-[720px] w-full object-cover"
          />
        </div>
      </section>
    </main>
  );
}
