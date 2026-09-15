"use client";

import Link from "next/link";
import { ArrowRight, Banknote, Briefcase, MapPin } from "lucide-react";
import { Container } from "@/components/shared/container";
import type { JobRecommendation } from "@/types/jobs";

export function FeaturedJobs({ jobs }: { jobs: JobRecommendation[] }) {
  if (!jobs.length) return null;
  return <section id="vagas" className="border-b border-border bg-white py-16 text-slate-950 sm:py-20">
    <Container>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-primary">Vagas abertas</p><h2 className="mt-2 text-3xl font-bold text-slate-950">Encontre sua próxima oportunidade</h2><p className="mt-2 text-slate-600">Explore vagas publicadas por empresas e oportunidades reunidas de fontes confiáveis.</p></div><Link href="/dashboard/vagas" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Ver todas as vagas <ArrowRight className="h-4 w-4"/></Link></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{jobs.slice(0,6).map(job => <Link key={job.id} href={job.href} className="group flex min-h-56 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-slate-50"><Briefcase className="h-5 w-5 text-slate-600"/></div><h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary">{job.role}</h3><p className="mt-1 text-sm font-medium text-slate-600">{job.company}</p><div className="mt-4 space-y-2 text-sm text-slate-500"><p className="flex items-center gap-2"><MapPin className="h-4 w-4"/>{job.location}{job.remote ? " · Remoto" : ""}</p>{job.salary && job.salary !== "—" && <p className="flex items-center gap-2"><Banknote className="h-4 w-4"/>{job.salary}</p>}</div><div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs text-slate-500">Vaga ativa</span>{job.hasMatch && job.compatibility > 0 && <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{job.compatibility}% compatível</span>}</div></Link>)}</div>
    </Container>
  </section>;
}
