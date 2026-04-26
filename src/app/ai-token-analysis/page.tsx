import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { seoLandingPages } from "@/lib/seo-page-content";
import { createSeoMetadata } from "@/lib/seo";

const content = seoLandingPages["ai-token-analysis"];

export const metadata = createSeoMetadata({
  title: "AI Token Analysis for Crypto Research | CoinTrace AI",
  description:
    "Research crypto tokens with CoinTrace AI using AI token analysis, market data, news, narratives, risk framing, and follow-up questions.",
  path: content.path,
  keywords: ["AI token analysis", "crypto token analysis AI", "token research AI"],
});

export default function AiTokenAnalysisPage() {
  return <SeoLandingPage content={content} />;
}
