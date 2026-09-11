import type { Metadata } from "next";
import Studio from "../components/Studio";

export const metadata: Metadata = {
  title: "Glaswerkstatt in Kärnten – FRGLASS Studio",
  description:
    "Einblick in die FRGLASS Glaswerkstatt in Kärnten, Österreich. Borosilikatglas, Lampworking sowie Pläne für Torch Rental und kleine Workshops.",
  alternates: { canonical: "/studio" },
  openGraph: {
    title: "FRGLASS Studio – Glaswerkstatt in Kärnten",
    description:
      "Borosilikatglas, Lampworking und Einblicke in die Werkstatt von Florian Robatsch.",
    url: "/studio",
  },
};

export default function Page() {
  return (
    <main className="bg-black">
      <h1 className="sr-only">FRGLASS Glaswerkstatt in Kärnten</h1>
      <Studio />
    </main>
  );
}
