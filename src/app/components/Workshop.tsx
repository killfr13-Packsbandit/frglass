"use client";

import { translations, useLanguage } from "./LanguageProvider";

const workshopImages = [
  "/workshop/me1.png",
  "/workshop/me2.jpg",
];

export default function Workshop() {
  const { language } = useLanguage();
  const t = translations[language].workshop;

  return (
    <section className="relative overflow-hidden bg-black px-6 py-32 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,120,30,.15),transparent_60%)]" />

      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
            {t.eyebrow}
          </p>

          <h2 className="text-5xl font-black uppercase leading-tight">
            {t.title}
          </h2>

          <p className="mt-8 text-lg leading-8 text-neutral-300">
            {t.text}
          </p>
        </div>

        <div className="space-y-6">
          <video
            src="/workshop/hero.MOV"
            autoPlay
            muted
            loop
            playsInline
            className="rounded-3xl border border-white/10 shadow-2xl"
          />

          <div className="grid grid-cols-2 gap-6">
            {workshopImages.map((src) => (
              <img
                key={src}
                src={src}
                alt="FRGLASS workshop"
                className="rounded-2xl border border-white/10 object-cover"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
