import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { FOOTER_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer
      id="contato"
      className="relative border-t border-white/5 bg-surface/50 py-16 backdrop-blur-sm"
      role="contentinfo"
    >
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Copiloto de carreira com IA para candidatos brasileiros. Encontre
              vagas compatíveis, adapte seu currículo e organize candidaturas
              em um só lugar.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Candidatos
            </h3>
            <ul className="space-y-2.5" role="list">
              {FOOTER_LINKS.produto.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/dashboard/vagas"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Buscar vagas
                </Link>
              </li>
              <li>
                <Link
                  href="/onboarding"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Cadastrar currículo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Institucional
            </h3>
            <ul className="space-y-2.5" role="list">
              {FOOTER_LINKS.empresa.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Jobera. Todos os direitos reservados.
        </div>
      </Container>
    </footer>
  );
}
