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
      community: "Community",
      about: "About",
      contact: "Contact",
      menu: "Menu",
      close: "Close",
    },
    hero: {
      eyebrow: "Handmade on planet Earth",
      subtitle: "Borosilicate glass · Carinthia, Austria",
      text: "I’m Florian Robatsch, a glass artist from Carinthia. At the torch I turn borosilicate glass into one-of-a-kind jewelry, objects and whatever ideas happen to stick in my head.",
      cta: "See the work",
    },
    jewelry: {
      eyebrow: "Jewelry",
      title: "Glass to wear",
      intro: "Handmade borosilicate glass pendants from Austria. Every piece is made individually at the torch and is one of a kind.",
      itemTitle: "Handmade glass",
      itemSubtitle: "Borosilicate jewelry",
    },
    workshop: {
      eyebrow: "Workshop",
      title: "At the torch",
      text: "I make each piece by hand from borosilicate glass in my workshop in Carinthia. Some start with a clear idea, others develop while I work.",
    },
    studio: {
      eyebrow: "Workspace",
      title: "The workshop",
      intro: "My workshop in Carinthia is where glass rods and tubes become jewelry, small objects, experiments and one-off pieces. I work with borosilicate glass (COE 33), heating it to working temperature in an oxygen/gas flame and shaping it directly at the torch. For now the space is mainly set up for my own work; over time I would like to open it up step by step to other people interested in glass.",
      cards: [
        {
          title: "Torch space",
          text: "In the future I would like to offer a usable torch station for people who already have lampworking experience. The basic setup would include the torch, gas and oxygen, ventilation and the essential workshop equipment.",
        },
        {
          title: "Small workshops",
          text: "For beginners I would like to offer small, personal sessions covering the material, the flame and the first basic movements, with the chance to shape a small glass piece under guidance.",
        },
        {
          title: "Exchange",
          text: "I do not want the workshop to be only a production space. It should also leave room for meeting other glassworkers, working together, sharing techniques and learning from one another.",
        },
        {
          title: "One-to-one sessions",
          text: "For anyone who wants to focus on a specific technique or get a first look without a larger group, individual one-to-one sessions could become possible later. The content would depend on experience and goals.",
        },
      ],
      vision: "I would rather let the workshop grow in a useful and safe way than rush into a large course program. That is why I am expanding the equipment, workstations and possibilities step by step while the space remains my own working studio as well.",
      contactEyebrow: "Workshop",
      contactTitle: "Interested in the space?",
      contactText: "If you are interested in future torch time, a small workshop or an individual session, feel free to get in touch already. It also helps me understand which offers people are actually looking for.",
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
      community: "Community",
      about: "Über mich",
      contact: "Kontakt",
      menu: "Menü",
      close: "Schließen",
    },
    hero: {
      eyebrow: "Handgemacht auf dem Planeten Erde",
      subtitle: "Borosilikatglas · Kärnten, Österreich",
      text: "Ich bin Florian Robatsch, Glaskünstler aus Kärnten. Am Brenner entstehen aus Borosilikatglas handgemachte Unikate – Schmuck, Objekte und alles, was mir sonst noch durch den Kopf geht.",
      cta: "Arbeiten ansehen",
    },
    jewelry: {
      eyebrow: "Schmuck",
      title: "Glas zum Tragen",
      intro: "Handgemachte Anhänger aus Borosilikatglas aus Österreich. Jedes Stück entsteht einzeln am Brenner und ist ein Unikat.",
      itemTitle: "Handgemachtes Glas",
      itemSubtitle: "Borosilikat-Schmuck",
    },
    workshop: {
      eyebrow: "Werkstatt",
      title: "Am Brenner",
      text: "In meiner Werkstatt in Kärnten fertige ich jedes Stück von Hand aus Borosilikatglas am Brenner. Manche Arbeiten sind vorher geplant, andere entwickeln sich erst beim Machen.",
    },
    studio: {
      eyebrow: "Werkstatt",
      title: "Die Werkstatt",
      intro: "Meine Werkstatt in Kärnten ist der Ort, an dem aus Glasstäben und -röhren Schmuck, kleine Objekte, Experimente und Einzelstücke entstehen. Ich arbeite mit Borosilikatglas (COE 33), das in einer Sauerstoff-/Gasflamme auf Arbeitstemperatur gebracht und direkt am Brenner geformt wird. Im Moment ist der Platz vor allem für meine eigene Arbeit eingerichtet; langfristig möchte ich ihn Schritt für Schritt auch für andere Glasinteressierte öffnen.",
      cards: [
        {
          title: "Brennerplatz",
          text: "Geplant ist später ein nutzbarer Brennerplatz für Menschen, die bereits Erfahrung mit Lampworking haben. Brenner, Gas und Sauerstoff, Absaugung und grundlegende Werkstattausstattung sollen dabei vor Ort vorhanden sein.",
        },
        {
          title: "Kleine Workshops",
          text: "Für Einsteiger möchte ich kleine, persönliche Sessions anbieten, in denen man Material, Flamme und die ersten Grundbewegungen kennenlernt und unter Anleitung ein kleines eigenes Glasstück formt.",
        },
        {
          title: "Austausch",
          text: "Die Werkstatt soll nicht nur Produktionsort sein. Ich möchte auch Raum für Austausch mit anderen Glasleuten, gemeinsames Arbeiten, neue Techniken und gegenseitige Inspiration schaffen.",
        },
        {
          title: "Einzel-Sessions",
          text: "Wer gezielt an einer Technik arbeiten oder einen ersten Einblick ohne größere Gruppe bekommen möchte, könnte später individuelle 1:1-Sessions anfragen. Umfang und Inhalt richten sich dann nach Erfahrung und Ziel.",
        },
      ],
      vision: "Mir ist wichtiger, die Werkstatt sinnvoll und sicher wachsen zu lassen, als möglichst schnell ein großes Kursprogramm anzubieten. Deshalb baue ich Ausstattung, Arbeitsplätze und Möglichkeiten Schritt für Schritt aus – während der Raum weiterhin mein eigener Arbeitsplatz bleibt.",
      contactEyebrow: "Werkstatt",
      contactTitle: "Interesse am Platz?",
      contactText: "Wenn du dich für zukünftige Brennerzeit, einen kleinen Workshop oder eine individuelle Session interessierst, kannst du dich gerne schon melden. Dann weiß ich auch besser, welche Angebote später tatsächlich gefragt sind.",
      sendRequest: "Nachricht senden",
      instagram: "Instagram",
      emailSubject: "Werkstatt-Anfrage",
    },
    footer: {
      intro: "FRGLASS ist der Name, unter dem ich meine handgemachten Arbeiten aus Borosilikatglas zeige.",
      explore: "Entdecken",
      contact: "Kontakt",
      rights: "Alle Rechte vorbehalten.",
      tagline: "Handgemachtes Borosilikatglas aus Österreich.",
    },
  },
} as const;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("frglass-language");
      if (saved === "de" || saved === "en") {
        setLanguageState(saved);
        return;
      }
    } catch {
      // Fall back to browser language if persistent storage is unavailable.
    }

    const browserLanguage = window.navigator.language.toLowerCase();
    if (browserLanguage.startsWith("de")) {
      setLanguageState("de");
    } else {
      setLanguageState("en");
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "de" ? "de-AT" : "en";
  }, [language]);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    try {
      window.localStorage.setItem("frglass-language", nextLanguage);
    } catch {
      // Keep the in-memory language choice usable in restricted browsers.
    }
  };

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
