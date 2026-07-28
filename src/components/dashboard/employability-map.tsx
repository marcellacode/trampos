"use client";

import { AnimatePresence, motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useId, useState } from "react";
import { Map, Sparkles, TrendingUp } from "lucide-react";
import type { EmployabilitySkill } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const SEGMENTS = 11;

interface EmployabilityMapProps {
  skills: EmployabilitySkill[];
  /** Pre-select a skill by id (e.g. from ?skill=docker) */
  initialSkillId?: string;
  className?: string;
  /** Compact layout for dashboard home teaser */
  compact?: boolean;
}

function AnimatedPercent({
  value,
  delay = 0,
}: {
  value: number;
  delay?: number;
}) {
  const spring = useSpring(0, { stiffness: 70, damping: 22 });
  const display = useTransform(spring, (current) => Math.round(current));
  const [text, setText] = useState("0");

  useEffect(() => {
    const timeout = window.setTimeout(() => spring.set(value), delay);
    const unsubscribe = display.on("change", (v) => setText(String(v)));
    return () => {
      window.clearTimeout(timeout);
      unsubscribe();
    };
  }, [delay, display, spring, value]);

  return <span className="tabular-nums">{text}%</span>;
}

function SegmentBar({
  score,
  active,
  index,
}: {
  score: number;
  active: boolean;
  index: number;
}) {
  const filled = Math.max(0, Math.min(SEGMENTS, Math.round((score / 100) * SEGMENTS)));

  return (
    <div
      className="flex flex-1 items-center gap-[3px] sm:gap-1"
      role="img"
      aria-label={`${score}% de alinhamento`}
    >
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const isFilled = i < filled;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{
              delay: 0.2 + index * 0.05 + i * 0.025,
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
              "h-3.5 flex-1 rounded-[2px] sm:h-4",
              isFilled
                ? active
                  ? "bg-gradient-to-b from-[#6B93FF] to-primary shadow-[0_0_10px_rgba(79,124,255,0.45)]"
                  : "bg-gradient-to-b from-[#5A88FF] to-[#3D6AE8]"
                : "bg-white/[0.08]"
            )}
          />
        );
      })}
    </div>
  );
}

function AiInsight({
  skill,
  thinking,
}: {
  skill: EmployabilitySkill;
  thinking: boolean;
}) {
  return (
    <motion.aside
      key={skill.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28 }}
      className="rounded-2xl border border-primary/25 bg-primary/[0.07] p-5"
      aria-live="polite"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-medium text-[#A8C0FF]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Análise da IA
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />+
          {skill.upliftPercent}% compatibilidade
        </span>
      </div>

      {thinking ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Cruzando seu perfil com as vagas que você procura…
        </div>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-[#E5E7EB] sm:text-[0.95rem]">
            {skill.explanation}
          </p>
          {skill.context && (
            <p className="mt-3 text-xs text-muted-foreground">{skill.context}</p>
          )}
        </>
      )}
    </motion.aside>
  );
}

export function EmployabilityMap({
  skills,
  initialSkillId,
  className,
  compact = false,
}: EmployabilityMapProps) {
  const titleId = useId();
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSkillId && skills.some((s) => s.id === initialSkillId)
      ? initialSkillId
      : null
  );
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    if (!initialSkillId) return;
    if (!skills.some((s) => s.id === initialSkillId)) return;
    setSelectedId(initialSkillId);
  }, [initialSkillId, skills]);

  useEffect(() => {
    if (!selectedId) return;
    setThinking(true);
    const timeout = window.setTimeout(() => setThinking(false), 520);
    return () => window.clearTimeout(timeout);
  }, [selectedId]);

  const selected = skills.find((s) => s.id === selectedId) ?? null;
  const bestUplift = skills.reduce(
    (best, skill) => (skill.upliftPercent > best.upliftPercent ? skill : best),
    skills[0]
  );

  function handleSelect(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6",
        className
      )}
      aria-labelledby={titleId}
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <Map className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 id={titleId} className="text-base font-semibold text-foreground">
              Mapa de Empregabilidade
            </h2>
          </div>
          <p className="max-w-lg text-sm text-muted-foreground">
            Onde estão as melhores oportunidades no seu perfil. Clique em uma
            competência para a IA explicar o impacto.
          </p>
        </div>
        {!compact && bestUplift && (
          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-right">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Maior alavanca
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {bestUplift.label}{" "}
              <span className="text-success">+{bestUplift.upliftPercent}%</span>
            </p>
          </div>
        )}
      </div>

      <ul className="space-y-2" role="list">
        {skills.map((skill, index) => {
          const active = selectedId === skill.id;
          const isOpportunity = skill.score < 80;

          return (
            <li key={skill.id}>
              <button
                type="button"
                onClick={() => handleSelect(skill.id)}
                aria-pressed={active}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all sm:gap-4 sm:px-4",
                  active
                    ? "border-primary/40 bg-primary/10 shadow-[0_0_28px_rgba(79,124,255,0.12)]"
                    : "border-transparent bg-muted/30 hover:border-border hover:bg-muted/50"
                )}
              >
                <SegmentBar score={skill.score} active={active} index={index} />

                <div className="flex w-[7.5rem] shrink-0 flex-col sm:w-36">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {skill.label}
                    {isOpportunity && (
                      <span className="hidden rounded bg-[#F59E0B]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#F59E0B] sm:inline">
                        gap
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-[#C4C9D4]">
                    {active ? "Selecionado" : "Toque para analisar"}
                  </span>
                </div>

                <span
                  className={cn(
                    "w-12 shrink-0 text-right text-sm font-semibold sm:w-14",
                    skill.score >= 90
                      ? "text-success"
                      : skill.score >= 75
                        ? "text-foreground"
                        : "text-[#F59E0B]"
                  )}
                >
                  <AnimatedPercent value={skill.score} delay={280 + index * 70} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 min-h-[7.5rem]">
        <AnimatePresence mode="wait">
          {selected ? (
            <AiInsight skill={selected} thinking={thinking} />
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground"
            >
              Selecione uma competência — por exemplo{" "}
              <button
                type="button"
                onClick={() => handleSelect("docker")}
                className="font-medium text-[#A8C0FF] underline-offset-2 hover:underline"
              >
                Docker
              </button>{" "}
              — para ver o ganho estimado de compatibilidade.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
