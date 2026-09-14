import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/Auth/AuthProvider";
import { CartProvider } from "@/components/Storefront/CartProvider";
import "./globals.css";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const manrope = Inter({
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
  variable: "--font-manrope-mono",
  subsets: ["latin", "vietnamese"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Quỳnh Nhi Store",
  manifest: "/manifest.json",
  description:
    "Quỳnh Nhi Store - thời trang nữ, quần áo hiện đại và những thiết kế phù hợp cho mọi phong cách.",
  keywords: [
    "Quỳnh Nhi Store",
    "shop quần áo nữ",
    "thời trang nữ",
    "quần áo nữ",
    "mua quần áo online",
  ],
  authors: [{ name: "Quỳnh Nhi Store" }],
  creator: "Quỳnh Nhi Store",
  publisher: "Quỳnh Nhi Store",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Quỳnh Nhi Store",
    title: "Quỳnh Nhi Store | Thời trang nữ hiện đại",
    description:
      "Khám phá những thiết kế thời trang hiện đại tại Quỳnh Nhi Store.",
    url: "/",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "Quỳnh Nhi Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quỳnh Nhi Store | Thời trang nữ hiện đại",
    description:
      "Khám phá những thiết kế thời trang hiện đại tại Quỳnh Nhi Store.",
    images: ["/icons/icon-512.png"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.svg",
    apple: "/logo-quynh-nhi-store-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="preconnect" href="https://www.gstatic.com" />
      </head>
      <body className={`${manrope.variable} font-manrope antialiased`}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
