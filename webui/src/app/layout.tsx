import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HedgeTerminal",
  description: "HedgeTerminal is a professional-grade research interface for decoding capital flows and fund positioning.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
  },
  openGraph: {
    title: "HedgeTerminal - Institutional-Grade Fund Intelligence",
    description: "Built for serious capital. A next-gen terminal for fund behavior, filings, and quarterly data.",
    type: "website",
    url: "https://hedgeterminal.com",
    images: [
      {
        url: "https://hedgeterminal.com/og-banner.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HedgeTerminal - Institutional-Grade Fund Intelligence",
    description: "Not a SaaS. Not a toy. Just pure research performance.",
    images: ["https://hedgeterminal.com/og-banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}