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
            i < rating ? "fill-current" : "fill-none text-foreground/15"
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

  if (jobs.length === 0) return null;

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
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold"
                style={{ backgroundColor: `${job.color}22`, color: job.color }}
              >
                {job.logo}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">{job.company}</p>
                <p className="text-[10px] text-muted-foreground">{job.salary}</p>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="mt-5 h-10 w-full gap-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
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
              className="fixed inset-x-4 top-[8%] z-50 mx-auto max-h-[84vh] max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl sm:inset-x-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur-sm">
                <div>
                  <h2
                    id="job-comparison-title"
                    className="text-lg font-semibold text-foreground"
                  >
                    Comparar vagas
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Análise comparativa com conclusão da IA
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
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
                      <p className="text-xs font-semibold text-foreground">
                        {job.company}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  {rows.map((row) => (
                    <div
                      key={row.label}
                      className="grid gap-3 rounded-lg border border-white/[0.04] bg-muted/30 px-3 py-2.5 text-xs"
                      style={{
                        gridTemplateColumns: `minmax(100px, 1fr) repeat(${jobs.length}, minmax(0, 1fr))`,
                      }}
                    >
                      <span className="font-medium text-muted-foreground">
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
                              "flex items-center justify-center text-center text-foreground/90",
                              (isRecommended || isBestCompat) &&
                                row.highlight &&
                                "font-semibold text-success"
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

                <div className="mt-6 rounded-xl border border-primary/25 bg-primary/8 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
                      <Sparkles
                        className="h-4 w-4 text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Conclusão da IA
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        &ldquo;{data.aiConclusion}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="h-9 border-border bg-transparent"
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
