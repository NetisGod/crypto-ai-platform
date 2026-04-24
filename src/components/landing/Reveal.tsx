"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
} & Omit<HTMLMotionProps<"div">, "children">;

/**
 * Fades + slides children into view when scrolled to.
 * Use for landing sections — runs once.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  ...rest
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
