"use client";

import { useState } from "react";
import { useLanguage } from "../components/LanguageProvider";
import { useSiteContent } from "../components/SiteContentProvider";

const copy = {
  en: {
    eyebrow: "Gallery",
    intro: "A selection of jewelry, objects and experiments made in the workshop.",
    imageAlt: "FRGLASS glass piece",
    close: "Close image",
  },
  de: {
    eyebrow: "Galerie",
    intro: "Eine Auswahl an Schmuck, Objekten und Experimenten aus der Werkstatt.",
    imageAlt: "FRGLASS Glasstück",
    close: "Bild schließen",
  },
} as const;

type GalleryMedia = {
  url: string;
  type: string;
};

export default function Page() {
  const [activeMedia, setActiveMedia] = useState<GalleryMedia | null>(null);
  const { language } = useLanguage();
  const { get } = useSiteContent();
  const t = copy[language];
  const lang = language === "de" ? "de" : "en";

  const defaults = [
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

  const galleryMedia: GalleryMedia[] = defaults
    .map((fallback, index) => {
      const number = index + 1;
      return {
        url: get(`gallery.media${number}.url`, fallback),
        type: get(`gallery.media${number}.type`, "image"),
      };
    })
    .filter((item) => item.url);

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-32">
      <section className="mx-auto max-w-7xl">
        <h1 className="sr-only">{get(`gallery.eyebrow.${lang}`, t.eyebrow)}</h1>

        <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:mb-6 sm:text-sm sm:tracking-[0.5em]">
          {get(`gallery.eyebrow.${lang}`, t.eyebrow)}
        </p>

        <p className="mx-auto mb-10 max-w-2xl text-center text-base leading-7 text-neutral-300 sm:mb-16 sm:text-lg sm:leading-8">
          {get(`gallery.intro.${lang}`, t.intro)}
        </p>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {galleryMedia.map((item, index) => (
            <button
              key={`${item.url}-${index}`}
              type="button"
              onClick={() => setActiveMedia(item)}
              className="group relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 p-2 text-left sm:h-[460px] sm:rounded-3xl sm:p-3"
            >
              {item.type === "video" ? (
                <video
                  src={item.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-contain"
                />
              ) : (
                <img
                  src={item.url}
                  alt={t.imageAlt}
                  loading="lazy"
                  className="h-full w-full object-contain p-2 transition duration-700 group-hover:scale-[1.03] sm:p-3"
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {activeMedia && (
        <div
          onClick={() => setActiveMedia(null)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-3 sm:p-6"
        >
          <div
            className="relative flex h-[86vh] w-[94vw] items-center justify-center sm:h-[90vh] sm:w-[90vw]"
            onClick={(event) => event.stopPropagation()}
          >
            {activeMedia.type === "video" ? (
              <video
                src={activeMedia.url}
                controls
                autoPlay
                playsInline
                className="max-h-full max-w-full"
              />
            ) : (
              <img
                src={activeMedia.url}
                alt={t.imageAlt}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => setActiveMedia(null)}
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
