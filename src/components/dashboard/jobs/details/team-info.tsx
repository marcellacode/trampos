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
        <p className="text-sm text-[#9CA3AF]">
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
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <Users className="mb-2 h-4 w-4 text-[#4F7CFF]" aria-hidden="true" />
          <p className="text-[10px] text-[#9CA3AF]">{data.teamName}</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {data.size}{" "}
            <span className="text-base font-normal text-[#9CA3AF]">
              pessoas
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:col-span-1">
          <Code2 className="mb-2 h-4 w-4 text-[#4F7CFF]" aria-hidden="true" />
          <p className="text-[10px] text-[#9CA3AF]">Stack predominante</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-xs font-medium text-white/90"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <Clock className="mb-2 h-4 w-4 text-[#4F7CFF]" aria-hidden="true" />
          <p className="text-[10px] text-[#9CA3AF]">Tempo médio na empresa</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {data.averageTenureYears.toLocaleString("pt-BR", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            <span className="text-base font-normal text-[#9CA3AF]">anos</span>
          </p>
        </div>
      </div>
    </ReportCard>
  );
}
