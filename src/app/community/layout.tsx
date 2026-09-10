import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description: "Reviews, photos and feedback from people who own or experienced FRGLASS work.",
  alternates: { canonical: "/community" },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
