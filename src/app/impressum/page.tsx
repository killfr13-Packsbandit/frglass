"use client";

import { useLanguage } from "../components/LanguageProvider";
import { siteConfig } from "../siteConfig";

const copy = {
  de: {
    eyebrow: "Rechtliches",
    title: "Impressum",
    provider: "Diensteanbieter & Medieninhaber",
    trade: "Gewerbe",
    tradeValue: "Glaskunst / Kunstgewerbe",
    chamber: "Mitgliedschaft",
    chamberValue: "Wirtschaftskammer Kärnten, Landesinnung der Kunsthandwerke",
    authority: "Aufsichtsbehörde / Behörde gem. ECG",
    authorityValue: "Bezirkshauptmannschaft Sankt Veit an der Glan",
    law: "Anwendbare Rechtsvorschriften",
    lawValue: "Gewerbeordnung 1994 (GewO), abrufbar über das Rechtsinformationssystem des Bundes (RIS).",
    direction: "Grundlegende Richtung der Website",
    directionValue: "Präsentation eigener handgefertigter Glasarbeiten, Einblicke in die Werkstatt sowie Informationen zu verfügbaren Stücken und Anfragen.",
    liability: "Haftung für externe Links",
    liabilityText: "Diese Website enthält Links zu externen Angeboten. Für deren Inhalte und Datenschutzbestimmungen sind ausschließlich die jeweiligen Betreiber verantwortlich.",
  },
  en: {
    eyebrow: "Legal",
    title: "Legal notice",
    provider: "Service provider & media owner",
    trade: "Trade",
    tradeValue: "Glass art / arts and crafts",
    chamber: "Membership",
    chamberValue: "Carinthian Economic Chamber, Provincial Guild of Arts and Crafts",
    authority: "Supervisory authority / authority under the Austrian E-Commerce Act",
    authorityValue: "District Authority of Sankt Veit an der Glan",
    law: "Applicable professional law",
    lawValue: "Austrian Trade Regulation Act 1994 (GewO), available via the Austrian Legal Information System (RIS).",
    direction: "Basic direction of this website",
    directionValue: "Presentation of my handmade glass work, insights into the workshop and information about available pieces and inquiries.",
    liability: "External links",
    liabilityText: "This website contains links to external services. Their respective operators are solely responsible for their content and privacy practices.",
  },
} as const;

export default function Page() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-32">
      <section className="mx-auto max-w-4xl">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">{t.eyebrow}</p>
        <h1 className="break-words text-4xl font-black uppercase sm:text-6xl">{t.title}</h1>

        <div className="mt-10 space-y-8 text-neutral-300 sm:mt-14 sm:space-y-10">
          <div>
            <h2 className="text-lg font-bold text-white sm:text-xl">{t.provider}</h2>
            <p className="mt-3 leading-7 sm:leading-8">Florian Mario Robatsch<br />Muschker Straße 9/5<br />9321 Kappel/Krappfeld<br />Austria</p>
            <p className="mt-3 break-all"><a className="text-orange-300 hover:text-orange-200" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
            <div><h2 className="font-bold text-white">{t.trade}</h2><p className="mt-2 leading-7">{t.tradeValue}</p></div>
            <div><h2 className="font-bold text-white">{t.chamber}</h2><p className="mt-2 leading-7">{t.chamberValue}</p></div>
            <div><h2 className="font-bold text-white">{t.authority}</h2><p className="mt-2 leading-7">{t.authorityValue}</p></div>
            <div><h2 className="font-bold text-white">{t.law}</h2><p className="mt-2 leading-7">{t.lawValue}</p></div>
          </div>

          <div><h2 className="text-lg font-bold text-white sm:text-xl">{t.direction}</h2><p className="mt-3 leading-7 sm:leading-8">{t.directionValue}</p></div>
          <div><h2 className="text-lg font-bold text-white sm:text-xl">{t.liability}</h2><p className="mt-3 leading-7 sm:leading-8">{t.liabilityText}</p></div>
        </div>
      </section>
    </main>
  );
}
