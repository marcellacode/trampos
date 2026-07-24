"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Grid */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      {/* Primary glow */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-1/4 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[#4F7CFF]/20 blur-[120px]"
      />

      {/* Secondary glow */}
      <motion.div
        animate={{
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/3 -right-1/4 h-[400px] w-[500px] rounded-full bg-[#8B5CF6]/15 blur-[100px]"
      />

      {/* Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white/20"
          style={{
            left: `${(i * 17 + 5) % 100}%`,
            top: `${(i * 23 + 10) % 100}%`,
          }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Radial fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#08090A]/50 to-[#08090A]" />
    </div>
  );
}
