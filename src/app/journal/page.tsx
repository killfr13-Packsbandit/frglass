"use client";

import Link from "next/link";
import { useLanguage } from "../components/LanguageProvider";

const posts = {
  en: [
    {
      title: "New work",
      category: "Pieces",
      image: "/jewelry/leaf1.jpg",
      excerpt: "A few recent pieces, colors and shapes from the workshop.",
    },
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
    },
  ],
  de: [
    {
      title: "Neue Arbeiten",
      category: "Stücke",
      image: "/jewelry/leaf1.jpg",
      excerpt: "Ein paar neue Stücke, Farben und Formen aus der Werkstatt.",
    },
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
    },
  ],
} as const;

const copy = {
  en: {
    eyebrow: "Journal",
    title: "From the workshop",
    intro: "New pieces, process photos and small updates from the workshop.",
    readMore: "Read more",
  },
  de: {
    eyebrow: "Journal",
    title: "Aus der Werkstatt",
    intro: "Neue Stücke, Bilder vom Prozess und kleine Updates aus der Werkstatt.",
    readMore: "Mehr lesen",
  },
} as const;

export default function Page() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <section className="mx-auto max-w-7xl">
        <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
          {t.eyebrow}
        </p>

        <h1 className="text-center text-6xl font-black uppercase">
          {t.title}
        </h1>

        <p className="mx-auto mb-16 mt-6 max-w-2xl text-center text-neutral-300">
          {t.intro}
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {posts[language].map((post) => {
            const Card = (
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

                  {"href" in post && post.href && (
                    <p className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-orange-300">
                      {t.readMore}
                    </p>
                  )}
                </div>
              </article>
            );

            if ("href" in post && post.href) {
              return (
                <Link key={post.title} href={post.href}>
                  {Card}
                </Link>
              );
            }

            return <div key={post.title}>{Card}</div>;
          })}
        </div>
      </section>
    </main>
  );
}
