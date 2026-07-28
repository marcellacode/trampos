"use client";

import {
  FileText,
  Search,
  Send,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";

const STEPS = [
  {
    step: 1,
    title: "Cadastre-se",
    description: "Importe currículo, LinkedIn ou GitHub em minutos.",
    icon: UserPlus,
  },
  {
    step: 2,
    title: "Busque vagas",
    description: "Filtre por cargo, localização e modalidade.",
    icon: Search,
  },
  {
    step: 3,
    title: "Prepare candidatura",
    description: "Adapte currículo e materiais para cada vaga.",
    icon: FileText,
  },
  {
    step: 4,
    title: "Candidate-se",
    description: "Envie e acompanhe cada etapa do processo.",
    icon: Send,
  },
] as const;

function StepCard({
  step,
  title,
  description,
  icon: Icon,
  index,
}: (typeof STEPS)[number] & { index: number; icon: LucideIcon }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative flex flex-col"
    >
      {index < STEPS.length - 1 && (
        <div
          className="absolute top-8 left-[calc(50%+2rem)] hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-primary/40 to-transparent lg:block"
          aria-hidden="true"
        />
      )}

      <div className="glass-card group relative flex flex-1 flex-col p-6 transition-all hover:border-primary/25 hover:bg-white/[0.06]">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30 transition-all group-hover:glow-primary">
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <span className="font-mono text-sm font-medium text-primary/80">
            0{step}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </motion.article>
  );
}

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="landing-section-alt"
      aria-labelledby="how-it-works-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(139,92,246,0.08),transparent)]"
        aria-hidden="true"
      />

      <Container className="relative">
        <SectionHeader
          label="Como funciona"
          title="Do perfil à candidatura em 4 passos"
          description="Sem planilhas, sem adivinhação — o Jobera guia cada etapa da sua busca."
          className="mb-12"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item, index) => (
            <StepCard key={item.step} {...item} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}
