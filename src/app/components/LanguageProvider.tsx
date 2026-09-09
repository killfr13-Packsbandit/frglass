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
      eyebrow: "Handmade in Austria",
      subtitle: "Borosilicate Glass",
      text: "Handmade glass pieces, jewelry and experiments from my workshop.",
      cta: "See the work",
    },
    jewelry: {
      eyebrow: "Jewelry",
      title: "Glass to wear",
      intro: "Handmade pendants from borosilicate glass. Each piece is made individually at the torch.",
      itemTitle: "Handmade glass",
      itemSubtitle: "Borosilicate jewelry",
    },
    workshop: {
      eyebrow: "Workshop",
      title: "At the torch",
      text: "I make each piece by hand from borosilicate glass at the torch. Some start with a clear idea, others develop while I work.",
    },
    studio: {
      eyebrow: "Studio",
      title: "My workshop",
      intro: "FRGLASS is my workshop for borosilicate glass. Right now the focus is on making my own work. In the future I would also like to make the space available for other glassworkers and small sessions.",
      cards: [
        {
          title: "Torch rental",
          text: "A properly equipped workstation for experienced glassworkers is planned for the future.",
        },
        {
          title: "Small workshops",
          text: "I may offer small, personal sessions once the setup is ready.",
        },
        {
          title: "Exchange",
          text: "The workshop should also be a place to meet, share ideas and work together.",
        },
        {
          title: "One-to-one sessions",
          text: "Individual sessions may also be possible later, depending on time and setup.",
        },
      ],
      vision: "Over time I would like to open the workshop a little more — for exchange, shared bench time and small sessions. For now, I am building it step by step.",
      contactEyebrow: "Studio",
      contactTitle: "Interested in the studio?",
      contactText: "If you are interested in future torch rental, workshop time or a small session, send me a message.",
      sendRequest: "Send a message",
      instagram: "Instagram",
      emailSubject: "Studio inquiry",
    },
    footer: {
      intro: "Handmade borosilicate glass from Austria — jewelry, objects and studio work.",
      explore: "Explore",
      contact: "Contact",
      rights: "All rights reserved.",
      tagline: "Borosilicate glass, handmade in Austria.",
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
      eyebrow: "Handgemacht in Österreich",
      subtitle: "Borosilikatglas",
      text: "Handgemachte Glasstücke, Schmuck und Experimente aus meiner Werkstatt.",
      cta: "Arbeiten ansehen",
    },
    jewelry: {
      eyebrow: "Schmuck",
      title: "Glas zum Tragen",
      intro: "Handgemachte Anhänger aus Borosilikatglas. Jedes Stück entsteht einzeln am Brenner.",
      itemTitle: "Handgemachtes Glas",
      itemSubtitle: "Borosilikat-Schmuck",
    },
    workshop: {
      eyebrow: "Werkstatt",
      title: "Am Brenner",
      text: "Ich fertige jedes Stück von Hand aus Borosilikatglas am Brenner. Manche Arbeiten sind vorher geplant, andere entwickeln sich erst beim Machen.",
    },
    studio: {
      eyebrow: "Studio",
      title: "Meine Werkstatt",
      intro: "FRGLASS ist meine Werkstatt für Borosilikatglas. Im Moment geht es vor allem um meine eigenen Arbeiten. Später möchte ich den Platz auch für andere Glasbläser und kleine Sessions öffnen.",
      cards: [
        {
          title: "Brennervermietung",
          text: "Für die Zukunft ist ein gut ausgestatteter Arbeitsplatz für erfahrene Glasbläser geplant.",
        },
        {
          title: "Kleine Workshops",
          text: "Wenn alles fertig eingerichtet ist, möchte ich auch kleine persönliche Workshops anbieten.",
        },
        {
          title: "Austausch",
          text: "Die Werkstatt soll auch ein Ort sein, an dem man sich trifft, Ideen austauscht und gemeinsam arbeitet.",
        },
        {
          title: "Einzel-Sessions",
          text: "Je nach Zeit und Ausstattung sollen später auch einzelne persönliche Sessions möglich sein.",
        },
      ],
      vision: "Mit der Zeit möchte ich die Werkstatt etwas mehr öffnen — für Austausch, gemeinsame Zeit am Brenner und kleine Sessions. Im Moment entsteht das Ganze Schritt für Schritt.",
      contactEyebrow: "Studio",
      contactTitle: "Interesse am Studio?",
      contactText: "Wenn dich spätere Brennervermietung, Werkstattzeit oder eine kleine Session interessiert, schreib mir einfach.",
      sendRequest: "Nachricht senden",
      instagram: "Instagram",
      emailSubject: "Studio-Anfrage",
    },
    footer: {
      intro: "Handgemachtes Borosilikatglas aus Österreich — Schmuck, Objekte und Arbeiten aus der Werkstatt.",
      explore: "Entdecken",
      contact: "Kontakt",
      rights: "Alle Rechte vorbehalten.",
      tagline: "Borosilikatglas, handgemacht in Österreich.",
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
