import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import LanguageTransitionWrapper from "./context/LanguageTransitionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pannon Transfer Komplexx - Partnerceg",
  description: "Pannon Transfer Komplexx - Partnercégek foglalási elosztó portálja",
  icons: {
    icon: "/pannon_transfer_logo-2.jpg",
    shortcut: "/pannon_transfer_logo-2.jpg",
    apple: "/pannon_transfer_logo-2.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <LanguageTransitionWrapper>
            {children}
          </LanguageTransitionWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
