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
      text: "Handmade borosilicate glass, jewelry and small experiments.",
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
      eyebrow: "Workspace",
      title: "The workshop",
      intro: "I work with borosilicate glass in a small workshop in Austria. Right now I mainly use the space for my own pieces. Later I would like to make some bench time available to experienced glassworkers and maybe offer small sessions.",
      cards: [
        {
          title: "Torch rental",
          text: "A properly equipped workstation for experienced glassworkers is something I would like to offer later.",
        },
        {
          title: "Small workshops",
          text: "Small personal sessions may also become possible once the setup is ready.",
        },
        {
          title: "Exchange",
          text: "I would like the space to be useful for meeting other glassworkers, sharing ideas and working together.",
        },
        {
          title: "One-to-one sessions",
          text: "Individual sessions could also be possible later, depending on time and setup.",
        },
      ],
      vision: "The workshop is still developing. For now I use it for my own work and improve the setup step by step.",
      contactEyebrow: "Workshop",
      contactTitle: "Interested in the space?",
      contactText: "If future torch rental, workshop time or a small session interests you, send me a message.",
      sendRequest: "Send a message",
      instagram: "Instagram",
      emailSubject: "Workshop inquiry",
    },
    footer: {
      intro: "FRGLASS is the name I use online for my handmade borosilicate glass.",
      explore: "Explore",
      contact: "Contact",
      rights: "All rights reserved.",
      tagline: "Handmade borosilicate glass from Austria.",
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
      text: "Handgemachtes Borosilikatglas, Schmuck und kleine Experimente.",
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
      eyebrow: "Werkstatt",
      title: "Der Arbeitsplatz",
      intro: "Ich arbeite in einer kleinen Werkstatt in Österreich mit Borosilikatglas. Im Moment nutze ich den Platz hauptsächlich für meine eigenen Arbeiten. Später möchte ich eventuell Arbeitsplätze für erfahrene Glasbläser anbieten und kleine Sessions machen.",
      cards: [
        {
          title: "Brennervermietung",
          text: "Einen gut ausgestatteten Arbeitsplatz für erfahrene Glasbläser würde ich später gerne anbieten.",
        },
        {
          title: "Kleine Workshops",
          text: "Wenn alles passend eingerichtet ist, könnten auch kleine persönliche Sessions dazukommen.",
        },
        {
          title: "Austausch",
          text: "Der Platz soll auch für Austausch mit anderen Glasbläsern, Ideen und gemeinsames Arbeiten offen sein.",
        },
        {
          title: "Einzel-Sessions",
          text: "Je nach Zeit und Ausstattung könnten später auch einzelne persönliche Sessions möglich sein.",
        },
      ],
      vision: "Die Werkstatt ist noch im Aufbau. Im Moment nutze ich sie für meine eigenen Arbeiten und verbessere die Ausstattung Schritt für Schritt.",
      contactEyebrow: "Werkstatt",
      contactTitle: "Interesse am Platz?",
      contactText: "Wenn dich spätere Brennervermietung, Werkstattzeit oder eine kleine Session interessiert, schreib mir einfach.",
      sendRequest: "Nachricht senden",
      instagram: "Instagram",
      emailSubject: "Werkstatt-Anfrage",
    },
    footer: {
      intro: "FRGLASS ist der Name, unter dem ich meine handgemachten Glasarbeiten online zeige.",
      explore: "Entdecken",
      contact: "Kontakt",
      rights: "Alle Rechte vorbehalten.",
      tagline: "Handgemachtes Borosilikatglas aus Österreich.",
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
