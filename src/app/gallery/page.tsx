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
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <section className="mx-auto max-w-7xl">
        <h1 className="sr-only">{t.eyebrow}</h1>

        <p className="mb-6 text-center text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
          {t.eyebrow}
        </p>

        <p className="mx-auto mb-16 max-w-2xl text-center text-lg leading-8 text-neutral-300">
          {t.intro}
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {galleryImages.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveImage(src)}
              className="group relative flex h-[460px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 p-3 text-left"
            >
              <Image
                src={src}
                alt={t.imageAlt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-contain p-3 transition duration-700 group-hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>
      </section>

      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-6"
        >
          <div className="relative h-[90vh] w-[90vw]">
            <Image
              src={activeImage}
              alt={t.enlargedAlt}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>

          <button
            type="button"
            onClick={() => setActiveImage(null)}
            className="absolute right-8 top-8 z-10 text-4xl text-white"
            aria-label={t.close}
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}
