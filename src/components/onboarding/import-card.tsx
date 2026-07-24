"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  featured?: boolean;
  disabled?: boolean;
  index?: number;
}

export function ImportCard({
  title,
  description,
  icon: Icon,
  onClick,
  featured = false,
  disabled = false,
  index = 0,
}: ImportCardProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
      whileHover={disabled ? undefined : { scale: 1.02, y: -4 }}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex h-full min-h-[200px] flex-col items-start gap-4 overflow-hidden rounded-2xl border p-6 text-left transition-colors sm:min-h-[220px] sm:p-7",
        "bg-[#111315]/80 backdrop-blur-sm",
        "border-white/[0.08] hover:border-[#4F7CFF]/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090A]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        featured && "border-[#4F7CFF]/30"
      )}
      aria-label={`${title}. ${description}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#4F7CFF]/20 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/10 via-transparent to-transparent" />
      </div>

      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#4F7CFF]/10 ring-1 ring-[#4F7CFF]/25 transition-all duration-300 group-hover:bg-[#4F7CFF]/20 group-hover:ring-[#4F7CFF]/50 group-hover:shadow-[0_0_28px_rgba(79,124,255,0.35)]">
        <Icon className="h-5 w-5 text-[#4F7CFF]" aria-hidden="true" />
      </div>

      <div className="relative space-y-2">
        <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-[#9CA3AF]">{description}</p>
      </div>

      <span className="relative mt-auto text-xs font-medium text-[#4F7CFF] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        Selecionar →
      </span>
    </motion.button>
  );
}
