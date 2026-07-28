import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobRecommendation } from "@/types/jobs";
import { filterOutDemoCatalogJobs } from "@/lib/catalog/demo-ids";
import { mapJobRecommendation } from "@/lib/supabase/mappers/jobs";
import type { DbJob } from "@/lib/supabase/types";

const INTERNAL_JOBS_SELECT = `
  id,
  slug,
  title,
  location,
  salary_display,
  salary_min,
  salary_max,
  remote,
  published_at,
  verified,
  ai_summary,
  application_mode,
  external_apply_url,
  companies!jobs_company_id_fkey (
    id,
    slug,
    name,
    logo,
    brand_color,
    segment,
    employees_label,
    market_years,
    rating,
    verified,
    environment,
    remote_friendly,
    href
  ),
  job_stack (tech_name, sort_order),
  job_benefits (benefit, sort_order),
  job_section_items (section_type, content, sort_order),
  job_stats (response_days, process_days, steps, candidates)
`;

function sectionsDescription(job: DbJob): string {
  const items = job.job_section_items ?? [];
  const summary = items
    .filter((item) => item.section_type === "summary")
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => item.content);
  if (summary.length > 0) return summary.join("\n\n");
  return job.ai_summary;
}

export function mapInternalJobForDiscovery(job: DbJob): JobRecommendation {
  const recommendation = mapJobRecommendation(job, null);
  return {
    ...recommendation,
    source: "internal",
    applicationMode: job.application_mode ?? "internal",
    externalUrl:
      job.application_mode === "external_redirect"
        ? job.external_apply_url ?? undefined
        : undefined,
    description: sectionsDescription(job),
  };
}

export async function fetchInternalJobsForDiscovery(
  supabase: SupabaseClient,
  limit = 24
): Promise<JobRecommendation[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(INTERNAL_JOBS_SELECT)
    .eq("is_active", true)
    .not("created_by_user_id", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return filterOutDemoCatalogJobs(
    ((data ?? []) as DbJob[]).map(mapInternalJobForDiscovery)
  );
}
