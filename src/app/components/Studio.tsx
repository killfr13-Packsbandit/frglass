"use client";

import { siteConfig } from "../siteConfig";
import { type StudioMediaItem } from "../studioMediaTypes";
import { translations, useLanguage } from "./LanguageProvider";
import { useSiteContent } from "./SiteContentProvider";
import { publicData, arrayField } from "./publicData";
import { usePublicData } from "./usePublicData";

const mediaResource = publicData("/api/studio-media", (value) => arrayField<StudioMediaItem>(value, "items"));
const emptyMedia: StudioMediaItem[] = [];

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

function Media({ item, caption, hero = false }: { item: StudioMediaItem; caption: string; hero?: boolean }) {
  const common = hero
    ? "absolute inset-0 h-full w-full"
    : "h-full w-full transition duration-700 group-hover:scale-[1.02]";

  if (item.mediaType === "video") {
    return (
      <video
        src={item.mediaUrl}
        muted
        controls={!hero}
        autoPlay={hero}
        loop={hero}
        playsInline
        preload={hero ? "metadata" : "none"}
        className={common}
        style={mediaStyle(item)}
      />
    );
  }

  return (
    <img
      src={item.mediaUrl}
      alt={caption}
      loading={hero ? "eager" : "lazy"}
      decoding="async"
      className={common}
      style={mediaStyle(item)}
    />
  );
}

