"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Command, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AI_SEARCH_EXAMPLES } from "@/lib/jobs/constants";
import { cn } from "@/lib/utils";

interface SearchHeroProps {
  onSearch: (query: string) => void;
  className?: string;
}

export function SearchHero({ onSearch, className }: SearchHeroProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (focused || query) return;
    const id = window.setInterval(() => {
      setExampleIndex((i) => (i + 1) % AI_SEARCH_EXAMPLES.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [focused, query]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = query.trim();
    if (!text) return;
    onSearch(text);
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("relative", className)}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-[#111315] transition-all duration-300",
          focused
            ? "border-[#4F7CFF]/50 shadow-[0_0_48px_rgba(79,124,255,0.15)]"
            : "border-white/[0.08] hover:border-white/[0.12]"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(79,124,255,0.08),transparent_60%)]"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4F7CFF]/15 ring-1 ring-[#4F7CFF]/25">
            <Sparkles className="h-4 w-4 text-[#4F7CFF]" aria-hidden="true" />
          </div>

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={AI_SEARCH_EXAMPLES[exampleIndex]}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#9CA3AF] sm:text-base"
            aria-label="Busca inteligente com IA"
          />

          <kbd className="hidden shrink-0 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[10px] text-[#9CA3AF] sm:inline-flex">
            <Command className="h-3 w-3" aria-hidden="true" />
            K
          </kbd>

          <Button
            type="submit"
            disabled={!query.trim()}
            className="h-9 shrink-0 gap-1.5 px-4"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Enviar</span>
          </Button>
        </div>
      </div>
    </motion.form>
  );
}
