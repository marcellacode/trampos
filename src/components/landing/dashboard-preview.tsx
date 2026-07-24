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

function CompatibilityChart() {
  const bars = [65, 82, 71, 94, 88, 76, 91];

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <p className="mb-3 text-xs font-medium text-[#9CA3AF]">Compatibilidade semanal</p>
      <div className="flex h-24 items-end gap-2" role="img" aria-label="Gráfico de compatibilidade semanal">
        {bars.map((height, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${height}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            className="flex-1 rounded-sm bg-gradient-to-t from-[#4F7CFF]/60 to-[#4F7CFF]"
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-[#9CA3AF]">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl border border-white/8 bg-white/[0.02] p-4"
    >
      <p className="text-2xl font-semibold" style={{ color }}>
        {value}
      </p>
      <p className="mt-1 text-xs text-[#9CA3AF]">{label}</p>
    </motion.div>
  );
}

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
            {/* Sidebar */}
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

            {/* Main content */}
            <div className="flex-1 p-6 lg:p-8">
              {/* Greeting */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-white">
                  Bom dia, João. 👋
                </h3>
                <p className="mt-2 text-[#9CA3AF]">
                  Hoje sua IA encontrou{" "}
                  <strong className="text-[#4F7CFF]">23 vagas</strong>.
                  <br />
                  <strong className="text-[#22C55E]">2 empresas</strong> responderam.{" "}
                  <strong className="text-white">1 entrevista</strong> marcada.
                </p>
              </div>

              {/* Stats grid */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Vagas" value="23" color="#4F7CFF" delay={0.1} />
                <StatCard label="Entrevistas" value="1" color="#22C55E" delay={0.2} />
                <StatCard label="Mensagens" value="2" color="#8B5CF6" delay={0.3} />
                <StatCard label="Objetivos" value="3/5" color="#F59E0B" delay={0.4} />
              </div>

              {/* Chart + recent activity */}
              <div className="grid gap-4 lg:grid-cols-2">
                <CompatibilityChart />

                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                  <p className="mb-3 text-xs font-medium text-[#9CA3AF]">Atividade recente</p>
                  <ul className="space-y-3" role="list">
                    {[
                      { icon: Briefcase, text: "Nova vaga: Senior React @ Nubank", time: "2min" },
                      { icon: MessageSquare, text: "Resposta de iFood", time: "1h" },
                      { icon: Calendar, text: "Entrevista amanhã 14h", time: "3h" },
                    ].map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-2.5"
                      >
                        <item.icon className="h-4 w-4 shrink-0 text-[#4F7CFF]" aria-hidden="true" />
                        <span className="flex-1 truncate text-sm text-white/80">{item.text}</span>
                        <span className="text-xs text-[#9CA3AF]">{item.time}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
