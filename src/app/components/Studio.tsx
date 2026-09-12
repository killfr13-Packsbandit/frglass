"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "../siteConfig";
import {
  DEFAULT_STUDIO_MEDIA,
  type StudioMediaItem,
} from "../studioMediaTypes";
import { translations, useLanguage } from "./LanguageProvider";
import { useSiteContent } from "./SiteContentProvider";

function mediaStyle(item: StudioMediaItem) {
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

export default function Studio() {
  const { language } = useLanguage();
  const { get } = useSiteContent();
  const t = translations[language].studio;
  const lang = language === "de" ? "de" : "en";
  const [media, setMedia] = useState<StudioMediaItem[]>(DEFAULT_STUDIO_MEDIA);

  useEffect(() => {
    fetch("/api/studio-media", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { items?: StudioMediaItem[] } | null) => {
        if (Array.isArray(data?.items)) setMedia(data.items);
      })
      .catch(() => {});
  }, []);

  const eyebrow = get(`studio.eyebrow.${lang}`, t.eyebrow);
  const title = get(`studio.title.${lang}`, t.title);
  const intro = get(`studio.intro.${lang}`, t.intro);
  const cards = t.cards.map((card, index) => ({
    title: get(`studio.card${index + 1}.title.${lang}`, card.title),
    text: get(`studio.card${index + 1}.text.${lang}`, card.text),
  }));
  const vision = get(`studio.vision.${lang}`, t.vision);
  const contactEyebrow = get(`studio.contact.eyebrow.${lang}`, t.contactEyebrow);
  const contactTitle = get(`studio.contact.title.${lang}`, t.contactTitle);
  const contactText = get(`studio.contact.text.${lang}`, t.contactText);
  const contactButton = get(`studio.contact.button.${lang}`, t.sendRequest);

  return (
    <section className="bg-neutral-950 px-4 py-20 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">{eyebrow}</p>
        <h2 className="text-center text-4xl font-black uppercase sm:text-5xl">{title}</h2>
        <p className="mx-auto mb-12 mt-6 max-w-3xl text-center text-base leading-7 text-neutral-300 sm:mb-16 sm:mt-8 sm:text-lg sm:leading-8">{intro}</p>

        {media.length > 0 && (
          <div className="grid gap-4 sm:gap-8 md:grid-cols-2">
            {media.map((item) => {
              const caption = language === "de" ? item.description || item.descriptionEn : item.descriptionEn || item.description;
              return (
                <figure key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 sm:rounded-3xl">
                  <div className="h-[380px] overflow-hidden bg-black sm:h-[520px]">
                    {item.mediaType === "video" ? (
                      <video
                        src={item.mediaUrl}
                        muted
                        controls
                        playsInline
                        preload="none"
                        className="h-full w-full"
                        style={mediaStyle(item)}
                      />
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={caption || (language === "de" ? "FRGLASS Studio und Arbeit mit Borosilikatglas" : "FRGLASS studio and borosilicate glasswork")}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full"
                        style={mediaStyle(item)}
                      />
                    )}
                  </div>
                  {caption && <figcaption className="border-t border-white/10 px-5 py-4 text-sm leading-6 text-neutral-400 sm:px-6">{caption}</figcaption>}
                </figure>
              );
            })}
          </div>
        )}

        <div className="mt-12 grid gap-4 sm:mt-16 sm:gap-6 md:grid-cols-4">
          {cards.map((card, index) => <div key={`${card.title}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"><h3 className="mb-3 text-lg font-bold sm:text-xl">{card.title}</h3><p className="leading-7 text-neutral-300">{card.text}</p></div>)}
        </div>

        <div className="mx-auto mt-12 max-w-3xl text-center sm:mt-16"><p className="text-lg leading-8 text-neutral-300 sm:text-xl sm:leading-9">{vision}</p></div>
      </div>

      <div id="contact" className="mx-auto mt-16 max-w-4xl rounded-2xl border border-orange-300/30 bg-orange-300/10 p-6 text-center sm:mt-24 sm:rounded-3xl sm:p-10">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">{contactEyebrow}</p>
        <h2 className="text-3xl font-black uppercase sm:text-4xl">{contactTitle}</h2>
        <p className="mx-auto mt-6 max-w-2xl leading-7 text-neutral-300">{contactText}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <a href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(t.emailSubject)}`} className="rounded-full bg-orange-300 px-6 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-white sm:px-8">{contactButton}</a>
          <a href={siteConfig.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:border-orange-300 hover:text-orange-300 sm:px-8">{t.instagram}</a>
        </div>
      </div>
    </section>
  );
}
