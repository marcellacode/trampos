"use client";

import { Container } from "@/components/shared/container";
import { motion } from "framer-motion";

export interface LandingCompany {
  name: string;
  color: string;
  logo?: string;
}

interface CompanyLogosProps {
  companies: LandingCompany[];
}

export function CompanyLogos({ companies }: CompanyLogosProps) {
  if (companies.length === 0) return null;

  const display = companies.slice(0, 12);
  const doubled = [...display, ...display];

  return (
    <section
      id="empresas"
      className="landing-section-alt overflow-hidden border-y border-white/5"
      aria-labelledby="companies-heading"
    >
      <Container>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          id="companies-heading"
          className="mb-8 text-center text-sm font-medium text-muted-foreground"
        >
          Empresas com vagas no catálogo
        </motion.p>
      </Container>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent"
          aria-hidden="true"
        />

        <div className="flex overflow-hidden">
          <div className="animate-marquee flex shrink-0 items-center gap-12 px-6">
            {doubled.map((company, i) => (
              <span
                key={`${company.name}-${i}`}
                className="shrink-0 text-lg font-semibold tracking-tight text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                style={{ color: company.color !== "#595959" ? company.color : undefined }}
              >
                {company.logo || company.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
