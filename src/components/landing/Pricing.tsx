"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Reveal } from "./Reveal";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    desc: "For traders exploring AI insights.",
    features: ["Real-time market data", "Basic AI signals (5/day)", "Portfolio tracking", "Community access"],
    cta: "Start free",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    desc: "For active traders who want the edge.",
    features: ["Unlimited AI signals", "Advanced analytics", "Automated strategies", "Priority execution", "API access"],
    cta: "Start 14-day trial",
    variant: "hero" as const,
    highlighted: true,
  },
  {
    name: "Institutional",
    price: "Custom",
    period: "",
    desc: "For funds and trading desks.",
    features: ["Dedicated infrastructure", "Custom AI models", "White-glove onboarding", "24/7 priority support", "SOC 2 compliance"],
    cta: "Contact sales",
    variant: "outline" as const,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="container mx-auto px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Pricing</p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Plans that scale with your strategy
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you&apos;re ready to go pro.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              whileHover={{ y: -6 }}
              className={`relative flex h-full min-h-0 flex-col rounded-3xl border p-8 transition-shadow duration-300 ${
                p.highlighted
                  ? "border-primary/40 bg-card shadow-elegant lg:scale-[1.03]"
                  : "border-border/60 bg-card shadow-soft hover:shadow-elegant"
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold tracking-tight text-foreground">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-semibold tracking-tight text-foreground">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <ul className="mt-8 flex min-h-0 flex-1 flex-col gap-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={p.variant} size="lg" className="mt-10 w-full shrink-0" asChild>
                <Link href="/app">{p.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
