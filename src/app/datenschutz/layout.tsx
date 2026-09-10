import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Privacy information for the FRGLASS website.",
  alternates: { canonical: "/datenschutz" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
