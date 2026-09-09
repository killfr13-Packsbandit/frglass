"use client";

import { translations, useLanguage } from "./LanguageProvider";

export default function Hero() {
  const { language } = useLanguage();
  const t = translations[language].hero;

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24">
      <video
        src="/hero/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 text-center">
        <img
          src="/logo.png"
          alt="FRGLASS logo"
          className="mx-auto mb-8 h-20 w-auto"
        />

        <p className="mb-6 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
          {t.eyebrow}
        </p>

        <h1 className="text-center text-5xl font-black uppercase tracking-[0.18em] sm:text-7xl sm:tracking-[0.28em] md:text-8xl">
          FRGLASS
        </h1>

        <p className="mt-4 text-center text-lg font-bold uppercase tracking-[0.22em] text-neutral-100 sm:text-2xl sm:tracking-[0.3em]">
          {t.subtitle}
        </p>

        <p className="mx-auto mt-6 max-w-xs text-center text-base text-neutral-200 sm:max-w-xl sm:text-lg">
          {t.text}
        </p>

        <a
          href="#collections"
          className="mt-10 inline-block border border-white bg-white/10 px-8 py-3 text-sm font-bold uppercase tracking-[0.22em] backdrop-blur transition hover:bg-white hover:text-black"
        >
          {t.cta}
        </a>
      </div>
    </section>
  );
}
