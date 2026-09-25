"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Language = "de" | "en";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LANGUAGE_KEY = "frglass-language";
export const LANGUAGE_CHANGE_EVENT = "frglass-language-change";
let memoryLanguage: Language | null = null;

function readLanguage(): Language {
  if (memoryLanguage) return memoryLanguage;

  try {
    const saved = window.localStorage.getItem(LANGUAGE_KEY);
    if (saved === "de" || saved === "en") return saved;
  } catch {
    // Fall through to the browser language when storage is unavailable.
  }

  return window.navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
}

function subscribeToLanguageChange(callback: () => void) {
  const handleStorage = () => {
    memoryLanguage = null;
    callback();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, callback);
  };
}

function serverLanguage(): Language {
  return "de";
}

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
      text: "I make each piece by hand from borosilicate glass in my workshop in Carinthia. Some pieces start with a clear idea, while others only reveal their direction while I work.",
    },
    studio: {
      eyebrow: "Workspace",
      title: "Fire, glass and craft",
      intro: "My workshop in Carinthia is where glass rods and tubes become jewelry, small objects, experiments and one-off pieces. I work with borosilicate glass (COE 33), heating it to working temperature in an oxygen/gas flame and shaping it directly at the torch. For now the space is mainly set up for my own work; over time I would like to open it up step by step to other people interested in glass.",
      cards: [
        {
          title: "Torch space",
          text: "In the future I would like to offer a usable torch station for people who already have lampworking experience. The basic setup would include the torch, gas and oxygen, ventilation and the essential workshop equipment.",
        },
        {
          title: "Workshops",
          text: "For beginners or anyone who wants to focus on a specific technique, I would like to offer small workshops and individual sessions. Content and length depend on experience and goals — from first contact with material and flame to making a small glass piece of your own.",
        },
        {
          title: "Exchange",
          text: "I do not want the workshop to be only a production space. It should also leave room for meeting other glassworkers, working together, sharing techniques and learning from one another.",
        },
        {
          title: "Studio space",
          text: "Do you already work with glass and need a place to work? There is enough room in my studio for another workspace. If you are looking for a regular or permanent studio spot, get in touch and we can see if it is a good fit.",
        },
      ],
      vision: "I would rather let the workshop grow in a useful and safe way than rush into a large course program. That is why I am expanding the equipment, workstations and possibilities step by step while the space remains my own working studio as well.",
      contactEyebrow: "Workshop",
      contactTitle: "Curious about glass?",
      contactText: "If you are interested in torch time, a workshop or a studio space, feel free to get in touch. We can work out the details personally.",
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
      text: "In meiner Werkstatt in Kärnten fertige ich jedes Stück von Hand aus Borosilikatglas am Brenner. Manche Arbeiten starten mit einer klaren Idee, andere zeigen erst während der Arbeit, wohin sie sich entwickeln.",
    },
    studio: {
      eyebrow: "Werkstatt",
      title: "Feuer, Glas und Handwerk",
      intro: "Meine Werkstatt in Kärnten ist der Ort, an dem aus Glasstäben und -röhren Schmuck, kleine Objekte, Experimente und Einzelstücke entstehen. Ich arbeite mit Borosilikatglas (COE 33), das in einer Sauerstoff-/Gasflamme auf Arbeitstemperatur gebracht und direkt am Brenner geformt wird. Im Moment ist der Platz vor allem für meine eigene Arbeit eingerichtet; langfristig möchte ich ihn Schritt für Schritt auch für andere Glasinteressierte öffnen.",
      cards: [
        {
          title: "Brennerplatz",
          text: "Geplant ist später ein nutzbarer Brennerplatz für Menschen, die bereits Erfahrung mit Lampworking haben. Brenner, Gas und Sauerstoff, Absaugung und grundlegende Werkstattausstattung sollen dabei vor Ort vorhanden sein.",
        },
        {
          title: "Workshops",
          text: "Für Einsteiger oder wenn du gezielt an einer Technik arbeiten möchtest, möchte ich kleine Workshops und individuelle Sessions anbieten. Inhalt und Umfang richten sich nach Erfahrung und Ziel – vom ersten Kontakt mit Material und Flamme bis zum eigenen kleinen Glasstück.",
        },
        {
          title: "Austausch",
          text: "Die Werkstatt soll nicht nur Produktionsort sein. Ich möchte auch Raum für Austausch mit anderen Glasleuten, gemeinsames Arbeiten, neue Techniken und gegenseitige Inspiration schaffen.",
        },
        {
          title: "Studioplatz",
          text: "Du arbeitest selbst mit Glas und suchst einen Platz zum Arbeiten? In meiner Werkstatt ist genug Raum für einen weiteren Arbeitsplatz. Wenn du einen regelmäßigen oder festen Studioplatz suchst, meld dich gerne – dann schauen wir gemeinsam, ob es passt.",
        },
      ],
      vision: "Mir ist wichtiger, die Werkstatt sinnvoll und sicher wachsen zu lassen, als möglichst schnell ein großes Kursprogramm anzubieten. Deshalb baue ich Ausstattung, Arbeitsplätze und Möglichkeiten Schritt für Schritt aus – während der Raum weiterhin mein eigener Arbeitsplatz bleibt.",
      contactEyebrow: "Werkstatt",
      contactTitle: "Neugierig auf Glas?",
      contactText: "Wenn du dich für Brennerzeit, einen Workshop oder einen Studioplatz interessierst, meld dich gerne. Alles Weitere können wir persönlich besprechen.",
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
  const language = useSyncExternalStore(
    subscribeToLanguageChange,
    readLanguage,
    serverLanguage,
  );

  useEffect(() => {
    document.documentElement.lang = language === "de" ? "de-AT" : "en";
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    memoryLanguage = nextLanguage;
    try {
      window.localStorage.setItem(LANGUAGE_KEY, nextLanguage);
    } catch {
      // Keep the in-memory language choice usable in restricted browsers.
    }
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
