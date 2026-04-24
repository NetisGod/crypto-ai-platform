"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Client wrapper that applies the resolved theme as a scoped `.dark` class on
 * the app shell's root element. Landing pages never mount this component, so
 * they always render with the light `:root` tokens.
 *
 * SSR / first paint defaults to the light appearance (matching the provider's
 * `defaultTheme="light"`) so there is no dark flash before hydration for
 * first-time visitors.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div
      className={cn(
        "relative flex h-screen overflow-hidden bg-background transition-colors",
        isDark && "dark",
      )}
    >
      {children}
    </div>
  );
}
