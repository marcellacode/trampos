"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Command, Loader2, Search, Sparkles } from "lucide-react";
import { universalSearchAction } from "@/app/actions/ai";
import { SEARCH_EXAMPLES } from "@/lib/dashboard/constants";
import { cn } from "@/lib/utils";

interface UniversalSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  compact?: boolean;
}

export function UniversalSearch({
  open: controlledOpen,
  onOpenChange,
  className,
  compact = false,
}: UniversalSearchProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setExampleIndex((i) => (i + 1) % SEARCH_EXAMPLES.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  const openSearch = useCallback(() => {
    setFeedback(null);
    setOpen(true);
  }, [setOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch, setOpen]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const handleSubmit = useCallback(
    async (value?: string) => {
      const q = (value ?? query).trim();
      if (!q || loading) return;

      setLoading(true);
      setFeedback(null);

      const result = await universalSearchAction(q);
      setLoading(false);

      if (!result.success) {
        setFeedback(result.error);
        return;
      }

      if (result.data.type === "navigate") {
        setOpen(false);
        setQuery("");
        router.push(result.data.href);
        return;
      }

      setFeedback(result.data.content);
      setQuery("");
    },
    [query, loading, router, setOpen]
  );

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        className={cn(
          "group flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-left transition-all hover:border-white/[0.14] hover:bg-white/[0.05]",
          compact ? "h-9 w-9 justify-center px-0" : "h-10 w-full max-w-xl px-3",
          className
        )}
        aria-label="Busca universal"
      >
        <Search
          className="h-4 w-4 shrink-0 text-[#9CA3AF] transition-colors group-hover:text-white"
          aria-hidden="true"
        />
        {!compact && (
          <>
            <span className="flex-1 truncate text-sm text-[#9CA3AF]">
              Pergunte qualquer coisa...
            </span>
            <kbd className="hidden items-center gap-0.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-[#9CA3AF] sm:inline-flex">
              {isMac ? (
                <>
                  <Command className="h-2.5 w-2.5" />K
                </>
              ) : (
                "Ctrl K"
              )}
            </kbd>
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-label="Fechar busca"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Busca universal"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111315] shadow-2xl shadow-black/50"
            >
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
                <Sparkles className="h-4 w-4 text-[#4F7CFF]" aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSubmit();
                  }}
                  placeholder="Pergunte qualquer coisa..."
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#9CA3AF]"
                  aria-autocomplete="list"
                  aria-controls={listId}
                  disabled={loading}
                />
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#4F7CFF]" />
                ) : (
                  <kbd className="rounded-md border border-white/[0.08] px-1.5 py-0.5 text-[10px] text-[#9CA3AF]">
                    ESC
                  </kbd>
                )}
              </div>

              {feedback && (
                <div className="border-b border-white/[0.06] px-4 py-3 text-sm text-white/90">
                  {feedback}
                </div>
              )}

              <div id={listId} className="p-2">
                <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-[#9CA3AF]/70">
                  Sugestões
                </p>
                {SEARCH_EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => void handleSubmit(example)}
                    disabled={loading}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#9CA3AF] transition-colors hover:bg-white/[0.04] hover:text-white disabled:opacity-40"
                  >
                    <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="flex-1">{example}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>

              <div className="border-t border-white/[0.06] px-4 py-2.5">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={exampleIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-[#9CA3AF]"
                  >
                    Ex.: {SEARCH_EXAMPLES[exampleIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
