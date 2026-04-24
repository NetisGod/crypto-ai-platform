"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  className?: string;
  variant?: "default" | "accent";
  selected?: boolean;
  onClick?: () => void;
  href?: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  className,
  variant = "default",
  selected,
  onClick,
  href,
  loading,
}: MetricCardProps) {
  const positive = change !== undefined && change >= 0;

  const card = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300",
        "shadow-soft hover:-translate-y-0.5 hover:shadow-elegant",
        variant === "accent" && "border-accent/30",
        selected && "ring-glow border-accent/50",
        (onClick || href) && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      {/* Soft accent blob on hover (matches landing Features card idiom) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
      />
      {/* Animated gradient underline — only on accent variant */}
      {variant === "accent" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-70"
        />
      )}

      <div className="relative flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </span>
        {href ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-accent" />
        ) : Icon ? (
          <Icon
            className={cn(
              "h-4 w-4 transition-colors",
              variant === "accent"
                ? "text-accent"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          />
        ) : null}
      </div>

      <div className="relative mt-3">
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-28 rounded animate-shimmer" />
            <div className="h-3.5 w-20 rounded animate-shimmer" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-semibold tracking-tight tabular-nums text-foreground sm:text-[26px]">
              {value}
            </div>
            {(change !== undefined || changeLabel) && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                {change !== undefined && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-1.5 py-0.5 font-medium tabular-nums",
                      positive
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger",
                    )}
                  >
                    {positive ? (
                      <TrendingUp className="mr-0.5 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-0.5 h-3 w-3" />
                    )}
                    {positive ? "+" : ""}
                    {change.toFixed(2)}%
                  </span>
                )}
                {changeLabel && (
                  <span className="text-muted-foreground/80">{changeLabel}</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }

  return card;
}
