"use client";

import { useLanguage } from "../components/LanguageProvider";

const copy = {
  en: {
    eyebrow: "About",
    title1: "Me, glass",
    title2: "and the torch.",
    p1: "FRGLASS started simply as my Instagram name. Today I use it to show the glasswork I make and the things I am trying along the way.",
    p2: "I like working directly at the torch and experimenting with borosilicate glass. Sometimes I start with a clear idea, sometimes I just begin and see where it goes. That can turn into a pendant, a marble, a small object or something completely different.",
    p3: "I am also building up my workshop step by step. At some point I would like to open the space a little more for other glassworkers, shared sessions and maybe small workshops. For now, I mainly want to keep making glass, trying new things and getting better at it.",
  },
  de: {
    eyebrow: "Über mich",
    title1: "Ich, Glas",
    title2: "und der Brenner.",
    p1: "FRGLASS war ursprünglich einfach mein Instagram-Name. Heute zeige ich darunter meine Glasarbeiten und alles, was ich rund ums Borosilikatglas ausprobiere.",
    p2: "Ich arbeite gern direkt am Brenner und probiere viel aus. Manchmal habe ich vorher eine klare Idee, manchmal fange ich einfach an und schaue, was daraus wird. So entstehen Anhänger, Murmeln, kleine Objekte oder auch Sachen, die in keine richtige Kategorie passen.",
    p3: "Auch meine Werkstatt baue ich Stück für Stück weiter aus. Irgendwann möchte ich den Platz etwas mehr für andere Glasbläser, gemeinsame Sessions und vielleicht kleine Workshops öffnen. Im Moment geht es mir aber vor allem darum, weiter Glas zu machen, Neues auszuprobieren und besser darin zu werden.",
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
