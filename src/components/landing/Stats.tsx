"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const stats = [
  { value: "$4.2B+", label: "Volume traded" },
  { value: "180k+", label: "Active traders" },
  { value: "94%", label: "Signal accuracy" },
  { value: "24/7", label: "AI monitoring" },
];

export function Stats() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const panelY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section id="analytics" ref={ref} className="relative py-20">
      <div className="container mx-auto px-6">
        <motion.div
          style={{ y: panelY }}
          className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-primary px-8 py-14 shadow-elegant sm:px-14"
        >
          <div className="grid grid-cols-2 gap-10 text-center sm:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
              >
                <p className="text-4xl font-semibold tracking-tight text-primary-foreground sm:text-5xl">
                  {s.value}
                </p>
                <p className="mt-2 text-sm font-medium uppercase tracking-widest text-primary-foreground/70">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
