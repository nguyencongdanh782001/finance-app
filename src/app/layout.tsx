import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/Auth/AuthProvider";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Quỳnh Nhi Store",
  manifest: "/manifest.json",
  description: "Shop quần áo Quỳnh Nhi Store",
  icons: {
    icon: "/favicon.svg",
    apple: "/logo-quynh-nhi-store-mark.svg",
  },
  other: {
    "zalo-platform-site-verification": "UVta4g_HCoXhyR0AZu4v30c2upNbz3biD3On",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} font-manrope antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
