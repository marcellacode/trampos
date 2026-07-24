"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Recommendation } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  recommendation: Recommendation;
  className?: string;
}

export function RecommendationCard({
  recommendation,
  className,
}: RecommendationCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#4F7CFF]/25 bg-gradient-to-br from-[#4F7CFF]/12 via-[#111315] to-[#111315] p-6 sm:p-8",
        className
      )}
      aria-labelledby="recommendation-heading"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#4F7CFF]/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4F7CFF]/15 ring-1 ring-[#4F7CFF]/30">
            <Sparkles className="h-5 w-5 text-[#4F7CFF]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#4F7CFF]">
              Próxima ação recomendada
            </p>
            <h2
              id="recommendation-heading"
              className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl"
            >
              {recommendation.title}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#9CA3AF] sm:text-[15px]">
              {recommendation.description}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-[#9CA3AF]">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Duração: {recommendation.duration}
              <span className="text-white/20">·</span>
              {recommendation.company}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
          <Button
            render={<Link href={recommendation.href} />}
            nativeButton={false}
            className="h-10 px-5"
          >
            {recommendation.ctaPrimary}
          </Button>
          <Button
            variant="ghost"
            className="h-10 px-5 text-[#9CA3AF] hover:text-white"
          >
            {recommendation.ctaSecondary}
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
