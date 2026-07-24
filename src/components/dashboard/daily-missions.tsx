"use client";

import Link from "next/link";
import { motion, useSpring, useTransform } from "framer-motion";
import { Check, Gamepad2, Target } from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { EmployabilityOverview } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface DailyMissionsProps {
  overview: EmployabilityOverview;
  className?: string;
}

const BAR_SEGMENTS = 10;

function AnimatedScore({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 70, damping: 22 });
  const display = useTransform(spring, (current) => Math.round(current));
  const [text, setText] = useState("0");

  useEffect(() => {
    spring.set(value);
    const unsubscribe = display.on("change", (v) => setText(String(v)));
    return () => unsubscribe();
  }, [display, spring, value]);

  return <span className="tabular-nums">{text}%</span>;
}

function ScoreBar({ score, goal }: { score: number; goal: number }) {
  const filled = Math.max(
    0,
    Math.min(BAR_SEGMENTS, Math.round((score / 100) * BAR_SEGMENTS))
  );
  const goalPosition = Math.max(
    0,
    Math.min(100, (goal / 100) * 100)
  );

  return (
    <div className="space-y-2">
      <div
        className="flex items-center gap-[3px] sm:gap-1"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Empregabilidade ${score}%`}
      >
        {Array.from({ length: BAR_SEGMENTS }, (_, i) => {
          const isFilled = i < filled;
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, scaleY: 0.5 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{
                delay: 0.15 + i * 0.04,
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "h-4 flex-1 rounded-[3px] sm:h-5",
                isFilled
                  ? "bg-gradient-to-b from-[#6B93FF] to-[#4F7CFF] shadow-[0_0_12px_rgba(79,124,255,0.35)]"
                  : "bg-white/[0.08]"
              )}
            />
          );
        })}
      </div>

      <div className="relative h-4">
        <div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${goalPosition}%` }}
        >
          <span className="h-2 w-px bg-[#22C55E]/60" aria-hidden="true" />
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#9CA3AF]">
            <Target className="h-3 w-3 text-[#22C55E]" aria-hidden="true" />
            Meta: <span className="font-semibold text-[#22C55E]">{goal}%</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function DailyMissions({ overview, className }: DailyMissionsProps) {
  const titleId = useId();
  const pendingBoost = overview.missions
    .filter((mission) => !mission.completed)
    .reduce((sum, mission) => sum + mission.upliftPercent, 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111315]",
        className
      )}
      aria-labelledby={titleId}
    >
      <div className="border-b border-white/[0.06] bg-gradient-to-br from-[#4F7CFF]/10 via-transparent to-transparent p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Empregabilidade
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              <AnimatedScore value={overview.score} />
            </p>
          </div>
          {pendingBoost > 0 && (
            <div className="rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/10 px-3.5 py-2 text-right">
              <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                Disponível hoje
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#22C55E]">
                +{pendingBoost}% nas missões
              </p>
            </div>
          )}
        </div>

        <ScoreBar score={overview.score} goal={overview.goal} />
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/15 ring-1 ring-[#8B5CF6]/25">
            <Gamepad2 className="h-4 w-4 text-[#8B5CF6]" aria-hidden="true" />
          </div>
          <div>
            <h2 id={titleId} className="text-base font-semibold text-white">
              Missões Diárias
            </h2>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              Transformando a evolução da carreira em algo quase como um jogo.
            </p>
          </div>
        </div>

        <ul className="space-y-2" role="list">
          {overview.missions.map((mission, index) => {
            const Icon = mission.icon;

            return (
              <motion.li
                key={mission.id}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={mission.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-all sm:px-4",
                    mission.completed
                      ? "border-[#22C55E]/20 bg-[#22C55E]/[0.06]"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-[#4F7CFF]/30 hover:bg-[#4F7CFF]/[0.06]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                      mission.completed
                        ? "border-[#22C55E]/40 bg-[#22C55E]/20 text-[#22C55E]"
                        : "border-white/[0.12] bg-white/[0.03] text-transparent group-hover:border-[#4F7CFF]/40"
                    )}
                    aria-hidden="true"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>

                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      mission.completed ? "bg-white/[0.04]" : "bg-[#4F7CFF]/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        mission.completed ? "text-[#9CA3AF]" : "text-[#4F7CFF]"
                      )}
                      aria-hidden="true"
                    />
                  </span>

                  <span
                    className={cn(
                      "min-w-0 flex-1 text-sm font-medium",
                      mission.completed
                        ? "text-[#9CA3AF] line-through decoration-[#22C55E]/50"
                        : "text-white"
                    )}
                  >
                    {mission.label}
                  </span>

                  <span
                    className={cn(
                      "shrink-0 rounded-lg px-2 py-1 text-xs font-semibold",
                      mission.completed
                        ? "bg-[#22C55E]/12 text-[#22C55E]"
                        : "bg-[#4F7CFF]/12 text-[#A8C0FF]"
                    )}
                  >
                    +{mission.upliftPercent}%
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </motion.section>
  );
}
