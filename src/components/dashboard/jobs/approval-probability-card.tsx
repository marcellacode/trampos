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
      <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
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
        "rounded-xl border border-border bg-muted/30 p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Chance de Aprovação
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/80">
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
                    : "text-foreground/10"
                )}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Porque:</p>
        <ul className="space-y-1.5" role="list">
          {data.reasons.map((reason, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-foreground/85"
            >
              <span
                className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary"
                aria-hidden="true"
              />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-3 flex items-center gap-1.5">
          <Bot className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <p className="text-xs font-semibold text-foreground/90">Simulação</p>
        </div>

        {!showResult && (
          <Button
            variant="outline"
            onClick={handleSimulate}
            disabled={simulating}
            className="h-8 w-full border-border bg-muted/30 text-xs text-foreground/80 hover:bg-muted/60 hover:text-foreground"
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
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="mb-2.5 text-xs font-medium text-primary">
                  Você provavelmente passará:
                </p>
                <ul className="space-y-1.5" role="list">
                  {data.simulation.stages.map((stage) => (
                    <li
                      key={stage.id}
                      className="flex items-center gap-2 text-sm text-foreground/90"
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
                <p className="mt-0.5 text-sm text-foreground/90">
                  {data.simulation.suggestion}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowResult(false)}
                className="text-[10px] text-muted-foreground transition-colors hover:text-foreground"
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
