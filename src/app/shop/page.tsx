import type { Metadata } from "next";
import InquiryShop from "../components/InquiryShop";

export const metadata: Metadata = {
  title: "Shop",
  description: "Available handmade borosilicate glass pieces by FRGLASS.",
  alternates: { canonical: "/shop" },
};

export default function Page() {
  return (
    <main className="bg-black">
      <InquiryShop />
    </main>
  );
}
