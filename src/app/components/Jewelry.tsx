"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categoryIdFromName, formatProductPrice, type ProductCategory } from "../productTypes";
import { translations, useLanguage } from "./LanguageProvider";
import ProductPicture from "./ProductPicture";
import { useProducts } from "./useProducts";
import { useSiteContent } from "./SiteContentProvider";

export default function JewelryShowcase() {
  const { language } = useLanguage();
  const { products } = useProducts();
  const { get } = useSiteContent();
  const t = translations[language].jewelry;
  const lang = language === "de" ? "de" : "en";
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => { fetch("/api/product-categories", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((data) => setCategories(Array.isArray(data?.categories) ? data.categories : [])).catch(() => {}); }, []);

  const showcaseCategories = useMemo(() => categories.filter((category) => category.visible && products.some((product) => product.status === "Available" && (product.categoryId || categoryIdFromName(product.category)) === category.id)), [categories, products]);
  useEffect(() => { if (activeIndex >= showcaseCategories.length) setActiveIndex(0); }, [activeIndex, showcaseCategories.length]);
  useEffect(() => { if (showcaseCategories.length <= 1) return; const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % showcaseCategories.length), 10000); return () => window.clearInterval(timer); }, [showcaseCategories.length]);

  const activeCategory = showcaseCategories[activeIndex];
  const activeId = activeCategory?.id ?? "pendants";
  const featuredProducts = products.filter((product) => product.status === "Available" && (product.categoryId || categoryIdFromName(product.category)) === activeId).slice(0, 5);
  const fallbackEyebrow = get(`home.jewelry.eyebrow.${lang}`, t.eyebrow);
  const fallbackTitle = get(`home.jewelry.title.${lang}`, t.title);
  const fallbackIntro = get(`home.jewelry.intro.${lang}`, t.intro);
  const eyebrow = activeCategory ? (language === "de" ? activeCategory.homeEyebrowDe : activeCategory.homeEyebrow) || (language === "de" ? activeCategory.nameDe : activeCategory.name) : fallbackEyebrow;
  const title = activeCategory ? (language === "de" ? activeCategory.homeTitleDe : activeCategory.homeTitle) || (language === "de" ? activeCategory.nameDe : activeCategory.name) : fallbackTitle;
  const intro = activeCategory ? (language === "de" ? activeCategory.homeIntroDe : activeCategory.homeIntro) || fallbackIntro : fallbackIntro;

  return <section id="collections" className="bg-black px-4 py-16 text-white sm:px-6 sm:py-24 xl:py-28">
    <div key={activeId} className="animate-[fadeIn_.5s_ease-out]"><p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.32em] text-orange-300 sm:text-sm sm:tracking-[0.45em]">{eyebrow}</p><h2 className="mx-auto mb-5 max-w-4xl text-center text-3xl font-black uppercase tracking-[0.08em] sm:mb-6 sm:text-4xl sm:tracking-[0.14em] xl:tracking-[0.2em]">{title}</h2><p className="mx-auto mb-8 max-w-2xl text-center leading-7 text-neutral-400 sm:mb-10">{intro}</p></div>
    {showcaseCategories.length > 1 && <div className="mx-auto mb-8 flex max-w-4xl flex-wrap justify-center gap-2">{showcaseCategories.map((category, index) => <button key={category.id} type="button" onClick={() => setActiveIndex(index)} className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${index === activeIndex ? "border-orange-300 bg-orange-300/10 text-orange-300" : "border-white/10 text-neutral-500 hover:text-white"}`}>{language === "de" ? category.nameDe : category.name}</button>)}</div>}
    <div key={`products-${activeId}`} className="mx-auto grid max-w-7xl gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">{featuredProducts.map((product, index) => { const productName = language === "de" ? product.nameDe : product.name; const productPrice = formatProductPrice(language === "de" ? product.priceDe : product.price); const featured = index === 0 || index === 3; return <Link key={product.slug} href={`/shop/${product.slug}`} className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 transition-all duration-500 hover:-translate-y-2 hover:border-orange-300/60 hover:shadow-[0_0_50px_rgba(255,170,80,0.25)] sm:rounded-3xl ${featured ? "xl:col-span-2" : ""}`}><div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/10 to-transparent" /><div className={`relative flex w-full items-center justify-center p-3 sm:p-4 ${featured ? "h-[360px] sm:h-[440px] xl:h-[620px]" : "h-[320px] sm:h-[400px] xl:h-[420px]"}`}><ProductPicture src={product.image} alt={productName} sizes={featured ? "(min-width: 1280px) 50vw, (min-width: 768px) 50vw, 100vw" : "(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"} className="object-contain p-3 transition duration-700 group-hover:scale-105 sm:p-4" /></div><div className="absolute bottom-0 left-0 z-20 max-w-full p-5 sm:p-6"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-orange-300 sm:mb-3 sm:text-xs sm:tracking-[0.35em]">FRGLASS</p><h3 className="break-normal hyphens-none text-xl font-black uppercase tracking-[0.05em] sm:text-2xl sm:tracking-[0.08em] xl:tracking-[0.12em]">{productName}</h3>{productPrice && <p className="mt-2 text-sm text-neutral-300">{productPrice}</p>}</div></Link>; })}</div>
  </section>;
}
