"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, MapPin, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { HeroTerminal } from "@/components/landing/hero-terminal";
import { HeroScoreCard } from "@/components/landing/hero-score-card";

export interface HeroStat { value: string; label: string; }
export interface HeroTerminalAction { id: string; label: string; }
interface HeroProps { stats: HeroStat[]; terminalActions?: HeroTerminalAction[]; featuredScore?: { score: number; role: string; company: string; }; }
const DEFAULT_TERMINAL_ACTIONS: HeroTerminalAction[] = [
  { id: "scan", label: "Varrendo Adzuna, Remotive, RemoteOK..." },
  { id: "1", label: "Dev Full Stack @ Nubank — 87% match" },
  { id: "2", label: "Backend Engineer @ iFood — 82% match" },
  { id: "3", label: "Frontend React @ Stone — 79% match" },
  { id: "4", label: "Product Designer @ QuintoAndar — 74% match" },
];
export function Hero({ stats, terminalActions, featuredScore }: HeroProps) {
  const router = useRouter(); const [keyword, setKeyword] = useState(""); const [location, setLocation] = useState("");
  function handleSearch(e: FormEvent) { e.preventDefault(); const params = new URLSearchParams(); if (keyword.trim()) params.set("q", keyword.trim()); if (location.trim()) params.set("loc", location.trim()); const query = params.toString(); router.push(query ? `/dashboard/vagas?${query}` : "/dashboard/vagas"); }
  const visibleStats = stats.filter((s) => s.value !== "0"); const actions = terminalActions?.length ? terminalActions : DEFAULT_TERMINAL_ACTIONS; const scoreCard = featuredScore ?? { score: 87, role: "Dev Full Stack", company: "Nubank" };
  return <section className="relative overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-32 lg:pb-32" aria-labelledby="hero-heading">
    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(139,92,246,.13),transparent_28%),radial-gradient(circle_at_85%_25%,rgba(34,211,238,.08),transparent_25%)]" />
    <Container><div className="grid items-center gap-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-16">
      <div className="max-w-2xl"><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" />IA para sua carreira, sem complicação</span>
        <h1 id="hero-heading" className="text-balance text-4xl font-bold leading-[1.06] tracking-[-0.035em] sm:text-5xl lg:text-[3.65rem]">Encontre a vaga certa. <span className="text-gradient-primary">Chegue mais preparado.</span></h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">O Jobera encontra oportunidades, compara cada vaga com seu perfil e ajuda você a adaptar currículo, se preparar para entrevistas e acompanhar candidaturas.</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-success" />Perfil gratuito</span><span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-success" />Vagas em várias fontes</span><span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-success" />Score por oportunidade</span></div>
      </motion.div>
      <motion.form initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, delay: .12 }} onSubmit={handleSearch} className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-2 shadow-[0_24px_80px_rgba(0,0,0,.28)] backdrop-blur-2xl">
        <div className="grid gap-2 sm:grid-cols-2"><label className="relative"><span className="sr-only">Cargo ou palavra-chave</span><Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" /><input type="search" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Cargo ou palavra-chave" className="job-search-input h-12 border-white/5 bg-black/10 pl-11" /></label><label className="relative"><span className="sr-only">Localização</span><MapPin className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" /><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Cidade ou remoto" className="job-search-input h-12 border-white/5 bg-black/10 pl-11" /></label></div>
        <Button type="submit" size="lg" className="mt-2 h-12 w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/20">Buscar vagas <ArrowRight className="ml-1 h-4 w-4" /></Button>
      </motion.form>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"><Link href="/onboarding" className="font-semibold text-primary transition-colors hover:text-primary/80">Criar perfil grátis</Link><span className="text-border">•</span><Link href="/login" className="text-muted-foreground transition-colors hover:text-foreground">Já tenho conta</Link></div>
      {visibleStats.length > 0 && <div className="mt-7 flex flex-wrap gap-2" role="list" aria-label="Indicadores da plataforma">{visibleStats.map((stat) => <div key={stat.label} role="listitem" className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2"><span className="font-bold text-foreground">{stat.value}</span> <span className="text-xs text-muted-foreground">{stat.label}</span></div>)}</div>}
      </div>
      <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7, delay: .18 }} className="perspective-1000 relative mx-auto w-full max-w-lg lg:max-w-none"><div className="preserve-3d relative lg:translate-x-3 lg:[transform:perspective(1000px)_rotateY(-3deg)]"><HeroTerminal actions={actions} /><HeroScoreCard score={scoreCard.score} role={scoreCard.role} company={scoreCard.company} /></div></motion.div>
    </div></Container>
  </section>;
}
