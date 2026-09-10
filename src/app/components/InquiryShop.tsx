"use client";

import Image from "next/image";
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

function formatPrice(value: string) {
  const price = value.trim();
  return price.startsWith("€") ? price : `€${price}`;
}

export default function InquiryShop() {
  const { language } = useLanguage();
  const t = copy[language];
  const availableProducts = products.filter((product) => product.status === "Available");

  return (
    <section className="bg-black px-4 py-24 text-white sm:px-6 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">
          {t.eyebrow}
        </p>

        <h1 className="break-words text-center text-4xl font-black uppercase sm:text-6xl">
          {t.title}
        </h1>

        <p className="mx-auto mb-12 mt-6 max-w-2xl text-center leading-7 text-neutral-300 sm:mb-16">
          {t.intro}
        </p>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {availableProducts.map((product) => {
            const name = language === "de" ? product.nameDe : product.name;
            const status = language === "de" ? product.statusDe : product.status;
            const price = formatPrice(language === "de" ? product.priceDe : product.price);

            return (
              <div
                key={product.slug}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/20 sm:rounded-3xl"
              >
                <Link
                  href={`/shop/${product.slug}`}
                  className="relative flex h-[360px] items-center justify-center bg-neutral-950 p-3 sm:h-[460px]"
                >
                  <Image
                    src={product.image}
                    alt={name}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-contain p-3"
                  />
                </Link>

                <div className="p-5 sm:p-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">
                    {status}
                  </p>

                  <Link href={`/shop/${product.slug}`}>
                    <h2 className="break-words text-xl font-black uppercase sm:text-2xl">
                      {name}
                    </h2>
                  </Link>

                  <p className="mt-3 text-neutral-300">{price}</p>

                  <a
                    href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`${t.subject} ${name}`)}`}
                    className="mt-6 inline-block w-full rounded-full border border-orange-300 px-5 py-3 text-center text-xs font-bold uppercase tracking-widest text-orange-300 transition hover:bg-orange-300 hover:text-black sm:w-auto sm:px-6 sm:text-sm"
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
