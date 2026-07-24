"use client";

import { motion } from "framer-motion";

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  top: `${(i * 23 + 11) % 100}%`,
  size: i % 3 === 0 ? 2 : 1,
  duration: 5 + (i % 4),
  delay: i * 0.25,
}));

export function BackgroundEffects() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <motion.div
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-1/4 top-1/4 h-[520px] w-[520px] rounded-full bg-[#4F7CFF]/25 blur-[140px]"
      />

      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
        className="absolute -right-1/4 bottom-1/4 h-[420px] w-[420px] rounded-full bg-[#4F7CFF]/15 blur-[120px]"
      />

      <motion.div
        animate={{ opacity: [0.12, 0.22, 0.12] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
        className="absolute left-1/3 top-0 h-[280px] w-[380px] -translate-x-1/2 rounded-full bg-[#22C55E]/10 blur-[100px]"
      />

      {PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/25"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            opacity: [0.08, 0.45, 0.08],
            y: [0, -24, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-[#08090A]/40 via-transparent to-[#08090A]/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#08090A]/30 lg:to-[#08090A]/60" />
    </div>
  );
}
