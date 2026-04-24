"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AppCta } from "./AppCta";
import { Reveal } from "./Reveal";

export function CTA() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const blobY = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <section ref={ref} className="py-24">
      <div className="container mx-auto px-6">
        <Reveal y={32}>
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-hero px-8 py-20 text-center shadow-elegant sm:px-16">
            <motion.div
              style={{ y: blobY }}
              className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl"
            />
            <h2 className="relative text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Let AI do the heavy lifting.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Join thousands of traders using CoinTrace AI to outperform the market — every single day.
            </p>
            <div className="relative mt-10 flex flex-wrap justify-center gap-4">
              <AppCta
                variant="hero"
                size="lg"
                className="group"
                mobileLabel="Get mobile access"
              >
                Start trading free
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </AppCta>
              <Button variant="outline" size="lg">
                Talk to sales
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
