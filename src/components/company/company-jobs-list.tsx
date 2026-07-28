"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { PublicCompanyJob } from "@/types/company";

interface CompanyJobsListProps {
  jobs: PublicCompanyJob[];
  companyName: string;
}

export function CompanyJobsList({ jobs, companyName }: CompanyJobsListProps) {
  if (jobs.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Vagas abertas
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {companyName} não possui vagas ativas no momento.
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-border bg-card/60 p-5 sm:p-6"
      aria-labelledby="company-jobs-heading"
    >
      <h2
        id="company-jobs-heading"
        className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Vagas abertas ({jobs.length})
      </h2>
      <ul className="mt-4 space-y-2" role="list">
        {jobs.map((job) => (
          <li key={job.id}>
            <Link
              href={job.href}
              className="group flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{job.title}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {job.location}
                  </span>
                  <span>{job.salary}</span>
                  {job.remote ? <span>Remoto</span> : null}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Ver vaga
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
