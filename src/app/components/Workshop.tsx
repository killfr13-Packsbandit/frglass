"use client";

import Image from "next/image";
import { translations, useLanguage } from "./LanguageProvider";

const workshopImages = [
  "/workshop/me1.png",
  "/workshop/me2.jpg",
];

export default function Workshop() {
  const { language } = useLanguage();
  const t = translations[language].workshop;

  return (
    <section className="relative overflow-hidden bg-black px-4 py-20 text-white sm:px-6 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,120,30,.15),transparent_60%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 sm:gap-16 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">
            {t.eyebrow}
          </p>

          <h2 className="text-4xl font-black uppercase leading-tight sm:text-5xl">
            {t.title}
          </h2>

          <p className="mt-6 text-base leading-7 text-neutral-300 sm:mt-8 sm:text-lg sm:leading-8">
            {t.text}
          </p>
        </div>

        <div className="min-w-0 space-y-4 sm:space-y-6">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/workshop/me2.jpg"
            className="aspect-video w-full rounded-2xl border border-white/10 object-cover shadow-2xl sm:rounded-3xl"
          >
            <source src="/workshop/hero.mp4" type="video/mp4" />
            <source src="/workshop/hero.mov" type="video/quicktime" />
          </video>

          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {workshopImages.map((src) => (
              <div
                key={src}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 sm:rounded-2xl"
              >
                <Image
                  src={src}
                  alt="FRGLASS workshop"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover object-[center_20%]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
