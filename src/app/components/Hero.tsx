"use client";

import Image from "next/image";
import { translations, useLanguage } from "./LanguageProvider";
import { useSiteContent } from "./SiteContentProvider";

function numeric(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function Hero() {
  const { language } = useLanguage();
  const { get } = useSiteContent();
  const t = translations[language].hero;
  const lang = language === "de" ? "de" : "en";
  const tags = language === "de" ? ["Lampworking", "Schmuck", "Objekte"] : ["Lampworking", "Jewelry", "Objects"];
  const subtitle = get(`home.hero.subtitle.${lang}`, t.subtitle);
  const text = get(`home.hero.text.${lang}`, t.text);
  const cta = get(`home.hero.cta.${lang}`, t.cta);
  const mediaUrl = get("home.hero.media.url", "/hero/hero.mp4");
  const mediaType = get("home.hero.media.type", "video");
  const zoom = numeric(get("home.hero.media.zoom", "1"), 1);
  const focusX = numeric(get("home.hero.media.focusX", "50"), 50);
  const focusY = numeric(get("home.hero.media.focusY", "50"), 50);
  const mediaStyle = {
    objectFit: zoom < 1 ? "contain" : "cover",
    objectPosition: `${focusX}% ${focusY}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${focusX}% ${focusY}%`,
  } as const;

  return <section className="overflow-x-hidden bg-black pt-20 text-white sm:pt-24"><div className="mx-auto grid w-full min-w-0 max-w-[1600px] grid-cols-1 xl:min-h-[calc(100vh-6rem)] xl:grid-cols-[0.9fr_1.1fr]">
    <div className="relative flex min-w-0 items-center overflow-hidden border-b border-white/10 px-4 py-8 sm:px-6 sm:py-12 lg:px-10 xl:border-b-0 xl:border-r xl:px-16 2xl:px-24"><div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-400/10 blur-[110px]" /><div className="pointer-events-none absolute bottom-16 right-0 h-48 w-48 rounded-full bg-fuchsia-500/5 blur-[100px]" /><div className="relative z-10 mx-auto w-full min-w-0 max-w-2xl xl:mx-0 xl:max-w-xl"><div className="w-full min-w-0 rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5 shadow-2xl shadow-black/30 backdrop-blur-sm sm:rounded-[2rem] sm:p-8">
      <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:gap-7 sm:text-left"><div className="relative h-28 w-20 shrink-0 overflow-hidden sm:h-44 sm:w-28"><Image src="/logo.png" alt="FRGLASS Logo" fill sizes="256px" quality={100} priority className="scale-110 object-cover object-center drop-shadow-[0_0_22px_rgba(253,186,116,0.12)]" /></div><div className="min-w-0 max-w-full"><h1 className="break-normal text-3xl font-semibold uppercase tracking-[0.1em] text-white sm:text-4xl sm:tracking-[0.14em]">FRGLASS</h1><p className="mt-3 break-normal text-xs font-semibold uppercase leading-5 tracking-[0.12em] text-neutral-400 sm:text-base sm:leading-6 sm:tracking-[0.16em]">{subtitle}</p></div></div>
      <div className="my-5 h-px bg-gradient-to-r from-orange-300/60 via-white/15 to-transparent sm:my-7" /><p className="max-w-lg text-[15px] leading-7 text-neutral-300 sm:text-lg sm:leading-8">{text}</p><div className="mt-5 flex flex-wrap justify-center gap-2 sm:mt-7 sm:justify-start">{tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400 sm:text-[11px] sm:tracking-[0.16em]">{tag}</span>)}</div><a href="#collections" className="mt-6 inline-flex max-w-full items-center rounded-full bg-orange-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-black transition hover:bg-orange-200 sm:mt-8 sm:px-6 sm:text-sm sm:tracking-[0.14em]">{cta}</a>
    </div></div></div>
    <div className="relative min-h-[48vh] min-w-0 overflow-hidden bg-neutral-950 sm:min-h-[58vh] xl:min-h-full">{mediaUrl && (mediaType === "image" ? <img src={mediaUrl} alt="" className="absolute inset-0 h-full w-full" style={mediaStyle} /> : <video src={mediaUrl} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full" style={mediaStyle} />)}<div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/10" /><div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent xl:hidden" /></div>
  </div></section>;
}
