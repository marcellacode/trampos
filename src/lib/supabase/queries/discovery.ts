import type { SupabaseClient } from "@supabase/supabase-js";
import type { DiscoveryData } from "@/types/jobs";
import { mapCompanyMatch, mapJobRecommendation } from "@/lib/supabase/mappers/jobs";
import { mapChatMessages } from "@/lib/supabase/mappers/dashboard";
import type { DbCompany, DbJob } from "@/lib/supabase/types";
import { unwrapCompany } from "@/lib/supabase/types";
import { fetchJobsForUser } from "@/lib/supabase/queries/jobs";

export async function fetchDiscoveryData(
  supabase: SupabaseClient,
  userId: string | null
): Promise<DiscoveryData> {
  const jobs = await fetchJobsForUser(supabase, userId, 24);

  const [
    summaryResult,
    filtersResult,
    companyMatchesResult,
    regionsResult,
    salaryResult,
    insightsResult,
    chatResult,
  ] = await Promise.all([
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
          .from("user_company_matches")
          .select(
            `
            compatibility,
            companies (
              id,
              slug,
              name,
              logo,
              brand_color,
              environment,
              remote_friendly,
              href,
              company_benefits (benefit, sort_order)
            )
          `
          )
          .eq("user_id", userId)
          .order("compatibility", { ascending: false })
          .limit(12)
      : supabase
          .from("companies")
          .select(
            `
            id,
            slug,
            name,
            logo,
            brand_color,
            environment,
            remote_friendly,
            href,
            company_benefits (benefit, sort_order)
          `
          )
          .order("name")
          .limit(12),
    supabase
      .from("opportunity_regions")
      .select("id, country_name, flag_emoji, opportunity_count, map_x, map_y")
      .order("opportunity_count", { ascending: false })
      .limit(8),
    supabase
      .from("salary_market_data")
      .select("tech_name, min_salary, avg_salary, max_salary")
      .order("tech_name")
      .limit(8),
    supabase
      .from("market_insights")
      .select("id, tech_name, change_percent")
      .order("change_percent", { ascending: false })
      .limit(6),
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

  const summary = summaryResult.data ?? {
    analyzed: jobs.length,
    compatible: jobs.filter((job) => job.hasMatch && job.compatibility >= 60)
      .length,
    very_compatible: jobs.filter(
      (job) => job.hasMatch && job.compatibility >= 80
    ).length,
    perfect: jobs.filter((job) => job.hasMatch && job.compatibility >= 95)
      .length,
  };

  const companyMatchRows = userId
    ? (companyMatchesResult.data ?? []) as {
        compatibility: number;
        companies: DbCompany | DbCompany[] | null;
      }[]
    : [];

  const publicCompanies = userId
    ? []
    : ((companyMatchesResult.data ?? []) as DbCompany[]);

  const companies = userId
    ? companyMatchRows
        .map((row) => {
          const company = unwrapCompany(row.companies);
          if (!company) return null;
          return mapCompanyMatch(company, row.compatibility);
        })
        .filter((company): company is NonNullable<typeof company> =>
          Boolean(company)
        )
    : publicCompanies.map((company) => mapCompanyMatch(company, null));

  return {
    summary: {
      analyzed: summary.analyzed,
      compatible: summary.compatible,
      veryCompatible: summary.very_compatible,
      perfect: summary.perfect,
    },
    filters: (filtersResult.data ?? []).map((filter) => ({
      id: filter.id,
      label: filter.label,
    })),
    jobs,
    companies,
    regions: (regionsResult.data ?? []).map((region) => ({
      id: region.id,
      country: region.country_name,
      flag: region.flag_emoji,
      count: region.opportunity_count,
      x: Number(region.map_x),
      y: Number(region.map_y),
    })),
    salaryRadar: (salaryResult.data ?? []).map((row) => ({
      tech: row.tech_name,
      min: row.min_salary,
      avg: row.avg_salary,
      max: row.max_salary,
    })),
    marketInsights: (insightsResult.data ?? []).map((row) => ({
      id: row.id,
      tech: row.tech_name,
      change: Number(row.change_percent),
    })),
    chat: mapChatMessages(chatResult.data ?? []),
  };
}

export async function fetchLandingStats(supabase: SupabaseClient) {
  const [jobsCount, companiesCount, jobs] = await Promise.all([
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase
      .from("jobs")
      .select(
        `
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
        companies (name, logo, brand_color)
      `
      )
      .eq("is_active", true)
      .order("published_at", { ascending: false })
      .limit(6),
  ]);

  return {
    jobsCount: jobsCount.count ?? 0,
    companiesCount: companiesCount.count ?? 0,
    featuredJobs: ((jobs.data ?? []) as DbJob[]).map((job) =>
      mapJobRecommendation(job)
    ),
  };
}

export async function fetchLandingCompanies(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("companies")
    .select("name, logo, brand_color")
    .order("name")
    .limit(16);

  if (error) throw error;

  return (data ?? []).map((company) => ({
    name: company.name,
    color: company.brand_color || "#6366F1",
    logo: company.logo || company.name.slice(0, 2),
  }));
}
