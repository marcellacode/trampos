"use client";

import { useEffect, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import type { GoalChip } from "@/types/onboarding";
import { parseGoalText } from "@/lib/onboarding/goal-parser";
import { cn } from "@/lib/utils";

interface GoalParserProps {
  value: string;
  chips: GoalChip[];
  onTextChange: (value: string) => void;
  onChipsChange: (chips: GoalChip[]) => void;
  className?: string;
}

export function GoalParser({
  value,
  chips,
  onTextChange,
  onChipsChange,
  className,
}: GoalParserProps) {
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (value.trim().length < 10) {
      if (chips.length > 0) onChipsChange([]);
      return;
    }

    const timer = window.setTimeout(() => {
      startTransition(() => {
        onChipsChange(parseGoalText(value));
      });
    }, 320);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-parse when text changes
  }, [value]);

  const removeChip = (id: string) => {
    onChipsChange(chips.filter((c) => c.id !== id));
  };

  return (
    <div className={cn("mx-auto w-full max-w-2xl space-y-6", className)}>
      <div className="space-y-3 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
        >
          O que você procura hoje?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-sm text-[#9CA3AF] sm:text-base"
        >
          Escreva livremente. A IA interpreta automaticamente seus objetivos.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <label htmlFor="goal-text" className="sr-only">
          Objetivos profissionais
        </label>
        <textarea
          id="goal-text"
          value={value}
          onChange={(e) => onTextChange(e.target.value)}
          rows={5}
          placeholder="Quero trabalhar como Desenvolvedora Front-end React, remoto, recebendo acima de R$8.000."
          className="w-full resize-none rounded-2xl border border-white/[0.1] bg-[#111315]/90 px-5 py-4 text-base leading-relaxed text-white outline-none transition-shadow placeholder:text-white/30 focus:border-[#4F7CFF]/50 focus:ring-2 focus:ring-[#4F7CFF]/25 focus:shadow-[0_0_40px_rgba(79,124,255,0.15)]"
          aria-describedby="goal-hint"
        />
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-[#4F7CFF]/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#A8C0FF]">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          IA ativa
        </div>
      </motion.div>

      <p id="goal-hint" className="sr-only">
        Digite seus objetivos. Chips serão gerados automaticamente abaixo.
      </p>

      <AnimatePresence mode="popLayout">
        {chips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Interpretado pela IA
            </p>
            <div
              className="flex flex-wrap gap-2"
              role="list"
              aria-label="Objetivos detectados"
            >
              <AnimatePresence>
                {chips.map((chip) => (
                  <motion.button
                    key={chip.id}
                    type="button"
                    role="listitem"
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => removeChip(chip.id)}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-[#4F7CFF]/30 bg-[#4F7CFF]/12 px-3.5 py-1.5 text-sm font-medium text-[#C5D4FF] transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]/60"
                    aria-label={`Remover ${chip.label}`}
                  >
                    {chip.label}
                    <X
                      className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
