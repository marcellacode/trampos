"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bookmark,
  Check,
  Clock,
  ExternalLink,
  EyeOff,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompatibilityBar } from "@/components/dashboard/jobs/compatibility-bar";
import { ApprovalProbabilityCard } from "@/components/dashboard/jobs/approval-probability-card";
import { BestSendTimeCard } from "@/components/dashboard/jobs/best-send-time-card";
import { HIDE_REASONS } from "@/lib/jobs/constants";
import { useJobApplication } from "@/lib/applications/hooks";
import type { HideReason, JobRecommendation } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  job: JobRecommendation;
  onHide: (jobId: string, reason: HideReason) => void;
  onSave: (jobId: string) => void;
  saved?: boolean;
  onCompare?: (jobId: string) => void;
  selected?: boolean;
  className?: string;
}

export function RecommendationCard({
  job,
  onHide,
  onSave,
  saved: savedProp = false,
  onCompare,
  selected,
  className,
}: RecommendationCardProps) {
  const [showHideFeedback, setShowHideFeedback] = useState(false);
  const [savedLocal, setSavedLocal] = useState(false);
  const saved = savedProp || savedLocal;
  const [hovered, setHovered] = useState(false);

  const {
    state: applyState,
    applyUrl,
    buttonLabel: applyLabel,
    prepare,
    openExternalApply,
    confirmExternal,
    isLoading: applyLoading,
    isDone: applyDone,
    error: applyError,
    isExternal: applyIsExternal,
  } = useJobApplication({ job });

  const isExternal = job.source === "adzuna";

  function handleHide(reason: HideReason) {
    onHide(job.id, reason);
    setShowHideFeedback(false);
  }

  async function handleApply() {
    if (applyDone) return;

    if (applyState === "prepared" && applyUrl) {
      openExternalApply();
      return;
    }

    if (applyState === "idle") {
      await prepare();
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        y: hovered ? -4 : 0,
        boxShadow: hovered
          ? "0 0 48px rgba(79,124,255,0.12), 0 8px 32px rgba(0,0,0,0.3)"
          : "0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-[#111315] p-5 sm:p-6",
        selected
          ? "border-[#4F7CFF]/50 ring-1 ring-[#4F7CFF]/30"
          : "border-white/[0.08]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,124,255,0.06),transparent_55%)]"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
            style={{ backgroundColor: `${job.color}22`, color: job.color }}
          >
            {job.logo}
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF]">{job.company}</p>
            <h3 className="mt-0.5 text-base font-semibold text-white sm:text-lg">
              {job.role}
            </h3>
            {isExternal && (
              <span className="mt-1.5 inline-flex items-center rounded-md border border-[#6366F1]/30 bg-[#6366F1]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#A5B4FC]">
                Adzuna
              </span>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9CA3AF]">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {job.location}
              </span>
              <span>{job.salary}</span>
            </div>
          </div>
        </div>

        {onCompare && (
          <button
            type="button"
            onClick={() => onCompare(job.id)}
            className={cn(
              "shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-colors",
              selected
                ? "border-[#4F7CFF] bg-[#4F7CFF]/15 text-[#4F7CFF]"
                : "border-white/[0.08] text-[#9CA3AF] hover:border-white/[0.14] hover:text-white"
            )}
          >
            {selected ? "Selecionada" : "Comparar"}
          </button>
        )}
      </div>

      <div className="relative mt-5">
        <CompatibilityBar
          value={job.compatibility}
          hasMatch={job.hasMatch}
        />
      </div>

      {!isExternal && (
        <>
          <div className="relative mt-4">
            <ApprovalProbabilityCard data={job.approvalProbability} />
          </div>

          <div className="relative mt-4">
            <BestSendTimeCard data={job.bestSendTime} />
          </div>
        </>
      )}

      {isExternal && job.aiSummary && (
        <p className="relative mt-4 text-sm leading-relaxed text-[#9CA3AF]">
          {job.aiSummary}
        </p>
      )}

      {!isExternal && (
        <>
          {/* Por que essa vaga? */}
          <div className="relative mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Por que essa vaga?
            </p>
            <ul className="space-y-2" role="list">
              {job.reasons.map((reason) => (
                <li
                  key={reason.id}
                  className="flex items-start gap-2 text-sm text-white/90"
                >
                  {reason.type === "match" ? (
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]"
                      aria-hidden="true"
                    />
                  ) : (
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]"
                      aria-hidden="true"
                    />
                  )}
                  {reason.text}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Stack */}
      {job.stack.length > 0 && (
        <div className="relative mt-4">
          <p className="mb-2 text-xs font-medium text-[#9CA3AF]">Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {job.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-white/80"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {!isExternal && (
      <div className="relative mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            icon: Clock,
            label: "Resposta média",
            value: `${job.stats.responseDays} dias`,
          },
          {
            icon: Clock,
            label: "Processo médio",
            value: `${job.stats.processDays} dias`,
          },
          {
            icon: Sparkles,
            label: "Etapas",
            value: String(job.stats.steps),
          },
          {
            icon: Users,
            label: "Candidatos est.",
            value: String(job.stats.candidates),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5"
          >
            <p className="text-[10px] text-[#9CA3AF]">{stat.label}</p>
            <p className="mt-0.5 text-sm font-semibold text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      )}

      {/* Actions */}
      <div className="relative mt-5 flex flex-wrap gap-2">
        <Button
          render={<Link href={job.href} />}
          nativeButton={false}
          variant="outline"
          className="h-9 flex-1 border-white/10 bg-transparent sm:flex-none sm:px-5"
        >
          {isExternal ? "Resumo" : "Ver detalhes"}
        </Button>
        <Button
          className="h-9 flex-1 gap-1.5 sm:flex-none sm:px-5"
          disabled={applyLoading || applyDone}
          onClick={() => void handleApply()}
        >
          {applyState === "prepared" && applyUrl ? (
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {applyLabel}
        </Button>
        {applyState === "prepared" && applyIsExternal && applyUrl && (
          <Button
            variant="outline"
            className="h-9 border-white/10 bg-transparent sm:px-4"
            onClick={() => void confirmExternal()}
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Já concluí
          </Button>
        )}
        {applyError && (
          <p className="w-full text-xs text-red-400" role="alert">
            {applyError}
          </p>
        )}
        <Button
          variant="outline"
          onClick={() => {
            onSave(job.id);
            setSavedLocal((s) => !s);
          }}
          className={cn(
            "h-9 border-white/10 bg-transparent",
            saved && "border-[#4F7CFF]/40 text-[#4F7CFF]"
          )}
          aria-label={saved ? "Vaga salva" : "Salvar vaga"}
        >
          <Bookmark
            className={cn("h-4 w-4", saved && "fill-current")}
            aria-hidden="true"
          />
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowHideFeedback((v) => !v)}
            className="h-9 text-[#9CA3AF] hover:text-white"
          >
            <EyeOff className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only sm:ml-1.5">Ocultar</span>
          </Button>

          <AnimatePresence>
            {showHideFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                className="absolute bottom-full right-0 z-10 mb-2 w-52 rounded-xl border border-white/[0.1] bg-[#16191C] p-3 shadow-xl"
              >
                <p className="mb-2 text-xs font-medium text-white">
                  Por que não gostou?
                </p>
                <p className="mb-3 text-[10px] text-[#9CA3AF]">
                  A IA aprende com seu feedback
                </p>
                <div className="flex flex-col gap-1">
                  {HIDE_REASONS.map((reason) => (
                    <button
                      key={reason.id}
                      type="button"
                      onClick={() => handleHide(reason.id)}
                      className="rounded-lg px-2.5 py-1.5 text-left text-xs text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}
