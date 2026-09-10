"use client";

import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "../components/LanguageProvider";

const galleryImages = [
  "/jewelry/Cobald5 x Opaldust Leaf.jpg",
  "/jewelry/leaf2.jpg",
  "/jewelry/AmberPurple Leaf STube (2).JPG",
  "/jewelry/leaf4.jpg",
  "/jewelry/leaf5.jpg",
  "/jewelry/implo.jpg",
  "/jewelry/Barkylett.JPG",
  "/jewelry/Customer.JPG",
  "/jewelry/IMG_2173 4.JPG",
  "/jewelry/Mini Heart.JPG",
];

const copy = {
  en: {
    eyebrow: "Gallery",
    intro: "A selection of jewelry, objects and experiments made in the workshop.",
    imageAlt: "FRGLASS glass piece",
    enlargedAlt: "FRGLASS glass piece enlarged",
    close: "Close image",
  },
  de: {
    eyebrow: "Galerie",
    intro: "Eine Auswahl an Schmuck, Objekten und Experimenten aus der Werkstatt.",
    imageAlt: "FRGLASS Glasstück",
    enlargedAlt: "FRGLASS Glasstück vergrößert",
    close: "Bild schließen",
  },
} as const;

export default function Page() {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-32">
      <section className="mx-auto max-w-7xl">
        <h1 className="sr-only">{t.eyebrow}</h1>

        <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:mb-6 sm:text-sm sm:tracking-[0.5em]">
          {t.eyebrow}
        </p>

        <p className="mx-auto mb-10 max-w-2xl text-center text-base leading-7 text-neutral-300 sm:mb-16 sm:text-lg sm:leading-8">
          {t.intro}
        </p>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {galleryImages.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveImage(src)}
              className="group relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 p-2 text-left sm:h-[460px] sm:rounded-3xl sm:p-3"
            >
              <Image
                src={src}
                alt={t.imageAlt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-contain p-2 transition duration-700 group-hover:scale-[1.03] sm:p-3"
              />
            </button>
          ))}
        </div>
      </section>

      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-3 sm:p-6"
        >
          <div className="relative h-[86vh] w-[94vw] sm:h-[90vh] sm:w-[90vw]">
            <Image
              src={activeImage}
              alt={t.enlargedAlt}
              fill
              sizes="94vw"
              className="object-contain"
            />
          </div>

          <button
            type="button"
            onClick={() => setActiveImage(null)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-3xl text-white sm:right-8 sm:top-8 sm:h-auto sm:w-auto sm:bg-transparent sm:text-4xl"
            aria-label={t.close}
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}
