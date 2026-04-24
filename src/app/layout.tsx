import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://cointraceai.com";
const SITE_NAME = "CoinTrace AI";
const DEFAULT_TITLE = "CoinTrace AI — AI-Powered Crypto Trading Analytics";
const DEFAULT_DESCRIPTION =
  "CoinTrace AI fuses real-time market data with predictive intelligence — AI-powered signals, automated strategies, and risk-aware analytics across 500+ crypto assets.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s · CoinTrace AI",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  keywords: [
    "CoinTrace AI",
    "AI crypto analytics",
    "crypto trading signals",
    "predictive crypto analytics",
    "AI trading platform",
    "crypto market intelligence",
    "automated crypto strategies",
    "Bitcoin AI signals",
    "Ethereum AI analysis",
    "on-chain analytics",
    "crypto narratives",
    "AI market brief",
  ],
  authors: [{ name: "CoinTrace AI" }],
  creator: "CoinTrace AI",
  publisher: "CoinTrace AI",
  category: "finance",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/landing/hero-ai-crypto.jpg",
        width: 1280,
        height: 1280,
        alt: "CoinTrace AI — AI-powered crypto analytics dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/landing/hero-ai-crypto.jpg"],
    creator: "@cointraceai",
    site: "@cointraceai",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0f" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
