"use client";

import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { getCompatibilityColor } from "@/lib/jobs/rank";
import { cn } from "@/lib/utils";

interface CompatibilityCardProps {
  value: number;
  hasMatch?: boolean;
  className?: string;
  size?: number;
}

export function CompatibilityCard({
  value,
  hasMatch = true,
  className,
  size = 140,
}: CompatibilityCardProps) {
  if (!hasMatch) {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <div
          className="flex flex-col items-center justify-center rounded-full border border-border bg-muted/30"
          style={{ width: size, height: size }}
        >
          <span className="text-sm font-medium text-muted-foreground">Sem match</span>
          <span className="mt-1 text-[10px] text-muted-foreground">
            Complete seu perfil
          </span>
        </div>
      </div>
    );
  }

  const color = getCompatibilityColor(value);
  const data = [
    { name: "match", value },
    { name: "gap", value: 100 - value },
  ];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size * 0.35}
              outerRadius={size * 0.45}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="rgba(255,255,255,0.06)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold tabular-nums"
            style={{ color }}
          >
            {value}
            <span className="text-sm">%</span>
          </motion.span>
          <span className="text-[10px] text-muted-foreground">Compatibilidade</span>
        </div>
        <div
          className="pointer-events-none absolute inset-0 rounded-full opacity-40 blur-xl"
          style={{ backgroundColor: `${color}33` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
