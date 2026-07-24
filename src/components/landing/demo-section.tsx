"use client";

import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { FadeInView } from "@/components/shared/fade-in-view";

export function DemoSection() {
  return (
    <section
      className="relative py-24 sm:py-32"
      aria-labelledby="demo-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#4F7CFF]/5 to-transparent" aria-hidden="true" />

      <Container>
        <SectionHeader
          label="Demonstração"
          title="Veja a IA em ação"
          description="Uma conversa real entre você e seu agente de carreira."
        />

        <FadeInView>
          <div className="mx-auto max-w-2xl">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111315] shadow-2xl">
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-white/8 px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F7CFF]/10 ring-1 ring-[#4F7CFF]/30">
                  <Bot className="h-5 w-5 text-[#4F7CFF]" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-white">Trampos AI</p>
                  <p className="text-xs text-[#22C55E]">Online agora</p>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-6 p-6" role="log" aria-label="Demonstração de conversa">
                {/* User message */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-end gap-3"
                >
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#4F7CFF] px-4 py-3 text-sm text-white">
                    Quero uma vaga React remoto acima de 8 mil.
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <User className="h-4 w-4 text-white" aria-hidden="true" />
                  </div>
                </motion.div>

                {/* AI response */}
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
                  <div className="max-w-[85%] space-y-3">
                    <div className="rounded-2xl rounded-tl-sm border border-white/8 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white/90">
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 }}
                      >
                        Analisei <strong className="text-[#4F7CFF]">2.431 vagas</strong>.
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.2 }}
                        className="mt-2"
                      >
                        Encontrei <strong className="text-[#22C55E]">18 compatíveis</strong>.
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.6 }}
                        className="mt-2"
                      >
                        Já adaptei seu currículo.
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 2.0 }}
                        className="mt-2 font-medium text-white"
                      >
                        Posso enviar as candidaturas?
                      </motion.p>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2.4 }}
                      className="flex gap-2"
                    >
                      <Button className="bg-[#22C55E] hover:bg-[#22C55E]/90">
                        Sim
                      </Button>
                      <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                        Ver detalhes
                      </Button>
                    </motion.div>
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
