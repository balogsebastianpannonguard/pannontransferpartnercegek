import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pannon Transfer NI | Emerson",
  description: "NI | Emerson dedikált partnerportál",
};

export default function NiLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
