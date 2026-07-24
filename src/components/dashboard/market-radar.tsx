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
    <div className="rounded-lg border border-white/10 bg-[#16191C] px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-white">{item.tech}</p>
      <p className="mt-0.5 text-[#22C55E]">+{item.change}% demanda</p>
      <p className="text-[#9CA3AF]">Índice: {item.demand}</p>
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
        "rounded-2xl border border-white/[0.08] bg-[#111315] p-6",
        className
      )}
      aria-labelledby="market-heading"
    >
      <div className="mb-1">
        <h2 id="market-heading" className="text-base font-semibold text-white">
          Radar do Mercado
        </h2>
        <p className="mt-1 text-sm text-[#9CA3AF]">
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
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-xs"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
              aria-hidden="true"
            />
            <span className="font-medium text-white">{trend.tech}</span>
            <span className="text-[#22C55E]">+{trend.change}%</span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
