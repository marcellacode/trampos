"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/shared/logo";

interface ProgressHeaderProps {
  step: number;
  totalSteps?: number;
}

export function ProgressHeader({ step, totalSteps = 7 }: ProgressHeaderProps) {
  const progress = Math.min(100, Math.max(0, (step / totalSteps) * 100));

  return (
    <header className="relative z-20 border-b border-border bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Logo />

        <div
          className="flex min-w-0 flex-1 flex-col items-end gap-2 sm:max-w-xs"
          role="group"
          aria-label="Progresso do onboarding"
        >
          <p className="text-xs font-medium tracking-wide text-muted-foreground sm:text-sm">
            Passo{" "}
            <span className="text-foreground" aria-current="step">
              {step}
            </span>{" "}
            de {totalSteps}
          </p>

          <div
            className="h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-white/[0.08]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label={`Progresso: passo ${step} de ${totalSteps}`}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              style={{
                boxShadow: "0 0 16px rgba(79, 124, 255, 0.55)",
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
