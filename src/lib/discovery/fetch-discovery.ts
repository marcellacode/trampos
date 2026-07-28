import type { SupabaseClient } from "@supabase/supabase-js";
import type { DiscoveryData, JobRecommendation } from "@/types/jobs";
import { isAdzunaConfigured } from "@/lib/integrations/adzuna/env";
import { searchAdzunaJobs } from "@/lib/integrations/adzuna/client";
import { mapAdzunaJobsToRecommendations } from "@/lib/integrations/adzuna/mapper";
import { fetchDiscoveryData } from "@/lib/supabase/queries/discovery";

export interface DiscoverySearchOptions {
  what?: string;
  where?: string;
  page?: number;
}

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function jobDedupKey(job: JobRecommendation): string {
  return `${normalizeKey(job.company)}::${normalizeKey(job.role)}`;
}

function mergeJobLists(
  primary: JobRecommendation[],
  secondary: JobRecommendation[]
): JobRecommendation[] {
  const seen = new Set(primary.map(jobDedupKey));
  const merged = [...primary];

  for (const job of secondary) {
    const key = jobDedupKey(job);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(job);
  }

  return merged;
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

async function fetchAdzunaJobsForDiscovery(
  options: DiscoverySearchOptions,
  defaults: { what?: string; where?: string }
) {
  if (!isAdzunaConfigured()) return [];

  try {
    const what = options.what?.trim() || defaults.what;
    const where = options.where?.trim() || defaults.where;

    const response = await searchAdzunaJobs({
      what: what || "desenvolvedor",
      where: where || "Brasil",
      page: options.page ?? 1,
      resultsPerPage: 20,
    });

    return mapAdzunaJobsToRecommendations(response.results ?? []);
  } catch (error) {
    console.error("[discovery] Adzuna fetch failed:", error);
    return [];
  }
}

export async function fetchDiscoveryWithExternalJobs(
  supabase: SupabaseClient,
  userId: string | null,
  options: DiscoverySearchOptions = {}
): Promise<DiscoveryData> {
  const defaults = await loadProfileSearchDefaults(supabase, userId);

  const [discovery, adzunaJobs] = await Promise.all([
    fetchDiscoveryData(supabase, userId),
    fetchAdzunaJobsForDiscovery(options, defaults),
  ]);

  let jobs = mergeJobLists(discovery.jobs, adzunaJobs);

  if (options.what?.trim()) {
    jobs = filterJobsByQuery(jobs, options.what);
  }

  const analyzed = Math.max(discovery.summary.analyzed, jobs.length);

  return {
    ...discovery,
    summary: {
      ...discovery.summary,
      analyzed,
    },
    jobs,
  };
}
