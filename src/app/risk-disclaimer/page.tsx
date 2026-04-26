import { LegalPage } from "@/components/seo/LegalPage";
import { legalPages } from "@/lib/seo-page-content";
import { createSeoMetadata } from "@/lib/seo";

const content = legalPages["risk-disclaimer"];

export const metadata = createSeoMetadata({
  title: "Crypto Risk Disclaimer | CoinTrace AI",
  description:
    "Read the CoinTrace AI risk disclaimer for crypto volatility, AI limitations, no financial advice, and responsible research use.",
  path: "/risk-disclaimer",
});

export default function RiskDisclaimerPage() {
  return <LegalPage content={content} />;
}
