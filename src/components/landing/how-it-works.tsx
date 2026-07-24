"use client";

import {
  Brain,
  Calendar,
  FileText,
  Search,
  Send,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  Target,
  Brain,
  Search,
  FileText,
  Send,
  Calendar,
  Trophy,
};

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="relative py-24 sm:py-32"
      aria-labelledby="how-it-works-heading"
    >
      <Container>
        <SectionHeader
          label="Como funciona"
          title="7 passos até sua próxima oportunidade"
          description="Da definição de objetivos até a proposta de emprego — tudo automatizado pela IA."
        />

        {/* Desktop horizontal timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection line */}
            <div
              className="absolute top-10 right-0 left-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
              aria-hidden="true"
            />

            <div className="grid grid-cols-7 gap-4">
              {HOW_IT_WORKS_STEPS.map((step, i) => {
                const Icon = iconMap[step.icon];
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="group relative flex flex-col items-center text-center"
                  >
                    <div className="relative mb-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/8 bg-[#111315] transition-all duration-300 group-hover:border-[#4F7CFF]/30 group-hover:bg-[#4F7CFF]/5 group-hover:shadow-lg group-hover:shadow-[#4F7CFF]/10">
                        <Icon className="h-7 w-7 text-[#9CA3AF] transition-colors group-hover:text-[#4F7CFF]" aria-hidden="true" />
                      </div>
                      <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#4F7CFF] text-xs font-bold text-white">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-[#9CA3AF]">
                      {step.description}
                    </p>

                    {i < HOW_IT_WORKS_STEPS.length - 1 && (
                      <div
                        className="absolute top-10 -right-2 text-[#4F7CFF]/40"
                        aria-hidden="true"
                      >
                        →
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet vertical timeline */}
        <div className="lg:hidden">
          <div className="relative space-y-6">
            <div
              className="absolute top-0 bottom-0 left-6 w-px bg-gradient-to-b from-[#4F7CFF]/50 via-white/10 to-transparent"
              aria-hidden="true"
            />

            {HOW_IT_WORKS_STEPS.map((step, i) => {
              const Icon = iconMap[step.icon];
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="group relative flex gap-5 pl-2"
                >
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-[#111315] transition-all group-hover:border-[#4F7CFF]/30">
                    <Icon className="h-5 w-5 text-[#9CA3AF] group-hover:text-[#4F7CFF]" aria-hidden="true" />
                  </div>
                  <div className="flex-1 rounded-xl border border-white/5 bg-[#111315]/50 p-4 transition-all group-hover:border-[#4F7CFF]/20">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-bold text-[#4F7CFF]">
                        Passo {step.step}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm text-[#9CA3AF]">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
