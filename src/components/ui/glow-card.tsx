import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual density.
   * - "flat": soft landing-style card, hover lifts shadow.
   * - "gradient": card sits on the hero gradient (for premium hero-like modules).
   * - "outline": transparent with border only (minimal).
   */
  variant?: "flat" | "gradient" | "outline";
  /** Adds a soft accent glow ring (for selected/active states). */
  glow?: boolean;
  /** If true, do not render the soft hover blob. */
  noHoverBlob?: boolean;
  /** Inner padding preset. */
  padding?: "none" | "sm" | "md" | "lg";
  as?: keyof React.JSX.IntrinsicElements;
}

const paddingMap: Record<NonNullable<GlowCardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-7 sm:p-8",
};

/**
 * GlowCard is the app-side equivalent of the landing page's
 * rounded-2xl Feature card: subtle border, soft shadow, hover lift
 * and a colored blur blob that fades in on hover. Use it for any
 * dashboard/token/narrative card to match the landing idiom.
 */
export const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  (
    {
      variant = "flat",
      glow = false,
      noHoverBlob = false,
      padding = "md",
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-2xl border transition-shadow duration-300",
          variant === "flat" &&
            "border-border/60 bg-card shadow-soft hover:shadow-elegant",
          variant === "gradient" &&
            "border-border/60 bg-gradient-hero shadow-soft hover:shadow-elegant",
          variant === "outline" &&
            "border-border/60 bg-transparent hover:bg-card/40",
          glow && "ring-glow",
          paddingMap[padding],
          className,
        )}
        {...rest}
      >
        {children}
        {!noHoverBlob && (
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/15 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
      </div>
    );
  },
);
GlowCard.displayName = "GlowCard";
