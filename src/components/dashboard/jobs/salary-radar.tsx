"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalaryDataPoint } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface SalaryRadarProps {
  data: SalaryDataPoint[];
  className?: string;
}

function formatSalary(value: number) {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return `R$ ${value}`;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: SalaryDataPoint & { range: number } }>;
}) {
  if (!active || !payload?.[0]) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-foreground">{item.tech}</p>
      <p className="mt-1 text-muted-foreground">
        Min: {formatSalary(item.min)} · Média: {formatSalary(item.avg)} · Max:{" "}
        {formatSalary(item.max)}
      </p>
    </div>
  );
}

export function SalaryRadar({ data, className }: SalaryRadarProps) {
  const chartData = data.map((d) => ({
    ...d,
    range: d.max - d.min,
    base: d.min,
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "rounded-2xl border border-border bg-card p-6",
        className
      )}
      aria-labelledby="salary-heading"
    >
      <div className="mb-1">
        <h2 id="salary-heading" className="text-base font-semibold text-foreground">
          Radar Salarial
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Faixas salariais por tecnologia no seu mercado
        </p>
      </div>

      <div className="mt-6 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="24%">
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
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              tickFormatter={(v) => formatSalary(v)}
              width={52}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar
              dataKey="base"
              stackId="salary"
              fill="transparent"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="avg"
              fill="#4F7CFF"
              fillOpacity={0.85}
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        {data.map((d) => (
          <span key={d.tech}>
            <strong className="text-foreground">{d.tech}</strong> ·{" "}
            {formatSalary(d.min)} – {formatSalary(d.max)}
          </span>
        ))}
      </div>
    </motion.section>
  );
}
