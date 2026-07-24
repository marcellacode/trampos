"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type {
  AvailabilityOption,
  ContractType,
  WorkModel,
} from "@/types/onboarding";
import {
  AVAILABILITY_OPTIONS,
  CONTRACT_OPTIONS,
  WORK_MODEL_OPTIONS,
} from "@/lib/onboarding/constants";
import { cn } from "@/lib/utils";

interface SelectCardProps {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
  index?: number;
}

function SelectCard({
  selected,
  title,
  description,
  onClick,
  index = 0,
}: SelectCardProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full flex-col items-start gap-1 overflow-hidden rounded-2xl border p-4 text-left transition-colors sm:p-5",
        "bg-[#111315]/70 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090A]",
        selected
          ? "border-[#4F7CFF]/60 shadow-[0_0_28px_rgba(79,124,255,0.2)]"
          : "border-white/[0.08] hover:border-[#4F7CFF]/35"
      )}
    >
      {selected && (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/15 via-transparent to-transparent"
          aria-hidden="true"
        />
      )}

      <div className="relative flex w-full items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white sm:text-base">{title}</p>
          <p className="mt-1 text-xs text-[#9CA3AF] sm:text-sm">{description}</p>
        </div>
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
            selected
              ? "border-[#4F7CFF] bg-[#4F7CFF] text-white"
              : "border-white/20 text-transparent"
          )}
          aria-hidden="true"
        >
          <Check className="h-3 w-3" />
        </span>
      </div>
    </motion.button>
  );
}

interface AvailabilityCardsProps {
  availability: AvailabilityOption | null;
  workModels: WorkModel[];
  contractTypes: ContractType[];
  onAvailabilityChange: (value: AvailabilityOption) => void;
  onWorkModelsChange: (values: WorkModel[]) => void;
  onContractTypesChange: (values: ContractType[]) => void;
}

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function AvailabilityCards({
  availability,
  workModels,
  contractTypes,
  onAvailabilityChange,
  onWorkModelsChange,
  onContractTypesChange,
}: AvailabilityCardsProps) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-10">
      <div className="space-y-3 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
        >
          Disponibilidade
        </motion.h2>
        <p className="text-sm text-[#9CA3AF] sm:text-base">
          Como e quando você quer trabalhar.
        </p>
      </div>

      <section aria-labelledby="availability-heading" className="space-y-4">
        <h3
          id="availability-heading"
          className="text-sm font-medium text-white"
        >
          Quando pode começar?
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {AVAILABILITY_OPTIONS.map((option, index) => (
            <SelectCard
              key={option.value}
              index={index}
              title={option.label}
              description={option.description}
              selected={availability === option.value}
              onClick={() => onAvailabilityChange(option.value)}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="work-model-heading" className="space-y-4">
        <h3 id="work-model-heading" className="text-sm font-medium text-white">
          Modelo de trabalho
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {WORK_MODEL_OPTIONS.map((option, index) => (
            <SelectCard
              key={option.value}
              index={index}
              title={option.label}
              description={option.description}
              selected={workModels.includes(option.value)}
              onClick={() =>
                onWorkModelsChange(toggleValue(workModels, option.value))
              }
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="contract-heading" className="space-y-4">
        <h3 id="contract-heading" className="text-sm font-medium text-white">
          Tipo de contratação
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {CONTRACT_OPTIONS.map((option, index) => (
            <SelectCard
              key={option.value}
              index={index}
              title={option.label}
              description={option.description}
              selected={contractTypes.includes(option.value)}
              onClick={() =>
                onContractTypesChange(toggleValue(contractTypes, option.value))
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
