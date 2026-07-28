"use client";

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { COMPARISON_FEATURES } from "@/lib/constants";
import { cn } from "@/lib/utils";

function FeatureCell({ available }: { available: boolean }) {
  return (
    <td className="px-4 py-4 text-center">
      {available ? (
        <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-success/10">
          <Check className="h-4 w-4 text-success" aria-label="Disponível" />
        </div>
      ) : (
        <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/5">
          <X className="h-4 w-4 text-muted-foreground/50" aria-label="Indisponível" />
        </div>
      )}
    </td>
  );
}

export function Comparison() {
  return (
    <section
      id="precos"
      className="relative py-24 sm:py-32"
      aria-labelledby="comparison-heading"
    >
      <Container>
        <SectionHeader
          label="Comparação"
          title="Por que Jobera é diferente"
          description="Veja como nos comparamos com as plataformas tradicionais de emprego."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-2xl border border-border bg-card"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]" role="table">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-5 text-left text-sm font-medium text-muted-foreground">
                    Funcionalidade
                  </th>
                  <th className="px-4 py-5 text-center text-sm font-medium text-muted-foreground">
                    Indeed
                  </th>
                  <th className="px-4 py-5 text-center text-sm font-medium text-muted-foreground">
                    LinkedIn
                  </th>
                  <th className="px-4 py-5 text-center text-sm font-semibold text-primary">
                    Jobera
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((feature, i) => (
                  <motion.tr
                    key={feature.label}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "border-b border-white/5 transition-colors hover:bg-muted/30",
                      i === COMPARISON_FEATURES.length - 1 && "border-b-0"
                    )}
                  >
                    <td className="px-6 py-4 text-sm text-foreground">{feature.label}</td>
                    <FeatureCell available={feature.indeed} />
                    <FeatureCell available={feature.linkedin} />
                    <td className="bg-primary/5 px-4 py-4 text-center">
                      <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-success/10">
                        <Check className="h-4 w-4 text-success" aria-label="Disponível" />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
