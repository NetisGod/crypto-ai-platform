"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { CheckCircle2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────

type WaitlistStatus = "idle" | "submitting" | "success";

type SecondaryAction =
  | { kind: "button"; label: string; onClick: () => void }
  | { kind: "link"; label: string; href: string };

type MobileWaitlistContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Card (form + success state, headless about how it's framed) ──────────

type MobileWaitlistCardProps = {
  /** Accessible heading id (required for aria wiring in modal contexts). */
  titleId?: string;
  descriptionId?: string;
  /** Optional secondary action rendered next to "Join Waitlist". */
  secondaryAction?: SecondaryAction;
  /** Shown after successful submit. */
  successAction?: SecondaryAction;
  /** Render `DialogTitle`/`DialogDescription` wrappers when inside a Dialog. */
  asDialogHeadings?: boolean;
};

export function MobileWaitlistCard({
  titleId,
  descriptionId,
  secondaryAction,
  successAction,
  asDialogHeadings = false,
}: MobileWaitlistCardProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<WaitlistStatus>("idle");

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = email.trim();
      if (!trimmed) {
        setError("Please enter your email address.");
        return;
      }
      if (!EMAIL_PATTERN.test(trimmed)) {
        setError("Please enter a valid email address.");
        return;
      }
      setError(null);
      setStatus("submitting");
      // Simulate a network request. When a real waitlist endpoint exists,
      // swap this for a fetch('/api/waitlist', ...) call.
      await new Promise((resolve) => window.setTimeout(resolve, 600));
      setStatus("success");
    },
    [email]
  );

  // Title / description components differ based on whether we're inside a
  // Radix Dialog (which needs `DialogTitle` / `DialogDescription` for a11y).
  const Title = asDialogHeadings
    ? ({ children }: { children: ReactNode }) => (
        <DialogTitle id={titleId}>{children}</DialogTitle>
      )
    : ({ children }: { children: ReactNode }) => (
        <h2
          id={titleId}
          className="text-balance text-2xl font-semibold tracking-tight text-foreground"
        >
          {children}
        </h2>
      );
  const Description = asDialogHeadings
    ? ({ children }: { children: ReactNode }) => (
        <DialogDescription id={descriptionId}>{children}</DialogDescription>
      )
    : ({ children }: { children: ReactNode }) => (
        <p
          id={descriptionId}
          className="text-sm leading-relaxed text-muted-foreground"
        >
          {children}
        </p>
      );

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-2">
          <Title>You&apos;re on the list.</Title>
          <Description>
            We&apos;ll notify you when mobile access is ready.
          </Description>
        </div>
        {successAction ? <SecondaryButton action={successAction} primary /> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Smartphone className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          Coming soon
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <Title>Mobile app is coming soon</Title>
        <Description>
          We&apos;re preparing a mobile version of CoinTrace AI. Sign up now
          and be among the first users to get access when it launches.
        </Description>
      </div>
      <form onSubmit={handleSubmit} noValidate className="mt-2 flex flex-col gap-3">
        <label
          htmlFor="mobile-waitlist-email"
          className="text-xs font-medium text-muted-foreground"
        >
          Email address
        </label>
        <Input
          id="mobile-waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          disabled={status === "submitting"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "mobile-waitlist-email-error" : undefined}
        />
        {error ? (
          <p
            id="mobile-waitlist-email-error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {error}
          </p>
        ) : null}
        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {secondaryAction ? (
            <SecondaryButton
              action={secondaryAction}
              disabled={status === "submitting"}
            />
          ) : null}
          <Button
            type="submit"
            variant="hero"
            size="lg"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Adding…" : "Join Waitlist"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function SecondaryButton({
  action,
  disabled,
  primary,
}: {
  action: SecondaryAction;
  disabled?: boolean;
  primary?: boolean;
}) {
  const variant = primary ? "hero" : "ghost";
  const className = cn(primary && "w-full sm:w-auto");
  if (action.kind === "link") {
    return (
      <Button
        variant={variant}
        size="lg"
        className={className}
        disabled={disabled}
        asChild
      >
        <Link href={action.href}>{action.label}</Link>
      </Button>
    );
  }
  return (
    <Button
      type="button"
      variant={variant}
      size="lg"
      className={className}
      onClick={action.onClick}
      disabled={disabled}
    >
      {action.label}
    </Button>
  );
}

// ─── Landing-page Provider (modal) ───────────────────────────────────────

const MobileWaitlistContext = createContext<MobileWaitlistContextValue | null>(
  null
);

export function useMobileWaitlist(): MobileWaitlistContextValue {
  const ctx = useContext(MobileWaitlistContext);
  if (!ctx) {
    throw new Error(
      "useMobileWaitlist must be used inside <MobileWaitlistProvider>"
    );
  }
  return ctx;
}

export function MobileWaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  // Force-remount the card each open so form state resets cleanly.
  const [instanceKey, setInstanceKey] = useState(0);

  const open = useCallback(() => {
    setInstanceKey((k) => k + 1);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<MobileWaitlistContextValue>(
    () => ({ open, close, isOpen }),
    [open, close, isOpen]
  );

  return (
    <MobileWaitlistContext.Provider value={value}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="bg-gradient-hero"
          aria-labelledby="mobile-waitlist-title"
          aria-describedby="mobile-waitlist-desc"
        >
          <MobileWaitlistCard
            key={instanceKey}
            asDialogHeadings
            titleId="mobile-waitlist-title"
            descriptionId="mobile-waitlist-desc"
            secondaryAction={{
              kind: "button",
              label: "Maybe later",
              onClick: close,
            }}
            successAction={{
              kind: "button",
              label: "Done",
              onClick: close,
            }}
          />
        </DialogContent>
      </Dialog>
    </MobileWaitlistContext.Provider>
  );
}
