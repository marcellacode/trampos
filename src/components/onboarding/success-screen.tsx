"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessScreenProps {
  onEnterDashboard: () => void;
  className?: string;
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
          className="absolute -inset-6 rounded-full bg-success/30 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-success shadow-[0_0_48px_rgba(34,197,94,0.45)]">
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Check className="h-12 w-12 text-foreground" strokeWidth={2.5} aria-hidden="true" />
          </motion.div>
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.15 }}
        className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl"
      >
        Seu copiloto está pronto
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
      >
        Seu perfil foi salvo. A IA começará a procurar oportunidades assim que a
        busca de vagas estiver conectada.
      </motion.p>

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={onEnterDashboard}
        className="mt-10 inline-flex h-14 min-w-[240px] items-center justify-center rounded-xl bg-primary px-10 text-base font-semibold text-primary-foreground shadow-[0_0_40px_rgba(79,124,255,0.4)] transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Entrar no Dashboard
      </motion.button>
    </div>
  );
}
