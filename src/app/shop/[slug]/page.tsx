"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { products } from "../../products";
import { siteConfig } from "../../siteConfig";
import { useLanguage } from "../../components/LanguageProvider";

const copy = {
  en: {
    notFound: "Piece not found",
    story: "Story",
    material: "Material",
    colors: "Colors",
    size: "Size",
    year: "Year",
    request: "Request This Piece",
    subject: "Request",
    similar: "Similar Pieces",
    alsoLike: "You may also like",
  },
  de: {
    notFound: "Stück nicht gefunden",
    story: "Geschichte",
    material: "Material",
    colors: "Farben",
    size: "Größe",
    year: "Jahr",
    request: "Dieses Stück anfragen",
    subject: "Anfrage",
    similar: "Ähnliche Stücke",
    alsoLike: "Das könnte dir auch gefallen",
  },
} as const;

export default function Page() {
  const params = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const t = copy[language];
  const product = products.find((item) => item.slug === params.slug);

  if (!product) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <h1 className="text-5xl font-black uppercase">{t.notFound}</h1>
      </main>
    );
  }

  const similarProducts = products
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3);

  const name = language === "de" ? product.nameDe : product.name;
  const category = language === "de" ? product.categoryDe : product.category;
  const price = language === "de" ? product.priceDe : product.price;
  const status = language === "de" ? product.statusDe : product.status;
  const material = language === "de" ? product.materialDe : product.material;
  const colors = language === "de" ? product.colorsDe : product.colors;
  const size = language === "de" ? product.sizeDe : product.size;
  const description = language === "de" ? product.descriptionDe : product.description;
  const story = language === "de" ? product.storyDe : product.story;

  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <section className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img
              src={product.image}
              alt={name}
              className="h-[720px] w-full object-cover"
            />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {product.images.map((image) => (
              <div
                key={image}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <img
                  src={image}
                  alt={name}
                  className="h-40 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
            {status}
          </p>

          <h1 className="text-6xl font-black uppercase leading-tight">
            {name}
          </h1>

          <p className="mt-4 text-sm font-bold uppercase tracking-[0.3em] text-neutral-500">
            {category}
          </p>

          <p className="mt-8 text-3xl text-neutral-100">{price}</p>

          <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-300">
            {description}
          </p>

          <div className="mt-10 border-y border-white/10 py-8">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.4em] text-orange-300">
              {t.story}
            </h2>

            <p className="leading-8 text-neutral-300">{story}</p>
          </div>

          <div className="mt-8 grid gap-4 text-neutral-300 sm:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">{t.material}</p>
              <p className="mt-2">{material}</p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">{t.colors}</p>
              <p className="mt-2">{colors}</p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">{t.size}</p>
              <p className="mt-2">{size}</p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">{t.year}</p>
              <p className="mt-2">{product.year}</p>
            </div>
          </div>

          <a
            href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`${t.subject} ${name}`)}`}
            className="mt-10 inline-block w-fit rounded-full border border-orange-300 px-8 py-4 font-bold uppercase tracking-widest text-orange-300 transition hover:bg-orange-300 hover:text-black"
          >
            {t.request}
          </a>
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-7xl">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
          {t.similar}
        </p>

        <h2 className="mb-10 text-4xl font-black uppercase">
          {t.alsoLike}
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {similarProducts.map((item) => {
            const itemName = language === "de" ? item.nameDe : item.name;
            const itemStatus = language === "de" ? item.statusDe : item.status;
            const itemPrice = language === "de" ? item.priceDe : item.price;

            return (
              <Link
                key={item.slug}
                href={`/shop/${item.slug}`}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/20"
              >
                <img
                  src={item.image}
                  alt={itemName}
                  className="h-[360px] w-full object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="p-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">
                    {itemStatus}
                  </p>

                  <h3 className="text-2xl font-black uppercase">
                    {itemName}
                  </h3>

                  <p className="mt-3 text-neutral-300">{itemPrice}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
