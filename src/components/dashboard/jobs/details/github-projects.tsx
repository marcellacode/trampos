"use client";

import { FolderGit2 } from "lucide-react";
import {
  AIBadge,
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { GithubProject } from "@/types/jobs";

interface GithubProjectsProps {
  projects: GithubProject[];
}

export function GithubProjects({ projects }: GithubProjectsProps) {
  return (
    <ReportCard>
      <ReportSectionHeader
        title="Projetos recomendados"
        subtitle="A IA analisou seu GitHub e selecionou os projetos mais relevantes"
        badge={<AIBadge />}
      />

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
              <FolderGit2
                className="h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{project.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {project.description}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-primary/90">
                {project.relevance}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <FolderGit2 className="h-3.5 w-3.5" aria-hidden="true" />
        Esses projetos fortalecem sua candidatura.
      </p>
    </ReportCard>
  );
}
