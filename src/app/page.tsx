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
import { MobileWaitlistProvider } from "@/components/landing/MobileWaitlist";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  createOrganizationJsonLd,
  createSoftwareApplicationJsonLd,
  createWebsiteJsonLd,
  SITE_URL,
} from "@/lib/seo";

const PAGE_TITLE = "CoinTrace AI — AI Crypto Market Intelligence";
const PAGE_DESCRIPTION =
  "Research crypto markets with AI-assisted market briefs, token analysis, narrative detection, news context, and risk-aware explanations.";

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
        alt: "CoinTrace AI — AI crypto market intelligence dashboard",
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={[
          createOrganizationJsonLd(),
          createWebsiteJsonLd(),
          createSoftwareApplicationJsonLd(),
        ]}
      />
      <MobileWaitlistProvider>
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
      </MobileWaitlistProvider>
    </div>
  );
}
