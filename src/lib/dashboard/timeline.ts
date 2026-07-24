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

/** Seed events already completed when the dashboard opens */
export function buildSeedTimeline(now = new Date()): TimelineActivity[] {
  const at = (minutesAgo: number) => {
    const d = new Date(now);
    d.setSeconds(0, 0);
    d.setMinutes(d.getMinutes() - minutesAgo);
    return d.toISOString();
  };

  return [
    createTimelineEvent({
      id: "tl-seed-1",
      kind: "job_found",
      createdAt: at(12),
      title: "Nova vaga encontrada",
      description: "Frontend Engineer · Nubank · Remoto",
    }),
    createTimelineEvent({
      id: "tl-seed-2",
      kind: "compatibility",
      createdAt: at(11),
      title: "Compatibilidade calculada",
      description: "97% de match com o seu perfil",
    }),
    createTimelineEvent({
      id: "tl-seed-3",
      kind: "resume_tailored",
      createdAt: at(10),
      title: "Currículo personalizado",
      description: "Versão otimizada para ATS da Nubank",
    }),
  ];
}

type LiveTemplate = {
  kind: TimelineEventKind;
  title: string;
  description: string;
  href?: string;
};

/** Queue that continues streaming after the seed — demo realtime */
export const LIVE_TIMELINE_QUEUE: LiveTemplate[] = [
  {
    kind: "application_sent",
    title: "Candidatura enviada",
    description: "Nubank · Frontend Engineer · carta personalizada",
  },
  {
    kind: "company_viewed",
    title: "Empresa visualizou sua candidatura",
    description: "Recruiter de Engineering abriu seu currículo",
    href: "/dashboard/empresas/nubank",
  },
  {
    kind: "job_found",
    title: "Nova vaga encontrada",
    description: "React Developer · iFood · Híbrido · SP",
  },
  {
    kind: "compatibility",
    title: "Compatibilidade calculada",
    description: "94% de match com o seu perfil",
  },
  {
    kind: "resume_tailored",
    title: "Currículo personalizado",
    description: "Palavras-chave alinhadas à vaga do iFood",
  },
  {
    kind: "application_sent",
    title: "Candidatura enviada",
    description: "iFood · React Developer · carta personalizada",
  },
  {
    kind: "company_viewed",
    title: "Empresa visualizou sua candidatura",
    description: "iFood salvou seu perfil para revisão",
    href: "/dashboard/empresas/ifood",
  },
  {
    kind: "interview_invite",
    title: "Convite para entrevista",
    description: "iFood · Frontend React · amanhã às 14h",
  },
];

/** Ongoing ambient stream after the scripted queue drains */
export const AMBIENT_TIMELINE_POOL: LiveTemplate[] = [
  {
    kind: "job_found",
    title: "Nova vaga encontrada",
    description: "Software Engineer · Google · Remoto",
  },
  {
    kind: "compatibility",
    title: "Compatibilidade calculada",
    description: "91% de match com o seu perfil",
  },
  {
    kind: "resume_tailored",
    title: "Currículo personalizado",
    description: "Ajustes de impacto e palavras-chave",
  },
  {
    kind: "application_sent",
    title: "Candidatura enviada",
    description: "Spotify · Frontend Engineer",
  },
  {
    kind: "company_viewed",
    title: "Empresa visualizou sua candidatura",
    description: "Mercado Livre abriu seu perfil",
    href: "/dashboard/empresas/mercadolivre",
  },
  {
    kind: "job_found",
    title: "Nova vaga encontrada",
    description: "Full Stack React · Microsoft · Remoto",
  },
];

export function actorLabel(actor: TimelineActivity["actor"]): string {
  return actor === "ai" ? "IA" : "Empresa";
}
