import type { PublicCompany, PublicCompanyJob } from "@/types/company";
import type { CompanyProfile, JobStats } from "@/types/jobs";
import { sortByOrder } from "@/lib/supabase/types";

export interface DbPublicCompanyRow {
  id: string;
  slug: string;
  name: string;
  logo: string;
  brand_color: string;
  segment: string;
  bio: string;
  cover_url: string | null;
  is_claimed: boolean;
  claimed_at: string | null;
  verified: boolean;
  remote_friendly: boolean;
  employees_label: string;
  market_years: number | null;
  rating: number | null;
  company_benefits?: { benefit: string; sort_order: number }[];
  jobs?: {
    id: string;
    slug: string;
    title: string;
    location: string;
    salary_display: string;
    remote: boolean;
    is_active?: boolean;
    job_stats?:
      | {
          response_days: number;
          process_days: number;
          steps: number;
          candidates: number;
        }
      | {
          response_days: number;
          process_days: number;
          steps: number;
          candidates: number;
        }[];
  }[];
}

const DEFAULT_STATS: JobStats = {
  responseDays: 0,
  processDays: 0,
  steps: 0,
  candidates: 0,
};

function averageJobStats(
  jobs: DbPublicCompanyRow["jobs"] = []
): JobStats {
  const stats = jobs
    .map((job) => {
      const raw = job.job_stats;
      if (!raw) return null;
      return Array.isArray(raw) ? raw[0] : raw;
    })
    .filter(Boolean) as {
    response_days: number;
    process_days: number;
    steps: number;
    candidates: number;
  }[];

  if (stats.length === 0) return DEFAULT_STATS;

  const totals = stats.reduce(
    (acc, item) => ({
      responseDays: acc.responseDays + item.response_days,
      processDays: acc.processDays + item.process_days,
      steps: acc.steps + item.steps,
      candidates: acc.candidates + item.candidates,
    }),
    { responseDays: 0, processDays: 0, steps: 0, candidates: 0 }
  );

  const count = stats.length;
  return {
    responseDays: Math.round(totals.responseDays / count),
    processDays: Math.round(totals.processDays / count),
    steps: Math.round(totals.steps / count),
    candidates: Math.round(totals.candidates / count),
  };
}

function mapJobs(jobs: DbPublicCompanyRow["jobs"] = []): PublicCompanyJob[] {
  return jobs.map((job) => ({
    id: job.id,
    slug: job.slug,
    title: job.title,
    location: job.location,
    salary: job.salary_display,
    remote: job.remote,
    href: `/dashboard/vagas/${job.slug || job.id}`,
  }));
}

export function mapPublicCompany(row: DbPublicCompanyRow): PublicCompany {
  const profile: CompanyProfile = {
    segment: row.segment,
    employees: row.employees_label,
    marketYears: row.market_years ?? 0,
    rating: row.rating ?? 0,
    verified: row.verified,
  };

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logo: row.logo,
    brandColor: row.brand_color,
    segment: row.segment,
    bio: row.bio,
    coverUrl: row.cover_url,
    isClaimed: row.is_claimed,
    claimedAt: row.claimed_at,
    verified: row.verified,
    remoteFriendly: row.remote_friendly,
    benefits: sortByOrder(row.company_benefits ?? []).map((item) => item.benefit),
    profile,
    stats: averageJobStats(row.jobs),
    jobs: mapJobs(row.jobs),
  };
}
