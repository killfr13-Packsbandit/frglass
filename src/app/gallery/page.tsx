"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../components/LanguageProvider";
import { useSiteContent } from "../components/SiteContentProvider";
import {
  DEFAULT_GALLERY_MEDIA,
  type GalleryMediaItem,
} from "../galleryMediaTypes";

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

function mediaStyle(item: GalleryMediaItem) {
  const zoom = item.zoom ?? 1;
  const focusX = item.focusX ?? 50;
  const focusY = item.focusY ?? 50;
  return {
    objectFit: zoom < 1 ? "contain" : (item.fit ?? "cover"),
    objectPosition: `${focusX}% ${focusY}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${focusX}% ${focusY}%`,
  } as const;
}

export default function Page() {
  const [activeMedia, setActiveMedia] = useState<GalleryMediaItem | null>(null);
  const [galleryMedia, setGalleryMedia] = useState<GalleryMediaItem[]>(DEFAULT_GALLERY_MEDIA);
  const { language } = useLanguage();
  const { get } = useSiteContent();
  const t = copy[language];
  const lang = language === "de" ? "de" : "en";

  useEffect(() => {
    fetch("/api/gallery-media", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { items?: GalleryMediaItem[] } | null) => {
        if (Array.isArray(data?.items)) setGalleryMedia(data.items);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-black px-4 py-20 text-white sm:px-6 sm:py-28 lg:py-32">
      <section className="mx-auto max-w-7xl">
        <h1 className="sr-only">{get(`gallery.eyebrow.${lang}`, t.eyebrow)}</h1>
        <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:mb-6 sm:text-sm sm:tracking-[0.5em]">{get(`gallery.eyebrow.${lang}`, t.eyebrow)}</p>
        <p className="mx-auto mb-10 max-w-2xl text-center text-base leading-7 text-neutral-300 sm:mb-14 sm:text-lg sm:leading-8 lg:mb-16">{get(`gallery.intro.${lang}`, t.intro)}</p>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {galleryMedia.map((item) => {
            const caption = language === "de" ? item.description || item.descriptionEn : item.descriptionEn || item.description;
            return (
              <button key={item.id} type="button" onClick={() => setActiveMedia(item)} className="group overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 text-left sm:rounded-3xl">
                <div className="relative flex h-[330px] items-center justify-center overflow-hidden p-2 sm:h-[400px] sm:p-3 lg:h-[430px] xl:h-[460px]">
                  {item.mediaType === "video" ? (
                    <>
                      <video src={item.mediaUrl} autoPlay muted loop playsInline preload="auto" className="h-full w-full" style={mediaStyle(item)} />
                      <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">Video</span>
                    </>
                  ) : (
                    <img src={item.mediaUrl} alt={caption || t.imageAlt} loading="lazy" className="h-full w-full transition duration-700" style={mediaStyle(item)} />
                  )}
                </div>
                {caption && <p className="border-t border-white/10 px-5 py-4 text-sm leading-6 text-neutral-400">{caption}</p>}
              </button>
            );
          })}
        </div>
      </section>

      {activeMedia && (
        <div onClick={() => setActiveMedia(null)} className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/90 p-3 sm:p-6">
          <div className="relative flex max-h-[82vh] w-[94vw] flex-1 items-center justify-center sm:w-[90vw]" onClick={(event) => event.stopPropagation()}>
            {activeMedia.mediaType === "video" ? (
              <video src={activeMedia.mediaUrl} autoPlay muted loop controls playsInline preload="auto" className="max-h-full max-w-full" />
            ) : (
              <img src={activeMedia.mediaUrl} alt={(language === "de" ? activeMedia.description || activeMedia.descriptionEn : activeMedia.descriptionEn || activeMedia.description) || t.imageAlt} className="max-h-full max-w-full object-contain" />
            )}
          </div>

          {(language === "de" ? activeMedia.description || activeMedia.descriptionEn : activeMedia.descriptionEn || activeMedia.description) && (
            <p className="mt-4 max-w-2xl text-center text-sm leading-6 text-neutral-300 sm:text-base" onClick={(event) => event.stopPropagation()}>
              {language === "de" ? activeMedia.description || activeMedia.descriptionEn : activeMedia.descriptionEn || activeMedia.description}
            </p>
          )}

          <button type="button" onClick={() => setActiveMedia(null)} className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-3xl text-white sm:right-8 sm:top-8 sm:h-auto sm:w-auto sm:bg-transparent sm:text-4xl" aria-label={t.close}>×</button>
        </div>
      )}
    </main>
  );
}
