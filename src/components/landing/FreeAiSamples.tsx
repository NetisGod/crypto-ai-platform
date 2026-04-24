"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";

type Stance = "bullish" | "bearish" | "neutral";
type Term = "Short Term" | "Medium Term" | "Long Term";

type Sample = {
  symbol: string;
  iconSrc: string;
  iconAlt: string;
  term: Term;
  stance: Stance;
  confidence: number;
  summary: string;
  updated: string;
};

const SAMPLES: Sample[] = [
  {
    symbol: "PEPE",
    iconSrc: "/landing/pepe.png",
    iconAlt: "PEPE",
    term: "Medium Term",
    stance: "neutral",
    confidence: 42,
    summary:
      "Market Summary PEPE/USDT is in a neutral consolidation phase after a recent uptrend, with price currently testing the lower boundary of a multi-day ra…",
    updated: "4 days ago",
  },
  {
    symbol: "ZEC",
    iconSrc: "/landing/zec.png",
    iconAlt: "Zcash",
    term: "Short Term",
    stance: "bearish",
    confidence: 65,
    summary:
      "Market Summary ZEC/USDT is in a short-term consolidation phase with a slight bearish lean, trading near the middle of its recent range. The immediate…",
    updated: "4 days ago",
  },
  {
    symbol: "DOGE",
    iconSrc: "/landing/doge.png",
    iconAlt: "Dogecoin",
    term: "Long Term",
    stance: "bullish",
    confidence: 65,
    summary:
      "Market Summary DOGE/USDT is in a corrective phase after a multi-week uptrend, with price currently testing key support near $0.094. The market structu…",
    updated: "5 days ago",
  },
];

const TERM_STYLES: Record<Term, string> = {
  "Short Term": "border-warning/30 bg-warning/10 text-warning",
  "Medium Term": "border-primary/30 bg-primary/10 text-primary",
  "Long Term": "border-ai/30 bg-ai/10 text-ai",
};

const STANCE_STYLES: Record<Stance, string> = {
  bullish: "text-success",
  bearish: "text-danger",
  neutral: "text-warning",
};

function stanceLabel(s: Stance) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function FreeAiSamples() {
  return (
    <section id="samples" className="py-24 sm:py-32">
      <div className="container mx-auto px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Samples
          </p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Free AI Analysis Samples
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore free AI-generated analyses to see how our technology evaluates
            cryptocurrencies — entry points, risk levels, and targets included.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLES.map((s, i) => (
            <motion.article
              key={s.symbol}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.55,
                delay: i * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              whileHover={{ y: -6 }}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition-shadow duration-300 hover:shadow-elegant sm:p-7"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/15 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted/30 shadow-glow ring-1 ring-border/40">
                    <Image
                      src={s.iconSrc}
                      alt={s.iconAlt}
                      width={40}
                      height={40}
                      sizes="40px"
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {s.symbol}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${TERM_STYLES[s.term]}`}
                >
                  {s.term}
                </span>
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className={`text-sm font-semibold ${STANCE_STYLES[s.stance]}`}>
                  {stanceLabel(s.stance)}
                </span>
                <span className={`text-sm font-medium ${STANCE_STYLES[s.stance]}`}>
                  {s.confidence}%
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {s.summary}
              </p>

              <p className="mt-6 text-xs text-muted-foreground/80">{s.updated}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FreeAiSamples;
