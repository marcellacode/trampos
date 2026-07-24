import {
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  Search,
  Video,
} from "lucide-react";
import type {
  TimelineActivity,
  TimelineEventKind,
} from "@/types/dashboard";

const KIND_META: Record<
  TimelineEventKind,
  Pick<TimelineActivity, "icon" | "color" | "glow" | "actor" | "href">
> = {
  job_found: {
    actor: "ai",
    icon: Search,
    color: "#4F7CFF",
    glow: "rgba(79,124,255,0.35)",
    href: "/dashboard/vagas",
  },
  compatibility: {
    actor: "ai",
    icon: CheckCircle2,
    color: "#22C55E",
    glow: "rgba(34,197,94,0.35)",
    href: "/dashboard/vagas",
  },
  resume_tailored: {
    actor: "ai",
    icon: FileText,
    color: "#8B5CF6",
    glow: "rgba(139,92,246,0.35)",
    href: "/dashboard/curriculo",
  },
  application_sent: {
    actor: "ai",
    icon: Briefcase,
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.35)",
    href: "/dashboard/vagas",
  },
  company_viewed: {
    actor: "company",
    icon: Eye,
    color: "#820AD1",
    glow: "rgba(130,10,209,0.35)",
    href: "/dashboard/empresas",
  },
  interview_invite: {
    actor: "company",
    icon: Video,
    color: "#EC4899",
    glow: "rgba(236,72,153,0.35)",
    href: "/dashboard/entrevistas",
  },
};

export function formatTimelineTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function createTimelineEvent(
  partial: Omit<
    TimelineActivity,
    "icon" | "color" | "glow" | "actor" | "href" | "time"
  > &
    Partial<Pick<TimelineActivity, "href" | "time">> & {
      kind: TimelineEventKind;
      createdAt: string;
    }
): TimelineActivity {
  const meta = KIND_META[partial.kind];
  const created = new Date(partial.createdAt);

  return {
    ...meta,
    ...partial,
    href: partial.href ?? meta.href,
    time: partial.time ?? formatTimelineTime(created),
  };
}

export function actorLabel(actor: TimelineActivity["actor"]): string {
  return actor === "ai" ? "IA" : "Empresa";
}
