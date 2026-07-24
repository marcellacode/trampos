import Link from "next/link";
import { ArrowRight, Briefcase, MapPin } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { FadeInView } from "@/components/shared/fade-in-view";
import type { JobRecommendation } from "@/types/jobs";

interface FeaturedJobsProps {
  jobs: JobRecommendation[];
}

export function FeaturedJobs({ jobs }: FeaturedJobsProps) {
  if (jobs.length === 0) return null;

  return (
    <section
      className="relative py-24 sm:py-32"
      aria-labelledby="featured-jobs-heading"
    >
      <Container>
        <SectionHeader
          label="Vagas reais"
          title="Oportunidades monitoradas pela IA"
          description="Vagas ativas do catálogo Jobera, atualizadas em tempo real."
        />

        <FadeInView>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={job.href}
                className="group rounded-2xl border border-white/10 bg-[#111315]/80 p-5 transition-colors hover:border-[#4F7CFF]/30 hover:bg-[#111315]"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold"
                    style={{
                      backgroundColor: `${job.color}22`,
                      color: job.color,
                    }}
                  >
                    {job.logo}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {job.role}
                    </p>
                    <p className="truncate text-sm text-[#9CA3AF]">
                      {job.company}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#9CA3AF]">
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                    {job.salary}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {job.location}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#22C55E]">
                    {job.remote ? "Remoto" : "Presencial/Híbrido"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#4F7CFF] opacity-0 transition-opacity group-hover:opacity-100">
                    Ver vaga
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </FadeInView>
      </Container>
    </section>
  );
}
