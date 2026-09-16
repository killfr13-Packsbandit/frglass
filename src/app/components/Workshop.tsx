"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { translations, useLanguage } from "./LanguageProvider";
import { useSiteContent } from "./SiteContentProvider";

function Media({ url, type, className, style }: { url: string; type: string; className: string; style?: CSSProperties }) {
  if (!url) return null;
  if (type === "video") return <video src={url} muted controls playsInline preload="none" className={className} style={style} />;
  return <img src={url} alt="FRGLASS workshop" loading="lazy" decoding="async" className={className} style={style} />;
}

function numeric(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function Workshop() {
  const { language } = useLanguage();
  const { get, loading } = useSiteContent();
  const t = translations[language].workshop;
  const lang = language === "de" ? "de" : "en";
  const eyebrow = get(`home.workshop.eyebrow.${lang}`, t.eyebrow);
  const title = get(`home.workshop.title.${lang}`, t.title);
  const text = get(`home.workshop.text.${lang}`, t.text);
  const text2 = get(
    `home.workshop.text2.${lang}`,
    language === "de"
      ? "Mich interessiert dabei nicht nur das fertige Stück, sondern auch der Weg dorthin: wie Farbe, Tiefe und Form direkt in der Flamme entstehen und sich während der Arbeit verändern."
      : "What interests me is not only the finished piece, but also the process: how color, depth and form emerge directly in the flame and keep changing while I work.",
  );
  const studioTitle = get(`home.studio.title.${lang}`, language === "de" ? "Der Arbeitsplatz" : "The workspace");
  const studioText = get(
    `home.studio.text.${lang}`,
    language === "de"
      ? "Ein kleiner Einblick in meinen Arbeitsplatz, die Ausstattung und meine Pläne für spätere Werkstattzeit und kleine Sessions."
      : "A quick look at my workspace, the setup and my plans for future studio time and small sessions.",
  );
  const button = get(
    `home.workshop.button.${lang}`,
    language === "de" ? "Mehr aus der Werkstatt" : "More from the studio",
  );

  function crop(base: string) {
    const zoom = numeric(get(`${base}.zoom`, "1"), 1);
    const x = numeric(get(`${base}.focusX`, "50"), 50);
    const y = numeric(get(`${base}.focusY`, "50"), 50);
    return {
      objectFit: zoom < 1 ? "contain" : "cover",
      objectPosition: `${x}% ${y}%`,
      transform: `scale(${zoom})`,
      transformOrigin: `${x}% ${y}%`,
    } as CSSProperties;
  }

  const mainUrl = loading ? "" : get("home.workshop.main.url", "/workshop/me2.jpg");
  const mainType = get("home.workshop.main.type", "image");
  const media1Url = loading ? "" : get("home.workshop.media1.url", "/jewelry/Cobald5 x Opaldust Leaf.jpg");
  const media1Type = get("home.workshop.media1.type", "image");
  const media2Url = loading ? "" : get("home.workshop.media2.url", "/workshop/me2.jpg");
  const media2Type = get("home.workshop.media2.type", "image");
  const smallMedia = [
    { url: media1Url, type: media1Type, base: "home.workshop.media1" },
    { url: media2Url, type: media2Type, base: "home.workshop.media2" },
  ].filter((item) => item.url);

  return (
    <section className="bg-black px-4 py-16 text-white sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
          <div className="order-1 min-w-0">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 sm:rounded-3xl">
              {mainUrl && (
                <div className="relative aspect-square overflow-hidden sm:aspect-[7/5] lg:aspect-[21/20]">
                  <Media url={mainUrl} type={mainType} className="absolute inset-0 h-full w-full" style={crop("home.workshop.main")} />
                </div>
              )}
            </div>

            {smallMedia.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-4">
                {smallMedia.map((item, index) => (
                  <div key={`${item.url}-${index}`} className="relative aspect-[7/6] overflow-hidden rounded-xl border border-white/10 bg-neutral-950 sm:aspect-[5/3] sm:rounded-2xl lg:aspect-[3/2]">
                    <Media url={item.url} type={item.type} className="absolute inset-0 h-full w-full" style={crop(item.base)} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="order-2 max-w-2xl lg:pl-2">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.48em]">{eyebrow}</p>
            <h2 className="mt-4 text-3xl font-black uppercase leading-tight sm:text-5xl">{title}</h2>
            <p className="mt-6 text-base leading-8 text-neutral-300 sm:text-lg sm:leading-9">{text}</p>
            {text2 && <p className="mt-5 text-base leading-8 text-neutral-400 sm:text-lg sm:leading-9">{text2}</p>}

            {(studioTitle || studioText) && (
              <div className="mt-8 border-t border-white/10 pt-7 sm:mt-10 sm:pt-9">
                {studioTitle && <h3 className="text-xl font-black uppercase tracking-[-0.01em] sm:text-2xl">{studioTitle}</h3>}
                {studioText && <p className="mt-4 text-base leading-8 text-neutral-400 sm:text-lg sm:leading-9">{studioText}</p>}
              </div>
            )}

            {button && (
              <Link href="/studio" className="mt-8 inline-flex rounded-full border border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-widest transition hover:border-orange-300 hover:text-orange-300 sm:text-sm">
                {button}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
