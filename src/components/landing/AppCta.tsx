"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMobileWaitlist } from "./MobileWaitlist";

type AppCtaProps = {
  children: ReactNode;
  mobileLabel?: ReactNode;
  href?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
};

/**
 * Landing-page CTA that routes users to `/app` on desktop, and opens the
 * mobile-waitlist modal on mobile (< md). Rendered as two sibling buttons
 * whose visibility is controlled by Tailwind breakpoints so that no JS
 * layout detection is required and SSR output stays deterministic.
 */
export function AppCta({
  children,
  mobileLabel = "Get mobile access",
  href = "/app",
  variant = "hero",
  size,
  className,
}: AppCtaProps) {
  const { open } = useMobileWaitlist();

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn("hidden md:inline-flex", className)}
        asChild
      >
        <Link href={href}>{children}</Link>
      </Button>
      <Button
        variant={variant}
        size={size}
        className={cn("md:hidden", className)}
        onClick={open}
        type="button"
      >
        {mobileLabel}
      </Button>
    </>
  );
}
