"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const links = [
  { label: "Buscar vagas", href: "#vagas" },
  { label: "Para candidatos", href: "#candidatos" },
  { label: "Para empresas", href: "#empresas" },
  { label: "Como funciona", href: "#como-funciona" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 8); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  useEffect(() => { document.body.style.overflow = mobileOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobileOpen]);

  return <header className={cn("fixed inset-x-0 top-0 z-50 border-b transition-colors", scrolled ? "border-border bg-background/95 shadow-sm backdrop-blur" : "border-transparent bg-background/90")}>
    <Container><nav className="flex h-16 items-center gap-7" aria-label="Navegação principal">
      <Logo />
      <ul className="hidden flex-1 items-center gap-1 lg:flex">{links.map(link => <li key={link.href}><Link href={link.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">{link.label}</Link></li>)}</ul>
      <div className="ml-auto hidden items-center gap-2 md:flex">
        <Button variant="ghost" render={<Link href="/login" />} nativeButton={false}>Entrar</Button>
        <Button variant="outline" render={<Link href="/empresa/cadastro" />} nativeButton={false}>Sou empresa</Button>
        <Button render={<Link href="/onboarding" />} nativeButton={false}>Criar perfil</Button>
      </div>
      <button type="button" className="ml-auto flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden" onClick={() => setMobileOpen(v => !v)} aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}>{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
    </nav></Container>
    {mobileOpen && <div className="border-t border-border bg-background md:hidden"><Container className="py-4"><nav className="grid gap-1">{links.map(link => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-3 text-sm font-medium hover:bg-muted">{link.label}</Link>)}</nav><div className="mt-4 grid gap-2 border-t border-border pt-4"><Button variant="outline" render={<Link href="/empresa/cadastro" />} nativeButton={false}>Cadastrar empresa</Button><Button render={<Link href="/onboarding" />} nativeButton={false}>Criar perfil de candidato</Button><Button variant="ghost" render={<Link href="/login" />} nativeButton={false}>Entrar</Button></div></Container></div>}
  </header>;
}
