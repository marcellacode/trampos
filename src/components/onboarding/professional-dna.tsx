"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { Brain, Check, Rocket } from "lucide-react";
import type { ProfessionalDna, SalaryRange } from "@/types/onboarding";
import { cn } from "@/lib/utils";

interface ProfessionalDnaProps {
  dna: ProfessionalDna;
  onContinue: () => void;
  isLoading?: boolean;
  className?: string;
}

function formatSalary(range: SalaryRange): string {
  const formatter = new Intl.NumberFormat(
    range.currency === "BRL" ? "pt-BR" : "en-US",
    {
      style: "currency",
      currency: range.currency,
      maximumFractionDigits: 0,
    }
  );

  const min = formatter.format(range.min);
  if (range.max === null) {
    return `${min}+`;
  }
  return `${min} - ${formatter.format(range.max)}`;
}

function AnimatedScore({
  score,
  delay = 0,
}: {
  score: number;
  delay?: number;
}) {
  const spring = useSpring(0, { stiffness: 70, damping: 22 });
  const display = useTransform(spring, (current) => Math.round(current));
  const [text, setText] = useState("0");

  useEffect(() => {
    const timeout = window.setTimeout(() => spring.set(score), delay);
    const unsubscribe = display.on("change", (v) => setText(String(v)));
    return () => {
      window.clearTimeout(timeout);
      unsubscribe();
    };
  }, [delay, display, score, spring]);

  return <span className="tabular-nums">{text}%</span>;
}

function CompatibilityBar({
  label,
  score,
  index,
}: {
  label: string;
  score: number;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.08 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-[#C4C9D4]">{label}</span>
        <span className="font-semibold text-white">
          <AnimatedScore score={score} delay={450 + index * 80} />
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#6B93FF]"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{
            delay: 0.4 + index * 0.08,
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ boxShadow: "0 0 14px rgba(79, 124, 255, 0.45)" }}
        />
      </div>
    </motion.div>
  );
}

function SalaryBlock({
  range,
  delay,
}: {
  range: SalaryRange;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
        {range.label}
      </p>
      <p className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
        {formatSalary(range)}
      </p>
    </motion.div>
  );
}

export function ProfessionalDnaReveal({
  dna,
  onContinue,
  isLoading = false,
  className,
}: ProfessionalDnaProps) {
  return (
    <div className={cn("mx-auto w-full max-w-3xl space-y-8 py-4", className)}>
      <div className="space-y-3 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4F7CFF]"
        >
          <Brain className="h-4 w-4" aria-hidden="true" />
          DNA Profissional
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.05 }}
          className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
        >
          Seu Perfil Profissional
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="text-sm text-[#9CA3AF] sm:text-base"
        >
          A IA cruzou experiências, skills e objetivos para revelar seu DNA de
          carreira.
        </motion.p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.15, duration: 0.45 }}
        className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#111315]/85 p-5 backdrop-blur-sm sm:p-7"
        aria-labelledby="dna-profile-title"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
            Perfil predominante
          </p>
          <h3
            id="dna-profile-title"
            className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
          >
            <span className="text-gradient-primary">{dna.predominantProfile}</span>
          </h3>
        </div>

        <ul className="space-y-2.5" aria-label="Pontos fortes">
          {dna.strengths.map((strength, index) => (
            <motion.li
              key={strength}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22 + index * 0.06 }}
              className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/15 text-[#22C55E]">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span className="text-sm text-[#E5E7EB] sm:text-[0.95rem]">
                {strength}
              </span>
            </motion.li>
          ))}
        </ul>

        <div className="space-y-4 border-t border-white/[0.06] pt-5">
          <h4 className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
            Compatibilidade média
          </h4>
          <div className="space-y-4">
            {dna.compatibility.map((item, index) => (
              <CompatibilityBar
                key={item.label}
                label={item.label}
                score={item.score}
                index={index}
              />
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.35, duration: 0.45 }}
        className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#111315]/85 p-5 backdrop-blur-sm sm:p-7"
        aria-labelledby="dna-salary-title"
      >
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-[#4F7CFF]" aria-hidden="true" />
          <h3
            id="dna-salary-title"
            className="text-lg font-semibold text-white sm:text-xl"
          >
            Seu potencial salarial atual
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SalaryBlock range={dna.salary.current.brazil} delay={0.42} />
          <SalaryBlock range={dna.salary.current.international} delay={0.48} />
        </div>

        <div className="space-y-3 border-t border-white/[0.06] pt-5">
          <p className="text-sm text-[#C4C9D4]">
            Se aprender{" "}
            <span className="font-medium text-[#A8C0FF]">
              {dna.salary.withSkills.skillsLabel}
            </span>
            :
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <SalaryBlock range={dna.salary.withSkills.brazil} delay={0.55} />
            <SalaryBlock
              range={dna.salary.withSkills.international}
              delay={0.6}
            />
          </div>
        </div>
      </motion.section>

      <div className="flex justify-center pb-2">
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          whileHover={isLoading ? undefined : { scale: 1.02 }}
          whileTap={isLoading ? undefined : { scale: 0.98 }}
          disabled={isLoading}
          onClick={onContinue}
          className="inline-flex h-12 min-w-[220px] items-center justify-center rounded-xl bg-[#4F7CFF] px-8 text-sm font-semibold text-white shadow-[0_0_32px_rgba(79,124,255,0.35)] transition-colors hover:bg-[#638BFF] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090A]"
        >
          {isLoading ? "Finalizando..." : "Continuar"}
        </motion.button>
      </div>
    </div>
  );
}
