"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GitCompare, Sparkles, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AIBadge,
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { JobComparison } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface JobComparisonSectionProps {
  data: JobComparison;
}

function BenefitsStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-[#F59E0B]" aria-label={`${rating} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating ? "fill-current" : "fill-none text-white/15"
          )}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function JobComparisonSection({ data }: JobComparisonSectionProps) {
  const [open, setOpen] = useState(false);
  const jobs = data.jobs;

  const rows = [
    {
      label: "Salário",
      values: jobs.map((j) => j.salary),
    },
    {
      label: "Remoto",
      values: jobs.map((j) => j.remote),
    },
    {
      label: "Compatibilidade",
      values: jobs.map((j) => `${j.compatibility}%`),
      highlight: true,
    },
    {
      label: "Processo",
      values: jobs.map((j) => `${j.processSteps} etapas`),
    },
    {
      label: "Benefícios",
      values: jobs.map((j) => j.benefitsRating),
      isStars: true,
    },
  ];

  return (
    <>
      <ReportCard glow>
        <ReportSectionHeader
          title="Comparar com outras vagas"
          subtitle="Veja lado a lado como esta oportunidade se posiciona no mercado"
          badge={<AIBadge />}
        />

        <div className="flex flex-wrap gap-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold"
                style={{ backgroundColor: `${job.color}22`, color: job.color }}
              >
                {job.logo}
              </div>
              <div>
                <p className="text-xs font-medium text-white">{job.company}</p>
                <p className="text-[10px] text-[#9CA3AF]">{job.salary}</p>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="mt-5 h-10 w-full gap-2 border-[#4F7CFF]/30 bg-[#4F7CFF]/5 text-[#4F7CFF] hover:bg-[#4F7CFF]/10"
        >
          <GitCompare className="h-4 w-4" aria-hidden="true" />
          Comparar
        </Button>
      </ReportCard>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="job-comparison-title"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed inset-x-4 top-[8%] z-50 mx-auto max-h-[84vh] max-w-3xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#111315] shadow-2xl sm:inset-x-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#111315]/95 px-6 py-4 backdrop-blur-sm">
                <div>
                  <h2
                    id="job-comparison-title"
                    className="text-lg font-semibold text-white"
                  >
                    Comparar vagas
                  </h2>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">
                    Análise comparativa com conclusão da IA
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Fechar comparação"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6">
                <div
                  className="mb-4 grid gap-3"
                  style={{
                    gridTemplateColumns: `minmax(100px, 1fr) repeat(${jobs.length}, minmax(0, 1fr))`,
                  }}
                >
                  <div />
                  {jobs.map((job) => (
                    <div key={job.id} className="text-center">
                      <div
                        className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold"
                        style={{
                          backgroundColor: `${job.color}22`,
                          color: job.color,
                        }}
                      >
                        {job.logo}
                      </div>
                      <p className="text-xs font-semibold text-white">
                        {job.company}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  {rows.map((row) => (
                    <div
                      key={row.label}
                      className="grid gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 text-xs"
                      style={{
                        gridTemplateColumns: `minmax(100px, 1fr) repeat(${jobs.length}, minmax(0, 1fr))`,
                      }}
                    >
                      <span className="font-medium text-[#9CA3AF]">
                        {row.label}
                      </span>
                      {row.values.map((value, i) => {
                        const job = jobs[i];
                        const isRecommended =
                          row.highlight &&
                          job.id === data.recommendedCompanyId;
                        const isBestCompat =
                          row.highlight &&
                          job.compatibility ===
                            Math.max(...jobs.map((j) => j.compatibility));

                        return (
                          <span
                            key={job.id}
                            className={cn(
                              "flex items-center justify-center text-center text-white/90",
                              (isRecommended || isBestCompat) &&
                                row.highlight &&
                                "font-semibold text-[#22C55E]"
                            )}
                          >
                            {row.isStars ? (
                              <BenefitsStars rating={value as number} />
                            ) : (
                              value
                            )}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-[#4F7CFF]/25 bg-[#4F7CFF]/8 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4F7CFF]/15 ring-1 ring-[#4F7CFF]/30">
                      <Sparkles
                        className="h-4 w-4 text-[#4F7CFF]"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Conclusão da IA
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">
                        &ldquo;{data.aiConclusion}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="h-9 border-white/10 bg-transparent"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
