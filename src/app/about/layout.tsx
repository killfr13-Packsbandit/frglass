import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Florian Robatsch and the process behind FRGLASS borosilicate glass work.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
