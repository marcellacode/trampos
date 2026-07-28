import type { JobRecommendation } from "@/types/jobs";
import { parseExternalJobRef } from "@/lib/jobs/source-utils";
import { getAdzunaJobById } from "@/lib/integrations/adzuna/client";
import { enrichAdzunaJobView } from "@/lib/integrations/adzuna/enrich";
import {
  mapAdzunaJobToRecommendation,
} from "@/lib/integrations/adzuna/mapper";
import { getRemotiveJobById } from "@/lib/integrations/jobs/providers/remotive/client";
import { mapRemotiveJobToRecommendation } from "@/lib/integrations/jobs/providers/remotive/mapper";
import { getArbeitnowJobBySlug } from "@/lib/integrations/jobs/providers/arbeitnow/client";
import { mapArbeitnowJobToRecommendation } from "@/lib/integrations/jobs/providers/arbeitnow/mapper";
import { getRemoteOkJobById } from "@/lib/integrations/jobs/providers/remoteok/client";
import { mapRemoteOkJobToRecommendation } from "@/lib/integrations/jobs/providers/remoteok/mapper";
import { getJobicyJobById } from "@/lib/integrations/jobs/providers/jobicy/client";
import { mapJobicyJobToRecommendation } from "@/lib/integrations/jobs/providers/jobicy/mapper";

export async function fetchExternalJobRecommendation(
  ref: string
): Promise<JobRecommendation | null> {
  const parsed = parseExternalJobRef(ref);
  if (!parsed) return null;

  switch (parsed.source) {
    case "adzuna": {
      const job = await getAdzunaJobById(parsed.id);
      if (!job) return null;
      const enriched = await enrichAdzunaJobView(job);
      return mapAdzunaJobToRecommendation(enriched);
    }
    case "remotive": {
      const job = await getRemotiveJobById(parsed.id);
      return job ? mapRemotiveJobToRecommendation(job) : null;
    }
    case "arbeitnow": {
      const job = await getArbeitnowJobBySlug(parsed.id);
      return job ? mapArbeitnowJobToRecommendation(job) : null;
    }
    case "remoteok": {
      const job = await getRemoteOkJobById(parsed.id);
      return job ? mapRemoteOkJobToRecommendation(job) : null;
    }
    case "jobicy": {
      const job = await getJobicyJobById(parsed.id);
      return job ? mapJobicyJobToRecommendation(job) : null;
    }
    default:
      return null;
  }
}
