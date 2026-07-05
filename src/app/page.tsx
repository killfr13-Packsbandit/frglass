import Hero from "./components/Hero";
import JewelryShowcase from "./components/Jewelry";
import Workshop from "./components/Workshop";
import Studio from "./components/Studio";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <JewelryShowcase />
      <Workshop />
      <Studio />
    </main>
  );
}