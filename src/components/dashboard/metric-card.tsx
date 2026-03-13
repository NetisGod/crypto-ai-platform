"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

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
  loading,
}: MetricCardProps) {
  const positive = change !== undefined && change >= 0;

  return (
    <Card
      className={cn(
        "transition-colors hover:border-border/80",
        variant === "accent" && "border-primary/30 glow-accent",
        selected && "ring-2 ring-primary/60 border-primary/50",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-28 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted/60" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            {(change !== undefined || changeLabel) && (
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                {change !== undefined && (
                  <span
                    className={cn(
                      "flex items-center font-medium",
                      positive ? "text-emerald-500" : "text-red-500"
                    )}
                  >
                    {positive ? (
                      <TrendingUp className="mr-0.5 h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="mr-0.5 h-3.5 w-3.5" />
                    )}
                    {positive ? "+" : ""}
                    {change.toFixed(2)}%
                  </span>
                )}
                {changeLabel && (
                  <span className="text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
