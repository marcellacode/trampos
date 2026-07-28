import {
  buildExternalJobRecommendation,
  stripHtml,
} from "@/lib/integrations/jobs/shared-mapper";
import type { RemotiveJob } from "@/lib/integrations/jobs/providers/remotive/types";
import { applyMatchToJob } from "@/lib/matching/sync-user-matches";
import type { UserJobMatchRow } from "@/lib/matching/types";
import type { JobRecommendation } from "@/types/jobs";

export function mapRemotiveJobToRecommendation(
  job: RemotiveJob,
  userMatch?: UserJobMatchRow
): JobRecommendation {
  const stack = [job.category, job.job_type, ...job.tags].filter(Boolean);
  const base = buildExternalJobRecommendation({
    source: "remotive",
    externalId: String(job.id),
    company: job.company_name,
    role: job.title,
    externalUrl: job.url,
    description: stripHtml(job.description),
    location: job.candidate_required_location || "Remoto",
    salaryLabel: job.salary || undefined,
    stack,
    remote: true,
  });

  return userMatch ? applyMatchToJob(base, userMatch) : base;
}

export function mapRemotiveJobsToRecommendations(
  jobs: RemotiveJob[],
  matchMap?: Map<string, UserJobMatchRow>
): JobRecommendation[] {
  return jobs.map((job) =>
    mapRemotiveJobToRecommendation(job, matchMap?.get(`remotive-${job.id}`))
  );
}
