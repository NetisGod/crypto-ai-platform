"use client";

import { motion } from "framer-motion";
import { Brain, LineChart, Shield, Zap, Bot, Globe2 } from "lucide-react";
import { Reveal } from "./Reveal";

const features = [
  {
    icon: Brain,
    title: "Predictive AI signals",
    desc: "Deep learning models trained on 10+ years of market data surface high-conviction trade setups in real time.",
  },
  {
    icon: LineChart,
    title: "Advanced analytics",
    desc: "On-chain metrics, sentiment analysis, and orderbook intelligence — all visualized in one elegant dashboard.",
  },
  {
    icon: Bot,
    title: "Automated strategies",
    desc: "Deploy battle-tested AI agents that execute, rebalance, and hedge 24/7 — even while you sleep.",
  },
  {
    icon: Shield,
    title: "Risk management",
    desc: "Smart stop-losses, drawdown limits, and portfolio guardrails keep your capital protected.",
  },
  {
    icon: Zap,
    title: "Lightning execution",
    desc: "Sub-100ms order routing across major exchanges with smart liquidity aggregation.",
  },
  {
    icon: Globe2,
    title: "Global markets",
    desc: "Trade 500+ assets across spot, perpetuals, and DeFi — from a single unified account.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="container mx-auto px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Platform</p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Everything you need to trade with conviction
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From signal generation to execution — CoinTrace AI replaces a dozen tools with one intelligent platform.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.07,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-7 shadow-soft transition-shadow duration-300 hover:shadow-elegant"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow transition-transform duration-300 group-hover:scale-110">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
