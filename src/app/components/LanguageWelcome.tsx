"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { KeyboardEvent, useEffect, useRef, useSyncExternalStore } from "react";
import {
  LANGUAGE_KEY,
  Language,
  useLanguage,
} from "./LanguageProvider";

const CONFIRMED_KEY = "frglass-language-confirmed";
const CONFIRMED_CHANGE_EVENT = "frglass-language-confirmed-change";
let memoryConfirmed = false;

function readConfirmed() {
  if (memoryConfirmed) return true;
  try {
    return window.localStorage.getItem(CONFIRMED_KEY) === "yes";
  } catch {
    return false;
  }
}

function subscribeToConfirmation(callback: () => void) {
  const handleStorage = () => {
    memoryConfirmed = false;
    callback();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(CONFIRMED_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CONFIRMED_CHANGE_EVENT, callback);
  };
}

function serverConfirmed() {
  return true;
}

export default function LanguageWelcome() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const confirmed = useSyncExternalStore(
    subscribeToConfirmation,
    readConfirmed,
    serverConfirmed,
  );
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const showChooser = !pathname.startsWith("/admin") && !confirmed;

  useEffect(() => {
    if (!showChooser) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [showChooser]);

  function chooseLanguage(language: Language) {
    setLanguage(language);
    try {
      window.localStorage.setItem(LANGUAGE_KEY, language);
      window.localStorage.setItem(CONFIRMED_KEY, "yes");
    } catch {
      // The choice still applies to this visit when browser storage is blocked.
    }
    memoryConfirmed = true;
    window.dispatchEvent(new Event(CONFIRMED_CHANGE_EVENT));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      chooseLanguage(language);
      return;
    }
    if (event.key !== "Tab") return;

    const controls = dialogRef.current?.querySelectorAll<HTMLButtonElement>(
      "button:not([disabled])",
    );
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!showChooser) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/95 px-6 py-6 backdrop-blur-xl">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-dialog-title"
        onKeyDown={handleKeyDown}
        className="w-full max-w-xl text-center text-white"
      >
        <Image
          src="/logo-mark.webp"
          alt="FRGLASS Logo"
          width={148}
          height={256}
          priority
          className="mx-auto mb-8 h-20 w-auto"
        />

        <p className="mb-4 text-sm font-bold uppercase tracking-[0.45em] text-orange-300">
          FRGLASS
        </p>

        <h2 id="language-dialog-title" className="text-4xl font-black uppercase tracking-[0.08em] sm:text-5xl">
          Sprache · Language
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <button
            ref={firstButtonRef}
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
