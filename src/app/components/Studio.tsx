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

function Media({ item, caption, eager = false }: { item: StudioMediaItem; caption: string; eager?: boolean }) {
  if (item.mediaType === "video") {
    return (
      <video
        src={item.mediaUrl}
        muted
        controls
        playsInline
        preload={eager ? "metadata" : "none"}
        className="h-full w-full"
        style={mediaStyle(item)}
      />
    );
  }

  return (
    <img
      src={item.mediaUrl}
      alt={caption}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className="h-full w-full"
      style={mediaStyle(item)}
    />
  );
}

function MediaFigure({ item, caption, className = "", showCaption = true }: { item: StudioMediaItem; caption: string; className?: string; showCaption?: boolean }) {
  return (
    <figure className={`overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 sm:rounded-3xl ${className}`}>
      <div className="overflow-hidden bg-black">
        <Media item={item} caption={caption} />
      </div>
      {showCaption && caption && <figcaption className="border-t border-white/10 px-5 py-4 text-sm leading-6 text-neutral-400">{caption}</figcaption>}
    </figure>
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

  const materialEyebrow = get(`studio.material.eyebrow.${lang}`, language === "de" ? "Das Material" : "The material");
  const materialTitle = get(`studio.material.title.${lang}`, language === "de" ? "Warum Borosilikatglas?" : "Why borosilicate glass?");
  const materialText1 = get(
    `studio.material.text1.${lang}`,
    language === "de"
      ? "Borosilikatglas ist hitzebeständig, klar und präzise zu verarbeiten. Genau diese Eigenschaften machen es für mich so spannend: Es lässt sich am Brenner sehr kontrolliert formen und gleichzeitig bleibt genug Raum für spontane Entscheidungen."
      : "Borosilicate glass is heat resistant, clear and precise to work with. That is exactly what makes it interesting to me: it can be shaped very deliberately at the torch while still leaving room for spontaneous decisions.",
  );
  const materialText2 = get(
    `studio.material.text2.${lang}`,
    language === "de"
      ? "Aus Stäben und Röhren entstehen Schicht für Schicht Formen, Farben und Tiefen. Manche Details werden außen aufgebaut, andere sitzen später vollständig im Glas."
      : "Rods and tubes become shapes, colors and depth layer by layer. Some details are built on the surface, while others end up completely enclosed inside the glass.",
  );

  const processEyebrow = get(`studio.process.eyebrow.${lang}`, language === "de" ? "Am Brenner" : "At the torch");
  const processTitle = get(`studio.process.title.${lang}`, language === "de" ? "Wie aus Glas ein Einzelstück wird" : "How glass becomes a one-off piece");
  const processText1 = get(
    `studio.process.text1.${lang}`,
    language === "de"
      ? "Beim Lampworking wird das Glas direkt in der Flamme erhitzt, ständig bewegt und in kleinen Schritten geformt. Temperatur, Bewegung und Timing bestimmen dabei, wie sich das Material verhält."
      : "In lampworking, the glass is heated directly in the flame, kept in constant motion and shaped step by step. Temperature, movement and timing determine how the material behaves.",
  );
  const processText2 = get(
    `studio.process.text2.${lang}`,
    language === "de"
      ? "Ich arbeite gerne mit organischen Formen, transparenten Tiefen, Farbe und Einbettungen. Nicht jedes Stück ist von Anfang bis Ende durchgeplant – oft entwickelt sich die beste Idee erst während der Arbeit."
      : "I enjoy working with organic shapes, transparent depth, color and inclusions. Not every piece is planned from beginning to end — often the best idea develops while I am working.",
  );

  const galleryEyebrow = get(`studio.gallery.eyebrow.${lang}`, language === "de" ? "Einblicke" : "Inside the studio");
  const galleryTitle = get(`studio.gallery.title.${lang}`, language === "de" ? "Aus der Werkstatt" : "From the studio");

  const plansEyebrow = get(`studio.plans.eyebrow.${lang}`, language === "de" ? "Werkstattzeit & Workshops" : "Studio time & workshops");
  const plansTitle = get(`studio.plans.title.${lang}`, language === "de" ? "Die Werkstatt soll sich weiter öffnen" : "The studio is meant to open up further");
  const plansIntro = get(
    `studio.plans.intro.${lang}`,
    language === "de"
      ? "Im Moment ist die Werkstatt vor allem mein eigener Arbeitsplatz. Schritt für Schritt möchte ich daraus auch einen Ort machen, an dem andere Glas erleben, lernen oder mit eigener Erfahrung am Brenner arbeiten können."
      : "Right now the studio is mainly my own workspace. Step by step, I would like it to also become a place where others can experience glass, learn, or work at the torch with their own experience.",
  );

  const heroMedia = media[0];
  const materialMedia = media[1];
  const processMedia = media[2];
  const galleryMedia = media.slice(3);

  const captionFor = (item?: StudioMediaItem, fallback = "") => {
    if (!item) return fallback;
    return language === "de" ? item.description || item.descriptionEn || fallback : item.descriptionEn || item.description || fallback;
  };

  return (
    <section className="overflow-hidden bg-[#080808] text-white">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 sm:pb-14 sm:pt-24">
        <p className="text-xs font-bold uppercase tracking-[0.42em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">{eyebrow}</p>
        <h2 className="mt-5 max-w-4xl text-4xl font-black uppercase leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl">{title}</h2>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-neutral-300 sm:text-xl sm:leading-9">{intro}</p>
      </div>

      <div className="mx-auto max-w-[1500px] px-3 sm:px-5">
        {heroMedia ? (
          <figure className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-neutral-950 sm:rounded-[2.25rem]">
            <div className="h-[52svh] min-h-[380px] sm:h-[66vh] sm:min-h-[520px]">
              <Media item={heroMedia} caption={captionFor(heroMedia, language === "de" ? "FRGLASS Glaswerkstatt in Kärnten" : "FRGLASS glass studio in Carinthia")} eager />
            </div>
            {captionFor(heroMedia) && <figcaption className="border-t border-white/10 px-5 py-4 text-sm leading-6 text-neutral-400 sm:px-7">{captionFor(heroMedia)}</figcaption>}
          </figure>
        ) : (
          <div className="h-[46svh] min-h-[340px] rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_70%_25%,rgba(251,146,60,.17),transparent_32%),linear-gradient(145deg,#171717,#050505_65%)] sm:rounded-[2.25rem]" />
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.42em] text-orange-300 sm:text-sm">{materialEyebrow}</p>
            <h3 className="mt-4 text-3xl font-black uppercase leading-tight sm:text-5xl">{materialTitle}</h3>
            <p className="mt-6 text-base leading-8 text-neutral-300 sm:text-lg">{materialText1}</p>
            <p className="mt-5 text-base leading-8 text-neutral-400 sm:text-lg">{materialText2}</p>
          </div>
          {materialMedia && (
            <MediaFigure
              item={materialMedia}
              caption={captionFor(materialMedia, language === "de" ? "Borosilikatglas in der Werkstatt" : "Borosilicate glass in the studio")}
              className="lg:ml-auto"
              showCaption={false}
            />
          )}
        </div>

        <div className="my-20 h-px bg-white/10 sm:my-28" />

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          {processMedia && (
            <MediaFigure
              item={processMedia}
              caption={captionFor(processMedia, language === "de" ? "Arbeiten am Glasbrenner" : "Working at the glass torch")}
              className="lg:order-1"
            />
          )}
          <div className="max-w-xl lg:order-2 lg:ml-auto">
            <p className="text-xs font-bold uppercase tracking-[0.42em] text-orange-300 sm:text-sm">{processEyebrow}</p>
            <h3 className="mt-4 text-3xl font-black uppercase leading-tight sm:text-5xl">{processTitle}</h3>
            <p className="mt-6 text-base leading-8 text-neutral-300 sm:text-lg">{processText1}</p>
            <p className="mt-5 text-base leading-8 text-neutral-400 sm:text-lg">{processText2}</p>
          </div>
        </div>

        {mediaLoading && !loadedMedia && (
          <p role="status" className="min-h-60 py-16 text-center text-neutral-400">{language === "de" ? "Bilder werden geladen …" : "Loading images …"}</p>
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
          <div className="mt-20 sm:mt-28">
            <p className="text-xs font-bold uppercase tracking-[0.42em] text-orange-300 sm:text-sm">{galleryEyebrow}</p>
            <h3 className="mt-4 text-3xl font-black uppercase leading-tight sm:text-5xl">{galleryTitle}</h3>
            <div className="mt-10 grid gap-5 md:grid-cols-2 sm:mt-14 sm:gap-6">
              {galleryMedia.map((item) => (
                <MediaFigure
                  key={item.id}
                  item={item}
                  caption={captionFor(item, language === "de" ? "Einblick in die FRGLASS Werkstatt" : "Inside the FRGLASS studio")}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-20 sm:mt-28">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.42em] text-orange-300 sm:text-sm">{plansEyebrow}</p>
            <h3 className="mt-4 text-3xl font-black uppercase leading-tight sm:text-5xl">{plansTitle}</h3>
            <p className="mt-6 text-base leading-8 text-neutral-300 sm:text-lg">{plansIntro}</p>
          </div>

          <div className="mt-10 divide-y divide-white/10 border-y border-white/10 sm:mt-14 sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {cards.map((card, index) => (
              <div key={`${card.title}-${index}`} className="px-1 py-8 sm:px-8 sm:py-10 lg:px-10">
                <h4 className="text-xl font-bold sm:text-2xl">{card.title}</h4>
                <p className="mt-4 max-w-xl leading-7 text-neutral-400">{card.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-4xl border-l-2 border-orange-300/70 pl-6 sm:mt-28 sm:pl-10">
          <p className="text-xl leading-9 text-white/85 sm:text-2xl sm:leading-10">{vision}</p>
        </div>
      </div>

      <div className="px-4 pb-16 sm:px-6 sm:pb-24">
        <div id="contact" className="mx-auto max-w-6xl border-t border-white/10 py-14 text-left sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">{contactEyebrow}</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-black uppercase leading-tight sm:text-5xl">{contactTitle}</h2>
          <p className="mt-6 max-w-2xl leading-7 text-neutral-300 sm:text-lg sm:leading-8">{contactText}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(t.emailSubject)}`} className="rounded-full bg-orange-300 px-7 py-4 text-center text-sm font-black uppercase tracking-widest text-black transition hover:bg-white">{contactButton}</a>
            <a href={siteConfig.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-7 py-4 text-center text-sm font-black uppercase tracking-widest text-white transition hover:border-orange-300 hover:text-orange-300">{t.instagram}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
