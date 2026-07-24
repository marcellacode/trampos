"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { AISuggestion } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface AISuggestionsProps {
  suggestions: AISuggestion[];
  className?: string;
  /** Stack cards vertically (e.g. side column) */
  stacked?: boolean;
}

export function AISuggestions({
  suggestions,
  className,
  stacked = false,
}: AISuggestionsProps) {
  return (
    <section className={cn(className)} aria-labelledby="suggestions-heading">
      <h2
        id="suggestions-heading"
        className="mb-4 text-base font-semibold text-white"
      >
        Sugestões da IA
      </h2>

      <div
        className={cn(
          "grid gap-3",
          stacked ? "grid-cols-1" : "sm:grid-cols-3"
        )}
      >
        {suggestions.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -3 }}
            >
              <Link
                href={item.href}
                className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-[#111315] p-5 transition-all hover:border-white/[0.14] hover:shadow-[0_0_32px_rgba(79,124,255,0.08)]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${item.color}18` }}
                  >
                    <Icon
                      className="h-4 w-4"
                      style={{ color: item.color }}
                      aria-hidden="true"
                    />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#9CA3AF] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-white" />
                </div>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-[#9CA3AF]">
                  {item.description}
                </p>
                <span
                  className="mt-4 inline-flex w-fit rounded-md px-2 py-1 text-[11px] font-semibold"
                  style={{
                    backgroundColor: `${item.color}15`,
                    color: item.color,
                  }}
                >
                  {item.impact}
                </span>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
