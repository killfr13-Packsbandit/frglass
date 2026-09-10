import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { LanguageProvider } from "./components/LanguageProvider";
import LanguageWelcome from "./components/LanguageWelcome";
import { siteConfig } from "./siteConfig";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://frglass.at"),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: "Handmade borosilicate glass, jewelry and objects by FRGLASS.",
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: "Handmade borosilicate glass, jewelry and objects by FRGLASS.",
    url: "/",
    images: ["/workshop/me2.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: "Handmade borosilicate glass, jewelry and objects by FRGLASS.",
    images: ["/workshop/me2.jpg"],
  },
  icons: {
    icon: "/favicon.png?v=5",
    shortcut: "/favicon.png?v=5",
    apple: "/logo.png",
  },
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
        <LanguageProvider>
          <LanguageWelcome />
          <Navbar />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
