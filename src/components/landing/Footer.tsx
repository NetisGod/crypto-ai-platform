import { Logo } from "@/components/brand/logo";

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
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
