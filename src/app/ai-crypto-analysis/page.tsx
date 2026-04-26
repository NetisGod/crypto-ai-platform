import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { seoLandingPages } from "@/lib/seo-page-content";
import { createSeoMetadata } from "@/lib/seo";

const content = seoLandingPages["ai-crypto-analysis"];

export const metadata = createSeoMetadata({
  title: "AI Crypto Analysis Tool for Market Research | CoinTrace AI",
  description:
    "Use CoinTrace AI for AI crypto analysis across market data, token moves, news, narratives, risk notes, and follow-up research questions.",
  path: content.path,
  keywords: ["AI crypto analysis", "crypto AI analysis", "AI crypto research"],
});

export default function AiCryptoAnalysisPage() {
  return <SeoLandingPage content={content} />;
}
