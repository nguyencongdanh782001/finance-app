import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const manrope = Inter({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope-mono",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Thuy Vui Store",
  manifest: "/manifest.json",
  description: "Shop quần áo của vợ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} font-manrope antialiased`}>
        {children}
      </body>
    </html>
  );
}
