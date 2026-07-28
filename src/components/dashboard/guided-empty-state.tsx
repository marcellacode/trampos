"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GuidedEmptyState } from "@/types/career-context";
import { cn } from "@/lib/utils";

interface GuidedEmptyStateProps extends GuidedEmptyState {
  className?: string;
  onCopilotClick?: (prompt: string) => void;
}

export function GuidedEmptyStateView({
  title,
  description,
  steps,
  copilotPrompt,
  highlightHref,
  highlightLabel,
  className,
  onCopilotClick,
}: GuidedEmptyStateProps) {
  const completedCount = steps.filter((s) => s.done).length;
  const progress =
    steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-8 sm:px-8",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,124,255,0.12),transparent_55%)]"
        aria-hidden="true"
      />

      <div className="relative space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Sua jornada
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground sm:text-xl">
            {title}
          </h3>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        {steps.length > 0 ? (
          <div>
            <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <ol className="space-y-2" role="list">
              {steps.map((step) => (
                <li key={step.label}>
                  <Link
                    href={step.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm transition-colors hover:bg-card",
                      step.done && "opacity-70"
                    )}
                  >
                    {step.done ? (
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-success"
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={cn(
                        "flex-1",
                        step.done
                          ? "text-muted-foreground line-through"
                          : "font-medium text-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                    {!step.done ? (
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    ) : null}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {highlightHref && highlightLabel ? (
            <Button
              render={<Link href={highlightHref} />}
              nativeButton={false}
              className="h-10 px-5"
            >
              {highlightLabel}
            </Button>
          ) : null}

          {copilotPrompt && onCopilotClick ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 border-border bg-transparent px-5"
              onClick={() => onCopilotClick(copilotPrompt)}
            >
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              Perguntar ao Jobe
            </Button>
          ) : copilotPrompt ? (
            <Button
              render={<Link href="/dashboard/mensagens?tab=jobe" />}
              nativeButton={false}
              variant="outline"
              className="h-10 border-border bg-transparent px-5"
            >
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              Perguntar ao Jobe
            </Button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
