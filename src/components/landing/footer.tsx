import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";

export function Footer() {
  return <footer className="border-t border-border bg-white py-12 text-slate-950"><Container><div className="grid gap-10 md:grid-cols-4"><div className="md:col-span-2"><Logo/><p className="mt-4 max-w-md text-sm leading-6 text-slate-600">Uma plataforma de oportunidades que conecta candidatos e empresas em uma jornada de recrutamento mais simples, organizada e transparente.</p></div><div><h3 className="text-sm font-semibold">Candidatos</h3><div className="mt-4 grid gap-3 text-sm text-slate-600"><Link href="/#vagas">Buscar vagas</Link><Link href="/#candidatos">Recursos para candidatos</Link><Link href="/onboarding">Criar perfil</Link><Link href="/login">Entrar</Link></div></div><div><h3 className="text-sm font-semibold">Empresas</h3><div className="mt-4 grid gap-3 text-sm text-slate-600"><Link href="/#empresas">Soluções para empresas</Link><Link href="/empresa/cadastro">Cadastrar empresa</Link><Link href="/login?next=/dashboard/empresa">Área da empresa</Link><Link href="/privacidade">Privacidade</Link></div></div></div><div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">© {new Date().getFullYear()} Jobera. Todos os direitos reservados.</div></Container></footer>;
}
