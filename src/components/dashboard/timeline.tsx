"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Bot, Building2 } from "lucide-react";
import type { TimelineActivity } from "@/types/dashboard";
import { actorLabel } from "@/lib/dashboard/timeline";
import { useLiveTimeline } from "@/lib/dashboard/use-live-timeline";
import { cn } from "@/lib/utils";

interface TimelineProps {
  items: TimelineActivity[];
  className?: string;
}

export function Timeline({ items: seed, className }: TimelineProps) {
  const items = useLiveTimeline({ seed });
  const listRef = useRef<HTMLOListElement>(null);
  const latestId = items[items.length - 1]?.id;

  useEffect(() => {
    if (!latestId) return;
    const latest = items[items.length - 1];
    if (!latest?.isLive) return;
    listRef.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [latestId, items]);

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
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#22C55E]/25 bg-[#22C55E]/10 px-3 py-1 text-xs font-medium text-[#22C55E]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
              </span>
              Ao vivo
            </div>
            <h2
              id="timeline-heading"
              className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              Linha do Tempo Viva
            </h2>
            <p className="mt-2 text-sm text-[#9CA3AF] sm:text-base">
              Eventos chegam em tempo real — sem precisar recarregar.
            </p>
          </div>
          <motion.div
            animate={{ opacity: [1, 0.55, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 sm:flex"
          >
            <Bot className="h-4 w-4 text-[#4F7CFF]" aria-hidden="true" />
            <span className="text-xs text-[#9CA3AF]">IA trabalhando</span>
          </motion.div>
        </div>

        <ol
          ref={listRef}
          className="relative max-h-[min(28rem,60vh)] space-y-0 overflow-y-auto pr-1"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Atividade em tempo real"
        >
          <div
            className="absolute bottom-4 left-[19px] top-4 w-px bg-gradient-to-b from-[#4F7CFF]/40 via-white/10 to-transparent sm:left-[23px]"
            aria-hidden="true"
          />

          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const Icon = item.icon;
              const isLatest = index === items.length - 1;
              const ActorIcon = item.actor === "ai" ? Bot : Building2;

              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={
                    item.isLive
                      ? { opacity: 0, y: 18, scale: 0.98 }
                      : { opacity: 0, x: -12 }
                  }
                  animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                    delay: item.isLive ? 0 : index * 0.05,
                  }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex gap-4 rounded-xl p-2 transition-colors hover:bg-white/[0.03] sm:gap-5 sm:p-3",
                      item.isLive &&
                        isLatest &&
                        "bg-[#22C55E]/[0.06] ring-1 ring-[#22C55E]/20"
                    )}
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
                          <div className="flex flex-wrap items-center gap-2">
                            <time
                              dateTime={item.createdAt}
                              className="font-mono text-xs text-[#9CA3AF]"
                            >
                              {item.time}
                            </time>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                                item.actor === "ai"
                                  ? "bg-[#4F7CFF]/10 text-[#4F7CFF]"
                                  : "bg-white/[0.06] text-[#9CA3AF]"
                              )}
                            >
                              <ActorIcon
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                              {actorLabel(item.actor)}
                            </span>
                            {item.isLive && isLatest ? (
                              <span className="text-[10px] font-medium uppercase tracking-wide text-[#22C55E]">
                                Agora
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1.5 text-sm font-medium text-white sm:text-[15px]">
                            <span className="mr-1.5" aria-hidden="true">
                              {item.actor === "ai" ? "🤖" : "🏢"}
                            </span>
                            {item.title}
                          </p>
                          {item.description ? (
                            <p className="mt-1 text-xs text-[#9CA3AF] sm:text-sm">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#9CA3AF] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-white" />
                      </div>
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </div>
    </section>
  );
}
