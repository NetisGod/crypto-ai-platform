"use client";

import { MobileWaitlistCard } from "./MobileWaitlist";

/**
 * Full-screen overlay rendered inside every `/app/**` route. On desktop
 * (>= md) it's display:none and the normal app UI is used. On mobile it
 * covers the app shell with the waitlist card so mobile users can never
 * reach the in-app experience — regardless of how they arrived on the
 * route (direct URL, shared link, bookmark, etc.).
 *
 * Visibility is driven by Tailwind responsive utilities only, so the
 * overlay is present in SSR output and there is no hydration flash.
 */
export function AppMobileBlock() {
  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-gradient-hero md:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-mobile-block-title"
      aria-describedby="app-mobile-block-desc"
      data-testid="app-mobile-block"
    >
      <div className="flex min-h-full items-center justify-center px-5 py-10">
        <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-6 shadow-elegant sm:p-8">
          <MobileWaitlistCard
            titleId="app-mobile-block-title"
            descriptionId="app-mobile-block-desc"
            secondaryAction={{
              kind: "link",
              label: "Back to home",
              href: "/",
            }}
            successAction={{
              kind: "link",
              label: "Back to home",
              href: "/",
            }}
          />
        </div>
      </div>
    </div>
  );
}
