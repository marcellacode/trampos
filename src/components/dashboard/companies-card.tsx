"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { InterestedCompany } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface CompaniesCardProps {
  companies: InterestedCompany[];
  className?: string;
}

export function CompaniesCard({ companies, className }: CompaniesCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-[#111315] p-6",
        className
      )}
      aria-labelledby="companies-heading"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 id="companies-heading" className="text-base font-semibold text-white">
          Empresas interessadas
        </h2>
        <Link
          href="/dashboard/empresas"
          className="text-xs font-medium text-[#4F7CFF] transition-colors hover:text-[#6B93FF]"
        >
          Ver todas
        </Link>
      </div>

      <ul className="space-y-1" role="list">
        {companies.map((company, index) => (
          <motion.li
            key={company.id}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={company.href}
              className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/[0.04]"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: `${company.color}22`, color: company.color }}
              >
                {company.logo}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-white">
                    {company.name}
                  </p>
                  <span className="hidden truncate text-xs text-[#9CA3AF] sm:inline">
                    · {company.role}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-[#9CA3AF]">
                  {company.status}
                  <span className="text-white/20"> · </span>
                  {company.timeAgo}
                </p>
              </div>
              <span className="hidden items-center gap-1 text-xs font-medium text-[#9CA3AF] transition-colors group-hover:text-white sm:inline-flex">
                Ver detalhes
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
