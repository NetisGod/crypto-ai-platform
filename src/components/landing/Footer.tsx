import { Logo } from "@/components/brand/logo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo size={41} />
            <span className="text-sm font-semibold text-foreground">CoinTrace AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CoinTrace AI. Trading involves risk. Not financial advice.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/risk-disclaimer" className="hover:text-foreground">
              Risk Disclaimer
            </Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
