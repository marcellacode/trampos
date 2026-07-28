"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  PROCESSING_DURATION_MS,
  PROCESSING_MESSAGES,
} from "@/lib/onboarding/constants";

interface AIProcessingProps {
  onComplete: () => void;
  fileName?: string | null;
  sourceLabel?: string;
}

export function AIProcessing({
  onComplete,
  fileName,
  sourceLabel = "documento",
}: AIProcessingProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const next = Math.min(100, (elapsed / PROCESSING_DURATION_MS) * 100);
      setProgress(next);

      const idx = Math.min(
        PROCESSING_MESSAGES.length - 1,
        Math.floor((elapsed / PROCESSING_DURATION_MS) * PROCESSING_MESSAGES.length)
      );
      setMessageIndex(idx);

      if (elapsed >= PROCESSING_DURATION_MS) {
        onComplete();
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  const blocks = Math.round((progress / 100) * 24);

  return (
    <div
      className="mx-auto flex w-full max-w-xl flex-col items-center justify-center py-10 text-center sm:py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="IA analisando seu documento"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-10"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-8 rounded-full border border-dashed border-primary/25"
          aria-hidden="true"
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-card ring-1 ring-primary/40 shadow-[0_0_40px_rgba(79,124,255,0.35)]">
          <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
      >
        IA analisando {sourceLabel}
      </motion.h2>

      {fileName && (
        <p className="mt-2 text-sm text-muted-foreground">{fileName}</p>
      )}

      <div className="mt-10 w-full space-y-5">
        <div
          className="font-mono text-sm tracking-wider text-primary sm:text-base"
          aria-hidden="true"
        >
          {"█".repeat(blocks)}
          <span className="text-foreground/15">{"░".repeat(24 - blocks)}</span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="relative h-7 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.35 }}
              className="text-sm text-muted-foreground sm:text-base"
            >
              {PROCESSING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="text-xs text-foreground/40">Tempo aproximado · 15 segundos</p>
      </div>
    </div>
  );
}
