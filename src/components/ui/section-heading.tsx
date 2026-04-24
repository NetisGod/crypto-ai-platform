import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  live?: boolean;
  size?: "sm" | "md" | "lg";
}

const titleSize: Record<NonNullable<SectionHeadingProps["size"]>, string> = {
  sm: "text-xl sm:text-2xl",
  md: "text-2xl sm:text-3xl",
  lg: "text-3xl sm:text-4xl",
};

/**
 * SectionHeading mirrors the landing page's section-title idiom:
 * tiny uppercase eyebrow in primary, large tight heading, muted
 * description. Optional `live` pulse dot and right-aligned actions.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  live,
  size = "md",
  className,
  ...rest
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
      {...rest}
    >
      <div className="min-w-0 space-y-2">
        {(eyebrow || live) && (
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {live && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/70" />
                <span className="relative h-2 w-2 rounded-full bg-primary" />
              </span>
            )}
            {eyebrow}
          </div>
        )}
        <h1
          className={cn(
            "text-balance font-semibold tracking-tight text-foreground",
            titleSize[size],
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
