"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const MOCK_ANSWERS = [
  "Based on current data, **BTC** is trading at $97,234 with +2.34% in the last 24h. Institutional adoption narrative strength is at 92%.",
  "The **AI + Crypto** narrative shows 85% strength with positive sentiment (78%). Key tokens: LINK, FET, RENDER, TAO.",
  "**ETH** L2 volume has hit new highs. Consider monitoring ARB, OP, and STRK for exposure to the L2 scaling narrative.",
];

export default function AskPage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setAnswer(null);
    setTimeout(() => {
      const idx = Math.min(
        Math.floor(Math.random() * MOCK_ANSWERS.length),
        MOCK_ANSWERS.length - 1
      );
      setAnswer(MOCK_ANSWERS[idx]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ask</h1>
        <p className="mt-1 text-muted-foreground">
          Ask questions about tokens, narratives, and market data
        </p>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">Natural language query</CardTitle>
          <CardDescription>
            e.g. &quot;What is the BTC price?&quot; or &quot;Which narrative is
            strongest?&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Ask anything about the market..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-muted/50"
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Ask
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {answer && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {answer.split("**").map((part, i) =>
                i % 2 === 1 ? (
                  <span key={i} className="font-medium text-foreground">
                    {part}
                  </span>
                ) : (
                  part
                )
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
