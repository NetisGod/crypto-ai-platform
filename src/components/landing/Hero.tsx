"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, ShieldCheck } from "lucide-react";

const FORECAST_START = 1.2;
const FORECAST_END = 4.82;

function BtcForecastCard({ cardBottomY }: { cardBottomY: MotionValue<number> }) {
  const pct = useMotionValue(FORECAST_START);
  const [label, setLabel] = useState(`+${FORECAST_START.toFixed(2)}%`);

  useMotionValueEvent(pct, "change", (v) => {
    setLabel(`+${v.toFixed(2)}%`);
  });

  useEffect(() => {
    const controls = animate(pct, FORECAST_END, {
      duration: 1.85,
      delay: 0.55,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [pct]);

  return (
    <motion.div
      style={{ y: cardBottomY }}
      initial={{ opacity: 0, x: -20, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
      whileHover={{
        scale: 1.03,
        transition: { type: "spring", stiffness: 400, damping: 22 },
      }}
      whileTap={{ scale: 0.98 }}
      className="absolute -bottom-6 -left-6 hidden cursor-default rounded-2xl border border-border/60 bg-card/90 p-4 shadow-card backdrop-blur transition-shadow hover:shadow-elegant sm:block"
      data-testid="hero-btc-forecast"
    >
      <p className="text-xs font-medium text-muted-foreground">BTC · 24h forecast</p>
      <p className="mt-1 text-2xl font-semibold text-foreground tabular-nums">{label}</p>
      <div className="relative mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full w-[75%] origin-left rounded-full bg-gradient-primary"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: 1.85,
            delay: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
        >
          <motion.div
            className="absolute inset-y-0 w-[45%] bg-gradient-to-r from-transparent via-white/40 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "320%" }}
            transition={{
              duration: 1.05,
              delay: 2.2,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax driven by section's scroll position
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Different layers move at different speeds (depth illusion)
  const blobLeftY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const blobRightY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const cardBottomY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const cardTopY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.4]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-hero"
    >
      {/* ─── Background blobs (slowest layer) ─────────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          style={{ y: blobLeftY }}
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/15 blur-3xl"
        />
        <motion.div
          style={{ y: blobRightY }}
          className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-accent/20 blur-3xl"
        />
      </div>

      <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-6 pt-20 pb-28 lg:grid-cols-2 lg:gap-16 lg:pt-28">
        {/* ─── Text column (gentle fade + drift on scroll) ────── */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="max-w-xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary" />
            New · GPT-grade market signals
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            Trade smarter with{" "}
            <span className="bg-gradient-text bg-clip-text text-transparent">
              AI-powered
            </span>{" "}
            crypto analytics.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground"
          >
            CoinTrace AI fuses real-time market data with predictive intelligence — so you can spot opportunities, manage risk, and execute with institutional-grade precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Button variant="hero" size="lg" className="group" asChild>
              <Link href="/app">
                Start trading free
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              <Play className="mr-1 h-4 w-4" /> Watch demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            SOC 2 Type II · Bank-grade encryption · No card required
          </motion.div>
        </motion.div>

        {/* ─── Image column (multi-speed parallax) ──────────────── */}
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-accent opacity-20 blur-2xl" />

          <motion.div
            style={{ y: imageY }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 shadow-elegant backdrop-blur-xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/hero-ai-crypto.jpg"
              alt="AI-powered crypto analytics dashboard with predictive charts"
              width={1280}
              height={1280}
              className="h-auto w-full"
            />
          </motion.div>

          {/* Floating "BTC forecast" — moves more than image */}
          <BtcForecastCard cardBottomY={cardBottomY} />

          {/* Floating "Confidence" — moves the most (closest to viewer) */}
          <motion.div
            style={{ y: cardTopY }}
            initial={{ opacity: 0, x: 20, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="absolute -top-6 right-4 hidden rounded-2xl border border-border/60 bg-card/90 p-4 shadow-card backdrop-blur sm:block"
          >
            <p className="text-xs font-medium text-muted-foreground">Confidence</p>
            <p className="mt-1 text-2xl font-semibold text-primary tabular-nums">94%</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
