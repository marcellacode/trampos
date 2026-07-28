"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-background/70 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
      role="banner"
    >
      <Container>
        <nav
          className="flex h-16 items-center justify-between gap-4"
          aria-label="Navegação principal"
        >
          <Logo />

          <ul className="hidden items-center gap-1 md:flex" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 sm:flex">
            <Button
              variant="ghost"
              className="font-medium text-muted-foreground hover:text-foreground"
              render={<Link href="/login" />}
              nativeButton={false}
            >
              Entrar
            </Button>
            <Button
              className="rounded-xl px-5 font-semibold shadow-lg shadow-primary/20"
              render={<Link href="/onboarding" />}
              nativeButton={false}
            >
              Cadastrar currículo grátis
            </Button>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/10 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <Container className="py-4">
              <ul className="flex flex-col gap-1" role="list">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-white/5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
                <Button
                  variant="outline"
                  className="w-full justify-center rounded-xl border-white/10 bg-white/5"
                  render={<Link href="/login" onClick={() => setMobileOpen(false)} />}
                  nativeButton={false}
                >
                  Entrar
                </Button>
                <Button
                  className="w-full justify-center rounded-xl font-semibold"
                  render={<Link href="/onboarding" onClick={() => setMobileOpen(false)} />}
                  nativeButton={false}
                >
                  Cadastrar currículo grátis
                </Button>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
