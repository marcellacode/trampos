"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AIBadge,
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { CareerImpact } from "@/types/jobs";

interface CareerImpactProps {
  data: CareerImpact;
}

function AnimatedUplift({ value, delay = 0 }: { value: number; delay?: number }) {
  const spring = useSpring(0, { stiffness: 70, damping: 22 });
  const display = useTransform(spring, (current) => Math.round(current));
  const [text, setText] = useState("0");

  useEffect(() => {
    const timeout = window.setTimeout(() => spring.set(value), delay);
    const unsubscribe = display.on("change", (v) => setText(String(v)));
    return () => {
      window.clearTimeout(timeout);
      unsubscribe();
    };
  }, [delay, display, spring, value]);

  return <span className="tabular-nums">+{text}%</span>;
}

export function CareerImpactSection({ data }: CareerImpactProps) {
  return (
    <ReportCard glow className="border-primary/20">
      <ReportSectionHeader
        title="Como essa vaga impacta sua carreira?"
        subtitle="A IA projeta sua evolução profissional ao aceitar esta oportunidade"
        badge={<AIBadge />}
      />

      <p className="mb-5 text-sm text-muted-foreground">
        Aceitar esta vaga aumenta seu potencial futuro para:
      </p>

      <div className="space-y-3">
        {data.roles.map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className="rounded-xl border border-border bg-muted/30 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/25">
                  <TrendingUp
                    className="h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {role.role}
                </span>
              </div>
              <span className="text-lg font-semibold text-success">
                <AnimatedUplift value={role.upliftPercent} delay={index * 120} />
              </span>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min(role.upliftPercent * 3, 100)}%` }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.2 + index * 0.1,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-[#22C55E]"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {data.explanation && (
        <p className="mt-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-primary-foreground/90">
          {data.explanation}
        </p>
      )}
    </ReportCard>
  );
}
