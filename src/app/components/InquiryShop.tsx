"use client";

import Link from "next/link";
import { siteConfig } from "../siteConfig";
import { products } from "../products";
import { useLanguage } from "./LanguageProvider";

const copy = {
  en: {
    eyebrow: "Shop",
    title: "Available pieces",
    intro: "These pieces are currently available. If you are interested in one, send me a message and we can arrange payment and shipping directly.",
    request: "Ask about this piece",
    subject: "Request",
  },
  de: {
    eyebrow: "Shop",
    title: "Verfügbare Stücke",
    intro: "Diese Stücke sind aktuell verfügbar. Wenn dich eines interessiert, schreib mir einfach und wir klären Bezahlung und Versand direkt.",
    request: "Stück anfragen",
    subject: "Anfrage",
  },
} as const;

export default function InquiryShop() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <section className="bg-black px-6 py-32 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
          {t.eyebrow}
        </p>

        <h1 className="text-center text-6xl font-black uppercase">
          {t.title}
        </h1>

        <p className="mx-auto mb-16 mt-6 max-w-2xl text-center text-neutral-300">
          {t.intro}
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {products.map((product) => {
            const name = language === "de" ? product.nameDe : product.name;
            const status = language === "de" ? product.statusDe : product.status;
            const price = language === "de" ? product.priceDe : product.price;

            return (
              <div
                key={product.slug}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/20"
              >
                <Link
                  href={`/shop/${product.slug}`}
                  className="flex h-[460px] items-center justify-center bg-neutral-950 p-3"
                >
                  <img
                    src={product.image}
                    alt={name}
                    className="h-full w-full object-contain"
                  />
                </Link>

                <div className="p-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">
                    {status}
                  </p>

                  <Link href={`/shop/${product.slug}`}>
                    <h2 className="text-2xl font-black uppercase">
                      {name}
                    </h2>
                  </Link>

                  <p className="mt-3 text-neutral-300">{price}</p>

                  <a
                    href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`${t.subject} ${name}`)}`}
                    className="mt-6 inline-block rounded-full border border-orange-300 px-6 py-3 text-sm font-bold uppercase tracking-widest text-orange-300 transition hover:bg-orange-300 hover:text-black"
                  >
                    {t.request}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
