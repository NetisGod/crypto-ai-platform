import { LegalPage } from "@/components/seo/LegalPage";
import { legalPages } from "@/lib/seo-page-content";
import { createSeoMetadata } from "@/lib/seo";

const content = legalPages.terms;

export const metadata = createSeoMetadata({
  title: "Terms of Service | CoinTrace AI",
  description:
    "Read the CoinTrace AI Terms of Service for responsible use, AI output limitations, account rules, and liability terms.",
  path: "/terms",
});

export default function TermsPage() {
  return <LegalPage content={content} />;
}
