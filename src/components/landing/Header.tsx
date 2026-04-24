import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={41} priority />
          <span className="text-lg font-semibold tracking-tight text-foreground">CoinTrace AI</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#analytics" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Analytics</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/app">Sign in</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link href="/app">Go to app</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
