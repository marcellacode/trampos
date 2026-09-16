"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, MapPin, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { CopilotMark } from "@/components/shared/logo";

export interface HeroStat { value: string; label: string; }
export interface HeroTerminalAction { id: string; label: string; }
interface HeroProps { stats: HeroStat[]; terminalActions?: HeroTerminalAction[]; featuredScore?: { score: number; role: string; company: string; }; }

const COPILOT_PHRASES = [
  "Vamos encontrar sua próxima oportunidade?",
  "Analiso vagas que combinam com o seu perfil.",
  "Sua carreira merece um copiloto inteligente.",
] as const;

export function Hero({ stats }: HeroProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedPhrase, setTypedPhrase] = useState("");

  useEffect(() => {
    const phrase = COPILOT_PHRASES[phraseIndex];
    let index = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const animate = () => {
      if (!deleting) {
        index += 1;
        setTypedPhrase(phrase.slice(0, index));
        if (index === phrase.length) {
          deleting = true;
          timer = setTimeout(animate, 1800);
          return;
        }
        timer = setTimeout(animate, 42);
        return;
      }

      index -= 1;
      setTypedPhrase(phrase.slice(0, index));
      if (index === 0) {
        setPhraseIndex((current) => (current + 1) % COPILOT_PHRASES.length);
        return;
      }
      timer = setTimeout(animate, 22);
    };

    timer = setTimeout(animate, 420);
    return () => clearTimeout(timer);
  }, [phraseIndex]);
  function handleSearch(e: FormEvent) { e.preventDefault(); const p = new URLSearchParams(); if (keyword.trim()) p.set("q", keyword.trim()); if (location.trim()) p.set("loc", location.trim()); router.push(`/dashboard/vagas${p.toString() ? `?${p}` : ""}`); }

  return <section className="jobera-hero border-b border-border pb-16 pt-28 sm:pb-20 sm:pt-32">
    <Container>
      <div className="mx-auto max-w-4xl text-center">
        <div className="jobera-hero-copilot" aria-hidden="true">
          <span className="jobera-hero-orbit jobera-hero-orbit--one" />
          <span className="jobera-hero-orbit jobera-hero-orbit--two" />
          <span className="jobera-hero-orbit jobera-hero-orbit--three" />
          <span className="jobera-hero-halo" />
          <CopilotMark className="jobera-hero-mark" />
          <span className="jobera-hero-spark jobera-hero-spark--one"><Sparkles /></span>
          <span className="jobera-hero-spark jobera-hero-spark--two" />
        </div>
        <div className="jobera-copilot-message" role="status" aria-live="polite">
          <span className="jobera-copilot-message-name">Jobe</span>
          <span className="jobera-copilot-message-text">{typedPhrase}<i aria-hidden="true" /></span>
        </div>
        <p className="mb-4 text-sm font-semibold text-primary">Seu copiloto inteligente para a carreira</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">Conectando talentos a empresas que querem crescer</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">Encontre vagas, organize suas candidaturas e desenvolva sua carreira. Empresas também podem publicar oportunidades e gerenciar candidatos em um só lugar.</p>
      </div>

      <form onSubmit={handleSearch} className="mx-auto mt-9 max-w-4xl rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/60">
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <label className="relative"><span className="sr-only">Cargo ou palavra-chave</span><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"/><input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Cargo, área ou palavra-chave" className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>
          <label className="relative"><span className="sr-only">Localização</span><MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"/><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Cidade, estado ou remoto" className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>
          <Button type="submit" size="lg" className="h-12 px-7">Buscar vagas</Button>
        </div>
      </form>

      <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2">
        <Link href="/onboarding" className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><BriefcaseBusiness className="h-5 w-5"/></span><span className="min-w-0 flex-1"><strong className="block text-base text-slate-900">Estou procurando uma oportunidade</strong><span className="mt-1 block text-sm text-slate-600">Crie seu perfil, encontre vagas e acompanhe candidaturas.</span></span><ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-primary"/></Link>
        <Link href="/empresa/cadastro" className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Building2 className="h-5 w-5"/></span><span className="min-w-0 flex-1"><strong className="block text-base text-slate-900">Quero contratar talentos</strong><span className="mt-1 block text-sm text-slate-600">Cadastre sua empresa, publique vagas e gerencie candidatos.</span></span><ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-primary"/></Link>
      </div>

      {stats.length > 0 && <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-slate-500">{stats.map(s => <span key={s.label}><strong className="text-slate-800">{s.value}</strong> {s.label}</span>)}</div>}
    </Container>
  </section>;
}
