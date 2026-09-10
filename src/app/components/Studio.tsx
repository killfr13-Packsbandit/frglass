"use client";

import Image from "next/image";
import Link from "next/link";
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
    <section className="bg-neutral-950 px-4 py-20 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">
          {t.eyebrow}
        </p>

        <h2 className="text-center text-4xl font-black uppercase sm:text-5xl">
          {t.title}
        </h2>

        <p className="mx-auto mb-12 mt-6 max-w-3xl text-center text-base leading-7 text-neutral-300 sm:mb-16 sm:mt-8 sm:text-lg sm:leading-8">
          {t.intro}
        </p>

        <div className="grid gap-4 sm:gap-8 md:grid-cols-2">
          {studioImages.map((src) => (
            <div
              key={src}
              className="relative h-[380px] overflow-hidden rounded-2xl border border-white/10 sm:h-[520px] sm:rounded-3xl"
            >
              <Image
                src={src}
                alt={language === "de" ? "Arbeit mit Borosilikatglas" : "Working with borosilicate glass"}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:mt-16 sm:gap-6 md:grid-cols-4">
          {t.cards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <h3 className="mb-3 text-lg font-bold sm:text-xl">{card.title}</h3>
              <p className="leading-7 text-neutral-300">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl text-center sm:mt-16">
          <p className="text-lg leading-8 text-neutral-300 sm:text-xl sm:leading-9">
            {t.vision}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-black/30 p-6 text-center sm:mt-12 sm:rounded-3xl sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-300">
            Behind the Scenes
          </p>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-neutral-400">
            {language === "de"
              ? "Aktuelle Bilder, Videos und kleine Updates direkt aus der Werkstatt."
              : "Recent photos, videos and small updates straight from the studio."}
          </p>
          <Link
            href="/journal/behind-the-scenes"
            className="mt-6 inline-block rounded-full border border-white/20 px-6 py-3 text-sm font-bold uppercase tracking-widest transition hover:border-orange-300 hover:text-orange-300"
          >
            {language === "de" ? "Hinter die Kulissen" : "Behind the Scenes"}
          </Link>
        </div>
      </div>

      <div
        id="contact"
        className="mx-auto mt-16 max-w-4xl rounded-2xl border border-orange-300/30 bg-orange-300/10 p-6 text-center sm:mt-24 sm:rounded-3xl sm:p-10"
      >
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">
          {t.contactEyebrow}
        </p>

        <h2 className="text-3xl font-black uppercase sm:text-4xl">
          {t.contactTitle}
        </h2>

        <p className="mx-auto mt-6 max-w-2xl leading-7 text-neutral-300">
          {t.contactText}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(t.emailSubject)}`}
            className="rounded-full bg-orange-300 px-6 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-white sm:px-8"
          >
            {t.sendRequest}
          </a>

          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/20 px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:border-orange-300 hover:text-orange-300 sm:px-8"
          >
            {t.instagram}
          </a>
        </div>
      </div>
    </section>
  );
}
