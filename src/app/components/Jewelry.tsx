"use client";

import Image from "next/image";
import Link from "next/link";
import { products } from "../products";
import { translations, useLanguage } from "./LanguageProvider";

function formatPrice(value: string) {
  const price = value.trim();
  return price.startsWith("€") ? price : `€${price}`;
}

export default function JewelryShowcase() {
  const { language } = useLanguage();
  const t = translations[language].jewelry;
  const featuredProducts = products.filter((product) => product.status === "Available").slice(0, 5);

  return (
    <section id="collections" className="bg-black px-4 py-20 text-white sm:px-6 sm:py-28">
      <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">
        {t.eyebrow}
      </p>

      <h2 className="mb-6 text-center text-3xl font-black uppercase tracking-[0.14em] sm:text-4xl sm:tracking-[0.2em]">
        {t.title}
      </h2>

      <p className="mx-auto mb-10 max-w-2xl text-center leading-7 text-neutral-400 sm:mb-14">
        {t.intro}
      </p>

      <div className="mx-auto grid max-w-7xl gap-4 sm:gap-6 md:grid-cols-4">
        {featuredProducts.map((product, index) => {
          const productName = language === "de" ? product.nameDe : product.name;
          const productPrice = formatPrice(language === "de" ? product.priceDe : product.price);
          const featured = index === 0 || index === 3;

          return (
            <Link
              key={product.slug}
              href={`/shop/${product.slug}`}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 transition-all duration-500 hover:-translate-y-2 hover:border-orange-300/60 hover:shadow-[0_0_50px_rgba(255,170,80,0.25)] sm:rounded-3xl ${
                featured ? "md:col-span-2" : ""
              }`}
            >
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

              <div
                className={`relative flex w-full items-center justify-center p-3 sm:p-4 ${
                  featured ? "h-[380px] sm:h-[500px] md:h-[620px]" : "h-[340px] sm:h-[420px]"
                }`}
              >
                <Image
                  src={product.image}
                  alt={productName}
                  fill
                  sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 100vw"}
                  className="object-contain p-3 transition duration-700 group-hover:scale-105 sm:p-4"
                />
              </div>

              <div className="absolute bottom-0 left-0 z-20 p-5 sm:p-6">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-orange-300 sm:mb-3 sm:text-xs sm:tracking-[0.35em]">
                  FRGLASS
                </p>

                <h3 className="break-words text-xl font-black uppercase tracking-[0.08em] sm:text-2xl sm:tracking-[0.12em]">
                  {productName}
                </h3>

                <p className="mt-2 text-sm text-neutral-300">
                  {productPrice}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
