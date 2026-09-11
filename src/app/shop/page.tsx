import type { Metadata } from "next";
import InquiryShop from "../components/InquiryShop";

export const metadata: Metadata = {
  title: "Borosilikatglas Shop – verfügbare Einzelstücke",
  description:
    "Verfügbare handgemachte Borosilikatglas-Arbeiten von FRGLASS: Schmuck, Anhänger und besondere Einzelstücke aus Österreich. Anfrage direkt über die Website.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "FRGLASS Shop – handgemachtes Borosilikatglas",
    description:
      "Verfügbare Einzelstücke aus Borosilikatglas von Florian Robatsch aus Österreich.",
    url: "/shop",
  },
};

export default function Page() {
  return (
    <main className="bg-black">
      <InquiryShop />
    </main>
  );
}
