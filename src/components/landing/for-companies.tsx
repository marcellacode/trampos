import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness, Building2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

const items = [
  { icon: Building2, title: "Página da empresa", text: "Apresente sua marca empregadora, benefícios e informações institucionais aos candidatos." },
  { icon: BriefcaseBusiness, title: "Publicação de vagas", text: "Crie e publique oportunidades com cargo, requisitos, modalidade, localização e informações da contratação." },
  { icon: UsersRound, title: "Gestão de candidatos", text: "Centralize pessoas candidatas por vaga e acompanhe o processo seletivo de forma organizada." },
  { icon: BarChart3, title: "Visão do recrutamento", text: "Acompanhe vagas abertas e movimentação de candidatos em uma área dedicada ao time de recrutamento." },
];

export function ForCompanies() {
  return <section id="empresas" className="border-b border-border bg-white py-16 text-slate-950 sm:py-20"><Container><div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><p className="text-sm font-semibold text-primary">Para empresas</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">Encontre as pessoas certas para o seu time</h2><p className="mt-4 text-base leading-7 text-slate-600">Cadastre sua empresa no Jobera, publique vagas e acompanhe candidatos em uma área de recrutamento simples e centralizada.</p><div className="mt-7 flex flex-wrap gap-3"><Button size="lg" render={<Link href="/empresa/cadastro" />} nativeButton={false}>Cadastrar minha empresa <ArrowRight className="ml-1 h-4 w-4"/></Button><Button size="lg" variant="outline" render={<Link href="/login" />} nativeButton={false}>Acessar área da empresa</Button></div><p className="mt-4 text-xs text-slate-500">O cadastro empresarial utiliza conta autenticada e permite administrar as vagas vinculadas à organização.</p></div><div className="grid gap-4 sm:grid-cols-2">{items.map(({icon:Icon,title,text}) => <article key={title} className="rounded-xl border border-slate-200 bg-[#f7f9fc] p-6"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary shadow-sm"><Icon className="h-5 w-5"/></div><h3 className="font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}</div></div></Container></section>;
}
