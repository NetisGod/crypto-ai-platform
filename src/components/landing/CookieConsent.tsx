"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cointrace:cookie-consent";

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== "accepted" && stored !== "rejected") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // Ignore storage errors (private mode, etc.)
    }
    setVisible(false);
  };

  const handleReject = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "rejected");
    } catch {
      // Ignore storage errors (private mode, etc.)
    }
    setVisible(false);
  };

  const handleDismiss = () => setVisible(false);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 z-50 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm"
        >
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/95 p-5 shadow-elegant backdrop-blur-md sm:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
            />
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss cookie notice"
              className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Cookie className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  We use cookies on our site.
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  We use them to improve your experience and analyze traffic. You can accept or reject.
                </p>
              </div>
            </div>

            <div className="relative mt-5 flex flex-wrap items-center gap-2">
              <Button
                variant="hero"
                size="sm"
                onClick={handleAccept}
                className="flex-1 sm:flex-none"
              >
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                className="flex-1 sm:flex-none"
              >
                Reject
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CookieConsent;
