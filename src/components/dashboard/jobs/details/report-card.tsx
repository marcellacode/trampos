"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  glow?: boolean;
}

export function ReportCard({
  children,
  className,
  id,
  glow = false,
}: ReportCardProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6",
        glow &&
          "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top_right,rgba(79,124,255,0.08),transparent_60%)]",
        className
      )}
    >
      {children}
    </motion.section>
  );
}

interface ReportSectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  className?: string;
}

export function ReportSectionHeader({
  title,
  subtitle,
  badge,
  className,
}: ReportSectionHeaderProps) {
  return (
    <div className={cn("mb-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {badge}
      </div>
    </div>
  );
}

export function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
      </span>
      IA
    </span>
  );
}
