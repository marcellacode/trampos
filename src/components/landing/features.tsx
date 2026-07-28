"use client";

import {
  FileText,
  LayoutDashboard,
  MessageSquare,
  Search,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { FEATURES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Sparkles: Search,
  FileText,
  MessageSquare,
  TrendingUp,
  Zap,
  LayoutDashboard,
};

const layoutClasses = [
  "sm:col-span-2 lg:col-span-2",
  "",
  "",
  "sm:col-span-2",
  "",
  "sm:col-span-2 lg:col-span-2",
];

export function Features() {
  return (
    <section
      id="recursos"
      className="landing-section"
      aria-labelledby="features-heading"
    >
      <Container>
        <SectionHeader
          label="Recursos"
          title="Por que o Jobera é diferente"
          description="Ferramentas de IA pensadas para candidatos brasileiros — não só uma lista de vagas."
          className="mb-12"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  "glass-card group p-6 transition-all hover:border-primary/25 hover:bg-white/[0.06]",
                  layoutClasses[index]
                )}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25 transition-all group-hover:glow-primary">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
