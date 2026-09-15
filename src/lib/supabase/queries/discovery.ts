import type { SupabaseClient } from "@supabase/supabase-js";
import type { DiscoveryData, JobRecommendation } from "@/types/jobs";
import { filterOutDemoCatalogJobs } from "@/lib/catalog/demo-ids";
import { mapChatMessages } from "@/lib/supabase/mappers/dashboard";
import { fetchJobsForUser } from "@/lib/supabase/queries/jobs";

export async function fetchDiscoveryData(
  supabase: SupabaseClient,
  userId: string | null
): Promise<DiscoveryData> {
  // Internal catalog data must never prevent external providers (Adzuna, etc.)
  // from loading. This is especially important while production schemas are
  // being migrated and some optional catalog tables/columns may be absent.
  let jobs: JobRecommendation[] = [];
  try {
    const rawJobs = await fetchJobsForUser(supabase, userId, 24);
    jobs = filterOutDemoCatalogJobs(rawJobs);
  } catch (error) {
    console.warn("[discovery] internal jobs unavailable; continuing with external providers", error);
  }

  const [summaryResult, filtersResult, chatResult] = await Promise.all([
    userId
      ? supabase.from("discovery_summaries").select("analyzed, compatible, very_compatible, perfect").eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    userId
      ? supabase.from("smart_filters").select("id, label").eq("user_id", userId).order("sort_order")
      : Promise.resolve({ data: [], error: null }),
    userId
      ? supabase.from("chat_messages").select("id, role, content, created_at").eq("user_id", userId).eq("context", "discovery").order("created_at", { ascending: true }).limit(20)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (summaryResult.error) console.warn("[discovery] summary unavailable", summaryResult.error);
  if (filtersResult.error) console.warn("[discovery] filters unavailable", filtersResult.error);
  if (chatResult.error) console.warn("[discovery] chat unavailable", chatResult.error);

  const matched = jobs.filter((job) => job.hasMatch);
  const summaryRow = summaryResult.error ? null : summaryResult.data;
  const summary = {
    analyzed: Math.max(summaryRow?.analyzed ?? 0, jobs.length),
    compatible: matched.filter((job) => job.compatibility >= 60).length,
    veryCompatible: matched.filter((job) => job.compatibility >= 80).length,
    perfect: matched.filter((job) => job.compatibility >= 95).length,
  };

  return {
    summary,
    filters: filtersResult.error ? [] : (filtersResult.data ?? []).map((filter) => ({ id: filter.id, label: filter.label })),
    jobs,
    companies: [],
    regions: [],
    salaryRadar: [],
    marketInsights: [],
    chat: chatResult.error ? [] : mapChatMessages(chatResult.data ?? []),
  };
}

export async function fetchLandingStats(_supabase: SupabaseClient) {
  return { jobsCount: 0, companiesCount: 0, featuredJobs: [] as JobRecommendation[] };
}

export async function fetchLandingCompanies(_supabase: SupabaseClient) {
  return [] as { name: string; color: string; logo: string }[];
}
