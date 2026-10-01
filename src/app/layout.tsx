import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const url =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://meteo.alifdaniel.dpdns.org";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: { default: "METEO — live weather", template: "%s · METEO" },
  description:
    "Live conditions, a 24-hour timeline, a 10-day outlook, air quality and an animated rain radar for anywhere on Earth.",
  applicationName: "METEO",
  authors: [{ name: "Alif Daniel", url: "https://alifdaniel.dpdns.org" }],
  keywords: [
    "weather",
    "forecast",
    "radar",
    "air quality",
    "UV index",
    "Next.js",
  ],
  openGraph: { type: "website", siteName: "METEO" },
  twitter: { card: "summary_large_image" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "METEO",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
