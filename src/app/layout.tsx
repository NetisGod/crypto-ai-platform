import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { defaultDescription, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_TITLE = "CoinTrace AI — AI Crypto Market Intelligence";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s · CoinTrace AI",
  },
  description: defaultDescription,
  applicationName: SITE_NAME,
  generator: "Next.js",
  keywords: [
    "CoinTrace AI",
    "AI crypto analysis",
    "crypto market intelligence",
    "AI token analysis",
    "AI crypto agents",
    "Bitcoin AI analysis",
    "Ethereum AI analysis",
    "crypto narratives",
    "crypto research platform",
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
    description: defaultDescription,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/landing/hero-ai-crypto.jpg",
        width: 1280,
        height: 1280,
        alt: "CoinTrace AI — AI crypto market intelligence dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: defaultDescription,
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
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
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
