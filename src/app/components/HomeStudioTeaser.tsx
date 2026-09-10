"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";

export default function HomeStudioTeaser() {
  const { language } = useLanguage();

  return (
    <section className="bg-neutral-950 px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-[260px] lg:min-h-[360px]">
          <Image
            src="/workshop/me2.jpg"
            alt={language === "de" ? "FRGLASS Werkstatt" : "FRGLASS studio"}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:bg-gradient-to-r" />
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm">
            {language === "de" ? "Werkstatt" : "Studio"}
          </p>
          <h2 className="mt-4 text-3xl font-black uppercase sm:text-5xl">
            {language === "de" ? "Der Arbeitsplatz" : "The workspace"}
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-neutral-300 sm:text-lg sm:leading-8">
            {language === "de"
              ? "Ein kleiner Einblick in meinen Arbeitsplatz, die Ausstattung und meine Pläne für spätere Werkstattzeit und kleine Sessions."
              : "A quick look at my workspace, the setup and my plans for future studio time and small sessions."}
          </p>

          <Link
            href="/studio"
            className="mt-7 inline-flex w-fit rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-wider text-black transition hover:bg-orange-200"
          >
            {language === "de" ? "Zum Studio" : "Explore the studio"}
          </Link>
        </div>
      </div>
    </section>
  );
}
