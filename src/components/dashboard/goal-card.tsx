"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Pencil, Target, Wallet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CareerGoal } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  goal: CareerGoal;
  className?: string;
}

const FIELDS = [
  { key: "role" as const, label: "Cargo", icon: Target },
  { key: "location" as const, label: "Local", icon: MapPin },
  { key: "salary" as const, label: "Salário", icon: Wallet },
  { key: "availability" as const, label: "Disponibilidade", icon: Zap },
];

export function GoalCard({ goal, className }: GoalCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-[#111315] p-6 transition-shadow hover:border-white/[0.12] hover:shadow-[0_0_40px_rgba(79,124,255,0.06)]",
        className
      )}
      aria-labelledby="goal-heading"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="goal-heading" className="text-base font-semibold text-white">
          Objetivo Profissional
        </h2>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/objetivos" />}
          nativeButton={false}
          className="h-8 border-white/10 bg-transparent"
        >
          <Pencil data-icon="inline-start" className="h-3.5 w-3.5" />
          Editar objetivo
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
          >
            <div className="mb-1.5 flex items-center gap-2 text-[#9CA3AF]">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-[11px] uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-sm font-medium text-white">{goal[key]}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
