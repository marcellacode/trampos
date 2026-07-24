"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import type { CompanyMatch } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface CompanyCarouselProps {
  companies: CompanyMatch[];
  className?: string;
}

export function CompanyCarousel({ companies, className }: CompanyCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scroll(dir: -1 | 1) {
    scrollerRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  }

  return (
    <section className={cn(className)} aria-labelledby="companies-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2
            id="companies-heading"
            className="text-base font-semibold text-white"
          >
            Empresas que combinam com você
          </h2>
          <p className="mt-0.5 text-sm text-[#9CA3AF]">
            Cultura, benefícios e fit alinhados ao seu perfil
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {companies.map((company, index) => (
          <motion.article
            key={company.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="w-[260px] shrink-0 rounded-2xl border border-white/[0.08] bg-[#111315] p-5 transition-shadow hover:border-white/[0.14] hover:shadow-[0_0_32px_rgba(79,124,255,0.1)]"
          >
            <Link href={company.href} className="block">
              <div className="flex items-start justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold"
                  style={{
                    backgroundColor: `${company.color}22`,
                    color: company.color,
                  }}
                >
                  {company.logo}
                </div>
                <span className="rounded-lg bg-[#22C55E]/10 px-2 py-1 text-xs font-semibold text-[#22C55E]">
                  {company.compatibility}%
                </span>
              </div>

              <h3 className="mt-4 text-sm font-semibold text-white">
                {company.name}
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] text-[#9CA3AF]">
                  <Building2 className="h-3 w-3" aria-hidden="true" />
                  {company.environment}
                </span>
                {company.remote && (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-[#4F7CFF]/20 bg-[#4F7CFF]/8 px-2 py-1 text-[10px] text-[#4F7CFF]">
                    <Globe className="h-3 w-3" aria-hidden="true" />
                    Remoto
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {company.benefits.slice(0, 3).map((b) => (
                  <span
                    key={b}
                    className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-[#9CA3AF]"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
