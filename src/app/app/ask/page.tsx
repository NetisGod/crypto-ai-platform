import type { Metadata } from "next";
import { AskAI } from "@/components/ai/AskAI";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Ask AI Why | Crypto AI",
  description: "Ask questions about the crypto market using live platform context.",
};

export default function AskPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <SectionHeading
        eyebrow="Ask AI Why"
        title="Ask anything about the market."
        description="Grounded in live prices, news, and narratives — not public chat data."
      />

      <AskAI />
    </div>
  );
}
