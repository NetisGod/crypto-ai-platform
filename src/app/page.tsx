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

export const metadata = {
  title: "CoinTrace AI — AI-Powered Crypto Trading Analytics",
  description:
    "Trade crypto smarter with AI-powered signals, predictive analytics and automated strategies. Real-time insights across 500+ assets.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
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
