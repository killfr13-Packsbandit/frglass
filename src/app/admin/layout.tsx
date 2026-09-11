import type { Metadata } from "next";
import MediaPickerCompatibility from "./MediaPickerCompatibility";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <MediaPickerCompatibility />
      {children}
    </>
  );
}
