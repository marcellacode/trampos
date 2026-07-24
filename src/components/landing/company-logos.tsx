"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/container";

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

  return (
    <section
      id="empresas"
      className="relative border-y border-white/5 py-16 sm:py-20"
      aria-labelledby="companies-heading"
    >
      <Container>
        <motion.p
          id="companies-heading"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10 text-center text-sm font-medium uppercase tracking-wider text-[#9CA3AF]"
        >
          Empresas com vagas no catálogo
        </motion.p>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#08090A] to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#08090A] to-transparent" aria-hidden="true" />

          <motion.div
            animate={{ x: [0, -1200] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex w-max gap-12 sm:gap-16"
            aria-label="Empresas do catálogo"
          >
            {[...companies, ...companies].map((company, i) => (
              <div
                key={`${company.name}-${i}`}
                className="group flex shrink-0 items-center justify-center"
              >
                <span
                  className="text-xl font-semibold tracking-tight opacity-40 transition-all duration-300 group-hover:opacity-80 sm:text-2xl"
                  style={{ color: company.color }}
                >
                  {company.logo || company.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
