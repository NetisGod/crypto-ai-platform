"use client";

import { motion } from "framer-motion";
import { exchanges } from "./ExchangeLogos";

export function LogoCloud() {
  return (
    <section className="border-y border-border/50 bg-card/40">
      <div className="container mx-auto px-6 py-12">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Connected to the world&apos;s leading exchanges
        </p>
        <div className="mt-8 grid grid-cols-3 items-center justify-items-center gap-8 md:grid-cols-6 md:gap-4">
          {exchanges.map(({ name, Icon, color }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.07,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              whileHover={{ y: -4, scale: 1.05 }}
              className="group flex flex-col items-center gap-2"
            >
              <Icon
                className={`h-9 w-9 transition-all duration-300 ${color} opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0`}
              />
              <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-foreground">
                {name.toUpperCase()}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
