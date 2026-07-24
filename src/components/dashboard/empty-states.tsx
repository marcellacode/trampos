"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
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
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-14 text-center",
        className
      )}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F7CFF]/10 ring-1 ring-[#4F7CFF]/25">
        <Icon className="h-6 w-6 text-[#4F7CFF]" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[#9CA3AF]">{description}</p>
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
      title="Nenhuma vaga ainda"
      description="Sua IA ainda não encontrou vagas compatíveis. Ajuste seus objetivos ou aguarde o próximo ciclo de busca."
      ctaLabel="Ajustar objetivos"
      ctaHref="/dashboard/objetivos"
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
      title="Caixa de mensagens vazia"
      description="Recrutadores e a IA enviarão atualizações aqui assim que houver movimento nas suas candidaturas."
      ctaLabel="Abrir assistente"
      ctaHref="/dashboard/assistente"
    />
  );
}

export function NewUserState({ firstName }: { firstName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111315] p-8 sm:p-10"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,124,255,0.18),transparent_55%)]"
        aria-hidden="true"
      />
      <div className="relative max-w-xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#4F7CFF]/15 ring-1 ring-[#4F7CFF]/30">
          <Sparkles className="h-5 w-5 text-[#4F7CFF]" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-[#4F7CFF]">Bem-vindo(a)</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Olá, {firstName}. Sua IA está pronta.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF] sm:text-base">
          Complete seu objetivo profissional e a IA começará a buscar vagas,
          adaptar currículos e candidatar você automaticamente — enquanto você
          foca no que importa.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button
            render={<Link href="/dashboard/objetivos" />}
            nativeButton={false}
            className="h-10 px-5"
          >
            Definir objetivo
          </Button>
          <Button
            variant="outline"
            render={<Link href="/onboarding" />}
            nativeButton={false}
            className="h-10 border-white/10 bg-transparent px-5"
          >
            Revisar onboarding
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
