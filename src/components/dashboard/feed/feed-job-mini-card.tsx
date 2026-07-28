"use client";

import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";
import type { FeedJobPreview } from "@/types/feed";
import { cn } from "@/lib/utils";

interface FeedJobMiniCardProps {
  job: FeedJobPreview;
  className?: string;
  badge?: "Vaga Jobera" | "Externa";
}

export function FeedJobMiniCard({ job, className, badge = "Vaga Jobera" }: FeedJobMiniCardProps) {
  return (
    <Link
      href={`/dashboard/vagas/${job.slug}`}
      className={cn(
        "mt-3 flex gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50",
        className
      )}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
        style={{
          backgroundColor: `${job.companyColor}22`,
          color: job.companyColor,
        }}
      >
        {job.companyLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.companyLogo}
            alt=""
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          job.companyName.slice(0, 2).toUpperCase()
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{job.title}</p>
        <div className="flex items-center gap-2">
          <p className="truncate text-xs text-muted-foreground">{job.companyName}</p>
          <span className="shrink-0 rounded border border-border px-1 py-0.5 text-[9px] uppercase text-muted-foreground">
            {badge}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {job.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {job.location}
              {job.remote ? " · Remoto" : ""}
            </span>
          ) : job.remote ? (
            <span>Remoto</span>
          ) : null}
          {job.salaryDisplay ? (
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3 w-3" aria-hidden="true" />
              {job.salaryDisplay}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
