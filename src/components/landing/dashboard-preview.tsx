"use client";

import {
  Briefcase,
  Building2,
  Calendar,
  Crosshair,
  FileText,
  Globe2,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Newspaper,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { DASHBOARD_NAV } from "@/lib/constants";

export interface DashboardPreviewStats {
  jobs: number;
  companies: number;
  trends: number;
  opportunities: number;
}

interface DashboardPreviewProps {
  stats: DashboardPreviewStats;
}

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Briefcase,
  Crosshair,
  Calendar,
  FileText,
  TrendingUp,
  Mic,
  Newspaper,
  Users,
  MessageSquare,
};

export function DashboardPreview({ stats }: DashboardPreviewProps) {
  const cards = [
    { label: "Vagas", icon: Briefcase, value: stats.jobs },
    { label: "Empresas", icon: Building2, value: stats.companies },
    { label: "Tendências", icon: TrendingUp, value: stats.trends },
    { label: "Oportunidades", icon: Globe2, value: stats.opportunities },
  ].filter((item) => item.value > 0);

  if (cards.length === 0) {
    return null;
  }

  return (
    <section
      className="landing-section relative"
      aria-labelledby="dashboard-heading"
    >
      <Container>
        <SectionHeader
          label="Dashboard"
          title="Seu centro de comando de carreira"
          description="Números reais do catálogo e do mercado monitorados pela plataforma."
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 overflow-hidden glass-card glow-primary"
        >
          <div className="flex flex-col lg:flex-row">
            <aside
              className="border-b border-white/10 p-4 lg:w-56 lg:border-b-0 lg:border-r"
              aria-label="Navegação do dashboard"
            >
              <div className="mb-6 flex items-center gap-2 px-2">
                <div className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">Jobera</span>
              </div>
              <nav className="space-y-4">
                {DASHBOARD_NAV.map((group) => (
                  <div key={group.section}>
                    <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.section}
                    </p>
                    <ul className="flex gap-1 overflow-x-auto lg:flex-col" role="list">
                      {group.items.map((item) => {
                        const Icon = iconMap[item.icon];
                        return (
                          <li key={item.label}>
                            <button
                              type="button"
                              className={`flex w-full shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                                "active" in item && item.active
                                  ? "bg-primary/15 text-primary"
                                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                              }`}
                              aria-current={
                                "active" in item && item.active ? "page" : undefined
                              }
                            >
                              <Icon className="h-4 w-4" aria-hidden="true" />
                              <span className="whitespace-nowrap">{item.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            </aside>

            <div className="flex-1 p-6 lg:p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-foreground">
                  Catálogo ao vivo
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Indicadores públicos extraídos do Supabase em tempo real.
                </p>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {cards.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <item.icon
                      className="mb-3 h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.value} no catálogo
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
                <Sparkles
                  className="mx-auto mb-3 h-5 w-5 text-primary"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  Faça login para ver seu dashboard personalizado com matches,
                  KPIs e timeline reais.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
