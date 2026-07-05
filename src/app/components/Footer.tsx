import { siteConfig } from "../siteConfig";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-3">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-[0.3em]">
            {siteConfig.name}
          </h2>

          <p className="mt-4 max-w-sm text-neutral-400">
            Borosilicate glass art, handmade in Austria. Jewelry, studio work
            and small flame-based workshops.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-orange-300">
            Explore
          </h3>

          <div className="flex flex-col gap-3 text-neutral-300">
            <Link href="/gallery">Gallery</Link>
            <Link href="/studio">Studio</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/journal">Journal</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-orange-300">
            Contact
          </h3>

          <div className="flex flex-col gap-3 text-neutral-300">
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            <a href={siteConfig.instagram} target="_blank">
  Instagram
</a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-4 border-t border-white/10 pt-8 text-sm text-neutral-500 md:flex-row">
        <p>© 2026 FRGLASS. All rights reserved.</p>
        <p>Handcrafted borosilicate glass studio.</p>
      </div>
    </footer>
  );
}