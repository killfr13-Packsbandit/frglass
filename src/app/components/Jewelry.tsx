"use client";

import { translations, useLanguage } from "./LanguageProvider";

const jewelryImages = [
  "/jewelry/leaf1.jpg",
  "/jewelry/leaf2.jpg",
  "/jewelry/leaf3.jpg",
  "/jewelry/leaf4.jpg",
  "/jewelry/leaf5.jpg",
];

export default function JewelryShowcase() {
  const { language } = useLanguage();
  const t = translations[language].jewelry;

  return (
    <section id="collections" className="bg-black px-6 py-28 text-white">
      <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
        {t.eyebrow}
      </p>

      <h2 className="mb-6 text-center text-4xl font-black uppercase tracking-[0.2em]">
        {t.title}
      </h2>

      <p className="mx-auto mb-14 max-w-2xl text-center text-neutral-400">
        {t.intro}
      </p>

      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
        {jewelryImages.map((src, index) => (
          <div
            key={src}
            className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-orange-300/60 hover:shadow-[0_0_50px_rgba(255,170,80,0.25)] ${
              index === 0 || index === 3 ? "md:col-span-2" : ""
            }`}
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

            <img
              src={src}
              alt="FRGLASS Jewelry"
              className={`w-full object-cover transition duration-700 group-hover:scale-110 ${
                index === 0 || index === 3 ? "h-[620px]" : "h-[420px]"
              }`}
            />

            <div className="absolute bottom-0 left-0 z-20 p-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-orange-300">
                FRGLASS
              </p>

              <h3 className="text-2xl font-black uppercase tracking-[0.18em]">
                {t.itemTitle}
              </h3>

              <p className="mt-2 text-sm text-neutral-300">
                {t.itemSubtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
