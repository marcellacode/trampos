"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Sparkles, X } from "lucide-react";
import type { SmartFilter } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface SmartFiltersProps {
  filters: SmartFilter[];
  onChange: (filters: SmartFilter[]) => void;
  onAiQuery?: (query: string) => void;
  className?: string;
}

export function SmartFilters({
  filters,
  onChange,
  onAiQuery,
  className,
}: SmartFiltersProps) {
  const [input, setInput] = useState("");

  function removeFilter(id: string) {
    onChange(filters.filter((f) => f.id !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const text = input.trim();
    if (!text) return;

    const exists = filters.some(
      (f) => f.label.toLowerCase() === text.toLowerCase()
    );
    if (!exists) {
      onChange([...filters, { id: `ai-${Date.now()}`, label: text }]);
    }
    onAiQuery?.(text);
    setInput("");
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-[#4F7CFF]" aria-hidden="true" />
        <span className="text-xs font-medium text-[#9CA3AF]">
          Filtros inteligentes
        </span>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
        <AnimatePresence mode="popLayout">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              type="button"
              onClick={() => removeFilter(filter.id)}
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#4F7CFF]/25 bg-[#4F7CFF]/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-[#4F7CFF]/40 hover:bg-[#4F7CFF]/15"
            >
              {filter.label}
              <X className="h-3 w-3 text-[#9CA3AF] transition-colors group-hover:text-white" />
            </motion.button>
          ))}
        </AnimatePresence>

        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-white/[0.12] bg-white/[0.02] px-3 py-1.5">
          <Plus className="h-3 w-3 text-[#9CA3AF]" aria-hidden="true" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite e a IA filtra..."
            className="w-36 bg-transparent text-xs text-white outline-none placeholder:text-[#9CA3AF] sm:w-44"
            aria-label="Criar filtro com IA"
          />
        </div>
      </div>
    </div>
  );
}
