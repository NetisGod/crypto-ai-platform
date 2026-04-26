import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { seoLandingPages } from "@/lib/seo-page-content";
import { createSeoMetadata } from "@/lib/seo";

const content = seoLandingPages["crypto-market-intelligence"];

export const metadata = createSeoMetadata({
  title: "Crypto Market Intelligence Platform | CoinTrace AI",
  description:
    "Explore CoinTrace AI for crypto market intelligence, AI market briefs, token analysis, news context, narrative tracking, and research workflows.",
  path: content.path,
  keywords: [
    "crypto market intelligence",
    "AI market intelligence crypto",
    "crypto research platform",
  ],
});

export default function CryptoMarketIntelligencePage() {
  return <SeoLandingPage content={content} />;
}
