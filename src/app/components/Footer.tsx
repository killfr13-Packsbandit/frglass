"use client";

import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "../siteConfig";
import { translations, useLanguage } from "./LanguageProvider";

const footerLinks = [
  { href: "/gallery", label: "gallery" },
  { href: "/studio", label: "studio" },
  { href: "/shop", label: "shop" },
  { href: "/journal", label: "journal" },
  { href: "/about", label: "about" },
  { href: "/contact", label: "contact" },
] as const;

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="border-t border-white/10 bg-black px-6 py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-3">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-[0.3em]">
            {siteConfig.name}
          </h2>

          <Link
            href="/admin/behind-the-scenes"
            aria-label="Admin"
            className="mt-5 inline-flex opacity-25 transition hover:opacity-70 focus:opacity-70"
          >
            <span className="relative block h-8 w-8 overflow-hidden rounded-full">
              <Image
                src="/logo.png"
                alt=""
                fill
                sizes="32px"
                className="scale-125 object-cover object-center"
              />
            </span>
          </Link>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-orange-300">
            {t.footer.explore}
          </h3>

          <div className="flex flex-col gap-3 text-neutral-300">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {t.nav[item.label]}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-orange-300">
            {t.footer.contact}
          </h3>

          <div className="flex flex-col gap-3 text-neutral-300">
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            <a href={siteConfig.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-5 border-t border-white/10 pt-8 text-sm text-neutral-500 md:flex-row md:items-center">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <p>© 2026 FRGLASS. {t.footer.rights}</p>
          <div className="flex gap-4">
            <Link className="transition hover:text-orange-300" href="/impressum">
              {language === "de" ? "Impressum" : "Legal notice"}
            </Link>
            <Link className="transition hover:text-orange-300" href="/datenschutz">
              {language === "de" ? "Datenschutz" : "Privacy"}
            </Link>
          </div>
        </div>
        <p>{t.footer.tagline}</p>
      </div>
    </footer>
  );
}
