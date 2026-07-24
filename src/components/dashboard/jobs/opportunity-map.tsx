"use client";

import { motion } from "framer-motion";
import type { OpportunityRegion } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface OpportunityMapProps {
  regions: OpportunityRegion[];
  className?: string;
}

export function OpportunityMap({ regions, className }: OpportunityMapProps) {
  const total = regions.reduce((sum, r) => sum + r.count, 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-[#111315] p-6",
        className
      )}
      aria-labelledby="map-heading"
    >
      <div className="mb-1">
        <h2 id="map-heading" className="text-base font-semibold text-white">
          Mapa de Oportunidades
        </h2>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          {total} vagas compatíveis distribuídas globalmente
        </p>
      </div>

      <div className="relative mt-6 aspect-[2/1] overflow-hidden rounded-xl border border-white/[0.06] bg-[#0A0B0D]">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />

        {/* Simplified world silhouette */}
        <svg
          viewBox="0 0 100 50"
          className="absolute inset-0 h-full w-full opacity-20"
          aria-hidden="true"
        >
          <ellipse cx="50" cy="25" rx="45" ry="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
          <path
            d="M15,20 Q25,15 35,18 T55,16 T75,20 T85,22"
            fill="none"
            stroke="rgba(79,124,255,0.3)"
            strokeWidth="0.4"
          />
        </svg>

        {/* Region markers */}
        {regions.map((region, index) => {
          const intensity = region.count / Math.max(...regions.map((r) => r.count));
          return (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring" }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${region.x}%`, top: `${region.y}%` }}
            >
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: 24 + intensity * 32,
                  height: 24 + intensity * 32,
                  background: `radial-gradient(circle, rgba(79,124,255,${0.15 + intensity * 0.2}) 0%, transparent 70%)`,
                }}
                aria-hidden="true"
              />
              <div className="relative flex flex-col items-center">
                <span className="text-lg">{region.flag}</span>
                <span className="mt-0.5 whitespace-nowrap rounded-md bg-[#16191C]/90 px-2 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/[0.08] backdrop-blur-sm">
                  {region.count}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5" role="list">
        {regions.map((region) => (
          <li
            key={region.id}
            className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
          >
            <span className="text-base">{region.flag}</span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">
                {region.country}
              </p>
              <p className="text-[10px] text-[#9CA3AF]">{region.count} vagas</p>
            </div>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
