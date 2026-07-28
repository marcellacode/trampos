"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AvailabilityCards } from "@/components/onboarding/availability-cards";
import {
  availabilityStepSchema,
  type AvailabilityStepValues,
} from "@/lib/onboarding/schema";
import type {
  AvailabilityOption,
  ContractType,
  WorkModel,
} from "@/types/onboarding";

interface AvailabilityStepProps {
  availability: AvailabilityOption | null;
  workModels: WorkModel[];
  contractTypes: ContractType[];
  onAvailabilityChange: (value: AvailabilityOption) => void;
  onWorkModelsChange: (values: WorkModel[]) => void;
  onContractTypesChange: (values: ContractType[]) => void;
  onContinue: (values: AvailabilityStepValues) => void;
}

export function AvailabilityStep({
  availability,
  workModels,
  contractTypes,
  onAvailabilityChange,
  onWorkModelsChange,
  onContractTypesChange,
  onContinue,
}: AvailabilityStepProps) {
  const form = useForm<AvailabilityStepValues>({
    resolver: zodResolver(availabilityStepSchema),
    mode: "onChange",
    defaultValues: {
      availability: availability ?? undefined,
      workModels,
      contractTypes,
    },
  });

  useEffect(() => {
    if (availability) {
      form.setValue("availability", availability, { shouldValidate: true });
    }
  }, [availability, form]);

  useEffect(() => {
    form.setValue("workModels", workModels, { shouldValidate: true });
  }, [form, workModels]);

  useEffect(() => {
    form.setValue("contractTypes", contractTypes, { shouldValidate: true });
  }, [contractTypes, form]);

  const canContinue = form.formState.isValid;

  return (
    <form
      className="flex flex-1 flex-col justify-center gap-8 py-6"
      onSubmit={form.handleSubmit(onContinue)}
      noValidate
    >
      <AvailabilityCards
        availability={availability}
        workModels={workModels}
        contractTypes={contractTypes}
        onAvailabilityChange={onAvailabilityChange}
        onWorkModelsChange={onWorkModelsChange}
        onContractTypesChange={onContractTypesChange}
      />

      <div className="flex justify-center pb-4">
        <motion.button
          type="submit"
          whileHover={canContinue ? { scale: 1.02 } : undefined}
          whileTap={canContinue ? { scale: 0.98 } : undefined}
          disabled={!canContinue}
          className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-[0_0_32px_rgba(79,124,255,0.35)] transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Continuar
        </motion.button>
      </div>
    </form>
  );
}
