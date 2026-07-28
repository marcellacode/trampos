"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  Clock,
  MessageSquare,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  className?: string;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center",
        className
      )}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/25">
        <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      <Button
        render={<Link href={ctaHref} />}
        nativeButton={false}
        className="mt-6 h-10 px-5"
      >
        {ctaLabel}
      </Button>
    </motion.div>
  );
}

export function EmptyJobsState() {
  return (
    <EmptyState
      icon={Briefcase}
      title="Nenhuma vaga encontrada"
      description="Busque vagas reais de emprego por cargo e localização. Os resultados vêm de fontes externas como Adzuna e Remotive."
      ctaLabel="Buscar vagas"
      ctaHref="/dashboard/vagas"
    />
  );
}

export function EmptyTimelineState() {
  return (
    <EmptyState
      icon={Clock}
      title="Nenhuma atividade recente"
      description="Quando você buscar vagas, se candidatar ou seguir empresas, os eventos aparecerão na Agenda e aqui no Início."
      ctaLabel="Ver agenda"
      ctaHref="/dashboard/agenda"
    />
  );
}

export function EmptyInterviewsState() {
  return (
    <EmptyState
      icon={Calendar}
      title="Sem entrevistas agendadas"
      description="Quando empresas responderem, os convites aparecerão aqui com preparação automática da IA."
      ctaLabel="Ver candidaturas"
      ctaHref="/dashboard/vagas"
    />
  );
}

export function EmptyMessagesState() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Sem candidaturas em andamento"
      description="Quando você se candidatar a vagas, o status de cada processo aparecerá aqui."
      ctaLabel="Buscar vagas"
      ctaHref="/dashboard/vagas"
    />
  );
}

export function NewUserState({ firstName }: { firstName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-10"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,124,255,0.18),transparent_55%)]"
        aria-hidden="true"
      />
      <div className="relative max-w-xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-primary">Bem-vindo(a)</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Olá, {firstName}.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Comece buscando vagas reais ou complete seu perfil para ver scores de
          compatibilidade.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button
            render={<Link href="/dashboard/vagas" />}
            nativeButton={false}
            className="h-10 px-5"
          >
            Buscar vagas
          </Button>
          <Button
            variant="outline"
            render={<Link href="/onboarding" />}
            nativeButton={false}
            className="h-10 border-border bg-transparent px-5"
          >
            Revisar onboarding
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
