"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import {
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import { CompatibilityBar } from "@/components/dashboard/jobs/compatibility-bar";
import type { SimilarCompany } from "@/types/jobs";
import { cn } from "@/lib/utils";

interface SimilarCompaniesProps {
  companies: SimilarCompany[];
}

export function SimilarCompanies({ companies }: SimilarCompaniesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -240 : 240, behavior: "smooth" });
    setTimeout(updateScrollState, 300);
  }

  return (
    <ReportCard>
      <div className="mb-5 flex items-center justify-between">
        <ReportSectionHeader
          title="Empresas semelhantes"
          subtitle="Empresas com perfil e cultura similares"
          className="mb-0"
        />
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] transition-colors",
              canScrollLeft
                ? "text-white hover:bg-white/5"
                : "cursor-not-allowed text-[#9CA3AF]/30"
            )}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] transition-colors",
              canScrollRight
                ? "text-white hover:bg-white/5"
                : "cursor-not-allowed text-[#9CA3AF]/30"
            )}
            aria-label="Próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-3 overflow-x-auto pb-1 scrollbar-none"
      >
        {companies.map((company, index) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="w-44 shrink-0"
          >
            <Link
              href={company.href}
              className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:-translate-y-1 hover:border-[#4F7CFF]/30 hover:shadow-[0_0_24px_rgba(79,124,255,0.1)]"
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold"
                style={{
                  backgroundColor: `${company.color}22`,
                  color: company.color,
                }}
              >
                {company.logo}
              </div>
              <p className="text-sm font-medium text-white group-hover:text-[#4F7CFF]">
                {company.name}
              </p>
              <div className="mt-3">
                <CompatibilityBar value={company.compatibility} size="sm" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </ReportCard>
  );
}
