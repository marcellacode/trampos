"use client";

import { motion } from "framer-motion";
import {
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { CultureIndicator } from "@/types/jobs";

interface CultureRadarProps {
  data: CultureIndicator[];
}

export function CultureRadar({ data }: CultureRadarProps) {
  return (
    <ReportCard>
      <ReportSectionHeader
        title="Cultura"
        subtitle="Indicadores de cultura organizacional analisados pela IA"
      />

      <div className="space-y-5">
        {data.map((item, index) => (
          <div key={item.id}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {item.label}
              </span>
              <span className="text-xs tabular-nums text-[#9CA3AF]">
                {item.score}/10
              </span>
            </div>
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${item.score * 10}%` }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.08,
                  ease: "easeOut",
                }}
                className="h-full rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#8B5CF6]"
                style={{
                  boxShadow: "0 0 12px rgba(79,124,255,0.4)",
                }}
              />
            </div>
            <p className="text-xs leading-relaxed text-[#9CA3AF]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}
