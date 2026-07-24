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
        "rounded-2xl border border-white/[0.08] bg-[#111315] p-6",
        className
      )}
      aria-labelledby="market-insights-heading"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E]/10 ring-1 ring-[#22C55E]/25">
          <TrendingUp className="h-4 w-4 text-[#22C55E]" aria-hidden="true" />
        </div>
        <div>
          <h2
            id="market-insights-heading"
            className="text-base font-semibold text-white"
          >
            Mercado hoje
          </h2>
          <p className="text-xs text-[#9CA3AF]">Demanda em alta nas últimas 24h</p>
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
            className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/[0.08] hover:bg-white/[0.04]"
          >
            <span className="text-sm font-medium text-white">{insight.tech}</span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#22C55E]/10 px-2.5 py-1 text-xs font-semibold text-[#22C55E]">
              <TrendingUp className="h-3 w-3" aria-hidden="true" />+
              {insight.change}%
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
