"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { useSiteContent } from "./SiteContentProvider";

function numeric(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function HomeStudioTeaser() {
  const { language } = useLanguage();
  const { get } = useSiteContent();
  const lang = language === "de" ? "de" : "en";
  const eyebrow = get(`home.studio.eyebrow.${lang}`, language === "de" ? "Werkstatt" : "Studio");
  const title = get(`home.studio.title.${lang}`, language === "de" ? "Der Arbeitsplatz" : "The workspace");
  const text = get(`home.studio.text.${lang}`, language === "de" ? "Ein kleiner Einblick in meinen Arbeitsplatz, die Ausstattung und meine Pläne für spätere Werkstattzeit und kleine Sessions." : "A quick look at my workspace, the setup and my plans for future studio time and small sessions.");
  const button = get(`home.studio.button.${lang}`, language === "de" ? "Zum Studio" : "Explore the studio");
  const mediaUrl = get("home.studio.media.url", "/workshop/me2.jpg");
  const mediaType = get("home.studio.media.type", "image");
  const zoom = numeric(get("home.studio.media.zoom", "1"), 1);
  const x = numeric(get("home.studio.media.focusX", "50"), 50);
  const y = numeric(get("home.studio.media.focusY", "50"), 50);
  const style = {
    objectFit: zoom < 1 ? "contain" : "cover",
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${x}% ${y}%`,
  } as const;

  return <section className="bg-neutral-950 px-4 py-14 text-white sm:px-6 sm:py-20"><div className="mx-auto grid max-w-6xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] sm:rounded-[2rem] xl:grid-cols-[0.9fr_1.1fr]">
    <div className="relative min-h-[240px] overflow-hidden bg-neutral-950 sm:min-h-[320px] xl:min-h-[360px]">{mediaUrl && (mediaType === "video" ? <video src={mediaUrl} muted controls playsInline preload="none" poster="/workshop/me2.jpg" className="absolute inset-0 h-full w-full" style={style} /> : <img src={mediaUrl} alt={language === "de" ? "FRGLASS Werkstatt" : "FRGLASS studio"} loading="lazy" className="absolute inset-0 h-full w-full" style={style} />)}<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent xl:bg-gradient-to-r" /></div>
    <div className="flex flex-col justify-center p-6 sm:p-10 xl:p-12"><p className="text-xs font-bold uppercase tracking-[0.32em] text-orange-300 sm:text-sm sm:tracking-[0.4em]">{eyebrow}</p><h2 className="mt-4 text-3xl font-black uppercase leading-tight sm:text-5xl">{title}</h2><p className="mt-5 max-w-xl leading-7 text-neutral-300 sm:text-lg sm:leading-8">{text}</p><Link href="/studio" className="mt-7 inline-flex w-fit rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:bg-orange-200 sm:px-6 sm:text-sm">{button}</Link></div>
  </div></section>;
}
