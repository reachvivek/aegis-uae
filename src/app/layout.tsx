import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const siteUrl = "https://aegisuae.vercel.app";
const title = "AegisUAE | Crisis Informatics System";
const description =
  "Real-time crisis command center for UAE. Airspace monitoring, threat tracking, evacuation routing, shelter finder & AI advisory.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteUrl),
  applicationName: "AegisUAE",
  keywords: [
    "UAE", "crisis", "dashboard", "airspace", "threat tracking",
    "evacuation", "shelter finder", "defense", "command center",
    "aviation", "GPS jamming", "nuclear preparedness",
  ],
  authors: [{ name: "Vivek", url: "https://reachvivek.vercel.app" }],
  creator: "Vivek",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title,
    description,
    siteName: "AegisUAE",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AegisUAE Dashboard - Crisis Command Center",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
    creator: "@rogerthatvivek",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "theme-color": "#00E5B8",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark", inter.variable, jetbrains.variable)} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
