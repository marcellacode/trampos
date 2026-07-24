"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import { getCompatibilityColor } from "@/lib/jobs/rank";
import type { RelatedJob } from "@/types/jobs";

interface RelatedJobsProps {
  jobs: RelatedJob[];
}

export function RelatedJobs({ jobs }: RelatedJobsProps) {
  return (
    <ReportCard>
      <ReportSectionHeader
        title="Vagas parecidas"
        subtitle="Outras oportunidades com perfil similar"
      />

      <div className="space-y-2">
        {jobs.map((job) => {
          const color = getCompatibilityColor(job.compatibility);
          return (
            <Link
              key={job.id}
              href={job.href}
              className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:-translate-y-0.5 hover:border-[#4F7CFF]/20"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{
                  backgroundColor: `${job.color}22`,
                  color: job.color,
                }}
              >
                {job.logo}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white group-hover:text-[#4F7CFF]">
                  {job.role}
                </p>
                <p className="text-xs text-[#9CA3AF]">
                  {job.company} · {job.salary}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {job.hasMatch ? (
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ color }}
                  >
                    {job.compatibility}%
                  </span>
                ) : null}
                <ArrowUpRight
                  className="h-4 w-4 text-[#9CA3AF] transition-colors group-hover:text-[#4F7CFF]"
                  aria-hidden="true"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </ReportCard>
  );
}
