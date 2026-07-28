"use client";

import { Clock, Code2, Users } from "lucide-react";
import {
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { TeamInfo } from "@/types/jobs";

interface TeamInfoSectionProps {
  data: TeamInfo;
}

export function TeamInfoSection({ data }: TeamInfoSectionProps) {
  if (!data.available) {
    return (
      <ReportCard>
        <ReportSectionHeader
          title="Quem trabalha lá?"
          subtitle="Informações da equipe indisponíveis no momento"
        />
        <p className="text-sm text-muted-foreground">
          Dados de equipe serão exibidos quando disponíveis via integração ou
          fontes públicas.
        </p>
      </ReportCard>
    );
  }

  return (
    <ReportCard glow>
      <ReportSectionHeader
        title="Quem trabalha lá?"
        subtitle="Dados públicos e integrações sobre a equipe"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <Users className="mb-2 h-4 w-4 text-primary" aria-hidden="true" />
          <p className="text-[10px] text-muted-foreground">{data.teamName}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {data.size}{" "}
            <span className="text-base font-normal text-muted-foreground">
              pessoas
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4 sm:col-span-1">
          <Code2 className="mb-2 h-4 w-4 text-primary" aria-hidden="true" />
          <p className="text-[10px] text-muted-foreground">Stack predominante</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground/90"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <Clock className="mb-2 h-4 w-4 text-primary" aria-hidden="true" />
          <p className="text-[10px] text-muted-foreground">Tempo médio na empresa</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {data.averageTenureYears.toLocaleString("pt-BR", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            <span className="text-base font-normal text-muted-foreground">anos</span>
          </p>
        </div>
      </div>
    </ReportCard>
  );
}
