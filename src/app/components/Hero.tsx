"use client";

import Image from "next/image";
import Link from "next/link";
import { translations, useLanguage } from "./LanguageProvider";
import { useSiteContent } from "./SiteContentProvider";

function numeric(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function Hero() {
  const { language } = useLanguage();
  const { get, loading } = useSiteContent();
  const t = translations[language].hero;
  const lang = language === "de" ? "de" : "en";
  const subtitle = get(`home.hero.subtitle.${lang}`, t.subtitle);
  const text = get(`home.hero.text.${lang}`, t.text);
  const tags = [
    get(`home.hero.tag1.${lang}`, "Lampworking"),
    get(`home.hero.tag2.${lang}`, language === "de" ? "Schmuck" : "Jewelry"),
    get(`home.hero.tag3.${lang}`, language === "de" ? "Objekte" : "Objects"),
  ].filter((tag) => tag.trim().length > 0);
  const cta = get(`home.hero.cta.${lang}`, t.cta);
  const mediaUrl = loading ? "" : get("home.hero.media.url", "/workshop/me2.jpg");
  const mediaType = get("home.hero.media.type", "image");
  const zoom = numeric(get("home.hero.media.zoom", "1"), 1);
  const focusX = numeric(get("home.hero.media.focusX", "50"), 50);
  const focusY = numeric(get("home.hero.media.focusY", "50"), 50);
  const mediaStyle = {
    objectFit: zoom < 1 ? "contain" : "cover",
    objectPosition: `${focusX}% ${focusY}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${focusX}% ${focusY}%`,
  } as const;

  return (
    <section className="overflow-hidden bg-black pt-20 text-white sm:pt-24">
      <div className="mx-auto grid w-full max-w-[1680px] xl:min-h-[calc(100vh-6rem)] xl:grid-cols-[0.82fr_1.18fr]">
        <div className="relative flex items-center border-b border-white/10 px-5 py-12 sm:px-8 sm:py-16 lg:px-12 xl:border-b-0 xl:border-r xl:px-16 2xl:px-24">
          <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-orange-400/10 blur-[120px]" />
          <div className="relative z-10 mx-auto w-full max-w-2xl xl:mx-0 xl:max-w-xl">
            <div className="flex items-center gap-5 sm:gap-7">
              <div className="relative h-24 w-16 shrink-0 overflow-hidden sm:h-32 sm:w-20">
                <Image
                  src="/logo.png"
                  alt="FRGLASS Logo"
                  fill
                  sizes="160px"
                  quality={100}
                  priority
                  className="scale-110 object-cover object-center drop-shadow-[0_0_24px_rgba(253,186,116,0.14)]"
                />
              </div>
              <h1 className="text-[2.7rem] font-black uppercase leading-none tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">FRGLASS</h1>
              <div className="h-px min-w-6 flex-1 bg-gradient-to-r from-orange-300/70 via-white/20 to-transparent" />
              <p className="hidden text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-500 sm:block">2019 — {language === "de" ? "heute" : "today"}</p>
            </div>

            <div className="mt-8 sm:mt-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-300 sm:text-sm sm:tracking-[0.42em]">{subtitle}</p>
              <p className="mt-7 max-w-xl text-base leading-7 text-neutral-300 sm:mt-9 sm:text-lg sm:leading-8">{text}</p>
            </div>

            <div className="mt-7 flex flex-wrap gap-2 sm:mt-9">
              {tags.map((tag, index) => (
                <span key={`${tag}-${index}`} className="rounded-full border border-white/12 bg-white/[0.025] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400 sm:text-[11px]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative min-h-[55vh] overflow-hidden bg-neutral-950 sm:min-h-[64vh] xl:min-h-full">
          {mediaUrl && (mediaType === "image" ? (
            <img src={mediaUrl} fetchPriority="high" decoding="async" alt="" className="absolute inset-0 h-full w-full" style={mediaStyle} />
          ) : (
            <video src={mediaUrl} muted controls playsInline preload="none" className="absolute inset-0 h-full w-full" style={mediaStyle} />
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/10" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 to-transparent" />
        </div>
      </div>

      <div className="mx-auto flex max-w-[1680px] justify-center border-t border-white/10 px-5 py-8 sm:px-8 sm:py-10">
        <Link href="/shop#shop-categories" className="inline-flex items-center rounded-full bg-orange-300 px-6 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-white sm:px-7 sm:text-sm">
          {cta}
        </Link>
      </div>
    </section>
  );
}
