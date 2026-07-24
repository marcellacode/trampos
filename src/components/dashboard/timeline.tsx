"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { TimelineActivity } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface TimelineProps {
  items: TimelineActivity[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111315]",
        className
      )}
      aria-labelledby="timeline-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(79,124,255,0.12),transparent_50%)]"
        aria-hidden="true"
      />

      <div className="relative p-6 sm:p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#4F7CFF]/20 bg-[#4F7CFF]/10 px-3 py-1 text-xs font-medium text-[#4F7CFF]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4F7CFF] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4F7CFF]" />
              </span>
              Atividade noturna
            </div>
            <h2
              id="timeline-heading"
              className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              Enquanto você estava fora...
            </h2>
            <p className="mt-2 text-sm text-[#9CA3AF] sm:text-base">
              Sua IA continuou trabalhando.
            </p>
          </div>
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4F7CFF]/10 ring-1 ring-[#4F7CFF]/25 sm:flex">
            <Sparkles className="h-5 w-5 text-[#4F7CFF]" aria-hidden="true" />
          </div>
        </div>

        <ol className="relative space-y-0" role="list">
          <div
            className="absolute bottom-4 left-[19px] top-4 w-px bg-gradient-to-b from-[#4F7CFF]/40 via-white/10 to-transparent sm:left-[23px]"
            aria-hidden="true"
          />

          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  href={item.href}
                  className="group relative flex gap-4 rounded-xl p-2 transition-colors hover:bg-white/[0.03] sm:gap-5 sm:p-3"
                >
                  <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#0C0D0F] sm:h-12 sm:w-12"
                      style={{
                        boxShadow: `0 0 24px ${item.glow}`,
                      }}
                    >
                      <Icon
                        className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                        style={{ color: item.color }}
                        aria-hidden="true"
                      />
                    </motion.div>
                  </div>

                  <div className="min-w-0 flex-1 pb-6 pt-1.5 sm:pt-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <time className="font-mono text-xs text-[#9CA3AF]">
                          {item.time}
                        </time>
                        <p className="mt-1 text-sm font-medium text-white sm:text-[15px]">
                          <span className="mr-1.5 text-[#22C55E]" aria-hidden="true">
                            ✔
                          </span>
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="mt-1 text-xs text-[#9CA3AF] sm:text-sm">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#9CA3AF] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-white" />
                    </div>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
