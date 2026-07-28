"use client";

import Link from "next/link";
import {
  Briefcase,
  Calendar,
  FileText,
  MessageSquare,
  Mic,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimelineActivity } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const KIND_ACTIONS: Record<
  TimelineActivity["kind"],
  { label: string; href: (item: TimelineActivity) => string; icon: typeof Briefcase }
> = {
  job_found: {
    label: "Ver vagas",
    href: () => "/dashboard/vagas",
    icon: Briefcase,
  },
  compatibility: {
    label: "Ver matches",
    href: () => "/dashboard/vagas",
    icon: Sparkles,
  },
  resume_tailored: {
    label: "Ver currículo adaptado",
    href: () => "/dashboard/curriculo",
    icon: FileText,
  },
  application_sent: {
    label: "Acompanhar",
    href: (item) => item.href,
    icon: Briefcase,
  },
  company_viewed: {
    label: "Ver vaga",
    href: (item) => item.href,
    icon: Briefcase,
  },
  interview_invite: {
    label: "Preparar com IA",
    href: () => "/dashboard/entrevistas",
    icon: Mic,
  },
};

interface AgendaEventCardProps {
  item: TimelineActivity;
  className?: string;
}

export function AgendaEventCard({ item, className }: AgendaEventCardProps) {
  const actions = KIND_ACTIONS[item.kind];
  const ActionIcon = actions.icon;
  const isFollowUp = item.title.toLowerCase().includes("follow-up");

  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-card p-4 sm:p-5",
        isFollowUp && "border-amber-500/30 bg-amber-500/5",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <time dateTime={item.createdAt}>{item.time}</time>
            {isFollowUp ? (
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase text-amber-600">
                Follow-up
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 text-sm font-semibold text-foreground">{item.title}</h3>
          {item.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            render={<Link href={actions.href(item)} />}
            nativeButton={false}
            size="sm"
            variant="outline"
            className="h-8"
          >
            <ActionIcon className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {actions.label}
          </Button>

          {item.kind === "application_sent" ? (
            <Button
              render={<Link href="/dashboard/mensagens" />}
              nativeButton={false}
              size="sm"
              variant="ghost"
              className="h-8"
            >
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Mensagens
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
