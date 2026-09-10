"use client";

import { siteConfig } from "../siteConfig";
import { useLanguage } from "../components/LanguageProvider";

const copy = {
  en: {
    eyebrow: "Contact",
    title: "Get in touch.",
    intro: "Interested in a piece, a custom idea or the future workshop setup? Send me a message and we can sort out the details directly.",
    email: "Send email",
    subject: "FRGLASS inquiry",
    vision: "You can ask me about",
    items: [
      "Available pieces",
      "Custom ideas",
      "Future torch rental",
      "Small workshops or workshop time",
    ],
  },
  de: {
    eyebrow: "Kontakt",
    title: "Meld dich.",
    intro: "Du interessierst dich für ein Stück, eine eigene Idee oder die spätere Werkstatt-Nutzung? Schreib mir einfach und wir klären die Details direkt.",
    email: "E-Mail senden",
    subject: "FRGLASS Anfrage",
    vision: "Du kannst mich fragen wegen",
    items: [
      "Verfügbaren Stücken",
      "Eigener Ideen und Anfragen",
      "Späterer Brennermietung",
      "Kleinen Workshops oder Werkstattzeit",
    ],
  },
} as const;

export default function Page() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-32">
      <section className="mx-auto grid max-w-7xl gap-10 sm:gap-16 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">
            {t.eyebrow}
          </p>

          <h1 className="text-4xl font-black uppercase leading-tight sm:text-6xl">
            {t.title}
          </h1>

          <p className="mt-6 text-base leading-7 text-neutral-300 sm:mt-8 sm:text-lg sm:leading-8">
            {t.intro}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:gap-4">
            <a
              href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(t.subject)}`}
              className="inline-block w-full rounded-full bg-orange-300 px-6 py-4 text-center text-sm font-bold uppercase tracking-widest text-black transition hover:bg-white sm:w-fit sm:px-8"
            >
              {t.email}
            </a>

            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-block w-full rounded-full border border-white/20 px-6 py-4 text-center text-sm font-bold uppercase tracking-widest text-white transition hover:border-orange-300 hover:text-orange-300 sm:w-fit sm:px-8"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:rounded-3xl sm:p-10">
          <h2 className="text-2xl font-black uppercase sm:text-3xl">
            {t.vision}
          </h2>

          <div className="mt-6 grid gap-4 text-neutral-300 sm:mt-8 sm:gap-5">
            {t.items.map((item) => (
              <p key={item}>— {item}</p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
