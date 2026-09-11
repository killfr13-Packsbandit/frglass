import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über Florian Robatsch – Glaskünstler aus Kärnten",
  description:
    "Florian Robatsch ist Borosilikatglas-Künstler aus Kärnten, Österreich. Seit 2019 entstehen bei FRGLASS handgemachte Einzelstücke an der Flamme.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Über Florian Robatsch – Glaskünstler aus Kärnten",
    description:
      "Borosilikatglas, Lampworking und handgemachte Einzelstücke aus Kärnten, Österreich.",
    url: "/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
