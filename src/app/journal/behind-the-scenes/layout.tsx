import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Behind the scenes",
  description: "A look at the FRGLASS torch, tools and process behind the finished borosilicate glass pieces.",
  alternates: { canonical: "/journal/behind-the-scenes" },
};

export default function BehindTheScenesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
