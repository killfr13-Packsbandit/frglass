"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
    intro: "These pieces are currently available. Open a piece to see all details and send an inquiry from there.",
    details: "View piece",
    all: "All",
  },
  de: {
    eyebrow: "Shop",
    title: "Verfügbare Stücke",
    intro: "Diese Stücke sind aktuell verfügbar. Öffne ein Stück für alle Details und stelle deine Anfrage direkt auf der Produktseite.",
    details: "Stück ansehen",
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
    <section className="bg-black px-4 py-20 text-white sm:px-6 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">
          {get(`shop.eyebrow.${lang}`, t.eyebrow)}
        </p>
        <h1 className="break-words text-center text-4xl font-black uppercase sm:text-5xl lg:text-6xl">
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

        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3">
          {shownProducts.map((product) => {
            const name = language === "de" ? product.nameDe : product.name;
            const status = language === "de" ? product.statusDe : product.status;
            const price = formatProductPrice(language === "de" ? product.priceDe : product.price);
            const category = language === "de" ? product.categoryDe : product.category;
            const imageAlt = language === "de"
              ? `${name} – ${category} aus Borosilikatglas von FRGLASS`
              : `${name} – ${category} in borosilicate glass by FRGLASS`;

            return (
              <article key={product.slug} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/20 sm:rounded-3xl">
                <Link href={`/shop/${product.slug}`} className="relative flex h-[330px] items-center justify-center bg-neutral-950 p-3 sm:h-[400px] lg:h-[430px] xl:h-[460px]">
                  <ProductPicture src={product.image} alt={imageAlt} sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-contain p-3" />
                </Link>

                <div className="p-5 sm:p-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">{status}</p>
                  <Link href={`/shop/${product.slug}`}><h2 className="break-normal text-xl font-black uppercase leading-tight sm:text-2xl">{name}</h2></Link>
                  {price && <p className="mt-3 text-neutral-300">{price}</p>}
                  <Link href={`/shop/${product.slug}`} className="mt-6 inline-block w-full rounded-full border border-white/15 px-5 py-3 text-center text-xs font-bold uppercase tracking-widest text-neutral-200 transition hover:border-orange-300 hover:text-orange-300 sm:w-auto sm:px-6 sm:text-sm">
                    {t.details}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
