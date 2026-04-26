import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { AppCta } from "./AppCta";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={41} priority />
          <span className="text-lg font-semibold tracking-tight text-foreground">CoinTrace AI</span>
        </Link>
        <nav className="hidden items-center gap-5 lg:gap-7 xl:gap-8 md:flex">
          <Link href="/#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</Link>
          <Link href="/#analytics" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Analytics</Link>
          <Link
            href="/#samples"
            className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Free AI Analysis Samples
          </Link>
          <Link href="/crypto-market-intelligence" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">SEO Guides</Link>
          <Link href="/#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
            <Link href="/app">Sign in</Link>
          </Button>
          <AppCta variant="hero" size="sm" mobileLabel="Get mobile access">
            Go to app
          </AppCta>
        </div>
      </div>
    </header>
  );
}
