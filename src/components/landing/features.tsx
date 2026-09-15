import { Briefcase, CalendarCheck, FileText, Search, Target, UserRoundCheck } from "lucide-react";
import { Container } from "@/components/shared/container";

const features = [
  { icon: Search, title: "Busca de vagas", text: "Pesquise oportunidades por cargo, empresa, localização e modelo de trabalho." },
  { icon: Target, title: "Compatibilidade com seu perfil", text: "Entenda rapidamente quais oportunidades estão mais alinhadas às suas experiências e habilidades." },
  { icon: FileText, title: "Currículo organizado", text: "Mantenha suas informações profissionais atualizadas e prepare versões adequadas para cada candidatura." },
  { icon: Briefcase, title: "Candidaturas em um só lugar", text: "Acompanhe vagas de interesse e o andamento dos processos sem depender de planilhas." },
  { icon: CalendarCheck, title: "Entrevistas e agenda", text: "Organize compromissos e prepare-se para as próximas etapas dos processos seletivos." },
  { icon: UserRoundCheck, title: "Perfil profissional", text: "Apresente experiências, formação e habilidades para facilitar sua conexão com empresas." },
];

export function Features() {
  return <section id="candidatos" className="border-b border-border bg-[#f7f9fc] py-16 text-slate-950 sm:py-20"><Container><div className="max-w-2xl"><p className="text-sm font-semibold text-primary">Para candidatos</p><h2 className="mt-2 text-3xl font-bold">Sua busca por trabalho, mais simples e organizada</h2><p className="mt-3 text-slate-600">O Jobera reúne as ferramentas essenciais da jornada profissional em uma experiência direta e fácil de entender.</p></div><div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-3">{features.map(({icon: Icon,title,text}) => <article key={title} className="bg-white p-6"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5"/></div><h3 className="text-base font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}</div></Container></section>;
}
