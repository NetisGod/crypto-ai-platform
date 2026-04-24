import type { Metadata } from "next";
import { AskAI } from "@/components/ai/AskAI";

export const metadata: Metadata = {
  title: "Ask AI | Crypto AI",
  description: "Ask questions about the crypto market using live platform context.",
};

export default function AskPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ask AI</h1>
        <p className="mt-1 text-muted-foreground">
          Ask questions about the crypto market using live platform context
        </p>
      </div>

      <AskAI />
    </div>
  );
}
