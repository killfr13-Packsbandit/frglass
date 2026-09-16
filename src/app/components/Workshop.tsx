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
                <div className="relative h-[360px] overflow-hidden sm:h-[520px] lg:h-[620px]">
                  <Media url={mainUrl} type={mainType} className="absolute inset-0 h-full w-full" style={crop("home.workshop.main")} />
                </div>
              )}
            </div>

            {smallMedia.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-4">
                {smallMedia.map((item, index) => (
                  <div key={`${item.url}-${index}`} className="relative h-[150px] overflow-hidden rounded-xl border border-white/10 bg-neutral-950 sm:h-[210px] sm:rounded-2xl">
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
            <p className="mt-5 text-base leading-8 text-neutral-400 sm:text-lg sm:leading-9">
              {language === "de"
                ? "Mich interessiert dabei nicht nur das fertige Stück, sondern auch der Weg dorthin: wie Farbe, Tiefe und Form direkt in der Flamme entstehen und sich während der Arbeit verändern."
                : "What interests me is not only the finished piece, but also the process: how color, depth and form emerge directly in the flame and keep changing while I work."}
            </p>
            <Link href="/studio" className="mt-8 inline-flex rounded-full border border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-widest transition hover:border-orange-300 hover:text-orange-300 sm:text-sm">
              {language === "de" ? "Mehr aus der Werkstatt" : "More from the studio"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
