import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt – FRGLASS Borosilikatglas aus Österreich",
  description:
    "Kontakt zu FRGLASS für verfügbare Borosilikatglas-Einzelstücke, individuelle Ideen, Anfragen und zukünftige Workshop-Angebote in Österreich.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Kontakt – FRGLASS",
    description:
      "Anfragen zu handgemachtem Borosilikatglas, Einzelstücken und zukünftigen Workshops.",
    url: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
