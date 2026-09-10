import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal",
  description: "FRGLASS workshop notes, new pieces and behind-the-scenes updates.",
  alternates: { canonical: "/journal" },
};

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
