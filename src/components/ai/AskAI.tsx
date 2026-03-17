"use client";

import { useState } from "react";
import { AskAiResponseSchema } from "@/ai/schemas/askAi";
import type { AskAiResponse } from "@/ai/schemas/askAi";
import { AskAIInput } from "@/components/ai/AskAIInput";
import {
  AskAILoadingSkeleton,
  AskAIErrorCard,
  AskAIResponseCard,
} from "@/components/ai/AskAIResponseCard";

// ─── Constants ─────────────────────────────────────────────────────────────────

const EXAMPLE_PROMPTS = [
  "Why is ETH going up today?",
  "What are the top movers today?",
  "Summarize the crypto market today",
  "Should I watch SOL or AVAX?",
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function AskAI() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<AskAiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      const json = (await res.json()) as Record<string, unknown>;

      if (!res.ok) {
        const message = typeof json.error === "string" ? json.error : `Request failed with status ${res.status}`;
        throw new Error(message);
      }

      const parsed = AskAiResponseSchema.safeParse(json);
      if (!parsed.success) {
        throw new Error("Received an unexpected response shape from the server.");
      }

      setResponse(parsed.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AskAIInput
        value={question}
        loading={loading}
        examplePrompts={EXAMPLE_PROMPTS}
        onChange={setQuestion}
        onSubmit={(q) => void submit(q)}
      />

      {loading && <AskAILoadingSkeleton />}
      {error && !loading && (
        <AskAIErrorCard message={error} onRetry={() => void submit(question)} />
      )}
      {response && !loading && <AskAIResponseCard response={response} />}
    </div>
  );
}
