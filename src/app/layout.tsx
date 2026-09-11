import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { LanguageProvider } from "./components/LanguageProvider";
import LanguageWelcome from "./components/LanguageWelcome";
import { SiteContentProvider } from "./components/SiteContentProvider";
import { siteConfig } from "./siteConfig";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Handgemachte Borosilikatglas-Kunst, Schmuck und Einzelstücke von Florian Robatsch aus Kärnten, Österreich. Handmade borosilicate glass art by FRGLASS.";

export const metadata: Metadata = {
  metadataBase: new URL("https://frglass.at"),
  title: {
    default: "FRGLASS | Borosilikatglas Kunst aus Österreich",
    template: `%s | ${siteConfig.name}`,
  },
  description,
  applicationName: siteConfig.name,
  authors: [{ name: "Florian Robatsch", url: "https://frglass.at/about" }],
  creator: "Florian Robatsch",
  publisher: "FRGLASS",
  keywords: [
    "Borosilikatglas",
    "Glaskunst Österreich",
    "Glaskunst Kärnten",
    "Borosilikatglas Schmuck",
    "Lampworking Austria",
    "Borosilicate glass art",
    "handmade glass jewelry",
    "FRGLASS",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "FRGLASS | Borosilikatglas Kunst aus Österreich",
    description,
    url: "/",
    locale: "de_AT",
    alternateLocale: ["en_US"],
    images: [
      {
        url: "/workshop/me2.jpg",
        width: 1200,
        height: 630,
        alt: "FRGLASS – handgemachte Borosilikatglas-Kunst aus Österreich",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FRGLASS | Borosilikatglas Kunst aus Österreich",
    description,
    images: ["/workshop/me2.jpg"],
  },
  icons: {
    icon: "/favicon.png?v=5",
    shortcut: "/favicon.png?v=5",
    apple: "/logo.png",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://frglass.at/#website",
      url: "https://frglass.at/",
      name: "FRGLASS",
      description,
      inLanguage: ["de-AT", "en"],
    },
    {
      "@type": "Person",
      "@id": "https://frglass.at/#florian-robatsch",
      name: "Florian Robatsch",
      url: "https://frglass.at/about",
      image: "https://frglass.at/workshop/me2.jpg",
      jobTitle: "Glaskünstler / Glass Artist",
      description:
        "Borosilikatglas-Künstler aus Kärnten, Österreich. Arbeitet seit 2019 mit Lampworking und handgefertigten Einzelstücken.",
      knowsAbout: [
        "Borosilikatglas",
        "Lampworking",
        "Glaskunst",
        "Glass jewelry",
        "Borosilicate glass art",
      ],
      homeLocation: {
        "@type": "AdministrativeArea",
        name: "Kärnten, Österreich",
      },
      sameAs: [siteConfig.instagram],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-black antialiased`}
    >
      <body className="min-h-full bg-black flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <LanguageProvider>
          <SiteContentProvider>
            <LanguageWelcome />
            <Navbar />
            {children}
            <Footer />
          </SiteContentProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
