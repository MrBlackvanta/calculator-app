import Signature from "@/components/layout/signature";
import { SITE_URL } from "@/data";
import { THEME_PREPAINT_SCRIPT } from "@/lib/theme";
import type { Metadata, Viewport } from "next";
import { League_Spartan } from "next/font/google";
import "./globals.css";

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});

const name = "calc";
const title = `${name} | Everyday arithmetic in three themes`;
const description =
  "A fast, keyboard-friendly calculator for everyday arithmetic. Add, subtract, multiply and divide, and switch between three color themes that stick.";

const shareImage = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: "The calc wordmark above a calculator keypad on a deep blue ground.",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: name,
    locale: "en_US",
    type: "website",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#3a4663" },
    { media: "(prefers-color-scheme: light)", color: "#e6e6e6" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${leagueSpartan.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="relative">
        <script dangerouslySetInnerHTML={{ __html: THEME_PREPAINT_SCRIPT }} />
        {children}
        <Signature />
      </body>
    </html>
  );
}
