"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface HeroScoreCardProps {
  score?: number;
  role?: string;
  company?: string;
}

export function HeroScoreCard({
  score = 87,
  role = "Dev Full Stack",
  company = "Nubank",
}: HeroScoreCardProps) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: 6 }}
      animate={{ opacity: 1, y: 0, rotate: 6 }}
      transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="absolute -bottom-6 -left-4 z-20 hidden w-52 sm:block lg:-left-8"
      aria-hidden="true"
    >
      <div className="glass-strong rounded-2xl p-4 glow-cyan">
        <div className="flex items-center gap-3">
          <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center">
            <svg className="-rotate-90 h-[88px] w-[88px]" viewBox="0 0 88 88">
              <circle
                cx="44"
                cy="44"
                r="36"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="6"
              />
              <motion.circle
                cx="44"
                cy="44"
                r="36"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-xl font-bold text-foreground">{score}%</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Match
            </p>
            <p className="truncate text-sm font-semibold text-foreground">{role}</p>
            <p className="truncate text-xs text-muted-foreground">{company}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-success">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Compatível com seu perfil</span>
        </div>
      </div>
    </motion.div>
  );
}
