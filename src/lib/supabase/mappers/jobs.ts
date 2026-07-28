import type {
  ApprovalLevel,
  CompanyMatch,
  JobDetail,
  JobRecommendation,
  MatchReason,
  RelatedJob,
  SimilarCompany,
} from "@/types/jobs";
import type { JobCard } from "@/types/dashboard";
import type { DbCompany, DbJob, DbJobMatch } from "@/lib/supabase/types";
import { sortByOrder, unwrapCompany, unwrapSingle } from "@/lib/supabase/types";
import {
  companyInitials,
  mapCompanyEnvironment,
  mapTechLevel,
} from "@/lib/supabase/utils";

const DEFAULT_STATS = {
  responseDays: 0,
  processDays: 0,
  steps: 0,
  candidates: 0,
};

const EMPTY_APPROVAL = {
  level: "baixa" as ApprovalLevel,
  stars: 0,
  reasons: [] as string[],
  simulation: { stages: [], suggestion: "" },
};

function jobHref(job: Pick<DbJob, "id" | "slug">): string {
  return `/dashboard/vagas/${job.slug || job.id}`;
}

function companyLogo(company: DbCompany | null): string {
  if (!company) return "?";
  return company.logo || companyInitials(company.name);
}

function companyColor(company: DbCompany | null): string {
  return company?.brand_color ?? "#6366F1";
}

function companyName(company: DbCompany | null): string {
  return company?.name ?? "Empresa";
}

function mapStack(job: DbJob): string[] {
  return sortByOrder(job.job_stack ?? []).map((item) => item.tech_name);
}

function mapBenefits(job: DbJob): string[] {
  return sortByOrder(job.job_benefits ?? []).map((item) => item.benefit);
}

function mapStats(job: DbJob) {
  const stats = unwrapSingle(job.job_stats);
  if (!stats) return DEFAULT_STATS;
  return {
    responseDays: stats.response_days,
    processDays: stats.process_days,
    steps: stats.steps,
    candidates: stats.candidates,
  };
}

function mapReasons(match: DbJobMatch | null): MatchReason[] {
  if (!match?.job_match_reasons?.length) return [];
  return sortByOrder(match.job_match_reasons).map((reason) => ({
    id: reason.id,
    text: reason.text,
    type: reason.reason_type === "warning" ? "warning" : "match",
  }));
}

function mapApproval(match: DbJobMatch | null) {
  if (!match) return EMPTY_APPROVAL;
  return {
    level: match.approval_level as ApprovalLevel,
    stars: match.approval_stars,
    reasons: sortByOrder(match.job_match_approval_reasons ?? []).map(
      (item) => item.reason
    ),
    simulation: {
      stages: sortByOrder(match.job_match_simulation_stages ?? []).map(
        (stage) => ({
          id: stage.id,
          label: stage.label,
          status: stage.status as "pass" | "warning" | "fail",
        })
      ),
      suggestion: match.approval_suggestion,
    },
  };
}

export function mapJobRecommendation(
  job: DbJob,
  match: DbJobMatch | null = null,
  compatibilityOverride?: number
): JobRecommendation {
  const company = unwrapCompany(job.companies);

  const hasMatch = Boolean(match);

  const applicationMode = job.application_mode ?? "internal";

  return {
    id: job.id,
    companyId: company?.id ?? "",
    company: companyName(company),
    role: job.title,
    source: job.created_by_user_id ? ("internal" as const) : undefined,
    applicationMode,
    externalUrl:
      applicationMode === "external_redirect"
        ? job.external_apply_url ?? undefined
        : undefined,
    hasMatch,
    compatibility: hasMatch ? match!.compatibility : 0,
    approvalProbability: mapApproval(match),
    bestSendTime: {
      dayLabel: match?.best_send_day_label ?? "",
      timeRange: match?.best_send_time_range ?? "",
      insight: match?.best_send_insight ?? "",
    },
    salary: job.salary_display,
    salaryMin: job.salary_min ?? 0,
    salaryMax: job.salary_max ?? 0,
    location: job.location,
    logo: companyLogo(company),
    color: companyColor(company),
    href: jobHref(job),
    stack: mapStack(job),
    reasons: mapReasons(match),
    stats: mapStats(job),
    benefits: mapBenefits(job),
    remote: job.remote,
    aiSummary: job.ai_summary,
  };
}

export function mapJobCard(job: DbJob, match: DbJobMatch | null = null): JobCard {
  const recommendation = mapJobRecommendation(job, match);
  return {
    id: recommendation.id,
    company: recommendation.company,
    role: recommendation.role,
    hasMatch: recommendation.hasMatch,
    compatibility: recommendation.compatibility,
    salary: recommendation.salary,
    location: recommendation.location,
    logo: recommendation.logo,
    color: recommendation.color,
    href: recommendation.href,
  };
}

export function mapCompanyMatch(
  company: DbCompany,
  compatibility: number | null = null
): CompanyMatch {
  const benefits = sortByOrder(company.company_benefits ?? []).map(
    (item) => item.benefit
  );
  const hasMatch = compatibility !== null;

  return {
    id: company.id,
    name: company.name,
    logo: companyLogo(company),
    color: companyColor(company),
    hasMatch,
    compatibility: hasMatch ? compatibility : 0,
    environment: mapCompanyEnvironment(company.environment),
    remote: company.remote_friendly,
    benefits,
    href: company.href ?? `/empresa/${company.slug}`,
  };
}

