import type { Metadata } from "next";
import Studio from "../components/Studio";

export const metadata: Metadata = {
  title: "Studio",
  description: "The FRGLASS workspace, future torch rental and small workshop plans.",
  alternates: { canonical: "/studio" },
};

export default function Page() {
  return (
    <main className="bg-black">
      <h1 className="sr-only">FRGLASS Studio</h1>
      <Studio />
    </main>
  );
}
