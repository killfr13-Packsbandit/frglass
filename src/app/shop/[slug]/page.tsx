"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductPicture from "../../components/ProductPicture";
import { useLanguage } from "../../components/LanguageProvider";
import { useProducts } from "../../components/useProducts";
import { categoryIdFromName, formatProductPrice } from "../../productTypes";

const copy = {
  en: {
    loading: "Loading piece …",
    notFound: "Piece not found",
    story: "About this piece",
    material: "Material",
    colors: "Colors",
    size: "Dimensions",
    year: "Year",
    request: "Ask about this piece",
    availableTitle: "Available original",
    availableText: "This is a one-off piece. Send a short inquiry and I’ll get back to you directly.",
    unavailableTitle: "No longer available",
    unavailableText: "This piece stays here as part of the gallery. You can find currently available work below.",
    browseAvailable: "See available pieces",
    similar: "More pieces",
    alsoLike: "You might also like",
    previousImage: "Previous image",
    nextImage: "Next image",
  },
  de: {
    loading: "Stück wird geladen …",
    notFound: "Stück nicht gefunden",
    story: "Zum Stück",
    material: "Material",
    colors: "Farben",
    size: "Größe",
    year: "Jahr",
    request: "Dieses Stück anfragen",
    availableTitle: "Verfügbares Einzelstück",
    availableText: "Dieses Stück gibt es nur einmal. Schick mir kurz eine Anfrage – ich melde mich direkt bei dir.",
    unavailableTitle: "Nicht mehr verfügbar",
    unavailableText: "Dieses Stück bleibt als Teil der Galerie sichtbar. Aktuell verfügbare Arbeiten findest du weiter unten.",
    browseAvailable: "Verfügbare Stücke ansehen",
    similar: "Weitere Stücke",
    alsoLike: "Vielleicht gefällt dir auch",
    previousImage: "Vorheriges Bild",
    nextImage: "Nächstes Bild",
  },
} as const;

