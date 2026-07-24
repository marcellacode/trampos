"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface CompatibilityBarProps {
  value: number;
  hasMatch?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CompatibilityBar({
  value,
  hasMatch = true,
  className,
  size = "md",
}: CompatibilityBarProps) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const width = useTransform(spring, (v) => `${v}%`);

  useEffect(() => {
    spring.set(hasMatch ? value : 0);
  }, [value, hasMatch, spring]);

  if (!hasMatch) {
    return (
      <p className={cn("text-xs text-[#9CA3AF]", className)}>
        Faça login para calcular compatibilidade personalizada.
      </p>
    );
  }

  const color =
    value >= 95
      ? "#22C55E"
      : value >= 85
        ? "#4F7CFF"
        : value >= 70
          ? "#F59E0B"
          : "#9CA3AF";

  const heights = { sm: "h-1", md: "h-1.5", lg: "h-2" };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#9CA3AF]">Compatibilidade</span>
        <motion.span
          className="text-sm font-semibold tabular-nums"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {value}%
        </motion.span>
      </div>
      <div
        className={cn(
          "overflow-hidden rounded-full bg-white/[0.06]",
          heights[size]
        )}
      >
        <motion.div
          className={cn("rounded-full", heights[size])}
          style={{
            width,
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}
