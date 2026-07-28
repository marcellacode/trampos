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
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-muted/30"
            )}
          >
            <div
              className="mb-3 flex h-20 items-center justify-center rounded-lg bg-gradient-to-br from-[#1A1D21] to-[#111315]"
              aria-hidden="true"
            >
              <Globe2
                className={cn(
                  "h-8 w-8",
                  project.highlight ? "text-primary" : "text-muted-foreground/40"
                )}
              />
            </div>
            <p className="text-sm font-medium text-foreground">{project.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{project.description}</p>
            {project.highlight && (
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
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
