import type { Metadata } from "next";
import { Syne, Outfit } from "next/font/google";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const body = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["200", "300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "WATAHMAN | Immersive Digital Experience",
  description: "An interactive cinematic universe — exploring the boundaries of web, design, and motion.",
  openGraph: {
    title: "WATAHMAN",
    description: "Immersive Digital Experience",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
