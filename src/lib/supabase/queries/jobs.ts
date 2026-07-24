import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobDetail, JobRecommendation } from "@/types/jobs";
import {
  mapJobCard,
  mapJobDetail,
  mapJobRecommendation,
  mapCompanyMatch,
} from "@/lib/supabase/mappers/jobs";
import type { DbCompany, DbJob, DbJobMatch } from "@/lib/supabase/types";
import { sortByOrder, unwrapCompany, unwrapSingle } from "@/lib/supabase/types";

const JOB_LIST_SELECT = `
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
  companies (
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
  job_stats (response_days, process_days, steps, candidates)
`;

const JOB_MATCH_SELECT = `
  id,
  job_id,
  compatibility,
  approval_level,
  approval_stars,
  best_send_day_label,
  best_send_time_range,
  best_send_insight,
  why_match_summary,
  approval_suggestion,
  salary_job_min,
  salary_job_max,
  salary_market_min,
  salary_market_max,
  salary_user_expectation,
  salary_insight,
  comparison_recommended_job_id,
  comparison_ai_conclusion,
  career_impact_explanation,
  job_match_reasons (id, text, reason_type, sort_order),
  job_match_weight_factors (label, weight, sort_order),
  job_match_approval_reasons (reason, sort_order),
  job_match_simulation_stages (id, label, status, sort_order),
  job_match_tech_comparisons (id, tech_name, required_level, user_level, weight, sort_order),
  job_match_resume_suggestions (id, text, suggestion_type, sort_order),
  job_match_portfolio_projects (id, name, description, is_highlight, sort_order),
  job_match_github_projects (id, name, description, relevance, sort_order),
  job_match_apply_checklist (id, label, status, sort_order),
  job_match_study_topics (id, title, priority, sort_order),
  job_match_career_impact_roles (id, role_title, uplift_percent, sort_order),
  job_match_comparison_items (
    id,
    compared_job_id,
    salary_display,
    remote_label,
    compatibility,
    process_steps,
    benefits_rating,
    sort_order,
    jobs:compared_job_id (
      id,
      title,
      companies (name, logo, brand_color)
    )
  )
`;

function matchByJobId(
  matches: DbJobMatch[] | null | undefined
): Map<string, DbJobMatch> {
  return new Map((matches ?? []).map((match) => [match.job_id, match]));
}

export async function fetchActiveJobs(
  supabase: SupabaseClient,
  limit = 20
): Promise<JobRecommendation[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_LIST_SELECT)
    .eq("is_active", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return ((data ?? []) as DbJob[]).map((job) => mapJobRecommendation(job));
}

