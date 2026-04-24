import * as React from "react";
import { cn } from "@/lib/utils";

export type StatPillTone =
  | "neutral"
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "danger";

const toneClasses: Record<StatPillTone, string> = {
  neutral: "border-border/60 bg-card/60 text-foreground",
  primary: "border-primary/30 bg-primary/10 text-primary",
  accent: "border-accent/40 bg-accent/10 text-accent",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

const dotClasses: Record<StatPillTone, string> = {
  neutral: "bg-muted-foreground/60",
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export interface StatPillProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatPillTone;
  /** When true, shows a small colored leading dot (with soft pulse). */
  dot?: boolean;
  /** When true, the leading dot pulses (for "live" indicators). */
  pulse?: boolean;
  /** Optional leading icon. */
  icon?: React.ReactNode;
}

/**
 * Small inline pill used for confidence chips, source counts, live
 * indicators, etc. Matches the landing's rounded-full badge idiom.
 */
export function StatPill({
  tone = "neutral",
  dot = false,
  pulse = false,
  icon,
  className,
  children,
  ...rest
}: StatPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur",
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className={cn(
                "absolute inset-0 animate-ping rounded-full opacity-70",
                dotClasses[tone],
              )}
            />
          )}
          <span
            className={cn(
              "relative h-1.5 w-1.5 rounded-full",
              dotClasses[tone],
            )}
          />
        </span>
      )}
      {icon}
      {children}
    </span>
  );
}
