"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import {
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { HiringStage } from "@/types/jobs";

interface HiringTimelineProps {
  stages: HiringStage[];
}

export function HiringTimeline({ stages }: HiringTimelineProps) {
  const totalDays = stages.reduce((sum, s) => sum + s.avgDays, 0);

  return (
    <ReportCard>
      <ReportSectionHeader
        title="Mapa do processo"
        subtitle={`Timeline estimada · ~${totalDays} dias no total`}
      />

      <div className="relative">
        <div
          className="absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-[#4F7CFF] via-[#8B5CF6] to-transparent sm:block"
          aria-hidden="true"
        />

        <div className="space-y-0">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="relative flex items-start gap-4 pb-6 last:pb-0"
            >
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#4F7CFF]/40 bg-[#4F7CFF]/10 text-xs font-bold text-[#4F7CFF]">
                {index + 1}
              </div>

              <div className="flex flex-1 items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    {stage.label}
                  </p>
                  {stage.avgDays > 0 && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-[#9CA3AF]">
                      <Clock className="h-3 w-3" aria-hidden="true" />~
                      {stage.avgDays} {stage.avgDays === 1 ? "dia" : "dias"}
                    </p>
                  )}
                </div>
                {index < stages.length - 1 && (
                  <span
                    className="hidden text-[#9CA3AF]/40 sm:inline"
                    aria-hidden="true"
                  >
                    ↓
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </ReportCard>
  );
}
