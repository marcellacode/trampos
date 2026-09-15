import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Privacidade — Jobera",
  description: "Informações sobre o tratamento de dados pessoais na Jobera.",
};

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-semibold">Política de Privacidade</h1>
          </div>
          <section className="space-y-3"><h2 className="text-xl font-semibold">1. Dados tratados</h2><p className="leading-7 text-muted-foreground">A Jobera pode tratar dados de conta, informações profissionais, currículo, preferências de carreira, candidaturas e conteúdos enviados pelo próprio usuário para entregar as funcionalidades da plataforma.</p></section>
          <section className="space-y-3"><h2 className="text-xl font-semibold">2. Finalidades</h2><p className="leading-7 text-muted-foreground">Os dados são usados para autenticação, personalização do perfil, matching de vagas, geração de materiais de candidatura, organização da jornada profissional e funcionamento dos recursos escolhidos pelo usuário.</p></section>
          <section className="space-y-3"><h2 className="text-xl font-semibold">3. Integrações</h2><p className="leading-7 text-muted-foreground">Algumas funções dependem de serviços de infraestrutura, autenticação, inteligência artificial e fontes externas de vagas. Somente os dados necessários à execução de cada função devem ser enviados a essas integrações.</p></section>
          <section className="space-y-3"><h2 className="text-xl font-semibold">4. Perfil público</h2><p className="leading-7 text-muted-foreground">A exposição pública do perfil deve respeitar as opções de visibilidade configuradas pelo usuário. Revise essas opções antes de compartilhar seu perfil.</p></section>
          <section className="space-y-3"><h2 className="text-xl font-semibold">5. Seus controles</h2><p className="leading-7 text-muted-foreground">Use a área de configurações da conta para revisar preferências de privacidade e recursos de exportação disponíveis. Para questões relacionadas aos seus dados, utilize os canais de contato informados pela plataforma.</p></section>
          <p className="border-t border-border pt-6 text-sm text-muted-foreground">Consulte também os <Link href="/termos" className="text-primary hover:text-primary/80">Termos de Uso</Link>.</p>
        </article>
      </Container>
    </main>
  );
}
