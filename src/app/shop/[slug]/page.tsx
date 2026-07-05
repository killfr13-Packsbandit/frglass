import Link from "next/link";
import { products } from "../../products";
import { siteConfig } from "../../siteConfig";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <h1 className="text-5xl font-black uppercase">Piece not found</h1>
      </main>
    );
  }
const similarProducts = products
  .filter((item) => item.slug !== product.slug)
  .slice(0, 3);

  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <section className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img
              src={product.image}
              alt={product.name}
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
                  alt={product.name}
                  className="h-40 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
            {product.status}
          </p>

          <h1 className="text-6xl font-black uppercase leading-tight">
            {product.name}
          </h1>

          <p className="mt-4 text-sm font-bold uppercase tracking-[0.3em] text-neutral-500">
            {product.category}
          </p>

          <p className="mt-8 text-3xl text-neutral-100">{product.price}</p>

          <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-300">
            {product.description}
          </p>

          <div className="mt-10 border-y border-white/10 py-8">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.4em] text-orange-300">
              Story
            </h2>

            <p className="leading-8 text-neutral-300">{product.story}</p>
          </div>

          <div className="mt-8 grid gap-4 text-neutral-300 sm:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
                Material
              </p>
              <p className="mt-2">{product.material}</p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
                Colors
              </p>
              <p className="mt-2">{product.colors}</p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
                Size
              </p>
              <p className="mt-2">{product.size}</p>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
                Year
              </p>
              <p className="mt-2">{product.year}</p>
            </div>
          </div>

          <a
            href={`mailto:${siteConfig.email}?subject=Request%20${encodeURIComponent(
              product.name
            )}`}
            className="mt-10 inline-block w-fit rounded-full border border-orange-300 px-8 py-4 font-bold uppercase tracking-widest text-orange-300 transition hover:bg-orange-300 hover:text-black"
          >
            Request This Piece
          </a>
        </div>
      </section>
      <section className="mx-auto mt-28 max-w-7xl">
  <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
    Similar Pieces
  </p>

  <h2 className="mb-10 text-4xl font-black uppercase">
    You may also like
  </h2>

  <div className="grid gap-8 md:grid-cols-3">
    {similarProducts.map((item) => (
      <Link
        key={item.slug}
        href={`/shop/${item.slug}`}
        className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/20"
      >
        <img
          src={item.image}
          alt={item.name}
          className="h-[360px] w-full object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="p-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">
            {item.status}
          </p>

          <h3 className="text-2xl font-black uppercase">
            {item.name}
          </h3>

          <p className="mt-3 text-neutral-300">{item.price}</p>
        </div>
      </Link>
    ))}
  </div>
</section>
    </main>
  );
}