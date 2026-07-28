"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import type { ChatJob } from "@/types/jobe-chat";
import { cn } from "@/lib/utils";

interface JobeJobCardProps {
  job: ChatJob;
  selected: boolean;
  onToggleSelect: (jobId: string) => void;
  className?: string;
}

export function JobeJobCard({
  job,
  selected,
  onToggleSelect,
  className,
}: JobeJobCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "overflow-hidden rounded-xl border bg-muted/40 transition-colors",
        selected ? "border-primary/50 ring-1 ring-primary/20" : "border-border",
        className
      )}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-foreground"
            style={{ backgroundColor: `${job.color}33`, color: job.color }}
          >
            {job.logo}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{job.role}</p>
            <p className="truncate text-xs text-muted-foreground">{job.company}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {job.location}
              </span>
              <span>{job.salary}</span>
              {job.compatibility > 0 && (
                <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] text-success">
                  {job.compatibility}% match
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleSelect(job.id)}
            aria-label={selected ? "Desmarcar vaga" : "Selecionar vaga"}
            aria-pressed={selected}
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/15 bg-transparent text-transparent hover:border-white/30"
            )}
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" aria-hidden="true" />
                Ocultar detalhes
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
                Ver detalhes
              </>
            )}
          </button>
          <Link
            href={job.href}
            className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[11px] text-[#A8C0FF] transition-colors hover:bg-primary/20"
          >
            Abrir vaga
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-muted/30"
          >
            <div className="space-y-2 px-3 py-3 text-xs leading-relaxed text-muted-foreground">
              <p>{job.aiSummary || "Vaga recomendada com base no seu perfil."}</p>
              {job.stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {job.stack.slice(0, 6).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
