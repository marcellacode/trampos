"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  ChevronRight,
  Clock,
  MapPin,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompatibilityBar } from "@/components/dashboard/jobs/compatibility-bar";
import type { JobDetail } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface JobHeroProps {
  job: JobDetail;
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
}

export function JobHero({ job, saved, onSave, onShare }: JobHeroProps) {
  return (
    <div className="space-y-4">
      {/* Breadcrumb + Back */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
          <Link
            href="/dashboard/vagas"
            className="text-[#9CA3AF] transition-colors hover:text-white"
          >
            Vagas
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#9CA3AF]/60" aria-hidden="true" />
          <span className="text-[#9CA3AF]">{job.role}</span>
          <ChevronRight className="h-3.5 w-3.5 text-[#9CA3AF]/60" aria-hidden="true" />
          <span className="font-medium text-white">{job.company}</span>
        </nav>
        <Button
          render={<Link href="/dashboard/vagas" />}
          nativeButton={false}
          variant="ghost"
          className="h-8 gap-1.5 text-[#9CA3AF] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Voltar
        </Button>
      </div>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111315] p-6 sm:p-8"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(79,124,255,0.1),transparent_50%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: job.color }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-lg font-bold shadow-lg"
              style={{ backgroundColor: `${job.color}22`, color: job.color }}
            >
              {job.logo}
            </div>
            <div>
              <p className="text-sm text-[#9CA3AF]">{job.company}</p>
              <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl lg:text-3xl">
                {job.role}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#9CA3AF]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {job.location}
                </span>
                <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-xs font-medium text-white/80">
                  {job.remote ? "Remoto" : "Presencial/Híbrido"}
                </span>
                <span className="font-medium text-white">{job.salary}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#9CA3AF]">
                <span>{job.publishedAt}</span>
                {job.verified && (
                  <span className="inline-flex items-center gap-1 text-[#22C55E]">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Empresa verificada
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Resposta em ~{job.stats.responseDays} dias
                </span>
              </div>
            </div>
          </div>

          <div className="w-full lg:max-w-xs">
            <CompatibilityBar
              value={job.compatibility}
              hasMatch={job.hasMatch}
              size="lg"
            />
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-2 border-t border-white/[0.06] pt-6">
          <Button className="h-10 flex-1 gap-2 sm:flex-none sm:px-6">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Candidatar com IA
          </Button>
          <Button
            variant="outline"
            onClick={onSave}
            className={cn(
              "h-10 border-white/10 bg-transparent",
              saved && "border-[#4F7CFF]/40 text-[#4F7CFF]"
            )}
          >
            <Bookmark
              className={cn("h-4 w-4", saved && "fill-current")}
              aria-hidden="true"
            />
            Salvar
          </Button>
          <Button
            variant="outline"
            onClick={onShare}
            className="h-10 border-white/10 bg-transparent"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Compartilhar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
