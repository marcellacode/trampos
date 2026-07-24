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
      className="relative py-24 sm:py-32"
      aria-labelledby="demo-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#4F7CFF]/5 to-transparent" aria-hidden="true" />

      <Container>
        <SectionHeader
          label="Vaga real"
          title={`${jobTitle} · ${companyName}`}
          description="Resumo gerado a partir do catálogo de vagas da plataforma."
        />

        <FadeInView>
          <div className="mx-auto max-w-2xl">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111315] shadow-2xl">
              <div className="flex items-center gap-3 border-b border-white/8 px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F7CFF]/10 ring-1 ring-[#4F7CFF]/30">
                  <Bot className="h-5 w-5 text-[#4F7CFF]" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-white">Jobe</p>
                  <p className="text-xs text-[#22C55E]">Catálogo ativo</p>
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
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#4F7CFF] px-4 py-3 text-sm text-white">
                    {userMessage}
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <User className="h-4 w-4 text-white" aria-hidden="true" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4F7CFF]/10">
                    <Bot className="h-4 w-4 text-[#4F7CFF]" aria-hidden="true" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/8 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white/90">
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
