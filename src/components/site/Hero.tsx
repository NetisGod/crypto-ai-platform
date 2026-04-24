import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-6 pt-20 pb-28 lg:grid-cols-2 lg:gap-16 lg:pt-28">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            New · GPT-grade market signals
          </div>
          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Trade smarter with{" "}
            <span className="bg-gradient-text bg-clip-text text-transparent">AI-powered</span> crypto analytics.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            CoinTrace AI fuses real-time market data with predictive intelligence — so you can spot opportunities, manage risk, and execute with institutional-grade precision.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button variant="hero" size="lg" className="group" asChild>
              <Link href="/dashboard">
                Start trading free
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              <Play className="mr-1 h-4 w-4" /> Watch demo
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            SOC 2 Type II · Bank-grade encryption · No card required
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-accent opacity-20 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 shadow-elegant backdrop-blur-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/hero-ai-crypto.jpg"
              alt="AI-powered crypto analytics dashboard with predictive charts"
              width={1280}
              height={1280}
              className="h-auto w-full"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border/60 bg-card/90 p-4 shadow-card backdrop-blur sm:block">
            <p className="text-xs font-medium text-muted-foreground">BTC · 24h forecast</p>
            <p className="mt-1 text-2xl font-semibold text-foreground tabular-nums">+4.82%</p>
            <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-3/4 rounded-full bg-gradient-primary" />
            </div>
          </div>
          <div className="absolute -top-6 right-4 hidden rounded-2xl border border-border/60 bg-card/90 p-4 shadow-card backdrop-blur sm:block">
            <p className="text-xs font-medium text-muted-foreground">Confidence</p>
            <p className="mt-1 text-2xl font-semibold text-primary tabular-nums">94%</p>
          </div>
        </div>
      </div>
    </section>
  );
}
