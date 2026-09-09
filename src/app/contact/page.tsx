"use client";

import { siteConfig } from "../siteConfig";
import { useLanguage } from "../components/LanguageProvider";

const copy = {
  en: {
    eyebrow: "Contact",
    title: "Let's talk about glass.",
    intro: "Interested in a piece, a custom idea, studio updates or the future open studio concept? Send a message and we can talk personally.",
    email: "Send Email",
    subject: "FRGLASS Inquiry",
    vision: "Future Studio Vision",
    items: [
      "💎 Available pieces and custom inquiries",
      "🔥 Future open studio time",
      "🎓 Possible small personal sessions later on",
      "💛 Community and exchange around glass",
    ],
    outro: "FRGLASS is based in Austria. The studio concept is growing step by step — handmade glass comes first.",
  },
  de: {
    eyebrow: "Kontakt",
    title: "Reden wir über Glas.",
    intro: "Du interessierst dich für ein Stück, eine individuelle Idee, Studio-Updates oder das zukünftige offene Studio? Schreib mir einfach und wir besprechen alles persönlich.",
    email: "E-Mail senden",
    subject: "FRGLASS Anfrage",
    vision: "Vision für das zukünftige Studio",
    items: [
      "💎 Verfügbare Stücke und individuelle Anfragen",
      "🔥 Zukünftige offene Studiozeiten",
      "🎓 Später eventuell kleine persönliche Sessions",
      "💛 Community und Austausch rund um Glas",
    ],
    outro: "FRGLASS ist in Österreich zuhause. Das Studiokonzept wächst Schritt für Schritt — handgemachte Glaskunst steht dabei an erster Stelle.",
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
            {t.title}
          </h1>

          <p className="mt-8 text-lg leading-8 text-neutral-300">
            {t.intro}
          </p>

          <div className="mt-10 flex flex-col gap-4">
            <a
              href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(t.subject)}`}
              className="inline-block w-fit rounded-full bg-orange-300 px-8 py-4 font-bold uppercase tracking-widest text-black transition hover:bg-white"
            >
              {t.email}
            </a>

            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-block w-fit rounded-full border border-white/20 px-8 py-4 font-bold uppercase tracking-widest text-white transition hover:border-orange-300 hover:text-orange-300"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
          <h2 className="text-3xl font-black uppercase">
            {t.vision}
          </h2>

          <div className="mt-8 grid gap-5 text-neutral-300">
            {t.items.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>

          <p className="mt-8 text-neutral-400">
            {t.outro}
          </p>
        </div>
      </section>
    </main>
  );
}
