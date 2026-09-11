import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glaskunst Galerie – Borosilikatglas Schmuck & Einzelstücke",
  description:
    "Galerie von FRGLASS mit handgemachtem Borosilikatglas, Schmuck, Anhängern, Implosionen und experimentellen Einzelstücken aus Österreich.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "FRGLASS Galerie – Borosilikatglas Kunst aus Österreich",
    description:
      "Handgemachte Borosilikatglas-Arbeiten, Schmuck und Einzelstücke von Florian Robatsch.",
    url: "/gallery",
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
