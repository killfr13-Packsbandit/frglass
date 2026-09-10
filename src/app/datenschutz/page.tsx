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
    contact: "Kontakt- und Produktanfragen",
    contactText: "Wenn du das Kontaktformular oder eine Produktanfrage nutzt, werden der von dir angegebene Name, deine E-Mail-Adresse, deine Nachricht und – bei Produktanfragen – die Zuordnung zum angefragten Stück verarbeitet, damit ich deine Anfrage beantworten kann. Die Angaben werden über den technischen E-Mail-Dienst Resend an mein Postfach übermittelt. Resend kann Daten auch außerhalb des EWR verarbeiten und verwendet hierfür nach eigenen Angaben geeignete Datenschutzmechanismen. Die Website legt die Anfrage nicht zusätzlich als öffentlich abrufbaren Datensatz ab. Im E-Mail-Postfach werden Anfragen nur so lange aufbewahrt, wie dies für die Kommunikation oder gesetzliche Aufbewahrungspflichten erforderlich ist.",
    community: "Community-Beiträge und Bewertungen",
    communityText: "Wenn du über den Community-Bereich eine Bewertung einsendest, werden der von dir angegebene Name, die Sternebewertung, dein optionaler Text und – falls ausgewählt – ein Foto verarbeitet. Der Beitrag wird zunächst nur zur Moderation gespeichert und erst nach manueller Freigabe öffentlich angezeigt. Die Veröffentlichung erfolgt auf Grundlage deiner Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Du kannst diese Einwilligung für die Zukunft jederzeit per E-Mail widerrufen; der veröffentlichte Beitrag und das zugehörige Bild werden dann entfernt. Hochgeladene Bilder werden in Vercel Blob gespeichert. Zur Begrenzung automatisierter oder missbräuchlicher Einsendungen wird die IP-Adresse serverseitig nur zur Bildung eines pseudonymisierten Tageskennwerts verwendet und nicht als Klartext im Bewertungsdatensatz gespeichert.",
    external: "Externe Links",
    externalText: "Die Website enthält Links zu externen Diensten, insbesondere Instagram. Wenn du einen solchen Link öffnest, gelten zusätzlich die Datenschutzbestimmungen des jeweiligen Anbieters.",
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
    contact: "Contact and product inquiries",
    contactText: "If you use the contact form or send a product inquiry, the name, email address and message you provide and, for product inquiries, the reference to the piece are processed so I can respond. The information is transmitted to my inbox through the technical email service Resend. According to Resend, data may also be processed outside the EEA using appropriate data-protection mechanisms. The website does not additionally store the inquiry as a publicly accessible record. Inquiries are retained in the email inbox only as long as necessary for the communication or applicable legal retention requirements.",
    community: "Community posts and reviews",
    communityText: "If you submit a review through the Community area, the name you provide, star rating, optional text and, if selected, a photo are processed. The post is initially stored only for moderation and is displayed publicly only after manual approval. Publication is based on your consent under Art. 6(1)(a) GDPR. You can withdraw that consent for the future at any time by email; the published post and associated image will then be removed. Uploaded images are stored in Vercel Blob. To limit automated or abusive submissions, the IP address is used server-side only to create a pseudonymised daily identifier and is not stored in plain text in the review record.",
    external: "External links",
    externalText: "This website contains links to external services, in particular Instagram. When you open such a link, the respective provider's privacy terms also apply.",
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
          <div><h2 className="text-lg font-bold text-white sm:text-xl">{t.community}</h2><p className="mt-3 leading-7 sm:leading-8">{t.communityText}</p></div>
          <div><h2 className="text-lg font-bold text-white sm:text-xl">{t.external}</h2><p className="mt-3 leading-7 sm:leading-8">{t.externalText}</p></div>
          <div><h2 className="text-lg font-bold text-white sm:text-xl">{t.tracking}</h2><p className="mt-3 leading-7 sm:leading-8">{t.trackingText}</p></div>
          <div><h2 className="text-lg font-bold text-white sm:text-xl">{t.rights}</h2><p className="mt-3 leading-7 sm:leading-8">{t.rightsText}</p><p className="mt-3 leading-7 sm:leading-8">{t.authority}</p></div>
          <p className="pt-4 text-sm text-neutral-500">{t.updated}</p>
        </div>
      </section>
    </main>
  );
}
