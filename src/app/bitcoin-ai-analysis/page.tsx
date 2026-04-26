import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { seoLandingPages } from "@/lib/seo-page-content";
import { createSeoMetadata } from "@/lib/seo";

const content = seoLandingPages["bitcoin-ai-analysis"];

export const metadata = createSeoMetadata({
  title: "Bitcoin AI Analysis for BTC Research | CoinTrace AI",
  description:
    "Research Bitcoin with CoinTrace AI using BTC market context, AI analysis, news, narratives, risk notes, and follow-up questions.",
  path: content.path,
  keywords: ["Bitcoin AI analysis", "BTC AI analysis", "Bitcoin market research AI"],
});

export default function BitcoinAiAnalysisPage() {
  return <SeoLandingPage content={content} />;
}
