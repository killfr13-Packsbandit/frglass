"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "../siteConfig";
import { useLanguage } from "../components/LanguageProvider";
import InquiryForm from "../components/InquiryForm";

const copy = {
  en: {
    eyebrow: "Contact",
    title: "Get in touch.",
    intro: "Interested in a piece, a custom idea or the future workshop setup? Send me a message here and it will go straight to my inbox.",
    vision: "You can ask me about",
    items: ["Available pieces", "Custom ideas", "Future torch rental", "Small workshops or workshop time"],
  },
  de: {
    eyebrow: "Kontakt",
    title: "Meld dich.",
    intro: "Du interessierst dich für ein Stück, eine eigene Idee oder die spätere Werkstatt-Nutzung? Schreib mir hier direkt – die Anfrage geht an mein E-Mail-Postfach.",
    vision: "Du kannst mich fragen wegen",
    items: ["Verfügbaren Stücken", "Eigener Ideen und Anfragen", "Späterer Brennermietung", "Kleinen Workshops oder Werkstattzeit"],
  },
} as const;

export default function Page() {
  const { language } = useLanguage();
  const t = copy[language];
  const [productName, setProductName] = useState("");
  const [productSlug, setProductSlug] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProductName(params.get("product")?.slice(0, 160) ?? "");
    setProductSlug(params.get("slug")?.slice(0, 180) ?? "");
  }, []);

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-32">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">{t.eyebrow}</p>
          <h1 className="text-4xl font-black uppercase leading-tight sm:text-6xl">{t.title}</h1>
          <p className="mt-6 text-base leading-7 text-neutral-300 sm:mt-8 sm:text-lg sm:leading-8">{t.intro}</p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <InquiryForm productName={productName || undefined} productSlug={productSlug || undefined} />

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <h2 className="text-2xl font-black uppercase sm:text-3xl">{t.vision}</h2>
            <div className="mt-6 grid gap-4 text-neutral-300 sm:gap-5">
              {t.items.map((item) => <p key={item}>— {item}</p>)}
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-sm text-neutral-500">{siteConfig.email}</p>
              <a href={siteConfig.instagram} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:border-orange-300 hover:text-orange-300">Instagram</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
