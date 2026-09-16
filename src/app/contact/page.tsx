"use client";

import { useEffect, useState } from "react";
import FlexibleTextBlocks from "../components/FlexibleTextBlocks";
import InquiryForm from "../components/InquiryForm";
import { useLanguage } from "../components/LanguageProvider";
import { useSiteContent } from "../components/SiteContentProvider";
import { siteConfig } from "../siteConfig";

const copy = {
  en: {
    eyebrow: "Contact",
    title: "Get in touch.",
    intro: "Interested in a piece, a custom idea or the future studio setup? Send me a message here. Your inquiry is sent directly to me by email, and I can reply personally.",
    listTitle: "You can ask me about",
    items: ["Available pieces", "Custom ideas and commissions", "Future torch or studio time", "Small workshops"],
  },
  de: {
    eyebrow: "Kontakt",
    title: "Meld dich.",
    intro: "Du interessierst dich für ein Stück, eine eigene Idee oder die spätere Werkstatt-Nutzung? Schreib mir hier direkt. Deine Anfrage wird per E-Mail an mich geschickt und ich kann dir persönlich antworten.",
    listTitle: "Du kannst mich fragen wegen",
    items: ["Verfügbaren Stücken", "Eigener Ideen und Anfragen", "Späterer Brenner- oder Werkstattzeit", "Kleinen Workshops"],
  },
} as const;

export default function Page() {
  const { language } = useLanguage();
  const { get } = useSiteContent();
  const t = copy[language];
  const lang = language === "de" ? "de" : "en";
  const [productName, setProductName] = useState("");
  const [productSlug, setProductSlug] = useState("");

  const eyebrow = get(`contact.eyebrow.${lang}`, t.eyebrow);
  const title = get(`contact.title.${lang}`, t.title);
  const intro = get(`contact.intro.${lang}`, t.intro);
  const listTitle = get(`contact.listTitle.${lang}`, t.listTitle);
  const items = t.items.map((fallback, index) => get(`contact.item${index + 1}.${lang}`, fallback)).filter((item) => item.trim().length > 0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProductName(params.get("product")?.slice(0, 160) ?? "");
    setProductSlug(params.get("slug")?.slice(0, 180) ?? "");
  }, []);

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-32">
      <section className="mx-auto max-w-7xl">
        <FlexibleTextBlocks page="contact" placement="beforeContact" embedded />

        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">{eyebrow}</p>
          <h1 className="text-4xl font-black uppercase leading-tight sm:text-6xl">{title}</h1>
          <p className="mt-6 text-base leading-7 text-neutral-300 sm:mt-8 sm:text-lg sm:leading-8">{intro}</p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <InquiryForm productName={productName || undefined} productSlug={productSlug || undefined} />

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <h2 className="text-2xl font-black uppercase sm:text-3xl">{listTitle}</h2>
            <div className="mt-6 grid gap-4 text-neutral-300 sm:gap-5">
              {items.map((item) => <p key={item}>— {item}</p>)}
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-sm text-neutral-500">{siteConfig.email}</p>
              <a href={siteConfig.instagram} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:border-orange-300 hover:text-orange-300">Instagram</a>
            </div>
          </div>
        </div>

        <FlexibleTextBlocks page="contact" placement="afterContact" embedded />
      </section>
    </main>
  );
}
