"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Check,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  Send,
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
import { copyToClipboard, useJobApplication } from "@/lib/applications/hooks";
import {
  getJobDiscoveryBadge,
  getJobSourceLabel,
  isPlatformApply,
} from "@/lib/jobs/source-utils";
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
        <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
      ) : item.status === "auto" ? (
        <Sparkles
          className="h-4 w-4 shrink-0 text-primary"
          aria-hidden="true"
        />
      ) : (
        <span className="h-4 w-4 shrink-0 rounded-full border border-white/20" />
      )}
      <span
        className={cn(
          item.status === "done"
            ? "text-foreground/90"
            : item.status === "auto"
              ? "text-primary"
              : "text-muted-foreground"
        )}
      >
        {item.label}
        {item.status === "auto" && (
          <span className="ml-1 text-xs text-muted-foreground">· Será criada</span>
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
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Chance estimada
      </p>
      <p className="mt-1 text-lg font-bold" style={{ color: levelColor }}>
        {LEVEL_LABELS[data.level]}
      </p>
      <div className="mt-1 flex gap-0.5" aria-label={`${data.stars} de 5 estrelas`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < data.stars ? "fill-[#F59E0B] text-[#F59E0B]" : "text-foreground/10"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <ul className="mt-3 space-y-1" role="list">
        {data.reasons.slice(0, 2).map((reason, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
            {reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PreviewBlock({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-black/20 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Copy className="h-3 w-3" aria-hidden="true" />
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
      <pre className="max-h-32 overflow-y-auto whitespace-pre-wrap font-sans text-xs text-muted-foreground">
        {text.slice(0, 800)}
        {text.length > 800 ? "…" : ""}
      </pre>
    </div>
  );
}

function buildExternalChecklist(
  state: "idle" | "preparing" | "prepared" | "completed",
  hasPreview: boolean,
  isDone: boolean
): ApplyChecklistItem[] {
  return [
    {
      id: "tailored",
      label: "Copiar currículo adaptado",
      status: hasPreview ? "done" : state === "preparing" ? "auto" : "pending",
    },
    {
      id: "cover",
      label: "Copiar carta de apresentação",
      status: hasPreview ? "done" : state === "preparing" ? "auto" : "pending",
    },
    {
      id: "open",
      label: "Abrir site da empresa",
      status: state === "prepared" || isDone ? "done" : "pending",
    },
    {
      id: "confirm",
      label: "Confirmar candidatura concluída",
      status: isDone ? "done" : "pending",
    },
  ];
}

function buildInternalChecklist(
  state: "idle" | "preparing" | "prepared" | "completed",
  isDone: boolean,
  hasPreview: boolean
): ApplyChecklistItem[] {
  return [
    { id: "profile", label: "Perfil e currículo base", status: "done" },
    {
      id: "tailored",
      label: "Currículo adaptado para a vaga",
      status: hasPreview ? "done" : state === "preparing" ? "auto" : "pending",
    },
    {
      id: "cover",
      label: "Carta de apresentação",
      status: hasPreview ? "done" : state === "preparing" ? "auto" : "pending",
    },
    {
      id: "submit",
      label: "Enviar candidatura na plataforma",
      status: isDone ? "done" : state === "preparing" ? "auto" : "pending",
    },
  ];
}

export function ApplySidebar({ job, className }: ApplySidebarProps) {
  const {
    state,
    isExternal,
    isInternalPlatform,
    applyUrl,
    tailoredResumeText,
    coverLetterText,
    error,
    buttonLabel,
    prepare,
    confirmExternal,
    openExternalApply,
    isLoading,
    isDone,
  } = useJobApplication({ job });

  const showPreview = Boolean(tailoredResumeText || coverLetterText);
  const platformApply = isPlatformApply(job);
  const discoveryBadge = getJobDiscoveryBadge(job);
  const sourceLabel = getJobSourceLabel(job.source);
  const checklist = isInternalPlatform
    ? buildInternalChecklist(state, isDone, showPreview)
    : isExternal
      ? buildExternalChecklist(state, showPreview, isDone)
      : job.applyChecklist;

  async function handlePrimaryAction() {
    if (isDone) return;

    if (state === "prepared" && applyUrl) {
      openExternalApply();
      return;
    }

    if (state === "idle") {
      await prepare();
    }
  }

  return (
    <aside className={cn("space-y-4", className)}>
      <ReportCard className="sticky top-24 border-primary/15 p-5">
        <div className="flex flex-col items-center">
          <CompatibilityCard value={job.compatibility} hasMatch={job.hasMatch} size={120} />
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                discoveryBadge === "Vaga Jobera"
                  ? "border border-primary/30 bg-primary/10 text-primary"
                  : "border border-[#6366F1]/30 bg-[#6366F1]/10 text-[#A5B4FC]"
              )}
            >
              {discoveryBadge}
            </span>
            {sourceLabel ? (
              <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                {sourceLabel}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <ApprovalSection data={job.approvalProbability} />
        </div>

        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-xs font-semibold text-foreground">Resumo IA</p>
            <AIBadge />
          </div>
          <p className="text-sm font-medium text-foreground">{job.aiSummary}</p>
        </div>

        {showPreview && (
          <div className="mt-4 space-y-3">
            {tailoredResumeText && (
              <PreviewBlock title="Currículo adaptado" text={tailoredResumeText} />
            )}
            {coverLetterText && (
              <PreviewBlock title="Carta de apresentação" text={coverLetterText} />
            )}
          </div>
        )}

        {error && (
          <p className="mt-4 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        <Button
          className="mt-5 h-12 w-full gap-2 text-base shadow-[0_0_32px_rgba(79,124,255,0.25)]"
          disabled={isLoading || isDone}
          onClick={() => void handlePrimaryAction()}
        >
          {state === "prepared" && applyUrl ? (
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          ) : isInternalPlatform ? (
            <Send className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          )}
          {buttonLabel}
        </Button>

        {state === "prepared" && isExternal && applyUrl && (
          <Button
            variant="outline"
            className="mt-2 h-10 w-full border-border bg-transparent"
            onClick={() => void confirmExternal()}
          >
            <Check className="mr-2 h-4 w-4" aria-hidden="true" />
            Já concluí no site
          </Button>
        )}

        {state === "prepared" && isExternal && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            A IA preparou currículo e carta. Copie, cole no site e confirme quando
            terminar.
          </p>
        )}

        {isDone && isInternalPlatform && (
          <p className="mt-2 text-center text-xs text-success">
            Candidatura enviada. A empresa receberá seu currículo adaptado.
          </p>
        )}

        {isDone && !isInternalPlatform && platformApply && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Sua candidatura foi registrada na plataforma Jobera.
          </p>
        )}

        {isDone && !isInternalPlatform && !platformApply && (
          <p className="mt-2 text-center text-xs text-success">
            Candidatura registrada com sucesso.
          </p>
        )}

        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          Melhor horário: {job.bestSendTime.dayLabel}, {job.bestSendTime.timeRange}
        </div>

        {checklist.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Checklist
            </p>
            <ul className="space-y-2.5" role="list">
              {checklist.map((item) => (
                <ChecklistItem key={item.id} item={item} />
              ))}
            </ul>
          </div>
        )}
      </ReportCard>
    </aside>
  );
}

interface MobileApplySheetProps {
  job: JobDetail;
  open: boolean;
  onToggle: () => void;
}

export function MobileApplySheet({ job, open, onToggle }: MobileApplySheetProps) {
  const { prepare, isLoading, isInternalPlatform } = useJobApplication({ job });

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="flex flex-col items-center gap-0.5 px-2 text-muted-foreground"
          >
            {job.hasMatch ? (
              <>
                <span className="text-lg font-bold text-success">{job.compatibility}%</span>
                <span className="text-[10px]">Compat.</span>
              </>
            ) : (
              <span className="text-[10px] text-muted-foreground">Sem match</span>
            )}
          </button>
          <Button
            className="h-11 flex-1 gap-2"
            disabled={isLoading}
            onClick={() => {
              onToggle();
              void prepare();
            }}
          >
            {isInternalPlatform ? (
              <Send className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {isLoading
              ? isInternalPlatform
                ? "Enviando..."
                : "Preparando..."
              : isInternalPlatform
                ? "Enviar candidatura"
                : "Preparar candidatura"}
          </Button>
        </div>
      </div>

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
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 lg:hidden"
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
