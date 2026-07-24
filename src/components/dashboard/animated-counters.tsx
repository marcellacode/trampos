"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  delay?: number;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  className,
  delay = 0,
  decimals = 0,
}: AnimatedCounterProps) {
  const spring = useSpring(0, { stiffness: 70, damping: 22 });
  const display = useTransform(spring, (current) => {
    const rounded =
      decimals > 0
        ? current.toFixed(decimals)
        : Math.round(current).toLocaleString("pt-BR");
    return `${prefix}${rounded}${suffix}`;
  });
  const [text, setText] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    const timeout = window.setTimeout(() => spring.set(value), delay);
    const unsubscribe = display.on("change", (v) => setText(v));
    return () => {
      window.clearTimeout(timeout);
      unsubscribe();
    };
  }, [delay, display, spring, value, prefix, suffix]);

  return (
    <motion.span
      className={cn("tabular-nums", className)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.35 }}
    >
      {text}
    </motion.span>
  );
}
