"use client";

import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { FadeInView } from "@/components/shared/fade-in-view";

interface DemoSectionProps {
  userMessage: string;
  assistantMessage: string;
  jobTitle: string;
  companyName: string;
}

export function DemoSection({
  userMessage,
  assistantMessage,
  jobTitle,
  companyName,
}: DemoSectionProps) {
  if (!userMessage || !assistantMessage) {
    return null;
  }

  return (
    <section
      className="landing-section relative"
      aria-labelledby="demo-heading"
    >
      <Container>
        <SectionHeader
          label="Jobe em ação"
          title={`${jobTitle} · ${companyName}`}
          description="Resumo gerado a partir do catálogo de vagas da plataforma."
        />

        <FadeInView>
          <div className="mx-auto mt-10 max-w-2xl">
            <div className="glass-card overflow-hidden glow-primary">
              <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
                  <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Jobe</p>
                  <p className="text-xs text-success">Catálogo ativo</p>
                </div>
              </div>

              <div className="space-y-6 p-6" role="log" aria-label="Resumo da vaga">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-end gap-3"
                >
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
                    {userMessage}
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <User className="h-4 w-4 text-foreground" aria-hidden="true" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-foreground/90">
                    {assistantMessage}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </FadeInView>
      </Container>
    </section>
  );
}
