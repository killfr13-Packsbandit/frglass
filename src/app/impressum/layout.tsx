import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Legal notice and business information for FRGLASS.",
  alternates: { canonical: "/impressum" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
