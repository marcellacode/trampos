"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { AUTH_BRAND, LOGIN_ACTIVITY } from "@/lib/auth/constants";

/** Fixed row height so the activity list never reflows the login column. */
const ROW_HEIGHT_PX = 46;
const LIST_HEIGHT_PX = LOGIN_ACTIVITY.length * ROW_HEIGHT_PX + (LOGIN_ACTIVITY.length - 1) * 10;

export function AnimatedActivity() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (visibleCount >= LOGIN_ACTIVITY.length) {
      const reset = window.setTimeout(() => {
        setVisibleCount(0);
        setCycle((c) => c + 1);
      }, 2800);
      return () => window.clearTimeout(reset);
    }

    const timer = window.setTimeout(() => {
      setVisibleCount((prev) => prev + 1);
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [visibleCount, cycle]);

  return (
    <div
      className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#111315]/70 p-5 shadow-2xl backdrop-blur-xl"
      role="log"
      aria-live="polite"
      aria-label="Atividade da IA em tempo real"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/10 via-transparent to-transparent" />

      <div className="relative mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4F7CFF]/15 ring-1 ring-[#4F7CFF]/30">
            <Sparkles className="h-3.5 w-3.5 text-[#4F7CFF]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium text-white">
              Agente {AUTH_BRAND.fullName}
            </p>
            <p className="text-[11px] text-[#9CA3AF]">Trabalhando agora</p>
          </div>
        </div>
        <motion.span
          animate={{ opacity: [1, 0.45, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#22C55E]/10 px-2.5 py-1 text-[11px] font-medium text-[#22C55E] ring-1 ring-[#22C55E]/25"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          Ao vivo
        </motion.span>
      </div>

      <ul
        className="relative space-y-2.5"
        style={{ height: LIST_HEIGHT_PX }}
      >
        <AnimatePresence mode="sync">
          {LOGIN_ACTIVITY.slice(0, visibleCount).map((item, index) => {
            const isLatest = index === visibleCount - 1;
            const isComplete =
              index < visibleCount - 1 || visibleCount >= LOGIN_ACTIVITY.length;

            return (
              <motion.li
                key={`${cycle}-${item.id}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-[46px] items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {isComplete || !isLatest ? (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22C55E]/15"
                    >
                      <Check className="h-3 w-3 text-[#22C55E]" aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <Loader2
                      className="h-4 w-4 animate-spin text-[#4F7CFF]"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span className="text-sm text-white/90">
                  {item.label}
                  {item.highlight ? (
                    <span className="ml-1.5 font-semibold text-[#4F7CFF]">
                      {item.highlight}
                    </span>
                  ) : null}
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>

        {visibleCount === 0 && (
          <motion.li
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-[46px] items-center gap-3 px-3 text-sm text-[#9CA3AF]"
          >
            <Loader2 className="h-4 w-4 animate-spin text-[#4F7CFF]" />
            Iniciando agente...
          </motion.li>
        )}
      </ul>

      <div className="relative mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-[#9CA3AF]">
          <span>Progresso</span>
          <span>
            {Math.min(visibleCount, LOGIN_ACTIVITY.length)}/
            {LOGIN_ACTIVITY.length}
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#4F7CFF] to-[#22C55E]"
            animate={{
              width: `${
                (Math.min(visibleCount, LOGIN_ACTIVITY.length) /
                  LOGIN_ACTIVITY.length) *
                100
              }%`,
            }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
