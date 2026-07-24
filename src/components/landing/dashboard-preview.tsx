"use client";

import {
  Briefcase,
  Calendar,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Video,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { DASHBOARD_NAV } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  FileText,
  TrendingUp,
  Video,
  Calendar,
};

export function DashboardPreview() {
  return (
    <section
      className="relative py-24 sm:py-32"
      aria-labelledby="dashboard-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#4F7CFF]/5 via-transparent to-transparent" aria-hidden="true" />

      <Container>
        <SectionHeader
          label="Dashboard"
          title="Seu centro de comando de carreira"
          description="Acompanhe vagas, entrevistas e progresso em tempo real."
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#111315] shadow-2xl glow-primary"
        >
          <div className="flex flex-col lg:flex-row">
            <aside className="border-b border-white/8 p-4 lg:w-56 lg:border-b-0 lg:border-r" aria-label="Navegação do dashboard">
              <div className="mb-6 flex items-center gap-2 px-2">
                <div className="h-2 w-2 rounded-full bg-[#4F7CFF]" aria-hidden="true" />
                <span className="text-sm font-semibold text-white">Trampos AI</span>
              </div>
              <nav>
                <ul className="flex gap-1 overflow-x-auto lg:flex-col" role="list">
                  {DASHBOARD_NAV.map((item) => {
                    const Icon = iconMap[item.icon];
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          className={`flex w-full shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                            "active" in item && item.active
                              ? "bg-[#4F7CFF]/10 text-[#4F7CFF]"
                              : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
                          }`}
                          aria-current={"active" in item && item.active ? "page" : undefined}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          <span className="whitespace-nowrap">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            <div className="flex-1 p-6 lg:p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-white">
                  Bom dia. 👋
                </h3>
                <p className="mt-2 text-[#9CA3AF]">
                  Seu dashboard centraliza vagas, candidaturas, entrevistas e
                  mensagens em um só lugar.
                </p>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Vagas", icon: Briefcase },
                  { label: "Entrevistas", icon: Video },
                  { label: "Mensagens", icon: MessageSquare },
                  { label: "Objetivos", icon: Calendar },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
                    className="rounded-xl border border-white/8 bg-white/[0.02] p-4"
                  >
                    <item.icon className="mb-3 h-4 w-4 text-[#4F7CFF]" aria-hidden="true" />
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="mt-1 text-xs text-[#9CA3AF]">Aguardando dados</p>
                  </motion.div>
                ))}
              </div>

              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                <Sparkles className="mx-auto mb-3 h-5 w-5 text-[#4F7CFF]" aria-hidden="true" />
                <p className="text-sm text-[#9CA3AF]">
                  Prévia ilustrativa. Seus dados reais aparecerão aqui após o
                  onboarding.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
