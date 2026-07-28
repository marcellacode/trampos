import {
  buildExternalJobRecommendation,
  stripHtml,
} from "@/lib/integrations/jobs/shared-mapper";
import type { JobicyJob } from "@/lib/integrations/jobs/providers/jobicy/types";
import { applyMatchToJob } from "@/lib/matching/sync-user-matches";
import type { UserJobMatchRow } from "@/lib/matching/types";
import type { JobRecommendation } from "@/types/jobs";

export function mapJobicyJobToRecommendation(
  job: JobicyJob,
  userMatch?: UserJobMatchRow
): JobRecommendation {
  const stack = [...job.jobIndustry, ...job.jobType, job.jobLevel].filter(Boolean);
  const description = stripHtml(job.jobDescription || job.jobExcerpt);
  const base = buildExternalJobRecommendation({
    source: "jobicy",
    externalId: String(job.id),
    company: job.companyName,
    role: job.jobTitle,
    externalUrl: job.url,
    description,
    location: job.jobGeo || "Remoto",
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    stack,
    remote: true,
  });

  return userMatch ? applyMatchToJob(base, userMatch) : base;
}

export function mapJobicyJobsToRecommendations(
  jobs: JobicyJob[],
  matchMap?: Map<string, UserJobMatchRow>
): JobRecommendation[] {
  return jobs.map((job) =>
    mapJobicyJobToRecommendation(job, matchMap?.get(`jobicy-${job.id}`))
  );
}
