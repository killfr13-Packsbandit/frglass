import type { Metadata } from "next";
import FlexibleTextBlocks from "../components/FlexibleTextBlocks";
import InquiryShop from "../components/InquiryShop";
import { getProductCatalog } from "../../lib/productCatalog";

// The catalog is managed at runtime and must be fresh on every request.
export const dynamic = "force-dynamic";

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

export default async function Page() {
  const products = await getProductCatalog();

  return (
    <main className="bg-black">
      <FlexibleTextBlocks page="shop" placement="beforeShop" topOffset />
      <InquiryShop initialProducts={products} />
      <FlexibleTextBlocks page="shop" placement="afterShop" />
    </main>
  );
}
