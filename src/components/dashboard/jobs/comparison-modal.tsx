"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JobRecommendation } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface ComparisonModalProps {
  jobs: JobRecommendation[];
  open: boolean;
  onClose: () => void;
  recommendedId?: string;
}

function formatSalaryRange(job: JobRecommendation) {
  return job.salary;
}

export function ComparisonModal({
  jobs,
  open,
  onClose,
  recommendedId,
}: ComparisonModalProps) {
  if (jobs.length < 2) return null;

  const [a, b] = jobs;
  const recommended = recommendedId ?? (a.compatibility >= b.compatibility ? a.id : b.id);

  const rows = [
    {
      label: "Salário",
      a: formatSalaryRange(a),
      b: formatSalaryRange(b),
    },
    {
      label: "Tecnologias",
      a: a.stack.join(", "),
      b: b.stack.join(", "),
    },
    {
      label: "Benefícios",
      a: a.benefits.join(" · "),
      b: b.benefits.join(" · "),
    },
    {
      label: "Compatibilidade",
      a: `${a.compatibility}%`,
      b: `${b.compatibility}%`,
    },
    {
      label: "Empresa",
      a: a.company,
      b: b.company,
    },
    {
      label: "Tempo de resposta",
      a: `${a.stats.responseDays} dias`,
      b: `${b.stats.responseDays} dias`,
    },
    {
      label: "Avaliações",
      a: "4.6 / 5.0",
      b: "4.8 / 5.0",
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="comparison-title"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-h-[80vh] max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#111315] shadow-2xl sm:inset-x-auto"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#111315]/95 px-6 py-4 backdrop-blur-sm">
              <div>
                <h2 id="comparison-title" className="text-lg font-semibold text-white">
                  Comparar vagas
                </h2>
                <p className="mt-0.5 text-xs text-[#9CA3AF]">
                  Análise lado a lado com recomendação da IA
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Fechar comparação"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              {/* Headers */}
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div />
                <div className="text-center">
                  <div
                    className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold"
                    style={{ backgroundColor: `${a.color}22`, color: a.color }}
                  >
                    {a.logo}
                  </div>
                  <p className="text-xs font-semibold text-white">{a.company}</p>
                  <p className="mt-0.5 text-[10px] text-[#9CA3AF]">{a.role}</p>
                </div>
                <div className="text-center">
                  <div
                    className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold"
                    style={{ backgroundColor: `${b.color}22`, color: b.color }}
                  >
                    {b.logo}
                  </div>
                  <p className="text-xs font-semibold text-white">{b.company}</p>
                  <p className="mt-0.5 text-[10px] text-[#9CA3AF]">{b.role}</p>
                </div>
              </div>

              {/* Table */}
              <div className="space-y-1">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-3 gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 text-xs"
                  >
                    <span className="font-medium text-[#9CA3AF]">{row.label}</span>
                    <span
                      className={cn(
                        "text-center text-white/90",
                        row.label === "Compatibilidade" &&
                          a.compatibility >= b.compatibility &&
                          "font-semibold text-[#22C55E]"
                      )}
                    >
                      {row.a}
                    </span>
                    <span
                      className={cn(
                        "text-center text-white/90",
                        row.label === "Compatibilidade" &&
                          b.compatibility > a.compatibility &&
                          "font-semibold text-[#22C55E]"
                      )}
                    >
                      {row.b}
                    </span>
                  </div>
                ))}
              </div>

              {/* AI Recommendation */}
              <div className="mt-6 rounded-xl border border-[#4F7CFF]/25 bg-[#4F7CFF]/8 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4F7CFF]/15 ring-1 ring-[#4F7CFF]/30">
                    <Sparkles className="h-4 w-4 text-[#4F7CFF]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Recomendação da IA
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">
                      {recommended === a.id ? (
                        <>
                          A <strong className="text-white">{a.company}</strong> tem
                          maior compatibilidade ({a.compatibility}%) e processo mais
                          rápido ({a.stats.processDays} dias). Ideal se prioriza fit
                          cultural e agilidade.
                        </>
                      ) : (
                        <>
                          A <strong className="text-white">{b.company}</strong> oferece
                          melhor remuneração e visibilidade internacional. Ideal se
                          prioriza crescimento de carreira global.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="h-9 border-white/10 bg-transparent"
                >
                  Fechar
                </Button>
                <Button className="h-9 gap-1.5">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Candidatar na recomendada
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
