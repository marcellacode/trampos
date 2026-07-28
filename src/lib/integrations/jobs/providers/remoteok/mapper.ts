import {
  buildExternalJobRecommendation,
  stripHtml,
} from "@/lib/integrations/jobs/shared-mapper";
import type { RemoteOkJob } from "@/lib/integrations/jobs/providers/remoteok/types";
import { applyMatchToJob } from "@/lib/matching/sync-user-matches";
import type { UserJobMatchRow } from "@/lib/matching/types";
import type { JobRecommendation } from "@/types/jobs";

export function mapRemoteOkJobToRecommendation(
  job: RemoteOkJob,
  userMatch?: UserJobMatchRow
): JobRecommendation {
  const applyUrl = job.apply_url || job.url;
  const base = buildExternalJobRecommendation({
    source: "remoteok",
    externalId: String(job.id),
    company: job.company,
    role: job.position,
    externalUrl: applyUrl,
    description: stripHtml(job.description),
    location: job.location?.trim() || "Remoto",
    salaryMin: job.salary_min || undefined,
    salaryMax: job.salary_max || undefined,
    salaryCurrency: "USD",
    stack: job.tags,
    remote: true,
  });

  return userMatch ? applyMatchToJob(base, userMatch) : base;
}

export function mapRemoteOkJobsToRecommendations(
  jobs: RemoteOkJob[],
  matchMap?: Map<string, UserJobMatchRow>
): JobRecommendation[] {
  return jobs.map((job) =>
    mapRemoteOkJobToRecommendation(job, matchMap?.get(`remoteok-${job.id}`))
  );
}
