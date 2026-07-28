"use client";

import Link from "next/link";
import { Briefcase, Clock, FileText, Mic, Sparkles } from "lucide-react";
import type { CareerActivity } from "@/types/career-context";
import type { AISuggestion } from "@/types/dashboard";
import type { JobCard } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS = {
  job_found: Briefcase,
  compatibility: Sparkles,
  resume_tailored: FileText,
  application_sent: Briefcase,
  company_viewed: Briefcase,
  interview_invite: Mic,
} as const;

export function ActivityFeedCard({
  activity,
  className,
}: {
  activity: CareerActivity;
  className?: string;
}) {
  const Icon = ACTIVITY_ICONS[activity.kind] ?? Clock;

  return (
    <Link
      href={activity.href}
      className={cn(
        "block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Sua atividade · {activity.time}</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">{activity.title}</p>
          {activity.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function AiTipFeedCard({
  suggestion,
  className,
}: {
  suggestion: AISuggestion;
  className?: string;
}) {
  const Icon = suggestion.icon;

  return (
    <Link
      href={suggestion.href}
      className={cn(
        "block rounded-xl border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${suggestion.color}22`, color: suggestion.color }}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-primary">Dica do copiloto</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">{suggestion.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{suggestion.description}</p>
          <p className="mt-2 text-xs text-primary">{suggestion.impact}</p>
        </div>
      </div>
    </Link>
  );
}

export function JobRecommendationFeedCard({
  job,
  className,
}: {
  job: JobCard;
  className?: string;
}) {
  return (
    <Link
      href={job.href}
      className={cn(
        "block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
          style={{ backgroundColor: `${job.color}22`, color: job.color }}
        >
          {job.logo}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-primary">Vaga recomendada para você</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{job.role}</p>
          <p className="text-sm text-muted-foreground">{job.company}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{job.location}</span>
            <span>·</span>
            <span className="font-semibold text-success">{job.compatibility}% match</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
