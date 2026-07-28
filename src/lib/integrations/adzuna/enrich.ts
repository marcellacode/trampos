import { detectAtsProvider } from "@/lib/integrations/ats/detect-provider";
import { enrichJobFromGreenhouseUrl } from "@/lib/integrations/ats/providers/greenhouse/client";
import type { AdzunaJobResult, AdzunaJobView } from "@/lib/integrations/adzuna/types";

export async function enrichAdzunaJob<T extends AdzunaJobResult>(
  job: T
): Promise<T> {
  const provider = detectAtsProvider(job.redirect_url);
  if (provider !== "greenhouse") return job;

  const enriched = await enrichJobFromGreenhouseUrl(job.redirect_url);
  if (!enriched) return job;

  return {
    ...job,
    title: enriched.title ?? job.title,
    description: enriched.description || job.description,
    location: enriched.location
      ? { ...job.location, display_name: enriched.location }
      : job.location,
  };
}

export async function enrichAdzunaJobView(job: AdzunaJobView): Promise<AdzunaJobView> {
  return enrichAdzunaJob(job);
}
