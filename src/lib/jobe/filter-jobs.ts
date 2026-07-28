import type { JobRecommendation } from "@/types/jobs";
import type { ProfileGoals } from "@/lib/matching/types";
import {
  matchesLocation,
  matchesRole,
  matchesSalary,
  matchesSeniority,
} from "@/lib/matching/heuristics";

export type { ProfileGoals };

function profileScore(job: JobRecommendation, goals: ProfileGoals): number {
  let score = job.hasMatch ? job.compatibility : 50;

  if (goals.role && matchesRole(job.role, goals.role)) score += 15;
  if (goals.location && matchesLocation(job, goals.location)) score += 10;
  if (goals.seniority && matchesSeniority(job.role, goals.seniority)) score += 10;
  if (goals.salary && matchesSalary(job, goals.salary)) score += 10;

  return Math.min(score, 100);
}

export function filterJobsForProfile(
  jobs: JobRecommendation[],
  goals: ProfileGoals,
  excludeIds: Set<string>
): JobRecommendation[] {
  return jobs
    .filter((job) => !excludeIds.has(job.id))
    .map((job) => ({ job, score: profileScore(job, goals) }))
    .filter(({ score }) => score >= 55)
    .sort((a, b) => b.score - a.score || b.job.compatibility - a.job.compatibility)
    .map(({ job }) => job);
}

export function toChatJob(job: JobRecommendation) {
  return {
    id: job.id,
    companyId: job.companyId,
    role: job.role,
    company: job.company,
    location: job.location,
    salary: job.salary,
    compatibility: job.compatibility,
    logo: job.logo,
    color: job.color,
    href: job.href,
    remote: job.remote,
    aiSummary: job.aiSummary,
    stack: job.stack,
    source: job.source,
    externalUrl: job.externalUrl,
  };
}
