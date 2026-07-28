"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
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
import type { SalaryComparisonData } from "@/types/jobs";

interface SalaryComparisonProps {
  data: SalaryComparisonData;
}

function formatSalary(value: number) {
  return `R$ ${(value / 1000).toFixed(0)}k`;
}

export function SalaryComparison({ data }: SalaryComparisonProps) {
  const chartData = [
    {
      name: "Mercado",
      min: data.marketMin,
      range: data.marketMax - data.marketMin,
      color: "#9CA3AF",
    },
    {
      name: "Vaga",
      min: data.jobMin,
      range: data.jobMax - data.jobMin,
      color: "#4F7CFF",
    },
    {
      name: "Sua expectativa",
      min: data.userExpectation,
      range: 0,
      color: "#22C55E",
    },
  ];

  const maxVal = Math.max(data.marketMax, data.jobMax, data.userExpectation) * 1.1;

  return (
    <ReportCard>
      <ReportSectionHeader
        title="Salário"
        subtitle="Comparação entre faixa da vaga, mercado e sua expectativa"
        badge={<AIBadge />}
      />

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, maxVal]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              tickFormatter={formatSalary}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              width={110}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const item = payload[0].payload;
                if (item.name === "Sua expectativa") {
                  return (
                    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-muted-foreground">
                        {formatSalary(item.min)}
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-muted-foreground">
                      {formatSalary(item.min)} –{" "}
                      {formatSalary(item.min + item.range)}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="min" stackId="a" fill="transparent" />
            <Bar dataKey="range" stackId="a" radius={[0, 6, 6, 0]} maxBarSize={20}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
            <ReferenceLine
              x={data.userExpectation}
              stroke="#22C55E"
              strokeDasharray="4 4"
              strokeWidth={2}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 rounded-xl border border-[#22C55E]/20 bg-success/5 px-4 py-3">
        <p className="text-sm text-foreground/90">{data.insight}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-muted-foreground">
        <span>
          <strong className="text-primary">Vaga</strong> ·{" "}
          {formatSalary(data.jobMin)} – {formatSalary(data.jobMax)}
        </span>
        <span>
          <strong className="text-muted-foreground">Mercado</strong> ·{" "}
          {formatSalary(data.marketMin)} – {formatSalary(data.marketMax)}
        </span>
        <span>
          <strong className="text-success">Expectativa</strong> ·{" "}
          {formatSalary(data.userExpectation)}
        </span>
      </div>
    </ReportCard>
  );
}
