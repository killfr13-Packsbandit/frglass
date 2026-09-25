import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  description: "Die angeforderte Seite wurde nicht gefunden.",
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-[75vh] items-center bg-black px-5 py-32 text-white sm:px-8">
      <section className="mx-auto w-full max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.45em] text-orange-300">
          Fehler 404 · Error 404
        </p>
        <h1 className="mt-5 text-4xl font-black uppercase leading-tight sm:text-6xl">
          Seite nicht gefunden
        </h1>
        <p className="mt-4 text-xl font-bold text-neutral-400">Page not found</p>
        <p className="mx-auto mt-7 max-w-xl leading-7 text-neutral-400">
          Diese Adresse gibt es nicht oder sie wurde verschoben. The requested page does not
          exist or has been moved.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-full bg-white px-7 py-3.5 text-sm font-black uppercase tracking-wider text-black transition hover:bg-orange-300"
          >
            Zur Startseite · Home
          </Link>
          <Link
            href="/shop"
            className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-bold uppercase tracking-wider transition hover:border-orange-300 hover:text-orange-300"
          >
            Shop ansehen · View shop
          </Link>
        </div>
      </section>
    </main>
  );
}
