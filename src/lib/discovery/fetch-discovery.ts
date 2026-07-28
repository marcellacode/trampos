import type { SupabaseClient } from "@supabase/supabase-js";
import type { DiscoveryData, JobRecommendation } from "@/types/jobs";
import {
  fetchAllExternalJobs,
  mergeExternalJobLists,
} from "@/lib/discovery/fetch-external-jobs";
import { fetchDiscoveryData } from "@/lib/supabase/queries/discovery";
import { checkMatchSyncRateLimit } from "@/lib/matching/match-rate-limit";
import {
  applyMatchToJob,
  loadUserMatchesForJobs,
  syncUserMatches,
  updateDiscoverySummary,
} from "@/lib/matching/sync-user-matches";
import { listHiddenJobRefs } from "@/lib/supabase/queries/mutations/saved-jobs";

export interface DiscoverySearchOptions {
  what?: string;
  where?: string;
  page?: number;
  /** Skip lazy background match sync (used by explicit sync actions). */
  skipBackgroundSync?: boolean;
}

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function mergeJobLists(
  primary: JobRecommendation[],
  secondary: JobRecommendation[]
): JobRecommendation[] {
  return mergeExternalJobLists([primary, secondary]);
}

function filterJobsByQuery(
  jobs: JobRecommendation[],
  query: string
): JobRecommendation[] {
  const normalized = normalizeKey(query);
  if (!normalized) return jobs;

  return jobs.filter((job) => {
    const haystack = [
      job.role,
      job.company,
      job.location,
      job.aiSummary,
      job.description ?? "",
      ...job.stack,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

async function loadProfileSearchDefaults(
  supabase: SupabaseClient,
  userId: string | null
): Promise<{ what?: string; where?: string }> {
  if (!userId) return {};

  const { data } = await supabase
    .from("profiles")
    .select("goal_role, goal_location")
    .eq("id", userId)
    .maybeSingle();

  return {
    what: data?.goal_role?.trim() || undefined,
    where: data?.goal_location?.trim() || undefined,
  };
}

export async function fetchDiscoveryWithExternalJobs(
  supabase: SupabaseClient,
  userId: string | null,
  options: DiscoverySearchOptions = {}
): Promise<DiscoveryData> {
  const defaults = await loadProfileSearchDefaults(supabase, userId);

  const [discovery, externalJobs] = await Promise.all([
    fetchDiscoveryData(supabase, userId),
    fetchAllExternalJobs({ ...options, perProvider: 8 }, defaults),
  ]);

  let jobs = mergeJobLists(discovery.jobs, externalJobs);

  if (options.what?.trim()) {
    jobs = filterJobsByQuery(jobs, options.what);
  }

  if (userId && jobs.length > 0) {
    try {
      let matchMap = await loadUserMatchesForJobs(
        supabase,
        userId,
        jobs.map((j) => j.id)
      );

      const missingMatches = jobs.filter((j) => !matchMap.has(j.id));
      const canSync =
        !options.skipBackgroundSync &&
        missingMatches.length > 0 &&
        checkMatchSyncRateLimit(userId).allowed;

      if (canSync) {
        try {
          await syncUserMatches(supabase, userId, missingMatches, 8, {
            skipRateLimit: true,
          });
          matchMap = await loadUserMatchesForJobs(
            supabase,
            userId,
            jobs.map((j) => j.id)
          );
        } catch (error) {
          console.error("[discovery] match sync failed:", error);
        }
      }

      jobs = jobs.map((job) => applyMatchToJob(job, matchMap.get(job.id)));
    } catch (error) {
      console.error("[discovery] match load failed:", error);
    }

    try {
      const hidden = await listHiddenJobRefs(supabase, userId);
      jobs = jobs.filter((job) => !hidden.has(job.id));
    } catch (error) {
      console.error("[discovery] hidden jobs filter failed:", error);
    }
  }

  if (userId && jobs.some((j) => j.hasMatch)) {
    try {
      await updateDiscoverySummary(supabase, userId);
    } catch (error) {
      console.error("[discovery] summary update failed:", error);
    }
  }

  const matchedJobs = jobs.filter((j) => j.hasMatch);
  const analyzed = Math.max(discovery.summary.analyzed, matchedJobs.length);

  return {
    ...discovery,
    summary: {
      analyzed,
      compatible: matchedJobs.filter((j) => j.compatibility >= 60).length,
      veryCompatible: matchedJobs.filter((j) => j.compatibility >= 80).length,
      perfect: matchedJobs.filter((j) => j.compatibility >= 95).length,
    },
    jobs,
  };
}
