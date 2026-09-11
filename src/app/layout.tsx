import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { LanguageProvider } from "./components/LanguageProvider";
import LanguageWelcome from "./components/LanguageWelcome";
import { SiteContentProvider } from "./components/SiteContentProvider";
import { siteConfig } from "./siteConfig";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description = "Handgemachte Borosilikatglas-Kunst, Glasanhänger, Schmuck und Einzelstücke von Glaskünstler Florian Robatsch aus Kärnten, Österreich. Lampworking seit 2019.";

export const metadata: Metadata = {
  metadataBase: new URL("https://frglass.at"),
  title: { default: "FRGLASS | Glaskunst & Borosilikatglas aus Kärnten", template: `%s | ${siteConfig.name}` },
  description,
  applicationName: siteConfig.name,
  authors: [{ name: "Florian Robatsch", url: "https://frglass.at/about" }],
  creator: "Florian Robatsch",
  publisher: "FRGLASS",
  category: "Glaskunst",
  keywords: ["Glaskunst Kärnten", "Glaskünstler Kärnten", "Glaskunst Österreich", "Borosilikatglas Österreich", "Borosilikatglas Schmuck", "Glasanhänger handgemacht", "Lampworking Österreich", "Lampworking Austria", "Borosilicate glass art", "handmade glass jewelry", "FRGLASS", "Florian Robatsch"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", siteName: siteConfig.name, title: "FRGLASS | Glaskunst & Borosilikatglas aus Kärnten", description, url: "/", locale: "de_AT", alternateLocale: ["en_US"], images: [{ url: "/workshop/me2.jpg", width: 1200, height: 630, alt: "FRGLASS – handgemachte Borosilikatglas-Kunst aus Kärnten" }] },
  twitter: { card: "summary_large_image", title: "FRGLASS | Glaskunst & Borosilikatglas aus Kärnten", description, images: ["/workshop/me2.jpg"] },
  icons: { icon: "/favicon.png?v=5", shortcut: "/favicon.png?v=5", apple: "/logo.png" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": "https://frglass.at/#website", url: "https://frglass.at/", name: "FRGLASS", description, inLanguage: ["de-AT", "en"] },
    { "@type": "Person", "@id": "https://frglass.at/#florian-robatsch", name: "Florian Robatsch", url: "https://frglass.at/about", image: "https://frglass.at/workshop/me2.jpg", jobTitle: "Glaskünstler / Glass Artist", description: "Glaskünstler aus Kärnten, Österreich. Handgefertigte Borosilikatglas-Kunst und Lampworking seit 2019.", knowsAbout: ["Borosilikatglas", "Lampworking", "Glaskunst", "Glass jewelry", "Borosilicate glass art"], homeLocation: { "@type": "AdministrativeArea", name: "Kärnten, Österreich" }, sameAs: [siteConfig.instagram] },
    { "@type": "ProfessionalService", "@id": "https://frglass.at/#frglass", name: "FRGLASS", url: "https://frglass.at/", image: "https://frglass.at/workshop/me2.jpg", description, founder: { "@id": "https://frglass.at/#florian-robatsch" }, areaServed: [{ "@type": "AdministrativeArea", name: "Kärnten" }, { "@type": "Country", name: "Österreich" }], knowsLanguage: ["de", "en"], sameAs: [siteConfig.instagram] }
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de-AT" className={`${geistSans.variable} ${geistMono.variable} h-full bg-black antialiased`}><body className="min-h-full bg-black flex flex-col"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /><LanguageProvider><SiteContentProvider><LanguageWelcome /><Navbar />{children}<Footer /></SiteContentProvider></LanguageProvider></body></html>;
}
