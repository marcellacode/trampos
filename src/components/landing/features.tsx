"use client";

import {
  FileText,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { FEATURES } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  FileText,
  MessageSquare,
  TrendingUp,
  Zap,
  LayoutDashboard,
};

export function Features() {
  return (
    <section
      id="recursos"
      className="relative py-24 sm:py-32"
      aria-labelledby="features-heading"
    >
      <Container>
        <SectionHeader
          label="Recursos"
          title="Tudo que você precisa para acelerar sua carreira"
          description="Ferramentas poderosas impulsionadas por IA para cada etapa da sua jornada profissional."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = iconMap[feature.icon];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[#111315] p-6 transition-all duration-300 hover:border-[#4F7CFF]/30 hover:shadow-lg hover:shadow-[#4F7CFF]/5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#4F7CFF]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />

                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#4F7CFF]/10 ring-1 ring-[#4F7CFF]/20 transition-all group-hover:bg-[#4F7CFF]/20 group-hover:ring-[#4F7CFF]/40">
                    <Icon className="h-6 w-6 text-[#4F7CFF]" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#9CA3AF]">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
