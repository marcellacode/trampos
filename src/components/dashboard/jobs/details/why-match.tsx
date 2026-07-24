"use client";

import { AlertTriangle, Check } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AIBadge,
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { JobDetail } from "@/types/jobs";

interface WhyMatchProps {
  job: JobDetail;
}

export function WhyMatch({ job }: WhyMatchProps) {
  const chartData = job.weightFactors.map((f) => ({
    label: f.label,
    weight: f.weight,
  }));

  const matches = job.reasons.filter((r) => r.type === "match");
  const warnings = job.reasons.filter((r) => r.type === "warning");

  return (
    <ReportCard glow className="border-[#4F7CFF]/20">
      <ReportSectionHeader
        title="Por que essa vaga é ideal?"
        subtitle="Análise personalizada da IA sobre seu fit com a oportunidade"
        badge={<AIBadge />}
      />

      <p className="mb-6 text-sm leading-relaxed text-white/90">
        {job.whyMatchSummary}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
            Motivos
          </p>
          <ul className="space-y-2.5" role="list">
            {matches.map((reason) => (
              <li
                key={reason.id}
                className="flex items-start gap-2.5 text-sm text-white/90"
              >
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]"
                  aria-hidden="true"
                />
                {reason.text}
              </li>
            ))}
          </ul>

          {warnings.length > 0 && (
            <>
              <p className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
                Pontos de atenção
              </p>
              <ul className="space-y-2.5" role="list">
                {warnings.map((reason) => (
                  <li
                    key={reason.id}
                    className="flex items-start gap-2.5 text-sm text-white/90"
                  >
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]"
                      aria-hidden="true"
                    />
                    {reason.text}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            Gráfico de pesos
          </p>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 0, right: 16 }}
              >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  width={90}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    return (
                      <div className="rounded-lg border border-white/10 bg-[#16191C] px-3 py-2 text-xs shadow-xl">
                        <p className="font-medium text-white">
                          {payload[0].payload.label}
                        </p>
                        <p className="text-[#9CA3AF]">
                          Peso: {payload[0].value}%
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="weight"
                  fill="#4F7CFF"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ReportCard>
  );
}
