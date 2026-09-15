import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Termos de Uso — Jobera",
  description: "Termos gerais de uso da plataforma Jobera.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background py-10 text-foreground">
      <Container className="max-w-3xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Logo />
          <Link href="/" className="text-sm text-primary hover:text-primary/80">Voltar ao início</Link>
        </div>
        <article className="space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-10">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Última atualização: setembro de 2026</p>
            <h1 className="text-3xl font-semibold">Termos de Uso</h1>
          </div>
          <section className="space-y-3"><h2 className="text-xl font-semibold">1. Uso da plataforma</h2><p className="leading-7 text-muted-foreground">A Jobera oferece ferramentas de apoio à carreira, organização de candidaturas, descoberta de vagas e recursos assistidos por inteligência artificial. O usuário é responsável pelas informações fornecidas e pelas decisões tomadas a partir das recomendações apresentadas.</p></section>
          <section className="space-y-3"><h2 className="text-xl font-semibold">2. Vagas e serviços de terceiros</h2><p className="leading-7 text-muted-foreground">Parte das oportunidades pode vir de provedores externos. Disponibilidade, conteúdo, processos seletivos e condições dessas vagas são de responsabilidade de seus respectivos anunciantes e plataformas.</p></section>
          <section className="space-y-3"><h2 className="text-xl font-semibold">3. Inteligência artificial</h2><p className="leading-7 text-muted-foreground">Conteúdos gerados ou sugeridos por IA devem ser revisados antes do uso. A Jobera não garante aprovação em processos seletivos, contratação ou exatidão absoluta das respostas geradas.</p></section>
          <section className="space-y-3"><h2 className="text-xl font-semibold">4. Conta e segurança</h2><p className="leading-7 text-muted-foreground">Mantenha seus dados de acesso protegidos e informe apenas dados que você tenha autorização para utilizar. O uso indevido da plataforma pode resultar em limitação ou suspensão do acesso.</p></section>
          <section className="space-y-3"><h2 className="text-xl font-semibold">5. Privacidade</h2><p className="leading-7 text-muted-foreground">O tratamento de dados pessoais é descrito na <Link href="/privacidade" className="text-primary hover:text-primary/80">Política de Privacidade</Link>.</p></section>
        </article>
      </Container>
    </main>
  );
}
