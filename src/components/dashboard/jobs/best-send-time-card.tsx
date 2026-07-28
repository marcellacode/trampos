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
        "rounded-xl border border-border bg-muted/30 p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Melhor horário
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/80">
            Melhor momento para enviar
          </p>
        </div>
        <Rocket
          className="h-4 w-4 shrink-0 text-primary"
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <p className="text-xs font-medium text-primary">{data.dayLabel}</p>
        <p className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
          {data.timeRange}
        </p>
      </div>

      <p className="mt-3 text-sm text-foreground/75">{data.insight}</p>
    </div>
  );
}
