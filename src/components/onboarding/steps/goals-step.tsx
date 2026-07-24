"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { GoalParser } from "@/components/onboarding/goal-parser";
import {
  goalsStepSchema,
  type GoalsStepValues,
} from "@/lib/onboarding/schema";
import type { GoalChip } from "@/types/onboarding";

interface GoalsStepProps {
  goalText: string;
  goalChips: GoalChip[];
  onTextChange: (value: string) => void;
  onChipsChange: (chips: GoalChip[]) => void;
  onContinue: (values: GoalsStepValues) => void;
}

export function GoalsStep({
  goalText,
  goalChips,
  onTextChange,
  onChipsChange,
  onContinue,
}: GoalsStepProps) {
  const form = useForm<GoalsStepValues>({
    resolver: zodResolver(goalsStepSchema),
    mode: "onChange",
    defaultValues: {
      goalText,
      goalChips,
    },
  });

  const {
    formState: { errors },
  } = form;

  useEffect(() => {
    form.setValue("goalText", goalText, { shouldValidate: true });
  }, [form, goalText]);

  useEffect(() => {
    form.setValue("goalChips", goalChips, { shouldValidate: true });
  }, [form, goalChips]);

  // Text length is enough to continue; chips are an AI enhancement, not a gate.
  const canContinue = goalText.trim().length >= 10;

  return (
    <form
      className="flex flex-1 flex-col justify-center gap-8 py-6"
      onSubmit={form.handleSubmit(onContinue)}
      noValidate
    >
      <GoalParser
        value={goalText}
        chips={goalChips}
        onTextChange={onTextChange}
        onChipsChange={onChipsChange}
      />

      {errors.goalText && (
        <p role="alert" className="text-center text-sm text-red-300">
          {errors.goalText.message}
        </p>
      )}

      <div className="flex justify-center">
        <motion.button
          type="submit"
          whileHover={canContinue ? { scale: 1.02 } : undefined}
          whileTap={canContinue ? { scale: 0.98 } : undefined}
          disabled={!canContinue}
          className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-xl bg-[#4F7CFF] px-8 text-sm font-semibold text-white shadow-[0_0_32px_rgba(79,124,255,0.35)] transition-colors hover:bg-[#638BFF] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090A]"
        >
          Continuar
        </motion.button>
      </div>
    </form>
  );
}
