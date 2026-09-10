"use client";

import { translations, useLanguage } from "./LanguageProvider";

export default function Hero() {
  const { language } = useLanguage();
  const t = translations[language].hero;

  return (
    <section className="bg-black pt-24 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-[1600px] lg:grid-cols-[0.85fr_1.15fr]">
        <div className="flex items-center px-6 py-16 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-xl">
            <img
              src="/logo.png"
              alt="FRGLASS"
              className="mb-10 h-auto w-full max-w-[390px] object-contain sm:max-w-[520px]"
            />

            <p className="text-xl font-semibold uppercase tracking-[0.2em] text-neutral-100 sm:text-2xl">
              {t.subtitle}
            </p>

            <p className="mt-7 max-w-lg text-base leading-8 text-neutral-400 sm:text-lg">
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
