export function LogoCloud() {
  const logos = ["BINANCE", "COINBASE", "KRAKEN", "BYBIT", "OKX", "GEMINI"];
  return (
    <section className="border-y border-border/50 bg-card/40">
      <div className="container mx-auto px-6 py-10">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Connected to the world&apos;s leading exchanges
        </p>
        <div className="mt-6 grid grid-cols-3 items-center justify-items-center gap-6 opacity-60 md:grid-cols-6">
          {logos.map((l) => (
            <span key={l} className="text-sm font-semibold tracking-[0.2em] text-muted-foreground">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
