import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { LogoCloud } from "@/components/site/LogoCloud";
import { Features } from "@/components/site/Features";
import { Stats } from "@/components/site/Stats";
import { Pricing } from "@/components/site/Pricing";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";

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
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
