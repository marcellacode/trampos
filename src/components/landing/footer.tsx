import Link from "next/link";
import { Globe, MessageCircle, Share2 } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { FOOTER_LINKS } from "@/lib/constants";

const SOCIAL_LINKS = [
  { icon: Share2, href: "#", label: "Redes sociais" },
  { icon: Globe, href: "#", label: "Website" },
  { icon: MessageCircle, href: "#", label: "Contato" },
] as const;

export function Footer() {
  return (
    <footer
      id="contato"
      className="border-t border-white/8 bg-[#08090A] py-16"
      role="contentinfo"
    >
      <Container>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#9CA3AF]">
              A primeira plataforma onde uma IA trabalha para conseguir um
              emprego para você.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 text-[#9CA3AF] transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Produto</h3>
            <ul className="space-y-3" role="list">
              {FOOTER_LINKS.produto.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#9CA3AF] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Empresa</h3>
            <ul className="space-y-3" role="list">
              {FOOTER_LINKS.empresa.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#9CA3AF] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-3" role="list">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#9CA3AF] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-sm text-[#9CA3AF]">
            © {new Date().getFullYear()} Trampos AI. Todos os direitos reservados.
          </p>
          <p className="text-sm text-[#9CA3AF]">
            Feito com IA, para quem busca emprego.
          </p>
        </div>
      </Container>
    </footer>
  );
}
