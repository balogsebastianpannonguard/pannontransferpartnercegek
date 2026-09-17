import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pannon Transfer - NI",
  description: "NI vállalati mobilitási portál",
};

export default function NiBookingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
