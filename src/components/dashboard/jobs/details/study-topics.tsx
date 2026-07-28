"use client";

import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AIBadge,
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { StudyPlan, StudyTopic } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface StudyTopicsProps {
  data: StudyPlan;
}

function PriorityStars({ priority }: { priority: StudyTopic["priority"] }) {
  return (
    <span
      className="inline-flex shrink-0 gap-0.5 text-[#F59E0B]"
      aria-label={`Prioridade ${priority} de 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn("text-sm leading-none", i >= priority && "text-foreground/15")}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function StudyTopics({ data }: StudyTopicsProps) {
  return (
    <ReportCard glow>
      <ReportSectionHeader
        title="O que estudar antes da entrevista"
        subtitle="Tópicos priorizados pela IA com base nos requisitos da vaga"
        badge={<AIBadge />}
      />

      <div className="space-y-2.5">
        {data.topics.map((topic) => (
          <div
            key={topic.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3 transition-colors hover:border-primary/20"
          >
            <div className="flex min-w-0 items-center gap-3">
              <BookOpen
                className="h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="truncate text-sm font-medium text-foreground/90">
                {topic.title}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
                Prioridade
              </span>
              <PriorityStars priority={topic.priority} />
            </div>
          </div>
        ))}
      </div>

      <Button
        render={<Link href="/dashboard/estudos" />}
        nativeButton={false}
        variant="outline"
        className="mt-5 h-10 w-full gap-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Criar plano de estudos
      </Button>
    </ReportCard>
  );
}
