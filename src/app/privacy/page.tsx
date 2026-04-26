import { LegalPage } from "@/components/seo/LegalPage";
import { legalPages } from "@/lib/seo-page-content";
import { createSeoMetadata } from "@/lib/seo";

const content = legalPages.privacy;

export const metadata = createSeoMetadata({
  title: "Privacy Policy | CoinTrace AI",
  description:
    "Read the CoinTrace AI Privacy Policy for information about data collection, cookies, analytics, retention, and user privacy.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <LegalPage content={content} />;
}
