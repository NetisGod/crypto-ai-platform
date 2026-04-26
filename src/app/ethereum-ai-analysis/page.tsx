import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { seoLandingPages } from "@/lib/seo-page-content";
import { createSeoMetadata } from "@/lib/seo";

const content = seoLandingPages["ethereum-ai-analysis"];

export const metadata = createSeoMetadata({
  title: "Ethereum AI Analysis for ETH Research | CoinTrace AI",
  description:
    "Research Ethereum with CoinTrace AI using ETH market context, AI analysis, crypto narratives, news, and risk-aware follow-up questions.",
  path: content.path,
  keywords: ["Ethereum AI analysis", "ETH AI analysis", "Ethereum market research AI"],
});

export default function EthereumAiAnalysisPage() {
  return <SeoLandingPage content={content} />;
}
