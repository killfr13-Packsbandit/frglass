"use client";

import Link from "next/link";
import { products } from "../products";
import { translations, useLanguage } from "./LanguageProvider";

export default function JewelryShowcase() {
  const { language } = useLanguage();
  const t = translations[language].jewelry;
  const featuredProducts = products.slice(0, 5);

  return (
    <section id="collections" className="bg-black px-6 py-28 text-white">
      <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
        {t.eyebrow}
      </p>

      <h2 className="mb-6 text-center text-4xl font-black uppercase tracking-[0.2em]">
        {t.title}
      </h2>

      <p className="mx-auto mb-14 max-w-2xl text-center text-neutral-400">
        {t.intro}
      </p>

      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
        {featuredProducts.map((product, index) => {
          const productName = language === "de" ? product.nameDe : product.name;
          const productPrice = language === "de" ? product.priceDe : product.price;

          return (
            <Link
              key={product.slug}
              href={`/shop/${product.slug}`}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 transition-all duration-500 hover:-translate-y-2 hover:border-orange-300/60 hover:shadow-[0_0_50px_rgba(255,170,80,0.25)] ${
                index === 0 || index === 3 ? "md:col-span-2" : ""
              }`}
            >
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

              <div
                className={`flex w-full items-center justify-center p-4 ${
                  index === 0 || index === 3 ? "h-[620px]" : "h-[420px]"
                }`}
              >
                <img
                  src={product.image}
                  alt={productName}
                  className="h-full w-full object-contain transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="absolute bottom-0 left-0 z-20 p-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-orange-300">
                  FRGLASS
                </p>

                <h3 className="text-2xl font-black uppercase tracking-[0.12em]">
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
