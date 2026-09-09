"use client";

import { useState } from "react";
import { useLanguage } from "../components/LanguageProvider";

const galleryImages = [
  "/jewelry/leaf1.jpg",
  "/jewelry/leaf2.jpg",
  "/jewelry/leaf3.jpg",
  "/jewelry/leaf4.jpg",
  "/jewelry/leaf5.jpg",
  "/jewelry/faceted1.jpg",
  "/jewelry/implo.jpg",
  "/jewelry/faceted3.jpg",
];

const copy = {
  en: {
    eyebrow: "Gallery",
    title: "Selected work",
    intro: "A selection of jewelry, objects and experiments made in the workshop.",
    imageAlt: "FRGLASS glass piece",
    enlargedAlt: "FRGLASS glass piece enlarged",
    close: "Close image",
  },
  de: {
    eyebrow: "Galerie",
    title: "Ausgewählte Arbeiten",
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
        <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
          {t.eyebrow}
        </p>

        <h1 className="text-center text-6xl font-black uppercase">
          {t.title}
        </h1>

        <p className="mx-auto mb-16 mt-6 max-w-2xl text-center text-neutral-300">
          {t.intro}
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {galleryImages.map((src) => (
            <button
              key={src}
              onClick={() => setActiveImage(src)}
              className="group flex h-[460px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 p-3 text-left"
            >
              <img
                src={src}
                alt={t.imageAlt}
                className="h-full w-full object-contain transition duration-700 group-hover:scale-[1.03]"
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
          <img
            src={activeImage}
            alt={t.enlargedAlt}
            className="max-h-[90vh] max-w-[90vw] rounded-3xl object-contain"
          />

          <button
            onClick={() => setActiveImage(null)}
            className="absolute right-8 top-8 text-4xl text-white"
            aria-label={t.close}
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}