export default function Page() {
  const params = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { products, loading } = useProducts();
  const t = copy[language];
  const product = products.find((item) => item.slug === params.slug);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    setActiveImage(product?.image ?? null);
  }, [product?.slug, product?.image]);

  if (!product && loading) {
    return <main className="min-h-screen bg-black px-4 py-24 text-neutral-500 sm:px-6 sm:py-32">{t.loading}</main>;
  }

  if (!product) {
    return <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-32"><h1 className="text-4xl font-black uppercase sm:text-5xl">{t.notFound}</h1></main>;
  }

  const currentImage = activeImage ?? product.image;
  const currentIndex = Math.max(0, product.images.indexOf(currentImage));
  const hasMultipleImages = product.images.length > 1;
  const isAvailable = product.status === "Available";
  const productCategoryId = product.categoryId || categoryIdFromName(product.category);

  const goToImage = (direction: number) => {
    const nextIndex = (currentIndex + direction + product.images.length) % product.images.length;
    setActiveImage(product.images[nextIndex]);
  };

  const similarProducts = products
    .filter((item) => item.slug !== product.slug && item.status === "Available")
    .sort((a, b) => {
      const aId = a.categoryId || categoryIdFromName(a.category);
      const bId = b.categoryId || categoryIdFromName(b.category);
      return Number(bId === productCategoryId) - Number(aId === productCategoryId);
    })
    .slice(0, 3);

  const name = language === "de" ? product.nameDe : product.name;
  const category = language === "de" ? product.categoryDe : product.category;
  const price = formatProductPrice(language === "de" ? product.priceDe : product.price);
  const status = language === "de" ? product.statusDe : product.status;
  const material = language === "de" ? product.materialDe : product.material;
  const colors = language === "de" ? product.colorsDe : product.colors;
  const size = language === "de" ? product.sizeDe : product.size;
  const description = language === "de" ? product.descriptionDe : product.description;
  const story = language === "de" ? product.storyDe : product.story;
  const imageAlt = language === "de"
    ? `${name} – ${category} aus Borosilikatglas von FRGLASS`
    : `${name} – ${category} in borosilicate glass by FRGLASS`;

  return (
    <main className="min-h-screen overflow-x-hidden bg-black px-4 py-20 text-white sm:px-6 sm:py-28 lg:py-32">
      <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-14">
        <div className="min-w-0">
          <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 p-2 sm:h-[560px] sm:rounded-3xl sm:p-4 lg:h-[620px] xl:h-[720px]">
            <ProductPicture src={currentImage} alt={imageAlt} sizes="(min-width: 1024px) 52vw, 100vw" className="object-contain p-2 sm:p-4" priority />
            <div className={`absolute left-3 top-3 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] backdrop-blur sm:left-5 sm:top-5 sm:text-xs ${isAvailable ? "border-orange-300/40 bg-orange-300/10 text-orange-200" : "border-white/15 bg-black/70 text-neutral-300"}`}>{status}</div>
            {hasMultipleImages && <><button type="button" onClick={() => goToImage(-1)} aria-label={t.previousImage} className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/70 text-xl text-white backdrop-blur transition hover:border-orange-300 hover:text-orange-300 sm:left-4 sm:h-12 sm:w-12 sm:text-2xl">‹</button><button type="button" onClick={() => goToImage(1)} aria-label={t.nextImage} className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/70 text-xl text-white backdrop-blur transition hover:border-orange-300 hover:text-orange-300 sm:right-4 sm:h-12 sm:w-12 sm:text-2xl">›</button></>}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-4">
            {product.images.map((image, index) => <button type="button" key={image} onClick={() => setActiveImage(image)} className={`relative flex h-24 items-center justify-center overflow-hidden rounded-xl border bg-neutral-950 p-1 transition hover:border-orange-300 sm:h-36 sm:rounded-2xl sm:p-2 lg:h-32 xl:h-40 ${currentImage === image ? "border-orange-300" : "border-white/10"}`}><ProductPicture src={image} alt={`${imageAlt} – ${language === "de" ? "Ansicht" : "view"} ${index + 1}`} sizes="(min-width: 1024px) 17vw, 33vw" className="object-contain p-1 sm:p-2" /></button>)}
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-center lg:py-6 xl:py-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:mb-4 sm:text-sm sm:tracking-[0.5em]">{status}</p>
          <h1 className="break-normal hyphens-none text-3xl font-black uppercase leading-[0.98] sm:text-5xl lg:text-[2.65rem] xl:text-6xl">{name}</h1>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-neutral-500 sm:text-sm sm:tracking-[0.28em]">{category}</p>
          {price && <p className="mt-6 text-3xl text-neutral-100 sm:mt-8">{price}</p>}
          {description && <p className="mt-6 max-w-xl text-base leading-7 text-neutral-300 sm:mt-8 sm:text-lg sm:leading-8 lg:text-base lg:leading-7 xl:text-lg xl:leading-8">{description}</p>}

          <div className={`mt-8 rounded-3xl border p-5 sm:p-6 ${isAvailable ? "border-orange-300/20 bg-orange-300/[0.05]" : "border-white/10 bg-white/[0.03]"}`}>
            <p className={`text-xs font-black uppercase tracking-[0.28em] ${isAvailable ? "text-orange-300" : "text-neutral-400"}`}>{isAvailable ? t.availableTitle : t.unavailableTitle}</p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-300 sm:text-base sm:leading-7">{isAvailable ? t.availableText : t.unavailableText}</p>
            {isAvailable ? (
              <Link href={`/contact?product=${encodeURIComponent(name)}&slug=${encodeURIComponent(product.slug)}`} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-orange-300 px-6 py-4 text-center text-sm font-black uppercase tracking-widest text-black transition hover:bg-white sm:w-auto sm:px-8">{t.request} →</Link>
            ) : (
              <Link href="/shop" className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/15 px-6 py-4 text-center text-sm font-bold uppercase tracking-widest text-white transition hover:border-orange-300 hover:text-orange-300 sm:w-auto sm:px-8">{t.browseAvailable}</Link>
            )}
          </div>

          {story && <div className="mt-8 border-y border-white/10 py-6 sm:mt-10 sm:py-8"><h2 className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-orange-300 sm:text-sm sm:tracking-[0.4em]">{t.story}</h2><p className="leading-7 text-neutral-300 sm:leading-8 lg:text-[15px] xl:text-base">{story}</p></div>}

          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-6 text-neutral-300 sm:mt-8 sm:gap-x-8 lg:gap-x-5 xl:grid-cols-4 xl:gap-4">
            <div><p className="text-xs uppercase tracking-[0.22em] text-neutral-500">{t.material}</p><p className="mt-2 text-sm sm:text-base">{material}</p></div>
            <div><p className="text-xs uppercase tracking-[0.22em] text-neutral-500">{t.colors}</p><p className="mt-2 text-sm sm:text-base">{colors}</p></div>
            <div><p className="text-xs uppercase tracking-[0.22em] text-neutral-500">{t.size}</p><p className="mt-2 text-sm sm:text-base">{size}</p></div>
            <div><p className="text-xs uppercase tracking-[0.22em] text-neutral-500">{t.year}</p><p className="mt-2 text-sm sm:text-base">{product.year}</p></div>
          </div>
        </div>
      </section>

      {similarProducts.length > 0 && <section className="mx-auto mt-20 max-w-7xl sm:mt-28"><p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">{t.similar}</p><h2 className="mb-8 text-3xl font-black uppercase sm:mb-10 sm:text-4xl">{t.alsoLike}</h2><div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">{similarProducts.map((item) => { const itemName = language === "de" ? item.nameDe : item.name; const itemStatus = language === "de" ? item.statusDe : item.status; const itemPrice = formatProductPrice(language === "de" ? item.priceDe : item.price); const itemCategory = language === "de" ? item.categoryDe : item.category; const itemAlt = language === "de" ? `${itemName} – ${itemCategory} aus Borosilikatglas von FRGLASS` : `${itemName} – ${itemCategory} in borosilicate glass by FRGLASS`; return <Link key={item.slug} href={`/shop/${item.slug}`} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/20"><div className="relative h-[300px] bg-neutral-950 sm:h-[340px] xl:h-[360px]"><ProductPicture src={item.image} alt={itemAlt} sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-contain p-3 transition duration-700 group-hover:scale-[1.03]" /></div><div className="p-5 sm:p-6"><p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">{itemStatus}</p><h3 className="break-normal text-xl font-black uppercase leading-tight sm:text-2xl">{itemName}</h3>{itemPrice && <p className="mt-3 text-neutral-300">{itemPrice}</p>}</div></Link>; })}</div></section>}
    </main>
  );
}
