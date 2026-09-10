"use client";

import { useLanguage } from "../components/LanguageProvider";
import { siteConfig } from "../siteConfig";

const copy = {
  de: {
    eyebrow: "Rechtliches",
    title: "Datenschutz",
    intro: "Diese Datenschutzerklärung beschreibt, welche personenbezogenen Daten beim Besuch dieser Website verarbeitet werden.",
    controller: "Verantwortlicher",
    hosting: "Hosting",
    hostingText: "Diese Website wird über Vercel bereitgestellt. Beim Aufruf der Website können technisch erforderliche Verbindungs- und Serverdaten verarbeitet werden, insbesondere IP-Adresse, Zeitpunkt des Zugriffs, aufgerufene Ressource und technische Browserinformationen. Die Verarbeitung dient dem sicheren und zuverlässigen Betrieb der Website und erfolgt auf Grundlage des berechtigten Interesses gemäß Art. 6 Abs. 1 lit. f DSGVO. Vercel kann Daten auch außerhalb des EWR verarbeiten und verwendet hierfür nach eigenen Angaben geeignete Datenschutzmechanismen.",
    language: "Sprachauswahl",
    languageText: "Die gewählte Sprache wird ausschließlich lokal in deinem Browser im Local Storage unter dem Schlüssel „frglass-language“ gespeichert. Dadurch merkt sich die Website deine Auswahl bei späteren Besuchen. Diese Information wird nicht für Werbung oder Profiling verwendet.",
    contact: "Kontakt per E-Mail",
    contactText: "Wenn du mich per E-Mail kontaktierst, werden die von dir übermittelten Daten zur Bearbeitung deiner Anfrage verarbeitet. Die Daten werden nur so lange gespeichert, wie sie für die Kommunikation oder zur Erfüllung gesetzlicher Aufbewahrungspflichten erforderlich sind.",
    external: "Externe Links",
    externalText: "Die Website enthält Links zu externen Diensten, insbesondere Instagram und deinem E-Mail-Programm. Erst wenn du einen solchen Link öffnest, gelten zusätzlich die Datenschutzbestimmungen des jeweiligen Anbieters.",
    tracking: "Cookies & Tracking",
    trackingText: "Diese Website verwendet derzeit keine Analyse- oder Marketing-Tools und setzt keine eigenen Analyse- oder Marketing-Cookies ein.",
    rights: "Deine Rechte",
    rightsText: "Du hast im Rahmen der DSGVO insbesondere das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und – soweit anwendbar – Widerspruch gegen die Verarbeitung. Außerdem kannst du dich bei der Österreichischen Datenschutzbehörde beschweren.",
    authority: "Österreichische Datenschutzbehörde, Barichgasse 40–42, 1030 Wien, Österreich.",
    updated: "Stand: September 2026",
  },
  en: {
    eyebrow: "Legal",
    title: "Privacy",
    intro: "This privacy notice explains which personal data may be processed when you visit this website.",
    controller: "Controller",
    hosting: "Hosting",
    hostingText: "This website is hosted through Vercel. When the website is accessed, technically necessary connection and server data may be processed, including IP address, time of access, requested resource and technical browser information. This processing is used to operate the website securely and reliably and is based on legitimate interests under Art. 6(1)(f) GDPR. According to Vercel, data may also be processed outside the EEA using appropriate data-protection mechanisms.",
    language: "Language preference",
    languageText: "Your selected language is stored only locally in your browser's Local Storage under the key “frglass-language”. This lets the website remember your choice on later visits. This information is not used for advertising or profiling.",
    contact: "Contact by email",
    contactText: "If you contact me by email, the information you provide is processed in order to respond to your inquiry. It is retained only as long as necessary for the communication or to comply with applicable legal retention requirements.",
    external: "External links",
    externalText: "This website contains links to external services, in particular Instagram and your email application. Only when you open such a link do the respective provider's privacy terms also apply.",
    tracking: "Cookies & tracking",
    trackingText: "This website currently does not use analytics or marketing tools and does not set its own analytics or marketing cookies.",
    rights: "Your rights",
    rightsText: "Under the GDPR you may have rights including access, rectification, erasure, restriction of processing, data portability and, where applicable, objection to processing. You also have the right to lodge a complaint with the Austrian Data Protection Authority.",
    authority: "Austrian Data Protection Authority, Barichgasse 40–42, 1030 Vienna, Austria.",
    updated: "Last updated: September 2026",
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
        <p className="mt-6 max-w-3xl text-base leading-7 text-neutral-300 sm:mt-8 sm:text-lg sm:leading-8">{t.intro}</p>

        <div className="mt-10 space-y-8 text-neutral-300 sm:mt-14 sm:space-y-10">
          <div>
            <h2 className="text-lg font-bold text-white sm:text-xl">{t.controller}</h2>
            <p className="mt-3 leading-7 sm:leading-8">Florian Mario Robatsch<br />Muschker Straße 9/5<br />9321 Kappel/Krappfeld<br />Austria<br /><a className="break-all text-orange-300 hover:text-orange-200" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></p>
          </div>

          <div><h2 className="text-lg font-bold text-white sm:text-xl">{t.hosting}</h2><p className="mt-3 leading-7 sm:leading-8">{t.hostingText}</p></div>
          <div><h2 className="text-lg font-bold text-white sm:text-xl">{t.language}</h2><p className="mt-3 leading-7 sm:leading-8">{t.languageText}</p></div>
          <div><h2 className="text-lg font-bold text-white sm:text-xl">{t.contact}</h2><p className="mt-3 leading-7 sm:leading-8">{t.contactText}</p></div>
          <div><h2 className="text-lg font-bold text-white sm:text-xl">{t.external}</h2><p className="mt-3 leading-7 sm:leading-8">{t.externalText}</p></div>
          <div><h2 className="text-lg font-bold text-white sm:text-xl">{t.tracking}</h2><p className="mt-3 leading-7 sm:leading-8">{t.trackingText}</p></div>
          <div><h2 className="text-lg font-bold text-white sm:text-xl">{t.rights}</h2><p className="mt-3 leading-7 sm:leading-8">{t.rightsText}</p><p className="mt-3 leading-7 sm:leading-8">{t.authority}</p></div>

          <p className="pt-4 text-sm text-neutral-500">{t.updated}</p>
        </div>
      </section>
    </main>
  );
}
