"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

export interface HeroStat { value: string; label: string; }
export interface HeroTerminalAction { id: string; label: string; }
interface HeroProps { stats: HeroStat[]; terminalActions?: HeroTerminalAction[]; featuredScore?: { score: number; role: string; company: string; }; }

export function Hero({ stats }: HeroProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  function handleSearch(e: FormEvent) { e.preventDefault(); const p = new URLSearchParams(); if (keyword.trim()) p.set("q", keyword.trim()); if (location.trim()) p.set("loc", location.trim()); router.push(`/dashboard/vagas${p.toString() ? `?${p}` : ""}`); }

  return <section className="border-b border-border bg-[#f7f9fc] pb-16 pt-28 text-slate-950 sm:pb-20 sm:pt-32">
    <Container>
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-4 text-sm font-semibold text-primary">Oportunidades para todos os momentos da sua carreira</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Conectando talentos a empresas que querem crescer</h1>
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
