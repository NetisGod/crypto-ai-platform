"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

/**
 * Compact icon-only toggle that flips between light and dark themes.
 *
 * Matches the header's existing `glass` button aesthetic (soft border,
 * translucent card background, backdrop blur) rather than introducing a new
 * visual language. Uses a crossfade + rotate transition between the Sun and
 * Moon icons so the switch feels tactile instead of generic.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR / before hydration we render the light-theme icon to match the
  // provider's `defaultTheme="light"` and avoid hydration mismatches.
  const isDark = mounted ? resolvedTheme === "dark" : false;
  const nextLabel = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Button
      type="button"
      variant="glass"
      size="sm"
      aria-label={nextLabel}
      title={nextLabel}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative h-9 w-9 shrink-0 rounded-full p-0",
        className,
      )}
    >
      <Sun
        aria-hidden
        className={cn(
          "absolute h-4 w-4 transition-all duration-300 ease-out",
          isDark
            ? "-rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 text-amber-500 opacity-100",
        )}
      />
      <Moon
        aria-hidden
        className={cn(
          "absolute h-4 w-4 transition-all duration-300 ease-out",
          isDark
            ? "rotate-0 scale-100 text-accent opacity-100"
            : "rotate-90 scale-0 opacity-0",
        )}
      />
      <span className="sr-only">{nextLabel}</span>
    </Button>
  );
}