export function mapJobDetail(
  job: DbJob,
  match: DbJobMatch | null,
  extras: {
    sections: Record<string, string[]>;
    culture: {
      id: string;
      label: string;
      score: number;
      description: string;
    }[];
    hiringTimeline: {
      id: string;
      label: string;
      avgDays: number;
    }[];
    faqs: { id: string; question: string; answer: string }[];
    interviewQuestions: { id: string; tech: string; question: string }[];
    aiSummaryReasons: string[];
    teamInfo: {
      teamName: string;
      size: number;
      stack: string[];
      averageTenureYears: number;
      available: boolean;
    } | null;
    relatedJobs: RelatedJob[];
    similarCompanies: SimilarCompany[];
  }
): JobDetail {
  const company = unwrapCompany(job.companies);
  const base = mapJobRecommendation(job, match);

  return {
    ...base,
    publishedAt: job.published_at ?? new Date().toISOString().slice(0, 10),
    verified: job.verified,
    whyMatchSummary: match?.why_match_summary ?? job.ai_summary,
    weightFactors: sortByOrder(match?.job_match_weight_factors ?? []).map(
      (factor) => ({
        label: factor.label,
        weight: factor.weight,
      })
    ),
    sections: {
      summary: extras.sections.summary ?? [],
      responsibilities: extras.sections.responsibilities ?? [],
      requirements: extras.sections.requirements ?? [],
      differentials: extras.sections.differentials ?? [],
      benefits: extras.sections.benefits ?? mapBenefits(job),
    },
    techComparison: sortByOrder(match?.job_match_tech_comparisons ?? []).map(
      (tech) => ({
        name: tech.tech_name,
        requiredLevel: mapTechLevel(tech.required_level),
        userLevel: mapTechLevel(tech.user_level),
        weight: tech.weight,
      })
    ),
    companyProfile: {
      segment: company?.segment ?? "",
      employees: company?.employees_label ?? "",
      marketYears: company?.market_years ?? 0,
      rating: company?.rating ?? 0,
      verified: company?.verified ?? false,
    },
    culture: extras.culture,
    salaryComparison: {
      jobMin: match?.salary_job_min ?? job.salary_min ?? 0,
      jobMax: match?.salary_job_max ?? job.salary_max ?? 0,
      marketMin: match?.salary_market_min ?? 0,
      marketMax: match?.salary_market_max ?? 0,
      userExpectation: match?.salary_user_expectation ?? 0,
      insight: match?.salary_insight ?? "",
    },
    hiringTimeline: extras.hiringTimeline,
    faqs: extras.faqs,
    interviewQuestions: extras.interviewQuestions,
    githubProjects: sortByOrder(match?.job_match_github_projects ?? []).map(
      (project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        relevance: project.relevance,
      })
    ),
    resumeSuggestions: sortByOrder(
      match?.job_match_resume_suggestions ?? []
    ).map((item) => ({
      id: item.id,
      text: item.text,
      type: item.suggestion_type as "add" | "move" | "highlight",
    })),
    portfolioProjects: sortByOrder(
      match?.job_match_portfolio_projects ?? []
    ).map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      highlight: project.is_highlight,
    })),
    similarCompanies: extras.similarCompanies,
    relatedJobs: extras.relatedJobs,
    applyChecklist: sortByOrder(match?.job_match_apply_checklist ?? []).map(
      (item) => ({
        id: item.id,
        label: item.label,
        status: item.status as "done" | "pending" | "auto",
      })
    ),
    aiSummary: job.ai_summary,
    aiSummaryReasons: extras.aiSummaryReasons,
    studyPlan: {
      topics: sortByOrder(match?.job_match_study_topics ?? []).map((topic) => ({
        id: topic.id,
        title: topic.title,
        priority: topic.priority as 1 | 2 | 3 | 4 | 5,
      })),
    },
    teamInfo: extras.teamInfo ?? {
      teamName: "",
      size: 0,
      stack: [],
      averageTenureYears: 0,
      available: false,
    },
    careerImpact: {
      roles: sortByOrder(match?.job_match_career_impact_roles ?? []).map(
        (role) => ({
          id: role.id,
          role: role.role_title,
          upliftPercent: role.uplift_percent,
        })
      ),
      explanation: match?.career_impact_explanation ?? "",
    },
    comparison: {
      jobs: sortByOrder(match?.job_match_comparison_items ?? []).map(
        (item) => {
          const comparedJob = unwrapSingle(item.jobs ?? null);
          const comparedCompany = unwrapCompany(comparedJob?.companies ?? null);
          return {
            id: item.compared_job_id,
            company: companyName(comparedCompany),
            logo: companyLogo(comparedCompany),
            color: companyColor(comparedCompany),
            salary: item.salary_display,
            remote: item.remote_label,
            compatibility: item.compatibility,
            processSteps: item.process_steps,
            benefitsRating: item.benefits_rating,
          };
        }
      ),
      recommendedCompanyId: match?.comparison_recommended_job_id ?? "",
      aiConclusion: match?.comparison_ai_conclusion ?? "",
    },
  };
}

export function mapLandingCompany(company: DbCompany) {
  return {
    name: company.name,
    color: companyColor(company),
    logo: companyLogo(company),
  };
}
