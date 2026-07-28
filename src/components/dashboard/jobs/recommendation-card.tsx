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
import { isExternalJob, getJobSourceLabel } from "@/lib/jobs/source-utils";
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

  const isExternal = isExternalJob(job);
  const sourceLabel = getJobSourceLabel(job.source);

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
        "relative overflow-hidden rounded-2xl border bg-card p-5 sm:p-6",
        selected
          ? "border-primary/50 ring-1 ring-primary/30"
          : "border-border",
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
            <p className="text-xs text-muted-foreground">{job.company}</p>
            <h3 className="mt-0.5 text-base font-semibold text-foreground sm:text-lg">
              {job.role}
            </h3>
            {isExternal && sourceLabel && (
              <span className="mt-1.5 inline-flex items-center rounded-md border border-[#6366F1]/30 bg-[#6366F1]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#A5B4FC]">
                {sourceLabel}
              </span>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
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
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:border-white/[0.14] hover:text-foreground"
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
        <p className="relative mt-4 text-sm leading-relaxed text-muted-foreground">
          {job.aiSummary}
        </p>
      )}

      {!isExternal && (
        <>
          {/* Por que essa vaga? */}
          <div className="relative mt-5 rounded-xl border border-border bg-muted/30 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Por que essa vaga?
            </p>
            <ul className="space-y-2" role="list">
              {job.reasons.map((reason) => (
                <li
                  key={reason.id}
                  className="flex items-start gap-2 text-sm text-foreground/90"
                >
                  {reason.type === "match" ? (
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-success"
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
          <p className="mb-2 text-xs font-medium text-muted-foreground">Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {job.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground/80"
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
            className="rounded-lg border border-white/[0.04] bg-muted/30 px-3 py-2.5"
          >
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
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
          className="h-9 flex-1 border-border bg-transparent sm:flex-none sm:px-5"
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
            className="h-9 border-border bg-transparent sm:px-4"
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
            "h-9 border-border bg-transparent",
            saved && "border-primary/40 text-primary"
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
            className="h-9 text-muted-foreground hover:text-foreground"
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
                className="absolute bottom-full right-0 z-10 mb-2 w-52 rounded-xl border border-border bg-card p-3 shadow-xl"
              >
                <p className="mb-2 text-xs font-medium text-foreground">
                  Por que não gostou?
                </p>
                <p className="mb-3 text-[10px] text-muted-foreground">
                  A IA aprende com seu feedback
                </p>
                <div className="flex flex-col gap-1">
                  {HIDE_REASONS.map((reason) => (
                    <button
                      key={reason.id}
                      type="button"
                      onClick={() => handleHide(reason.id)}
                      className="rounded-lg px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
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
