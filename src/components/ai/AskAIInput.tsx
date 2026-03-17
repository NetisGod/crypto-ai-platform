"use client";

import { useRef } from "react";
import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AskAIInputProps {
  value: string;
  loading: boolean;
  examplePrompts: string[];
  onChange: (value: string) => void;
  onSubmit: (question: string) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function AskAIInput({
  value,
  loading,
  examplePrompts,
  onChange,
  onSubmit,
}: AskAIInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChipClick = (prompt: string) => {
    onChange(prompt);
    textareaRef.current?.focus();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(value);
    }
  };

  return (
    <Card className="border border-primary/20 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90">
      <CardContent className="space-y-4 pt-6">
        {/* Example prompt chips */}
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleChipClick(prompt)}
              disabled={loading}
              className="rounded-full border border-slate-700/60 bg-slate-900/50 px-3 py-1 text-xs text-slate-400 transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Textarea + submit */}
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Why is ETH going up today?"
            rows={2}
            disabled={loading}
            className={cn(
              "flex-1 resize-none rounded-md border border-slate-700/60 bg-slate-900/60 px-3 py-2",
              "text-sm text-slate-100 placeholder:text-slate-500",
              "focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
          <Button
            type="submit"
            disabled={loading || !value.trim()}
            className="self-end"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                Asking…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Ask
              </span>
            )}
          </Button>
        </form>

        <p className="text-xs text-slate-600">
          Press Enter to submit · Shift+Enter for new line
        </p>
      </CardContent>
    </Card>
  );
}
