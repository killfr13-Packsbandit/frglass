import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal – Lampworking, Werkstatt & Glaskunst",
  description:
    "Einblicke in die FRGLASS Werkstatt: Lampworking, neue Borosilikatglas-Arbeiten, Experimente und Behind-the-Scenes aus Österreich.",
  alternates: { canonical: "/journal" },
  openGraph: {
    title: "FRGLASS Journal – Lampworking & Glaskunst",
    description:
      "Werkstatt-Einblicke, neue Arbeiten und Behind-the-Scenes rund um Borosilikatglas.",
    url: "/journal",
  },
};

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
