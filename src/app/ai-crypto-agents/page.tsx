import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { seoLandingPages } from "@/lib/seo-page-content";
import { createSeoMetadata } from "@/lib/seo";

const content = seoLandingPages["ai-crypto-agents"];

export const metadata = createSeoMetadata({
  title: "AI Crypto Agents for Market Research | CoinTrace AI",
  description:
    "Learn how CoinTrace AI uses AI crypto agents for market data, news, narrative, risk, synthesis, and validation workflows.",
  path: content.path,
  keywords: ["AI crypto agents", "crypto research agents", "AI agents crypto"],
});

export default function AiCryptoAgentsPage() {
  return <SeoLandingPage content={content} />;
}
