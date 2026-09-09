"use client";

import { useEffect, useState } from "react";
import { Language, useLanguage } from "./LanguageProvider";

const CONFIRMED_KEY = "frglass-language-confirmed";
const LANGUAGE_KEY = "frglass-language";

export default function LanguageWelcome() {
  const { setLanguage } = useLanguage();
  const [showChooser, setShowChooser] = useState(false);

  useEffect(() => {
    const confirmed = window.localStorage.getItem(CONFIRMED_KEY);

    if (confirmed !== "yes") {
      setShowChooser(true);
    }
  }, []);

  function chooseLanguage(language: Language) {
    window.localStorage.setItem(LANGUAGE_KEY, language);
    window.localStorage.setItem(CONFIRMED_KEY, "yes");
    setLanguage(language);
    setShowChooser(false);
  }

  if (!showChooser) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 px-6 backdrop-blur-xl">
      <div className="w-full max-w-xl text-center text-white">
        <img
          src="/logo.png"
          alt="FRGLASS logo"
          className="mx-auto mb-10 h-20 w-auto"
        />

        <p className="mb-4 text-sm font-bold uppercase tracking-[0.45em] text-orange-300">
          Welcome · Willkommen
        </p>

        <h1 className="text-4xl font-black uppercase tracking-[0.08em] sm:text-5xl">
          Choose your language
        </h1>

        <p className="mt-3 text-lg text-neutral-400">
          Sprache auswählen
        </p>

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
              Website auf Deutsch anzeigen
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
              View the website in English
            </span>
          </button>
        </div>

        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-neutral-600">
          You can change the language anytime in the menu.
        </p>
      </div>
    </div>
  );
}
