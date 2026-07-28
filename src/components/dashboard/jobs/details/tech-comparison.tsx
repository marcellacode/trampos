"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { TechLevel, TechRequirement } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface TechComparisonProps {
  data: TechRequirement[];
}

const LEVEL_ORDER: Record<TechLevel, number> = {
  básico: 1,
  intermediário: 2,
  avançado: 3,
};

function getLevelDiff(
  required: TechLevel,
  user: TechLevel
): "above" | "match" | "below" {
  const diff = LEVEL_ORDER[user] - LEVEL_ORDER[required];
  if (diff > 0) return "above";
  if (diff < 0) return "below";
  return "match";
}

const DIFF_CONFIG = {
  above: {
    icon: TrendingUp,
    label: "Acima",
    color: "#22C55E",
    bg: "bg-success/10 border-[#22C55E]/20",
  },
  match: {
    icon: Minus,
    label: "Compatível",
    color: "#4F7CFF",
    bg: "bg-primary/10 border-primary/20",
  },
  below: {
    icon: TrendingDown,
    label: "Gap",
    color: "#F59E0B",
    bg: "bg-[#F59E0B]/10 border-[#F59E0B]/20",
  },
};

export function TechComparison({ data }: TechComparisonProps) {
  return (
    <ReportCard>
      <ReportSectionHeader
        title="Stack"
        subtitle="Comparação entre o nível exigido e o seu nível em cada tecnologia"
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-border text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="pb-3 pr-4">Tecnologia</th>
              <th className="pb-3 pr-4">Nível exigido</th>
              <th className="pb-3 pr-4">Seu nível</th>
              <th className="pb-3">Diferença</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tech) => {
              const diff = getLevelDiff(tech.requiredLevel, tech.userLevel);
              const config = DIFF_CONFIG[diff];
              const Icon = config.icon;

              return (
                <tr
                  key={tech.name}
                  className="border-b border-white/[0.04] last:border-0"
                >
                  <td className="py-3.5 pr-4">
                    <span className="text-sm font-medium text-foreground">
                      {tech.name}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="text-sm capitalize text-muted-foreground">
                      {tech.requiredLevel}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="text-sm capitalize text-foreground/90">
                      {tech.userLevel}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
                        config.bg
                      )}
                      style={{ color: config.color }}
                    >
                      <Icon className="h-3 w-3" aria-hidden="true" />
                      {config.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ReportCard>
  );
}
