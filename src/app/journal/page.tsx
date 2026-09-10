"use client";

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
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <section className="mx-auto max-w-7xl">
        <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
          {t.eyebrow}
        </p>

        <h1 className="text-center text-5xl font-black uppercase md:text-6xl">
          {t.title}
        </h1>

        <p className="mx-auto mb-16 mt-6 max-w-2xl text-center text-neutral-300">
          {t.intro}
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {currentProduct && (
            <Link href={`/shop/${currentProduct.slug}`} className="block">
              <article className="h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300/60">
                <div className="flex h-[360px] items-center justify-center bg-neutral-950 p-3">
                  <img
                    key={currentProduct.image}
                    src={currentProduct.image}
                    alt={language === "de" ? currentProduct.nameDe : currentProduct.name}
                    className="h-full w-full object-contain transition-opacity duration-500"
                  />
                </div>

                <div className="p-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">
                    {t.pieces}
                  </p>

                  <h2 className="text-2xl font-black uppercase">
                    {t.newWork}
                  </h2>

                  <p className="mt-4 text-neutral-300">
                    {language === "de" ? currentProduct.nameDe : currentProduct.name} · {language === "de" ? currentProduct.priceDe : currentProduct.price}
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
              <article className="h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300/60">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-[360px] w-full object-cover"
                />

                <div className="p-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">
                    {post.category}
                  </p>

                  <h2 className="text-2xl font-black uppercase">
                    {post.title}
                  </h2>

                  <p className="mt-4 text-neutral-300">{post.excerpt}</p>

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
