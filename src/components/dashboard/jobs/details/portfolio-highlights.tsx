"use client";

import { ExternalLink, Globe2 } from "lucide-react";
import {
  AIBadge,
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { PortfolioProject } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface PortfolioHighlightsProps {
  projects: PortfolioProject[];
}

export function PortfolioHighlights({ projects }: PortfolioHighlightsProps) {
  return (
    <ReportCard>
      <ReportSectionHeader
        title="Portfólio"
        subtitle="Preview dos projetos que a IA recomenda destacar"
        badge={<AIBadge />}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className={cn(
              "group relative overflow-hidden rounded-xl border p-4 transition-all hover:-translate-y-0.5",
              project.highlight
                ? "border-[#4F7CFF]/30 bg-[#4F7CFF]/5"
                : "border-white/[0.06] bg-white/[0.02]"
            )}
          >
            <div
              className="mb-3 flex h-20 items-center justify-center rounded-lg bg-gradient-to-br from-[#1A1D21] to-[#111315]"
              aria-hidden="true"
            >
              <Globe2
                className={cn(
                  "h-8 w-8",
                  project.highlight ? "text-[#4F7CFF]" : "text-[#9CA3AF]/40"
                )}
              />
            </div>
            <p className="text-sm font-medium text-white">{project.name}</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">{project.description}</p>
            {project.highlight && (
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#4F7CFF]">
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                Destacar
              </span>
            )}
          </div>
        ))}
      </div>
    </ReportCard>
  );
}
