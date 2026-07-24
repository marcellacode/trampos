"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

export function CtaFinal() {
  return (
    <section
      className="relative py-24 sm:py-32"
      aria-labelledby="cta-heading"
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111315] px-6 py-16 text-center sm:px-12 sm:py-20"
        >
          {/* Background effects */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute top-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-[#4F7CFF]/20 blur-[100px]" />
            <div className="absolute inset-0 grid-pattern opacity-20" />
          </div>

          <div className="relative">
            <motion.h2
              id="cta-heading"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Sua próxima oportunidade pode estar aparecendo agora.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mx-auto mt-4 max-w-lg text-lg text-[#9CA3AF]"
            >
              Enquanto você lê isso, nossa IA já está monitorando milhares de
              vagas. Não perca mais tempo procurando — deixe a IA trabalhar por
              você.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-10"
            >
              <Button
                size="lg"
                className="group h-14 bg-[#4F7CFF] px-10 text-lg hover:bg-[#4F7CFF]/90 hover:shadow-xl hover:shadow-[#4F7CFF]/30"
                render={<Link href="/onboarding" />}
                nativeButton={false}
              >
                Começar gratuitamente
                <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-sm text-[#9CA3AF]"
            >
              Sem cartão de crédito · Plano gratuito disponível · Cancele quando quiser
            </motion.p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
