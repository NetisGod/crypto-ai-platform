import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { LogoCloud } from "@/components/landing/LogoCloud";
import { Features } from "@/components/landing/Features";
import { Stats } from "@/components/landing/Stats";
import { FreeAiSamples } from "@/components/landing/FreeAiSamples";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { CookieConsent } from "@/components/landing/CookieConsent";

const SITE_URL = "https://cointraceai.com";
const PAGE_TITLE = "CoinTrace AI — AI-Powered Crypto Trading Analytics";
const PAGE_DESCRIPTION =
  "Trade crypto smarter with AI-powered signals, predictive analytics, and automated strategies. Real-time market intelligence across 500+ assets.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "CoinTrace AI",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
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
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ["/landing/hero-ai-crypto.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CoinTrace AI",
  url: SITE_URL,
  logo: `${SITE_URL}/landing/logo-coin-trace.png`,
  description: PAGE_DESCRIPTION,
  sameAs: [] as string[],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CoinTrace AI",
  url: SITE_URL,
  description: PAGE_DESCRIPTION,
  publisher: {
    "@type": "Organization",
    name: "CoinTrace AI",
  },
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CoinTrace AI",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description: PAGE_DESCRIPTION,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            organizationJsonLd,
            websiteJsonLd,
            softwareApplicationJsonLd,
          ]),
        }}
      />
      <Header />
      <main>
        <Hero />
        <LogoCloud />
        <Features />
        <Stats />
        <FreeAiSamples />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
