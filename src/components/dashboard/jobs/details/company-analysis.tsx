"use client";

import {
  BadgeCheck,
  Building2,
  Clock,
  Star,
  Users,
} from "lucide-react";
import {
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { CompanyProfile, JobStats } from "@/types/jobs";

interface CompanyAnalysisProps {
  company: string;
  logo: string;
  color: string;
  profile: CompanyProfile;
  stats: JobStats;
}

export function CompanyAnalysis({
  company,
  logo,
  color,
  profile,
  stats,
}: CompanyAnalysisProps) {
  return (
    <ReportCard glow>
      <ReportSectionHeader
        title="Análise da empresa"
        subtitle="Inteligência de mercado sobre quem está contratando"
      />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-base font-bold"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {logo}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">{company}</h3>
              {profile.verified && (
                <BadgeCheck
                  className="h-4 w-4 text-[#22C55E]"
                  aria-label="Empresa verificada"
                />
              )}
            </div>
            <p className="mt-1 text-sm text-[#9CA3AF]">{profile.segment}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-[#9CA3AF]">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                {profile.employees} funcionários
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#9CA3AF]">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                {profile.marketYears} anos de mercado
              </span>
              <span className="inline-flex items-center gap-1 text-[#F59E0B]">
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                {profile.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: "Empresa responde em média",
            value: `${stats.responseDays} dias`,
            icon: Clock,
          },
          {
            label: "Tempo médio do processo",
            value: `${stats.processDays} dias`,
            icon: Clock,
          },
          {
            label: "Número médio de entrevistas",
            value: String(stats.steps),
            icon: Users,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <item.icon
              className="mb-2 h-4 w-4 text-[#4F7CFF]"
              aria-hidden="true"
            />
            <p className="text-[10px] text-[#9CA3AF]">{item.label}</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}
