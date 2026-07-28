"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/dashboard/animated-counters";
import type { DiscoverySummary } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface DiscoverySummaryBarProps {
  summary: DiscoverySummary;
  className?: string;
}

export function DiscoverySummaryBar({
  summary,
  className,
}: DiscoverySummaryBarProps) {
  const items = [
    {
      label: "Hoje analisamos",
      value: summary.analyzed,
      suffix: " vagas",
      highlight: false,
    },
    {
      label: "Encontramos",
      value: summary.compatible,
      suffix: " compatíveis",
      highlight: false,
    },
    {
      label: "Muito compatíveis",
      value: summary.veryCompatible,
      suffix: "",
      highlight: true,
    },
    {
      label: "Perfeitas",
      value: summary.perfect,
      suffix: "",
      highlight: true,
      accent: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4",
        className
      )}
    >
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            "rounded-xl border px-4 py-3 transition-colors",
            item.accent
              ? "border-primary/30 bg-primary/8"
              : item.highlight
                ? "border-[#22C55E]/20 bg-success/5"
                : "border-border bg-muted/30"
          )}
        >
          <p className="text-[11px] text-muted-foreground">{item.label}</p>
          <p
            className={cn(
              "mt-1 text-lg font-semibold tabular-nums sm:text-xl",
              item.accent
                ? "text-primary"
                : item.highlight
                  ? "text-success"
                  : "text-foreground"
            )}
          >
            <AnimatedCounter
              value={item.value}
              suffix={item.suffix}
              delay={index * 100}
            />
          </p>
        </div>
      ))}
    </motion.div>
  );
}
