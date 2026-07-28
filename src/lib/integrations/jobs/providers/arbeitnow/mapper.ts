import {
  buildExternalJobRecommendation,
  stripHtml,
} from "@/lib/integrations/jobs/shared-mapper";
import type { ArbeitnowJob } from "@/lib/integrations/jobs/providers/arbeitnow/types";
import { applyMatchToJob } from "@/lib/matching/sync-user-matches";
import type { UserJobMatchRow } from "@/lib/matching/types";
import type { JobRecommendation } from "@/types/jobs";

export function mapArbeitnowJobToRecommendation(
  job: ArbeitnowJob,
  userMatch?: UserJobMatchRow
): JobRecommendation {
  const stack = [...job.tags, ...job.job_types].filter(Boolean);
  const base = buildExternalJobRecommendation({
    source: "arbeitnow",
    externalId: job.slug,
    company: job.company_name,
    role: job.title,
    externalUrl: job.url,
    description: stripHtml(job.description),
    location: job.location || (job.remote ? "Remoto" : "Europa"),
    stack,
    remote: job.remote,
  });

  return userMatch ? applyMatchToJob(base, userMatch) : base;
}

export function mapArbeitnowJobsToRecommendations(
  jobs: ArbeitnowJob[],
  matchMap?: Map<string, UserJobMatchRow>
): JobRecommendation[] {
  return jobs.map((job) =>
    mapArbeitnowJobToRecommendation(job, matchMap?.get(`arbeitnow-${job.slug}`))
  );
}