export async function fetchJobsForUser(
  supabase: SupabaseClient,
  userId: string | null,
  limit = 20
): Promise<JobRecommendation[]> {
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(JOB_LIST_SELECT)
    .eq("is_active", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  let matches = new Map<string, DbJobMatch>();
  if (userId) {
    const { data: matchRows } = await supabase
      .from("job_matches")
      .select(`${JOB_MATCH_SELECT}`)
      .eq("user_id", userId);

    matches = matchByJobId(matchRows as DbJobMatch[] | null);
  }

  return ((jobs ?? []) as DbJob[]).map((job) =>
    mapJobRecommendation(job, matches.get(job.id) ?? null)
  );
}

export async function fetchJobCardsForUser(
  supabase: SupabaseClient,
  userId: string | null,
  limit = 6
) {
  const jobs = await fetchJobsForUser(supabase, userId, limit);
  return jobs.map((job) => ({
    id: job.id,
    company: job.company,
    role: job.role,
    hasMatch: job.hasMatch,
    compatibility: job.compatibility,
    salary: job.salary,
    location: job.location,
    logo: job.logo,
    color: job.color,
    href: job.href,
  }));
}

export async function fetchJobById(
  supabase: SupabaseClient,
  idOrSlug: string,
  userId: string | null
): Promise<JobDetail | null> {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrSlug
    );

  let query = supabase.from("jobs").select(JOB_LIST_SELECT).eq("is_active", true);

  query = isUuid ? query.eq("id", idOrSlug) : query.eq("slug", idOrSlug);

  const { data: job, error } = await query.maybeSingle();
  if (error) throw error;
  if (!job) return null;

  const typedJob = job as DbJob;

  let match: DbJobMatch | null = null;
  if (userId) {
    const { data: matchRow } = await supabase
      .from("job_matches")
      .select(JOB_MATCH_SELECT)
      .eq("user_id", userId)
      .eq("job_id", typedJob.id)
      .maybeSingle();

    match = (matchRow as DbJobMatch | null) ?? null;
  }

  const [
    sectionsResult,
    cultureResult,
    hiringResult,
    faqsResult,
    interviewResult,
    aiReasonsResult,
    teamResult,
    teamStackResult,
    relatedResult,
    similarResult,
  ] = await Promise.all([
    supabase
      .from("job_section_items")
      .select("section_type, content, sort_order")
      .eq("job_id", typedJob.id)
      .order("sort_order"),
    supabase
      .from("job_culture_indicators")
      .select("id, label, score, description, sort_order")
      .eq("job_id", typedJob.id)
      .order("sort_order"),
    supabase
      .from("job_hiring_stages")
      .select("id, label, avg_days, sort_order")
      .eq("job_id", typedJob.id)
      .order("sort_order"),
    supabase
      .from("job_faqs")
      .select("id, question, answer, sort_order")
      .eq("job_id", typedJob.id)
      .order("sort_order"),
    supabase
      .from("job_interview_questions")
      .select("id, tech, question, sort_order")
      .eq("job_id", typedJob.id)
      .order("sort_order"),
    supabase
      .from("job_ai_summary_reasons")
      .select("reason, sort_order")
      .eq("job_id", typedJob.id)
      .order("sort_order"),
    supabase
      .from("job_team_info")
      .select("team_name, team_size, average_tenure_years, is_available")
      .eq("job_id", typedJob.id)
      .maybeSingle(),
    supabase
      .from("job_team_stack")
      .select("tech_name, sort_order")
      .eq("job_id", typedJob.id)
      .order("sort_order"),
    supabase
      .from("job_related")
      .select(
        `
        sort_order,
        related_job:jobs!job_related_related_job_id_fkey (
          id,
          slug,
          title,
          salary_display,
          companies (name, logo, brand_color),
          job_matches (compatibility)
        )
      `
      )
      .eq("job_id", typedJob.id)
      .order("sort_order"),
    supabase
      .from("job_similar_companies")
      .select(
        `
        sort_order,
        companies (
          id,
          slug,
          name,
          logo,
          brand_color,
          href
        )
      `
      )
      .eq("job_id", typedJob.id)
      .order("sort_order"),
  ]);

  const sections: Record<string, string[]> = {
    summary: [],
    responsibilities: [],
    requirements: [],
    differentials: [],
    benefits: [],
  };

  for (const item of sectionsResult.data ?? []) {
    const bucket = sections[item.section_type];
    if (bucket) bucket.push(item.content);
  }

  const relatedJobs = sortByOrder(relatedResult.data ?? []).map((row) => {
    const related = unwrapSingle(
      row.related_job as unknown as DbJob & {
        job_matches?: { compatibility: number }[];
      }
    );
    const company = unwrapCompany(related?.companies ?? null);
    const relatedMatch = related?.job_matches?.[0];
    const hasMatch = Boolean(relatedMatch);

    return {
      id: related?.id ?? "",
      company: company?.name ?? "",
      role: related?.title ?? "",
      hasMatch,
      compatibility: hasMatch ? relatedMatch!.compatibility : 0,
      salary: related?.salary_display ?? "",
      logo: company?.logo || company?.name?.slice(0, 2) || "?",
      color: company?.brand_color ?? "#6366F1",
      href: related?.slug
        ? `/dashboard/vagas/${related.slug}`
        : `/dashboard/vagas/${related?.id ?? ""}`,
    };
  });

  const similarCompanies = sortByOrder(similarResult.data ?? []).map((row) => {
    const company = unwrapCompany(row.companies as DbJob["companies"]);
    return {
      id: company?.id ?? "",
      name: company?.name ?? "",
      logo: company?.logo || company?.name?.slice(0, 2) || "?",
      color: company?.brand_color ?? "#6366F1",
      hasMatch: false,
      compatibility: 0,
      href:
        company?.href ??
        `/dashboard/empresas/${company?.slug ?? company?.id ?? ""}`,
    };
  });

  const teamInfo = teamResult.data
    ? {
        teamName: teamResult.data.team_name,
        size: teamResult.data.team_size,
        stack: sortByOrder(teamStackResult.data ?? []).map(
          (item) => item.tech_name
        ),
        averageTenureYears: Number(teamResult.data.average_tenure_years),
        available: teamResult.data.is_available,
      }
    : null;

  return mapJobDetail(typedJob, match, {
    sections,
    culture: sortByOrder(cultureResult.data ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      score: item.score,
      description: item.description,
    })),
    hiringTimeline: sortByOrder(hiringResult.data ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      avgDays: item.avg_days,
    })),
    faqs: sortByOrder(faqsResult.data ?? []).map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
    })),
    interviewQuestions: sortByOrder(interviewResult.data ?? []).map((item) => ({
      id: item.id,
      tech: item.tech,
      question: item.question,
    })),
    aiSummaryReasons: sortByOrder(aiReasonsResult.data ?? []).map(
      (item) => item.reason
    ),
    teamInfo,
    relatedJobs,
    similarCompanies,
  });
}

export async function fetchCompanyJobs(
  supabase: SupabaseClient,
  companyIdOrSlug: string,
  userId: string | null
): Promise<JobRecommendation[]> {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      companyIdOrSlug
    );

  let companyQuery = supabase
    .from("companies")
    .select("id")
    .limit(1);

  companyQuery = isUuid
    ? companyQuery.eq("id", companyIdOrSlug)
    : companyQuery.eq("slug", companyIdOrSlug);

  const { data: company } = await companyQuery.maybeSingle();
  if (!company) return [];

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(JOB_LIST_SELECT)
    .eq("company_id", company.id)
    .eq("is_active", true)
    .order("published_at", { ascending: false });

  if (error) throw error;

  let matches = new Map<string, DbJobMatch>();
  if (userId) {
    const { data: matchRows } = await supabase
      .from("job_matches")
      .select(`${JOB_MATCH_SELECT}`)
      .eq("user_id", userId)
      .in(
        "job_id",
        ((jobs ?? []) as DbJob[]).map((job) => job.id)
      );

    matches = matchByJobId(matchRows as DbJobMatch[] | null);
  }

  return ((jobs ?? []) as DbJob[]).map((job) =>
    mapJobRecommendation(job, matches.get(job.id) ?? null)
  );
}

export async function fetchCompanies(
  supabase: SupabaseClient,
  limit = 12
) {
  const { data, error } = await supabase
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
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((company) =>
    mapCompanyMatch(company as DbCompany, null)
  );
}

export { mapJobCard };
