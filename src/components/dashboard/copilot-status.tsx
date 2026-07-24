"use client";

import { Pause, Play } from "lucide-react";
import {
  formatVerificationCountdown,
  useCopilotStatus,
} from "@/lib/dashboard/use-copilot-status";
import { cn } from "@/lib/utils";

interface CopilotStatusProps {
  className?: string;
}

export function CopilotStatus({ className }: CopilotStatusProps) {
  const { status, secondsUntilVerification, pause, resume } = useCopilotStatus();
  const isActive = status === "active";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-2.5 py-1.5 sm:gap-3 sm:px-3 sm:py-2",
        isActive
          ? "border-[#22C55E]/20 bg-[#22C55E]/[0.06]"
          : "border-[#FBBF24]/20 bg-[#FBBF24]/[0.06]",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={
        isActive
          ? `Copiloto ativo. Próxima verificação em ${formatVerificationCountdown(secondsUntilVerification)}`
          : "Copiloto pausado"
      }
    >
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        {isActive ? (
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
          </span>
        ) : (
          <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-[#FBBF24]" />
        )}

        <span
          className={cn(
            "truncate text-xs font-medium sm:text-[13px]",
            isActive ? "text-[#22C55E]" : "text-[#FBBF24]"
          )}
        >
          {isActive ? "Copiloto Ativo" : "Pausado"}
        </span>
      </div>

      {isActive ? (
        <>
          <span className="hidden h-3 w-px bg-white/10 sm:block" aria-hidden="true" />
          <p className="hidden min-w-0 text-[11px] text-[#9CA3AF] sm:block">
            Próxima verificação:{" "}
            <span className="font-medium text-white/80">
              {formatVerificationCountdown(secondsUntilVerification)}
            </span>
          </p>
          <button
            type="button"
            onClick={pause}
            className="ml-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Pausar copiloto"
          >
            <Pause className="h-3 w-3" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={resume}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#FBBF24]/15 px-2 py-0.5 text-[11px] font-medium text-[#FBBF24] transition-colors hover:bg-[#FBBF24]/25"
        >
          <Play className="h-3 w-3" />
          Retomar
        </button>
      )}
    </div>
  );
}
