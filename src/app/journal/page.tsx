"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { products } from "../products";
import { useLanguage } from "../components/LanguageProvider";

const posts = {
  en: [
    {
      title: "Behind the scenes",
      category: "Workshop",
      image: "/workshop/me1.png",
      excerpt: "A look at the torch, tools and the way the pieces are made.",
      href: "/journal/behind-the-scenes",
    },
    {
      title: "The workshop",
      category: "Studio",
      image: "/workshop/me2.jpg",
      excerpt: "A bit about the space, what I am building and what I would like to do with it later.",
      href: "/studio",
    },
  ],
  de: [
    {
      title: "Hinter den Kulissen",
      category: "Werkstatt",
      image: "/workshop/me1.png",
      excerpt: "Ein Blick auf Brenner, Werkzeuge und darauf, wie die Stücke entstehen.",
      href: "/journal/behind-the-scenes",
    },
    {
      title: "Die Werkstatt",
      category: "Studio",
      image: "/workshop/me2.jpg",
      excerpt: "Ein bisschen über den Raum, was gerade entsteht und was später daraus werden soll.",
      href: "/studio",
    },
  ],
} as const;

const copy = {
  en: {
    eyebrow: "Journal",
    title: "From the workshop",
    intro: "New pieces, process photos and small updates from the workshop.",
    readMore: "Read more",
    newWork: "New work",
    pieces: "Pieces",
    viewPiece: "View piece",
  },
  de: {
    eyebrow: "Journal",
    title: "Aus der Werkstatt",
    intro: "Neue Stücke, Bilder vom Prozess und kleine Updates aus der Werkstatt.",
    readMore: "Mehr lesen",
    newWork: "Neue Arbeiten",
    pieces: "Stücke",
    viewPiece: "Zum Stück",
  },
} as const;

function formatPrice(value: string) {
  const price = value.trim();
  return price.startsWith("€") ? price : `€${price}`;
}

export default function Page() {
  const { language } = useLanguage();
  const t = copy[language];
  const availableProducts = products.filter((product) => product.status === "Available");
  const [productIndex, setProductIndex] = useState(0);

  useEffect(() => {
    if (availableProducts.length <= 1) return;

    const interval = window.setInterval(() => {
      setProductIndex((current) => (current + 1) % availableProducts.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [availableProducts.length]);

  const currentProduct = availableProducts[productIndex % Math.max(availableProducts.length, 1)];

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-32">
      <section className="mx-auto max-w-7xl">
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">
          {t.eyebrow}
        </p>

        <h1 className="break-words text-center text-4xl font-black uppercase sm:text-5xl md:text-6xl">
          {t.title}
        </h1>

        <p className="mx-auto mb-12 mt-6 max-w-2xl text-center leading-7 text-neutral-300 sm:mb-16">
          {t.intro}
        </p>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {currentProduct && (
            <Link href={`/shop/${currentProduct.slug}`} className="block">
              <article className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300/60 sm:rounded-3xl">
                <div className="relative h-[300px] bg-neutral-950 sm:h-[360px]">
                  <Image
                    key={currentProduct.image}
                    src={currentProduct.image}
                    alt={language === "de" ? currentProduct.nameDe : currentProduct.name}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-contain p-3 transition-opacity duration-500"
                  />
                </div>

                <div className="p-5 sm:p-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">
                    {t.pieces}
                  </p>

                  <h2 className="text-xl font-black uppercase sm:text-2xl">
                    {t.newWork}
                  </h2>

                  <p className="mt-4 text-neutral-300">
                    {language === "de" ? currentProduct.nameDe : currentProduct.name} · {formatPrice(language === "de" ? currentProduct.priceDe : currentProduct.price)}
                  </p>

                  <p className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-orange-300">
                    {t.viewPiece}
                  </p>
                </div>
              </article>
            </Link>
          )}

          {posts[language].map((post) => (
            <Link key={post.title} href={post.href} className="block">
              <article className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300/60 sm:rounded-3xl">
                <div className="relative h-[300px] sm:h-[360px]">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="p-5 sm:p-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">
                    {post.category}
                  </p>

                  <h2 className="break-words text-xl font-black uppercase sm:text-2xl">
                    {post.title}
                  </h2>

                  <p className="mt-4 leading-7 text-neutral-300">{post.excerpt}</p>

                  <p className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-orange-300">
                    {t.readMore}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
