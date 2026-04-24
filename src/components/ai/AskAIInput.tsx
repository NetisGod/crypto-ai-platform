"use client";

import { useRef } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AskAIInputProps {
  value: string;
  loading: boolean;
  examplePrompts: string[];
  onChange: (value: string) => void;
  onSubmit: (question: string) => void;
}

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
    <div className="space-y-4">
      {/* Composer — hero style */}
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur transition-all",
          "focus-within:border-accent/50 focus-within:shadow-glow",
          loading && "border-accent/50",
        )}
      >
        {/* Gradient border animation while loading */}
        {loading && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-primary opacity-30 blur-md"
          />
        )}

        <form
          onSubmit={handleFormSubmit}
          className="relative flex items-end gap-3 p-4"
        >
          <Sparkles className="mt-2 h-4 w-4 shrink-0 text-accent" />
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Why is ETH going up today?"
            rows={2}
            disabled={loading}
            className={cn(
              "min-h-[44px] flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70",
              "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-base",
            )}
          />
          <Button
            type="submit"
            variant="hero"
            size="sm"
            disabled={loading || !value.trim()}
            className="shrink-0 rounded-full"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border border-primary-foreground border-t-transparent" />
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
      </div>

      <p className="text-[11px] text-muted-foreground/70">
        Press <kbd className="rounded border border-border/60 bg-card/60 px-1 py-px">Enter</kbd> to submit ·{" "}
        <kbd className="rounded border border-border/60 bg-card/60 px-1 py-px">Shift</kbd>+
        <kbd className="rounded border border-border/60 bg-card/60 px-1 py-px">Enter</kbd> for new line
      </p>

      {/* Example prompt chips — landing style */}
      <div className="flex flex-wrap gap-2">
        {examplePrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleChipClick(prompt)}
            disabled={loading}
            className={cn(
              "rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition-all",
              "hover:border-accent/40 hover:bg-accent/10 hover:text-accent",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
