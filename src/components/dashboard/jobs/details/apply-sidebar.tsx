"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Check,
  ChevronUp,
  Clock,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompatibilityCard } from "@/components/dashboard/jobs/details/compatibility-card";
import {
  AIBadge,
  ReportCard,
} from "@/components/dashboard/jobs/details/report-card";
import type {
  ApplyChecklistItem,
  ApprovalProbability,
  JobDetail,
} from "@/types/jobs";
import { cn } from "@/lib/utils";

interface ApplySidebarProps {
  job: JobDetail;
  className?: string;
}

const LEVEL_LABELS = {
  baixa: "Baixa",
  media: "Média",
  alta: "Muito Alta",
};

function ChecklistItem({ item }: { item: ApplyChecklistItem }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      {item.status === "done" ? (
        <Check className="h-4 w-4 shrink-0 text-[#22C55E]" aria-hidden="true" />
      ) : item.status === "auto" ? (
        <Sparkles
          className="h-4 w-4 shrink-0 text-[#4F7CFF]"
          aria-hidden="true"
        />
      ) : (
        <span className="h-4 w-4 shrink-0 rounded-full border border-white/20" />
      )}
      <span
        className={cn(
          item.status === "done"
            ? "text-white/90"
            : item.status === "auto"
              ? "text-[#4F7CFF]"
              : "text-[#9CA3AF]"
        )}
      >
        {item.label}
        {item.status === "auto" && (
          <span className="ml-1 text-xs text-[#9CA3AF]">· Será criada</span>
        )}
      </span>
    </li>
  );
}

function ApprovalSection({ data }: { data: ApprovalProbability }) {
  const levelColor =
    data.level === "alta"
      ? "#22C55E"
      : data.level === "media"
        ? "#F59E0B"
        : "#9CA3AF";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
        Chance estimada
      </p>
      <p
        className="mt-1 text-lg font-bold"
        style={{ color: levelColor }}
      >
        {LEVEL_LABELS[data.level]}
      </p>
      <div
        className="mt-1 flex gap-0.5"
        aria-label={`${data.stars} de 5 estrelas`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < data.stars
                ? "fill-[#F59E0B] text-[#F59E0B]"
                : "text-white/10"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <ul className="mt-3 space-y-1" role="list">
        {data.reasons.slice(0, 2).map((reason, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-xs text-[#9CA3AF]"
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
  );
}

export function ApplySidebar({ job, className }: ApplySidebarProps) {
  return (
    <aside className={cn("space-y-4", className)}>
      <ReportCard className="sticky top-24 border-[#4F7CFF]/15 p-5">
        <div className="flex flex-col items-center">
          <CompatibilityCard value={job.compatibility} size={120} />
        </div>

        <div className="mt-4">
          <ApprovalSection data={job.approvalProbability} />
        </div>

        <div className="mt-4 rounded-xl border border-[#4F7CFF]/20 bg-[#4F7CFF]/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Bot className="h-4 w-4 text-[#4F7CFF]" aria-hidden="true" />
            <p className="text-xs font-semibold text-white">Resumo IA</p>
            <AIBadge />
          </div>
          <p className="text-sm font-medium text-white">{job.aiSummary}</p>
          <p className="mt-2 text-xs text-[#9CA3AF]">Porque:</p>
          <ul className="mt-1.5 space-y-1" role="list">
            {job.aiSummaryReasons.map((reason, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-white/80"
              >
                <Check
                  className="mt-0.5 h-3 w-3 shrink-0 text-[#22C55E]"
                  aria-hidden="true"
                />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <Button className="mt-5 h-12 w-full gap-2 text-base shadow-[0_0_32px_rgba(79,124,255,0.25)]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Candidatar com IA
        </Button>

        <div className="mt-4 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          Melhor horário: {job.bestSendTime.dayLabel},{" "}
          {job.bestSendTime.timeRange}
        </div>

        <div className="mt-5 border-t border-white/[0.06] pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            Checklist
          </p>
          <ul className="space-y-2.5" role="list">
            {job.applyChecklist.map((item) => (
              <ChecklistItem key={item.id} item={item} />
            ))}
          </ul>
        </div>
      </ReportCard>
    </aside>
  );
}

interface MobileApplySheetProps {
  job: JobDetail;
  open: boolean;
  onToggle: () => void;
}

export function MobileApplySheet({
  job,
  open,
  onToggle,
}: MobileApplySheetProps) {
  return (
    <>
      {/* Fixed bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#0C0D0F]/95 p-4 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="flex flex-col items-center gap-0.5 px-2 text-[#9CA3AF]"
          >
            <span className="text-lg font-bold text-[#22C55E]">
              {job.compatibility}%
            </span>
            <span className="text-[10px]">Compat.</span>
          </button>
          <Button className="h-11 flex-1 gap-2">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Candidatar com IA
          </Button>
        </div>
      </div>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
              onClick={onToggle}
              aria-hidden="true"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-white/[0.08] bg-[#111315] p-5 lg:hidden"
            >
              <button
                type="button"
                onClick={onToggle}
                className="mx-auto mb-4 flex h-1 w-10 rounded-full bg-white/20"
                aria-label="Fechar painel"
              >
                <ChevronUp className="sr-only" />
              </button>
              <ApplySidebar job={job} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
