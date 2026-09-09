"use client";

import Link from "next/link";
import { useState } from "react";
import { siteConfig } from "../siteConfig";
import { translations, useLanguage } from "./LanguageProvider";

const navItems = [
  { href: "/gallery", label: "gallery" },
  { href: "/studio", label: "studio" },
  { href: "/shop", label: "shop" },
  { href: "/journal", label: "journal" },
  { href: "/about", label: "about" },
  { href: "/contact", label: "contact" },
] as const;

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = translations[language];

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <Link
          href="/"
          className="text-lg font-black tracking-[0.28em] sm:text-xl sm:tracking-[0.3em]"
          onClick={() => setMenuOpen(false)}
        >
          {siteConfig.name}
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <div className="flex gap-7 text-sm uppercase tracking-widest">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-orange-300">
                {t.nav[item.label]}
              </Link>
            ))}
          </div>

          <div className="flex items-center rounded-full border border-white/15 bg-white/5 p-1 text-xs font-bold tracking-wider">
            <button
              type="button"
              onClick={() => setLanguage("de")}
              className={`rounded-full px-3 py-1.5 transition ${language === "de" ? "bg-white text-black" : "text-neutral-300 hover:text-white"}`}
              aria-pressed={language === "de"}
            >
              DE
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-full px-3 py-1.5 transition ${language === "en" ? "bg-white text-black" : "text-neutral-300 hover:text-white"}`}
              aria-pressed={language === "en"}
            >
              EN
            </button>
          </div>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? t.nav.close : t.nav.menu}
          aria-expanded={menuOpen}
        >
          <span className="relative block h-4 w-5">
            <span className={`absolute left-0 top-0 block h-0.5 w-5 bg-white transition ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`absolute left-0 top-[7px] block h-0.5 w-5 bg-white transition ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 top-[14px] block h-0.5 w-5 bg-white transition ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-black/95 px-5 pb-6 pt-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-white/10 py-4 text-sm font-bold uppercase tracking-[0.2em] transition hover:text-orange-300"
                onClick={() => setMenuOpen(false)}
              >
                {t.nav[item.label]}
              </Link>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Language</span>
            <div className="flex items-center rounded-full border border-white/15 bg-white/5 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage("de")}
                className={`rounded-full px-4 py-2 ${language === "de" ? "bg-white text-black" : "text-neutral-300"}`}
              >
                DE
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-full px-4 py-2 ${language === "en" ? "bg-white text-black" : "text-neutral-300"}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
