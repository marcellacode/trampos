"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { MapPin, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { HeroTerminal } from "@/components/landing/hero-terminal";
import { HeroScoreCard } from "@/components/landing/hero-score-card";

export interface HeroStat {
  value: string;
  label: string;
}

export interface HeroTerminalAction {
  id: string;
  label: string;
}

interface HeroProps {
  stats: HeroStat[];
  terminalActions?: HeroTerminalAction[];
  featuredScore?: {
    score: number;
    role: string;
    company: string;
  };
}

const DEFAULT_TERMINAL_ACTIONS: HeroTerminalAction[] = [
  { id: "scan", label: "Varrendo Adzuna, Remotive, RemoteOK..." },
  { id: "1", label: "Dev Full Stack @ Nubank — 87% match" },
  { id: "2", label: "Backend Engineer @ iFood — 82% match" },
  { id: "3", label: "Frontend React @ Stone — 79% match" },
  { id: "4", label: "Product Designer @ QuintoAndar — 74% match" },
];

export function Hero({ stats, terminalActions, featuredScore }: HeroProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (location.trim()) params.set("loc", location.trim());
    const query = params.toString();
    router.push(query ? `/dashboard/vagas?${query}` : "/dashboard/vagas");
  }

  const visibleStats = stats.filter((s) => s.value !== "0");
  const actions =
    terminalActions && terminalActions.length > 0
      ? terminalActions
      : DEFAULT_TERMINAL_ACTIONS;

  const scoreCard = featuredScore ?? {
    score: 87,
    role: "Dev Full Stack",
    company: "Nubank",
  };

  return (
    <section
      className="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-28 lg:pb-32"
      aria-labelledby="hero-heading"
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Copiloto de carreira com IA
              </span>

              <h1
                id="hero-heading"
                className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]"
              >
                Encontre vagas{" "}
                <span className="text-gradient-primary">compatíveis</span> com
                seu perfil
              </h1>

              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                O Jobera reúne vagas de várias fontes, calcula seu score de
                compatibilidade e ajuda você a adaptar currículo, simular
                entrevistas e organizar candidaturas — tudo em um só lugar.
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleSearch}
              className="mt-8 glass-strong overflow-hidden rounded-2xl glow-primary"
            >
              <div className="flex flex-col sm:flex-row sm:divide-x sm:divide-white/10">
                <label className="relative flex-1">
                  <span className="sr-only">Cargo ou palavra-chave</span>
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Cargo, empresa ou palavra-chave"
                    className="job-search-input rounded-none rounded-t-2xl border-0 bg-transparent pl-12 focus:ring-0 sm:rounded-none sm:rounded-tl-2xl sm:rounded-tr-none"
                  />
                </label>
                <label className="relative flex-1 border-t border-white/10 sm:border-t-0">
                  <span className="sr-only">Localização</span>
                  <MapPin
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Cidade, estado ou remoto"
                    className="job-search-input rounded-none border-0 bg-transparent pl-12 focus:ring-0 sm:rounded-none sm:rounded-tr-2xl"
                  />
                </label>
              </div>
              <div className="border-t border-white/10 p-3 sm:flex sm:justify-start sm:px-4">
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full rounded-xl px-8 text-base font-semibold shadow-lg shadow-primary/25 sm:w-auto"
                >
                  Buscar vagas
                </Button>
              </div>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-4 text-sm text-muted-foreground"
            >
              Ainda não tem conta?{" "}
              <Link
                href="/onboarding"
                className="font-medium text-primary hover:text-primary/80"
              >
                Cadastrar currículo grátis
              </Link>
              {" · "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Entrar
              </Link>
            </motion.p>

            {visibleStats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 flex flex-wrap gap-3"
                role="list"
                aria-label="Indicadores da plataforma"
              >
                {visibleStats.map((stat) => (
                  <div
                    key={stat.label}
                    role="listitem"
                    className="glass rounded-xl px-4 py-2.5"
                  >
                    <span className="text-lg font-bold text-foreground">
                      {stat.value}
                    </span>{" "}
                    <span className="text-sm text-muted-foreground">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="perspective-1000 relative mx-auto w-full max-w-lg lg:max-w-none"
          >
            <div className="preserve-3d relative lg:translate-x-4 [transform:perspective(1000px)_rotateY(-4deg)]">
              <HeroTerminal actions={actions} />
              <HeroScoreCard
                score={scoreCard.score}
                role={scoreCard.role}
                company={scoreCard.company}
              />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
