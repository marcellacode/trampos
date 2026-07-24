"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { SUCCESS_STATS } from "@/lib/onboarding/constants";
import { cn } from "@/lib/utils";

interface SuccessScreenProps {
  onEnterDashboard: () => void;
  className?: string;
}

function AnimatedCounter({
  value,
  label,
  delay = 0,
}: {
  value: number;
  label: string;
  delay?: number;
}) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString("pt-BR")
  );
  const [text, setText] = useState("0");

  useEffect(() => {
    const timeout = window.setTimeout(() => spring.set(value), delay);
    const unsubscribe = display.on("change", (v) => setText(v));
    return () => {
      window.clearTimeout(timeout);
      unsubscribe();
    };
  }, [delay, display, spring, value]);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-5 text-center backdrop-blur-sm">
      <p className="text-2xl font-semibold tabular-nums text-white sm:text-3xl">
        {text}
      </p>
      <p className="mt-1 text-xs text-[#9CA3AF] sm:text-sm">{label}</p>
    </div>
  );
}

export function SuccessScreen({
  onEnterDashboard,
  className,
}: SuccessScreenProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-2xl flex-col items-center py-8 text-center sm:py-14",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 14 }}
        className="relative mb-8"
      >
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.15, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -inset-6 rounded-full bg-[#22C55E]/30 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#22C55E] shadow-[0_0_48px_rgba(34,197,94,0.45)]">
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Check className="h-12 w-12 text-white" strokeWidth={2.5} aria-hidden="true" />
          </motion.div>
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.15 }}
        className="text-3xl font-semibold tracking-tight text-white sm:text-5xl"
      >
        Seu copiloto está pronto
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-4 max-w-md text-sm leading-relaxed text-[#9CA3AF] sm:text-base"
      >
        Sua IA já começou a procurar oportunidades.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-white/40"
      >
        Enquanto isso...
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-3"
        aria-label="Estatísticas em tempo real"
      >
        <AnimatedCounter
          value={SUCCESS_STATS.jobsAnalyzed}
          label="vagas analisadas"
          delay={500}
        />
        <AnimatedCounter
          value={SUCCESS_STATS.matches}
          label="compatíveis"
          delay={700}
        />
        <AnimatedCounter
          value={SUCCESS_STATS.verifiedCompanies}
          label="empresas verificadas"
          delay={900}
        />
      </motion.div>

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={onEnterDashboard}
        className="mt-10 inline-flex h-14 min-w-[240px] items-center justify-center rounded-xl bg-[#4F7CFF] px-10 text-base font-semibold text-white shadow-[0_0_40px_rgba(79,124,255,0.4)] transition-colors hover:bg-[#638BFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090A]"
      >
        Entrar no Dashboard
      </motion.button>
    </div>
  );
}
