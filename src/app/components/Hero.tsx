"use client";

import { translations, useLanguage } from "./LanguageProvider";

export default function Hero() {
  const { language } = useLanguage();
  const t = translations[language].hero;

  return (
    <section className="bg-black pt-24 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-[1600px] lg:grid-cols-[0.85fr_1.15fr]">
        <div className="flex items-center px-6 py-20 sm:px-10 lg:px-16 xl:px-24">
          <div className="max-w-xl">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.42em] text-orange-300 sm:text-sm">
              {t.eyebrow}
            </p>

            <h1 className="text-5xl font-semibold uppercase leading-none tracking-[0.2em] sm:text-6xl md:text-7xl">
              FRGLASS
            </h1>

            <p className="mt-6 text-lg font-medium uppercase tracking-[0.2em] text-neutral-200 sm:text-xl">
              {t.subtitle}
            </p>

            <p className="mt-8 max-w-lg text-base leading-8 text-neutral-400 sm:text-lg">
              {t.text}
            </p>

            <a
              href="#collections"
              className="mt-10 inline-flex items-center rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition hover:border-orange-300 hover:text-orange-300"
            >
              {t.cta}
            </a>
          </div>
        </div>

        <div className="relative min-h-[52vh] overflow-hidden lg:min-h-full">
          <video
            src="/hero/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/10 lg:from-black/20" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent lg:hidden" />
        </div>
      </div>
    </section>
  );
}
