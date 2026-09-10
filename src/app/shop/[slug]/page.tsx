"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductPicture from "../../components/ProductPicture";
import { useLanguage } from "../../components/LanguageProvider";
import { useProducts } from "../../components/useProducts";
import { formatProductPrice } from "../../productTypes";

const copy = {
  en: {
    loading: "Loading piece …",
    notFound: "Piece not found",
    story: "About this piece",
    material: "Material",
    colors: "Colors",
    year: "Year",
    request: "Ask about this piece",
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
    year: "Jahr",
    request: "Stück anfragen",
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

  const goToImage = (direction: number) => {
    const nextIndex = (currentIndex + direction + product.images.length) % product.images.length;
    setActiveImage(product.images[nextIndex]);
  };

  const similarProducts = products.filter((item) => item.slug !== product.slug && item.status === "Available").slice(0, 3);
  const name = language === "de" ? product.nameDe : product.name;
  const category = language === "de" ? product.categoryDe : product.category;
  const price = formatProductPrice(language === "de" ? product.priceDe : product.price);
  const status = language === "de" ? product.statusDe : product.status;
  const material = language === "de" ? product.materialDe : product.material;
  const colors = language === "de" ? product.colorsDe : product.colors;
  const description = language === "de" ? product.descriptionDe : product.description;
  const story = language === "de" ? product.storyDe : product.story;

  return (
    <main className="min-h-screen overflow-x-hidden bg-black px-4 py-24 text-white sm:px-6 sm:py-32">
      <section className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:gap-12">
        <div className="min-w-0">
          <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 p-2 sm:h-[560px] sm:rounded-3xl sm:p-4 lg:h-[720px]">
            <ProductPicture src={currentImage} alt={name} sizes="(min-width: 768px) 50vw, 100vw" className="object-contain p-2 sm:p-4" priority />
            {hasMultipleImages && <><button type="button" onClick={() => goToImage(-1)} aria-label={t.previousImage} className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/70 text-xl text-white backdrop-blur transition hover:border-orange-300 hover:text-orange-300 sm:left-4 sm:h-12 sm:w-12 sm:text-2xl">‹</button><button type="button" onClick={() => goToImage(1)} aria-label={t.nextImage} className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/70 text-xl text-white backdrop-blur transition hover:border-orange-300 hover:text-orange-300 sm:right-4 sm:h-12 sm:w-12 sm:text-2xl">›</button></>}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-4">
            {product.images.map((image) => <button type="button" key={image} onClick={() => setActiveImage(image)} className={`relative flex h-24 items-center justify-center overflow-hidden rounded-xl border bg-neutral-950 p-1 transition hover:border-orange-300 sm:h-40 sm:rounded-2xl sm:p-2 ${currentImage === image ? "border-orange-300" : "border-white/10"}`}><ProductPicture src={image} alt={name} sizes="(min-width: 768px) 16vw, 33vw" className="object-contain p-1 sm:p-2" /></button>)}
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:mb-4 sm:text-sm sm:tracking-[0.5em]">{status}</p>
          <h1 className="break-words text-3xl font-black uppercase leading-tight sm:text-5xl lg:text-6xl">{name}</h1>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-neutral-500 sm:text-sm sm:tracking-[0.3em]">{category}</p>
          {price && <p className="mt-6 text-3xl text-neutral-100 sm:mt-8">{price}</p>}
          {description && <p className="mt-6 max-w-xl text-base leading-7 text-neutral-300 sm:mt-8 sm:text-lg sm:leading-8">{description}</p>}

          {story && <div className="mt-8 border-y border-white/10 py-6 sm:mt-10 sm:py-8"><h2 className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-orange-300 sm:text-sm sm:tracking-[0.4em]">{t.story}</h2><p className="leading-7 text-neutral-300 sm:leading-8">{story}</p></div>}

          <div className="mt-6 grid gap-5 text-neutral-300 sm:mt-8 sm:grid-cols-3 sm:gap-4">
            <div><p className="text-xs uppercase tracking-[0.25em] text-neutral-500 sm:text-sm sm:tracking-[0.3em]">{t.material}</p><p className="mt-2">{material}</p></div>
            <div><p className="text-xs uppercase tracking-[0.25em] text-neutral-500 sm:text-sm sm:tracking-[0.3em]">{t.colors}</p><p className="mt-2">{colors}</p></div>
            <div><p className="text-xs uppercase tracking-[0.25em] text-neutral-500 sm:text-sm sm:tracking-[0.3em]">{t.year}</p><p className="mt-2">{product.year}</p></div>
          </div>

          <Link href={`/contact?product=${encodeURIComponent(name)}&slug=${encodeURIComponent(product.slug)}`} className="mt-8 inline-block w-full rounded-full border border-orange-300 px-6 py-4 text-center text-sm font-bold uppercase tracking-widest text-orange-300 transition hover:bg-orange-300 hover:text-black sm:mt-10 sm:w-fit sm:px-8">{t.request}</Link>
        </div>
      </section>

      {similarProducts.length > 0 && <section className="mx-auto mt-20 max-w-7xl sm:mt-28"><p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">{t.similar}</p><h2 className="mb-8 text-3xl font-black uppercase sm:mb-10 sm:text-4xl">{t.alsoLike}</h2><div className="grid gap-6 md:grid-cols-3 md:gap-8">{similarProducts.map((item) => { const itemName = language === "de" ? item.nameDe : item.name; const itemStatus = language === "de" ? item.statusDe : item.status; const itemPrice = formatProductPrice(language === "de" ? item.priceDe : item.price); return <Link key={item.slug} href={`/shop/${item.slug}`} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/20"><div className="relative h-[300px] bg-neutral-950 sm:h-[360px]"><ProductPicture src={item.image} alt={itemName} sizes="(min-width: 768px) 33vw, 100vw" className="object-contain p-3 transition duration-700 group-hover:scale-[1.03]" /></div><div className="p-5 sm:p-6"><p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">{itemStatus}</p><h3 className="break-words text-xl font-black uppercase sm:text-2xl">{itemName}</h3>{itemPrice && <p className="mt-3 text-neutral-300">{itemPrice}</p>}</div></Link>; })}</div></section>}
    </main>
  );
}
