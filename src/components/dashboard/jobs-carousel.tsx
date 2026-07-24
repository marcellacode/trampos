"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JobCard } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface JobsCarouselProps {
  jobs: JobCard[];
  className?: string;
}

export function JobsCarousel({ jobs, className }: JobsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scroll(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: "smooth" });
  }

  return (
    <section
      className={cn(className)}
      aria-labelledby="jobs-heading"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="jobs-heading" className="text-base font-semibold text-white">
          Novas vagas
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/vagas"
            className="mr-1 text-xs font-medium text-[#4F7CFF] transition-colors hover:text-[#6B93FF]"
          >
            Ver todas
          </Link>
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
        {jobs.map((job, index) => (
          <motion.article
            key={job.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="w-[280px] shrink-0 rounded-2xl border border-white/[0.08] bg-[#111315] p-5 transition-shadow hover:border-white/[0.14] hover:shadow-[0_0_32px_rgba(79,124,255,0.1)]"
          >
            <div className="mb-4 flex items-start justify-between">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold"
                style={{ backgroundColor: `${job.color}22`, color: job.color }}
              >
                {job.logo}
              </div>
              {job.hasMatch ? (
                <span className="rounded-lg bg-[#22C55E]/10 px-2 py-1 text-xs font-semibold text-[#22C55E]">
                  {job.compatibility}%
                </span>
              ) : null}
            </div>

            <p className="text-xs text-[#9CA3AF]">{job.company}</p>
            <h3 className="mt-1 text-sm font-semibold text-white">{job.role}</h3>

            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#9CA3AF]">
              <span>{job.salary}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {job.location}
              </span>
            </div>

            <Button
              render={<Link href={job.href} />}
              nativeButton={false}
              variant="outline"
              className="mt-5 h-9 w-full border-white/10 bg-transparent"
            >
              Ver vaga
            </Button>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
