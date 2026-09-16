"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "../siteConfig";
import { translations, useLanguage } from "./LanguageProvider";

const navItems = [
  { href: "/gallery", label: "gallery" },
  { href: "/studio", label: "studio" },
  { href: "/shop", label: "shop" },
  { href: "/community", label: "community" },
  { href: "/about", label: "about" },
  { href: "/contact", label: "contact" },
] as const;

const adminItems = [
  { href: "/admin", label: "Admin" },
  { href: "/admin/products", label: "Produkte" },
  { href: "/admin/pages", label: "Inhalte" },
  { href: "/admin/gallery", label: "Bilder" },
  { href: "/admin/community", label: "Bewertungen" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = translations[language];
  const languageLabel = language === "de" ? "Sprache" : "Language";

  if (pathname.startsWith("/admin")) {
    return (
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/90 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:gap-5 sm:px-6">
          <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
            <span className="relative h-8 w-7 overflow-hidden">
              <img src="/logo.png" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-125 object-cover object-center" />
            </span>
            <span className="hidden text-sm font-black tracking-[0.2em] sm:block">FRGLASS</span>
          </Link>

          <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] p-1">
              {adminItems.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition sm:px-4 sm:text-xs ${active ? "bg-orange-300 text-black" : "text-neutral-300 hover:bg-white/10 hover:text-white"}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <Link href="/" className="shrink-0 rounded-full border border-white/15 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-300 transition hover:border-orange-300 hover:text-orange-300 sm:px-4 sm:text-xs">
            <span className="sm:hidden">↗</span>
            <span className="hidden sm:inline">Website ↗</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 lg:px-6 xl:px-8 xl:py-5">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 sm:gap-3"
          onClick={() => setMenuOpen(false)}
        >
          <span className="relative h-8 w-7 shrink-0 overflow-hidden sm:h-9 sm:w-8">
            <img
              src="/logo.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-125 object-cover object-center"
            />
          </span>
          <span className="truncate text-base font-black tracking-[0.22em] sm:text-xl sm:tracking-[0.3em]">
            {siteConfig.name}
          </span>
        </Link>

        <div className="hidden items-center gap-4 lg:flex xl:gap-6">
          <div className="flex gap-4 text-xs uppercase tracking-widest xl:gap-6 xl:text-sm">
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
              className={`rounded-full px-2.5 py-1.5 transition xl:px-3 ${language === "de" ? "bg-white text-black" : "text-neutral-300 hover:text-white"}`}
              aria-pressed={language === "de"}
            >
              DE
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-full px-2.5 py-1.5 transition xl:px-3 ${language === "en" ? "bg-white text-black" : "text-neutral-300 hover:text-white"}`}
              aria-pressed={language === "en"}
            >
              EN
            </button>
          </div>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 lg:hidden"
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
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-black/95 px-4 pb-6 pt-3 backdrop-blur-xl sm:px-6 lg:hidden">
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

          <div className="mt-5 flex items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">{languageLabel}</span>
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
