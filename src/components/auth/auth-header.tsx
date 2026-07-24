"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { AUTH_BRAND } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  title?: string;
  description?: string;
  showLogo?: boolean;
  className?: string;
}

export function AuthHeader({
  title = "Bem-vindo de volta",
  description = "Entre para continuar acompanhando sua carreira.",
  showLogo = true,
  className,
}: AuthHeaderProps) {
  return (
    <header className={cn("space-y-5", className)}>
      {showLogo && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111315] rounded-lg"
            aria-label={`${AUTH_BRAND.fullName} - Página inicial`}
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F7CFF]/10 ring-1 ring-[#4F7CFF]/30 transition-all group-hover:bg-[#4F7CFF]/20 group-hover:ring-[#4F7CFF]/50">
              <Sparkles className="h-4 w-4 text-[#4F7CFF]" aria-hidden="true" />
              <div className="absolute inset-0 rounded-lg bg-[#4F7CFF]/20 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              {AUTH_BRAND.name}
              <span className="text-[#4F7CFF]">{AUTH_BRAND.suffix}</span>
            </span>
          </Link>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="space-y-2"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-[#9CA3AF]">{description}</p>
      </motion.div>
    </header>
  );
}
