"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/dashboard/animated-counters";
import type { KpiMetric } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface KPIGridProps {
  metrics: KpiMetric[];
  className?: string;
}

function MiniSparkline({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-8 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}

export function KPIGrid({ metrics, className }: KPIGridProps) {
  return (
    <section aria-label="Indicadores" className={cn(className)}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric, index) => (
          <motion.article
            key={metric.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{ y: -3 }}
            className="group rounded-2xl border border-border bg-card p-4 transition-shadow hover:border-white/[0.12] hover:shadow-[0_0_40px_rgba(79,124,255,0.08)]"
          >
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <AnimatedCounter
                value={metric.value}
                prefix={metric.prefix}
                suffix={metric.suffix}
                delay={150 + index * 80}
                className="text-2xl font-semibold tracking-tight text-foreground"
              />
              {metric.delta && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    metric.deltaPositive ? "text-success" : "text-[#EF4444]"
                  )}
                >
                  {metric.delta}
                </span>
              )}
            </div>
            <div className="mt-3 opacity-80 transition-opacity group-hover:opacity-100">
              <MiniSparkline data={metric.sparkline} color={metric.color} />
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
