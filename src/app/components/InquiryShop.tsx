"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "../siteConfig";
import { categoryIdFromName, formatProductPrice } from "../productTypes";
import { useLanguage } from "./LanguageProvider";
import ProductPicture from "./ProductPicture";
import { useProductCategories } from "./useProductCategories";
import { useProducts } from "./useProducts";
import { useSiteContent } from "./SiteContentProvider";

const copy = {
  en: {
    eyebrow: "Shop",
    title: "Available pieces",
    intro: "These pieces are currently available. If you are interested in one, send me a message and we can arrange payment and shipping directly.",
    request: "Ask about this piece",
    subject: "Request",
    all: "All",
  },
  de: {
    eyebrow: "Shop",
    title: "Verfügbare Stücke",
    intro: "Diese Stücke sind aktuell verfügbar. Wenn dich eines interessiert, schreib mir einfach und wir klären Bezahlung und Versand direkt.",
    request: "Stück anfragen",
    subject: "Anfrage",
    all: "Alle",
  },
} as const;

export default function InquiryShop() {
  const { language } = useLanguage();
  const { get } = useSiteContent();
  const { products } = useProducts();
  const { categories } = useProductCategories();
  const [activeCategory, setActiveCategory] = useState("all");
  const t = copy[language];
  const lang = language === "de" ? "de" : "en";
  const availableProducts = products.filter((product) => product.status === "Available");

  const visibleCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.visible &&
          availableProducts.some(
            (product) =>
              (product.categoryId || categoryIdFromName(product.category)) === category.id,
          ),
      ),
    [categories, availableProducts],
  );

  useEffect(() => {
    if (
      activeCategory !== "all" &&
      !visibleCategories.some((category) => category.id === activeCategory)
    ) {
      setActiveCategory("all");
    }
  }, [activeCategory, visibleCategories]);

  const shownProducts =
    activeCategory === "all"
      ? availableProducts
      : availableProducts.filter(
          (product) =>
            (product.categoryId || categoryIdFromName(product.category)) === activeCategory,
        );

  return (
    <section className="bg-black px-4 py-24 text-white sm:px-6 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">
          {get(`shop.eyebrow.${lang}`, t.eyebrow)}
        </p>
        <h1 className="break-words text-center text-4xl font-black uppercase sm:text-6xl">
          {get(`shop.title.${lang}`, t.title)}
        </h1>
        <p className="mx-auto mb-10 mt-6 max-w-2xl text-center leading-7 text-neutral-300 sm:mb-12">
          {get(`shop.intro.${lang}`, t.intro)}
        </p>

        {visibleCategories.length > 1 && (
          <div className="mx-auto mb-12 flex max-w-4xl flex-wrap justify-center gap-2 sm:mb-16">
            <button type="button" onClick={() => setActiveCategory("all")} className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${activeCategory === "all" ? "border-orange-300 bg-orange-300 text-black" : "border-white/15 text-neutral-300 hover:border-orange-300 hover:text-orange-300"}`}>{t.all}</button>
            {visibleCategories.map((category) => (
              <button key={category.id} type="button" onClick={() => setActiveCategory(category.id)} className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${activeCategory === category.id ? "border-orange-300 bg-orange-300 text-black" : "border-white/15 text-neutral-300 hover:border-orange-300 hover:text-orange-300"}`}>
                {language === "de" ? category.nameDe : category.name}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {shownProducts.map((product) => {
            const name = language === "de" ? product.nameDe : product.name;
            const status = language === "de" ? product.statusDe : product.status;
            const price = formatProductPrice(language === "de" ? product.priceDe : product.price);

            return (
              <div key={product.slug} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/20 sm:rounded-3xl">
                <Link href={`/shop/${product.slug}`} className="relative flex h-[360px] items-center justify-center bg-neutral-950 p-3 sm:h-[460px]">
                  <ProductPicture src={product.image} alt={name} sizes="(min-width: 768px) 33vw, 100vw" className="object-contain p-3" />
                </Link>

                <div className="p-5 sm:p-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">{status}</p>
                  <Link href={`/shop/${product.slug}`}><h2 className="break-words text-xl font-black uppercase sm:text-2xl">{name}</h2></Link>
                  {price && <p className="mt-3 text-neutral-300">{price}</p>}
                  <a href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`${t.subject} ${name}`)}`} className="mt-6 inline-block w-full rounded-full border border-orange-300 px-5 py-3 text-center text-xs font-bold uppercase tracking-widest text-orange-300 transition hover:bg-orange-300 hover:text-black sm:w-auto sm:px-6 sm:text-sm">{t.request}</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
