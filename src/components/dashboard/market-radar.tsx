"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MarketTrend } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface MarketRadarProps {
  trends: MarketTrend[];
  className?: string;
}

const BAR_COLORS = ["#4F7CFF", "#22C55E", "#8B5CF6", "#F59E0B", "#06B6D4"];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MarketTrend }>;
}) {
  if (!active || !payload?.[0]) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-foreground">{item.tech}</p>
      <p className="mt-0.5 text-success">+{item.change}% demanda</p>
      <p className="text-muted-foreground">Índice: {item.demand}</p>
    </div>
  );
}

export function MarketRadar({ trends, className }: MarketRadarProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "rounded-2xl border border-border bg-card p-6",
        className
      )}
      aria-labelledby="market-heading"
    >
      <div className="mb-1">
        <h2 id="market-heading" className="text-base font-semibold text-foreground">
          Radar do Mercado
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tecnologias em alta na sua área
        </p>
      </div>

      <div className="mt-6 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trends} barCategoryGap="28%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="tech"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="demand" radius={[8, 8, 4, 4]} maxBarSize={40}>
              {trends.map((entry, index) => (
                <Cell
                  key={entry.id}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2" role="list">
        {trends.map((trend, index) => (
          <li
            key={trend.id}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-xs"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
              aria-hidden="true"
            />
            <span className="font-medium text-foreground">{trend.tech}</span>
            <span className="text-success">+{trend.change}%</span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
