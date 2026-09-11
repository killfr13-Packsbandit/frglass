import Hero from "./components/Hero";
import JewelryShowcase from "./components/Jewelry";
import Workshop from "./components/Workshop";
import HomeCommunityReviews from "./components/HomeCommunityReviews";
import HomeStudioTeaser from "./components/HomeStudioTeaser";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <JewelryShowcase />
      <Workshop />
      <HomeStudioTeaser />
      <HomeCommunityReviews />
    </main>
  );
}
