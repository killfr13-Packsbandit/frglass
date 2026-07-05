import Link from "next/link";
import { siteConfig } from "../siteConfig";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">

        <Link
          href="/"
          className="text-xl font-black tracking-[0.3em]"
        >
          {siteConfig.name}
        </Link>

        <div className="hidden gap-8 uppercase tracking-widest text-sm md:flex">

          <Link href="/gallery">Gallery</Link>

          <Link href="/studio">Studio</Link>

          <Link href="/shop">Shop</Link>

          <Link href="/journal">Journal</Link>

          <Link href="/about">About</Link>

          <Link href="/contact">Contact</Link>

        </div>

      </div>
    </nav>
  );
}