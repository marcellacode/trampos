import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobDetail, JobRecommendation } from "@/types/jobs";
import {
  mapJobCard,
  mapJobDetail,
  mapJobRecommendation,
  mapCompanyMatch,
} from "@/lib/supabase/mappers/jobs";
import { filterOutDemoCatalogJobs, isDemoCatalogJobId } from "@/lib/catalog/demo-ids";
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
      companies!jobs_company_id_fkey (name, logo, brand_color)
    )
  )
`;

function matchByJobId(matches: DbJobMatch[] | null | undefined): Map<string, DbJobMatch> {
  return new Map((matches ?? []).map((match) => [match.job_id, match]));
}

export async function fetchActiveJobs(supabase: SupabaseClient, limit = 20): Promise<JobRecommendation[]> {
  const { data, error } = await supabase.from("jobs").select(JOB_LIST_SELECT).eq("is_active", true).order("published_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return ((data ?? []) as DbJob[]).map((job) => mapJobRecommendation(job));
}

export async function fetchJobsForUser(supabase: SupabaseClient, userId: string | null, limit = 20): Promise<JobRecommendation[]> {
  const { data: jobs, error } = await supabase.from("jobs").select(JOB_LIST_SELECT).eq("is_active", true).order("published_at", { ascending: false }).limit(limit);
  if (error) throw error;
  let matches = new Map<string, DbJobMatch>();
  if (userId) {
    const { data: matchRows } = await supabase.from("job_matches").select(`${JOB_MATCH_SELECT}`).eq("user_id", userId);
    matches = matchByJobId(matchRows as DbJobMatch[] | null);
  }
  return filterOutDemoCatalogJobs(((jobs ?? []) as DbJob[]).map((job) => mapJobRecommendation(job, matches.get(job.id) ?? null)));
}

export async function fetchJobCardsForUser(supabase: SupabaseClient, userId: string | null, limit = 6) {
  const jobs = await fetchJobsForUser(supabase, userId, limit);
  return jobs.map((job) => ({ id: job.id, company: job.company, role: job.role, hasMatch: job.hasMatch, compatibility: job.compatibility, salary: job.salary, location: job.location, logo: job.logo, color: job.color, href: job.href }));
}

export async function fetchJobById(supabase: SupabaseClient, idOrSlug: string, userId: string | null): Promise<JobDetail | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  let query = supabase.from("jobs").select(JOB_LIST_SELECT).eq("is_active", true);
  query = isUuid ? query.eq("id", idOrSlug) : query.eq("slug", idOrSlug);
  const { data: job, error } = await query.maybeSingle();
  if (error) throw error;
  if (!job) return null;
  const typedJob = job as DbJob;
  if (isDemoCatalogJobId(typedJob.id)) return null;
  let match: DbJobMatch | null = null;
  if (userId) {
    const { data: matchRow } = await supabase.from("job_matches").select(JOB_MATCH_SELECT).eq("user_id", userId).eq("job_id", typedJob.id).maybeSingle();
    match = (matchRow as DbJobMatch | null) ?? null;
  }
  const [sectionsResult,cultureResult,hiringResult,faqsResult,interviewResult,aiReasonsResult,teamResult,teamStackResult,relatedResult,similarResult] = await Promise.all([
    supabase.from("job_section_items").select("section_type, content, sort_order").eq("job_id", typedJob.id).order("sort_order"),
    supabase.from("job_culture_indicators").select("label, score, sort_order").eq("job_id", typedJob.id).order("sort_order"),
    supabase.from("job_hiring_steps").select("label, duration_label, sort_order").eq("job_id", typedJob.id).order("sort_order"),
    supabase.from("job_faqs").select("question, answer, sort_order").eq("job_id", typedJob.id).order("sort_order"),
    supabase.from("job_interview_questions").select("question, answer_hint, sort_order").eq("job_id", typedJob.id).order("sort_order"),
    supabase.from("job_ai_reasons").select("reason, sort_order").eq("job_id", typedJob.id).order("sort_order"),
    supabase.from("job_team_members").select("name, role, avatar, sort_order").eq("job_id", typedJob.id).order("sort_order"),
    supabase.from("job_team_stack").select("tech_name, sort_order").eq("job_id", typedJob.id).order("sort_order"),
    supabase.from("related_jobs").select("related_job_id, sort_order, jobs:related_job_id(id, slug, title, salary_display, location, remote, companies!jobs_company_id_fkey(name, logo, brand_color))").eq("job_id", typedJob.id).order("sort_order"),
    supabase.from("similar_companies").select("company_id, similarity, sort_order, companies:company_id(id, slug, name, logo, brand_color, segment, employees_label, market_years, rating, verified, environment, remote_friendly, href)").eq("job_id", typedJob.id).order("sort_order"),
  ]);
  return mapJobDetail(typedJob, match, { sections: sectionsResult.data ?? [], culture: cultureResult.data ?? [], hiring: hiringResult.data ?? [], faqs: faqsResult.data ?? [], interview: interviewResult.data ?? [], aiReasons: aiReasonsResult.data ?? [], team: teamResult.data ?? [], teamStack: teamStackResult.data ?? [], related: relatedResult.data ?? [], similar: similarResult.data ?? [] });
}

export async function fetchCompanyMatch(supabase: SupabaseClient, companyId: string, userId: string | null): Promise<ReturnType<typeof mapCompanyMatch> | null> {
  if (!userId) return null;
  const { data, error } = await supabase.from("company_matches").select("*").eq("company_id", companyId).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data ? mapCompanyMatch(data) : null;
}
