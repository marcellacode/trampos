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
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">Refine sua busca</span>
        </div>
        <span className="text-xs text-muted-foreground">Clique em um filtro para removê-lo</span>
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
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/15"
            >
              {filter.label}
              <X className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-foreground" />
            </motion.button>
          ))}
        </AnimatePresence>

        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-input bg-muted/50 px-3 py-1.5">
          <Plus className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite e a IA filtra..."
            className="w-36 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground sm:w-44"
            aria-label="Criar filtro com IA"
          />
        </div>
      </div>
    </div>
  );
}
