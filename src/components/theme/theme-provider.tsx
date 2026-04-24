"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * App-scoped theme provider.
 *
 * We intentionally use a custom `data-app-theme` attribute instead of the
 * global `class` strategy, so that `next-themes` does NOT write `.dark` onto
 * `<html>`. The app wrapper (see `AppShell`) reads `useTheme()` and applies
 * `.dark` to its own subtree only. This keeps the landing page untouched
 * regardless of the user's chosen theme.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-app-theme"
      defaultTheme="light"
      enableSystem
      storageKey="cointrace-theme"
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
