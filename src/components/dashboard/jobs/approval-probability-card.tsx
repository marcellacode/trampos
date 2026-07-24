"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bot, Check, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  ApprovalLevel,
  ApprovalProbability,
  SimulationStageStatus,
} from "@/types/jobs";
import { cn } from "@/lib/utils";

interface ApprovalProbabilityCardProps {
  data: ApprovalProbability;
  className?: string;
}

const LEVEL_LABELS: Record<ApprovalLevel, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

const LEVEL_COLORS: Record<ApprovalLevel, string> = {
  baixa: "#9CA3AF",
  media: "#F59E0B",
  alta: "#22C55E",
};

function StageIcon({ status }: { status: SimulationStageStatus }) {
  if (status === "pass") {
    return (
      <Check className="h-4 w-4 shrink-0 text-[#22C55E]" aria-hidden="true" />
    );
  }
  if (status === "warning") {
    return (
      <AlertTriangle
        className="h-4 w-4 shrink-0 text-[#F59E0B]"
        aria-hidden="true"
      />
    );
  }
  return (
    <span className="text-sm font-medium text-[#EF4444]" aria-hidden="true">
      ✕
    </span>
  );
}

export function ApprovalProbabilityCard({
  data,
  className,
}: ApprovalProbabilityCardProps) {
  const [simulating, setSimulating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const levelColor = LEVEL_COLORS[data.level];

  function handleSimulate() {
    setSimulating(true);
    setShowResult(false);
    setTimeout(() => {
      setSimulating(false);
      setShowResult(true);
    }, 1200);
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            Chance de Aprovação
          </p>
          <p className="mt-1 text-[10px] text-[#9CA3AF]/80">
            Probabilidade estimada
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-sm font-semibold"
            style={{ color: levelColor }}
          >
            {LEVEL_LABELS[data.level]}
          </p>
          <div
            className="mt-0.5 flex gap-0.5"
            aria-label={`${data.stars} de 5 estrelas`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < data.stars
                    ? "fill-[#F59E0B] text-[#F59E0B]"
                    : "text-white/10"
                )}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-[#9CA3AF]">Porque:</p>
        <ul className="space-y-1.5" role="list">
          {data.reasons.map((reason, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-white/85"
            >
              <span
                className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#4F7CFF]"
                aria-hidden="true"
              />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 border-t border-white/[0.06] pt-4">
        <div className="mb-3 flex items-center gap-1.5">
          <Bot className="h-3.5 w-3.5 text-[#4F7CFF]" aria-hidden="true" />
          <p className="text-xs font-semibold text-white/90">Simulação</p>
        </div>

        {!showResult && (
          <Button
            variant="outline"
            onClick={handleSimulate}
            disabled={simulating}
            className="h-8 w-full border-white/[0.08] bg-white/[0.02] text-xs text-white/80 hover:bg-white/[0.05] hover:text-white"
          >
            {simulating ? (
              <span className="inline-flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                </motion.span>
                A IA está simulando...
              </span>
            ) : (
              "Se eu me candidatar..."
            )}
          </Button>
        )}

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="space-y-3"
            >
              <div className="rounded-lg border border-[#4F7CFF]/20 bg-[#4F7CFF]/5 p-3">
                <p className="mb-2.5 text-xs font-medium text-[#4F7CFF]">
                  Você provavelmente passará:
                </p>
                <ul className="space-y-1.5" role="list">
                  {data.simulation.stages.map((stage) => (
                    <li
                      key={stage.id}
                      className="flex items-center gap-2 text-sm text-white/90"
                    >
                      <StageIcon status={stage.status} />
                      {stage.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5 px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#F59E0B]">
                  Sugestão
                </p>
                <p className="mt-0.5 text-sm text-white/90">
                  {data.simulation.suggestion}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowResult(false)}
                className="text-[10px] text-[#9CA3AF] transition-colors hover:text-white"
              >
                Simular novamente
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
