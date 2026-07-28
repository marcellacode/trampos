"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import type { MarketInsight } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface MarketInsightsProps {
  insights: MarketInsight[];
  className?: string;
}

export function MarketInsights({ insights, className }: MarketInsightsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "rounded-2xl border border-border bg-card p-6",
        className
      )}
      aria-labelledby="market-insights-heading"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 ring-1 ring-[#22C55E]/25">
          <TrendingUp className="h-4 w-4 text-success" aria-hidden="true" />
        </div>
        <div>
          <h2
            id="market-insights-heading"
            className="text-base font-semibold text-foreground"
          >
            Mercado hoje
          </h2>
          <p className="text-xs text-muted-foreground">Demanda em alta nas últimas 24h</p>
        </div>
      </div>

      <ul className="space-y-2" role="list">
        {insights.map((insight, index) => (
          <motion.li
            key={insight.id}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-muted/30 px-4 py-3 transition-colors hover:border-border hover:bg-muted/50"
          >
            <span className="text-sm font-medium text-foreground">{insight.tech}</span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
              <TrendingUp className="h-3 w-3" aria-hidden="true" />+
              {insight.change}%
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
