"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export function CtaFinal() {
  return (
    <section className="landing-section" aria-labelledby="cta-heading">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-white/[0.04] to-glow/10 p-10 text-center sm:p-14 glow-primary"
        >
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/30 blur-[80px]"
            aria-hidden="true"
          />

          <div className="relative">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/30">
              <Sparkles className="h-7 w-7 text-primary" aria-hidden="true" />
            </div>

            <h2
              id="cta-heading"
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Pronto para encontrar a vaga certa?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Cadastre seu currículo gratuitamente e deixe o Jobera encontrar
              oportunidades compatíveis com seu perfil.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-12 min-w-[220px] rounded-xl font-semibold shadow-lg shadow-primary/25"
                render={<Link href="/onboarding" />}
                nativeButton={false}
              >
                Cadastrar currículo grátis
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 min-w-[220px] rounded-xl border-white/15 bg-white/5 font-semibold hover:bg-white/10"
                render={<Link href="/dashboard/vagas" />}
                nativeButton={false}
              >
                Buscar vagas
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
