import Link from "next/link";
import { siteConfig } from "../siteConfig";
import { products } from "../products";


export default function InquiryShop() {
  return (
    <section className="bg-black px-6 py-32 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
          Shop
        </p>

        <h1 className="text-center text-6xl font-black uppercase">
          Available Pieces
        </h1>

        <p className="mx-auto mt-6 mb-16 max-w-2xl text-center text-neutral-300">
          Every piece is handmade and one of a kind. Instead of checkout, send a
          request and we will arrange payment and shipping personally.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {products.map((product) => (
            <Link
  href={`/shop/${product.slug}`}
  key={product.name}
  className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/20"
>
              <img
                src={product.image}
                alt={product.name}
                className="h-[460px] w-full object-cover"
              />

              <div className="p-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">
                  {product.status}
                </p>

                <h2 className="text-2xl font-black uppercase">
                  {product.name}
                </h2>

                <p className="mt-3 text-neutral-300">{product.price}</p>

                <a
                  href={`mailto:${siteConfig.email}?subject=Request%20${encodeURIComponent(
  product.name
)}`}
                  className="mt-6 inline-block rounded-full border border-orange-300 px-6 py-3 text-sm font-bold uppercase tracking-widest text-orange-300 transition hover:bg-orange-300 hover:text-black"
                >
                  Request Piece
                </a>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}