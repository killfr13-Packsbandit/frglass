import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bewertungen & Community – FRGLASS",
  description:
    "Bewertungen, Fotos und Erfahrungen von Menschen mit FRGLASS Arbeiten. Handgemachte Borosilikatglas-Kunst und Schmuck aus Österreich.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "Bewertungen & Community – FRGLASS",
    description:
      "Erfahrungen, Fotos und Feedback zu handgemachten FRGLASS Borosilikatglas-Arbeiten.",
    url: "/community",
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
