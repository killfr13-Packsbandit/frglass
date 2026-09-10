"use client";

import Image from "next/image";
import { translations, useLanguage } from "./LanguageProvider";

export default function Hero() {
  const { language } = useLanguage();
  const t = translations[language].hero;

  const tags =
    language === "de"
      ? ["Lampworking", "Schmuck", "Objekte"]
      : ["Lampworking", "Jewelry", "Objects"];

  return (
    <section className="bg-black pt-24 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-[1600px] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative flex items-center overflow-hidden border-b border-white/10 px-6 py-16 sm:px-10 lg:border-b-0 lg:border-r lg:px-16 xl:px-24">
          <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-400/10 blur-[110px]" />
          <div className="pointer-events-none absolute bottom-16 right-0 h-48 w-48 rounded-full bg-fuchsia-500/5 blur-[100px]" />

          <div className="relative z-10 w-full max-w-xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-orange-300/25 bg-orange-300/[0.06] px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-300 shadow-[0_0_18px_rgba(253,186,116,0.9)]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-200 sm:text-xs">
                {t.eyebrow}
              </p>
            </div>

            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.025] p-6 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-8">
              <div className="flex items-center gap-6 sm:gap-8">
                <div className="flex h-32 w-24 shrink-0 items-center justify-center sm:h-40 sm:w-28">
                  <Image
                    src="/favicon.png"
                    alt="FRGLASS Logo"
                    width={128}
                    height={160}
                    sizes="112px"
                    className="max-h-full max-w-full object-contain drop-shadow-[0_0_22px_rgba(253,186,116,0.12)]"
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="text-3xl font-semibold uppercase tracking-[0.16em] text-white sm:text-4xl">
                    FRGLASS
                  </h1>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400 sm:text-base">
                    {t.subtitle}
                  </p>
                </div>
              </div>

              <div className="my-7 h-px bg-gradient-to-r from-orange-300/60 via-white/15 to-transparent" />

              <p className="max-w-lg text-base leading-8 text-neutral-300 sm:text-lg">
                {t.text}
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href="#collections"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-orange-300 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-black transition hover:bg-orange-200"
              >
                {t.cta}
                <span aria-hidden="true">↘</span>
              </a>
            </div>
          </div>
        </div>

        <div className="relative min-h-[52vh] overflow-hidden lg:min-h-full">
          <video
            src="/hero/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/10" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent lg:hidden" />
        </div>
      </div>
    </section>
  );
}
