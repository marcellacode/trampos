"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Briefcase,
  RefreshCw,
  SearchX,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DiscoveryViewState } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface StateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  onRetry?: () => void;
}

const STATE_CONFIG: Record<
  Exclude<DiscoveryViewState, "default" | "loading">,
  StateConfig
> = {
  empty: {
    icon: Briefcase,
    title: "Nenhuma vaga encontrada ainda",
    description:
      "Sua IA está analisando o mercado. Complete seu perfil para acelerar as recomendações.",
    ctaLabel: "Completar perfil",
    ctaHref: "/onboarding",
  },
  "first-access": {
    icon: Sparkles,
    title: "Sua IA está descobrindo oportunidades",
    description:
      "Estamos cruzando seu perfil com milhares de vagas. Em instantes, você verá recomendações personalizadas — não uma lista genérica.",
    ctaLabel: "Definir objetivos",
    ctaHref: "/dashboard/objetivos",
  },
  "no-results": {
    icon: SearchX,
    title: "Nenhum resultado para essa busca",
    description:
      "Tente reformular com linguagem natural. Exemplo: \"vagas remotas de React acima de R$12k\".",
    ctaLabel: "Limpar filtros",
  },
  error: {
    icon: AlertCircle,
    title: "Algo deu errado",
    description:
      "Não conseguimos carregar suas oportunidades. Verifique sua conexão e tente novamente.",
    ctaLabel: "Tentar novamente",
  },
};

interface DiscoveryStateProps {
  state: Exclude<DiscoveryViewState, "default" | "loading">;
  onAction?: () => void;
  className?: string;
}

export function DiscoveryState({ state, onAction, className }: DiscoveryStateProps) {
  const config = STATE_CONFIG[state];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-16 text-center",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,124,255,0.06),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4F7CFF]/10 ring-1 ring-[#4F7CFF]/25">
        <Icon className="h-7 w-7 text-[#4F7CFF]" aria-hidden="true" />
      </div>

      <h3 className="relative text-lg font-semibold text-white">{config.title}</h3>
      <p className="relative mt-2 max-w-md text-sm leading-relaxed text-[#9CA3AF]">
        {config.description}
      </p>

      {config.ctaLabel && (
        <div className="relative mt-6">
          {state === "error" || state === "no-results" ? (
            <Button onClick={onAction} className="h-10 gap-2 px-5">
              {state === "error" && (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
              {config.ctaLabel}
            </Button>
          ) : (
            config.ctaHref && (
              <Button
                render={<Link href={config.ctaHref} />}
                nativeButton={false}
                className="h-10 px-5"
              >
                {config.ctaLabel}
              </Button>
            )
          )}
        </div>
      )}
    </motion.div>
  );
}

export function DiscoverySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-64 rounded-lg bg-white/[0.06]" />
        <div className="h-4 w-96 max-w-full rounded bg-white/[0.04]" />
      </div>
      <div className="h-16 rounded-2xl bg-white/[0.04]" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-white/[0.04]" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-white/[0.04]" />
        ))}
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="h-80 rounded-2xl bg-white/[0.03]" />
      ))}
    </div>
  );
}
