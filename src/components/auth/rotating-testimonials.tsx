"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote } from "lucide-react";
import { LOGIN_TESTIMONIALS } from "@/lib/auth/constants";

const INTERVAL_MS = 5500;

export function RotatingTestimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % LOGIN_TESTIMONIALS.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  const current = LOGIN_TESTIMONIALS[index];

  return (
    <div
      className="w-full max-w-md min-h-[168px]"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Depoimentos de usuários"
    >
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={current.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <Quote
            className="mb-3 h-5 w-5 text-[#4F7CFF]/50"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-white/80">
            &ldquo;{current.quote}&rdquo;
          </p>

          <footer className="mt-4 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#4F7CFF] to-[#4F7CFF]/50 text-xs font-semibold text-white ring-2 ring-[#4F7CFF]/20"
              aria-hidden="true"
            >
              {current.avatar}
            </div>
            <div>
              <cite className="not-italic text-sm font-medium text-white">
                {current.name}
              </cite>
              <p className="text-xs text-[#9CA3AF]">
                {current.role} · {current.company}
              </p>
            </div>
          </footer>
        </motion.blockquote>
      </AnimatePresence>

      <div className="mt-5 flex gap-1.5" role="tablist" aria-label="Navegação de depoimentos">
        {LOGIN_TESTIMONIALS.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Depoimento de ${item.name}`}
            onClick={() => setIndex(i)}
            className="group relative h-1.5 overflow-hidden rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]/60"
            style={{ width: i === index ? 28 : 8 }}
          >
            <span
              className={`absolute inset-0 rounded-full transition-colors ${
                i === index ? "bg-[#4F7CFF]" : "bg-white/20 group-hover:bg-white/35"
              }`}
            />
            {i === index && (
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full bg-white/40"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
