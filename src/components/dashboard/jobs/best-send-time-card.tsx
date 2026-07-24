"use client";

import { Rocket } from "lucide-react";
import type { BestSendTime } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface BestSendTimeCardProps {
  data: BestSendTime;
  className?: string;
}

export function BestSendTimeCard({ data, className }: BestSendTimeCardProps) {
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
            Melhor horário
          </p>
          <p className="mt-1 text-[10px] text-[#9CA3AF]/80">
            Melhor momento para enviar
          </p>
        </div>
        <Rocket
          className="h-4 w-4 shrink-0 text-[#4F7CFF]"
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 rounded-lg border border-[#4F7CFF]/20 bg-[#4F7CFF]/5 px-4 py-3">
        <p className="text-xs font-medium text-[#4F7CFF]">{data.dayLabel}</p>
        <p className="mt-0.5 text-lg font-semibold tracking-tight text-white">
          {data.timeRange}
        </p>
      </div>

      <p className="mt-3 text-sm text-white/75">{data.insight}</p>
    </div>
  );
}
