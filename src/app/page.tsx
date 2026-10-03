import type { Metadata } from "next";
import Hero from "./components/Hero";
import JewelryShowcase from "./components/Jewelry";
import Workshop from "./components/Workshop";
import HomeCommunityReviews from "./components/HomeCommunityReviews";
import FlexibleTextBlocks from "./components/FlexibleTextBlocks";

export const metadata: Metadata = {
  title: "FRGLASS | Glaskunst & Borosilikatglas aus Kärnten",
  description:
    "Handgemachte Borosilikatglas-Kunst, Glasanhänger, Schmuck und Einzelstücke von Glaskünstler Florian Robatsch aus Kärnten, Österreich. Lampworking seit 2019.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "FRGLASS | Glaskunst & Borosilikatglas aus Kärnten",
    description:
      "Handgemachte Borosilikatglas-Kunst und Einzelstücke von Florian Robatsch aus Kärnten, Österreich.",
    url: "/",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <FlexibleTextBlocks page="home" placement="afterHero" />
      <JewelryShowcase />
      <FlexibleTextBlocks page="home" placement="afterProducts" />
      <Workshop />
      <FlexibleTextBlocks page="home" placement="afterWorkshop" />
      <HomeCommunityReviews />
      <FlexibleTextBlocks page="home" placement="bottom" />
    </main>
  );
}
