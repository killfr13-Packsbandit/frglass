import Hero from "./components/Hero";
import JewelryShowcase from "./components/Jewelry";
import Workshop from "./components/Workshop";
import HomeCommunityReviews from "./components/HomeCommunityReviews";
import FlexibleTextBlocks from "./components/FlexibleTextBlocks";

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
