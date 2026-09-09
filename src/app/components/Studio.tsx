"use client";

import { siteConfig } from "../siteConfig";
import { translations, useLanguage } from "./LanguageProvider";

const studioImages = [
  "/workshop/me1.png",
  "/workshop/me2.jpg",
];

export default function Studio() {
  const { language } = useLanguage();
  const t = translations[language].studio;

  return (
    <section className="bg-neutral-950 px-6 py-28 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
          {t.eyebrow}
        </p>

        <h2 className="text-center text-5xl font-black uppercase">
          {t.title}
        </h2>

        <p className="mx-auto mb-16 mt-8 max-w-3xl text-center text-lg leading-8 text-neutral-300">
          {t.intro}
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          {studioImages.map((src) => (
            <div
              key={src}
              className="overflow-hidden rounded-3xl border border-white/10"
            >
              <img
                src={src}
                alt="FRGLASS studio"
                className="h-[520px] w-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-4">
          {t.cards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-3 text-xl font-bold">{card.title}</h3>
              <p className="text-neutral-300">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl text-center">
          <p className="text-xl leading-9 text-neutral-300">
            {t.vision}
          </p>
        </div>
      </div>

      <div
        id="contact"
        className="mx-auto mt-24 max-w-4xl rounded-3xl border border-orange-300/30 bg-orange-300/10 p-10 text-center"
      >
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
          {t.contactEyebrow}
        </p>

        <h2 className="text-4xl font-black uppercase">
          {t.contactTitle}
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-neutral-300">
          {t.contactText}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(t.emailSubject)}`}
            className="rounded-full bg-orange-300 px-8 py-4 font-bold uppercase tracking-widest text-black transition hover:bg-white"
          >
            {t.sendRequest}
          </a>

          <a
            href={siteConfig.instagram}
            className="rounded-full border border-white/20 px-8 py-4 font-bold uppercase tracking-widest text-white transition hover:border-orange-300 hover:text-orange-300"
          >
            {t.instagram}
          </a>
        </div>
      </div>
    </section>
  );
}
