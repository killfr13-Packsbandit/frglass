import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact FRGLASS about available pieces, custom ideas and future workshop sessions.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
