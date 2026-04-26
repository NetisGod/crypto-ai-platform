import { LegalPage } from "@/components/seo/LegalPage";
import { legalPages } from "@/lib/seo-page-content";
import { createSeoMetadata } from "@/lib/seo";

const content = legalPages.about;

export const metadata = createSeoMetadata({
  title: "About CoinTrace AI | AI Crypto Market Intelligence",
  description:
    "Learn about CoinTrace AI, an AI-powered crypto market intelligence workspace for research, market briefs, token analysis, and narratives.",
  path: "/about",
});

export default function AboutPage() {
  return <LegalPage content={content} />;
}
