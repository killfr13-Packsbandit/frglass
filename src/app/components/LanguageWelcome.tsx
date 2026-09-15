"use client";

import { useEffect, useState } from "react";
import { Language, useLanguage } from "./LanguageProvider";

const CONFIRMED_KEY = "frglass-language-confirmed";
const LANGUAGE_KEY = "frglass-language";

export default function LanguageWelcome() {
  const { setLanguage } = useLanguage();
  const [showChooser, setShowChooser] = useState(false);

  useEffect(() => {
    try {
      setShowChooser(window.localStorage.getItem(CONFIRMED_KEY) !== "yes");
    } catch {
      setShowChooser(true);
    }
  }, []);

  function chooseLanguage(language: Language) {
    setLanguage(language);
    try {
      window.localStorage.setItem(LANGUAGE_KEY, language);
      window.localStorage.setItem(CONFIRMED_KEY, "yes");
    } catch {
      // The choice still applies to this visit when browser storage is blocked.
    }
    setShowChooser(false);
  }

  if (!showChooser) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/95 px-6 py-6 backdrop-blur-xl">
      <div className="w-full max-w-xl text-center text-white">
        <img
          src="/logo.png"
          alt="FRGLASS logo"
          className="mx-auto mb-10 h-20 w-auto"
        />

        <p className="mb-4 text-sm font-bold uppercase tracking-[0.45em] text-orange-300">
          FRGLASS
        </p>

        <h1 className="text-4xl font-black uppercase tracking-[0.08em] sm:text-5xl">
          Sprache · Language
        </h1>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => chooseLanguage("de")}
            className="rounded-2xl border border-white/15 bg-white/5 px-8 py-6 text-left transition hover:-translate-y-1 hover:border-orange-300 hover:bg-orange-300/10"
          >
            <span className="block text-2xl font-black uppercase tracking-wider">
              Deutsch
            </span>
            <span className="mt-2 block text-sm text-neutral-400">
              Seite auf Deutsch
            </span>
          </button>

          <button
            type="button"
            onClick={() => chooseLanguage("en")}
            className="rounded-2xl border border-white/15 bg-white/5 px-8 py-6 text-left transition hover:-translate-y-1 hover:border-orange-300 hover:bg-orange-300/10"
          >
            <span className="block text-2xl font-black uppercase tracking-wider">
              English
            </span>
            <span className="mt-2 block text-sm text-neutral-400">
              View in English
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
