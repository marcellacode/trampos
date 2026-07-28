"use client";

import Link from "next/link";
import { MapPin, Banknote, Clock, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import type { JobRecommendation } from "@/types/jobs";

interface FeaturedJobsProps {
  jobs: JobRecommendation[];
}

export function FeaturedJobs({ jobs }: FeaturedJobsProps) {
  if (jobs.length === 0) return null;

  return (
    <section
      id="vagas"
      className="landing-section"
      aria-labelledby="featured-jobs-heading"
    >
      <Container>
        <SectionHeader
          label="Oportunidades reais"
          title="Vagas em destaque"
          description="Confira oportunidades abertas agora, com score de compatibilidade quando disponível."
          className="mb-10"
        />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {jobs.map((job, index) => (
            <motion.li
              key={job.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={job.href}
                className="group glass-card flex h-full flex-col p-5 transition-all hover:border-primary/30 hover:bg-white/[0.06] hover:shadow-primary/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                      {job.role}
                    </h3>
                    <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                      {job.company}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {job.location}
                    {job.remote && (
                      <span className="ml-1 text-success">· Remoto</span>
                    )}
                  </span>
                  {job.salary && job.salary !== "—" && (
                    <span className="inline-flex items-center gap-1">
                      <Banknote className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {job.salary}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    Vaga ativa
                  </span>
                  {job.hasMatch && job.compatibility > 0 && (
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {job.compatibility}% compatível
                    </span>
                  )}
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link
            href="/dashboard/vagas"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
          >
            Ver todas as vagas
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
