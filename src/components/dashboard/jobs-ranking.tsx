"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { getCompatibilityColor, getRankLabel } from "@/lib/jobs/rank";
import { sortByCompatibility } from "@/lib/jobs/sort";
import { cn } from "@/lib/utils";

interface RankedJob {
  id: string;
  company: string;
  hasMatch?: boolean;
  compatibility: number;
  logo?: string;
  color?: string;
  href?: string;
}

interface JobsRankingProps {
  jobs: RankedJob[];
  className?: string;
  limit?: number;
}

export function JobsRanking({ jobs, className, limit }: JobsRankingProps) {
  const ranked = sortByCompatibility(jobs, (job) => job.company).slice(
    0,
    limit ?? jobs.length
  );

  return (
    <section
      className={cn(className)}
      aria-labelledby="jobs-ranking-heading"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy
            className="h-4 w-4 text-[#F59E0B]"
            aria-hidden="true"
          />
          <h2
            id="jobs-ranking-heading"
            className="text-base font-semibold text-foreground"
          >
            Ranking das vagas
          </h2>
        </div>
        <Link
          href="/dashboard/vagas"
          className="text-xs font-medium text-primary transition-colors hover:text-[#6B93FF]"
        >
          Ver todas
        </Link>
      </div>

      <ol
        className="divide-y divide-white/[0.06] rounded-2xl border border-border bg-card"
        role="list"
      >
        {ranked.map((job, index) => {
          const rank = index + 1;
          const rankLabel = getRankLabel(rank);
          const color = getCompatibilityColor(job.compatibility);
          const content = (
            <>
              <span
                className={cn(
                  "flex w-8 shrink-0 items-center justify-center text-base tabular-nums",
                  rank > 3 && "text-sm font-medium text-muted-foreground"
                )}
                aria-hidden="true"
              >
                {rankLabel}
              </span>

              {job.logo && job.color ? (
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                  style={{
                    backgroundColor: `${job.color}22`,
                    color: job.color,
                  }}
                >
                  {job.logo}
                </div>
              ) : null}

              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {job.company}
              </span>

              {job.hasMatch !== false ? (
                <span
                  className="shrink-0 text-sm font-semibold tabular-nums"
                  style={{ color }}
                >
                  {job.compatibility}%
                </span>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground">—</span>
              )}
            </>
          );

          return (
            <motion.li
              key={job.id}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
            >
              {job.href ? (
                <Link
                  href={job.href}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  {content}
                </div>
              )}
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