export default function Studio() {
  const { language } = useLanguage();
  const { get } = useSiteContent();
  const t = translations[language].studio;
  const lang = language === "de" ? "de" : "en";
  const { data: loadedMedia, loading: mediaLoading, error: mediaError, refresh: refreshMedia } = usePublicData(mediaResource);
  const media = loadedMedia ?? emptyMedia;

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

  const heroMedia = media[0];
  const galleryMedia = heroMedia ? media.slice(1) : media;
  const heroCaption = language === "de"
    ? heroMedia?.description || heroMedia?.descriptionEn || "FRGLASS Glaswerkstatt in Kärnten"
    : heroMedia?.descriptionEn || heroMedia?.description || "FRGLASS glass studio in Carinthia";

  const galleryClass = (index: number) => {
    if (index === 0) return "md:col-span-2 md:aspect-[16/8]";
    if (index % 5 === 1) return "md:row-span-2 md:min-h-[680px]";
    return "aspect-[4/3]";
  };

  return (
    <section className="overflow-hidden bg-[#080808] text-white">
      <div className="relative mx-auto max-w-[1500px] px-3 pt-3 sm:px-5 sm:pt-5">
        <div className="relative min-h-[70svh] overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-900 sm:min-h-[76vh] sm:rounded-[2.5rem]">
          {heroMedia ? (
            <Media item={heroMedia} caption={heroCaption} hero />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(251,146,60,.2),transparent_32%),linear-gradient(145deg,#171717,#050505_65%)]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(251,146,60,.16),transparent_32%)]" />

          <div className="relative flex min-h-[70svh] flex-col justify-between p-6 sm:min-h-[76vh] sm:p-10 lg:p-14">
            <div className="flex items-start justify-between gap-4">
              <p className="rounded-full border border-white/15 bg-black/25 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-orange-200 backdrop-blur-md sm:text-xs">
                {eyebrow}
              </p>
              <p className="hidden rounded-full border border-white/15 bg-black/25 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70 backdrop-blur-md sm:block">
                {language === "de" ? "Borosilikatglas · Kärnten" : "Borosilicate glass · Carinthia"}
              </p>
            </div>

            <div className="max-w-4xl pb-2 sm:pb-4">
              <h2 className="max-w-3xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.045em] sm:text-7xl lg:text-8xl">
                {title}
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8 lg:text-xl">
                {intro}
              </p>
              <div className="mt-7 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/75 sm:text-xs">
                {[language === "de" ? "Lampworking" : "Lampworking", language === "de" ? "Handarbeit" : "Handmade", language === "de" ? "Seit 2019" : "Since 2019"].map((label) => (
                  <span key={label} className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 backdrop-blur-sm">{label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.42em] text-orange-300 sm:text-sm">
              {language === "de" ? "Einblicke" : "Inside the studio"}
            </p>
            <h3 className="mt-4 text-3xl font-black uppercase leading-tight sm:text-5xl">
              {language === "de" ? "Feuer, Glas & Werkzeug" : "Fire, glass & tools"}
            </h3>
          </div>
          <p className="max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg sm:leading-8 lg:justify-self-end">
            {language === "de"
              ? "Ein paar Eindrücke direkt aus der Werkstatt – vom Arbeitsplatz über den Brenner bis zu den Details, die beim Arbeiten entstehen."
              : "A few impressions straight from the studio – from the workspace and torch to the small details that appear while working."}
          </p>
        </div>

        {mediaLoading && !loadedMedia && (
          <p role="status" className="min-h-80 py-16 text-center text-neutral-400">
            {language === "de" ? "Bilder werden geladen …" : "Loading images …"}
          </p>
        )}

        {mediaError && (
          <p role="alert" className="py-10 text-center text-neutral-400">
            {language === "de" ? "Bilder konnten nicht geladen werden." : "Images could not be loaded."}{" "}
            <button type="button" onClick={() => void refreshMedia()} className="underline decoration-orange-300 underline-offset-4">
              {language === "de" ? "Erneut versuchen" : "Retry"}
            </button>
          </p>
        )}

        {galleryMedia.length > 0 && (
          <div className="mt-10 grid auto-rows-fr gap-4 md:grid-cols-2 sm:mt-14 sm:gap-6">
            {galleryMedia.map((item, index) => {
              const caption = language === "de" ? item.description || item.descriptionEn : item.descriptionEn || item.description;
              return (
                <figure
                  key={item.id}
                  className={`group relative min-h-[300px] overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 sm:rounded-[1.75rem] ${galleryClass(index)}`}
                >
                  <Media
                    item={item}
                    caption={caption || (language === "de" ? "FRGLASS Studio und Arbeit mit Borosilikatglas" : "FRGLASS studio and borosilicate glasswork")}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-70" />
                  {caption && (
                    <figcaption className="absolute inset-x-0 bottom-0 p-5 text-sm leading-6 text-white/80 sm:p-6">
                      {caption}
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        )}

        <div className="mt-20 sm:mt-28">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.42em] text-orange-300 sm:text-sm">
              {language === "de" ? "Was geplant ist" : "What’s planned"}
            </p>
            <h3 className="mt-4 text-3xl font-black uppercase leading-tight sm:text-5xl">
              {language === "de" ? "Mehr als nur ein Arbeitsplatz" : "More than a workspace"}
            </h3>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {cards.map((card, index) => (
              <div
                key={`${card.title}-${index}`}
                className="group relative min-h-[250px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-300/35 hover:bg-white/[0.055] sm:rounded-3xl"
              >
                <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-orange-300/5 blur-2xl transition group-hover:bg-orange-300/10" />
                <p className="text-xs font-black tracking-[0.3em] text-orange-300/80">0{index + 1}</p>
                <h4 className="mt-10 text-xl font-bold sm:text-2xl">{card.title}</h4>
                <p className="mt-4 leading-7 text-neutral-400">{card.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.025] px-6 py-12 text-center sm:mt-28 sm:rounded-[2.5rem] sm:px-12 sm:py-16">
          <div className="absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-orange-300/10 blur-3xl" />
          <p className="relative text-xl leading-9 text-white/85 sm:text-2xl sm:leading-10">{vision}</p>
        </div>
      </div>

      <div className="px-4 pb-16 sm:px-6 sm:pb-24">
        <div id="contact" className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-orange-300/20 bg-[#111] p-7 text-center sm:rounded-[2.75rem] sm:p-12 lg:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,.14),transparent_48%)]" />
          <div className="relative">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">{contactEyebrow}</p>
            <h2 className="text-3xl font-black uppercase sm:text-5xl">{contactTitle}</h2>
            <p className="mx-auto mt-6 max-w-2xl leading-7 text-neutral-300 sm:text-lg sm:leading-8">{contactText}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(t.emailSubject)}`}
                className="rounded-full bg-orange-300 px-7 py-4 text-sm font-black uppercase tracking-widest text-black transition hover:bg-white"
              >
                {contactButton}
              </a>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/20 bg-white/[0.03] px-7 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:border-orange-300 hover:text-orange-300"
              >
                {t.instagram}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
