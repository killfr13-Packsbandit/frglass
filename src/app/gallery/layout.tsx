import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description: "A selection of FRGLASS borosilicate jewelry, objects and experiments.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
