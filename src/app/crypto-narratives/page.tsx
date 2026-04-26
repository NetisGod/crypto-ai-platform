import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import { seoLandingPages } from "@/lib/seo-page-content";
import { createSeoMetadata } from "@/lib/seo";

const content = seoLandingPages["crypto-narratives"];

export const metadata = createSeoMetadata({
  title: "Crypto Narratives and AI Narrative Tracking | CoinTrace AI",
  description:
    "Use CoinTrace AI to research crypto narratives with token movement, news context, AI explanations, risk signals, and related assets.",
  path: content.path,
  keywords: ["crypto narratives", "AI crypto narratives", "crypto narrative tracking"],
});

export default function CryptoNarrativesPage() {
  return <SeoLandingPage content={content} />;
}
