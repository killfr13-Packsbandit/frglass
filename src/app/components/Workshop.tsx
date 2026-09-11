"use client";

import { translations, useLanguage } from "./LanguageProvider";
import { useSiteContent } from "./SiteContentProvider";

function Media({ url, type, className, auto = false, style }: { url: string; type: string; className: string; auto?: boolean; style?: React.CSSProperties }) {
  if (!url) return null;
  if (type === "video") return <video src={url} autoPlay={auto} muted={auto} loop={auto} controls={!auto} playsInline preload="metadata" className={className} />;
  return <img src={url} alt="FRGLASS workshop" className={className} style={style} />;
}

export default function Workshop() {
  const { language } = useLanguage();
  const { get } = useSiteContent();
  const t = translations[language].workshop;
  const lang = language === "de" ? "de" : "en";
  const eyebrow = get(`home.workshop.eyebrow.${lang}`, t.eyebrow);
  const title = get(`home.workshop.title.${lang}`, t.title);
  const text = get(`home.workshop.text.${lang}`, t.text);

  function crop(base: string) {
    const zoom = Number(get(`${base}.zoom`, "1")) || 1;
    const x = Number(get(`${base}.focusX`, "50")) || 50;
    const y = Number(get(`${base}.focusY`, "50")) || 50;
    return { objectPosition: `${x}% ${y}%`, transform: `scale(${zoom})`, transformOrigin: `${x}% ${y}%` } as React.CSSProperties;
  }

  const mainUrl = get("home.workshop.main.url", "/workshop/hero.mp4");
  const mainType = get("home.workshop.main.type", "video");
  const media1Url = get("home.workshop.media1.url", "/workshop/me1.png");
  const media1Type = get("home.workshop.media1.type", "image");
  const media2Url = get("home.workshop.media2.url", "/workshop/me2.jpg");
  const media2Type = get("home.workshop.media2.type", "image");
  const smallMedia = [
    { url: media1Url, type: media1Type, base: "home.workshop.media1" },
    { url: media2Url, type: media2Type, base: "home.workshop.media2" },
  ].filter((item) => item.url);

  return <section className="relative overflow-hidden bg-black px-4 py-16 text-white sm:px-6 sm:py-24 xl:py-32"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,120,30,.15),transparent_60%)]" /><div className="relative mx-auto grid max-w-7xl items-center gap-10 sm:gap-12 xl:grid-cols-2 xl:gap-16">
    <div className="max-w-2xl"><p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-orange-300 sm:text-sm sm:tracking-[0.45em]">{eyebrow}</p><h2 className="text-3xl font-black uppercase leading-tight sm:text-5xl">{title}</h2><p className="mt-6 text-base leading-7 text-neutral-300 sm:mt-8 sm:text-lg sm:leading-8">{text}</p></div>
    <div className="min-w-0 space-y-4 sm:space-y-6">{mainUrl && <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl sm:rounded-3xl"><Media url={mainUrl} type={mainType} auto={mainType === "video"} className="h-full w-full object-cover" style={crop("home.workshop.main")} /></div>}
      {smallMedia.length > 0 && <div className={`grid gap-3 sm:gap-6 ${smallMedia.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>{smallMedia.map((item, index) => <div key={`${item.url}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-neutral-950 sm:rounded-2xl"><Media url={item.url} type={item.type} className="h-full w-full object-cover" style={crop(item.base)} /></div>)}</div>}
    </div>
  </div></section>;
}
