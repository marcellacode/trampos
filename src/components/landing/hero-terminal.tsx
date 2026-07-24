"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Circle, Terminal } from "lucide-react";
import { TERMINAL_ACTIONS } from "@/lib/constants";

export function HeroTerminal() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [currentTyping, setCurrentTyping] = useState("");
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= TERMINAL_ACTIONS.length) {
          setTimeout(() => {
            setVisibleCount(0);
            setCurrentTyping("");
            setCycle((c) => c + 1);
          }, 3000);
          return prev;
        }
        return prev + 1;
      });
    }, 1400);

    return () => clearInterval(interval);
  }, [cycle]);

  useEffect(() => {
    if (visibleCount === 0 || visibleCount > TERMINAL_ACTIONS.length) return;

    const action = TERMINAL_ACTIONS[visibleCount - 1];
    let charIndex = 0;
    setCurrentTyping("");

    const typeInterval = setInterval(() => {
      if (charIndex <= action.text.length) {
        setCurrentTyping(action.text.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [visibleCount, cycle]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Glow behind terminal */}
      <div className="absolute -inset-4 rounded-2xl bg-[#4F7CFF]/10 blur-2xl" />

      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#111315]/90 shadow-2xl backdrop-blur-sm glow-primary">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <div className="h-3 w-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex flex-1 items-center justify-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-[#9CA3AF]" aria-hidden="true" />
            <span className="font-mono text-xs text-[#9CA3AF]">
              jobera-agent — running
            </span>
          </div>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1.5"
          >
            <Circle className="h-2 w-2 fill-[#22C55E] text-[#22C55E]" aria-hidden="true" />
            <span className="text-xs text-[#22C55E]">Ativo</span>
          </motion.div>
        </div>

        {/* Terminal body */}
        <div className="space-y-3 p-5 font-mono text-sm" role="log" aria-live="polite" aria-label="Ações da IA em execução">
          <div className="text-[#9CA3AF]">
            <span className="text-[#4F7CFF]">$</span> jobera start --user=voce
          </div>

          <AnimatePresence mode="popLayout">
            {TERMINAL_ACTIONS.slice(0, visibleCount - 1).map((action, i) => (
              <motion.div
                key={`${cycle}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2.5"
              >
                <Check className="h-4 w-4 shrink-0 text-[#22C55E]" aria-hidden="true" />
                <span className="text-white/90">{action.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>

          {visibleCount > 0 && visibleCount <= TERMINAL_ACTIONS.length && (
            <motion.div
              key={`typing-${cycle}-${visibleCount}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2.5"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 shrink-0 rounded-full border-2 border-[#4F7CFF]/30 border-t-[#4F7CFF]"
                aria-hidden="true"
              />
              <span className="text-white/90">
                {currentTyping}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="ml-0.5 inline-block h-4 w-0.5 bg-[#4F7CFF] align-middle"
                  aria-hidden="true"
                />
              </span>
            </motion.div>
          )}

          {visibleCount === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2.5 text-[#9CA3AF]"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 shrink-0 rounded-full border-2 border-[#4F7CFF]/30 border-t-[#4F7CFF]"
                aria-hidden="true"
              />
              <span>Iniciando agente...</span>
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        <div className="border-t border-white/8 px-5 py-3">
          <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
            <span>Progresso do agente</span>
            <span>{Math.min(visibleCount, TERMINAL_ACTIONS.length)}/{TERMINAL_ACTIONS.length}</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#22C55E]"
              animate={{
                width: `${(Math.min(visibleCount, TERMINAL_ACTIONS.length) / TERMINAL_ACTIONS.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
