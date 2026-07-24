"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { Container } from "@/components/shared/container";
import { HeroTerminal } from "@/components/landing/hero-terminal";
import { HERO_STATS } from "@/lib/constants";

export function Hero() {
  return (
    <section
      className="relative flex min-h-screen items-center overflow-hidden pt-16"
      aria-labelledby="hero-heading"
    >
      <AnimatedBackground />

      <Container className="relative py-20 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4F7CFF]/20 bg-[#4F7CFF]/10 px-4 py-1.5 text-sm text-[#4F7CFF]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4F7CFF] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4F7CFF]" />
                </span>
                Sua IA trabalha para conseguir seu próximo emprego
              </span>
            </motion.div>

            <motion.h1
              id="hero-heading"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Pare de procurar vagas.{" "}
              <span className="text-gradient-primary">
                Deixe uma IA encontrar seu próximo emprego.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-[#9CA3AF] sm:text-xl"
            >
              Enquanto você trabalha, estuda ou dorme, nossa IA procura vagas,
              adapta seu currículo, envia candidaturas e acompanha cada etapa
              do processo seletivo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button
                size="lg"
                className="group h-12 bg-[#4F7CFF] px-8 text-base hover:bg-[#4F7CFF]/90 hover:shadow-lg hover:shadow-[#4F7CFF]/25"
                render={<Link href="/onboarding" />}
                nativeButton={false}
              >
                Começar grátis
                <ArrowRight className="ml-1 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/10 bg-white/5 px-8 text-base text-white hover:bg-white/10"
              >
                <Play className="mr-1 h-4 w-4" aria-hidden="true" />
                Ver demonstração
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-8"
              role="list"
              aria-label="Indicadores da plataforma"
            >
              {HERO_STATS.map((stat, i) => (
                <div key={i} className="flex items-center gap-2" role="listitem">
                  <div className="h-1 w-1 rounded-full bg-[#4F7CFF]" aria-hidden="true" />
                  <span className="text-sm text-[#9CA3AF]">
                    <strong className="font-semibold text-white">{stat.value}</strong>{" "}
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column - Terminal */}
          <HeroTerminal />
        </div>
      </Container>
    </section>
  );
}
