"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categoryIdFromName, formatProductPrice } from "../productTypes";
import { translations, useLanguage } from "./LanguageProvider";
import ProductPicture from "./ProductPicture";
import { useProductCategories } from "./useProductCategories";
import { useProducts } from "./useProducts";
import { useSiteContent } from "./SiteContentProvider";

export default function JewelryShowcase() {
  const { language } = useLanguage();
  const { products, loading: productsLoading, error: productsError, refresh: refreshProducts } = useProducts();
  const { get } = useSiteContent();
  const t = translations[language].jewelry;
  const lang = language === "de" ? "de" : "en";
  const { categories } = useProductCategories();
  const [activeIndex, setActiveIndex] = useState(0);

  const showcaseCategories = useMemo(
    () => categories.filter((category) => category.visible && products.some((product) => product.status === "Available" && (product.categoryId || categoryIdFromName(product.category)) === category.id)),
    [categories, products],
  );

  useEffect(() => {
    if (activeIndex >= showcaseCategories.length) setActiveIndex(0);
  }, [activeIndex, showcaseCategories.length]);

  useEffect(() => {
    if (showcaseCategories.length <= 1 || window.matchMedia("(any-pointer: coarse)").matches) return;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % showcaseCategories.length), 10000);
    return () => window.clearInterval(timer);
  }, [showcaseCategories.length]);

  const activeCategory = showcaseCategories[activeIndex];
  const activeId = activeCategory?.id ?? "pendants";
  const featuredProducts = products.filter((product) => product.status === "Available" && (product.categoryId || categoryIdFromName(product.category)) === activeId).slice(0, 5);
  const fallbackEyebrow = get(`home.jewelry.eyebrow.${lang}`, t.eyebrow);
  const fallbackTitle = get(`home.jewelry.title.${lang}`, t.title);
  const fallbackIntro = get(`home.jewelry.intro.${lang}`, t.intro);
  const categoryName = activeCategory ? (language === "de" ? activeCategory.nameDe || activeCategory.name : activeCategory.name || activeCategory.nameDe) : "";
  const categoryIntroFallback = activeCategory
    ? language === "de"
      ? `Handgemachte ${categoryName} aus Borosilikatglas aus Österreich. Jedes Stück entsteht einzeln am Brenner und ist ein Unikat.`
      : `Handmade ${categoryName.toLowerCase()} in borosilicate glass from Austria. Each piece is individually shaped at the torch and is one of a kind.`
    : fallbackIntro;
  const eyebrow = activeCategory ? (language === "de" ? activeCategory.homeEyebrowDe : activeCategory.homeEyebrow) || categoryName : fallbackEyebrow;
  const title = activeCategory ? (language === "de" ? activeCategory.homeTitleDe : activeCategory.homeTitle) || categoryName : fallbackTitle;
  const intro = activeCategory ? (language === "de" ? activeCategory.homeIntroDe : activeCategory.homeIntro) || categoryIntroFallback : fallbackIntro;

  return (
    <section id="collections" className="relative overflow-hidden bg-black px-4 py-18 text-white sm:px-6 sm:py-24 xl:py-32">
      <div className="pointer-events-none absolute right-[-12rem] top-16 h-96 w-96 rounded-full bg-orange-400/5 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl">
        <div key={activeId} className="grid animate-[fadeIn_.5s_ease-out] gap-7 border-b border-white/10 pb-8 sm:pb-10 lg:grid-cols-[1.05fr_.95fr] lg:items-end lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-orange-300 sm:text-sm sm:tracking-[0.45em]">{eyebrow}</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-5xl lg:text-6xl">{title}</h2>
          </div>
          <div className="lg:pb-1">
            <p className="max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg sm:leading-8">{intro}</p>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-600 sm:text-xs">
              {featuredProducts.length} {language === "de" ? "ausgewählte Stücke" : "selected pieces"}
            </p>
          </div>
        </div>

        {showcaseCategories.length > 1 && (
          <div className="my-7 flex flex-wrap gap-2 sm:my-9">
            {showcaseCategories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-full border px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] transition sm:text-xs ${index === activeIndex ? "border-orange-300 bg-orange-300 text-black" : "border-white/10 bg-white/[0.02] text-neutral-500 hover:border-white/25 hover:text-white"}`}
              >
                {language === "de" ? category.nameDe : category.name}
              </button>
            ))}
          </div>
        )}

        {productsLoading && <p role="status" className="py-12 text-center text-neutral-500">{language === "de" ? "Stücke werden geladen …" : "Loading pieces …"}</p>}
        {productsError && (
          <p role="alert" className="py-8 text-center text-neutral-400">
            {language === "de" ? "Stücke konnten nicht geladen werden." : "Pieces could not be loaded."}{" "}
            <button type="button" onClick={() => void refreshProducts()} className="underline">{language === "de" ? "Erneut versuchen" : "Retry"}</button>
          </p>
        )}

        <div key={`products-${activeId}`} className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product, index) => {
            const productName = language === "de" ? product.nameDe : product.name;
            const productPrice = formatProductPrice(language === "de" ? product.priceDe : product.price);
            const featured = index === 0 || index === 3;
            return (
              <Link
                key={product.slug}
                href={`/shop/${product.slug}`}
                className={`group relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-neutral-950 transition-all duration-500 hover:-translate-y-1.5 hover:border-orange-300/45 hover:shadow-[0_18px_70px_rgba(0,0,0,.45)] sm:rounded-[1.8rem] ${featured ? "xl:col-span-2" : ""}`}
              >
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/5 to-transparent" />
                <div className={`relative flex w-full items-center justify-center overflow-hidden p-3 sm:p-4 ${featured ? "h-[360px] sm:h-[450px] xl:h-[610px]" : "h-[320px] sm:h-[400px] xl:h-[420px]"}`}>
                  <ProductPicture
                    src={product.image}
                    alt={productName}
                    sizes={featured ? "(min-width: 1280px) 50vw, (min-width: 768px) 50vw, 100vw" : "(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"}
                    className="object-contain p-3 transition duration-700 group-hover:scale-[1.04] sm:p-4"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 p-5 sm:p-6">
                  <div className="min-w-0">
                    <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.32em] text-orange-300 sm:text-[10px]">FRGLASS</p>
                    <h3 className="break-normal hyphens-none text-xl font-black uppercase tracking-[0.04em] sm:text-2xl">{productName}</h3>
                    {productPrice && <p className="mt-2 text-sm text-neutral-300">{productPrice}</p>}
                  </div>
                  <span className="mb-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-lg text-white transition group-hover:border-orange-300 group-hover:text-orange-300 sm:flex">↗</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}