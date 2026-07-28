import type { SupabaseClient } from "@supabase/supabase-js";
import type { DiscoveryData, JobRecommendation } from "@/types/jobs";
import { filterOutDemoCatalogJobs } from "@/lib/catalog/demo-ids";
import { mapChatMessages } from "@/lib/supabase/mappers/dashboard";
import { fetchJobsForUser } from "@/lib/supabase/queries/jobs";

export async function fetchDiscoveryData(
  supabase: SupabaseClient,
  userId: string | null
): Promise<DiscoveryData> {
  const rawJobs = await fetchJobsForUser(supabase, userId, 24);
  const jobs = filterOutDemoCatalogJobs(rawJobs);

  const [summaryResult, filtersResult, chatResult] = await Promise.all([
    userId
      ? supabase
          .from("discovery_summaries")
          .select("analyzed, compatible, very_compatible, perfect")
          .eq("user_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    userId
      ? supabase
          .from("smart_filters")
          .select("id, label")
          .eq("user_id", userId)
          .order("sort_order")
      : Promise.resolve({ data: [], error: null }),
    userId
      ? supabase
          .from("chat_messages")
          .select("id, role, content, created_at")
          .eq("user_id", userId)
          .eq("context", "discovery")
          .order("created_at", { ascending: true })
          .limit(20)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const matched = jobs.filter((job) => job.hasMatch);
  const summaryRow = summaryResult.data;

  const summary = {
    analyzed: Math.max(summaryRow?.analyzed ?? 0, jobs.length),
    compatible: matched.filter((job) => job.compatibility >= 60).length,
    veryCompatible: matched.filter((job) => job.compatibility >= 80).length,
    perfect: matched.filter((job) => job.compatibility >= 95).length,
  };

  return {
    summary,
    filters: (filtersResult.data ?? []).map((filter) => ({
      id: filter.id,
      label: filter.label,
    })),
    jobs,
    companies: [],
    regions: [],
    salaryRadar: [],
    marketInsights: [],
    chat: mapChatMessages(chatResult.data ?? []),
  };
}

export async function fetchLandingStats(_supabase: SupabaseClient) {
  return {
    jobsCount: 0,
    companiesCount: 0,
    featuredJobs: [] as JobRecommendation[],
  };
}

export async function fetchLandingCompanies(_supabase: SupabaseClient) {
  return [] as { name: string; color: string; logo: string }[];
}
