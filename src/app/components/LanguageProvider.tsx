"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "de" | "en";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const translations = {
  en: {
    nav: {
      gallery: "Gallery",
      studio: "Studio",
      shop: "Shop",
      journal: "Journal",
      about: "About",
      contact: "Contact",
      menu: "Menu",
      close: "Close",
    },
    hero: {
      eyebrow: "Handcrafted in Austria",
      subtitle: "Borosilicate Glass Art",
      text: "Born from fire. Inspired by the cosmos.",
      cta: "Explore Collection",
    },
    jewelry: {
      eyebrow: "Jewelry",
      title: "Wearable Glass Art",
      intro: "Handcrafted borosilicate pendants shaped by fire, color and precision.",
      itemTitle: "Handmade Glass",
      itemSubtitle: "Borosilicate Jewelry",
    },
    workshop: {
      eyebrow: "Workshop",
      title: "Born in the Flame",
      text: "Every piece begins with molten borosilicate glass, shaped by hand in the flame. No molds. No mass production. Every artwork is unique.",
    },
    studio: {
      eyebrow: "Studio",
      title: "Work. Create. Learn.",
      intro: "My plan is currently growing into an open borosilicate glass studio. The focus is on handmade glass art first — with the idea of offering open studio time, torch rental and small personal sessions in the future.",
      cards: [
        {
          title: "🔥 Future Torch Rental",
          text: "Planned: a professional workstation for independent flameworkers.",
        },
        {
          title: "🎓 Future Workshops",
          text: "Small personal learning sessions may become available later.",
        },
        {
          title: "🤝 Studio Community",
          text: "A place for exchange, ideas and a shared passion for glass and other forms of art.",
        },
        {
          title: "✨ Personal Guidance",
          text: "Possible one-on-one guidance in the future, depending on time and setup.",
        },
      ],
      vision: "The vision is to slowly grow this space into an open studio for exchange, learning and shared time at the flame — with possible torch rental and small personal sessions later on.",
      contactEyebrow: "Future Studio",
      contactTitle: "Interested in the future studio?",
      contactText: "Open studio time, torch rental and small sessions are planned for the future. If you are interested, send a message and we can stay in touch.",
      sendRequest: "Send Request",
      instagram: "Instagram",
      emailSubject: "Studio inquiry",
    },
    footer: {
      intro: "Borosilicate glass art, handmade in Austria. Jewelry, studio work and small flame-based workshops.",
      explore: "Explore",
      contact: "Contact",
      rights: "All rights reserved.",
      tagline: "Handcrafted borosilicate glass studio.",
    },
  },
  de: {
    nav: {
      gallery: "Galerie",
      studio: "Studio",
      shop: "Shop",
      journal: "Journal",
      about: "Über mich",
      contact: "Kontakt",
      menu: "Menü",
      close: "Schließen",
    },
    hero: {
      eyebrow: "Handgefertigt in Österreich",
      subtitle: "Borosilikat-Glaskunst",
      text: "Aus Feuer geboren. Vom Kosmos inspiriert.",
      cta: "Kollektion entdecken",
    },
    jewelry: {
      eyebrow: "Schmuck",
      title: "Tragbare Glaskunst",
      intro: "Handgefertigte Anhänger aus Borosilikatglas — geformt durch Feuer, Farbe und Präzision.",
      itemTitle: "Handgemachtes Glas",
      itemSubtitle: "Borosilikat-Schmuck",
    },
    workshop: {
      eyebrow: "Werkstatt",
      title: "In der Flamme geboren",
      text: "Jedes Stück beginnt mit erhitztem Borosilikatglas und wird von Hand in der Flamme geformt. Keine Formen. Keine Massenproduktion. Jedes Kunstwerk ist ein Unikat.",
    },
    studio: {
      eyebrow: "Studio",
      title: "Arbeiten. Erschaffen. Lernen.",
      intro: "Mein Plan wächst Schritt für Schritt zu einem offenen Studio für Borosilikatglas. Im Mittelpunkt steht zuerst handgemachte Glaskunst — mit der Idee, später offene Studiozeiten, Brennervermietung und kleine persönliche Sessions anzubieten.",
      cards: [
        {
          title: "🔥 Zukünftige Brennervermietung",
          text: "Geplant ist ein professioneller Arbeitsplatz für selbstständiges Arbeiten an der Flamme.",
        },
        {
          title: "🎓 Zukünftige Workshops",
          text: "Kleine persönliche Lerneinheiten könnten später angeboten werden.",
        },
        {
          title: "🤝 Studio-Community",
          text: "Ein Ort für Austausch, Ideen und die gemeinsame Leidenschaft für Glas und andere Kunstformen.",
        },
        {
          title: "✨ Persönliche Begleitung",
          text: "Später ist je nach Zeit und Ausstattung auch persönliche Einzelbegleitung denkbar.",
        },
      ],
      vision: "Die Vision ist, diesen Ort langsam zu einem offenen Studio für Austausch, Lernen und gemeinsame Zeit an der Flamme wachsen zu lassen — mit möglicher Brennervermietung und kleinen persönlichen Sessions.",
      contactEyebrow: "Zukünftiges Studio",
      contactTitle: "Interesse am zukünftigen Studio?",
      contactText: "Offene Studiozeiten, Brennervermietung und kleine Sessions sind für die Zukunft geplant. Wenn du Interesse hast, schreib mir und wir bleiben in Kontakt.",
      sendRequest: "Anfrage senden",
      instagram: "Instagram",
      emailSubject: "Studio-Anfrage",
    },
    footer: {
      intro: "Handgemachte Borosilikat-Glaskunst aus Österreich. Schmuck, Studioarbeiten und kleine Workshops an der Flamme.",
      explore: "Entdecken",
      contact: "Kontakt",
      rights: "Alle Rechte vorbehalten.",
      tagline: "Handgefertigte Borosilikat-Glaskunst.",
    },
  },
} as const;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("frglass-language");
    const browserLanguage = window.navigator.language.toLowerCase();
    const nextLanguage: Language =
      stored === "de" || stored === "en"
        ? stored
        : browserLanguage.startsWith("de")
          ? "de"
          : "en";

    setLanguageState(nextLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("frglass-language", language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
