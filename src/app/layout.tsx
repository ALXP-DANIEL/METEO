import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import Splash from "@/components/chrome/splash";
import { themeScript } from "@/lib/theme-script";
import "@/styles/globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const url =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://meteo.alifdaniel.dpdns.org";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: { default: "METEO — live weather", template: "%s · METEO" },
  description:
    "Live weather for anywhere on Earth in a 3D sky that matches the forecast: hourly and 10-day outlook, air quality, UV, wind and an animated rain radar.",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: pre-paint theme script */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <Splash />
        {children}
      </body>
    </html>
  );
}
